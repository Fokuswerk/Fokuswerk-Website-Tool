// POST /api/rangliste
//
//   Vorlauf (?vorlauf=1):  { "gewerk": "Autowerkstatt", "ort": "Westerstede" }
//   →  { bereit, anzahl, bewertungenGesamt, spitze, ohneWebsite, nichtUebernommen,
//        werbende, namen[] }
//      Die Marktzahlen des Ortes und die NAMEN der Betriebe, alphabetisch — damit der
//      Besucher seinen eigenen antippen kann. Keine Ränge, keine Zahlen je Betrieb,
//      keine Befunde: Das ist genau der Teil, für den er seine Daten hinterlässt.
//
//   Voller Aufruf:  { gewerk, ort, betrieb, kontakt:{name,email,telefon}, newsletter, herkunft }
//   →  { betrieb, gewerk, ort, geprueft, einordnung, raenge, markt, liste[], befunde[], anzeigen }
//
//   Fehler: 422 { fehler: "gewerk_oder_ort_fehlt" | "zu_wenige_betriebe" | "betrieb_unbekannt"
//                        | "profile_nicht_lesbar" | "kein_apify_token" }, 429 zu_viele_abrufe
//
// Warum der Zwischenspeicher hier am Ort hängt und nicht am Besucher: Eine Nachbarschaft
// ändert sich nicht stündlich. Der zweite Betrieb aus Westerstede bekommt dieselbe
// Messung sofort und kostenlos — das Werkzeug wird mit jedem Abruf schneller und
// billiger statt teurer.

import { sammle, anzeigenErgaenzen } from "../lib/rangliste-messen.js";
import { bewerte, plural } from "../lib/rangliste-urteil.js";
import { ausVorrat } from "../lib/rangliste-vorrat.js";
import { verarbeiteRanglisteLead } from "../lib/rangliste-lead.js";

const DIAGNOSE = "fw-probe-2610";

const ERLAUBT = [
  ...new Set([
    "https://fokuswerk.de",
    "https://www.fokuswerk.de",
    "https://frank-site-485713.framer.app",
    ...(process.env.ORIGINS || "").split(",").map((h) => h.trim()).filter(Boolean),
  ]),
];

// Gedächtnis je Instanz. Vercel startet mehrere davon, also ist das eine Bremse, keine
// Sperre. Sobald das Werkzeug beworben wird, gehört beides in einen gemeinsamen Speicher.
const ABRUFE = new Map();
const SPEICHER = new Map();
const FENSTER = 10 * 60 * 1000;
const PRO_FENSTER = 12;
// Sechs Stunden. Eine Messung kostet Geld; ein Ort gewinnt in sechs Stunden keine neue
// Werkstatt und verliert keine zwanzig Bewertungen.
const HALTBAR = 6 * 60 * 60 * 1000;

function zuOft(kennung) {
  const jetzt = Date.now();
  const bisher = (ABRUFE.get(kennung) || []).filter((z) => jetzt - z < FENSTER);
  bisher.push(jetzt);
  ABRUFE.set(kennung, bisher);
  if (ABRUFE.size > 5000) ABRUFE.clear();
  return bisher.length > PRO_FENSTER;
}

function ausSpeicher(schluessel) {
  const eintrag = SPEICHER.get(schluessel);
  if (!eintrag) return null;
  if (Date.now() - eintrag.zeit > HALTBAR) {
    SPEICHER.delete(schluessel);
    return null;
  }
  return eintrag.messung;
}

function inSpeicher(schluessel, messung) {
  SPEICHER.set(schluessel, { zeit: Date.now(), messung });
  if (SPEICHER.size > 200) SPEICHER.clear();
}

const text = (w, max) => {
  const v = typeof w === "string" ? w.trim() : "";
  return v && v.length <= max && !/[\u0000-\u001f<>]/.test(v) ? v : null;
};

const MAILMUSTER = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const hatKontakt = (k) => MAILMUSTER.test(String(k?.email || "").trim());

// Was die Seite nach dem Nachholen braucht, um die Anzeigenzeile im Teaser zu ergaenzen.
function anzeigenZahlen(messung) {
  const werbende = messung.betriebe.filter((b) => b.anzeigen.length > 0);
  return {
    anzeigenGemessen: messung.anzeigenVerfuegbar === true,
    werbendeUmKunden: werbende.filter((b) => b.anzeigen.some((a) => !a.personal)).length,
    werbendeGesamt: werbende.length,
  };
}

const trockenlauf = (req) => req.query?.trocken === "1" && req.query?.diagnose === DIAGNOSE;

export default async function handler(req, res) {
  const herkunft = req.headers.origin;
  if (herkunft && ERLAUBT.includes(herkunft)) {
    res.setHeader("Access-Control-Allow-Origin", herkunft);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ fehler: "nur_post" });

  let koerper = req.body;
  if (typeof koerper === "string") {
    try { koerper = JSON.parse(koerper); } catch { koerper = null; }
  }

  const gewerk = text(koerper?.gewerk, 60);
  const ort = text(koerper?.ort, 60);
  if (!gewerk || !ort) return res.status(422).json({ fehler: "gewerk_oder_ort_fehlt" });

  const kennung =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unbekannt";
  if (zuOft(kennung)) return res.status(429).json({ fehler: "zu_viele_abrufe" });

  const schluessel = `${gewerk.toLowerCase()}|${ort.toLowerCase()}`;

  // Ohne gültige Mailadresse gibt es die Rangliste nicht. Die Seite fragt sie ab —
  // durchsetzen muss es der Endpunkt, sonst holt sich jeder die ganze Auswertung mit
  // einem Aufruf an der Oberfläche vorbei.
  const istVorlauf = req.query?.vorlauf === "1" || !hatKontakt(koerper?.kontakt);

  // ── Die Anzeigenlage nachholen (?anzeigen=1) ─────────────────────────────
  // Ein eigener Aufruf, den die Seite abschickt, sobald der Besucher den Teaser sieht.
  // Er laeuft, waehrend derjenige seinen Betrieb aus der Liste sucht — und ist fertig,
  // bevor er die Kontaktdaten eingetragen hat. Nichts davon haelt ihn auf.
  if (req.query?.anzeigen === "1") {
    const vorhanden = ausSpeicher(schluessel);
    if (!vorhanden) return res.status(200).json({ bereit: false, grund: "keine_messung" });
    if (vorhanden.anzeigenVerfuegbar !== null) {
      return res.status(200).json({ bereit: true, schon_da: true, ...anzeigenZahlen(vorhanden) });
    }
    try {
      const ergaenzt = { ...vorhanden, ...(await anzeigenErgaenzen(vorhanden)) };
      inSpeicher(schluessel, ergaenzt);
      return res.status(200).json({ bereit: true, ...anzeigenZahlen(ergaenzt) });
    } catch (fehler) {
      console.error("Anzeigen nachholen gescheitert:", fehler?.message);
      inSpeicher(schluessel, { ...vorhanden, anzeigenVerfuegbar: false });
      return res.status(200).json({ bereit: false, grund: "nicht_messbar" });
    }
  }

  // Erst der Vorrat: vorgerechnete Messungen liegen als Datei im Deployment und sind
  // sofort da. Das ist der Unterschied zwischen einer Sekunde und 35 — und 35 Sekunden
  // stummes Warten war in allen fuenf Pruefungen die staerkste Abbruchstelle der Seite.
  let messung = ausSpeicher(schluessel);
  if (!messung) {
    const vorgerechnet = ausVorrat(gewerk, ort);
    if (vorgerechnet) {
      messung = vorgerechnet;
      inSpeicher(schluessel, messung);
      res.setHeader("X-Fokuswerk-Vorrat", String(vorgerechnet.alterTage) + "d");
    }
  }
  if (messung) {
    res.setHeader("X-Fokuswerk-Speicher", "treffer");
  } else {
    // Der Vorlauf holt nur die Profile. Die Anzeigenpruefung dauert noch einmal so lange
    // und wird nachgereicht — sonst wartet der Besucher knapp eine Minute auf den Teaser.
    messung = await sammle({ gewerk, ort, ohneAnzeigen: istVorlauf });
    if (messung.fehler) return res.status(422).json({ fehler: messung.fehler });
    inSpeicher(schluessel, messung);
  }

  // Beim vollen Aufruf duerfen die Anzeigen nicht fehlen: Dann hat der Nachhol-Aufruf
  // eine andere Instanz getroffen oder der Besucher war schneller als die Messung.
  if (!istVorlauf && messung.anzeigenVerfuegbar === null) {
    try {
      messung = { ...messung, ...(await anzeigenErgaenzen(messung)) };
      inSpeicher(schluessel, messung);
    } catch (fehler) {
      console.error("Anzeigen beim vollen Aufruf gescheitert:", fehler?.message);
      messung = { ...messung, anzeigenVerfuegbar: false };
    }
  }

  // ---------------------------------------------------------------------
  // Vorlauf: die Zahlen des Ortes und die Namen — mehr nicht
  // ---------------------------------------------------------------------
  if (istVorlauf) {
    const urteil = bewerte(messung, {});
    const m = urteil.markt;
    return res.status(200).json({
      bereit: true,
      gewerk,
      gewerkPlural: plural(gewerk),
      ort,
      anzahl: m.anzahl,
      bewertungenGesamt: m.bewertungenGesamt,
      // Der höchste und der niedrigste Wert — der Spannbogen ist der Haken, nicht die
      // Rangliste. Wer seinen eigenen Wert kennt, weiß damit noch nicht, wo er steht.
      hoechste: m.spitze?.bewertungen ?? null,
      niedrigste: urteil.liste.at(-1)?.bewertungen ?? null,
      ohneWebsite: m.ohneWebsite,
      nichtUebernommen: m.nichtUebernommen,
      werbendeUmKunden: m.umKunden,
      anzeigenGemessen: messung.anzeigenVerfuegbar,
      // Alphabetisch, nicht nach Rang: Die Reihenfolge würde die Rangliste verraten.
      namen: urteil.liste.map((b) => b.name).sort((a, b) => a.localeCompare(b, "de")),
    });
  }

  // ---------------------------------------------------------------------
  // Voller Aufruf
  // ---------------------------------------------------------------------
  const betrieb = text(koerper?.betrieb, 120);
  if (!betrieb) return res.status(422).json({ fehler: "betrieb_fehlt" });

  const urteil = bewerte(messung, { eigenerName: betrieb });
  if (!urteil.eigen) return res.status(422).json({ fehler: "betrieb_unbekannt" });

  const ergebnis = {
    betrieb,
    gewerk,
    gewerkPlural: plural(gewerk),
    ort,
    geprueft: new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }),
    einordnung: urteil.einordnung,
    raenge: urteil.raenge,
    markt: urteil.markt,
    eigen: urteil.eigen,
    liste: urteil.liste,
    befunde: urteil.befunde,
    anzeigen: urteil.anzeigen,
  };

  const daten = {
    kontakt: {
      name: text(koerper?.kontakt?.name, 80),
      email: text(koerper?.kontakt?.email, 120),
      telefon: text(koerper?.kontakt?.telefon, 40),
    },
    newsletter: koerper?.newsletter === true,
    herkunft: {
      quelle: text(koerper?.herkunft?.quelle, 40),
      kampagne: text(koerper?.herkunft?.kampagne, 80),
      anzeige: text(koerper?.herkunft?.anzeige, 80),
    },
  };

  // Muss **vor** der Antwort abgewartet werden: Vercel friert die Funktion nach
  // res.json() ein, und weder Mail noch Lead liefen je zu Ende.
  const bericht = trockenlauf(req)
    ? { trockenlauf: "nichts verschickt, nichts gemeldet" }
    : await verarbeiteRanglisteLead(daten, ergebnis);

  return res.status(200).json(
    req.query?.diagnose === DIAGNOSE ? { ...ergebnis, _versand: bericht } : ergebnis,
  );
}

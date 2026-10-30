// POST /api/stellenanzeige
//   { "domain": "knolle-harpstedt.de", "beruf": "Landschaftsgärtner" }
// →
//   { "betrieb": "...", "anzeigen": [ {titel,text} × 3 ], "fragen": [ ... × 4 ], "budget": "..." }
//
// Fehler: 422 { "fehler": "seite_nicht_lesbar" | "beruf_unklar" | ... }

import { liesBetrieb } from "../lib/seite-lesen.js";
import { frageModell, budgetzeile } from "../lib/modell.js";
import { anleitung, wochenplan, AUFWAND } from "../lib/mappe.js";
import { marktlage, berufsgruppenListe } from "../lib/marktlage.js";
import { pruefeAntwort, pruefeEingabe } from "../lib/vertrag.js";
import { verarbeiteLead } from "../lib/lead.js";

// Mit ?diagnose=<Wort> hängt die Antwort an, was aus Mailversand und Übergabe wurde.
// Für normale Aufrufe unsichtbar — die Seite fragt es nie ab.
const DIAGNOSE = "fw-probe-2610";

const ERLAUBT = (process.env.ORIGINS ||
  "https://fokuswerk.de,https://www.fokuswerk.de,https://frank-site-485713.framer.app")
  .split(",").map((h) => h.trim()).filter(Boolean);

// Gedächtnis je Instanz. Vercel startet mehrere davon, also ist das eine Bremse, keine
// Sperre — es hält den Dauerfeuer-Fall auf, nicht den entschlossenen Angreifer. Sobald das
// Werkzeug beworben wird, gehört das in einen gemeinsamen Speicher.
const ABRUFE = new Map();
const SPEICHER = new Map();
const FENSTER = 10 * 60 * 1000;
const PRO_FENSTER = 12; // ▲ Stand auf 6, bevor es den Vorlauf gab. Seitdem braucht
// EIN Besucher zwei Aufrufe (Vorlauf + echter Abruf), und wer den Beruf einmal ändert,
// drei. Mit der alten Zahl sperrte sich ein einzelner Betrieb nach zwei Durchläufen
// selbst aus — und ein Handwerksbetrieb sitzt oft mit mehreren Leuten hinter derselben
// Anschrift. Zwölf ist immer noch eine Bremse gegen Dauerfeuer.
const HALTBAR = 24 * 60 * 60 * 1000;

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
  return eintrag.wert;
}

// Wer das Werkzeug benutzt, ist ein Lead. Die Meldung läuft nebenher und darf die Antwort
// nicht aufhalten — fällt sie aus, hat der Betrieb trotzdem seine Anzeigen.
function meldeLead(daten) {
  const ziel = process.env.LEAD_WEBHOOK;
  if (!ziel) return;
  fetch(ziel, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...daten, zeit: new Date().toISOString() }),
  }).catch(() => {});
}

// Ohne gültige Mailadresse gibt es die Befunde nicht. Die Seite fragt sie ab — durchsetzen
// muss es aber der Endpunkt: Wer ihn direkt aufrief, bekam die komplette Auswertung
// umsonst und löste dabei eine Lead-Meldung mit leerem Namen aus (gefunden am 28.10.2026,
// durch einen eigenen Fehlaufruf). Ohne Kontakt verhält sich der Aufruf jetzt wie ein
// Vorlauf: messen, ablegen, nur den Namen zurückgeben.
const MAILMUSTER = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const hatKontakt = (k) => MAILMUSTER.test(String(k?.email || "").trim());

// Trockenlauf: alles rechnen, nichts verschicken. Hinter demselben Diagnoseschluessel wie
// der Versandbericht, damit er von aussen nicht benutzbar ist. Grund: Um eine Aenderung an
// Vorlage, PDF oder Ergebnis zu pruefen, musste bisher eine echte Mail rausgehen — das
// kostet Resend-Volumen und fuellt das Postfach mit immer demselben Probelauf.
const trockenlauf = (req) =>
  req.query?.trocken === "1" && req.query?.diagnose === DIAGNOSE;

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

  const eingabe = pruefeEingabe(koerper);
  if (eingabe.fehler) return res.status(422).json({ fehler: eingabe.fehler });

  // Alles, was der Funnel zusätzlich mitschickt. Nicht Teil der Eingabeprüfung: Fehlt es,
  // werden trotzdem Anzeigen geschrieben — es geht dann nur kein Lead heraus.
  const text = (w, max) => {
    const v = typeof w === "string" ? w.trim() : "";
    return v && v.length <= max && !/[\u0000-\u001f]/.test(v) ? v : null;
  };
  const aus = (w, erlaubt) => (erlaubt.includes(w) ? w : null);
  const zusatz = {
    domain: eingabe.domain,
    beruf: eingabe.beruf,
    dringlichkeit: aus(koerper?.dringlichkeit, ["sofort", "wochen", "planung"]),
    stellen: aus(koerper?.stellen, ["eine", "zwei_drei", "mehr"]),
    erfahrung: aus(koerper?.erfahrung, ["laeuft", "probiert", "nie"]),
    staerken: Array.isArray(koerper?.staerken)
      ? koerper.staerken.filter((x) => typeof x === "string" && x.length < 24).slice(0, 8)
      : [],
    kontakt: {
      name: text(koerper?.kontakt?.name, 80),
      email: text(koerper?.kontakt?.email, 120),
      telefon: text(koerper?.kontakt?.telefon, 40),
    },
    // Eigenes Häkchen für laufende Werbung, getrennt von der Einwilligung zur Anfrage.
    newsletter: koerper?.newsletter === true,
    // Woher der Besucher kam, falls die Seite die UTM-Werte durchreicht.
    // Tut sie das nicht, trägt der Funnel „funnel" ein.
    herkunft: {
      quelle: text(koerper?.herkunft?.quelle, 40),
      kampagne: text(koerper?.herkunft?.kampagne, 80),
      anzeige: text(koerper?.herkunft?.anzeige, 80),
    },
  };

  // Der Vorlauf: Die Seite ruft den Endpunkt ein erstes Mal auf, sobald Adresse und Beruf
  // stehen, und laesst die Anzeigen schreiben, waehrend der Besucher die restlichen Fragen
  // beantwortet. Zurueck kommt **nur** der Betriebsname — stuende hier das ganze Ergebnis,
  // haette man es, bevor man seine Daten eingetragen hat. Und kein Lead: Zu diesem Zeitpunkt
  // gibt es noch keine Kontaktdaten, eine Meldung an uns waere leer.
  // Zwei Stufen. Stufe 1 laeuft direkt nach dem Beruf und liest nur die Seite: Sie sagt
  // frueh, ob Adresse und Beruf taugen, und kostet keinen Modellaufruf. Stufe 2 laeuft nach
  // der letzten Frage, wenn die Antworten vorliegen, und schreibt die Anzeigen in den
  // Zwischenspeicher, waehrend der Besucher seine Kontaktdaten eintraegt. Beide geben nur
  // den Betriebsnamen zurueck — stuende hier das Ergebnis, haette man es, bevor man seine
  // Daten eingetragen hat. Und keinen Lead: Kontaktdaten gibt es zu dem Zeitpunkt nicht.
  const vorlaufStufe = req.query?.vorlauf === "2" ? 2 : req.query?.vorlauf === "1" ? 1 : 0;
  // Ohne Kontakt wie Stufe 2: schreiben und ablegen, aber nichts herausgeben und keinen
  // Lead melden. Siehe die Wache oben.
  const nurVorlauf = vorlaufStufe > 0 || !hatKontakt(koerper?.kontakt);

  const kennung =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unbekannt";
  if (zuOft(kennung)) return res.status(429).json({ fehler: "zu_viele_abrufe" });

  // Der Schlüssel muss alles enthalten, was das Ergebnis beeinflusst. Seit die Antworten
  // in die Anzeigen einfließen, gehören sie dazu — sonst bekäme der zweite Betrieb mit
  // derselben Domain und demselben Beruf die Anzeigen des ersten, mitsamt dessen Stärken.
  const schluessel = [
    eingabe.domain.toLowerCase(),
    eingabe.beruf.toLowerCase(),
    zusatz.dringlichkeit || "-",
    zusatz.stellen || "-",
    [...zusatz.staerken].sort().join(",") || "-",
  ].join("|");
  const gemerkt = ausSpeicher(schluessel);
  if (gemerkt) {
    res.setHeader("X-Fokuswerk-Speicher", "treffer");
    if (nurVorlauf) return res.status(200).json({ bereit: true, betrieb: gemerkt.betrieb });
    // Der Zwischenspeicher gilt den Anzeigen, nicht dem Lead: Wer das Formular ausfüllt, ist
    // auch dann ein Lead, wenn die Texte für diese Domain schon einmal geschrieben wurden.
    // Die Budgetzeile hängt zusätzlich an der Werbeerfahrung, die nicht im Schlüssel
    // steht — sie wird deshalb frisch gerechnet und nicht aus dem Speicher genommen.
    const ausSpeicherMitBudget = { ...gemerkt, budget: budgetzeile(zusatz) };
    const bericht = await verarbeiteLead(
      { ...zusatz, betrieb: gemerkt.betrieb },
      ausSpeicherMitBudget,
    );
    return res.status(200).json(
      req.query?.diagnose === DIAGNOSE
        ? { ...ausSpeicherMitBudget, _versand: bericht }
        : ausSpeicherMitBudget,
    );
  }

  let betrieb;
  try {
    betrieb = await liesBetrieb(eingabe.domain);
  } catch {
    betrieb = null;
  }
  if (!betrieb) return res.status(422).json({ fehler: "seite_nicht_lesbar" });

  // Stufe 1 ist hier fertig. Alles darunter kostet einen Modellaufruf, und der lohnt sich
  // erst, wenn die Antworten des Inhabers vorliegen — sonst schreibt das Modell Anzeigen
  // ohne seine Staerken und der Lauf muesste spaeter ohnehin wiederholt werden.
  if (vorlaufStufe === 1) {
    return res.status(200).json({ bereit: true, betrieb: betrieb.titel || eingabe.domain });
  }

  let roh = null;
  try {
    ({ antwort: roh } = await frageModell({
      beruf: eingabe.beruf,
      betrieb: betrieb.titel,
      text: betrieb.text,
      dringlichkeit: zusatz.dringlichkeit,
      stellen: zusatz.stellen,
      staerken: zusatz.staerken,
      berufsgruppen: berufsgruppenListe(),
    }));
  } catch (fehler) {
    console.error("Modellaufruf gescheitert:", fehler?.message);
    return res.status(502).json({ fehler: "modell_nicht_erreichbar" });
  }

  const geprueft = pruefeAntwort(roh);
  if (geprueft.fehler) {
    const status = geprueft.fehler === "beruf_unklar" ? 422 : 502;
    if (status === 502) console.error("Modellantwort verworfen:", geprueft.fehler);
    return res.status(status).json({ fehler: geprueft.fehler });
  }

  // Den Ort aus dem Seitentext ziehen — er steht fuer die Zielgruppen-Einstellung in der
  // Anleitung. Findet sich keiner, bleibt die Anleitung allgemein statt falsch.
  // Der Ort kommt vom Modell: Dieses Werkzeug liest nicht zwingend die Seite mit dem
  // Impressum, im Text steht oft keine Postleitzahl. Die Textsuche bleibt als Rueckfall.
  const plzOrt = (betrieb.text || "").match(
    /\b\d{5}\s+([A-ZÄÖÜ][a-zäöüßA-ZÄÖÜ.-]{2,}(?:[ -][A-ZÄÖÜ][a-zäöüß.-]+)?)/,
  );
  const ort = geprueft.ort || (plzOrt ? plzOrt[1].replace(/[.,]$/, "") : null);

  const mappe = [
    {
      id: "anleitung",
      name: "So schalten Sie das",
      wofuer:
        "Der Weg durch den Werbeanzeigenmanager, mit Ihren Werten. Jeder Schritt einmal, in " +
        "der Reihenfolge, in der er kommt.",
      stuecke: [
        {
          titel: null,
          felder: anleitung({ ort, beruf: eingabe.beruf, ...zusatz }).map((s) => ({
            etikett: s.titel,
            wert: s.text,
            ohneKopie: true,
          })),
        },
      ],
    },
    {
      id: "drehbuch",
      name: "Das Video",
      wofuer:
        "Eine Anzeige ohne Bewegtbild wird überscrollt. Vier Einstellungen mit dem Handy, " +
        "hochkant, etwa zwanzig Minuten.",
      stuecke: [
        {
          titel: null,
          felder: [
            { etikett: "Aufnahme", wert: geprueft.drehbuch.hinweis, ohneKopie: true },
            ...geprueft.drehbuch.einstellungen.map((e, i) => ({
              etikett: "Einstellung " + (i + 1) + (e.dauer ? " · " + e.dauer : ""),
              wert: e.was + (e.hinweis ? "\n" + e.hinweis : ""),
              ohneKopie: true,
            })),
            { etikett: "Was Sie in die Kamera sagen", wert: geprueft.drehbuch.ansage },
          ],
        },
      ],
    },
    {
      id: "antworten",
      name: "Die ersten Antworten",
      wofuer:
        "Im Handwerk gehen die Guten verloren, weil zwei Tage niemand zurückruft. Diese drei " +
        "Nachrichten gehen per WhatsApp raus, ohne dass Sie überlegen müssen.",
      stuecke: [
        {
          titel: null,
          felder: geprueft.antworten.map((a) => ({ etikett: a.anlass, wert: a.text })),
        },
      ],
    },
    {
      id: "wochenplan",
      name: "Der Wochenplan",
      wofuer: "Von null bis zur ersten Bewerbung. " + AUFWAND,
      stuecke: [
        {
          titel: null,
          felder: wochenplan(zusatz).map((t) => ({ etikett: t.tag, wert: t.was, ohneKopie: true })),
        },
      ],
    },
  ];

  // Die Marktlage eröffnet den Bericht: Erst wissen, wogegen man antritt, dann die Texte.
  // Lässt sich der Beruf keiner amtlichen Berufsgruppe zuordnen, fällt der Block weg —
  // lieber nichts als eine Zahl aus der falschen Gruppe.
  const lage = marktlage({ berufsgruppe: geprueft.berufsgruppe, ort, beruf: eingabe.beruf });

  const ergebnis = {
    betrieb: geprueft.betrieb || betrieb.titel || eingabe.domain,
    marktlage: lage,
    kanaele: geprueft.kanaele,
    mappe,
    fragen: geprueft.fragen,
    budget: budgetzeile(zusatz),
  };

  SPEICHER.set(schluessel, { zeit: Date.now(), wert: ergebnis });
  if (SPEICHER.size > 2000) SPEICHER.clear();

  meldeLead({
    domain: eingabe.domain,
    beruf: eingabe.beruf,
    betrieb: ergebnis.betrieb,
    seiten: betrieb.seiten,
  });

  if (nurVorlauf) return res.status(200).json({ bereit: true, betrieb: ergebnis.betrieb });

  // Lead in die Datenbank, Meldung an uns, Zusendung an den Betrieb. Läuft nebenher.
  const bericht = trockenlauf(req)
    ? { trockenlauf: "nichts verschickt, nichts gemeldet" }
    : await verarbeiteLead({ ...zusatz, betrieb: ergebnis.betrieb }, ergebnis);

  return res.status(200).json(req.query?.diagnose === DIAGNOSE ? { ...ergebnis, _versand: bericht } : ergebnis);
}

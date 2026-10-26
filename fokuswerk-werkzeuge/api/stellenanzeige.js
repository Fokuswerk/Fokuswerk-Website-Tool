// POST /api/stellenanzeige
//   { "domain": "knolle-harpstedt.de", "beruf": "Landschaftsgärtner" }
// →
//   { "betrieb": "...", "anzeigen": [ {titel,text} × 3 ], "fragen": [ ... × 4 ], "budget": "..." }
//
// Fehler: 422 { "fehler": "seite_nicht_lesbar" | "beruf_unklar" | ... }

import { liesBetrieb } from "../lib/seite-lesen.js";
import { frageModell, BUDGETZEILE } from "../lib/modell.js";
import { pruefeAntwort, pruefeEingabe } from "../lib/vertrag.js";

const ERLAUBT = (process.env.ORIGINS ||
  "https://fokuswerk.de,https://www.fokuswerk.de,https://frank-site-485713.framer.app")
  .split(",").map((h) => h.trim()).filter(Boolean);

// Gedächtnis je Instanz. Vercel startet mehrere davon, also ist das eine Bremse, keine
// Sperre — es hält den Dauerfeuer-Fall auf, nicht den entschlossenen Angreifer. Sobald das
// Werkzeug beworben wird, gehört das in einen gemeinsamen Speicher.
const ABRUFE = new Map();
const SPEICHER = new Map();
const FENSTER = 10 * 60 * 1000;
const PRO_FENSTER = 6;
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

  const kennung =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unbekannt";
  if (zuOft(kennung)) return res.status(429).json({ fehler: "zu_viele_abrufe" });

  const schluessel = `${eingabe.domain.toLowerCase()}|${eingabe.beruf.toLowerCase()}`;
  const gemerkt = ausSpeicher(schluessel);
  if (gemerkt) {
    res.setHeader("X-Fokuswerk-Speicher", "treffer");
    return res.status(200).json(gemerkt);
  }

  let betrieb;
  try {
    betrieb = await liesBetrieb(eingabe.domain);
  } catch {
    betrieb = null;
  }
  if (!betrieb) return res.status(422).json({ fehler: "seite_nicht_lesbar" });

  let roh = null;
  try {
    ({ antwort: roh } = await frageModell({
      beruf: eingabe.beruf,
      betrieb: betrieb.titel,
      text: betrieb.text,
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

  const ergebnis = {
    betrieb: geprueft.betrieb || betrieb.titel || eingabe.domain,
    anzeigen: geprueft.anzeigen,
    fragen: geprueft.fragen,
    budget: BUDGETZEILE,
  };

  SPEICHER.set(schluessel, { zeit: Date.now(), wert: ergebnis });
  if (SPEICHER.size > 2000) SPEICHER.clear();

  meldeLead({
    domain: eingabe.domain,
    beruf: eingabe.beruf,
    betrieb: ergebnis.betrieb,
    seiten: betrieb.seiten,
  });

  return res.status(200).json(ergebnis);
}

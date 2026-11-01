// POST /api/kontakt — die Anfrage von /kontakt, zusätzlich zu Framers eigener Mail.
//
//   { name, unternehmen, email, telefon, website, thema, nachricht,
//     fallen: { … }, herkunft: { quelle, kampagne, anzeige } }
//   → 200 { ok: true }
//
//   422 { "fehler": "adresse_fehlt" | "name_fehlt" }
//   429 { "fehler": "zu_viele_abrufe" }
//
// Warum es das gibt, steht in `lib/kontakt-lead.js`. Kurz: Framers Formular schickt seine
// Felder an Framer, und dort endet der Weg. Dieser Endpunkt hängt denselben Datensatz in
// den Sales-Funnel und schickt eine Meldung, auf die man antworten kann.
//
// ▲ Die Seite wartet NICHT auf die Antwort. Der Besucher sieht Framers eigene Bestätigung,
// und die kommt, sobald Framer geantwortet hat. Was hier passiert, darf ihn nicht aufhalten
// und darf — schlimmer noch — seine Absendung nicht kaputtmachen, wenn es scheitert.
//
// Mit ?diagnose=<Wort> hängt die Antwort an, was aus Übergabe und Mail wurde.
// Mit ?trocken=1&diagnose=<Wort> wird alles geprüft und nichts verschickt.

import { verarbeiteKontakt, kontaktMeldung } from "../lib/kontakt-lead.js";

const DIAGNOSE = "fw-probe-2610";
const trockenlauf = (req) => req.query?.trocken === "1" && req.query?.diagnose === DIAGNOSE;

// Dieselbe Grundliste wie in den anderen Endpunkten. ORIGINS kennt die Entwurfsadressen
// nicht, deshalb steht die Grundliste immer daneben statt als Vorgabewert dahinter.
const ERLAUBT = [
  ...new Set([
    "https://fokuswerk.de",
    "https://www.fokuswerk.de",
    "https://frank-site-485713.framer.app",
    ...(process.env.ORIGINS || "").split(",").map((h) => h.trim()).filter(Boolean),
  ]),
];

const ABRUFE = new Map();
const FENSTER = 10 * 60 * 1000;
const PRO_FENSTER = 6;

function zuOft(kennung) {
  const jetzt = Date.now();
  const bisher = (ABRUFE.get(kennung) || []).filter((z) => jetzt - z < FENSTER);
  bisher.push(jetzt);
  ABRUFE.set(kennung, bisher);
  if (ABRUFE.size > 5000) ABRUFE.clear();
  return bisher.length > PRO_FENSTER;
}

const MAILMUSTER = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

const text = (w, max) => {
  const v = typeof w === "string" ? w.trim() : "";
  // Steuerzeichen raus, Zeilenumbrüche in der Nachricht aber behalten — sie ist das
  // einzige Feld, in dem jemand mehrzeilig schreibt.
  return v && v.length <= max ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "") : null;
};

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

  let k = req.body;
  if (typeof k === "string") {
    try { k = JSON.parse(k); } catch { k = null; }
  }

  // Framers Formular trägt elf unsichtbare Felder (`website`, `company`, `message`, …).
  // Füllt eines davon etwas aus, war kein Mensch am Werk. Der Schnipsel reicht sie durch,
  // damit hier dieselbe Entscheidung fallen kann wie drüben — und zwar still: Ein Bot
  // soll nicht erfahren, woran er gescheitert ist.
  const fallen = k?.fallen && typeof k.fallen === "object" ? k.fallen : {};
  if (Object.values(fallen).some((w) => typeof w === "string" && w.trim())) {
    return res.status(200).json({ ok: true });
  }

  const kennung =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unbekannt";
  if (zuOft(kennung)) return res.status(429).json({ fehler: "zu_viele_abrufe" });

  const daten = {
    name: text(k?.name, 80),
    unternehmen: text(k?.unternehmen, 120),
    email: text(k?.email, 120),
    telefon: text(k?.telefon, 40),
    website: text(k?.website, 160),
    thema: text(k?.thema, 60),
    nachricht: text(k?.nachricht, 4000),
    herkunft: {
      quelle: text(k?.herkunft?.quelle, 40),
      kampagne: text(k?.herkunft?.kampagne, 80),
      anzeige: text(k?.herkunft?.anzeige, 80),
    },
  };

  // Dieselben zwei Pflichtfelder, die auch das Formular verlangt. Was die Oberfläche
  // fordert, muss der Endpunkt erzwingen — sonst schreibt der erste Bot, der die Adresse
  // kennt, namenlose Zeilen in den Funnel.
  if (!daten.email || !MAILMUSTER.test(daten.email)) return res.status(422).json({ fehler: "adresse_fehlt" });
  if (!daten.name) return res.status(422).json({ fehler: "name_fehlt" });

  if (trockenlauf(req)) {
    const m = kontaktMeldung(daten);
    return res.status(200).json({
      ok: true,
      trockenlauf: "nichts verschickt, nichts gemeldet",
      betreff: m.betreff,
      gelesen: { ...daten, nachricht: daten.nachricht ? daten.nachricht.length + " Zeichen" : null },
    });
  }

  const bericht = await verarbeiteKontakt(daten);
  return res.status(200).json(req.query?.diagnose === DIAGNOSE ? { ok: true, _versand: bericht } : { ok: true });
}

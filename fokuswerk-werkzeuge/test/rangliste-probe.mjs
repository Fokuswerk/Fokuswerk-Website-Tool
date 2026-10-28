// Probelauf der ganzen Kette ohne Apify: Messung → Urteil → PDF.
//
// Die Messung unten ist echt. Sie stammt aus zwei Abrufen am 28.10.2026 — den
// Google-Unternehmensprofilen der Kfz-Betriebe in Westerstede und der
// Meta-Werbebibliothek, dort je Betriebsname gesucht. Genau in dieser Form liefert
// `rangliste-messen.js` sie auch im Betrieb, deshalb prüft dieser Lauf das Rechenwerk
// vollständig, ohne für jeden Versuch neu zu bezahlen.
//
// Aufruf: node test/rangliste-probe.mjs [Betriebsname] [Zieldatei]

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { bewerte } from "../lib/rangliste-urteil.js";
import { pdfDaten } from "../lib/rangliste-lead.js";
import { ranglistePdf } from "../lib/rangliste-pdf.js";

const b = (name, bewertungen, schnitt, fotos, website, uebernommen = true, anzeigen = []) => ({
  name, kategorie: "Autowerkstatt", bewertungen, schnitt, fotos, website,
  telefon: true, uebernommen, ort: "Westerstede", anzeigen,
});

export const MESSUNG = {
  gewerk: "Autowerkstatt",
  ort: "Westerstede",
  kategorie: "Autowerkstatt",
  gemessenAm: "2026-10-28T07:44:41.719Z",
  aussortiert: 6,
  anzeigenVerfuegbar: true,
  anzeigenUnsicher: [
    { betrieb: "EUROMASTER Westerstede", werbetreibender: "Euromaster France" },
    { betrieb: "AZET-Autolackier GmbH", werbetreibender: "Böttcher AG" },
    { betrieb: "Egon van Rüschen", werbetreibender: "Reisebüro van Rüschen e.K." },
  ],
  betriebe: [
    b("WAV Alexander Lüers", 278, 4.7, 12, true),
    b("H. Oeltjenbruns GmbH", 231, 4.7, 35, true, true, [
      {
        werbetreibender: "H. Oeltjenbruns GmbH", aktiv: false, personal: true,
        von: "2026-01-31", bis: "2026-02-17", id: "939788275042154",
        text: "NFZ- / LANDMASCHINENMECHATRONIKER (m/w/d) GESUCHT. Westerstede, Vollzeit. " +
          "Du schraubst lieber an großen Maschinen als an kleinen Problemen? Diagnosegerät ist " +
          "für dich kein Fremdwort und Nutzfahrzeuge dein Revier? Dann komm zu uns!",
      },
      { werbetreibender: "H. Oeltjenbruns GmbH", aktiv: false, personal: true, von: "2026-01-16", bis: "2026-02-05", id: "862471216692055", text: null },
      { werbetreibender: "H. Oeltjenbruns GmbH", aktiv: false, personal: true, von: "2026-01-31", bis: "2026-02-09", id: "1297535782397614", text: null },
    ]),
    b("EUROMASTER Westerstede", 175, 4.5, 13, true),
    b("SBB Autoservice GmbH", 154, 4.9, 44, true),
    b("Auto Westerstede UG", 131, 4.8, 16, false),
    b("Heinz Dehne Kfz-Reparaturwerkstatt", 77, 4.9, 4, false),
    b("Freie Mehrmarkenwerkstatt Ralf Renken", 68, 4.8, 4, true),
    b("Dieter Schulz", 43, 4.9, 0, false),
    b("Autohaus Spiegel", 31, 4.7, 7, true),
    b("AZET-Autolackier GmbH", 25, 4.7, 0, true),
    b("Hermann Ernst", 5, 5.0, 1, false, false),
    b("TS Perfection", 3, 5.0, 11, false),
    b("B&K KFZ und Lackier Service GmbH", 1, 5.0, 2, false, false),
    b("Egon van Rüschen", 1, 5.0, 1, false, false),
  ],
};

const wen = process.argv[2] || "Dieter Schulz";
const ziel = process.argv[3] || `Dokumente/Rangliste-Beispiel-${wen.replace(/[^\wÄÖÜäöüß]+/g, "-")}.pdf`;

const urteil = bewerte(MESSUNG, { eigenerName: wen });
if (!urteil.eigen) {
  console.error("Betrieb nicht in der Liste:", wen);
  process.exit(1);
}

const ergebnis = { betrieb: wen, gewerk: MESSUNG.gewerk, ort: MESSUNG.ort, ...urteil };

console.log(`${wen}: Platz ${urteil.eigen.platz} von ${urteil.liste.length} — ${urteil.einordnung.wort}`);
console.log("  " + urteil.einordnung.satz.replace(/\s+/g, " "));
console.log(
  `  Markt: ${urteil.markt.anzahl} Betriebe, ${urteil.markt.bewertungenGesamt} Bewertungen, ` +
  `${urteil.markt.ohneWebsite} ohne Website, ${urteil.markt.nichtUebernommen} nicht übernommen, ` +
  `${urteil.markt.werbende} werben (${urteil.markt.umKunden} um Kunden)`,
);
console.log("  Ränge:", JSON.stringify(urteil.raenge));
for (const f of urteil.befunde) console.log(`  [${f.art}] ${f.titel}`);
if (urteil.anzeigen) console.log(`  [anzeigen] ${urteil.anzeigen.zahl} — ${urteil.anzeigen.befund.titel}`);

const puffer = await ranglistePdf(pdfDaten(ergebnis));
mkdirSync(dirname(ziel), { recursive: true });
writeFileSync(ziel, puffer);
console.log("geschrieben:", ziel, Math.round(puffer.length / 1024) + " kB");

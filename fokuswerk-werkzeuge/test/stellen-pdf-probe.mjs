// Setzt die Stellenausschreibung als PDF, ohne Modell, ohne Versand.
//   node test/stellen-pdf-probe.mjs <zielordner> [ohne-marktlage]
//
// Die Texte sind ein Beispielergebnis — es geht um Satz und Umbruch, nicht um Inhalt.
import { writeFileSync } from "node:fs";
import { ausschreibungPdf } from "../lib/stellen-pdf.js";
import { anleitung, wochenplan, AUFWAND } from "../lib/mappe.js";
import { budgetzeile } from "../lib/modell.js";
import { marktlage } from "../lib/marktlage.js";

const [ordner = "/tmp", schalter = ""] = process.argv.slice(2);
const zusatz = { stellen: "zwei_drei", dringlichkeit: "sofort", erfahrung: "nie" };
const beruf = "Landschaftsgärtner";
const ort = "Oldenburg";

const lang =
  "Ein Familienbetrieb im Landkreis Oldenburg sucht ab sofort zwei bis drei " +
  "Landschaftsgärtner (m/w/d). Die Arbeit liegt schon da.\n\n" +
  "Gearbeitet wird im Großraum Bremen, Wildeshausen und Oldenburg: neue Privatgärten, " +
  "Pflaster- und Natursteinarbeiten, Teich- und Schwimmteichbau.\n\n" +
  "[Bitte eintragen: Verdienst, z. B. \"ab 3.400 Euro brutto\"]";

const kanaele = [
  {
    id: "kleinanzeigen", name: "Kleinanzeigen",
    wofuer: "Kostenlos inserieren auf kleinanzeigen.de. Dort suchen Leute, die gerade wirklich etwas Neues wollen.",
    stuecke: [{ titel: null, felder: [
      { etikett: "Titel", wert: "Landschaftsgärtner (m/w/d) im Kreis Oldenburg, ab sofort", grenze: 65, grenzeArt: "max" },
      { etikett: "Anzeigentext", wert: lang },
    ] }],
  },
  {
    id: "jobboerse", name: "Jobbörse der Arbeitsagentur",
    wofuer: "Kostenlos, die größte Stellenbörse Deutschlands, und von dort läuft die Anzeige automatisch weiter nach EURES.",
    stuecke: [{ titel: null, felder: [
      { etikett: "Berufsbezeichnung", wert: "Landschaftsgärtner (m/w/d)", grenze: 60, grenzeArt: "max" },
      { etikett: "Stellenbeschreibung", wert: lang },
    ] }],
  },
  {
    id: "meta", name: "Facebook und Instagram",
    wofuer: "Bezahlte Anzeige. Hier scrollt jemand, der gar nicht sucht — deshalb drei Fassungen.",
    stuecke: [
      { titel: "Was die Stelle bietet", felder: [
        { etikett: "Primärtext", grenze: 125, grenzeArt: "schnitt",
          wert: "Bezahlung über dem Üblichen, Maschinen auf Stand und ein geregelter Feierabend.\n\nEin Familienbetrieb im Kreis Oldenburg sucht zwei bis drei Landschaftsgärtner.\n\nVier Fragen, zwei Minuten, keine Mappe." },
        { etikett: "Überschrift", wert: "Landschaftsgärtner, Kreis Oldenburg", grenze: 40, grenzeArt: "max" },
      ] },
      { titel: "Die Arbeit", felder: [
        { etikett: "Primärtext", grenze: 125, grenzeArt: "schnitt",
          wert: "Natursteinmauern, Pflasterwege, Holzterrassen, Schwimmteiche: Das ist dein Arbeitsalltag in diesem Betrieb.\n\nIm Privatgarten planst du dein Stück selbst." },
        { etikett: "Überschrift", wert: "Pflaster, Naturstein, Teichbau", grenze: 40, grenzeArt: "max" },
      ] },
      { titel: "Der Betrieb", felder: [
        { etikett: "Primärtext", grenze: 125, grenzeArt: "schnitt",
          wert: "Vierte Generation, über 100 Jahre, und die Arbeit liegt schon da.\n\nFür zwei bis drei Landschaftsgärtner ist ab sofort Platz." },
        { etikett: "Beschreibung", wert: "Seit über 100 Jahren", grenze: 30, grenzeArt: "max" },
      ] },
    ],
  },
  {
    id: "karriereseite", name: "Ihre eigene Seite",
    wofuer: "Die vollständige Fassung für Ihre Website. Sie bleibt stehen und wird bei Google gefunden.",
    stuecke: [{ titel: null, felder: [
      { etikett: "Überschrift", wert: "Landschaftsgärtner (m/w/d) im Kreis Oldenburg" },
      { etikett: "Einleitung", wert: lang },
      { etikett: "Das machst du", wert: "Privatgärten anlegen\nPflaster- und Natursteinarbeiten\nTeiche und Schwimmteiche bauen" },
    ] }],
  },
];

const mappe = [
  { id: "anleitung", name: "So schalten Sie das",
    wofuer: "Der Weg durch den Werbeanzeigenmanager, mit Ihren Werten.",
    stuecke: [{ titel: null, felder: anleitung({ ort, beruf, ...zusatz }).map((s) => ({ etikett: s.titel, wert: s.text, ohneKopie: true })) }] },
  { id: "drehbuch", name: "Das Video", wofuer: "Vier Einstellungen mit dem Handy, hochkant, etwa zwanzig Minuten.",
    stuecke: [{ titel: null, felder: [{ etikett: "Aufnahme", wert: "Hochkant filmen, Ton an.", ohneKopie: true }] }] },
  { id: "antworten", name: "Die ersten Antworten",
    wofuer: "Drei Nachrichten per WhatsApp, ohne dass Sie überlegen müssen.",
    stuecke: [{ titel: null, felder: [{ etikett: "Eingang", wert: "Danke für deine Nachricht." }] }] },
  { id: "wochenplan", name: "Der Wochenplan", wofuer: "Von null bis zur ersten Bewerbung. " + AUFWAND,
    stuecke: [{ titel: null, felder: wochenplan(zusatz).map((t) => ({ etikett: t.tag, wert: t.was, ohneKopie: true })) }] },
];

const ergebnis = {
  betrieb: "Garten- und Landschaftsbau, Landkreis Oldenburg",
  marktlage: schalter === "ohne-marktlage" ? null : marktlage({ berufsgruppe: "121", ort, beruf }),
  kanaele, mappe,
  fragen: [
    "Was machst du aktuell? · Ich arbeite im Garten- und Landschaftsbau · Ich bin in Ausbildung · Ich arbeite in einem anderen Bereich",
    "Wie viel Erfahrung hast du? · Unter 1 Jahr · 1 bis 3 Jahre · 3 bis 5 Jahre · Mehr als 5 Jahre",
    "Wann könntest du anfangen? · Sofort · In 1 bis 3 Monaten · Später",
    "Wie weit wohnst du entfernt? · Bis 15 km · 15 bis 30 km · 30 bis 50 km",
  ],
  budget: budgetzeile(zusatz),
};

const pdf = await ausschreibungPdf({ beruf, domain: "beispiel.de" }, ergebnis);
const ziel = ordner + "/stellenausschreibung" + (schalter ? "-" + schalter : "") + ".pdf";
writeFileSync(ziel, pdf);
console.log("PDF: " + Math.round(pdf.length / 1024) + " KB · " + ziel + " · Marktlage: " + (ergebnis.marktlage ? "ja" : "nein"));

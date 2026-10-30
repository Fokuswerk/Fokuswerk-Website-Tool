// Die Namenszuordnung der Anzeigenlage, Fall für Fall.
//
// Jeder Fall hier ist am 28.10.2026 live aufgetreten, keiner ist ausgedacht. Das ist die
// empfindlichste Stelle des ganzen Werkzeugs: Eine falsche Zuordnung behauptet einem
// Betrieb gegenüber, sein Nachbar würde werben — und beim ersten Nachschlagen in der
// Werbebibliothek ist das Vertrauen in alle anderen Zahlen weg.
//
// Drei Ausgänge:
//   sicher    zählt als Werbung dieses Betriebs
//   unsicher  zählt NICHT, wird nur vermerkt
//   nein      taucht nirgends auf
//
// Aufruf: node test/rangliste-zuordnung.mjs

import { zuordnen } from "../lib/rangliste-messen.js";

const ORT = "Westerstede";
const GEWERK = "Autowerkstatt";

const FAELLE = [
  // ── sicher ──────────────────────────────────────────────────────────────────
  ["H. Oeltjenbruns GmbH - PKW Werkstatt", "H. Oeltjenbruns GmbH", "sicher",
    "Google führt den Zusatz, Facebook nicht — derselbe Betrieb"],
  ["SBB Autoservice GmbH", "SBB Autoservice GmbH", "sicher",
    "Namensgleichheit, obwohl der Name nach Gattungsfilter KEIN Kennwort behält"],
  ["Freie Mehrmarkenwerkstatt Ralf Renken", "Ralf Renken", "sicher",
    "Der Werbetreibende ist der Inhaber — der fremde Name steckt ganz im eigenen"],
  ["WAV Alexander Lüers", "WAV Alexander Lüers GmbH", "sicher",
    "Rechtsform dazu, sonst gleich"],
  ["Dieter Schulz", "Dieter Schulz", "sicher",
    "Zwei kurze Kennwörter als Paar. ▲ Bleibt die Schwachstelle: Allerweltsname"],

  // ── unsicher: trifft etwas, aber nicht eindeutig ────────────────────────────
  ["EUROMASTER Westerstede PKW & LKW", "Euromaster", "unsicher",
    "Die Kette wirbt bundesweit, nicht die Filiale — eigener Name trägt den Ort, fremder nicht"],
  ["EUROMASTER Westerstede PKW & LKW", "Euromaster France", "unsicher",
    "Dieselbe Marke, anderes Land"],
  ["Autohaus Spiegel", "DER SPIEGEL", "unsicher",
    "Das Nachrichtenmagazin. Ein einzelnes Kennwort unter 8 Zeichen trägt keine Zuordnung"],
  // ▲ Dieser Fall stand bis zum 28.10.2026 auf „unsicher" und erschien damit als Vermerk
  // im Ergebnis. Seit die Pruefung das Gewerk mitliest, ist er entschieden: Die fremde
  // Seite nennt sich selbst Landtechnik, und das ist keine Autowerkstatt. Ein Vermerk
  // „nicht eindeutig" waere hier kein Hinweis mehr, sondern Rauschen.
  ["H. Oeltjenbruns GmbH", "Oeltjenbruns Landtechnik", "nein",
    "Gleicher Nachname, anderes Gewerk — die fremde Seite nennt sich Landtechnik"],
  ["Egon van Rüschen", "Reisebüro van Rüschen e.K.", "unsicher",
    "Gleicher Nachname, andere Branche"],

  // ── nein: kein Bezug ────────────────────────────────────────────────────────
  ["Auto Westerstede UG", "Grillwerk Westerstede", "nein",
    "Nach Gattung und Ortsname bleibt kein Kennwort — keine Aussage möglich"],
  ["Auto Westerstede UG", "Lely Center Westerstede", "nein",
    "Derselbe Grund; nur der Ortsname traf"],
  ["B&K KFZ und Lackier Service GmbH", "Unfall & Lackier Zentrum", "nein",
    "„Lackier\" ist Gattung, kein Eigenname"],
  ["Nutzfahrzeuge Service", "Volkswagen Nutzfahrzeuge", "nein",
    "Betriebsname besteht nur aus Gattungswörtern"],
  ["Dieter Schulz", "Family Gifts D3", "nein",
    "Dropshipping-Shop, der personalisierte Ware mit Nachnamen bewirbt — keine Überschneidung"],

  // ── nein: die fünf, die am 28.10.2026 ausgeliefert im Vorrat lagen ──────────
  // Jede dieser Zuordnungen stand in `daten/vorgerechnet/` und hätte einem Inhaber
  // gegenüber behauptet, dieser Nachbar werbe um seine Kunden.
  ["Auto Brünjes", "bruenjeshausverwaltung", "nein",
    "Hausverwaltung derselben Familie. Der fremde Name ENTHIELT „bruenjes“ — das genügte"],
  ["KFZ-Auto Elektrik Görlich", "dachdecker_a.goerlich", "nein",
    "Gleicher Nachname, aber die Seite nennt sich selbst Dachdecker. Anderes Gewerk"],
  ["L&B Motors GmbH", "SehgalMotors.PK", "nein",
    "Gemeinsam war nur „motors“, ein Gattungswort — die Kennung „l&b“ ist zu kurz"],
  ["KS Fahrzeughandel", "ELN_DasFahrzeughandelssystem", "nein",
    "Gemeinsam war nur „fahrzeughandel“; „ks“ trägt nichts"],
  ["ATT Autoteile Technik GmbH", "ATP-AUTOTEILE", "nein",
    "Onlinehandel. Unterscheidend waren allein „att“ und „atp“, beide unter vier Zeichen"],

  // ── sicher: dieselbe Verschärfung darf diese nicht mitnehmen ────────────────
  ["Autofit Neitzel, Inh. Jörg Neitzel", "Autofit Neitzel", "sicher",
    "Google führt den Inhaber mit, Facebook nicht"],
  ["Autohaus Am Tannenkamp GmbH & Co. KG", "Autohaus Am Tannenkamp", "sicher",
    "Nur die Rechtsform fehlt"],
  ["schoene sterne GbR - Borchers&Stark", "SCHÖNE STERNE", "sicher",
    "Großschreibung und Umlaut, sonst derselbe Name"],
];

let ok = 0;
const fehler = [];
for (const [betrieb, werbend, soll, warum] of FAELLE) {
  const ist = zuordnen(betrieb, werbend, ORT, GEWERK);
  if (ist === soll) {
    ok++;
    console.log(`  ok    ${ist.padEnd(9)} ${betrieb.slice(0, 36)}`);
  } else {
    fehler.push({ betrieb, werbend, soll, ist, warum });
    console.log(`  FEHL  ${ist.padEnd(9)} ${betrieb.slice(0, 36)} <- ${werbend}`);
    console.log(`        erwartet: ${soll} — ${warum}`);
  }
}

console.log(`\n${ok} von ${FAELLE.length} richtig`);
if (fehler.length) process.exit(1);

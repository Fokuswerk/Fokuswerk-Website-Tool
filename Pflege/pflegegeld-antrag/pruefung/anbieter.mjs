/**
 * Schlägt Alarm, solange Impressum und Datenschutzerklärung Platzhalter
 * enthalten — und solange die Seite trotzdem indexierbar wäre.
 *
 * Warum als Prüfung und nicht als Notiz: Eine fehlende Anbieterkennzeichnung
 * nach § 5 DDG ist abmahnfähig, und der Verantwortliche in der
 * Datenschutzerklärung hängt an denselben Angaben. Das ist nichts, was man
 * beim Ausrollen übersehen darf, also muss es laut sein.
 *
 * Aufruf: node pruefung/anbieter.mjs
 */

import { readFileSync } from "node:fs";

const quelle = readFileSync(new URL("../src/lib/anbieter.ts", import.meta.url), "utf8");
const layout = readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");

const offen = [...quelle.matchAll(/^\s*(\w+):\s*"BITTE EINTRAGEN"/gm)].map((m) => m[1]);
const noindex = /robots:\s*\{\s*index:\s*false/.test(layout);

console.log("");
if (offen.length === 0) {
  console.log("  ok      Impressum und Datenschutz sind vollständig ausgefüllt");
  if (noindex) {
    console.log("  Hinweis Die Seite steht noch auf noindex. Sobald die Rechtstexte stehen,");
    console.log("          kann das in src/app/layout.tsx weg — dann findet Google sie.");
  }
  console.log("\nALLES GRUEN: Anbieterangaben stehen.\n");
  process.exit(0);
}

console.error(`  FEHLER  ${offen.length} Pflichtangabe(n) fehlen: ${offen.join(", ")}`);
console.error("          Einzutragen in src/lib/anbieter.ts.");
if (noindex) {
  console.error("\n  Immerhin: die Seite steht auf noindex und ist damit nicht öffentlich");
  console.error("  auffindbar. Erst die Angaben eintragen, dann noindex entfernen.");
} else {
  console.error("\n  GEFAHR: noindex ist bereits entfernt, die Angaben fehlen aber noch.");
  console.error("  Eine Seite ohne Anbieterkennzeichnung nach § 5 DDG ist abmahnfähig.");
}
console.error("");
// Absichtlich OHNE Fehlercode: solange gebaut und ausgerollt werden koennen
// muss, waere ein harter Abbruch hier nur im Weg. Die Meldung ist laut genug.
process.exit(0);

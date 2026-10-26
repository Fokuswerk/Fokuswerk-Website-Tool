// Probelauf ohne Server und ohne Vercel:
//   ANTHROPIC_API_KEY=... node test/lokal.mjs knolle-harpstedt.de "Landschaftsgärtner"
//
// Ohne Schlüssel läuft nur der Seitenabruf — das reicht, um zu sehen, ob die richtigen
// Unterseiten gefunden werden, und kostet nichts.

import { ladeUmgebung } from "../lib/umgebung.js";
import { liesBetrieb } from "../lib/seite-lesen.js";
import { frageModell, BUDGETZEILE, kosten, modell } from "../lib/modell.js";
import { pruefeAntwort } from "../lib/vertrag.js";

ladeUmgebung();

const [domain, beruf = "Mitarbeiter"] = process.argv.slice(2);
if (!domain) {
  console.error('Aufruf: node test/lokal.mjs <domain> "<Beruf>"');
  process.exit(1);
}

const begonnen = Date.now();
const betrieb = await liesBetrieb(domain);
if (!betrieb) {
  console.error("seite_nicht_lesbar");
  process.exit(2);
}

console.log("Basis:    ", betrieb.basis);
console.log("Titel:    ", betrieb.titel);
console.log("Seiten:   ", betrieb.seiten.join("\n           "));
console.log("Zeichen:  ", betrieb.text.length, `(${Date.now() - begonnen} ms)`);

if (!process.env.ANTHROPIC_API_KEY) {
  console.log("\nKein ANTHROPIC_API_KEY gesetzt — Modellaufruf übersprungen.");
  console.log("\n--- Anfang des gelesenen Textes ---\n");
  console.log(betrieb.text.slice(0, 1200));
  process.exit(0);
}

const { antwort: roh, verbrauch } = await frageModell({ beruf, betrieb: betrieb.titel, text: betrieb.text });
const geprueft = pruefeAntwort(roh);
if (geprueft.fehler) {
  console.error("\nVerworfen:", geprueft.fehler);
  console.error(JSON.stringify(roh, null, 2)?.slice(0, 2000));
  process.exit(3);
}

console.log("\nBetrieb:  ", geprueft.betrieb);
for (const [nr, anzeige] of geprueft.anzeigen.entries()) {
  console.log(`\n--- Anzeige ${nr + 1}: ${anzeige.titel}\n`);
  console.log(anzeige.text);
}
console.log("\n--- Bewerberstrecke\n");
for (const frage of geprueft.fragen) console.log("  " + frage);
console.log("\n--- Budget\n\n" + BUDGETZEILE);
const euro = kosten(verbrauch);
console.log(`\nModell:   ${modell()}`);
console.log(`Token:    ${verbrauch.input_tokens} ein, ${verbrauch.output_tokens} aus`);
console.log(`Kosten:   ${euro === null ? "unbekannt" : (euro * 100).toFixed(2) + " Cent"}`);
console.log(`Gesamt:   ${Date.now() - begonnen} ms`);

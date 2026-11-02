/**
 * Zeigt die Bestätigungsmail, ohne eine zu verschicken.
 *
 * Grund: Der Text ist das Einzige an der Mail, was sich irren kann — und jeder
 * echte Versand kostet Kontingent und landet in einem Postfach. Hier lässt er
 * sich lesen und gegen die Regeln prüfen, die für eine Bestätigungsanfrage
 * gelten.
 *
 * Aufruf:  node pruefung/mailtext.mjs
 */

import { readFileSync } from "node:fs";

// Die Vorlage liegt in TypeScript; für dieses Skript genügt es, die Funktion
// aus der Datei zu lesen und auszuwerten - so bleibt eine einzige Quelle.
const quelle = readFileSync(new URL("../src/lib/mail.ts", import.meta.url), "utf8");
const anfang = quelle.indexOf("export function bestaetigungsMail");
const koerper = quelle
  .slice(anfang)
  .replace(/^export function/, "function")
  .replace(/: Mail\b/, "")
  .replace(/adresse: string, link: string, anlass: string/, "adresse, link, anlass");

const bestaetigungsMail = new Function(`${koerper}; return bestaetigungsMail;`)();

const FAELLE = ["startseite", "bescheid", "reform"];

/** Wörter, die in einer Bestätigungsanfrage nichts verloren haben. */
const WERBUNG = [
  "kostenlos testen", "jetzt kaufen", "Angebot", "Rabatt", "Gutschein",
  "Newsletter", "unverbindlich anfragen", "Sonderpreis",
];

let fehler = 0;
for (const anlass of FAELLE) {
  const m = bestaetigungsMail(
    "name@beispiel.de",
    "https://pflegegeld-antrag.de/bestaetigen?t=" + "a".repeat(64),
    anlass,
  );
  console.log("\n" + "─".repeat(72));
  console.log(`Anlass: ${anlass}`);
  console.log(`Betreff: ${m.betreff}`);
  console.log("─".repeat(72));
  console.log(m.text);

  const treffer = WERBUNG.filter((w) => m.text.toLowerCase().includes(w.toLowerCase()));
  if (treffer.length) {
    fehler++;
    console.error(`\n  FEHLER: Werbung in der Bestätigungsanfrage: ${treffer.join(", ")}`);
  }
  if (!m.text.includes("bestaetigen?t=")) {
    fehler++;
    console.error("\n  FEHLER: kein Bestätigungslink im Text");
  }
  if (!/Falls Sie sich nicht angemeldet haben/.test(m.text)) {
    fehler++;
    console.error("\n  FEHLER: fehlender Hinweis für Leute, die sich nicht angemeldet haben");
  }
}

console.log("\n" + "─".repeat(72));
console.log(
  fehler === 0
    ? "ALLES GRUEN: drei Varianten, keine Werbung, Link und Entwarnung in jeder.\n"
    : `NICHT GRUEN: ${fehler} Beanstandung(en).\n`,
);
process.exit(fehler === 0 ? 0 : 1);

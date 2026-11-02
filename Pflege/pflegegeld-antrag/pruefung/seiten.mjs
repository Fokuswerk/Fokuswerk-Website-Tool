/**
 * Laedt jede Seite im echten Browser und meldet, wenn eine davon beim Rendern
 * abstuerzt. Typpruefung und Build fangen das nicht: ein Hook hinter einem
 * vorzeitigen return baut fehlerfrei und zerlegt sich erst im Browser.
 *
 * Aufruf:  node pruefung/seiten.mjs [adresse]
 * Voraussetzung: der gebaute Stand laeuft unter der Adresse (npx next start).
 */

import { chromium } from "playwright";

const BASIS = process.argv[2] ?? "http://localhost:3311";

const SEITEN = [
  { pfad: "/", erwartet: "Pflegegrad" },
  { pfad: "/check", erwartet: "Mobilität" },
  { pfad: "/bescheid", erwartet: "Bescheid prüfen" },
  { pfad: "/reform", erwartet: "Was sich für Ihren Haushalt ändert" },
  { pfad: "/antrag", erwartet: "Antrag" },
  { pfad: "/mappe", erwartet: "Mappe" },
  { pfad: "/widerspruch", erwartet: "Widerspruch" },
  { pfad: "/rechtliches", erwartet: "Medizinischen Dienst" },
  { pfad: "/anfrage", erwartet: "Anfrage" },
  { pfad: "/admin", erwartet: "Auswertung" },
  // Ohne Token muss die Seite den Unbekannt-Fall zeigen, nicht abstuerzen.
  { pfad: "/bestaetigen", erwartet: "Diesen Link kennen wir nicht" },
];

/** Meldungen, die nichts mit der Seite zu tun haben. */
const EGAL = [/favicon/i, /Download the React DevTools/i];

let fehler = 0;
const browser = await chromium.launch();
const seite = await browser.newPage({ viewport: { width: 375, height: 812 } });

for (const { pfad, erwartet } of SEITEN) {
  const meldungen = [];
  const auf = (t) => {
    if (!EGAL.some((m) => m.test(t))) meldungen.push(t);
  };
  seite.on("console", (m) => m.type() === "error" && auf(m.text()));
  seite.on("pageerror", (e) => auf(String(e)));

  await seite.goto(BASIS + pfad, { waitUntil: "networkidle" });
  // Zeit fuer die Hydration: erst danach schlagen Hook-Fehler zu
  await seite.waitForTimeout(900);

  const text = await seite.evaluate(() => document.body.innerText);
  const hatInhalt = text.includes(erwartet);
  const abgestuerzt = text.includes("Application error") || /^\s*(Reload|Back)\s*$/m.test(text);

  if (meldungen.length || !hatInhalt || abgestuerzt) {
    fehler++;
    console.error(`  FEHLER  ${pfad}`);
    if (!hatInhalt) console.error(`          "${erwartet}" steht nicht auf der Seite`);
    if (abgestuerzt) console.error("          Fehlerseite statt Inhalt");
    for (const m of meldungen.slice(0, 3)) console.error(`          ${m.slice(0, 160)}`);
  } else {
    console.log(`  ok      ${pfad}`);
  }
  seite.removeAllListeners("console");
  seite.removeAllListeners("pageerror");
}

await browser.close();
console.log(
  `\n${fehler === 0 ? "ALLES GRUEN" : "NICHT GRUEN"}: ${SEITEN.length - fehler} von ${SEITEN.length} Seiten laden sauber.\n`,
);
if (fehler > 0) process.exit(1);

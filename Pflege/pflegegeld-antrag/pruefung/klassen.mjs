// Prüft, ob jede im Markup benutzte CSS-Klasse auch eine Regel hat.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function cssDateien(ordner) {
  return readdirSync(ordner).flatMap((e) => {
    const pfad = join(ordner, e);
    if (statSync(pfad).isDirectory()) return cssDateien(pfad);
    return pfad.endsWith(".css") ? [pfad] : [];
  });
}
const css = cssDateien("src").map((f) => readFileSync(f, "utf8")).join("\n");
const definiert = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));

function dateien(ordner) {
  return readdirSync(ordner).flatMap((e) => {
    const pfad = join(ordner, e);
    if (statSync(pfad).isDirectory()) return dateien(pfad);
    return pfad.endsWith(".tsx") ? [pfad] : [];
  });
}

const benutzt = new Map();
for (const datei of dateien("src")) {
  const text = readFileSync(datei, "utf8");
  for (const m of text.matchAll(/className=(?:"([^"]+)"|\{`([^`]+)`\})/g)) {
    const roh = (m[1] ?? m[2]).replace(/\$\{[^}]*\}/g, " ");
    for (const k of roh.split(/\s+/).filter(Boolean)) {
      if (!benutzt.has(k)) benutzt.set(k, new Set());
      benutzt.get(k).add(datei);
    }
  }
}

const fehlend = [...benutzt].filter(([k]) => !definiert.has(k));

/*
 * Zweite Pruefung: derselbe Klassenname zweimal als eigenstaendige Regel.
 *
 * Das ist die Luecke, die die Pruefung oben nicht sieht - beide Namen HABEN
 * ja eine Regel. Passiert ist es mit `.stichtag`: erst die Zaehler-Pille im
 * Hero (inline-flex), spaeter ein ganzer Block auf der Ergebnisseite. Der
 * neue Block setzte kein `display`, also galt das inline-flex der Pille, und
 * das Layout lief ueber den Rand. Im Browser sofort sichtbar, in der CSS-Datei
 * 800 Zeilen auseinander und deshalb nicht.
 *
 * Gemeldet wird nur die Wiederholung als ALLEINSTEHENDER Selektor
 * (`.name {`) - Varianten wie `.name:hover` oder `.a .name` sind Absicht.
 */
const alleinstehend = new Map();
for (const treffer of css.matchAll(/^\.([a-zA-Z][\w-]*)\s*\{/gm)) {
  const name = treffer[1];
  alleinstehend.set(name, (alleinstehend.get(name) ?? 0) + 1);
}
const doppelt = [...alleinstehend].filter(([, n]) => n > 1);

if (fehlend.length === 0 && doppelt.length === 0) {
  console.log(`ALLES GRUEN: ${benutzt.size} Klassen, alle mit Regel, keine doppelt.`);
} else {
  if (fehlend.length) {
    console.error("Klassen ohne CSS-Regel:");
    for (const [k, wo] of fehlend) console.error(`  ${k.padEnd(22)} ${[...wo].join(", ")}`);
  }
  if (doppelt.length) {
    console.error("Klassen mit mehr als einer eigenstaendigen Regel:");
    for (const [k, n] of doppelt) console.error(`  .${k.padEnd(21)} ${n}x — spaetere Regel erbt stillschweigend von der frueheren`);
  }
  process.exit(1);
}

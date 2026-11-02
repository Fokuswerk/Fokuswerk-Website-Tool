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
if (fehlend.length === 0) {
  console.log(`ALLES GRUEN: ${benutzt.size} Klassen, alle mit Regel.`);
} else {
  console.error("Klassen ohne CSS-Regel:");
  for (const [k, wo] of fehlend) console.error(`  ${k.padEnd(22)} ${[...wo].join(", ")}`);
  process.exit(1);
}

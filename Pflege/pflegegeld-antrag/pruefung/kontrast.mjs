// Misst WCAG-Kontraste der Farbpaare aus dem Designsystem.
import { readFileSync } from "node:fs";

const css = readFileSync("src/app/globals.css", "utf8");
const wurzel = css.slice(css.indexOf(":root {"), css.indexOf("}", css.indexOf(":root {")));
const token = Object.fromEntries(
  [...wurzel.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/g)].map((m) => [m[1], m[2]]),
);

function kanal(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
function rgb(f) {
  if (f.startsWith("#")) {
    let h = f.slice(1);
    if (h.length === 3) h = [...h].map((x) => x + x).join("");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const t = f.match(/[\d.]+/g).map(Number);
  return [t[0], t[1], t[2]];
}
function leuchtdichte(f) {
  const [r, g, b] = rgb(f);
  return 0.2126 * kanal(r) + 0.7152 * kanal(g) + 0.0722 * kanal(b);
}
function kontrast(a, b) {
  const la = leuchtdichte(a), lb = leuchtdichte(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const flaechen = {
  weiss: "#ffffff",
  papier: token.papier,
  "papier-2": token["papier-2"],
  himmel: token.himmel,
  "akzent-weich": token["akzent-weich"],
  "signal-weich": token["signal-weich"],
  "gut-weich": token["gut-weich"],
  "warn-weich": token["warn-weich"],
  nacht: token.nacht,
  akzent: token.akzent,
};
const schriften = {
  tinte: token.tinte,
  "tinte-2": token["tinte-2"],
  "tinte-3": token["tinte-3"],
  akzent: token.akzent,
  signal: token.signal,
  gut: token.gut,
  warn: token.warn,
  "auf-nacht": token["auf-nacht"],
  "auf-nacht-2": token["auf-nacht-2"],
  "auf-nacht-3": token["auf-nacht-3"],
  "akzent-hell": token["akzent-hell"],
  weiss: "#ffffff",
};

const paare = [
  ["tinte", "weiss"], ["tinte", "papier"], ["tinte", "himmel"], ["tinte", "papier-2"],
  ["tinte-2", "weiss"], ["tinte-2", "papier"], ["tinte-2", "himmel"],
  ["tinte-3", "weiss"], ["tinte-3", "papier"], ["tinte-3", "himmel"],
  ["akzent", "weiss"], ["akzent", "papier"], ["akzent", "himmel"], ["akzent", "akzent-weich"],
  ["signal", "weiss"], ["signal", "signal-weich"], ["signal", "papier"],
  ["gut", "weiss"], ["gut", "gut-weich"],
  ["warn", "weiss"], ["warn", "warn-weich"],
  ["auf-nacht", "nacht"], ["auf-nacht-2", "nacht"], ["auf-nacht-3", "nacht"],
  ["akzent-hell", "nacht"],
  ["tinte-2", "papier-2"], ["tinte-3", "papier-2"], ["akzent", "papier-2"],
  ["weiss", "akzent"],
];

let schlecht = 0;
console.log("Schrift auf Fläche              Verhältnis  Bewertung");
console.log("--------------------------------------------------------");
for (const [s, f] of paare) {
  const v = kontrast(schriften[s], flaechen[f]);
  // 4.5 für Fließtext, 3.0 als absolutes Minimum für große Schrift
  const ok = v >= 4.5 ? "gut" : v >= 3 ? "nur groß" : "DURCHGEFALLEN";
  if (v < 3) schlecht++;
  console.log(`${(s + " auf " + f).padEnd(32)}${v.toFixed(2).padStart(6)}   ${ok}`);
}
console.log("--------------------------------------------------------");
if (schlecht > 0) {
  console.error(`${schlecht} Paare unter 3:1 — nicht lesbar.`);
  process.exit(1);
}
console.log("Kein Paar unter 3:1.");

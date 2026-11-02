/**
 * Baut die Seitenbilder aus den Unsplash-Originalen.
 *
 * Die Bilder bleiben in ihrer Naturfarbe. Eine gemeinsame Duotone hatte das
 * Problem geloest, dass Fotos aus verschiedenen Lichtsituationen nicht
 * zusammenpassen - sie war aber als Toenung sichtbar und wurde verworfen.
 * Stattdessen loest die Bildauswahl selbst das Problem: zwei Aufnahmen aus
 * demselben Licht, beide dokumentarisch, beide in ruhigen Farben.
 *
 * Aufruf: node werkzeug/bilder.mjs
 */
import sharp from "sharp";
import { mkdir, access } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const ZIEL = new URL("../public/bilder/", import.meta.url).pathname;
const ROH = new URL("../.bilder-roh/", import.meta.url).pathname;

const BILDER = [
  {
    name: "hero",
    kennung: "photo-1658632302217-984d432b4d38",
    breiten: [900, 1500],
    motiv: "Aelteres Paar zu Hause, er beugt sich zu ihr im Sessel",
    /** Hochformat 3:4, wie es neben dem Text im Hero steht. */
    verhaeltnis: 4 / 3,
  },
  {
    name: "gespraech",
    kennung: "photo-1685608625836-7b081c676483",
    breiten: [760, 1300],
    motiv: "Zwei Frauen im Gespraech an einem Tisch",
    /** Querformat 3:2, wie im Bildblock. */
    verhaeltnis: 2 / 3,
  },
];

async function holen(kennung) {
  const datei = `${ROH}${kennung}.jpg`;
  try {
    await access(datei);
    return datei;
  } catch {
    const antwort = await fetch(`https://images.unsplash.com/${kennung}?w=2400&q=92&fm=jpg`);
    if (!antwort.ok) throw new Error(`${kennung}: HTTP ${antwort.status}`);
    await pipeline(Readable.fromWeb(antwort.body), createWriteStream(datei));
    return datei;
  }
}

/** Zuschnitt auf das Seitenverhaeltnis der Stelle, an der das Bild steht. */
function zuschnitt(quelle, breite, hoehe) {
  return sharp(quelle).resize({
    width: breite,
    height: hoehe,
    fit: "cover",
    // Sucht den inhaltlich wichtigen Ausschnitt statt stumpf die Mitte.
    position: "attention",
  });
}

await mkdir(ROH, { recursive: true });
await mkdir(ZIEL, { recursive: true });

for (const bild of BILDER) {
  const quelle = await holen(bild.kennung);
  for (const breite of bild.breiten) {
    const hoehe = Math.round(breite * bild.verhaeltnis);
    const b = zuschnitt(quelle, breite, hoehe);
    await b.clone().avif({ quality: 62, effort: 6 }).toFile(`${ZIEL}${bild.name}-${breite}.avif`);
    await b.clone().webp({ quality: 80 }).toFile(`${ZIEL}${bild.name}-${breite}.webp`);
    console.log(`  ${bild.name}-${breite}  ${breite}x${hoehe}`);
  }
}
console.log("Bilder gebaut.");

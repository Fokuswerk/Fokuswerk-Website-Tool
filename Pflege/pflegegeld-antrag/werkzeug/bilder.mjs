/**
 * Baut die Seitenbilder aus den Unsplash-Originalen.
 *
 * Alle Bilder bekommen dieselbe Graduierung - eine echte Duotone-Rechnung mit
 * Petrol in den Tiefen und einem fast neutralen Licht. Grund: vier Fotos aus
 * vier Lichtsituationen lesen sich als vier Einkaeufe. Ein gemeinsamer Ton
 * macht daraus einen Satz. sharp.tint() reicht dafuer nicht, weil die Farbe
 * bei hellen Werten praktisch verschwindet.
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

/** Tiefen- und Lichterfarbe der gemeinsamen Graduierung. */
const TIEFE = [10, 43, 64];
const LICHT = [236, 242, 246];
/** Leichte Kontrastanhebung, damit die Duotone nicht flau wird. */
const KONTRAST = 1.08;
const HUB = -6;

const BILDER = [
  {
    name: "hero",
    kennung: "photo-1747330201652-dbebf32eceb7",
    breiten: [900, 1500],
    motiv: "Haende einer aelteren Person auf einem Gehstock",
  },
  {
    name: "gespraech",
    kennung: "photo-1685608625836-7b081c676483",
    breiten: [760, 1300],
    motiv: "Zwei Frauen im Gespraech an einem Tisch",
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

/** Helligkeit blendet zwischen Tiefen- und Lichterfarbe. */
async function duotone(quelle, breite) {
  const { data, info } = await sharp(quelle)
    .resize({ width: breite, withoutEnlargement: true })
    .grayscale()
    .linear(KONTRAST, HUB)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const aus = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0, p = 0; i < data.length; i += info.channels, p += 3) {
    const l = data[i] / 255;
    aus[p] = TIEFE[0] + (LICHT[0] - TIEFE[0]) * l;
    aus[p + 1] = TIEFE[1] + (LICHT[1] - TIEFE[1]) * l;
    aus[p + 2] = TIEFE[2] + (LICHT[2] - TIEFE[2]) * l;
  }
  return sharp(aus, { raw: { width: info.width, height: info.height, channels: 3 } });
}

await mkdir(ROH, { recursive: true });
await mkdir(ZIEL, { recursive: true });

for (const bild of BILDER) {
  const quelle = await holen(bild.kennung);
  for (const breite of bild.breiten) {
    const getont = await duotone(quelle, breite);
    const masse = await getont.metadata();
    await getont.clone().avif({ quality: 58, effort: 6 }).toFile(`${ZIEL}${bild.name}-${breite}.avif`);
    await getont.clone().webp({ quality: 76 }).toFile(`${ZIEL}${bild.name}-${breite}.webp`);
    console.log(`  ${bild.name}-${breite}  ${masse.width}x${masse.height}`);
  }
}
console.log("Bilder gebaut.");

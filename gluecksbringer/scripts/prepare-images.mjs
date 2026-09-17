/**
 * Einmaliges Aufbereiten der Bilder aus dem alten Webauftritt:
 * Größe begrenzen, EXIF-Rotation anwenden, als progressives JPEG/PNG speichern.
 * Aufruf: node scripts/prepare-images.mjs <quellordner>
 */
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = process.argv[2];
const OUT = path.join(process.cwd(), "assets", "bilder");

/** [Quelldatei, Zielname, maximale Kantenlänge] */
const FILES = [
  ["IMG_2242.jpeg", "wunschbaum-2025-team.jpg", 2400],
  ["IMG_2234.jpeg", "wunschbaum-2025-wunschkarten.jpg", 1800],
  ["IMG_2230.jpeg", "wunschbaum-2025-vorbereitung.jpg", 2000],
  ["Foto_2022_09_28___serialized4.jpg", "verein-team.jpg", 1600],
  ["Foto_Wubam_2024_4___serialized2.jpg", "geschenkuebergabe-2024.jpg", 1600],
  [
    "28E67A3D-BC62-465F-BAFA-C140A1CDA456___serialized1.png",
    "zwischenahner-meer-kleeblatt.jpg",
    1600,
  ],
  ["IMG_1380.jpeg", "wunschbaum-2025-banner.jpg", 1400],
  ["Wunschbaum_Plakat_2025_.jpg", "wunschbaum-2025-plakat.jpg", 1400],
  ["IMG_2208.png", "wunschbaum-digital.png", 1000],
  ["IMG_1290.jpeg", "partner-weinbar.jpg", 1400],
  ["Puck_Kopie.png", "puck.png", 900],
  // Galerie
  ["2011__110633bad2-IMG_7283.JPG", "2011-erste-geschenke.jpg", 1600],
  ["2011__111012_so_fing_alles_an.JPG", "2011-so-fing-alles-an.jpg", 1800],
  [
    "2011__111112Aufstellen_des_ersten_Wunschbaumes.JPG",
    "2011-erster-wunschbaum-aufstellen.jpg",
    1800,
  ],
  [
    "2011__111112Wunschbaum.JPG",
    "2011-erster-wunschbaum-geschmueckt.jpg",
    1800,
  ],
  ["2011__111216_Geschenkausgabe_2011.jpg", "2011-geschenkausgabe.jpg", 1800],
  ["2011__111216_große_Freude.jpg", "2011-grosse-freude.jpg", 1800],
  [
    "2011__111216_soooo_viele_Geschenke_beim_ersten_Mal.JPG",
    "2011-viele-geschenke.jpg",
    1800,
  ],
  ["2011__2076c9c460-mit_Logo.jpg", "2011-erstes-weihnachtslogo.jpg", 900],
  ["2012__120630_Rügenwalder_Cup.JPG", "2012-ruegenwalder-cup.jpg", 1800],
  ["2012__die_Vereinsmitglieder.jpg", "2012-vereinsmitglieder.jpg", 1400],
  ["2012__121214_viele_Geschenke.jpg", "2012-wunschbaumgeschenke.jpg", 1800],
  ["2012__unsere_Vereinsvorsitzenden.JPG", "2012-vereinsvorsitzende.jpg", 1400],
  [
    "2013__130622_Schwimmkurs_2013_Urkundenübergabe.JPG",
    "2013-schwimmkurs-urkunden.jpg",
    1800,
  ],
  ["2013__130622_Schwimmkurs_2013.JPG", "2013-schwimmkurs.jpg", 1800],
  ["2013__55667c9baf-IMG_9863.JPG", "2013-schwimmkurs-stolz.jpg", 1600],
  ["2013__Wubaum2013.jpg", "2013-wunschbaum.jpg", 1800],
  ["2013__WubaumA2013.jpg", "2013-wunschbaum-kinder.jpg", 1800],
  ["2014__140503_Schwimmkurs_2014.JPG", "2014-schwimmkurs.jpg", 1800],
  [
    "2014__140624_Schwimmkurs_Urkunde_2014.jpg",
    "2014-schwimmkurs-urkunde.jpg",
    1600,
  ],
  ["facebook_1413134417480.jpg", "2014-kuerbisfest-1.jpg", 1400],
  ["facebook_1413134449697.jpg", "2014-kuerbisfest-2.jpg", 1400],
  ["facebook_1413134500904.jpg", "2014-kuerbisfest-3.jpg", 1400],
  ["IMG-20151114-WA0000[2].jpg", "2015-wunschbaum.jpg", 1600],
  [
    "Bilder_aus_2016_und_2017__IMG-20170623-WA0012[1].jpg",
    "2017-geschenke.jpg",
    1400,
  ],
];

await mkdir(OUT, { recursive: true });

for (const [from, to, max] of FILES) {
  const buffer = await readFile(path.join(SRC, from));
  const pipeline = sharp(buffer).rotate().resize({
    width: max,
    height: max,
    fit: "inside",
    withoutEnlargement: true,
  });

  const out = to.endsWith(".png")
    ? await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer()
    : await pipeline
        .jpeg({ quality: 80, progressive: true, mozjpeg: true })
        .toBuffer();

  await writeFile(path.join(OUT, to), out);
  const { width, height } = await sharp(out).metadata();
  console.log(
    `${to.padEnd(42)} ${width}x${height}  ${(out.length / 1024).toFixed(0)} KB`,
  );
}

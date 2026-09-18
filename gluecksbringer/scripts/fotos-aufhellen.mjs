/**
 * Hebt die Fotos aus dem Vereinsarchiv einmalig auf ein sauberes Niveau:
 * Tonwerte strecken, Sättigung minimal zurücknehmen, leicht nachschärfen.
 * Es sind Handyaufnahmen aus Innenräumen – die Verarbeitung soll sie klarer
 * machen, nicht anders aussehen lassen.
 *
 * Grafiken (Plakat, Banner, Logo, Maskottchen) bleiben unberührt, weil
 * Tonwertstreckung dort die Flächenfarben verschieben würde.
 *
 * Aufruf: node scripts/fotos-aufhellen.mjs [quellordner]
 * Läuft absichtlich nur einmal – mehrfaches Anwenden übersteigert die Bilder.
 */
import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const ORDNER = process.argv[2] ?? "assets/bilder";

const AUSGENOMMEN = [
  /^puck/,
  /^wunschbaum-2025-banner/,
  /^wunschbaum-2025-plakat/,
  /^2011-erstes-weihnachtslogo/,
  /^wunschbaum-digital/,
  /^partner-weinbar/,
  /^zwischenahner-meer-kleeblatt/,
];

const dateien = readdirSync(ORDNER)
  .filter((f) => /\.jpe?g$/i.test(f))
  .filter((f) => !AUSGENOMMEN.some((r) => r.test(f)));

for (const datei of dateien) {
  const pfad = path.join(ORDNER, datei);
  const vorher = statSync(pfad).size;
  const puffer = await sharp(pfad)
    .normalise({ lower: 1, upper: 99 })
    .modulate({ saturation: 0.96 })
    .sharpen({ sigma: 0.7, m1: 0.4, m2: 0.9 })
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
  await sharp(puffer).toFile(pfad);
  const nachher = statSync(pfad).size;
  console.log(
    datei.padEnd(40),
    (vorher / 1024).toFixed(0) + " kB → " + (nachher / 1024).toFixed(0) + " kB",
  );
}
console.log(`\n${dateien.length} Fotos aufbereitet.`);

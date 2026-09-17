/**
 * Erzeugt das Vorschaubild für soziale Netzwerke (Open Graph, 1200 × 630).
 * Aufruf: node scripts/og-bild.mjs
 */
import sharp from "sharp";
import path from "node:path";

const quelle = path.join(
  process.cwd(),
  "assets",
  "bilder",
  "wunschbaum-2025-team.jpg",
);
const ziel = path.join(process.cwd(), "app", "opengraph-image.jpg");

const BREITE = 1200;
const HOEHE = 630;

const foto = await sharp(quelle)
  .resize({ width: BREITE, height: HOEHE, fit: "cover", position: "attention" })
  .toBuffer();

const ebene = Buffer.from(`
<svg width="${BREITE}" height="${HOEHE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="v" x1="0" y1="0" x2="1" y2="0.3">
      <stop offset="0%" stop-color="#10293b" stop-opacity="0.94"/>
      <stop offset="52%" stop-color="#10293b" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#10293b" stop-opacity="0.18"/>
    </linearGradient>
  </defs>
  <rect width="${BREITE}" height="${HOEHE}" fill="url(#v)"/>
  <text x="72" y="196" font-family="Helvetica, Arial, sans-serif" font-size="21" font-weight="600"
        letter-spacing="3.2" fill="#b9d2dd">BAD ZWISCHENAHN · SEIT 2011</text>
  <text x="72" y="286" font-family="Helvetica, Arial, sans-serif" font-size="66" font-weight="700"
        fill="#fcfaf6">Gemeinsam schenken wir</text>
  <text x="72" y="362" font-family="Helvetica, Arial, sans-serif" font-size="66" font-weight="700"
        fill="#fcfaf6">Kindern ein Stück Glück.</text>
  <rect x="72" y="408" width="78" height="4" rx="2" fill="#c2452e"/>
  <text x="72" y="484" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="500"
        fill="#fcfaf6" opacity="0.92">Glücksbringer am Meer e.V.</text>
</svg>`);

await sharp(foto)
  .composite([{ input: ebene, top: 0, left: 0 }])
  .jpeg({ quality: 86, progressive: true, mozjpeg: true })
  .toFile(ziel);

console.log("geschrieben:", ziel);

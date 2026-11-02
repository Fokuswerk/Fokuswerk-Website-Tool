/**
 * Baut das Vorschaubild fuer geteilte Links (Open Graph, 1200x630).
 *
 * Gerendert wird mit Playwright statt mit sharp-Textoverlay: so greifen
 * dieselben Schriften wie auf der Seite (Outfit und Inter von Google), und das
 * Ergebnis sieht wirklich nach dieser Seite aus statt nach einer Nachbildung.
 *
 * Aufruf: node werkzeug/vorschaubild.mjs
 */
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";

const WURZEL = new URL("..", import.meta.url).pathname;
const FOTO = `${WURZEL}public/bilder/hero-1500.webp`;

const foto = `data:image/webp;base64,${(await readFile(FOTO)).toString("base64")}`;

const seite = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; display: flex; background: #10242f; font-family: Inter, sans-serif; }
  .text { flex: 1; padding: 64px 56px; display: flex; flex-direction: column; justify-content: space-between; }
  .marke { display: flex; align-items: center; gap: 12px; }
  .zeichen { width: 44px; height: 44px; border-radius: 12px; background: #004c72;
             display: flex; align-items: center; justify-content: center; }
  .flagge { width: 4px; height: 26px; border-radius: 999px; overflow: hidden; display: flex; flex-direction: column; }
  .flagge i { flex: 1; } .flagge i:nth-child(1){background:#000} .flagge i:nth-child(2){background:#D00} .flagge i:nth-child(3){background:#FC0}
  .wort { font-family: Outfit, sans-serif; font-weight: 600; font-size: 25px; color: #eef4f8; letter-spacing: -0.01em; }
  h1 { font-family: Outfit, sans-serif; font-weight: 700; font-size: 60px; line-height: 1.05;
       letter-spacing: -0.034em; color: #eef4f8; max-width: 15ch; }
  p { margin-top: 20px; font-size: 22px; line-height: 1.45; color: #a3b6c2; max-width: 32ch; }
  .fuss { font-size: 18px; color: #8fc6e8; font-weight: 600; }
  .bild { width: 420px; position: relative; }
  .bild img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .bild::after { content: ""; position: absolute; inset: 0;
                 background: linear-gradient(90deg, #10242f 0%, rgba(16,36,47,0) 42%); }
</style></head><body>
  <div class="text">
    <div class="marke">
      <span class="zeichen"><svg width="22" height="22" viewBox="0 0 48 48"><path d="M24 36.5s-11-6.6-11-14.7a6.3 6.3 0 0 1 11-4.1 6.3 6.3 0 0 1 11 4.1c0 8.1-11 14.7-11 14.7Z" fill="none" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"/></svg></span>
      <span class="flagge"><i></i><i></i><i></i></span>
      <span class="wort">Pflegegeld-Antrag</span>
    </div>
    <div>
      <h1>Welcher Pflegegrad kommt heraus?</h1>
      <p>Nach den amtlichen Kriterien gerechnet – nach heutigem Recht und nach den Punktgrenzen ab 2027.</p>
    </div>
    <div class="fuss">Kostenlos · ohne Anmeldung · 64 Kriterien</div>
  </div>
  <div class="bild"><img src="${foto}" alt=""></div>
</body></html>`;

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await tab.setContent(seite, { waitUntil: "networkidle" });
await tab.evaluate(() => document.fonts.ready);
await tab.waitForTimeout(400);
// JPEG statt PNG: WhatsApp laedt Vorschaubilder ueber rund 300 kB gar nicht
// erst, und als PNG liegt dieses Bild bei gut 300. Bei einem Foto mit Text
// darauf ist der sichtbare Unterschied bei Qualitaet 88 keiner.
const roh = await tab.screenshot({ type: "png" });
await browser.close();
const { default: sharp } = await import("sharp");
await sharp(roh).jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
  .toFile(`${WURZEL}public/vorschau.jpg`);
console.log("public/vorschau.jpg gebaut (1200x630)");

/**
 * Legt Bildvarianten im echten Hero-Zuschnitt nebeneinander, damit sich im
 * Zusammenhang entscheiden laesst statt am Miniaturbild.
 */
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";

const ZIEL = "/tmp/claude-501/-Users-thees-Desktop-Claude-Pflege/e920344e-c05d-4cbf-a5f1-52d34f48d814/scratchpad/v/";
await mkdir(ZIEL, { recursive: true });

const TIEFE = [10, 43, 64], LICHT = [236, 242, 246];
async function duotone(eingabe) {
  const { data, info } = await eingabe.grayscale().linear(1.08, -6).raw().toBuffer({ resolveWithObject: true });
  const aus = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0, p = 0; i < data.length; i += info.channels, p += 3) {
    const l = data[i] / 255;
    for (let k = 0; k < 3; k++) aus[p + k] = TIEFE[k] + (LICHT[k] - TIEFE[k]) * l;
  }
  return sharp(aus, { raw: { width: info.width, height: info.height, channels: 3 } });
}

const VARIANTEN = [
  { datei: "a-jetzt-getoent",   kennung: "photo-1747330201652-dbebf32eceb7", art: "duotone", titel: "A — jetzt: Gehstock, blau getönt" },
  { datei: "b-stock-neutral",   kennung: "photo-1747330201652-dbebf32eceb7", art: "natur",   titel: "B — derselbe, ohne Tönung" },
  { datei: "c-paar-farbe",      kennung: "photo-1658632302217-984d432b4d38", art: "natur",   titel: "C — älteres Paar zu Hause, Farbe" },
  { datei: "d-gespraech-farbe", kennung: "photo-1685608625836-7b081c676483", art: "natur",   titel: "D — Gespräch am Tisch, Farbe" },
];

const bilder = [];
for (const v of VARIANTEN) {
  const antwort = await fetch(`https://images.unsplash.com/${v.kennung}?w=1400&q=88&fm=jpg`);
  const roh = Buffer.from(await antwort.arrayBuffer());
  let b = sharp(roh).resize({ width: 600, height: 800, fit: "cover", position: "attention" });
  if (v.art === "duotone") b = await duotone(b);
  const jpg = await b.jpeg({ quality: 82 }).toBuffer();
  bilder.push({ ...v, daten: `data:image/jpeg;base64,${jpg.toString("base64")}` });
  console.log("  gebaut:", v.datei);
}

const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@600;700&display=swap" rel="stylesheet">
<style>
 *{margin:0;padding:0;box-sizing:border-box}
 body{background:#eef2f6;font-family:Inter,sans-serif;padding:40px;color:#152330}
 h1{font-family:Outfit,sans-serif;font-size:30px;margin-bottom:8px;letter-spacing:-.02em}
 .hin{color:#526370;margin-bottom:32px;font-size:16px}
 .reihe{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
 .feld{background:#e3edf4;border-radius:22px;padding:20px}
 .feld img{width:100%;border-radius:18px;display:block;box-shadow:0 10px 26px -8px rgba(21,35,48,.2)}
 .name{font-weight:600;font-size:15px;margin-top:14px}
 .satz{font-family:Outfit,sans-serif;font-weight:700;font-size:19px;line-height:1.15;
       letter-spacing:-.03em;margin:14px 0 4px}
 .unter{font-size:13px;color:#526370;line-height:1.45}
</style></head><body>
<h1>Welches Bild?</h1>
<p class="hin">Im echten Hero-Zuschnitt (3:4) auf der echten Hintergrundfarbe. Darunter steht die Schlagzeile, damit der Zusammenhang stimmt.</p>
<div class="reihe">
${bilder.map((b) => `<div class="feld">
  <img src="${b.daten}" alt="">
  <div class="satz">Welcher Pflegegrad kommt heraus?</div>
  <div class="unter">Nach den amtlichen Kriterien, zweimal gerechnet.</div>
  <div class="name">${b.titel}</div>
</div>`).join("\n")}
</div></body></html>`;

await writeFile(ZIEL + "vergleich.html", html);
console.log("\nfertig:", ZIEL + "vergleich.html");

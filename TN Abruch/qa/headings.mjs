/**
 * Ueberschriften-Pruefung: findet Ueberschriften, die auf drei oder mehr Zeilen
 * umbrechen. Solche Bloecke wirken schnell plakativ statt praegnant — die Skala
 * ist bewusst darauf ausgelegt, dass H1 und H2 mit zwei Zeilen auskommen.
 *
 * Aufruf:  BASE=http://localhost:4322 node qa/headings.mjs
 * Keine Ausgabe unter einem Viewport = dort ist alles hoechstens zweizeilig.
 */
import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:4321';
const pages = ['/', '/leistungen/', '/leistungen/schadstoffsanierung/', '/leistungen/rueckbau-entkernung/',
  '/leistungen/beton-bohren-saegen/', '/leistungen/entsorgung-container/', '/referenzen/',
  '/referenzen/rathaus-dietzenbach-2010/', '/unternehmen/', '/karriere/', '/kontakt/'];
const b = await chromium.launch();
for (const vp of [{n:'desktop',w:1440,h:900},{n:'mobile',w:390,h:844}]) {
  const p = await b.newPage({ viewport: { width: vp.w, height: vp.h }, locale: 'de-DE' });
  console.log('\n=== ' + vp.n + ' ===');
  for (const path of pages) {
    await p.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    await p.evaluate(() => document.querySelectorAll('[data-rise]').forEach(e => e.classList.add('is-in')));
    await p.waitForTimeout(120);
    const rows = await p.$$eval('h1, h2, h3', els => els.map(el => {
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      const lines = Math.round(el.getBoundingClientRect().height / lh);
      return { tag: el.tagName, lines, px: Math.round(parseFloat(cs.fontSize)),
               txt: el.textContent.replace(/\s+/g,' ').trim().slice(0, 62) };
    }).filter(r => r.lines >= 3));
    for (const r of rows) console.log(`${path}  ${r.tag} ${r.lines}Z ${r.px}px  "${r.txt}"`);
  }
  await p.close();
}
await b.close();

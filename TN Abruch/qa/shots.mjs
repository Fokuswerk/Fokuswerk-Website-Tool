/**
 * Screenshot-Werkzeug fuer die visuelle QA.
 * Aufruf:  node qa/shots.mjs [pfad ...]
 * Ergebnis: qa/shots/<viewport>--<slug>.png  (ganze Seite)
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ['/'];
const viewports = [
  { name: 'desktop', width: 1440, height: 900, dsf: 1 },
  { name: 'mobile', width: 390, height: 844, dsf: 1, mobile: true },
];

await mkdir('qa/shots', { recursive: true });
const browser = await chromium.launch();
const problems = [];

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dsf,
    isMobile: !!vp.mobile,
    hasTouch: !!vp.mobile,
    locale: 'de-DE',
  });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`[console ${vp.name}] ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`[pageerror ${vp.name}] ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400) problems.push(`[http ${r.status()} ${vp.name}] ${r.url()}`);
  });

  for (const p of paths) {
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    // Fuer die Layout-QA: alles sichtbar schalten und Bilder sofort laden.
    // Der Einlauf selbst wird separat im echten Browser geprueft.
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((i) => i.setAttribute('loading', 'eager'));
      document.querySelectorAll('[data-rise]').forEach((e) => e.classList.add('is-in'));
      document.querySelectorAll('[data-count]').forEach((e) => {
        e.textContent = new Intl.NumberFormat('de-DE').format(Number(e.dataset.count));
      });
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await Promise.all([...document.images].filter((i) => !i.complete)
        .map((i) => new Promise((r) => { i.onload = i.onerror = r; })));
    });
    await page.waitForTimeout(500);

    const slug = p.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home';
    await page.screenshot({
      path: `qa/shots/${vp.name}--${slug}.png`,
      fullPage: true,
    });

    // Horizontaler Ueberlauf?
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      if (de.scrollWidth <= de.clientWidth + 1) return null;
      return [...document.querySelectorAll('*')]
        .filter((el) => el.getBoundingClientRect().right > de.clientWidth + 1)
        .slice(0, 5)
        .map((el) => el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
    });
    if (overflow) problems.push(`[overflow ${vp.name} ${p}] ${overflow.join(', ')}`);
  }
  await ctx.close();
}

await browser.close();
await writeFile('qa/shots/problems.txt', problems.join('\n') || 'keine');
console.log(problems.length ? problems.join('\n') : 'Keine Konsolen-, HTTP- oder Overflow-Probleme.');

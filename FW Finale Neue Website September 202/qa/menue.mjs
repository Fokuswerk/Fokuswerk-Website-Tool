import { chromium } from 'playwright';
const BASIS = process.env.BASIS || 'http://localhost:4331';
const browser = await chromium.launch();

for (const [name, w, h] of [['desktop', 1440, 900], ['mobil', 390, 844]]) {
  const s = await browser.newPage({ viewport: { width: w, height: h } });
  await s.goto(BASIS + '/', { waitUntil: 'load' });
  await s.evaluate(() => document.fonts.ready).catch(() => {});
  await s.waitForTimeout(600);
  await s.evaluate(() => window.scrollTo(0, 1400));
  await s.waitForTimeout(400);
  await s.screenshot({ path: `qa/menue-${name}-zu.png` });
  await s.click('[data-schalter]');
  await s.waitForTimeout(1400);
  await s.screenshot({ path: `qa/menue-${name}-auf.png` });
  // Hover-Zustand eines Eintrags
  if (w > 700) {
    await s.hover('.menue-zeile:nth-child(2) .menue-link');
    await s.waitForTimeout(700);
    await s.screenshot({ path: `qa/menue-${name}-hover.png` });
  }
  await s.close();
}
await browser.close();
console.log('ok');

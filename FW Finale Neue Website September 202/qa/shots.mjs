import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'node:fs';

const BASIS = process.env.BASIS || 'http://localhost:4340';
const AUS = process.env.AUS || 'qa/shots';
const SEITEN = (process.env.SEITEN || '/').split(',');
const BREITE = Number(process.env.BREITE || 1440);
const HOEHE = Number(process.env.HOEHE || 900);

rmSync(AUS, { recursive: true, force: true });
mkdirSync(AUS, { recursive: true });

const browser = await chromium.launch();
const kontext = await browser.newContext({
  viewport: { width: BREITE, height: HOEHE },
  deviceScaleFactor: 1,
  isMobile: BREITE < 700,
  hasTouch: BREITE < 700,
});
const seite = await kontext.newPage();

for (const pfad of SEITEN) {
  const name = pfad.replace(/\//g, '_').replace(/^_|_$/g, '') || 'start';
  await seite.goto(BASIS + pfad, { waitUntil: 'networkidle' });
  await seite.evaluate(() => document.fonts.ready).catch(() => {});

  const gesamt = await seite.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < gesamt; y += Math.round(HOEHE * 0.6)) {
    await seite.evaluate((v) => window.scrollTo(0, v), y);
    await seite.waitForTimeout(160);
  }
  await seite.evaluate(() => window.scrollTo(0, 0));
  await seite.waitForTimeout(1400);

  const anzahl = Math.ceil(gesamt / HOEHE);
  for (let i = 0; i < anzahl; i++) {
    await seite.evaluate((v) => window.scrollTo(0, v), i * HOEHE);
    await seite.waitForTimeout(520);
    await seite.screenshot({ path: `${AUS}/${name}-${String(i + 1).padStart(2, '0')}.png` });
  }
  console.log(`${pfad}: ${anzahl} Bilder, ${gesamt}px`);
}

await browser.close();

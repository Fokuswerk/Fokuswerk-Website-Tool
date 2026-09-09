import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASIS = process.env.BASIS || 'http://localhost:4341';
const SEITEN = ['/', '/fallstudien/wav-westerstede', '/kontakt', '/impressum', '/datenschutz', '/danke'];

let fehler = 0;
const melde = (art, text) => {
  if (art === 'FEHLER') fehler++;
  console.log(`${art === 'FEHLER' ? '✗' : art === 'WARNUNG' ? '!' : '·'} ${text}`);
};

const browser = await chromium.launch();
const links = new Set();

for (const breite of [1440, 390]) {
  const kontext = await browser.newContext({ viewport: { width: breite, height: breite < 700 ? 844 : 900 } });
  const seite = await kontext.newPage();

  for (const pfad of SEITEN) {
    const antwort = await seite.goto(BASIS + pfad, { waitUntil: 'load' });
    if (!antwort || antwort.status() >= 400) { melde('FEHLER', `${pfad} liefert ${antwort?.status()}`); continue; }
    await seite.evaluate(() => document.fonts.ready).catch(() => {});
    await seite.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += Math.round(window.innerHeight * 0.7)) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await seite.waitForTimeout(1500);

    const ueberlauf = await seite.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (ueberlauf > 1) melde('FEHLER', `${breite}px ${pfad}: ${ueberlauf}px waagerechter Überlauf`);

    if (breite === 1440) {
      const ohneAlt = await seite.$$eval('img', (b) => b.filter((i) => !i.getAttribute('alt')).length);
      if (ohneAlt) melde('FEHLER', `${pfad}: ${ohneAlt} Bild(er) ohne alt`);

      const h1 = await seite.$$eval('h1', (e) => e.length);
      if (h1 !== 1) melde('FEHLER', `${pfad}: ${h1} h1-Elemente`);

      const meta = await seite.evaluate(() => ({
        titel: document.title,
        besch: document.querySelector('meta[name=description]')?.content || '',
        kanon: document.querySelector('link[rel=canonical]')?.href || '',
      }));
      if (!meta.besch) melde('WARNUNG', `${pfad}: keine Beschreibung`);
      if (meta.titel.length > 70) melde('WARNUNG', `${pfad}: Titel ${meta.titel.length} Zeichen`);
      if (!meta.kanon) melde('WARNUNG', `${pfad}: kein Canonical`);

      for (const href of await seite.$$eval('a[href]', (a) => a.map((x) => x.getAttribute('href')))) {
        if (href && href.startsWith('/')) links.add(href.split('#')[0]);
      }

      const erg = await new AxeBuilder({ page: seite })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      for (const v of erg.violations) {
        melde(v.impact === 'critical' || v.impact === 'serious' ? 'FEHLER' : 'WARNUNG',
          `${pfad}: ${v.id} (${v.impact}, ${v.nodes.length}×) — ${v.help}`);
      }
    }
  }
  await kontext.close();
}

const pk = await browser.newContext();
const pruef = await pk.newPage();
for (const l of [...links].sort()) {
  if (!l) continue;
  const a = await pruef.goto(BASIS + l, { waitUntil: 'commit' }).catch(() => null);
  if (!a || a.status() >= 400) melde('FEHLER', `Toter interner Link: ${l} (${a?.status()})`);
}
await pk.close();
await browser.close();

console.log(fehler ? `\n${fehler} Fehler.` : '\nKeine Fehler.');
process.exit(fehler ? 1 : 0);

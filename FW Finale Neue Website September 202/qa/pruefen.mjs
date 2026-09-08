import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const BASIS = process.env.BASIS || 'http://localhost:4331';
const SEITEN = [
  '/', '/leistung/', '/fallstudien/', '/fallstudien/wav-westerstede/',
  '/ueber-uns/', '/kontakt/', '/impressum/', '/datenschutz/', '/danke/',
];

let fehler = 0;
const melde = (art, text) => {
  if (art === 'FEHLER') fehler++;
  console.log(`${art === 'FEHLER' ? '✗' : art === 'WARNUNG' ? '!' : '·'} ${text}`);
};

const browser = await chromium.launch();
const gefundeneLinks = new Set();

for (const breite of [1440, 390]) {
  const kontext = await browser.newContext({ viewport: { width: breite, height: breite < 700 ? 844 : 900 } });
  const seite = await kontext.newPage();

  for (const pfad of SEITEN) {
    const antwort = await seite.goto(BASIS + pfad, { waitUntil: 'load' });
    if (!antwort || antwort.status() >= 400) { melde('FEHLER', `${pfad} liefert ${antwort?.status()}`); continue; }
    await seite.evaluate(() => document.fonts.ready).catch(() => {});
    // Einmal durchscrollen und zurück, damit alle Reveals abgeschlossen sind —
    // sonst misst axe Zwischenzustände der Einblendung.
    await seite.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += Math.round(window.innerHeight * 0.7)) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await seite.waitForTimeout(1400);

    // Waagerechtes Überlaufen
    const ueberlauf = await seite.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (ueberlauf > 1) melde('FEHLER', `${breite}px ${pfad}: ${ueberlauf}px waagerechter Überlauf`);

    // Zu kleine Tap-Ziele auf Mobil
    if (breite < 700) {
      const klein = await seite.evaluate(() =>
        [...document.querySelectorAll('a[href], button')]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && (r.height < 40 || r.width < 24) && !e.closest('.rt-text, .fliess, p');
          })
          .map((e) => (e.textContent || '').trim().slice(0, 34) + ` [${Math.round(e.getBoundingClientRect().height)}px]`));
      if (klein.length) melde('WARNUNG', `${pfad}: kleine Tap-Ziele — ${klein.join(' | ')}`);
    }

    if (breite === 1440) {
      // Bilder ohne Alternativtext
      const ohneAlt = await seite.$$eval('img', (bs) => bs.filter((b) => !b.getAttribute('alt')).length);
      if (ohneAlt) melde('FEHLER', `${pfad}: ${ohneAlt} Bild(er) ohne alt`);

      // Überschriftenhierarchie
      const h = await seite.$$eval('h1,h2,h3,h4', (es) => es.map((e) => Number(e.tagName[1])));
      const h1 = h.filter((n) => n === 1).length;
      if (h1 !== 1) melde('FEHLER', `${pfad}: ${h1} h1-Elemente`);
      for (let i = 1; i < h.length; i++) {
        if (h[i] - h[i - 1] > 1) { melde('WARNUNG', `${pfad}: Überschriftensprung h${h[i - 1]} auf h${h[i]}`); break; }
      }

      // Titel und Beschreibung
      const meta = await seite.evaluate(() => ({
        titel: document.title,
        besch: document.querySelector('meta[name=description]')?.content || '',
        kanon: document.querySelector('link[rel=canonical]')?.href || '',
      }));
      if (meta.titel.length > 65) melde('WARNUNG', `${pfad}: Titel ${meta.titel.length} Zeichen`);
      if (!meta.besch) melde('FEHLER', `${pfad}: keine Beschreibung`);
      else if (meta.besch.length > 175) melde('WARNUNG', `${pfad}: Beschreibung ${meta.besch.length} Zeichen`);
      if (!meta.kanon) melde('FEHLER', `${pfad}: kein Canonical`);

      // Interne Links einsammeln
      for (const href of await seite.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))) {
        if (href && href.startsWith('/')) gefundeneLinks.add(href.split('#')[0]);
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
  await seite.close();
  await kontext.close();
}

// Alle intern verlinkten Ziele erreichbar?
const pruefKontext = await browser.newContext();
const pruef = await pruefKontext.newPage();
for (const l of [...gefundeneLinks].sort()) {
  const a = await pruef.goto(BASIS + l, { waitUntil: 'commit' }).catch(() => null);
  if (!a || a.status() >= 400) melde('FEHLER', `Toter interner Link: ${l} (${a?.status()})`);
}
await pruef.close();
await pruefKontext.close();
await browser.close();

// Auslieferungsgewicht
const dist = 'dist';
let js = 0, css = 0;
const lauf = (d) => {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) lauf(p);
    else if (e.endsWith('.js')) js += statSync(p).size;
    else if (e.endsWith('.css')) css += statSync(p).size;
  }
};
lauf(dist);
melde('INFO', `Gewicht: ${(js / 1024).toFixed(1)} kB JavaScript, ${(css / 1024).toFixed(1)} kB CSS`);
const html = statSync(join(dist, 'index.html')).size;
melde('INFO', `Startseite HTML: ${(html / 1024).toFixed(1)} kB`);

console.log(fehler ? `\n${fehler} Fehler.` : '\nKeine Fehler.');
process.exit(fehler ? 1 : 0);

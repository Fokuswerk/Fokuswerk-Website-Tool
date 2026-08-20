/**
 * Mobile Navigation: Panelgröße, Scrollsperre, Fokus, Schließwege.
 * Aufruf:  BASE=http://localhost:4322 node qa/nav-mobil.mjs
 *
 * Wichtig: Der Menüknopf wird per dispatchEvent ausgelöst, nicht über
 * page.click(). Playwright scrollt vor einem Klick zur Sichtbarkeitsprüfung
 * die Seite — das würde die gemerkte Scrollposition verfälschen und einen
 * Fehler vortäuschen, den es im Browser nicht gibt.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4322';
const fails = [], oks = [];
const check = (c, l) => (c ? oks : fails).push(l);
const tippe = (p, sel) => p.evaluate((s) => document.querySelector(s).dispatchEvent(new MouseEvent('click', { bubbles: true })), sel);

const b = await chromium.launch();

for (const w of [320, 390, 768]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true, locale: 'de-DE' });
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.evaluate(() => window.scrollTo(0, 1400));
  await p.waitForTimeout(200);

  await tippe(p, '[data-menu-toggle]');
  await p.waitForTimeout(420);

  const auf = await p.evaluate(() => {
    const m = document.querySelector('[data-mobile-menu]');
    const r = m.getBoundingClientRect();
    const kopf = document.querySelector('.site-header').getBoundingClientRect();
    return {
      hoehe: Math.round(r.height), unten: Math.round(r.bottom), vh: window.innerHeight,
      deckt: Math.round(r.bottom) >= window.innerHeight - 1,
      unterKopf: Math.round(r.top) >= Math.round(kopf.bottom) - 1,
      gesperrt: document.documentElement.classList.contains('menue-offen'),
      bodyTop: document.body.style.top,
      fokusImPanel: m.contains(document.activeElement),
      kopfSichtbar: kopf.top >= -1 && kopf.bottom > 0,
      deckung: Math.round(r.height) >= m.scrollHeight - 1 || m.scrollHeight > r.height,
    };
  });

  check(auf.deckt, `${w}px: Menü reicht bis zum unteren Rand (${auf.hoehe}px hoch)`);
  check(auf.unterKopf, `${w}px: Menü beginnt unter der Kopfzeile`);
  check(auf.gesperrt, `${w}px: Scrollsperre aktiv`);
  check(auf.bodyTop === '-1400px', `${w}px: Scrollposition gemerkt (${auf.bodyTop})`);
  check(auf.fokusImPanel, `${w}px: Fokus springt ins Menü`);
  check(auf.kopfSichtbar, `${w}px: Kopfzeile bleibt sichtbar`);

  // Hintergrund darf sich nicht bewegen
  await p.mouse.wheel(0, 800);
  await p.waitForTimeout(200);
  check(await p.evaluate(() => document.body.style.top) === '-1400px', `${w}px: Hintergrund scrollt nicht mit`);

  // Escape schließt und stellt die Position wieder her
  await p.keyboard.press('Escape');
  await p.waitForTimeout(420);
  const zu = await p.evaluate(() => ({
    versteckt: document.querySelector('[data-mobile-menu]').hidden,
    gesperrt: document.documentElement.classList.contains('menue-offen'),
    scrollY: Math.round(window.scrollY),
    fokus: document.activeElement?.className || '',
  }));
  check(zu.versteckt, `${w}px: Escape schließt das Menü`);
  check(!zu.gesperrt, `${w}px: Sperre wieder aufgehoben`);
  check(zu.scrollY === 1400, `${w}px: Scrollposition wiederhergestellt (${zu.scrollY})`);
  check(zu.fokus.includes('menu-toggle'), `${w}px: Fokus zurück auf dem Knopf`);

  // Klick auf einen Menülink schließt ebenfalls
  await tippe(p, '[data-menu-toggle]');
  await p.waitForTimeout(300);
  await tippe(p, '[data-mobile-menu] a[href="/referenzen/"]');
  await p.waitForTimeout(300);
  check(await p.evaluate(() => !document.documentElement.classList.contains('menue-offen')),
        `${w}px: Sperre gelöst nach Klick auf einen Menüpunkt`);
  await p.close();
}

await b.close();
console.log('BESTANDEN (' + oks.length + ')');
oks.forEach((o) => console.log('  ✓ ' + o));
if (fails.length) {
  console.log('\nFEHLGESCHLAGEN (' + fails.length + ')');
  fails.forEach((f) => console.log('  ✗ ' + f));
  process.exitCode = 1;
}

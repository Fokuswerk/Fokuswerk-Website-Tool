/**
 * Prüfung auf Barrierefreiheit.
 *
 * Aufruf gegen einen laufenden Server:
 *   B=http://localhost:3000 node qa/a11y.mjs
 *
 * Deckt ab: axe (WCAG 2.0/2.1/2.2 A und AA) auf allen Seiten in zwei
 * Bildschirmbreiten, Tastaturbedienung, sichtbarer Fokus, Dauerbewegung,
 * Vergrößerung, erhöhte Textabstände und das Verhalten des Mobilmenüs.
 *
 * Braucht playwright und @axe-core/playwright als Entwicklungsabhängigkeit.
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const B = process.env.B || 'http://localhost:3000';
const SEITEN = [
  '/', '/ueber-uns', '/aktuelles', '/aktuelles/wunschbaum-am-meer-2025',
  '/galerie', '/unterstuetzen', '/kontakt', '/impressum', '/datenschutz', '/gibtsnicht',
];

const befunde = [];
const browser = await chromium.launch();

// ---------------------------------------------------------- axe je Seite ----
for (const breite of [1440, 402]) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 900 } });
  const page = await ctx.newPage();
  for (const pfad of SEITEN) {
    await page.goto(B + pfad, { waitUntil: 'load' });
    // Die Überschriften laufen Wort für Wort ein. Erst den Endzustand messen –
    // vorher wären die noch unsichtbaren Wörter zu Recht "kontrastarm".
    await page.waitForTimeout(2600);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    for (const v of violations) {
      for (const n of v.nodes.slice(0, 3)) {
        const grund = (n.failureSummary || '').replace(/\s+/g, ' ').slice(0, 150);
        befunde.push(`${breite}px ${pfad}: [${v.impact}] ${v.id} – ${n.target.join(' ')}
      ${grund}`);
      }
    }
  }
  await ctx.close();
}

// --------------------------------------------- Tastatur und Zustände --------
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(B + '/', { waitUntil: 'load' });
await page.waitForTimeout(600);

// Sprungmarke als erstes Tabziel
await page.keyboard.press('Tab');
const erstes = await page.evaluate(() => {
  const a = document.activeElement;
  const s = getComputedStyle(a);
  return { text: a.textContent?.trim().slice(0, 40), sichtbar: s.position !== 'absolute' || a.getBoundingClientRect().left > -100, umriss: s.outlineStyle, umrissBreite: s.outlineWidth };
});
if (!erstes.text?.includes('Inhalt')) befunde.push(`Tastatur: erstes Ziel ist "${erstes.text}", erwartet die Sprungmarke`);
if (erstes.umriss === 'none') befunde.push('Tastatur: Sprungmarke zeigt keinen sichtbaren Fokus');

// Fokus auf allen Bedienelementen sichtbar?
const ohneFokus = await page.evaluate(() => {
  const treffer = [];
  for (const el of document.querySelectorAll('a[href], button, input, select, textarea')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    el.focus();
    const s = getComputedStyle(el);
    const hat = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
    if (!hat) treffer.push(el.textContent?.trim().slice(0, 30) || el.tagName);
  }
  return treffer.slice(0, 6);
});
if (ohneFokus.length) befunde.push(`Fokus unsichtbar bei: ${ohneFokus.join(' | ')}`);

// Dauerbewegung ohne Stoppmöglichkeit (WCAG 2.2.2)
const dauerbewegung = await page.evaluate(() =>
  [...document.querySelectorAll('*')]
    .filter((el) => {
      const s = getComputedStyle(el);
      return s.animationName !== 'none' && s.animationIterationCount === 'infinite' &&
        parseFloat(s.animationDuration) > 0;
    })
    .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${getComputedStyle(el).animationName}`)
    .slice(0, 5),
);
if (dauerbewegung.length) befunde.push(`Dauerbewegung ohne Stopp (WCAG 2.2.2): ${dauerbewegung.join(' | ')}`);

// Zoom 200 % – kein waagerechtes Scrollen (WCAG 1.4.10)
for (const [b, h] of [[640, 512], [1280, 1024]]) {
  const z = await ctx.newPage();
  await z.setViewportSize({ width: b, height: h });
  await z.goto(B + '/', { waitUntil: 'load' });
  await z.waitForTimeout(500);
  const ueber = await z.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (ueber > 1) befunde.push(`Zoom-Ersatz ${b}x${h}: ${ueber}px waagerechter Überlauf (WCAG 1.4.10)`);
  await z.close();
}

// Textabstände erhöhen (WCAG 1.4.12)
const abstand = await ctx.newPage();
await abstand.goto(B + '/', { waitUntil: 'load' });
await abstand.addStyleTag({
  content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
    word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`,
});
await abstand.waitForTimeout(500);
const abschnitt = await abstand.evaluate(() => {
  const d = document.documentElement;
  return { ueber: d.scrollWidth - d.clientWidth };
});
if (abschnitt.ueber > 1) befunde.push(`Textabstände (WCAG 1.4.12): ${abschnitt.ueber}px Überlauf`);
await abstand.close();

// Mobilmenü: Escape, aria-expanded, Fokus
const m = await browser.newContext({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true });
const mp = await m.newPage();
await mp.goto(B + '/', { waitUntil: 'load' });
await mp.waitForTimeout(600);
const schalter = mp.getByRole('button', { name: /Menü/i });
await schalter.click();
await mp.waitForTimeout(500);
const zustand = await mp.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => /Menü/i.test(x.textContent || '') || x.getAttribute('aria-controls'));
  return { expanded: b?.getAttribute('aria-expanded'), controls: b?.getAttribute('aria-controls') };
});
if (zustand.expanded !== 'true') befunde.push(`Mobilmenü: aria-expanded ist "${zustand.expanded}", erwartet "true"`);
if (!zustand.controls) befunde.push('Mobilmenü: aria-controls fehlt');
await mp.keyboard.press('Escape');
await mp.waitForTimeout(400);
const nachEscape = await mp.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-controls'));
  return b?.getAttribute('aria-expanded');
});
if (nachEscape !== 'false') befunde.push(`Mobilmenü: schließt nicht mit Escape (aria-expanded = ${nachEscape})`);
await m.close();

await ctx.close();
await browser.close();

console.log(befunde.length ? 'Befunde:\n' + befunde.map((b) => ' • ' + b).join('\n') : 'Keine Befunde.');

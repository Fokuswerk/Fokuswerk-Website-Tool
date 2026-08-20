/**
 * Mobilpruefung: Ueberlauf, Tippziele, Schriftgroessen, Randabstaende.
 * Aufruf:  BASE=http://localhost:4322 node qa/mobile.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4322';
const pages = ['/', '/leistungen/', '/leistungen/schadstoffsanierung/', '/leistungen/rueckbau-entkernung/',
  '/leistungen/beton-bohren-saegen/', '/leistungen/entsorgung-container/', '/referenzen/',
  '/referenzen/rathaus-dietzenbach-2010/', '/unternehmen/', '/karriere/', '/karriere/danke/',
  '/kontakt/', '/kontakt/danke/', '/impressum/', '/datenschutz/',
  '/demo/', '/demo/anfragen/', '/demo/anfragen/A-2026-0147/', '/demo/bewerbungen/', '/demo/inhalte/'];

const geraete = [
  { n: 'iPhone SE  320', w: 320, h: 568 },
  { n: 'iPhone 12  390', w: 390, h: 844 },
  { n: 'Tablet      768', w: 768, h: 1024 },
];

const b = await chromium.launch();
const befunde = [];

for (const g of geraete) {
  const ctx = await b.newContext({
    viewport: { width: g.w, height: g.h },
    // Auch das Tablet ist ein Beruehrungsgeraet — sonst greifen die
    // pointer:coarse-Regeln in der Pruefung nicht.
    isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'de-DE',
  });
  const p = await ctx.newPage();

  for (const path of pages) {
    await p.goto(BASE + path, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.querySelectorAll('[data-rise]').forEach((e) => e.classList.add('is-in')));

    // Das Menue oeffnen: seine Eintraege sind sonst nie in der Messung, weil
    // sie im geschlossenen Zustand display:none haben.
    await p.evaluate(() => {
      const t = document.querySelector('[data-menu-toggle]');
      if (t && getComputedStyle(t).display !== 'none') t.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await p.waitForTimeout(320);

    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const out = { overflow: null, klein: [], eng: [], winzig: [] };

      // Scrollt die Seite seitlich?
      if (de.scrollWidth > de.clientWidth + 1) {
        out.overflow = [...document.querySelectorAll('*')]
          .filter((el) => {
            const rc = el.getBoundingClientRect();
            if (rc.right <= de.clientWidth + 1 && rc.left >= -1) return false;
            let par = el.parentElement;
            while (par) {
              const ov = getComputedStyle(par).overflowX;
              if (ov === 'auto' || ov === 'scroll' || ov === 'hidden') return false;
              par = par.parentElement;
            }
            return true;
          })
          .slice(0, 4)
          .map((el) => el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]);
      }

      // Tippziele unter 44px
      const seen = new Set();
      for (const el of document.querySelectorAll('a, button, input, select, summary, [role="button"]')) {
        const rc = el.getBoundingClientRect();
        if (rc.width === 0 || rc.height === 0) continue;
        if (getComputedStyle(el).display === 'none') continue;
        if (rc.height >= 44 && rc.width >= 44) continue;

        // Ausnahme 1 (WCAG 2.5.8): Link steht mitten in einem Textabsatz.
        const p = el.closest('p, li, dd, td');
        if (p && el.tagName === 'A' && p.textContent.trim().length > el.textContent.trim().length + 12) continue;

        // Ausnahme 2: Das Bedienelement steckt in seiner eigenen Beschriftung —
        // getippt wird das Label, und das ist gross genug.
        const lab = el.closest('label');
        if (lab && lab !== el) {
          const lr = lab.getBoundingClientRect();
          if (lr.height >= 44 || lr.width >= 44) continue;
        }

        // Ausnahme 3: Ein Elternteil legt per ::after eine Klickflaeche darueber.
        const row = el.closest('[class*="__item"], tr');
        if (row && getComputedStyle(row).position === 'relative' && row.getBoundingClientRect().height >= 44) continue;

        const key = el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0];
        if (seen.has(key)) continue;
        seen.add(key);
        out.klein.push(`${key} ${Math.round(rc.width)}x${Math.round(rc.height)}`);
      }

      // Fliesstext unter 14px
      const t = new Set();
      for (const el of document.querySelectorAll('p, li, dd, td, span')) {
        if (!el.textContent.trim() || el.children.length) continue;
        const cs = getComputedStyle(el);
        const fs = parseFloat(cs.fontSize);
        // Mono-Auszeichnungen sind bewusst klein gesetzt (Positionsnummern,
        // Registerlabels). Sie werden ab 12 px akzeptiert, Fliesstext ab 13,5 px.
        const istLabel = /mono/i.test(cs.fontFamily) || cs.textTransform === 'uppercase';
        if (fs >= (istLabel ? 12 : 13.5)) continue;
        const key = el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0] + ' ' + fs.toFixed(1) + 'px';
        if (!t.has(key)) { t.add(key); out.winzig.push(key); }
      }
      return out;
    });

    const tag = `${g.n} ${path}`;
    if (r.overflow) befunde.push(`[UEBERLAUF] ${tag} → ${r.overflow.join(', ')}`);
    for (const k of r.klein.slice(0, 5)) befunde.push(`[TIPPZIEL]  ${tag} → ${k}`);
    for (const w of r.winzig.slice(0, 4)) befunde.push(`[SCHRIFT]   ${tag} → ${w}`);
  }
  await ctx.close();
}
await b.close();
console.log(befunde.length ? befunde.join('\n') : 'Keine Befunde.');
console.log('\n' + befunde.length + ' Befunde');

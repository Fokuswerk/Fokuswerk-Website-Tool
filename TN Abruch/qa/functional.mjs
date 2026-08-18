/** Funktionsprüfung: Navigation, Menü, Filter, Formular, Links, Fokus. */
import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const fails = [], oks = [];
const check = (cond, label) => (cond ? oks : fails).push(label);

const b = await chromium.launch();

// --- Mobiles Menü ---
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await p.goto(BASE + '/');
  await p.click('[data-menu-toggle]');
  check(await p.isVisible('[data-mobile-menu]'), 'Mobiles Menü öffnet');
  check(await p.getAttribute('[data-menu-toggle]', 'aria-expanded') === 'true', 'aria-expanded=true nach Öffnen');
  check((await p.textContent('.menu-toggle__text'))?.includes('Schließen'), 'Beschriftung wechselt auf "Schließen"');
  await p.keyboard.press('Escape');
  check(!(await p.isVisible('[data-mobile-menu]')), 'Escape schließt das Menü');
  await p.click('[data-menu-toggle]');
  await p.click('[data-mobile-menu] a[href="/referenzen/"]');
  await p.waitForURL('**/referenzen/');
  check(p.url().endsWith('/referenzen/'), 'Navigation aus dem mobilen Menü');
  check(!(await p.isVisible('[data-mobile-menu]')), 'Menü schließt nach Klick');
  // Aktionsleiste
  await p.evaluate(() => window.scrollTo(0, 1200));
  await p.waitForTimeout(500);
  check(await p.locator('.actionbar.is-visible').count() === 1, 'Aktionsleiste erscheint nach Scrollen');
  await p.close();
}

// --- Untermenü Desktop ---
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + '/');
  check(!(await p.isVisible('#nav-leistungen')), 'Untermenü initial geschlossen');
  await p.click('[data-submenu-trigger]');
  check(await p.isVisible('#nav-leistungen'), 'Untermenü öffnet per Klick');
  await p.keyboard.press('Escape');
  check(!(await p.isVisible('#nav-leistungen')), 'Escape schließt Untermenü');
  await p.close();
}

// --- Referenzfilter ---
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + '/referenzen/');
  const total = await p.locator('[data-ref-list] > li').count();
  await p.click('[data-filter="beton"]');
  const visible = await p.locator('[data-ref-list] > li:not([hidden])').count();
  check(visible === 1 && total === 20, `Filter Beton zeigt 1 von 20 (ist: ${visible}/${total})`);
  check(p.url().includes('filter=beton'), 'Filter landet in der URL');
  await p.goto(BASE + '/referenzen/?filter=schadstoff');
  await p.waitForTimeout(200);
  const s = await p.locator('[data-ref-list] > li:not([hidden])').count();
  check(s === 7, `Filter aus der URL angewendet (ist: ${s})`);
  await p.close();
}

// --- Formularassistent ---
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + '/kontakt/?leistung=Schadstoffsanierung');
  check(await p.isChecked('input[value="Schadstoffsanierung"]'), 'Leistung aus der URL vorbelegt');
  check(await p.isVisible('[data-step="1"]') && !(await p.isVisible('[data-step="2"]')), 'Nur Schritt 1 sichtbar');
  const tap = async (sel) => { const l = p.locator(sel); await l.scrollIntoViewIfNeeded(); await l.click(); await p.waitForTimeout(150); };
  await tap('[data-step="1"] [data-next]');
  check(await p.isVisible('[data-step="2"]'), 'Weiter zu Schritt 2');
  await tap('[data-step="2"] [data-next]');
  check(await p.isVisible('[data-step="3"]'), 'Weiter zu Schritt 3');
  await tap('[data-step="3"] [data-prev]');
  check(await p.isVisible('[data-step="2"]'), 'Zurück funktioniert');
  await tap('[data-step="2"] [data-next]');
  await tap('button[type="submit"]');
  await p.waitForTimeout(300);
  check(await p.isVisible('#err-name'), 'Pflichtfeldfehler Name');
  check(await p.isVisible('#err-consent'), 'Pflichtfeldfehler Einwilligung');
  await p.fill('#name', 'Testperson');
  await p.waitForTimeout(250);
  await p.locator('input[name="einwilligung"]').scrollIntoViewIfNeeded();
  await p.locator('input[name="einwilligung"]').check();
  check(await p.isChecked('input[name="einwilligung"]'), 'Einwilligung anhakbar');
  await tap('button[type="submit"]');
  check(await p.isVisible('#err-kontakt'), 'Fehler: weder Telefon noch E-Mail');
  await p.fill('#email', 'kaputt@');
  await tap('button[type="submit"]');
  check(await p.isVisible('#err-kontakt'), 'Ungültige E-Mail wird abgefangen');
  await p.close();
}

// --- Alle internen Links ---
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const pages = ['/', '/leistungen/', '/leistungen/schadstoffsanierung/', '/leistungen/rueckbau-entkernung/',
    '/leistungen/beton-bohren-saegen/', '/leistungen/entsorgung-container/', '/referenzen/',
    '/unternehmen/', '/karriere/', '/kontakt/', '/kontakt/danke/', '/impressum/', '/datenschutz/'];
  const seen = new Set();
  for (const path of pages) {
    await p.goto(BASE + path);
    const hrefs = await p.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
    for (const h of hrefs) {
      if (!h || h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('http')) continue;
      seen.add(h.split('?')[0]);
    }
  }
  for (const h of seen) {
    const r = await p.request.get(BASE + h);
    check(r.status() === 200, `Link ${h} → ${r.status()}`);
  }
  await p.close();
}

// --- Tastaturfokus ---
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + '/');
  await p.keyboard.press('Tab');
  check(await p.evaluate(() => document.activeElement?.classList.contains('skip-link')), 'Erster Tab trifft den Sprunglink');
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

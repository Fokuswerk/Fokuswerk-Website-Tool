import { chromium } from 'playwright';
const BASE = 'http://localhost:4322';
const fails = [], oks = [];
const check = (c, l) => (c ? oks : fails).push(l);
const b = await chromium.launch();

// --- prefers-reduced-motion ---
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(BASE + '/');
  await p.waitForTimeout(400);
  const st = await p.evaluate(() => {
    const el = document.querySelector('[data-rise]');
    const cs = getComputedStyle(el);
    const counter = document.querySelector('[data-count]');
    return { op: cs.opacity, tr: cs.transitionDuration, counter: counter?.textContent?.trim() };
  });
  check(st.op === '1', `Einlauf-Elemente sofort sichtbar bei reduced-motion (opacity ${st.op})`);
  check(parseFloat(st.tr) < 0.02, `Übergänge deaktiviert (${st.tr})`);
  check(/^\d/.test(st.counter ?? ''), `Zähler zeigt den Endwert (${st.counter})`);
  await ctx.close();
}

// --- Strukturierte Daten ---
{
  const p = await b.newPage();
  for (const path of ['/', '/referenzen/', '/karriere/', '/leistungen/schadstoffsanierung/']) {
    await p.goto(BASE + path);
    const blocks = await p.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent));
    let ok = blocks.length > 0;
    const types = [];
    for (const raw of blocks) {
      try {
        const j = JSON.parse(raw);
        const arr = j['@graph'] ?? (Array.isArray(j) ? j : [j]);
        arr.forEach((n) => types.push(n['@type']));
      } catch { ok = false; }
    }
    check(ok, `JSON-LD gültig auf ${path} → ${types.join(', ')}`);
  }
  await p.close();
}

// --- Meta, Canonical, Sprache ---
{
  const p = await b.newPage();
  for (const path of ['/', '/leistungen/', '/referenzen/', '/unternehmen/', '/karriere/', '/kontakt/']) {
    await p.goto(BASE + path);
    const m = await p.evaluate(() => ({
      lang: document.documentElement.lang,
      title: document.title,
      desc: document.querySelector('meta[name=description]')?.content ?? '',
      canon: document.querySelector('link[rel=canonical]')?.href ?? '',
      og: document.querySelector('meta[property="og:image"]')?.content ?? '',
      h1: document.querySelectorAll('h1').length,
    }));
    check(m.lang === 'de', `lang=de auf ${path}`);
    check(m.title.length > 20 && m.title.length <= 70, `Title-Länge ${m.title.length} auf ${path}`);
    check(m.desc.length > 80 && m.desc.length <= 200, `Description-Länge ${m.desc.length} auf ${path}`);
    check(m.canon.startsWith('https://www.tn-abbruch.de'), `Canonical gesetzt auf ${path}`);
    check(m.og.endsWith('/og.jpg'), `OG-Bild auf ${path}`);
    check(m.h1 === 1, `Genau ein h1 auf ${path} (${m.h1})`);
  }
  await p.close();
}

// --- Alt-Texte und Überschriftenhierarchie ---
{
  const p = await b.newPage();
  for (const path of ['/', '/leistungen/schadstoffsanierung/', '/unternehmen/']) {
    await p.goto(BASE + path);
    const r = await p.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')];
      const missing = imgs.filter((i) => !i.hasAttribute('alt')).length;
      const empty = imgs.filter((i) => i.getAttribute('alt') === '').length;
      const hs = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => +h.tagName[1]);
      let jumps = 0;
      for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) jumps++;
      return { count: imgs.length, missing, empty, jumps };
    });
    check(r.missing === 0, `Alle ${r.count} Bilder mit alt auf ${path} (${r.empty} bewusst leer)`);
    check(r.jumps === 0, `Keine Überschriftensprünge auf ${path} (${r.jumps})`);
  }
  await p.close();
}

// --- Touch-Ziele auf Mobil ---
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  for (const path of ['/', '/referenzen/', '/kontakt/', '/karriere/']) {
    await p.goto(BASE + path);
    const small = await p.evaluate(() => {
      const sel = 'a[href], button, input:not([type=hidden]), select, textarea, summary';
      return [...document.querySelectorAll(sel)]
        .filter((e) => e.offsetParent !== null)
        // Inline-Links im Fliesstext sind nach WCAG 2.5.5 ausgenommen
        .filter((e) => !(e.tagName === 'A' && e.closest('p, li, .prose, address, figcaption, .field__hint, .aside__privacy, .site-footer__proof, .site-footer__note, .loc__note, .form__fallback, .honest__facts, .consent')))
        // Bei Checkboxen und Radios zaehlt das umschliessende Label als Trefferflaeche
        .map((e) => {
          const t = (e.type === 'checkbox' || e.type === 'radio') ? (e.closest('label') ?? e) : e;
          return { t: t.tagName + '.' + String(t.className).split(' ')[0], r: t.getBoundingClientRect() };
        })
        .filter((x) => x.r.width > 0 && (x.r.height < 40 || x.r.width < 24))
        .map((x) => `${x.t} ${Math.round(x.r.width)}x${Math.round(x.r.height)}`);
    });
    check(small.length === 0, `Touch-Ziele >= 40px hoch auf ${path}${small.length ? ' — ' + small.slice(0, 6).join(', ') : ''}`);
  }
  await ctx.close();
}

await b.close();
console.log('BESTANDEN (' + oks.length + ')');
oks.forEach((o) => console.log('  ✓ ' + o));
if (fails.length) { console.log('\nFEHLGESCHLAGEN (' + fails.length + ')'); fails.forEach((f) => console.log('  ✗ ' + f)); process.exitCode = 1; }

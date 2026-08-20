import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const BASE = 'http://localhost:4321';
const pages = ['/', '/leistungen/', '/leistungen/schadstoffsanierung/', '/referenzen/',
  '/referenzen/markt-oldenburg-2020/', '/referenzen/rathaus-dietzenbach-2010/',
  '/unternehmen/', '/karriere/', '/karriere/danke/', '/kontakt/', '/kontakt/danke/',
  '/impressum/', '/datenschutz/', '/404',
  // Demo-Backend: gehört nicht zur Website, muss aber bedienbar bleiben
  '/demo/', '/demo/anfragen/', '/demo/anfragen/A-2026-0147/', '/demo/bewerbungen/', '/demo/inhalte/'];
const b = await chromium.launch();
let total = 0;
for (const vp of [{ n: 'desktop', w: 1440, h: 900 }, { n: 'mobile', w: 390, h: 844 }]) {
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, locale: 'de-DE' });
  const p = await ctx.newPage();
  for (const path of pages) {
    await p.goto(BASE + path, { waitUntil: 'networkidle' });
    // Einlaufanimation abschalten, sonst misst axe Farben mitten im Übergang
    await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    await p.evaluate(() => document.querySelectorAll('[data-rise]').forEach((e) => e.classList.add('is-in')));
    await p.waitForTimeout(150);
    const r = await new AxeBuilder({ page: p })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();
    if (r.violations.length) {
      total += r.violations.length;
      console.log(`\n${vp.n} ${path}`);
      for (const v of r.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
        v.nodes.slice(0, 3).forEach((n) => console.log(`      ${n.target.join(' ')}`));
        if (v.nodes[0]?.any?.[0]?.message) console.log(`      → ${v.nodes[0].any[0].message}`);
      }
    }
  }
  await ctx.close();
}
await b.close();
console.log(total ? `\n${total} Verstöße insgesamt` : '\nKeine Accessibility-Verstöße gefunden.');

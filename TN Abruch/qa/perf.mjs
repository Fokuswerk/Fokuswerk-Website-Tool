/** Gewicht und Ladeverhalten je Seite messen (Produktions-Build via preview). */
import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:4322';
const pages = ['/', '/leistungen/schadstoffsanierung/', '/referenzen/', '/kontakt/', '/unternehmen/'];
const b = await chromium.launch();
for (const path of pages) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const bytes = {}; let total = 0, requests = 0, third = 0;
  p.on('response', async (r) => {
    requests++;
    try {
      const u = new URL(r.url());
      if (!u.hostname.includes('localhost')) third++;
      const len = Number((await r.allHeaders())['content-length'] ?? 0);
      const type = (r.request().resourceType());
      bytes[type] = (bytes[type] ?? 0) + len; total += len;
    } catch {}
  });
  await p.goto(BASE + path, { waitUntil: 'load' });
  const m = await p.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    return { dcl: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), fcp: fcp ? Math.round(fcp.startTime) : null,
      dom: document.querySelectorAll('*').length };
  });
  const cls = await p.evaluate(() => new Promise((res) => {
    let v = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) v += e.value; })).observe({ type: 'layout-shift', buffered: true });
    setTimeout(() => res(Math.round(v * 1000) / 1000), 800);
  }));
  console.log(`${path.padEnd(36)} ${String(Math.round(total/1024)+' KB').padStart(8)}  ${String(requests).padStart(3)} req  ${String(third).padStart(2)} extern  FCP ${String(m.fcp).padStart(4)}ms  Load ${String(m.load).padStart(4)}ms  CLS ${cls}  DOM ${m.dom}`);
  await ctx.close();
}
await b.close();

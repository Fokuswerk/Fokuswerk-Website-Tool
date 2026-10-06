import asyncio, time
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/Users/thees/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell')
        ctx = await b.new_context(viewport={"width":1440,"height":900})
        page = await ctx.new_page()
        await page.route("**/*.{png,jpg,jpeg,webp,avif,mp4,svg}", lambda r: r.abort())
        errs=[]; page.on("pageerror", lambda e: errs.append(str(e)[:200]))
        t0=time.time()
        await page.goto("https://frank-site-485713.framer.app/?pt="+str(int(t0)), wait_until="domcontentloaded")
        async def probe(label):
            d = await page.evaluate("""() => ({ vorspann: !!document.querySelector('[data-vorspann="an"]'), ende: !!window.__vorspannEnde, overflow: document.documentElement.style.overflow, zeile1: (()=>{const e=document.querySelector('[data-framer-name="Zeile 1"]'); return e? getComputedStyle(e).opacity:'-'})(), klammer: (()=>{const c=document.querySelector('[data-framer-name="Fokusklammer"]'); const s=c&&c.querySelector('span'); return s? getComputedStyle(s.parentElement).opacity : '-'})(), nav: (()=>{const i=document.querySelector('[data-framer-name="Navigation"] [data-framer-name="Logo"] img'); return i? (i.getAttribute('src')||'').slice(40,52):'-'})() })""")
            print(f"{time.time()-t0:5.1f}s {label} {d}")
        for s in [0.3,1.0,2.0,3.0,4.5,6.5]:
            await asyncio.sleep(max(0, s-(time.time()-t0))); await probe(f"t{s}")
        await page.screenshot(path="vorspann_nach.png")
        # Screenshot mid-animation on second visit (short version)
        await page.goto("https://frank-site-485713.framer.app/kontakt", wait_until="domcontentloaded"); await asyncio.sleep(0.5)
        await page.screenshot(path="vorspann_mitte.png")
        print("errors", errs[:5])
        await b.close()
asyncio.run(main())

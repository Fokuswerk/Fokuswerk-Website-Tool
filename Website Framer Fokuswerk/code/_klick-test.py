import asyncio, time, glob
from playwright.async_api import async_playwright
EXE=glob.glob('/Users/thees/Library/Caches/ms-playwright/chromium_headless_shell-1243/*/chrome-headless-shell')[0]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE)
        page = await (await b.new_context(viewport={"width":1440,"height":900}, device_scale_factor=2)).new_page()
        await page.route("**/*.{jpg,jpeg,webp,avif,mp4}", lambda r: r.abort())
        await page.goto("https://frank-site-485713.framer.app/?kl="+str(time.time()), wait_until="domcontentloaded")
        await asyncio.sleep(8)
        oben = await page.evaluate("""() => { const e=document.elementFromPoint(1350,55); return (e.closest('[data-framer-name]')||e).dataset.framerName + ' / ' + (e.closest('[data-framer-name="Vorspann"]')?'VORSPANN':'frei') }""")
        spans = await page.evaluate("""() => [...document.querySelectorAll('[data-framer-name="Fokusklammer"] span')].map(s=>s.textContent).filter(Boolean)""")
        print('oben:', oben, '| etikett:', spans)
        box = await page.evaluate("""() => { const c=document.querySelector('[data-framer-name="Claim"]').getBoundingClientRect(); return [c.left,c.top,c.width,c.height] }""")
        x,y,bw,bh=box
        await page.screenshot(path="klammer_d2.png", clip={"x":max(0,x-20),"y":max(0,y-20),"width":bw+40,"height":bh+40})
        # Menü oben anklicken
        await page.mouse.click(1350,55); await asyncio.sleep(1.5)
        offen = await page.evaluate("""() => !!document.querySelector('[data-framer-name="Glas"]')""")
        print('Menü öffnet oben:', offen)
        await page.keyboard.press('Escape'); await asyncio.sleep(1)
        # ganz nach unten und Menü klicken
        await page.evaluate("""() => window.__sanftscroll ? window.__sanftscroll.scrollTo(document.documentElement.scrollHeight,{immediate:true}) : window.scrollTo(0,document.documentElement.scrollHeight)""")
        await asyncio.sleep(1.5)
        unten = await page.evaluate("""() => { const e=document.elementFromPoint(1350,55); return (e.closest('[data-framer-name]')||e).dataset.framerName }""")
        await page.mouse.click(1350,55); await asyncio.sleep(1.5)
        offen2 = await page.evaluate("""() => !!document.querySelector('[data-framer-name="Glas"]')""")
        print('unten Element:', unten, '| Menü öffnet unten:', offen2)
        await page.screenshot(path="menue_unten.png")
        await b.close()
asyncio.run(main())

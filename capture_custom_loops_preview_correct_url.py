import asyncio
from playwright.async_api import async_playwright

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 1200})
        page = await context.new_page()
        
        # 1. Load correct URL
        await page.goto("http://localhost:8080/poquito_studio.html", wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)
        
        # 2. Scroll to Front Greet custom loops in Tab 1
        await page.evaluate("window.scrollTo(0, 520)")
        await page.wait_for_timeout(500)
        await page.screenshot(path="studio_tab1_custom_loops_closeup.png", full_page=False)
        print("Captured studio_tab1_custom_loops_closeup.png")
        
        # 3. Switch to Listening RX behavior in Tab 1
        await page.evaluate("showBehaviorTab('beh-listening'); window.scrollTo(0, 480);")
        await page.wait_for_timeout(500)
        await page.screenshot(path="studio_tab1_listening_custom_loop.png", full_page=False)
        print("Captured studio_tab1_listening_custom_loop.png")
        
        # 4. Switch to Master Tab 3 (Frame Inspector & Loop Builder)
        await page.evaluate("showMasterTab('master-frames')")
        await page.wait_for_timeout(600)
        await page.screenshot(path="studio_tab3_frame_presets.png", full_page=False)
        print("Captured studio_tab3_frame_presets.png")
        
        await browser.close()

asyncio.run(capture())

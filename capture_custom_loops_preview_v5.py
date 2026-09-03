import asyncio
from playwright.async_api import async_playwright

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 1200})
        page = await context.new_page()
        
        await page.goto("http://localhost:8080/web-funnel/poquito_studio.html", wait_until="domcontentloaded")
        await page.wait_for_timeout(1000)
        
        # 1. Front Greet custom loops in Tab 1
        await page.evaluate("window.scrollTo(0, 520)")
        await page.wait_for_timeout(600)
        await page.screenshot(path="studio_tab1_custom_loops_closeup.png", full_page=False)
        print("Captured studio_tab1_custom_loops_closeup.png")
        
        # 2. Click 3. Radio Listening RX button
        await page.locator("button:has-text('3. Radio Listening RX')").first.click()
        await page.wait_for_timeout(600)
        await page.evaluate("window.scrollTo(0, 480)")
        await page.wait_for_timeout(600)
        await page.screenshot(path="studio_tab1_listening_custom_loop.png", full_page=False)
        print("Captured studio_tab1_listening_custom_loop.png")
        
        # 3. Click Master Tab 3: Frame Inspector & Loop Builder
        await page.locator("button:has-text('3. Frame Inspector')").first.click()
        await page.wait_for_timeout(800)
        await page.screenshot(path="studio_tab3_frame_presets.png", full_page=False)
        print("Captured studio_tab3_frame_presets.png")
        
        await browser.close()

asyncio.run(capture())

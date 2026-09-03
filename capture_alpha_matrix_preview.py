import asyncio
from playwright.async_api import async_playwright

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1440, 'height': 1200})
        page = await context.new_page()
        
        await page.goto("http://localhost:8080/poquito_studio.html", wait_until="domcontentloaded")
        await page.wait_for_timeout(800)
        
        # 1. Capture top state simulator
        await page.screenshot(path="studio_alpha_matrix_top.png", full_page=False)
        print("Captured studio_alpha_matrix_top.png")
        
        # 2. Simulate volume increase to 75%
        await page.evaluate("handleVolumeSlider(75); document.getElementById('sim-vol-slider').value = 75;")
        await page.wait_for_timeout(400)
        await page.screenshot(path="studio_alpha_matrix_volume_75.png", full_page=False)
        print("Captured studio_alpha_matrix_volume_75.png")

        # 3. Scroll down to unified WebP matrix cards
        await page.evaluate("window.scrollTo(0, 620)")
        await page.wait_for_timeout(400)
        await page.screenshot(path="studio_alpha_matrix_cards.png", full_page=False)
        print("Captured studio_alpha_matrix_cards.png")
        
        await browser.close()

asyncio.run(capture())

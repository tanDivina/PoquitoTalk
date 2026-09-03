const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('1. Starting browser to capture ATMs & Western Union cards...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, deviceScaleFactor: 3 });

  // Navigate to local Expo web build on Directory screen or with banking category
  console.log('2. Navigating to Directory screen...');
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Tap on Directory tab in bottom navigation if present
  try {
    const dirTab = await page.$x("//div[contains(text(), 'Directory') or contains(text(), 'Directorio') or contains(text(), 'Servicios')]");
    if (dirTab.length > 0) {
      await dirTab[0].click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('Tab click note:', e.message);
  }

  // Filter or tap Banking / ATMs category
  try {
    const bankingPill = await page.$x("//div[contains(text(), 'ATMs') or contains(text(), 'Banks') or contains(text(), 'Bancos')]");
    if (bankingPill.length > 0) {
      await bankingPill[0].click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('Banking filter click note:', e.message);
  }

  const outPath = path.join(__dirname, '../atm_western_union_cards.png');
  await page.screenshot({ path: outPath, fullPage: false });
  console.log('✅ Captured ATMs & Western Union cards:', outPath);

  await browser.close();
})();

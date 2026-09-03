const fs = require('fs');
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 3 });
  
  // Disable onboarding and splash in localStorage
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('has_completed_onboarding', 'true');
    localStorage.setItem('has_seen_welcome_guide', 'true');
    localStorage.setItem('poquito_is_pro', 'true');
  });

  await page.goto('http://localhost:8081/?tab=Directory', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: 'atm_western_union_directory.png' });
  console.log('Dir captured successfully');
  await browser.close();
})();

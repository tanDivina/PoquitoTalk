const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser to capture live PoquitoTalk app screenshot...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport to mobile phone dimensions
  await page.setViewport({
    width: 414,
    height: 896,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  await page.goto('https://poquitotalk.hero-apps.com/', { waitUntil: 'networkidle2' });
  
  // Wait for the demo card / app UI to load
  await page.waitForSelector('#demo');

  // Save screenshot
  const screenshotPath = './videos/poquitotalk-promo/app_screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Saved live app screenshot to ${screenshotPath}`);

  await browser.close();
})();

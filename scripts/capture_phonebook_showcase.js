const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const WORKSPACE_DIR = process.cwd();
const OUTPUT_SHOWCASE = path.join(WORKSPACE_DIR, 'phonebook_aligned_buttons_showcase.png');

(async () => {
  console.log('1. Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 3 });
  await page.goto('http://localhost:8081/?tab=PhoneBook&splash=false&onboarding=false', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const phonebookImgPath = path.join(WORKSPACE_DIR, 'phonebook_raw.png');
  await page.screenshot({ path: phonebookImgPath });
  console.log('2. Captured raw phonebook screen');

  // 3. Render showcase
  console.log('3. Rendering Android device showcase for PhoneBook...');
  const imgPhonebookBase64 = `data:image/png;base64,${fs.readFileSync(phonebookImgPath).toString('base64')}`;

  const showcaseHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Google Sans", "Segoe UI", Roboto, sans-serif; }
    body {
      background-color: #FAF8F5;
      padding: 50px 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .header-block {
      text-align: center;
      margin-bottom: 30px;
      max-width: 800px;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 9999px;
      font-size: 11.5px;
      font-weight: 700;
      color: #1D4ED8;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 30px;
      font-weight: 900;
      color: #1A130E;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 14.5px;
      font-weight: 500;
      color: #6B5E51;
      line-height: 1.5;
    }
    .devices-grid {
      display: flex;
      flex-direction: row;
      gap: 40px;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 800px;
    }
    .device-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 385px;
    }
    .android-chassis {
      position: relative;
      width: 375px;
      height: 812px;
      background: #1E2022;
      border-radius: 46px;
      padding: 10px;
      box-shadow: 
        0 0 0 2px #3D4043,
        0 0 0 4px #121314,
        0 25px 50px -12px rgba(26, 19, 14, 0.25),
        0 12px 24px -8px rgba(26, 19, 14, 0.15);
    }
    .screen-viewport {
      position: relative;
      width: 100%;
      height: 100%;
      background: #FAF8F5;
      border-radius: 38px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .android-status-bar {
      height: 36px;
      width: 100%;
      background: #FAF8F5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 50;
      position: relative;
    }
    .status-time {
      font-size: 13px;
      font-weight: 700;
      color: #1A130E;
    }
    .android-pinhole {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #0B0F14;
      border: 1.5px solid #1E293B;
    }
    .status-icons {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #1A130E;
    }
    .screen-content {
      flex: 1;
      width: 100%;
      overflow: hidden;
      position: relative;
    }
    .screen-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
    }
    .highlights-box {
      margin-top: 30px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      max-width: 820px;
      width: 100%;
    }
    .highlight-card {
      background: #FFFFFF;
      border: 1px solid #E8E1D7;
      border-radius: 14px;
      padding: 14px 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .highlight-title {
      font-size: 13px;
      font-weight: 800;
      color: #1A130E;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .highlight-desc {
      font-size: 12px;
      color: #6B5E51;
      line-height: 1.4;
    }
  </style>
</head>
<body>

  <div class="header-block">
    <div class="badge-pill">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      Phone Book UI Polish
    </div>
    <h1>Aligned Phone Book & Import Actions</h1>
    <p class="subtitle">Uniform height calibration, centered vertical alignment, and balanced action button spacing</p>
  </div>

  <div class="devices-grid">
    <div class="device-card">
      <div class="android-chassis">
        <div class="screen-viewport">
          <div class="android-status-bar">
            <span class="status-time">9:41</span>
            <div class="android-pinhole"></div>
            <div class="status-icons">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z"/></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
            </div>
          </div>
          <div class="screen-content">
            <img src="${imgPhonebookBase64}" class="screen-img" alt="Phone Book Screen" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="highlights-box">
    <div class="highlight-card">
      <div class="highlight-title">Equal 34px Height</div>
      <div class="highlight-desc">MY PHONE BOOK badge, Import, and Add Contact buttons now share the exact same height.</div>
    </div>
    <div class="highlight-card">
      <div class="highlight-title">Centered Alignment</div>
      <div class="highlight-desc">Icons and typography are vertically centered with matching border radius and clean baseline.</div>
    </div>
    <div class="highlight-card">
      <div class="highlight-title">Clean Action Spacing</div>
      <div class="highlight-desc">Clean 8px gap between Import and Add Contact for effortless 1-tap finger targeting.</div>
    </div>
  </div>

</body>
</html>
`;

  const showcasePage = await browser.newPage();
  await showcasePage.setViewport({ width: 950, height: 1100, deviceScaleFactor: 2 });
  await showcasePage.setContent(showcaseHtml, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  await showcasePage.screenshot({ path: OUTPUT_SHOWCASE, fullPage: true });

  console.log('✅ PhoneBook showcase saved:', OUTPUT_SHOWCASE);
  await browser.close();
})();

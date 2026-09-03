const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const WORKSPACE_DIR = process.cwd();
const OUTPUT_SHOWCASE = path.join(WORKSPACE_DIR, 'atms_western_union_cards_showcase.png');

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

function getChromePath() {
  for (const p of CHROME_PATHS) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error('Chrome not found');
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: getChromePath(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // 1. Directory Tab
  console.log('1. Capturing Directory Tab from Metro...');
  const pageDir = await browser.newPage();
  await pageDir.setViewport({ width: 393, height: 852, deviceScaleFactor: 3 });
  await pageDir.goto('http://localhost:8081/?splash=false&tab=Directory&deck=banking', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));
  const dirPath = path.join(WORKSPACE_DIR, 'atm_directory.png');
  await pageDir.screenshot({ path: dirPath });
  await pageDir.close();

  // 2. Presets Tab
  console.log('2. Capturing Presets Tab from Metro...');
  const pagePresets = await browser.newPage();
  await pagePresets.setViewport({ width: 393, height: 852, deviceScaleFactor: 3 });
  await pagePresets.goto('http://localhost:8081/?splash=false&tab=Templates&preset=banking_money', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));
  const presetPath = path.join(WORKSPACE_DIR, 'atm_presets.png');
  await pagePresets.screenshot({ path: presetPath });
  await pagePresets.close();

  // 3. Render Showcase
  console.log('3. Rendering Showcase...');
  const imgDirBase64 = `data:image/png;base64,${fs.readFileSync(dirPath).toString('base64')}`;
  const imgPresetBase64 = `data:image/png;base64,${fs.readFileSync(presetPath).toString('base64')}`;

  const showcaseHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif; }
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
      margin-bottom: 35px;
      max-width: 800px;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      border-radius: 9999px;
      font-size: 11.5px;
      font-weight: 700;
      color: #059669;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 32px;
      font-weight: 900;
      color: #1A130E;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 15px;
      font-weight: 500;
      color: #6B5E51;
      line-height: 1.5;
    }
    .devices-grid {
      display: flex;
      flex-direction: row;
      gap: 40px;
      align-items: flex-start;
      justify-content: center;
      width: 100%;
      max-width: 1050px;
    }
    .device-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      max-width: 420px;
    }
    .device-label-box {
      text-align: center;
      margin-bottom: 16px;
    }
    .device-tag {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #059669;
      background: #D1FAE5;
      padding: 4px 10px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 6px;
    }
    .device-name {
      font-size: 17px;
      font-weight: 800;
      color: #1A130E;
    }
    .device-sub {
      font-size: 13px;
      font-weight: 500;
      color: #786C5E;
    }
    .phone-chassis {
      position: relative;
      width: 375px;
      height: 812px;
      background: #242220;
      border-radius: 54px;
      padding: 11px;
      box-shadow: 
        0 0 0 2px #423E3B,
        0 0 0 4px #1A1918,
        0 25px 50px -12px rgba(26, 19, 14, 0.25),
        0 12px 24px -8px rgba(26, 19, 14, 0.15);
    }
    .screen-viewport {
      position: relative;
      width: 100%;
      height: 100%;
      background: #FAF8F5;
      border-radius: 44px;
      overflow: hidden;
    }
    .dynamic-island {
      position: absolute;
      top: 11px;
      left: 50%;
      transform: translateX(-50%);
      width: 115px;
      height: 32px;
      background: #000000;
      border-radius: 20px;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 12px;
      gap: 7px;
    }
    .camera-lens {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #0D1B2A;
      border: 1px solid #1E293B;
    }
    .sensor-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #111827;
    }
    .screen-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .footer-notes {
      margin-top: 35px;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
      background: #FFFFFF;
      padding: 16px 28px;
      border-radius: 16px;
      border: 1px solid #E8E1D7;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .note-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #4A3E33;
    }
    .color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
  </style>
</head>
<body>

  <div class="header-block">
    <div class="badge-pill">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
      PoquitoTalk Banking & Cash Infrastructure
    </div>
    <h1>ATMs, Banks & Western Union Cards</h1>
    <p class="subtitle">Verified island locations, Telered ATM backups, Western Union wires, and 1-tap Spanish voice note translation presets</p>
  </div>

  <div class="devices-grid">

    <!-- Device 1: Verified Directory (Expanded) -->
    <div class="device-card">
      <div class="device-label-box">
        <span class="device-tag">Verified Directory</span>
        <h3 class="device-name">1. Island Banking & ATM Deck</h3>
        <p class="device-sub">Locations, Hours & Direct Maps</p>
      </div>

      <div class="phone-chassis">
        <div class="screen-viewport">
          <div class="dynamic-island">
            <div class="sensor-dot"></div>
            <div class="camera-lens"></div>
          </div>
          <img src="${imgDirBase64}" class="screen-img" alt="ATMs & Banks Directory Screen" />
        </div>
      </div>
    </div>

    <!-- Device 2: 1-Tap Translation Presets (Expanded) -->
    <div class="device-card">
      <div class="device-label-box">
        <span class="device-tag">1-Tap Voice Presets</span>
        <h3 class="device-name">2. ATM & Western Union Presets</h3>
        <p class="device-sub">Cash Status & Wire Transfer Phrases</p>
      </div>

      <div class="phone-chassis">
        <div class="screen-viewport">
          <div class="dynamic-island">
            <div class="sensor-dot"></div>
            <div class="camera-lens"></div>
          </div>
          <img src="${imgPresetBase64}" class="screen-img" alt="ATMs & Western Union Presets Screen" />
        </div>
      </div>
    </div>

  </div>

  <div class="footer-notes">
    <div class="note-item">
      <div class="color-dot" style="background: #059669;"></div>
      <span><strong>Banco Nacional & Telered ATMs</strong>: 24/7 cash status & backup locations</span>
    </div>
    <div class="note-item">
      <div class="color-dot" style="background: #D97706;"></div>
      <span><strong>Western Union Branches</strong>: Changuinola & Guabito border wire pickup</span>
    </div>
    <div class="note-item">
      <div class="color-dot" style="background: #4F46E5;"></div>
      <span><strong>Punto Pago Network</strong>: Utility bill payments & minute recharges</span>
    </div>
  </div>

</body>
</html>
`;

  const showcasePage = await browser.newPage();
  await showcasePage.setViewport({ width: 1100, height: 1050, deviceScaleFactor: 2 });
  await showcasePage.setContent(showcaseHtml, { waitUntil: 'networkidle0' });
  await showcasePage.screenshot({ path: OUTPUT_SHOWCASE, fullPage: true });

  console.log('✅ Showcase saved directly to workspace root:', OUTPUT_SHOWCASE);

  await browser.close();
})();

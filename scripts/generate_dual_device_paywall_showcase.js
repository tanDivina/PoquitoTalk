const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = process.cwd();
const OUTPUT_IMAGE = path.join(WORKSPACE_DIR, 'paywalls_side_by_side_showcase.png');

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

function getBase64Image(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath);
      const ext = path.extname(filePath).slice(1);
      const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'webp' ? 'image/webp' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
      return `data:${mime};base64,${fileData.toString('base64')}`;
    }
  } catch (e) {
    console.warn('Error reading image:', filePath, e);
  }
  return '';
}

(async () => {
  console.log('1. Loading screen captures for device frames...');
  const imgSmallAnnual = getBase64Image(path.join(WORKSPACE_DIR, 'paywall_modal_sheet.png'));
  const imgBigAnnual = getBase64Image(path.join(WORKSPACE_DIR, 'paywall_fullscreen_onboarding.png'));
  const imgSmallTravel = getBase64Image(path.join(WORKSPACE_DIR, 'paywall_travel_pass_selected_modal.png'));
  const imgBigTravel = getBase64Image(path.join(WORKSPACE_DIR, 'paywall_travel_pass_selected_fullscreen.png'));

  console.log('2. Launching browser for side-by-side device frame showcase...');
  const browser = await puppeteer.launch({
    executablePath: getChromePath(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1720,
    height: 1180,
    deviceScaleFactor: 2,
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lexend:wght@700;800&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #FAF8F5;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 44px 56px;
      color: #1B1C1A;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }

    .header-block {
      text-align: center;
      margin-bottom: 36px;
      max-width: 900px;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: #EEF2FF;
      border: 1px solid #C7D2FE;
      color: #4338CA;
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .badge-pill svg {
      width: 14px;
      height: 14px;
    }

    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: #1B1C1A;
      letter-spacing: -0.02em;
    }

    p.subtitle {
      font-size: 15px;
      color: #6B5E51;
      margin-top: 6px;
      line-height: 1.5;
    }

    /* Devices Grid */
    .devices-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      width: 100%;
      max-width: 1560px;
      align-items: start;
      justify-content: center;
    }

    .device-card {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .device-label-box {
      text-align: center;
      margin-bottom: 18px;
    }

    .device-tag {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: #964824;
      background: #FFDBCD;
      border: 1px solid #FD9A6F;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .device-name {
      font-size: 17px;
      font-weight: 800;
      color: #1B1C1A;
    }

    .device-sub {
      font-size: 12.5px;
      color: #6B5E51;
      margin-top: 2px;
    }

    /* Titanium iPhone 16 Pro Frame */
    .phone-chassis {
      position: relative;
      width: 380px;
      height: 822px;
      background: #1e1e1e;
      border-radius: 54px;
      padding: 11px;
      box-shadow: 
        0 0 0 1.5px #63615c,
        0 0 0 4px #b8b3a8,
        0 0 0 5.5px #44423e,
        0 24px 60px -12px rgba(150, 72, 36, 0.14),
        0 18px 36px -10px rgba(0, 0, 0, 0.18);
    }

    /* Side hardware buttons */
    .phone-chassis::before {
      content: '';
      position: absolute;
      left: -6.5px;
      top: 140px;
      width: 4px;
      height: 48px;
      background: #8e8a82;
      border-radius: 3px 0 0 3px;
      box-shadow: 0 62px 0 0 #8e8a82, 0 124px 0 0 #8e8a82;
    }

    .phone-chassis::after {
      content: '';
      position: absolute;
      right: -6.5px;
      top: 180px;
      width: 4px;
      height: 72px;
      background: #8e8a82;
      border-radius: 0 3px 3px 0;
    }

    .screen-viewport {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 44px;
      overflow: hidden;
      background: #FFFFFF;
    }

    /* Dynamic Island */
    .dynamic-island {
      position: absolute;
      top: 11px;
      left: 50%;
      transform: translateX(-50%);
      width: 112px;
      height: 30px;
      background: #000000;
      border-radius: 20px;
      z-index: 100;
      display: flex;
      align-items: center;
      justifyContent: space-between;
      padding: 0 10px;
    }

    .camera-lens {
      width: 11px;
      height: 11px;
      background: #0d121c;
      border-radius: 50%;
      border: 1px solid #1c2738;
      box-shadow: inset 0 0 2px #003366;
    }

    .sensor-dot {
      width: 9px;
      height: 9px;
      background: #080808;
      border-radius: 50%;
    }

    .screen-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
    }

    /* Footer Notes */
    .footer-notes {
      margin-top: 36px;
      display: flex;
      gap: 32px;
      background: #FFFFFF;
      border: 1px solid #E8E1D7;
      border-radius: 16px;
      padding: 14px 28px;
      align-items: center;
    }

    .note-item {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 13px;
      color: #4A3E33;
      font-weight: 600;
    }

    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
  </style>
</head>
<body>

  <div class="header-block">
    <div class="badge-pill">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
      PoquitoTalk Native Paywall Architecture
    </div>
    <h1>Terracotta Brown Selection with Bright Indigo CTAs</h1>
    <p class="subtitle">Warm island selection cards (#964824) with high-contrast Royal Indigo (#4F46E5) conversion buttons</p>
  </div>

  <div class="devices-grid">

    <!-- Device 1: Small Sliding Modal (Annual Pass Default) -->
    <div class="device-card">
      <div class="device-label-box">
        <span class="device-tag">In-App Drawer</span>
        <h3 class="device-name">1. Sliding Paywall Modal</h3>
        <p class="device-sub">Annual Explorer Pass Selected</p>
      </div>

      <div class="phone-chassis">
        <div class="screen-viewport">
          <div class="dynamic-island">
            <div class="sensor-dot"></div>
            <div class="camera-lens"></div>
          </div>
          <img src="${imgSmallAnnual}" class="screen-img" alt="Sliding Paywall Modal Sheet" />
        </div>
      </div>
    </div>

    <!-- Device 2: Full-Screen Onboarding (Annual Pass Default) -->
    <div class="device-card">
      <div class="device-label-box">
        <span class="device-tag">Onboarding Flow</span>
        <h3 class="device-name">2. Fullscreen Onboarding</h3>
        <p class="device-sub">With 4-Card Benefit Grid</p>
      </div>

      <div class="phone-chassis">
        <div class="screen-viewport">
          <div class="dynamic-island">
            <div class="sensor-dot"></div>
            <div class="camera-lens"></div>
          </div>
          <img src="${imgBigAnnual}" class="screen-img" alt="Fullscreen Onboarding Paywall" />
        </div>
      </div>
    </div>

    <!-- Device 3: Travel Pass Selected State -->
    <div class="device-card">
      <div class="device-label-box">
        <span class="device-tag">Tapped State</span>
        <h3 class="device-name">3. Travel Pass Selected</h3>
        <p class="device-sub">Dynamic Button + Emerald Badge</p>
      </div>

      <div class="phone-chassis">
        <div class="screen-viewport">
          <div class="dynamic-island">
            <div class="sensor-dot"></div>
            <div class="camera-lens"></div>
          </div>
          <img src="${imgSmallTravel}" class="screen-img" alt="Travel Pass Selected" />
        </div>
      </div>
    </div>

  </div>

  <div class="footer-notes">
    <div class="note-item">
      <div class="color-dot" style="background: #964824;"></div>
      <span><strong>Terracotta Brown (#964824)</strong>: Warm native card selection & Best Value badge</span>
    </div>
    <div class="note-item">
      <div class="color-dot" style="background: #4F46E5;"></div>
      <span><strong>Royal Indigo (#4F46E5)</strong>: High-contrast, tap-inviting CTA button</span>
    </div>
    <div class="note-item">
      <div class="color-dot" style="background: #059669;"></div>
      <span><strong>Emerald Green (#059669)</strong>: Dedicated Island Trips & Expiry badges</span>
    </div>
  </div>

</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: OUTPUT_IMAGE,
    type: 'png',
    fullPage: false,
  });

  console.log(`✅ Side-by-side framed showcase saved directly to workspace root: ${OUTPUT_IMAGE}`);

  await browser.close();
  process.exit(0);
})();

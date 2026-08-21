const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';

async function generate4UpShowcase() {
  const img1Path = path.join(WORKSPACE_DIR, 'play_store_screenshot_1_home.png');
  const img2Path = path.join(WORKSPACE_DIR, 'play_store_screenshot_2_presets.png');
  const img3Path = path.join(WORKSPACE_DIR, 'play_store_screenshot_3_directory.png');
  const img4Path = path.join(WORKSPACE_DIR, 'play_store_screenshot_4_tones.png');

  if (!fs.existsSync(img1Path) || !fs.existsSync(img2Path) || !fs.existsSync(img3Path) || !fs.existsSync(img4Path)) {
    throw new Error('Missing one or more screenshot files.');
  }

  const base64_1 = `data:image/png;base64,${fs.readFileSync(img1Path).toString('base64')}`;
  const base64_2 = `data:image/png;base64,${fs.readFileSync(img2Path).toString('base64')}`;
  const base64_3 = `data:image/png;base64,${fs.readFileSync(img3Path).toString('base64')}`;
  const base64_4 = `data:image/png;base64,${fs.readFileSync(img4Path).toString('base64')}`;

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  // 16:9 high resolution canvas for Twitter / LinkedIn / Social Media (2400 x 1350)
  await page.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Lexend:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 2400px;
      height: 1350px;
      background-color: #FAF8F5;
      background-image: 
        radial-gradient(circle at 50% 0%, #FFF5EE 0%, #FAF8F5 50%, #EDE5D8 100%),
        radial-gradient(rgba(150, 72, 36, 0.05) 1.5px, transparent 1.5px);
      background-size: 100% 100%, 36px 36px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 80px 50px 80px;
      overflow: hidden;
      position: relative;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid rgba(150, 72, 36, 0.12);
      padding-bottom: 24px;
      z-index: 10;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .parrot-logo {
      width: 76px;
      height: 76px;
      filter: drop-shadow(0 6px 16px rgba(37, 211, 102, 0.25));
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 38px;
      font-weight: 900;
      color: #1E293B;
      display: flex;
      align-items: center;
      gap: 14px;
      letter-spacing: -0.5px;
    }
    .country-badge {
      background: #FFDBCD;
      color: #964824;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 16px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 100px;
      border: 1px solid #FD9A6F;
    }
    .brand-subtitle {
      font-size: 19px;
      font-weight: 600;
      color: #594F42;
      margin-top: 4px;
    }
    .header-right {
      text-align: right;
    }
    .store-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #18191B;
      color: #FFFFFF;
      padding: 10px 22px;
      border-radius: 100px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.5px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.15);
    }

    /* 4-Column Showcase Stage */
    .showcase-stage {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 36px;
      flex: 1;
      margin: 30px 0;
      z-index: 10;
    }
    .card-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
      position: relative;
    }
    .col-label {
      font-family: 'Lexend', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: #964824;
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.2);
      padding: 6px 16px;
      border-radius: 100px;
      letter-spacing: 1.2px;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(150, 72, 36, 0.08);
      text-transform: uppercase;
    }
    .screenshot-frame {
      width: 100%;
      height: 940px;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 
        0 24px 60px rgba(89, 79, 66, 0.18),
        0 6px 16px rgba(0, 0, 0, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.8);
      background: #FFFFFF;
      transition: transform 0.3s ease;
      position: relative;
    }
    .screenshot-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1.5px solid rgba(150, 72, 36, 0.12);
      padding-top: 20px;
      font-size: 17px;
      font-weight: 600;
      color: #5C554D;
      z-index: 10;
    }
    .highlight {
      color: #1E293B;
      font-weight: 800;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="brand-group">
      <!-- Official PoquitoTalk Vector Logo (Unboxed, breathes freely) -->
      <svg class="parrot-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
        <!-- Outer Speech Bubble (WhatsApp Green) -->
        <path
          d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
          fill="none"
          stroke="#25D366"
          stroke-width="12"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Wooden Perch Branch -->
        <path d="M 62 161 Q 86 159 112 161" stroke="#B45309" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Golden Parrot Claws -->
        <path
          d="M 74 152 C 72 158 74 164 78 164 M 80 152 C 78 158 80 164 84 164 M 91 152 C 89 158 91 164 95 164 M 97 152 C 95 158 97 164 101 164"
          stroke="#F59E0B"
          stroke-width="4"
          stroke-linecap="round"
        />

        <!-- Green Panamanian Parrot Head & Body -->
        <path
          d="M 62 152 C 55 138 52 122 55 105 C 58 78 72 55 92 55 C 108 55 116 70 114 85 C 112 102 114 128 110 142 C 102 155 82 160 62 152 Z"
          fill="#10B981"
          stroke="#047857"
          stroke-width="4.5"
        />

        <!-- Expressive Head Crown Feathers -->
        <g id="logo-crest">
          <path d="M 74 56.5 C 70 48 66 43 60 42" stroke="#047857" stroke-width="3" stroke-linecap="round" fill="none" />
          <path d="M 84 54.0 C 80 46 76 42 70 41" stroke="#047857" stroke-width="2.6" stroke-linecap="round" fill="none" />
        </g>

        <!-- Wing Curve (Cyan Accent) -->
        <path
          d="M 58 112 C 62 98 76 92 86 108 C 92 122 86 145 70 148 C 62 140 57 126 58 112 Z"
          fill="#06B6D4"
          stroke="#047857"
          stroke-width="3.5"
        />

        <!-- Cute Big Eye -->
        <circle cx="95" cy="74" r="8" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
        <circle cx="93.5" cy="74" r="4" fill="#0F172A" />
        <circle cx="92" cy="72" r="1.5" fill="#FFFFFF" />

        <!-- Clean Golden Parrot Beak -->
        <path
          d="M 110 70 C 124 70 130 82 118 94 C 113 98 106 94 108 88 C 110 82 108 74 110 70 Z"
          fill="#F59E0B"
          stroke="#047857"
          stroke-width="3.5"
          stroke-linejoin="round"
        />
        <path
          d="M 109 88 C 114 90 116 93 111 94 C 108 94 107 91 109 88 Z"
          fill="#D97706"
          stroke="#047857"
          stroke-width="1.8"
          stroke-linejoin="round"
        />

        <!-- Audio Soundwave Arcs -->
        <path d="M 130 73 A 12 12 0 0 1 130 93" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
        <path d="M 140 66 A 19 19 0 0 1 140 100" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
        <path d="M 150 60 A 25 25 0 0 1 150 106" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" opacity="0.8" />
      </svg>
      <div>
        <div class="brand-title">PoquitoTalk <span class="country-badge">Panamá 🇵🇦</span></div>
        <div class="brand-subtitle">Instant Panama Spanish Voice Notes & Verified Bocas del Toro Directory</div>
      </div>
    </div>
    <div class="header-right">
      <div class="store-badge">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.793 12 3.61 22.186a2.37 2.37 0 0 1-.61-.74V2.554c.164-.297.373-.55.61-.74zm11.602 11.604l2.58 2.58-12.012 6.94 9.432-9.52zm0-2.836L5.78 1.062l12.012 6.94-2.581 2.58zm1.417 1.418l3.654 2.112c1.026.592 1.026 1.56 0 2.153l-3.654 2.112-2.124-2.123 2.124-2.154z"/></svg>
        <span>Google Play Store • Android Edition</span>
      </div>
    </div>
  </div>

  <!-- 4-Phone Showcase Stage -->
  <div class="showcase-stage">
    <!-- Slot 1 -->
    <div class="card-col">
      <div class="col-label">1 • 1-Tap Voice Dispatch</div>
      <div class="screenshot-frame">
        <img src="${base64_1}" alt="Home Voice Dispatch" />
      </div>
    </div>

    <!-- Slot 2 -->
    <div class="card-col">
      <div class="col-label">2 • Offline Presets</div>
      <div class="screenshot-frame">
        <img src="${base64_2}" alt="Service Phrase Templates" />
      </div>
    </div>

    <!-- Slot 3 -->
    <div class="card-col">
      <div class="col-label">3 • Island Directory</div>
      <div class="screenshot-frame">
        <img src="${base64_3}" alt="Bocas Contractor Directory" />
      </div>
    </div>

    <!-- Slot 4 -->
    <div class="card-col">
      <div class="col-label">4 • Dialect Switcher</div>
      <div class="screenshot-frame">
        <img src="${base64_4}" alt="Poquito vs Full Panameño" />
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>Built for Expats & Island Residents in Bocas del Toro</div>
    <div>Created by <span class="highlight">@DorienVibecodes</span> • <span class="highlight">poquitotalk.hero-apps.com</span></div>
  </div>

</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 800));

  const outputPath = path.join(WORKSPACE_DIR, 'poquitotalk_app_showcase_4up.png');
  await page.screenshot({ path: outputPath, type: 'png' });
  console.log(`✅ Saved 4-in-1 Social Showcase: ${outputPath}`);

  await browser.close();
}

generate4UpShowcase().catch(err => {
  console.error('❌ Error generating 4-up showcase:', err);
  process.exit(1);
});

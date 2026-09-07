const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const WORKSPACE_DIR = "/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras";

// 1. Walkie Talkie Mascot SVG (Full Studio Vector with clean drop shadow)
function getWalkieTalkieMascotSvg(width = 320, height = 320) {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <filter id="talkie-shadow-main" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="rgba(150,72,36,0.18)" />
    </filter>

    <g filter="url(#talkie-shadow-main)">
      <!-- 1. Wooden Perch Branch (extended smoothly on both sides) -->
      <path d="M 15 152 Q 80 148 145 152" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />

      <!-- 2. Golden Parrot Claws -->
      <path d="M 52 142 C 50 149 52 156 56 156 M 60 142 C 58 149 60 156 64 156 M 74 142 C 72 149 74 156 78 156 M 82 142 C 80 149 82 156 86 156" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />

      <!-- 3. Body & 2 Crown Hairs -->
      <g>
        <path d="M 40 142 C 30 124 28 104 32 82 C 36 54 54 30 78 30 C 98 30 108 48 106 68 C 103 90 104 118 98 134 C 88 150 62 154 40 142 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" stroke-linejoin="round" />
        <path d="M 63 31.4 C 59 24 55 19 49 18" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
        <path d="M 73 29.8 C 69 23 65 19 59 17" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
      </g>

      <!-- 4. Head & Face -->
      <g>
        <circle cx="82" cy="54" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
        <circle cx="80.5" cy="54" r="4.5" fill="#0F172A" />
        <circle cx="78.5" cy="52" r="1.8" fill="#FFFFFF" />

        <path d="M 96 48 C 112 48 120 62 106 74 C 101 77 94 73 95 67 C 97 61 94 52 96 48 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M 96 68 C 102 70 104 74 98 75 C 95 75 94 71 96 68 Z" fill="#D97706" stroke="#047857" stroke-width="1.8" stroke-linejoin="round" />
      </g>

      <!-- 5. Walkie-Talkie Unit in Cyan Wing -->
      <g transform="translate(-4, 0)">
        <path d="M 129 45 L 129 70" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="129" cy="43" r="3.5" fill="#F59E0B" />

        <rect x="116" y="70" width="28" height="46" rx="6" fill="#1E293B" stroke="#047857" stroke-width="2.5" />
        
        <line x1="122" y1="90" x2="138" y2="90" stroke="#64748B" stroke-width="2" stroke-linecap="round" />
        <line x1="122" y1="96" x2="138" y2="96" stroke="#64748B" stroke-width="2" stroke-linecap="round" />
        <line x1="122" y1="102" x2="138" y2="102" stroke="#64748B" stroke-width="2" stroke-linecap="round" />

        <rect x="143" y="76" width="4.5" height="14" rx="2.2" fill="#25D366" />
        <rect x="120" y="65" width="7" height="6" rx="1.5" fill="#475569" />

        <circle cx="125" cy="78" r="3.8" fill="#0F172A" />
        <circle cx="125" cy="78" r="2.8" fill="#25D366" />

        <path d="M 135 38 A 10 10 0 0 1 145 48" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
        <path d="M 139 32 A 16 16 0 0 1 153 46" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
        <path d="M 143 26 A 22 22 0 0 1 161 44" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" opacity="0.75" />
      </g>

      <!-- Cyan Wing Gripping the Walkie -->
      <path d="M 44 94 C 48 80 60 76 72 84 C 84 92 98 94 112 96 C 116 98 116 103 110 105 C 97 108 82 124 60 126 C 49 120 42 108 44 94 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
    </g>
  </svg>
  `;
}

async function renderGraphics() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 2 });

  // =========================================================================
  // OFFICIAL CANONICAL FEATURE GRAPHIC (Warm Island Light)
  // - Poquito moved more to the left
  // - Speech bubble moved UP so it doesn't cover "Notes"
  // - Speech bubble has a clear pointer arrow centered/pointing to Poquito
  // - Branch aligns with '100% Offline Presets'
  // =========================================================================
  const htmlWarm = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Lexend:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1024px;
      height: 500px;
      background: radial-gradient(circle at 75% 30%, #FFF5EB 0%, #FAF8F5 50%, #E8DFD3 100%);
      font-family: "Plus Jakarta Sans", sans-serif;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 35px 65px 25px 65px;
      overflow: hidden;
      position: relative;
    }
    .left-content {
      max-width: 530px;
      z-index: 10;
    }
    .badge-top {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.16);
      padding: 7px 18px;
      border-radius: 100px;
      font-size: 13.5px;
      font-weight: 800;
      color: #964824;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 14px;
      box-shadow: 0 4px 12px rgba(150,72,36,0.08);
    }
    .main-title {
      font-family: "Lexend", sans-serif;
      font-size: 50px;
      font-weight: 900;
      line-height: 1.05;
      color: #1E293B;
      letter-spacing: -1.2px;
      margin-bottom: 14px;
    }
    .main-title span {
      color: #964824;
    }
    .subtitle {
      font-size: 18.5px;
      font-weight: 600;
      color: #5C4E3A;
      line-height: 1.36;
      margin-bottom: 24px;
    }
    .pill-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .pill {
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.12);
      padding: 9px 18px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 800;
      color: #1E293B;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }
    .pill-green {
      background: #10B981;
      color: #FFFFFF;
      border: none;
      box-shadow: 0 4px 14px rgba(16,185,129,0.3);
    }

    .right-graphic {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      margin-right: 90px; /* Shifted more to the left per user request */
      margin-top: 82px;  /* Lowered so perch branch aligns with 100% Offline Presets */
    }

    /* Speech Bubble with clean downward pointer arrow */
    .speech-bubble {
      position: absolute;
      top: -82px;       /* Moved significantly UP so it does NOT cover "Notes" */
      left: -120px;
      background: #FFFFFF;
      border: 2px solid rgba(150, 72, 36, 0.18);
      padding: 12px 20px;
      border-radius: 20px;
      box-shadow: 0 12px 28px rgba(150, 72, 36, 0.14);
      font-size: 15px;
      font-weight: 800;
      color: #1E293B;
      white-space: nowrap;
      display: flex;
      flex-direction: column;
      gap: 5px;
      z-index: 30;
    }

    /* Outer border of pointer arrow */
    .speech-bubble::before {
      content: '';
      position: absolute;
      bottom: -12px;
      right: 90px; /* Centered toward Poquito */
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 12px solid rgba(150, 72, 36, 0.22);
    }

    /* Inner fill of pointer arrow */
    .speech-bubble::after {
      content: '';
      position: absolute;
      bottom: -9.5px;
      right: 91px; /* Matches inner fill */
      width: 0;
      height: 0;
      border-left: 9px solid transparent;
      border-right: 9px solid transparent;
      border-top: 10px solid #FFFFFF;
    }

    .phrase-text {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .play-dot {
      width: 0;
      height: 0;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-left: 8px solid #059669;
    }
    .audio-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(16, 185, 129, 0.12);
      color: #047857;
      font-size: 11.5px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 100px;
      width: fit-content;
    }
  </style>
</head>
<body>
  <div class="left-content">
    <div class="badge-top">
      <span>🇵🇦</span>
      <span>Bocas del Toro (Panama)</span>
    </div>
    <h1 class="main-title">Natural Voice Notes<br><span>For Island Life</span></h1>
    <div class="subtitle">Speak English. Send studio-quality Panamanian Spanish voice notes in 1 tap.</div>
    <div class="pill-group">
      <div class="pill pill-green">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
        <span>1-Tap Voice Dispatch</span>
      </div>
      <div class="pill">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#964824" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>Island Directory</span>
      </div>
      <div class="pill">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#964824" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span>100% Offline Presets</span>
      </div>
    </div>
  </div>

  <div class="right-graphic">
    <div class="speech-bubble">
      <div class="phrase-text">
        <div class="play-dot"></div>
        <span>"¡Buenas! ¿Cuánto el viaje a Carenero?"</span>
      </div>
      <div class="audio-badge">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        <span>Natural Panamanian Spanish</span>
      </div>
    </div>
    ${getWalkieTalkieMascotSvg(320, 320)}
  </div>
</body>
</html>
  `;

  await page.setContent(htmlWarm, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 400));
  const warmPath = path.join(WORKSPACE_DIR, "play_store_feature_graphic.png");
  await page.screenshot({ path: warmPath });
  console.log("✅ Play Store Feature Graphic rendered:", warmPath);

  // Sync to official submission files
  const subFile = path.join(WORKSPACE_DIR, "google_play_submission_files/02_feature_graphic_1024x500.png");
  fs.copyFileSync(warmPath, subFile);
  fs.copyFileSync(warmPath, path.join(WORKSPACE_DIR, "play_store_feature_graphic_1024x500.png"));

  console.log("✅ Synced to google_play_submission_files/02_feature_graphic_1024x500.png!");

  await browser.close();
}

renderGraphics().catch(console.error);

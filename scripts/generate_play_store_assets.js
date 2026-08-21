const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const WORKSPACE_DIR = "/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras";

// Canonical Talkie Mascot directly from studio
function getWalkieTalkieMascotSvg(width = 320, height = 320) {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <filter id="talkie-shadow-main" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="rgba(150,72,36,0.2)" />
    </filter>

    <g filter="url(#talkie-shadow-main)">
      <!-- 1. Wooden Perch Branch -->
      <path d="M 30 152 Q 80 148 135 152" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />

      <!-- 2. Golden Parrot Claws -->
      <path d="M 52 142 C 50 149 52 156 56 156 M 60 142 C 58 149 60 156 64 156 M 74 142 C 72 149 74 156 78 156 M 82 142 C 80 149 82 156 86 156" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />

      <!-- 3. Body & 2 Crown Hairs -->
      <g>
        <path d="M 40 142 C 30 124 28 104 32 82 C 36 54 54 30 78 30 C 98 30 108 48 106 68 C 103 90 104 118 98 134 C 88 150 62 154 40 142 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" stroke-linejoin="round" />
        
        <!-- EXACT 2 CROWN HAIRS (NO HEADPHONES) -->
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

      <!-- Petite Slender Cyan Wing Gripping the Walkie-Talkie -->
      <path d="M 44 94 C 48 80 60 76 72 84 C 84 92 98 94 112 96 C 116 98 116 103 110 105 C 97 108 82 124 60 126 C 49 120 42 108 44 94 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
    </g>
  </svg>
  `;
}

// Crisp App Icon SVG (Exact Canonical Studio/Web-Funnel Logo SVG)
function getAppIconSvg(width = 440, height = 440) {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Outer Speech Bubble (WhatsApp Green) -->
    <path
      d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
      fill="#FFFFFF"
      stroke="#25D366"
      stroke-width="12"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Canonical Studio Parrot Group (Scaled & centered within speech bubble with zero overlap) -->
    <g transform="translate(43, 39) scale(0.75)">
      <!-- 1. Wooden Perch Branch -->
      <path d="M 30 135 Q 70 132 115 135" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />

      <!-- 2. Golden Parrot Claws -->
      <path
        d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138"
        stroke="#F59E0B"
        stroke-width="4.5"
        stroke-linecap="round"
      />

      <!-- 3. Body & Anchored 2 Crown Feathers (Zero Gap, seamless skull connection) -->
      <g id="body-group">
        <path
          d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z"
          fill="#10B981"
          stroke="#047857"
          stroke-width="4.5"
          stroke-linejoin="round"
        />
        <!-- Two Feathers seamlessly rooted in head -->
        <path d="M 58 19.2 C 55 13 52 9 47 8" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
        <path d="M 67 17.8 C 64 12 61 9 56 7" stroke="#047857" stroke-width="3" stroke-linecap="round" fill="none" />
      </g>

      <!-- 4. Sleek Cyan Wing -->
      <path
        d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z"
        fill="#06B6D4"
        stroke="#047857"
        stroke-width="3.5"
        stroke-linejoin="round"
      />

      <!-- 5. Head Group (Big Eye & Golden Beak) -->
      <g id="head-group">
        <circle cx="76" cy="42" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
        <circle cx="74.5" cy="42" r="4.5" fill="#0F172A" />
        <circle cx="72.5" cy="40" r="1.8" fill="#FFFFFF" />

        <!-- Golden Beak -->
        <path
          d="M 90 36 C 106 36 114 50 100 62 C 95 65 88 61 89 55 C 91 49 88 40 90 36 Z"
          fill="#F59E0B"
          stroke="#047857"
          stroke-width="3.5"
          stroke-linejoin="round"
        />
        <path
          d="M 90 56 C 96 58 98 62 92 63 C 89 63 88 59 90 56 Z"
          fill="#D97706"
          stroke="#047857"
          stroke-width="1.8"
          stroke-linejoin="round"
        />
      </g>

      <!-- 6. Compact Proportionate Soundwave Arcs (Generous breathing room) -->
      <path d="M 112 43 A 11 11 0 0 1 112 60" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
      <path d="M 121 37 A 17 17 0 0 1 121 66" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
      <path d="M 130 31 A 23 23 0 0 1 130 72" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" opacity="0.8" />
    </g>
  </svg>
  `;
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // -------------------------------------------------------------
  // 1. PLAY STORE 512x512 HIGH-RES ICON
  // -------------------------------------------------------------
  console.log("🎨 Rendering 512x512 Google Play Store Icon...");
  const pIcon = await browser.newPage();
  await pIcon.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  const htmlIcon = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 512px;
      height: 512px;
      background: linear-gradient(145deg, #EBF6FE 0%, #D8ECFD 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
  </style>
</head>
<body>
  ${getAppIconSvg(440, 440)}
</body>
</html>
  `;
  await pIcon.setContent(htmlIcon, { waitUntil: "domcontentloaded" });
  const icon512 = path.join(WORKSPACE_DIR, "play_store_icon_512.png");
  await pIcon.screenshot({ path: icon512 });
  await pIcon.screenshot({ path: path.join(WORKSPACE_DIR, "google_play_store_icon.png") });
  await pIcon.screenshot({ path: path.join(WORKSPACE_DIR, "google_play_store_icon.jpg") });
  await pIcon.screenshot({ path: path.join(WORKSPACE_DIR, "assets/icon.png") });
  await pIcon.screenshot({ path: path.join(WORKSPACE_DIR, "assets/adaptive-icon.png") });
  await pIcon.close();

  // -------------------------------------------------------------
  // 2. PLAY STORE 1024x500 FEATURE GRAPHIC
  // -------------------------------------------------------------
  console.log("🌟 Rendering 1024x500 Google Play Feature Graphic...");
  const pFeature = await browser.newPage();
  await pFeature.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  const htmlFeature = `
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
      padding: 50px 70px;
      overflow: hidden;
      position: relative;
    }
    .left-content {
      max-width: 580px;
      z-index: 10;
    }
    .badge-top {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.16);
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 800;
      color: #964824;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(150,72,36,0.08);
    }
    .main-title {
      font-family: "Lexend", sans-serif;
      font-size: 52px;
      font-weight: 900;
      line-height: 1.06;
      color: #1E293B;
      letter-spacing: -1.2px;
      margin-bottom: 12px;
    }
    .main-title span {
      color: #964824;
    }
    .subtitle {
      font-size: 19px;
      font-weight: 600;
      color: #64748B;
      line-height: 1.35;
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
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 14px;
      font-weight: 800;
      color: #1E293B;
      display: flex;
      align-items: center;
      gap: 6px;
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
    }
    .speech-bubble {
      position: absolute;
      top: -30px;
      left: -140px;
      background: #FFFFFF;
      border: 2px solid rgba(150, 72, 36, 0.16);
      padding: 12px 20px;
      border-radius: 20px;
      border-bottom-right-radius: 4px;
      box-shadow: 0 10px 24px rgba(150, 72, 36, 0.14);
      font-size: 15px;
      font-weight: 800;
      color: #1E293B;
      white-space: nowrap;
    }
    .whatsapp-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #25D366;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 100px;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="left-content">
    <div class="badge-top">
      <span>🇵🇦</span>
      <span>Bocas del Toro • Panamá</span>
    </div>
    <h1 class="main-title">Natural Voice Notes<br><span>For Island Life</span></h1>
    <div class="subtitle">Speak English. Send studio-quality Panamanian Spanish WhatsApp voice notes in 1 tap.</div>
    <div class="pill-group">
      <div class="pill pill-green">
        <span>⚡️</span>
        <span>1-Tap Voice Dispatch</span>
      </div>
      <div class="pill">
        <span>🚤</span>
        <span>Island Directory</span>
      </div>
      <div class="pill">
        <span>🌴</span>
        <span>100% Offline Presets</span>
      </div>
    </div>
  </div>

  <div class="right-graphic">
    <div class="speech-bubble">
      <div>"¡Buenas! ¿Hay lancha para Carenero?"</div>
      <div class="whatsapp-badge">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <span>1-Tap WhatsApp Voice</span>
      </div>
    </div>
    ${getWalkieTalkieMascotSvg(320, 320)}
  </div>
</body>
</html>
  `;
  await pFeature.setContent(htmlFeature, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 400));
  await pFeature.screenshot({ path: path.join(WORKSPACE_DIR, "play_store_feature_graphic.png") });
  await pFeature.close();

  await browser.close();
  console.log("🎉 All Google Play Store graphics generated!");
}

run().catch(console.error);

const fs = require("fs");
const path = require("path");
const http = require("http");
const puppeteer = require("puppeteer-core");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const WORKSPACE_DIR = "/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras";
const DIST_DIR = path.join(WORKSPACE_DIR, "dist");
const PORT = 8099;

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

function startStaticServer() {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split("?")[0];
    if (reqPath === "/") reqPath = "/index.html";
    const filePath = path.join(DIST_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const fallbackHtml = path.join(DIST_DIR, "index.html");
      if (fs.existsSync(fallbackHtml)) {
        res.writeHead(200, { "Content-Type": "text/html" });
        fs.createReadStream(fallbackHtml).pipe(res);
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    }
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server));
  });
}

// =============================================================
// CANONICAL MASCOT SVGS DIRECTLY FROM STUDIO
// =============================================================

// 1. Exact Studio Walkie-Talkie Mascot (2 hairs, NO headphones, walkie-talkie in wing)
function getStudioTalkieMascotSvg(width = 240, height = 240) {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <filter id="talkie-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="rgba(150,72,36,0.2)" />
    </filter>

    <g filter="url(#talkie-shadow)">
      <!-- 1. Wooden Perch Branch -->
      <path d="M 30 152 Q 80 148 135 152" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />

      <!-- 2. Golden Parrot Claws -->
      <path d="M 52 142 C 50 149 52 156 56 156 M 60 142 C 58 149 60 156 64 156 M 74 142 C 72 149 74 156 78 156 M 82 142 C 80 149 82 156 86 156" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />

      <!-- 3. Body & 2 Crown Hairs -->
      <g id="talkie-body-group">
        <!-- Green Body -->
        <path d="M 40 142 C 30 124 28 104 32 82 C 36 54 54 30 78 30 C 98 30 108 48 106 68 C 103 90 104 118 98 134 C 88 150 62 154 40 142 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" stroke-linejoin="round" />
        
        <!-- EXACT 2 CROWN HAIRS (NO HEADPHONES) -->
        <path d="M 63 31.4 C 59 24 55 19 49 18" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
        <path d="M 73 29.8 C 69 23 65 19 59 17" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
      </g>

      <!-- 4. Head & Face -->
      <g id="talkie-head">
        <!-- Big Alert Eye -->
        <circle cx="82" cy="54" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
        <circle cx="80.5" cy="54" r="4.5" fill="#0F172A" />
        <circle cx="78.5" cy="52" r="1.8" fill="#FFFFFF" />

        <!-- Clean Golden Beak -->
        <path d="M 96 48 C 112 48 120 62 106 74 C 101 77 94 73 95 67 C 97 61 94 52 96 48 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M 96 68 C 102 70 104 74 98 75 C 95 75 94 71 96 68 Z" fill="#D97706" stroke="#047857" stroke-width="1.8" stroke-linejoin="round" />
      </g>

      <!-- 5. Walkie-Talkie Unit in Cyan Wing -->
      <g id="talkie-radio-group">
        <!-- Antenna -->
        <path d="M 129 45 L 129 70" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="129" cy="43" r="3.5" fill="#F59E0B" />

        <!-- Radio Chassis -->
        <rect x="116" y="70" width="28" height="46" rx="6" fill="#1E293B" stroke="#047857" stroke-width="2.5" />
        
        <!-- Speaker Slits -->
        <line x1="122" y1="90" x2="138" y2="90" stroke="#64748B" stroke-width="2" stroke-linecap="round" />
        <line x1="122" y1="96" x2="138" y2="96" stroke="#64748B" stroke-width="2" stroke-linecap="round" />
        <line x1="122" y1="102" x2="138" y2="102" stroke="#64748B" stroke-width="2" stroke-linecap="round" />

        <!-- PTT Button -->
        <rect x="143" y="76" width="4.5" height="14" rx="2.2" fill="#25D366" />
        <rect x="120" y="65" width="7" height="6" rx="1.5" fill="#475569" />

        <!-- Status LED -->
        <circle cx="125" cy="78" r="3.8" fill="#0F172A" />
        <circle cx="125" cy="78" r="2.8" fill="#25D366" />

        <!-- Radio Sound Waves -->
        <path d="M 135 38 A 10 10 0 0 1 145 48" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
        <path d="M 139 32 A 16 16 0 0 1 153 46" fill="none" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
        <path d="M 143 26 A 22 22 0 0 1 161 44" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" opacity="0.75" />

        <!-- Cyan Wing Gripping Radio -->
        <path d="M 44 86 C 50 75 66 76 80 86 C 94 96 108 94 116 98 C 119 101 116 107 106 110 C 92 112 78 126 58 128 C 48 120 42 102 44 86 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
      </g>
    </g>
  </svg>
  `;
}

// 2. Exact Studio Alert / Clean Side Profile Mascot (for Slot 2 Presets)
function getStudioCleanMascotSvg(width = 210, height = 210) {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <filter id="clean-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="rgba(150,72,36,0.18)" />
    </filter>

    <g filter="url(#clean-shadow)">
      <!-- Perch -->
      <path d="M 30 135 Q 70 132 115 135" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
      <!-- Golden Claws -->
      <path d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
      
      <!-- Body & 2 Crown Hairs -->
      <g>
        <path d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" stroke-linejoin="round" />
        <!-- EXACT 2 CROWN HAIRS -->
        <path d="M 58 19.2 C 55 13 52 9 47 8" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
        <path d="M 67 17.8 C 64 12 61 9 56 7" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
      </g>

      <!-- Sleek Cyan Wing -->
      <path d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />

      <!-- Alert Eye & Beak -->
      <g>
        <circle cx="76" cy="42" r="9.5" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
        <circle cx="74.5" cy="42" r="4.8" fill="#0F172A" />
        <circle cx="72.5" cy="40" r="1.8" fill="#FFFFFF" />

        <path d="M 90 36 C 106 36 114 50 100 62 C 95 65 88 61 89 55 C 91 49 88 40 90 36 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M 90 56 C 96 58 98 62 92 63 C 89 63 88 59 90 56 Z" fill="#D97706" stroke="#047857" stroke-width="1.8" stroke-linejoin="round" />
      </g>
    </g>
  </svg>
  `;
}

// 3. Exact Studio Front-View Mascot (for Slot 4 Dialect Selector)
function getStudioFrontMascotSvg(width = 200, height = 200) {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <filter id="front-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="rgba(150,72,36,0.18)" />
    </filter>

    <g filter="url(#front-shadow)">
      <!-- Perch -->
      <path d="M 30 138 Q 80 134 130 138" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
      <!-- Golden Claws -->
      <path d="M 62 127 C 60 133 62 139 66 139 M 70 127 C 68 133 70 139 74 139" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
      <path d="M 86 127 C 84 133 86 139 90 139 M 94 127 C 92 133 94 139 98 139" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />

      <!-- Body & 2 Front Crown Feathers -->
      <g id="front-body-group">
        <path d="M 80 18 C 96 18 108 30 112 50 C 116 72 118 100 110 118 C 104 130 96 132 80 132 C 64 132 56 130 50 118 C 42 100 44 72 48 50 C 52 30 64 18 80 18 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" stroke-linejoin="round" />
        <ellipse cx="80" cy="100" rx="18" ry="22" fill="#34D399" opacity="0.4" />
        
        <!-- EXACT 2 CROWN FEATHERS (SYMMETRICAL) -->
        <path d="M 77 18.5 C 73 12 68 9 63 8" stroke="#047857" stroke-width="3.2" stroke-linecap="round" fill="none" />
        <path d="M 83 18.5 C 87 12 92 9 97 8" stroke="#047857" stroke-width="3.2" stroke-linecap="round" fill="none" />
      </g>

      <!-- Left & Right Cyan Wings -->
      <path d="M 48 68 C 38 74 34 90 38 104 C 40 110 46 112 50 108 C 48 96 47 80 48 68 Z" fill="#06B6D4" stroke="#047857" stroke-width="3" stroke-linejoin="round" />
      <path d="M 112 68 C 122 74 126 90 122 104 C 120 110 114 112 110 108 C 112 96 113 80 112 68 Z" fill="#06B6D4" stroke="#047857" stroke-width="3" stroke-linejoin="round" />

      <!-- Face & Eyes -->
      <g id="front-head">
        <circle cx="67" cy="56" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
        <circle cx="69" cy="56" r="4.5" fill="#0F172A" />
        <circle cx="67" cy="54" r="1.8" fill="#FFFFFF" />

        <circle cx="93" cy="56" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
        <circle cx="95" cy="56" r="4.5" fill="#0F172A" />
        <circle cx="93" cy="54" r="1.8" fill="#FFFFFF" />

        <path d="M 74 72 C 76 81 84 81 86 72 L 83 75 C 81 77 79 77 77 75 Z" fill="#D97706" stroke="#047857" stroke-width="2" stroke-linejoin="round" />
        <path d="M 72 65 C 74 61 86 61 88 65 L 83 76 C 82 78 78 78 77 76 Z" fill="#F59E0B" stroke="#047857" stroke-width="3" stroke-linejoin="round" />
      </g>

      <!-- Radiating Sound Waves from Beak -->
      <path d="M 70 86 A 12 12 0 0 0 90 86" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
      <path d="M 64 92 A 20 20 0 0 0 96 92" fill="none" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round" />
    </g>
  </svg>
  `;
}

async function run() {
  const server = await startStaticServer();
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const CAPTURE_W = 393;
  const CAPTURE_H = 852;
  const BASE_URL = `http://localhost:${PORT}`;

  const page = await browser.newPage();
  await page.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });

  // 1. Capture Screen 1: Home Voice Dispatch
  console.log("📸 Capturing Live App Screens (bypassing onboarding)...");
  await page.goto(`${BASE_URL}/?onboarding=false&tab=Translate`, { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Type in English"]') || document.querySelector('textarea');
    if (input) {
      input.value = "Need boat to Carenero dock in 10 mins";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 600));
  const homeBuf = await page.screenshot({ encoding: "base64" });

  // 2. Capture Screen 2: Directory
  await page.goto(`${BASE_URL}/?onboarding=false&tab=Directory`, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 800));
  const dirBuf = await page.screenshot({ encoding: "base64" });

  // 3. Capture Screen 3: Tone Dialect
  await page.goto(`${BASE_URL}/?onboarding=false&tab=Translate`, { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    const toneBtns = Array.from(document.querySelectorAll('button, div')).filter(el => el.textContent.includes('Full Panameño') || el.textContent.includes('Panameño'));
    if (toneBtns.length > 0) toneBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 600));
  const dialectBuf = await page.screenshot({ encoding: "base64" });
  await page.close();

  const screenBase64s = {
    home: `data:image/png;base64,${homeBuf}`,
    directory: `data:image/png;base64,${dirBuf}`,
    dialect: `data:image/png;base64,${dialectBuf}`,
  };

  // -------------------------------------------------------------
  // SCREEN 1: CANONICAL TALKIE MASCOT + DISPATCH PHONE
  // -------------------------------------------------------------
  console.log("🎨 Rendering Screenshot 1 (Canonical Talkie Mascot)...");
  const p1 = await browser.newPage();
  await p1.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html1 = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Lexend:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1920px;
      background: radial-gradient(circle at 50% 12%, #FFF8F0 0%, #FAF8F5 50%, #ECE4D8 100%);
      font-family: "Plus Jakarta Sans", sans-serif;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 95px 70px 0 70px;
      overflow: hidden;
      position: relative;
    }
    .headline-block {
      text-align: center;
      margin-bottom: 24px;
      z-index: 10;
    }
    .main-title {
      font-family: "Lexend", sans-serif;
      font-size: 78px;
      font-weight: 900;
      line-height: 1.08;
      color: #1E293B;
      letter-spacing: -1.6px;
      margin-bottom: 12px;
    }
    .main-title span {
      color: #964824;
    }
    .subtitle-text {
      font-size: 26px;
      font-weight: 700;
      color: #786C5E;
      letter-spacing: -0.2px;
    }

    /* Mascot Interaction Row */
    .mascot-hero-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-top: 10px;
      margin-bottom: 24px;
      z-index: 20;
    }
    .mascot-bubble {
      background: #FFFFFF;
      border: 2px solid rgba(150, 72, 36, 0.16);
      padding: 18px 28px;
      border-radius: 26px;
      border-bottom-left-radius: 6px;
      box-shadow: 0 14px 34px rgba(150, 72, 36, 0.14);
      max-width: 420px;
    }
    .bubble-quote {
      font-size: 21px;
      font-weight: 800;
      color: #1E293B;
      line-height: 1.3;
    }
    .bubble-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #25D366;
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 800;
      padding: 4px 14px;
      border-radius: 100px;
      margin-top: 8px;
    }

    /* Phone Stage */
    .device-stage {
      position: relative;
      width: 100%;
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: flex-end;
    }
    .phone-wrapper {
      position: relative;
      width: 680px;
      height: 1380px;
      margin-bottom: -160px;
      z-index: 5;
    }
    .phone-chassis {
      width: 100%;
      height: 100%;
      background: #111215;
      border-radius: 60px;
      padding: 14px;
      box-shadow: 
        0 40px 100px rgba(150, 72, 36, 0.28),
        0 16px 36px rgba(0, 0, 0, 0.18);
      border: 4px solid #2D3748;
      position: relative;
      overflow: hidden;
    }
    .phone-notch {
      position: absolute;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      width: 140px;
      height: 32px;
      background: #000000;
      border-radius: 20px;
      z-index: 20;
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 46px;
      overflow: hidden;
      background: #FAF8F5;
    }
    .phone-screen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <div class="headline-block">
    <h1 class="main-title">Send Natural<br><span>WhatsApp Voice Notes</span><br>In One Tap</h1>
    <div class="subtitle-text">Speak English • Translates Studio-Quality Panama Spanish</div>
  </div>

  <!-- Mascot Dispatch Interaction Row -->
  <div class="mascot-hero-row">
    ${getStudioTalkieMascotSvg(200, 200)}
    <div class="mascot-bubble">
      <div class="bubble-quote">"¡Buenas! ¿Hay lancha disponible para Carenero?"</div>
      <div class="bubble-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <span>1-Tap Voice Dispatch</span>
      </div>
    </div>
  </div>

  <div class="device-stage">
    <div class="phone-wrapper">
      <div class="phone-chassis">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <img src="${screenBase64s.home}" alt="Voice Dispatch Screen" />
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
  await p1.setContent(html1, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 600));
  await p1.screenshot({ path: path.join(WORKSPACE_DIR, "play_store_screenshot_1_dynamic.png") });
  await p1.close();

  // -------------------------------------------------------------
  // SCREEN 2: CANONICAL ALERT MASCOT + ISLAND PRESETS
  // -------------------------------------------------------------
  console.log("👀 Rendering Screenshot 2 (Canonical Alert Mascot + Presets)...");
  const p2 = await browser.newPage();
  await p2.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html2 = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Lexend:wght@800;900&family=Caveat:wght@700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1920px;
      background: radial-gradient(circle at 50% 12%, #FFF8F0 0%, #FAF8F5 50%, #ECE4D8 100%);
      font-family: "Plus Jakarta Sans", sans-serif;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 95px 70px 60px 70px;
      overflow: hidden;
      position: relative;
    }
    .headline-block {
      text-align: center;
      margin-bottom: 24px;
      z-index: 10;
    }
    .main-title {
      font-family: "Lexend", sans-serif;
      font-size: 80px;
      font-weight: 900;
      line-height: 1.08;
      color: #1E293B;
      letter-spacing: -1.6px;
    }
    .main-title span {
      color: #964824;
    }

    /* Mascot Perch Row on Presets Screen */
    .mascot-perch-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 10px;
      margin-bottom: 10px;
      z-index: 20;
    }
    .offline-tag-pill {
      background: #10B981;
      color: #FFFFFF;
      font-size: 18px;
      font-weight: 800;
      padding: 10px 24px;
      border-radius: 100px;
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* 2x2 Feature Grid */
    .badges-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      width: 100%;
      max-width: 900px;
      margin-top: 30px;
      z-index: 10;
    }
    .badge-card {
      background: #FFFFFF;
      border-radius: 36px;
      padding: 42px 28px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 
        0 20px 50px rgba(150, 72, 36, 0.12),
        0 4px 12px rgba(0, 0, 0, 0.04);
      border: 2px solid rgba(150, 72, 36, 0.1);
      position: relative;
    }
    .card-boat { border-top: 10px solid #0284C7; }
    .card-power { border-top: 10px solid #DC2626; transform: translateY(16px); }
    .card-ac { border-top: 10px solid #0D9488; }
    .card-water { border-top: 10px solid #10B981; transform: translateY(16px); }

    .badge-icon-box {
      width: 92px;
      height: 92px;
      border-radius: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .box-boat { background: #E0F2FE; color: #0284C7; }
    .box-power { background: #FEE2E2; color: #DC2626; }
    .box-ac { background: #CCFBF1; color: #0D9488; }
    .box-water { background: #D1FAE5; color: #059669; }

    .badge-name {
      font-family: "Lexend", sans-serif;
      font-size: 29px;
      font-weight: 800;
      color: #1E293B;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .badge-sub {
      font-size: 19px;
      font-weight: 600;
      color: #786C5E;
      line-height: 1.35;
    }

    /* Hand-written script */
    .more-script {
      font-family: "Caveat", cursive;
      font-size: 78px;
      font-weight: 700;
      color: #964824;
      margin-top: 60px;
      text-align: center;
      transform: rotate(-3deg);
    }
    .pill-offline {
      margin-top: 30px;
      background: #18191B;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 22px;
      padding: 16px 40px;
      border-radius: 100px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.18);
      display: inline-flex;
      align-items: center;
      gap: 14px;
    }
  </style>
</head>
<body>
  <div class="headline-block">
    <h1 class="main-title">Instant Audio Presets<br><span>For Island Emergencies</span></h1>
  </div>

  <!-- Canonical Studio Alert Mascot -->
  <div class="mascot-perch-row">
    ${getStudioCleanMascotSvg(180, 180)}
    <div class="offline-tag-pill">
      <span>⚡️ 100% Offline Audio</span>
    </div>
  </div>

  <div class="badges-grid">
    <!-- 1. Boat / Water Taxi -->
    <div class="badge-card card-boat">
      <div class="badge-icon-box box-boat">
        <svg width="50" height="50" viewBox="0 0 512 512" fill="currentColor">
          <path d="M438.79 261.21L420.55 228H91.45l-18.24 33.21a48 48 0 00-6.11 23.36V304a48 48 0 0048 48h281.8a48 48 0 0048-48v-19.43a48 48 0 00-6.11-23.36zM320 160h-64v-64h-32v64h-64v32h160v-32z"/>
          <path d="M48 384c26.51 0 48 21.49 48 48s-21.49 48-48 48-48-21.49-48-48 21.49-48 48-48zm128 0c26.51 0 48 21.49 48 48s-21.49 48-48 48-48-21.49-48-48 21.49-48 48-48zm128 0c26.51 0 48 21.49 48 48s-21.49 48-48 48-48-21.49-48-48 21.49-48 48-48zm128 0c26.51 0 48 21.49 48 48s-21.49 48-48 48-48-21.49-48-48 21.49-48 48-48z"/>
        </svg>
      </div>
      <div class="badge-name">Water Taxi & Boat</div>
      <div class="badge-sub">"Pick me up at dock..."</div>
    </div>

    <!-- 2. Power Outage -->
    <div class="badge-card card-power">
      <div class="badge-icon-box box-power">
        <svg width="50" height="50" viewBox="0 0 512 512" fill="currentColor">
          <path d="M315.27 33L96 304h128l-31.51 173.36a16 16 0 0027.62 13.08L416 208H288l31.51-163.36a16 16 0 00-4.24-11.64z"/>
        </svg>
      </div>
      <div class="badge-name">Power Outage Check</div>
      <div class="badge-sub">"Is power back in town?"</div>
    </div>

    <!-- 3. A/C & Refrigeration -->
    <div class="badge-card card-ac">
      <div class="badge-icon-box box-ac">
        <svg width="50" height="50" viewBox="0 0 512 512" fill="none" stroke="currentColor" stroke-width="36" stroke-linecap="round" stroke-linejoin="round">
          <path d="M256 32v448M32 256h448M98 98l316 316M98 414L414 98M160 64l32 64-64 32M64 160l64 32-32 64M352 64l-32 64 64 32M448 160l-64 32 32 64M160 448l32-64-64-32M64 352l64-32-32-64M352 448l-32-64 64-32M448 352l-64-32 32-64"/>
        </svg>
      </div>
      <div class="badge-name">A/C Leaking & Gas</div>
      <div class="badge-sub">"Urgent technician refill"</div>
    </div>

    <!-- 4. Water Delivery & Tanks -->
    <div class="badge-card card-water">
      <div class="badge-icon-box box-water">
        <svg width="50" height="50" viewBox="0 0 512 512" fill="currentColor">
          <path d="M256 43.91s-144 158.3-144 270.3c0 88.36 64.47 153.8 144 153.8s144-65.44 144-153.8C400 202.2 256 43.91 256 43.91zM189.4 394.8c-26.2-12.8-43.4-38.6-43.4-67.6 0-33.1 22.8-73.4 51.5-104.2 4.9-5.3 13.5-5.3 18.4 0 28.7 30.8 51.5 71.1 51.5 104.2 0 29-17.2 54.8-43.4 67.6-11.2 5.5-23.4 5.5-34.6 0z"/>
        </svg>
      </div>
      <div class="badge-name">Water Tank Refill</div>
      <div class="badge-sub">"Send drinking water 5-gal"</div>
    </div>
  </div>

  <div class="more-script">+ 15 island emergency presets 🌴</div>

  <div class="pill-offline">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
    <span>100% Offline Ready • No WiFi Needed</span>
  </div>
</body>
</html>
  `;
  await p2.setContent(html2, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 600));
  await p2.screenshot({ path: path.join(WORKSPACE_DIR, "play_store_screenshot_2_dynamic.png") });
  await p2.close();

  // -------------------------------------------------------------
  // SCREEN 3: Social Proof & Directory Bleed
  // -------------------------------------------------------------
  console.log("⭐ Rendering Screenshot 3 (Social Proof & Directory)...");
  const p3 = await browser.newPage();
  await p3.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html3 = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Lexend:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1920px;
      background: radial-gradient(circle at 50% 12%, #FFF8F0 0%, #FAF8F5 50%, #ECE4D8 100%);
      font-family: "Plus Jakarta Sans", sans-serif;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 100px 70px 0 70px;
      overflow: hidden;
      position: relative;
    }
    .headline-block {
      text-align: center;
      margin-bottom: 24px;
      z-index: 10;
    }
    .main-title {
      font-family: "Lexend", sans-serif;
      font-size: 80px;
      font-weight: 900;
      line-height: 1.08;
      color: #1E293B;
      letter-spacing: -1.6px;
    }
    .main-title span {
      color: #964824;
    }

    /* Laurel Wreath Trust Badge */
    .laurel-badge {
      display: inline-flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 40px;
      background: #FFFFFF;
      border: 2px solid rgba(150, 72, 36, 0.16);
      padding: 14px 36px;
      border-radius: 100px;
      box-shadow: 0 10px 28px rgba(150, 72, 36, 0.12);
      z-index: 20;
    }
    .stars {
      color: #F59E0B;
      font-size: 24px;
      letter-spacing: 3px;
    }
    .laurel-text {
      font-size: 21px;
      font-weight: 800;
      color: #964824;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    /* Half-Screen Bleed */
    .bleed-stage {
      position: relative;
      width: 100%;
      flex: 1;
      display: flex;
      justify-content: center;
    }
    .bleed-phone {
      width: 780px;
      height: 1450px;
      background: #111215;
      border-top-left-radius: 68px;
      border-top-right-radius: 68px;
      padding: 14px 14px 0 14px;
      box-shadow: 
        0 40px 120px rgba(150, 72, 36, 0.35),
        0 16px 40px rgba(0, 0, 0, 0.2);
      border: 4px solid #2D3748;
      border-bottom: none;
      position: relative;
    }
    .phone-notch {
      position: absolute;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      width: 150px;
      height: 34px;
      background: #000000;
      border-radius: 20px;
      z-index: 20;
    }
    .bleed-screen {
      width: 100%;
      height: 100%;
      border-top-left-radius: 54px;
      border-top-right-radius: 54px;
      overflow: hidden;
      background: #FAF8F5;
    }
    .bleed-screen img {
      width: 100%;
      height: auto;
      display: block;
    }
  </style>
</head>
<body>
  <div class="headline-block">
    <h1 class="main-title">Verified Island<br><span>Contractor Directory</span></h1>
  </div>

  <div class="laurel-badge">
    <span class="stars">★★★★★</span>
    <span class="laurel-text">Trusted Bocas del Toro Pros</span>
    <span class="stars">★★★★★</span>
  </div>

  <div class="bleed-stage">
    <div class="bleed-phone">
      <div class="phone-notch"></div>
      <div class="bleed-screen">
        <img src="${screenBase64s.directory}" alt="Verified Island Directory" />
      </div>
    </div>
  </div>
</body>
</html>
  `;
  await p3.setContent(html3, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 600));
  await p3.screenshot({ path: path.join(WORKSPACE_DIR, "play_store_screenshot_3_dynamic.png") });
  await p3.close();

  // -------------------------------------------------------------
  // SCREEN 4: CANONICAL TALKING FRONT MASCOT + DIALECTS
  // -------------------------------------------------------------
  console.log("🗣️ Rendering Screenshot 4 (Canonical Front Mascot + Dialects)...");
  const p4 = await browser.newPage();
  await p4.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  const html4 = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Lexend:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1920px;
      background: radial-gradient(circle at 50% 12%, #FFF8F0 0%, #FAF8F5 50%, #ECE4D8 100%);
      font-family: "Plus Jakarta Sans", sans-serif;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 95px 70px 0 70px;
      overflow: hidden;
      position: relative;
    }
    .headline-block {
      text-align: center;
      margin-bottom: 20px;
      z-index: 10;
    }
    .main-title {
      font-family: "Lexend", sans-serif;
      font-size: 80px;
      font-weight: 900;
      line-height: 1.08;
      color: #1E293B;
      letter-spacing: -1.6px;
    }
    .main-title span {
      color: #964824;
    }

    /* Mascot Row on Dialect Screen */
    .mascot-dialect-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-bottom: 28px;
      z-index: 20;
    }

    /* Dual Tone Switcher Floating Pill */
    .tone-toggle-bar {
      display: flex;
      align-items: center;
      background: #FFFFFF;
      padding: 10px 14px;
      border-radius: 100px;
      border: 2px solid rgba(150, 72, 36, 0.16);
      box-shadow: 0 12px 32px rgba(150, 72, 36, 0.12);
      gap: 12px;
    }
    .tone-chip {
      padding: 14px 34px;
      border-radius: 100px;
      font-size: 23px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .tone-chip.active {
      background: #10B981;
      color: #FFFFFF;
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.3);
    }
    .tone-chip.alt {
      background: #F8FAFC;
      color: #64748B;
    }

    /* Bleed phone UI */
    .bleed-stage {
      position: relative;
      width: 100%;
      flex: 1;
      display: flex;
      justify-content: center;
    }
    .bleed-phone {
      width: 780px;
      height: 1450px;
      background: #111215;
      border-top-left-radius: 68px;
      border-top-right-radius: 68px;
      padding: 14px 14px 0 14px;
      box-shadow: 
        0 40px 120px rgba(150, 72, 36, 0.35),
        0 16px 40px rgba(0, 0, 0, 0.2);
      border: 4px solid #2D3748;
      border-bottom: none;
      position: relative;
    }
    .phone-notch {
      position: absolute;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      width: 150px;
      height: 34px;
      background: #000000;
      border-radius: 20px;
      z-index: 20;
    }
    .bleed-screen {
      width: 100%;
      height: 100%;
      border-top-left-radius: 54px;
      border-top-right-radius: 54px;
      overflow: hidden;
      background: #FAF8F5;
    }
    .bleed-screen img {
      width: 100%;
      height: auto;
      display: block;
    }
  </style>
</head>
<body>
  <div class="headline-block">
    <h1 class="main-title">Switch Seamlessly<br><span>Between Local Tones</span></h1>
  </div>

  <div class="mascot-dialect-row">
    ${getStudioFrontMascotSvg(160, 160)}
    <div class="tone-toggle-bar">
      <div class="tone-chip active">
        <span>🌿</span>
        <span>Poquito (Polite)</span>
      </div>
      <div class="tone-chip alt">
        <span>⚡️</span>
        <span>Full Panameño</span>
      </div>
    </div>
  </div>

  <div class="bleed-stage">
    <div class="bleed-phone">
      <div class="phone-notch"></div>
      <div class="bleed-screen">
        <img src="${screenBase64s.dialect}" alt="Panamanian Dialect Switcher" />
      </div>
    </div>
  </div>
</body>
</html>
  `;
  await p4.setContent(html4, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 600));
  await p4.screenshot({ path: path.join(WORKSPACE_DIR, "play_store_screenshot_4_dynamic.png") });
  await p4.close();

  // -------------------------------------------------------------
  // 5. MASTER 4-UP COMPOSITE (2400x1350 16:9)
  // -------------------------------------------------------------
  console.log("🌟 Rendering 2400x1350 4-Up Showcase...");
  const pShowcase = await browser.newPage();
  await pShowcase.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });

  const s1Buf = fs.readFileSync(path.join(WORKSPACE_DIR, "play_store_screenshot_1_dynamic.png")).toString("base64");
  const s2Buf = fs.readFileSync(path.join(WORKSPACE_DIR, "play_store_screenshot_2_dynamic.png")).toString("base64");
  const s3Buf = fs.readFileSync(path.join(WORKSPACE_DIR, "play_store_screenshot_3_dynamic.png")).toString("base64");
  const s4Buf = fs.readFileSync(path.join(WORKSPACE_DIR, "play_store_screenshot_4_dynamic.png")).toString("base64");

  const htmlShowcase = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=Lexend:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 2400px;
      height: 1350px;
      background: radial-gradient(circle at 50% 20%, #FFF5EB 0%, #FAF8F5 40%, #E2D7C8 100%);
      font-family: "Plus Jakarta Sans", sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 60px 80px;
      overflow: hidden;
    }
    .header-bar {
      text-align: center;
      margin-bottom: 40px;
    }
    .badge-top {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.16);
      padding: 8px 24px;
      border-radius: 100px;
      font-size: 18px;
      font-weight: 800;
      color: #964824;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 12px;
      box-shadow: 0 4px 16px rgba(150,72,36,0.08);
    }
    .title {
      font-family: "Lexend", sans-serif;
      font-size: 54px;
      font-weight: 900;
      color: #1E293B;
      letter-spacing: -1.2px;
    }
    .title span {
      color: #964824;
    }
    .grid-4up {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 36px;
      width: 100%;
      height: 1040px;
    }
    .card-item {
      background: #FFFFFF;
      border-radius: 36px;
      padding: 12px;
      box-shadow: 
        0 24px 60px rgba(150, 72, 36, 0.16),
        0 6px 16px rgba(0, 0, 0, 0.05);
      border: 2px solid rgba(150, 72, 36, 0.12);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 26px;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="badge-top">
      <span>🇵🇦</span>
      <span>PoquitoTalk • Studio-Canonical Mascot Suite</span>
    </div>
    <h1 class="title">Google Play Store <span>High-Conversion Dynamic Assets</span></h1>
  </div>
  <div class="grid-4up">
    <div class="card-item"><img src="data:image/png;base64,${s1Buf}" alt="Slot 1" /></div>
    <div class="card-item"><img src="data:image/png;base64,${s2Buf}" alt="Slot 2" /></div>
    <div class="card-item"><img src="data:image/png;base64,${s3Buf}" alt="Slot 3" /></div>
    <div class="card-item"><img src="data:image/png;base64,${s4Buf}" alt="Slot 4" /></div>
  </div>
</body>
</html>
  `;
  await pShowcase.setContent(htmlShowcase, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 600));
  await pShowcase.screenshot({ path: path.join(WORKSPACE_DIR, "poquitotalk_dynamic_showcase_4up.png") });
  await pShowcase.close();

  // -------------------------------------------------------------
  // 6. PLAY STORE 1024x500 FEATURE GRAPHIC
  // -------------------------------------------------------------
  console.log("🌟 Rendering 1024x500 Google Play Feature Graphic (Canonical)...");
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
    ${getStudioTalkieMascotSvg(320, 320)}
  </div>
</body>
</html>
  `;
  await pFeature.setContent(htmlFeature, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 400));
  await pFeature.screenshot({ path: path.join(WORKSPACE_DIR, "play_store_feature_graphic.png") });
  await pFeature.close();

  await browser.close();
  server.close();
  console.log("🎉 All studio-canonical store assets regenerated successfully!");
}

run().catch(console.error);

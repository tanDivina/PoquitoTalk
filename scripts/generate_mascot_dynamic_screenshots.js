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

// -------------------------------------------------------------
// MASCOT VECTOR DEFINITIONS
// -------------------------------------------------------------

// 1. Walkie-Talkie Dispatcher Mascot (Full Character with Headset & Radio)
function getWalkieTalkieMascotSvg(width = 320, height = 320) {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
    <filter id="mascot-shadow-main" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="rgba(150,72,36,0.24)" />
    </filter>
    
    <g filter="url(#mascot-shadow-main)">
      <!-- Headset Headband -->
      <path d="M 95 105 C 95 42 225 42 225 105" stroke="#1E293B" stroke-width="9" stroke-linecap="round" fill="none"/>
      
      <!-- Headset Earpiece Cushions -->
      <rect x="78" y="92" width="24" height="42" rx="12" fill="#334155" stroke="#0F172A" stroke-width="3.5"/>
      <rect x="218" y="92" width="24" height="42" rx="12" fill="#334155" stroke="#0F172A" stroke-width="3.5"/>

      <!-- Headset Mic Boom -->
      <path d="M 90 125 Q 128 160 170 152" stroke="#1E293B" stroke-width="5.5" stroke-linecap="round" fill="none"/>
      <circle cx="174" cy="152" r="10" fill="#F59E0B" stroke="#0F172A" stroke-width="3.5"/>
      
      <!-- Wooden Perch Branch -->
      <path d="M 50 280 Q 150 272 280 280" stroke="#854D0E" stroke-width="14" stroke-linecap="round"/>

      <!-- Golden Claws -->
      <path d="M 100 268 C 96 278 100 288 108 288 M 110 268 C 106 278 110 288 118 288 M 120 268 C 116 278 120 288 128 288" stroke="#F59E0B" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M 190 268 C 186 278 190 288 198 288 M 200 268 C 196 278 200 288 208 288 M 210 268 C 206 278 210 288 218 288" stroke="#F59E0B" stroke-width="6.5" stroke-linecap="round"/>

      <!-- Parrot Main Body -->
      <path d="M 95 270 C 80 240 75 185 85 135 C 95 88 135 58 175 58 C 212 58 232 88 228 125 C 222 160 228 225 218 255 C 200 280 145 285 95 270 Z" fill="#10B981" stroke="#047857" stroke-width="7"/>

      <!-- Crest Feathers -->
      <path d="M 145 60 C 135 42 125 34 108 32" stroke="#047857" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M 165 56 C 156 38 148 30 132 28" stroke="#047857" stroke-width="5" stroke-linecap="round"/>

      <!-- Cyan Wing -->
      <path d="M 85 175 C 95 145 130 135 150 170 C 160 200 145 250 115 258 C 95 245 85 205 85 175 Z" fill="#06B6D4" stroke="#047857" stroke-width="5.5"/>

      <!-- Big Cute Eye -->
      <circle cx="182" cy="105" r="16" fill="#FFFFFF" stroke="#047857" stroke-width="4.5"/>
      <circle cx="185" cy="105" r="8.5" fill="#0F172A"/>
      <circle cx="182" cy="101" r="3.5" fill="#FFFFFF"/>

      <!-- Golden Beak -->
      <path d="M 205 96 C 245 96 255 122 224 146 C 212 154 196 146 202 132 C 205 118 202 104 205 96 Z" fill="#F59E0B" stroke="#047857" stroke-width="6" stroke-linejoin="round"/>
      <path d="M 203 134 C 215 138 222 143 210 146 C 202 146 201 140 203 134 Z" fill="#D97706" stroke="#047857" stroke-width="2.8"/>

      <!-- Island Walkie-Talkie in Wing -->
      <g transform="translate(202, 168) rotate(-12)">
        <!-- Antenna -->
        <rect x="20" y="-38" width="7" height="44" rx="3.5" fill="#1E293B"/>
        <circle cx="23.5" cy="-38" r="5.5" fill="#DC2626"/>
        <!-- Radio Body -->
        <rect x="0" y="0" width="50" height="92" rx="14" fill="#1E293B" stroke="#0F172A" stroke-width="3.5"/>
        <!-- Speaker Grille -->
        <rect x="9" y="14" width="32" height="30" rx="7" fill="#334155"/>
        <line x1="14" y1="22" x2="36" y2="22" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>
        <line x1="14" y1="28" x2="36" y2="28" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>
        <line x1="14" y1="34" x2="36" y2="34" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>
        <!-- Status LED & PTT Button -->
        <circle cx="14" cy="58" r="4.5" fill="#22C55E"/>
        <rect x="-5" y="26" width="6" height="22" rx="2.5" fill="#F59E0B"/>
      </g>
    </g>
  </svg>
  `;
}

// 2. Wide-Eyed Surprised Mascot (Peeking from Top Corner)
function getPeekingMascotSvg(width = 240, height = 240) {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <filter id="peek-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="rgba(150,72,36,0.2)" />
    </filter>

    <g filter="url(#peek-shadow)">
      <!-- Head Base -->
      <path d="M 50 250 C 40 170 70 70 140 60 C 210 70 240 170 230 250 Z" fill="#10B981" stroke="#047857" stroke-width="6"/>

      <!-- Expressive Crest Feathers Straight Up -->
      <path d="M 125 62 C 115 25 100 10 80 5" stroke="#047857" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M 140 58 C 140 20 138 2 135 -8" stroke="#047857" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M 155 62 C 165 25 180 10 200 5" stroke="#047857" stroke-width="5.5" stroke-linecap="round"/>

      <!-- WIDE OPEN SURPRISED EYES -->
      <!-- Left Eye -->
      <circle cx="105" cy="125" r="28" fill="#FFFFFF" stroke="#047857" stroke-width="5"/>
      <circle cx="108" cy="125" r="14" fill="#0F172A"/>
      <circle cx="102" cy="118" r="6" fill="#FFFFFF"/>
      <circle cx="114" cy="132" r="2.5" fill="#FFFFFF"/>

      <!-- Right Eye -->
      <circle cx="175" cy="125" r="28" fill="#FFFFFF" stroke="#047857" stroke-width="5"/>
      <circle cx="172" cy="125" r="14" fill="#0F172A"/>
      <circle cx="168" cy="118" r="6" fill="#FFFFFF"/>
      <circle cx="180" cy="132" r="2.5" fill="#FFFFFF"/>

      <!-- Open Surprised Beak -->
      <path d="M 122 165 C 120 185 130 210 140 215 C 150 210 160 185 158 165 Z" fill="#F59E0B" stroke="#047857" stroke-width="5"/>
      <ellipse cx="140" cy="185" rx="8" ry="12" fill="#78350F"/>

      <!-- Wing Hands Gripping Border -->
      <path d="M 40 240 C 30 210 60 190 80 225 C 90 240 70 260 40 240 Z" fill="#06B6D4" stroke="#047857" stroke-width="4.5"/>
      <path d="M 240 240 C 250 210 220 190 200 225 C 190 240 210 260 240 240 Z" fill="#06B6D4" stroke="#047857" stroke-width="4.5"/>
    </g>
  </svg>
  `;
}

// 3. Cool Local Panameño Mascot (Sunglasses)
function getCoolLocalMascotSvg(width = 240, height = 240) {
  return `
  <svg width="${width}" height="${height}" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <filter id="cool-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="rgba(150,72,36,0.22)" />
    </filter>
    
    <g filter="url(#cool-shadow)">
      <!-- Main Body & Head -->
      <path d="M 85 250 C 70 220 65 170 75 120 C 85 75 120 45 160 45 C 195 45 215 75 210 110 C 205 145 210 205 200 235 C 185 260 130 265 85 250 Z" fill="#10B981" stroke="#047857" stroke-width="6.5"/>

      <!-- Crest Feathers -->
      <path d="M 135 47 C 125 28 112 18 95 15" stroke="#047857" stroke-width="5" stroke-linecap="round"/>
      <path d="M 152 43 C 148 25 140 14 125 10" stroke="#047857" stroke-width="4.5" stroke-linecap="round"/>

      <!-- Golden Beak -->
      <path d="M 175 95 C 215 92 228 115 200 135 C 185 140 175 130 175 115 Z" fill="#F59E0B" stroke="#047857" stroke-width="5.5" stroke-linejoin="round"/>

      <!-- COOL BLACK SUNGLASSES -->
      <path d="M 95 80 L 138 80 C 142 105 132 118 100 118 C 92 118 90 105 95 80 Z" fill="#0F172A" stroke="#334155" stroke-width="3.5"/>
      <rect x="136" y="86" width="16" height="5" rx="2" fill="#0F172A"/>
      <path d="M 150 80 L 192 80 C 198 105 188 118 155 118 C 148 118 146 105 150 80 Z" fill="#0F172A" stroke="#334155" stroke-width="3.5"/>
      <line x1="102" y1="86" x2="114" y2="110" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
      <line x1="158" y1="86" x2="170" y2="110" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
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

  // Capture screens
  const screens = [
    { tab: "Translate", key: "home" },
    { tab: "Directory", key: "directory" },
    { tab: "Presets", key: "presets" },
  ];

  const screenBase64s = {};

  for (let i = 0; i < screens.length; i++) {
    const s = screens[i];
    const page = await browser.newPage();
    await page.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true });
    await page.goto(`http://localhost:${PORT}/?tab=${s.tab}`, { waitUntil: ["load", "networkidle2"], timeout: 20000 });
    await page.evaluate(() => {
      try {
        localStorage.setItem("@poquito_onboarding_completed", "true");
        localStorage.setItem("@poquito_user_voice", "diego");
      } catch (e) {}
    });
    await page.addStyleTag({
      content: `
        * { box-sizing: border-box; }
        html, body, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; overflow: hidden !important; }
      `
    });
    await new Promise(r => setTimeout(r, 1200));
    const b64 = await page.screenshot({ encoding: "base64" });
    screenBase64s[s.key] = `data:image/png;base64,${b64}`;
    await page.close();
  }

  // -------------------------------------------------------------
  // SCREEN 1: Walkie-Talkie Mascot Dispatch Hero (Clean, Playful, Organic)
  // -------------------------------------------------------------
  console.log("🦜 Rendering Screenshot 1: Walkie-Talkie Mascot Hero...");
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
      padding: 90px 70px 0 70px;
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
      font-size: 78px;
      font-weight: 900;
      line-height: 1.08;
      color: #1E293B;
      letter-spacing: -1.6px;
    }
    .main-title span {
      color: #964824;
    }
    .subtitle-text {
      font-size: 24px;
      font-weight: 700;
      color: #786C5E;
      margin-top: 10px;
    }

    /* Mascot Interaction Card positioned gracefully */
    .mascot-hero-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      width: 100%;
      margin-top: 10px;
      margin-bottom: 20px;
      z-index: 30;
    }
    .mascot-bubble {
      background: #FFFFFF;
      border: 2px solid rgba(150, 72, 36, 0.16);
      padding: 16px 26px;
      border-radius: 24px;
      border-bottom-left-radius: 6px;
      box-shadow: 0 12px 30px rgba(150, 72, 36, 0.12);
      max-width: 360px;
    }
    .bubble-quote {
      font-size: 20px;
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
      padding: 4px 12px;
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
      margin-bottom: -150px;
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
    ${getWalkieTalkieMascotSvg(180, 180)}
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
  // SCREEN 2: Surprised Peeking Mascot + Feature Badges (Exact App Icons)
  // -------------------------------------------------------------
  console.log("👀 Rendering Screenshot 2: Surprised Mascot + Island Presets...");
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

    /* Peeking Mascot */
    .peeking-mascot {
      position: absolute;
      top: 300px;
      right: 70px;
      z-index: 25;
    }

    /* 2x2 Feature Grid */
    .badges-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      width: 100%;
      max-width: 900px;
      margin-top: 100px;
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
      margin-top: 70px;
      text-align: center;
      transform: rotate(-3deg);
    }
    .pill-offline {
      margin-top: 36px;
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

  <!-- Peeking Surprised Mascot -->
  <div class="peeking-mascot">
    ${getPeekingMascotSvg(200, 200)}
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
  console.log("⭐ Rendering Screenshot 3: Laurel Trust + Directory Bleed...");
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
  // SCREEN 4: Cool Local Mascot + Dialects
  // -------------------------------------------------------------
  console.log("😎 Rendering Screenshot 4: Cool Sunglasses Mascot + Dialects...");
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
      padding: 100px 70px 0 70px;
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

    /* Cool Mascot Positioned Top Right */
    .cool-mascot {
      position: absolute;
      top: 300px;
      right: 70px;
      z-index: 25;
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
      margin-bottom: 40px;
      gap: 12px;
      z-index: 20;
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
    <h1 class="main-title">Speak Like A Local,<br><span>Not A Stiff Robot</span></h1>
  </div>

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

  <!-- Cool Mascot with Sunglasses -->
  <div class="cool-mascot">
    ${getCoolLocalMascotSvg(200, 200)}
  </div>

  <div class="bleed-stage">
    <div class="bleed-phone">
      <div class="phone-notch"></div>
      <div class="bleed-screen">
        <img src="${screenBase64s.presets}" alt="Tones & Presets" />
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
  // 4-IN-1 REVIEW COMPOSITE
  // -------------------------------------------------------------
  console.log("🎨 Composing Mascot-Integrated 4-in-1 Review Image...");
  const pAll = await browser.newPage();
  await pAll.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });

  const b1 = `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, "play_store_screenshot_1_dynamic.png")).toString("base64")}`;
  const b2 = `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, "play_store_screenshot_2_dynamic.png")).toString("base64")}`;
  const b3 = `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, "play_store_screenshot_3_dynamic.png")).toString("base64")}`;
  const b4 = `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, "play_store_screenshot_4_dynamic.png")).toString("base64")}`;

  const htmlAll = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Lexend:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 2400px;
      height: 1350px;
      background: radial-gradient(circle at 50% 0%, #FFF8F0 0%, #FAF8F5 50%, #EDE4D8 100%);
      font-family: "Plus Jakarta Sans", sans-serif;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 50px 70px 40px 70px;
      overflow: hidden;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid rgba(150, 72, 36, 0.12);
      padding-bottom: 20px;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .parrot-logo {
      width: 70px;
      height: 70px;
      filter: drop-shadow(0 6px 16px rgba(37, 211, 102, 0.25));
    }
    .brand-title {
      font-family: "Lexend", sans-serif;
      font-size: 36px;
      font-weight: 900;
      color: #1E293B;
      letter-spacing: -0.5px;
    }
    .badge-dynamic {
      background: #FFDBCD;
      color: #964824;
      font-size: 15px;
      font-weight: 800;
      padding: 6px 16px;
      border-radius: 100px;
      border: 1px solid #FD9A6F;
      margin-left: 12px;
    }
    .sub {
      font-size: 18px;
      font-weight: 600;
      color: #786C5E;
      margin-top: 4px;
    }

    .stage {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 32px;
      flex: 1;
      margin: 24px 0;
    }
    .card-wrap {
      flex: 1;
      height: 100%;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(89, 79, 66, 0.18), 0 6px 16px rgba(0, 0, 0, 0.06);
      border: 2.5px solid rgba(255, 255, 255, 0.9);
      background: #FFFFFF;
    }
    .card-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1.5px solid rgba(150, 72, 36, 0.12);
      padding-top: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #5C554D;
    }
    .footer strong { color: #1E293B; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-group">
      <svg class="parrot-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
        <path d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z" fill="none" stroke="#25D366" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 62 161 Q 86 159 112 161" stroke="#B45309" stroke-width="6" stroke-linecap="round"/>
        <path d="M 74 152 C 72 158 74 164 78 164 M 80 152 C 78 158 80 164 84 164 M 91 152 C 89 158 91 164 95 164 M 97 152 C 95 158 97 164 101 164" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
        <path d="M 62 152 C 55 138 52 122 55 105 C 58 78 72 55 92 55 C 108 55 116 70 114 85 C 112 102 114 128 110 142 C 102 155 82 160 62 152 Z" fill="#10B981" stroke="#047857" stroke-width="4.5"/>
        <g id="logo-crest">
          <path d="M 74 56.5 C 70 48 66 43 60 42" stroke="#047857" stroke-width="3" stroke-linecap="round" fill="none"/>
          <path d="M 84 54.0 C 80 46 76 42 70 41" stroke="#047857" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        </g>
        <path d="M 58 112 C 62 98 76 92 86 108 C 92 122 86 145 70 148 C 62 140 57 126 58 112 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5"/>
        <circle cx="95" cy="74" r="8" fill="#FFFFFF" stroke="#047857" stroke-width="2.5"/>
        <circle cx="93.5" cy="74" r="4" fill="#0F172A"/>
        <circle cx="92" cy="72" r="1.5" fill="#FFFFFF"/>
        <path d="M 110 70 C 124 70 130 82 118 94 C 113 98 106 94 108 88 C 110 82 108 74 110 70 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round"/>
      </svg>
      <div>
        <div class="brand-title">PoquitoTalk <span class="badge-dynamic">Mascot Storytelling Set</span></div>
        <div class="sub">Expressive Character Interaction • Walkie-Talkie Dispatch & Island Life</div>
      </div>
    </div>
    <div style="font-weight: 700; color: #964824;">Google Play & App Store Ready (1080×1920)</div>
  </div>

  <div class="stage">
    <div class="card-wrap"><img src="${b1}" /></div>
    <div class="card-wrap"><img src="${b2}" /></div>
    <div class="card-wrap"><img src="${b3}" /></div>
    <div class="card-wrap"><img src="${b4}" /></div>
  </div>

  <div class="footer">
    <div>Character-Driven Conversion Psychology (Duolingo / Clucky Standard)</div>
    <div>PoquitoTalk • Created by <strong>@DorienVibecodes</strong> • poquitotalk.hero-apps.com</div>
  </div>
</body>
</html>
  `;
  await pAll.setContent(htmlAll, { waitUntil: "domcontentloaded" });
  await new Promise(r => setTimeout(r, 600));
  await pAll.screenshot({ path: path.join(WORKSPACE_DIR, "poquitotalk_dynamic_showcase_4up.png") });
  await pAll.close();

  await browser.close();
  server.close();
  console.log("🎉 Mascot dynamic screenshots rendered successfully!");
}

run().catch(console.error);

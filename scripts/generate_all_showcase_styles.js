const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const DESKTOP_DIR = '/Users/dorienvandenabbeele/Desktop';
const PORT = 8099;

const POQUITO_ICON_SVG = `<svg class="parrot-logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" style="width:100%;height:100%;">
  <!-- Outer Speech Bubble (Island Emerald Green) -->
  <path
    d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
    fill="none"
    stroke="#10B981"
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
</svg>`;

// ── Static Web Server for Pure App Screen Captures ─────────────
function startStaticServer() {
  return new Promise((resolve) => {
    const serve = serveStatic(DIST_DIR, { index: ['index.html'] });
    const server = http.createServer((req, res) => {
      serve(req, res, finalhandler(req, res));
    });
    server.listen(PORT, () => {
      console.log(`🌐 App server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

// ── Puppeteer Pure Screen Capture Helper ────────────────────────
async function captureAppScreen(browser, queryParams, options = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2.5 });
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('has_completed_onboarding', 'true');
    localStorage.setItem('has_seen_welcome_guide', 'true');
    localStorage.setItem('poquito_is_pro', 'true');
  });
  await page.goto(`http://localhost:${PORT}/?${queryParams}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1200));

  if (options.scrollOffset) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), options.scrollOffset);
    await new Promise((r) => setTimeout(r, 400));
  }
  if (options.hScrollText) {
    await page.evaluate((targetText) => {
      const all = Array.from(document.querySelectorAll('*'));
      const textNodes = all.filter(el => el.children.length === 0 && el.innerText && el.innerText.trim() === targetText);
      if (textNodes.length > 0) {
        let pill = textNodes[0];
        while (pill && pill.parentElement && pill.parentElement.children.length === 1) {
          pill = pill.parentElement;
        }
        if (pill && pill.parentElement && pill.parentElement.children.length > 1 && pill.parentElement.parentElement && (pill.parentElement.parentElement.scrollWidth > pill.parentElement.parentElement.clientWidth)) {
          pill = pill.parentElement;
        }
        let p = pill ? pill.parentElement : textNodes[0].parentElement;
        while (p && p !== document.body) {
          const style = window.getComputedStyle(p);
          const isScrollable = (style.overflowX === 'scroll' || style.overflowX === 'auto') || p.scrollWidth > p.clientWidth;
          if (isScrollable) {
            const pillRect = pill.getBoundingClientRect();
            const pRect = p.getBoundingClientRect();
            const offsetInside = (pillRect.left - pRect.left) + p.scrollLeft;
            p.scrollLeft = Math.max(0, offsetInside - 36);
            break;
          }
          p = p.parentElement;
        }
      }
    }, options.hScrollText);
    await new Promise((r) => setTimeout(r, 400));
  }

  const buf = await page.screenshot({ type: 'png' });
  await page.close();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function generateAllShowcases() {
  console.log('🚀 Generating Calibrated High-Res Multi-Style Showcase Presentations…');

  const server = await startStaticServer();

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  console.log('📱 Capturing pure mobile app screens for device mockups…');
  const appScreen1 = await captureAppScreen(
    browser,
    'tab=Translate&prompt=Can%20you%20check%20the%20AC%20freon%20today%3F&output=%C2%A1Buenas!%20%C2%BFPuedes%20revisar%20el%20gas%20del%20aire%20hoy%20mismo%3F'
  );
  const appScreen2 = await captureAppScreen(browser, 'tab=Presets&preset=water_taxi', { scrollOffset: 75, hScrollText: 'Boats' });
  const appScreen3 = await captureAppScreen(browser, 'tab=Directory', { scrollOffset: 0 });
  
  let appScreen4;
  if (fs.existsSync(path.join(WORKSPACE_DIR, 'walkie_explainer_sheet.png'))) {
    appScreen4 = `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'walkie_explainer_sheet.png')).toString('base64')}`;
  } else {
    appScreen4 = await captureAppScreen(browser, 'tab=Translate&onboarding=false&splash=false&walkie=true');
  }

  const img1Path = path.join(WORKSPACE_DIR, 'play_store_screenshot_1_dynamic.png');
  const img2Path = path.join(WORKSPACE_DIR, 'play_store_screenshot_2_dynamic.png');
  const img3Path = path.join(WORKSPACE_DIR, 'play_store_screenshot_3_dynamic.png');
  const img4Path = path.join(WORKSPACE_DIR, 'play_store_screenshot_4_dynamic.png');

  const base64_1 = `data:image/png;base64,${fs.readFileSync(img1Path).toString('base64')}`;
  const base64_2 = `data:image/png;base64,${fs.readFileSync(img2Path).toString('base64')}`;
  const base64_3 = `data:image/png;base64,${fs.readFileSync(img3Path).toString('base64')}`;
  const base64_4 = `data:image/png;base64,${fs.readFileSync(img4Path).toString('base64')}`;

  // =========================================================================
  // STYLE 1: SIGNATURE FANNED PLAYING CARDS DECK (2400 x 1350)
  // =========================================================================
  console.log('🎨 1. Generating Fanned Playing Cards Stack Showcase…');
  const page1 = await browser.newPage();
  await page1.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });

  const html1 = `
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
      background: #FAF8F5;
      background-image: 
        radial-gradient(circle at 50% 10%, #FFF5EE 0%, #FAF8F5 45%, #EBE4D8 100%),
        radial-gradient(rgba(150, 72, 36, 0.045) 1.5px, transparent 1.5px);
      background-size: 100% 100%, 36px 36px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #1A1208;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 55px 90px 40px 90px;
      overflow: hidden;
      position: relative;
    }

    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid rgba(150, 72, 36, 0.12);
      padding-bottom: 20px;
      z-index: 20;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .brand-logo {
      width: 68px;
      height: 68px;
      filter: drop-shadow(0 6px 16px rgba(16, 185, 129, 0.25));
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 38px;
      font-weight: 900;
      color: #1A1208;
      display: flex;
      align-items: center;
      gap: 14px;
      letter-spacing: -0.5px;
    }
    .badge-panama {
      background: #FFDBCD;
      color: #964824;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 15px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 100px;
      border: 1px solid #FD9A6F;
    }
    .brand-tagline {
      font-size: 18px;
      font-weight: 600;
      color: #5C4E3A;
      margin-top: 3px;
    }
    .deck-badge {
      font-family: 'Lexend', sans-serif;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      background: #FFFFFF;
      color: #059669;
      border: 1.5px solid rgba(5, 150, 105, 0.35);
      padding: 10px 22px;
      border-radius: 100px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
    }

    .fanned-deck-stage {
      position: relative;
      width: 100%;
      height: 1020px;
      display: flex;
      z-index: 10;
    }

    .fanned-card {
      position: absolute;
      width: 470px;
      height: 835px;
      border-radius: 34px;
      overflow: hidden;
      background: #FFFFFF;
      box-shadow: 
        0 24px 60px rgba(89, 79, 66, 0.20),
        0 6px 18px rgba(0, 0, 0, 0.08);
      border: 3.5px solid #FFFFFF;
      transform-origin: 50% 120%;
      transition: all 0.3s ease;
    }
    .fanned-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }

    .card-slot-1 {
      left: 240px;
      top: 130px;
      transform: rotate(-13deg);
      z-index: 1;
    }
    .card-slot-2 {
      left: 680px;
      top: 90px;
      transform: rotate(-4.5deg);
      z-index: 2;
    }
    .card-slot-3 {
      left: 1120px;
      top: 90px;
      transform: rotate(4.5deg);
      z-index: 3;
    }
    .card-slot-4 {
      left: 1560px;
      top: 130px;
      transform: rotate(13deg);
      z-index: 4;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 2px solid rgba(150, 72, 36, 0.12);
      padding-top: 16px;
      font-size: 16.5px;
      font-weight: 700;
      color: #5C4E3A;
      z-index: 20;
    }
  </style>
</head>
<body>

  <div class="top-bar">
    <div class="brand-left">
      <div class="brand-logo">${POQUITO_ICON_SVG}</div>
      <div>
        <div class="brand-title"><span class="brand-name">Poquito<span style="color:#964824;">Talk</span></span> <span class="badge-panama">Bocas del Toro 🇵🇦</span></div>
        <div class="brand-tagline">Panamá Expat Spanish Translator & Island Service Ecosystem</div>
      </div>
    </div>
    <div class="deck-badge">✨ Signature Fanned Deck Showcase</div>
  </div>

  <div class="fanned-deck-stage">
    <div class="fanned-card card-slot-1"><img src="${base64_1}" alt="1" /></div>
    <div class="fanned-card card-slot-2"><img src="${base64_2}" alt="2" /></div>
    <div class="fanned-card card-slot-3"><img src="${base64_3}" alt="3" /></div>
    <div class="fanned-card card-slot-4"><img src="${base64_4}" alt="4" /></div>
  </div>

  <div class="footer">
    <div>Google Play Ready • 4-Part Island Communication Suite</div>
    <div>Designed by <strong>@DorienVibecodes</strong> • poquitotalk.hero-apps.com</div>
  </div>

</body>
</html>
  `;

  await page1.setContent(html1, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 900));
  const out1 = path.join(WORKSPACE_DIR, 'showcase_fanned_cards_deck.png');
  await page1.screenshot({ path: out1, type: 'png' });
  fs.copyFileSync(out1, path.join(DESKTOP_DIR, 'showcase_fanned_cards_deck.png'));
  console.log(`✅ Saved Style 1: ${out1}`);
  await page1.close();


  // =========================================================================
  // STYLE 2: 3D ISOMETRIC STAGGERED PERSPECTIVE (PURE PHONE SCREENS ONLY)
  // =========================================================================
  console.log('🎨 2. Generating 3D Isometric Staggered Perspective (Pure Phone Screens Only)…');
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });

  const html2 = `
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
      background: radial-gradient(circle at 75% 35%, #FFF6EB 0%, #FAF6F0 45%, #EADCCE 100%);
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #1A1208;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 70px 90px;
      overflow: hidden;
      position: relative;
    }
    
    .info-pane {
      max-width: 820px;
      z-index: 20;
    }
    .skill-tag {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.3);
      padding: 8px 20px;
      border-radius: 100px;
      font-size: 15px;
      font-weight: 800;
      color: #964824;
      letter-spacing: 1.2px;
      margin-bottom: 24px;
      box-shadow: 0 4px 16px rgba(150, 72, 36, 0.08);
      text-transform: uppercase;
    }
    .main-title {
      font-family: 'Lexend', sans-serif;
      font-size: 64px;
      font-weight: 900;
      line-height: 1.12;
      color: #1A1208;
      letter-spacing: -1.2px;
      margin-bottom: 22px;
    }
    .main-title span { color: #059669; }
    .subtext {
      font-size: 23px;
      font-weight: 600;
      color: #5C4E3A;
      line-height: 1.48;
      margin-bottom: 38px;
    }
    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 42px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 20px;
      font-weight: 700;
      color: #2D3748;
    }
    .feature-icon {
      width: 38px;
      height: 38px;
      background: #D1FAE5;
      color: #059669;
      border: 1.5px solid #6EE7B7;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 18px;
      flex-shrink: 0;
    }
    .author-badge {
      font-size: 18px;
      font-weight: 600;
      color: #786C5E;
      border-top: 1.5px solid rgba(150,72,36,0.12);
      padding-top: 20px;
    }
    .author-badge strong { color: #1A1208; }

    /* 3D Isometric Phone Stage */
    .stage-3d {
      position: relative;
      width: 1350px;
      height: 1100px;
      perspective: 2400px;
      perspective-origin: 20% 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stack-container {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transform: rotateY(-25deg) rotateX(12deg) rotateZ(3deg);
    }

    /* Realistic Phone Mockups */
    .iso-phone {
      position: absolute;
      width: 440px;
      height: 950px;
      border-radius: 52px;
      background: #151518;
      padding: 11px;
      box-shadow: 
        -32px 42px 90px rgba(0, 0, 0, 0.40),
        -12px 18px 36px rgba(150, 72, 36, 0.22);
      border: 3.5px solid #2B2B32;
      transform-style: preserve-3d;
    }
    .phone-notch {
      position: absolute;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      width: 82px;
      height: 20px;
      background: #000000;
      border-radius: 14px;
      z-index: 30;
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 42px;
      overflow: hidden;
      background: #FAF8F5;
      position: relative;
    }
    .phone-screen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
    }

    /* 3D Depth Positioning */
    .phone-1 {
      top: 50px;
      left: 20px;
      z-index: 1;
      opacity: 0.90;
      transform: translateZ(-210px);
      filter: brightness(0.92);
    }
    .phone-2 {
      top: 90px;
      left: 235px;
      z-index: 2;
      opacity: 0.95;
      transform: translateZ(-105px);
      filter: brightness(0.96);
    }
    .phone-3 {
      top: 130px;
      left: 450px;
      z-index: 3;
      transform: translateZ(0px);
      box-shadow: 
        -40px 52px 110px rgba(150, 72, 36, 0.32),
        -15px 22px 45px rgba(0, 0, 0, 0.22);
    }
    .phone-4 {
      top: 170px;
      left: 665px;
      z-index: 4;
      transform: translateZ(105px);
    }
  </style>
</head>
<body>

  <div class="info-pane">
    <div class="skill-tag">⚡ 3D Isometric Depth Presentation</div>
    <h1 class="main-title">Bocas del Toro’s <span>#1 Expat Audio Translator</span> & Island Directory</h1>
    <p class="subtext">Speak in plain English. PoquitoTalk formats and transmits studio-grade Panamanian Spanish audio notes directly to island WhatsApp contacts in one tap.</p>
    
    <div class="feature-list">
      <div class="feature-item">
        <div class="feature-icon">✓</div>
        <span>Instant WhatsApp Voice Note Dispatch (Natural Panameño)</span>
      </div>
      <div class="feature-item">
        <div class="feature-icon">✓</div>
        <span>100% Offline Presets (Water Taxis, Power, Leaks & ATMs)</span>
      </div>
      <div class="feature-item">
        <div class="feature-icon">✓</div>
        <span>Verified Island Service Providers & Direct WhatsApp Links</span>
      </div>
      <div class="feature-item">
        <div class="feature-icon">✓</div>
        <span>2-Way Live Walkie-Talkie (Runs on Any Browser Without App)</span>
      </div>
    </div>

    <div class="author-badge">Google Play Store Edition • Created by <strong>@DorienVibecodes</strong></div>
  </div>

  <div class="stage-3d">
    <div class="stack-container">
      <div class="iso-phone phone-1">
        <div class="phone-notch"></div>
        <div class="phone-screen"><img src="${appScreen4}" alt="Talk Live" /></div>
      </div>
      <div class="iso-phone phone-2">
        <div class="phone-notch"></div>
        <div class="phone-screen"><img src="${appScreen3}" alt="Directory" /></div>
      </div>
      <div class="iso-phone phone-3">
        <div class="phone-notch"></div>
        <div class="phone-screen"><img src="${appScreen2}" alt="Presets" /></div>
      </div>
      <div class="iso-phone phone-4">
        <div class="phone-notch"></div>
        <div class="phone-screen"><img src="${appScreen1}" alt="Home" /></div>
      </div>
    </div>
  </div>

</body>
</html>
  `;

  await page2.setContent(html2, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 900));
  const out2 = path.join(WORKSPACE_DIR, 'showcase_3d_isometric_hyperframes.png');
  await page2.screenshot({ path: out2, type: 'png' });
  fs.copyFileSync(out2, path.join(DESKTOP_DIR, 'showcase_3d_isometric_hyperframes.png'));
  console.log(`✅ Saved Style 2: ${out2}`);
  await page2.close();


  // =========================================================================
  // STYLE 3: PANORAMIC 4-UP WITH METRIC RIBBONS (2400 x 1350)
  // =========================================================================
  console.log('🎨 3. Generating Panoramic 4-Up Gallery Showcase…');
  const page3 = await browser.newPage();
  await page3.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });

  const html3 = `
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
      color: #1A1208;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 36px 60px 24px 60px;
      overflow: hidden;
      position: relative;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid rgba(150, 72, 36, 0.12);
      padding-bottom: 14px;
      z-index: 10;
    }
    .brand-box {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-icon {
      width: 68px;
      height: 68px;
      filter: drop-shadow(0 6px 16px rgba(16, 185, 129, 0.25));
    }
    .brand-headline {
      font-family: 'Lexend', sans-serif;
      font-size: 36px;
      font-weight: 900;
      color: #1A1208;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-headline .talk-accent {
      color: #964824;
    }
    .brand-headline .country-badge {
      background: #FFDBCD;
      color: #964824;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 15px;
      font-weight: 800;
      padding: 5px 14px;
      border-radius: 100px;
      border: 1px solid #FD9A6F;
    }
    .brand-sub {
      font-size: 17px;
      font-weight: 600;
      color: #5C4E3A;
      margin-top: 3px;
    }
    .spec-pill {
      font-family: 'Lexend', sans-serif;
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      background: #FFFFFF;
      color: #964824;
      border: 1.5px solid rgba(150, 72, 36, 0.3);
      padding: 8px 20px;
      border-radius: 100px;
    }

    .gallery-stage {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 28px;
      width: 100%;
      flex: 1;
      margin: 14px 0 10px 0;
      z-index: 10;
    }
    .gallery-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .col-header {
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.2);
      border-radius: 100px;
      padding: 6px 16px;
      font-size: 13px;
      font-weight: 800;
      color: #964824;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(150, 72, 36, 0.06);
    }
    .screenshot-frame {
      width: 100%;
      aspect-ratio: 9 / 16;
      border-radius: 26px;
      overflow: hidden;
      box-shadow: 
        0 20px 50px rgba(89, 79, 66, 0.18),
        0 4px 12px rgba(0, 0, 0, 0.05);
      border: 3.5px solid #FFFFFF;
      background: #FAF8F5;
    }
    .screenshot-frame img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      border-top: 2px solid rgba(150, 72, 36, 0.12);
      padding-top: 12px;
      font-size: 16px;
      font-weight: 700;
      color: #5C4E3A;
      z-index: 10;
    }
    .footer strong { color: #1A1208; }
  </style>
</head>
<body>

  <div class="header-bar">
    <div class="brand-box">
      <div class="brand-icon">${POQUITO_ICON_SVG}</div>
      <div>
        <div class="brand-headline"><span class="brand-name">Poquito<span class="talk-accent">Talk</span></span> <span class="country-badge">Panamá 🇵🇦</span></div>
        <div class="brand-sub">Instant Panameño Voice Notes & Verified Bocas del Toro Directory</div>
      </div>
    </div>
    <div class="spec-pill">Google Play Store Edition • 1080 × 1920</div>
  </div>

  <div class="gallery-stage">
    <div class="gallery-col">
      <div class="col-header">1 • 1-Tap Translation</div>
      <div class="screenshot-frame"><img src="${base64_1}" alt="Home" /></div>
    </div>
    <div class="gallery-col">
      <div class="col-header">2 • Offline Presets</div>
      <div class="screenshot-frame"><img src="${base64_2}" alt="Presets" /></div>
    </div>
    <div class="gallery-col">
      <div class="col-header">3 • Island Directory</div>
      <div class="screenshot-frame"><img src="${base64_3}" alt="Directory" /></div>
    </div>
    <div class="gallery-col">
      <div class="col-header">4 • 2-Way Walkie-Talkie</div>
      <div class="screenshot-frame"><img src="${base64_4}" alt="Talk Live" /></div>
    </div>
  </div>

  <div class="footer">
    <div>Outcome-Driven Messaging • Bocas del Toro Island Palette • Poquito Mascot Series</div>
    <div>Created by <strong>@DorienVibecodes</strong> • poquitotalk.hero-apps.com</div>
  </div>

</body>
</html>
  `;

  await page3.setContent(html3, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 900));
  const out3 = path.join(WORKSPACE_DIR, 'showcase_panoramic_4up_gallery.png');
  await page3.screenshot({ path: out3, type: 'png' });
  fs.copyFileSync(out3, path.join(DESKTOP_DIR, 'showcase_panoramic_4up_gallery.png'));
  console.log(`✅ Saved Style 3: ${out3}`);
  await page3.close();


  // =========================================================================
  // STYLE 4: HERO-APPS DARK GLASSMORPHISM (2400 x 1350)
  // =========================================================================
  console.log('🎨 4. Generating Dark Glassmorphism Showcase…');
  const page4 = await browser.newPage();
  await page4.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });

  const html4 = `
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
      background: #050507;
      background-image: 
        radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
        radial-gradient(rgba(255, 255, 255, 0.05) 1.5px, transparent 1.5px);
      background-size: 100% 100%, 36px 36px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #F8FAFC;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 36px 60px 24px 60px;
      overflow: hidden;
      position: relative;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 14px;
      z-index: 10;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .parrot-logo {
      width: 68px;
      height: 68px;
      filter: drop-shadow(0 0 20px rgba(52, 211, 153, 0.4));
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 36px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .country-badge {
      background: rgba(16, 185, 129, 0.15);
      color: #34D399;
      font-size: 14px;
      font-weight: 800;
      padding: 5px 12px;
      border-radius: 100px;
      border: 1px solid rgba(52, 211, 153, 0.35);
    }
    .brand-subtitle {
      font-size: 17px;
      font-weight: 600;
      color: #94A3B8;
      margin-top: 3px;
    }
    .skill-tag {
      font-family: 'Lexend', sans-serif;
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      background: rgba(16, 185, 129, 0.12);
      color: #34D399;
      border: 1.5px solid rgba(52, 211, 153, 0.35);
      padding: 8px 20px;
      border-radius: 100px;
    }

    .showcase-stage {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 28px;
      width: 100%;
      flex: 1;
      margin: 14px 0 10px 0;
      z-index: 10;
    }
    .card-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .col-label {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.10);
      border-radius: 100px;
      padding: 6px 16px;
      font-size: 13px;
      font-weight: 800;
      color: #34D399;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 10px;
      backdrop-filter: blur(10px);
    }
    .screenshot-frame {
      width: 100%;
      aspect-ratio: 9 / 16;
      border-radius: 26px;
      overflow: hidden;
      box-shadow: 
        0 25px 60px rgba(0, 0, 0, 0.70),
        0 0 30px rgba(16, 185, 129, 0.15);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      background: #0C0C0F;
    }
    .screenshot-frame img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 20px;
      font-size: 17px;
      font-weight: 600;
      color: #64748B;
      z-index: 10;
    }
    .footer strong { color: #F8FAFC; }
  </style>
</head>
<body>

  <div class="header">
    <div class="brand-group">
      <div class="parrot-logo">${POQUITO_ICON_SVG}</div>
      <div>
        <div class="brand-title"><span class="brand-name">Poquito<span style="color:#a8ff35;">Talk</span></span> <span class="country-badge">Panamá 🇵🇦</span></div>
        <div class="brand-subtitle">Instant Panama Spanish Voice Notes & Verified Bocas del Toro Directory</div>
      </div>
    </div>
    <div class="skill-tag">Hero-Apps Dark Glassmorphism</div>
  </div>

  <div class="showcase-stage">
    <div class="card-col">
      <div class="col-label">1 • 1-Tap Dispatch</div>
      <div class="screenshot-frame"><img src="${base64_1}" alt="Home" /></div>
    </div>
    <div class="card-col">
      <div class="col-label">2 • Offline Presets</div>
      <div class="screenshot-frame"><img src="${base64_2}" alt="Presets" /></div>
    </div>
    <div class="card-col">
      <div class="col-label">3 • Island Directory</div>
      <div class="screenshot-frame"><img src="${base64_3}" alt="Directory" /></div>
    </div>
    <div class="card-col">
      <div class="col-label">4 • 2-Way Walkie-Talkie</div>
      <div class="screenshot-frame"><img src="${base64_4}" alt="Talk Live" /></div>
    </div>
  </div>

  <div class="footer">
    <div>Hero-Apps Design System • Dark Glassmorphism</div>
    <div>Built by <strong>@DorienVibecodes</strong> • poquitotalk.hero-apps.com</div>
  </div>

</body>
</html>
  `;

  await page4.setContent(html4, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 900));
  const out4 = path.join(WORKSPACE_DIR, 'showcase_dark_glassmorphism.png');
  await page4.screenshot({ path: out4, type: 'png' });
  fs.copyFileSync(out4, path.join(DESKTOP_DIR, 'showcase_dark_glassmorphism.png'));
  console.log(`✅ Saved Style 4: ${out4}`);
  await page4.close();

  // =========================================================================
  // STYLE 5: MASTER 4-STYLE COMPARISON GRID (2400 x 1650 - Exact 16:9 Aspect)
  // =========================================================================
  console.log('🎨 5. Generating Master Showcase Grid…');
  const page5 = await browser.newPage();
  await page5.setViewport({ width: 2400, height: 1650, deviceScaleFactor: 1 });

  const b64_s1 = `data:image/png;base64,${fs.readFileSync(out1).toString('base64')}`;
  const b64_s2 = `data:image/png;base64,${fs.readFileSync(out2).toString('base64')}`;
  const b64_s3 = `data:image/png;base64,${fs.readFileSync(out3).toString('base64')}`;
  const b64_s4 = `data:image/png;base64,${fs.readFileSync(out4).toString('base64')}`;

  const html5 = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=Lexend:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 2400px;
      height: 1650px;
      background: #F4F0E8;
      font-family: 'Plus Jakarta Sans', sans-serif;
      padding: 50px 70px 40px 70px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .header { text-align: center; margin-bottom: 12px; }
    .title { font-family: 'Lexend', sans-serif; font-size: 46px; font-weight: 900; color: #1A1208; letter-spacing: -0.8px; }
    .subtitle { font-size: 20px; font-weight: 600; color: #5C4E3A; margin-top: 4px; }
    .grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; flex: 1; margin: 16px 0; }
    .grid-cell { display: flex; flex-direction: column; gap: 10px; }
    .cell-title { font-family: 'Lexend', sans-serif; font-size: 18px; font-weight: 800; color: #964824; display: flex; align-items: center; gap: 8px; }
    .cell-frame { width: 100%; height: 625px; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.12); border: 3px solid #FFFFFF; background: #FFFFFF; }
    .cell-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .footer { display: flex; justify-content: space-between; border-top: 2px solid rgba(150,72,36,0.15); padding-top: 16px; font-size: 16px; font-weight: 700; color: #5C4E3A; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Poquito<span style="color:#964824;">Talk</span> — Multi-Style Presentation Suite</div>
    <div class="subtitle">4 Distinct Presentation Formats Generated from Latest Google Play Screenshot Assets</div>
  </div>

  <div class="grid-2x2">
    <div class="grid-cell">
      <div class="cell-title">A. Signature Fanned Cards Stacked Deck</div>
      <div class="cell-frame"><img src="${b64_s1}" /></div>
    </div>
    <div class="grid-cell">
      <div class="cell-title">B. 3D Isometric Staggered Perspective (Pure Phone Screens)</div>
      <div class="cell-frame"><img src="${b64_s2}" /></div>
    </div>
    <div class="grid-cell">
      <div class="cell-title">C. Panoramic 4-Up Gallery</div>
      <div class="cell-frame"><img src="${b64_s3}" /></div>
    </div>
    <div class="grid-cell">
      <div class="cell-title">D. Hero-Apps Dark Glassmorphism</div>
      <div class="cell-frame"><img src="${b64_s4}" /></div>
    </div>
  </div>

  <div class="footer">
    <div>PoquitoTalk Google Play Assets • Ready for Social / Landing Page / Pitch Deck</div>
    <div>Created by <strong>@DorienVibecodes</strong> • poquitotalk.hero-apps.com</div>
  </div>
</body>
</html>
  `;

  await page5.setContent(html5, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 900));
  const out5 = path.join(WORKSPACE_DIR, 'showcase_all_presentation_styles_grid.png');
  await page5.screenshot({ path: out5, type: 'png' });
  fs.copyFileSync(out5, path.join(DESKTOP_DIR, 'showcase_all_presentation_styles_grid.png'));
  console.log(`✅ Saved Master Grid: ${out5}`);
  await page5.close();

  await browser.close();
  server.close();
  console.log('🎉 All 5 showcase styles calibrated with pure phone screens and saved to Desktop!');
}

generateAllShowcases().catch(err => {
  console.error('❌ Error generating showcase presentations:', err);
  process.exit(1);
});

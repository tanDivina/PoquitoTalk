#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function startStaticServer(serveDir, port = 8170) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(serveDir, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const fallbackHtml = path.join(serveDir, 'index.html');
      if (fs.existsSync(fallbackHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(fallbackHtml).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve({ server, port, baseUrl: `http://localhost:${port}` });
    });
  });
}

async function captureAllActualAppScreens() {
  console.log('🚀 Starting static server for actual React Native dist bundle on port 8170...');
  const { server, baseUrl } = await startStaticServer(DIST_DIR, 8170);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 393,
      height: 852,
      deviceScaleFactor: 2, // 2x Retina
      isMobile: true,
      hasTouch: true,
    });

    const setupAuthAndSession = async () => {
      await page.evaluate(() => {
        localStorage.setItem('hasCompletedOnboarding_v3', 'true');
        localStorage.setItem('hasCompletedOnboarding', 'true');
        localStorage.setItem('user_persona_v2', JSON.stringify({
          name: 'Dorien',
          location: 'Bocas del Toro',
          voiceGender: 'male',
          isPro: true
        }));
      });
    };

    // 1. Capture Real App Screen 1: Home / Translation State
    console.log('📸 1. Capturing Real App Screen 1: English ➔ Spanish Translation Card...');
    await page.goto(`${baseUrl}/?tab=Translate&translated=true`, { waitUntil: 'networkidle0' });
    await setupAuthAndSession();
    await page.goto(`${baseUrl}/?tab=Translate&translated=true`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const screen1Path = path.join(WORKSPACE_DIR, 'actual_app_screen_1_translation.png');
    await page.screenshot({ path: screen1Path });
    console.log(`✅ Saved: ${screen1Path}`);

    // 2. Capture Real App Screen 2: Active Walkie-Talkie Channel Notification Banner
    console.log('📸 2. Capturing Real App Screen 2: Active Walkie-Talkie Channel Banner...');
    await page.goto(`${baseUrl}/?tab=Translate&walkieActive=true&history=true`, { waitUntil: 'networkidle0' });
    await setupAuthAndSession();
    await page.goto(`${baseUrl}/?tab=Translate&walkieActive=true&history=true`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const screen2Path = path.join(WORKSPACE_DIR, 'actual_app_screen_2_walkie_channel.png');
    await page.screenshot({ path: screen2Path });
    console.log(`✅ Saved: ${screen2Path}`);

    // 3. Capture Real App Screen 3: Live Incoming Contractor Voice Message Translated to English
    console.log('📸 3. Capturing Real App Screen 3: Incoming Contractor Voice Message Card...');
    await page.goto(`${baseUrl}/?tab=Translate&incoming=true`, { waitUntil: 'networkidle0' });
    await setupAuthAndSession();
    await page.goto(`${baseUrl}/?tab=Translate&incoming=true`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const screen3Path = path.join(WORKSPACE_DIR, 'actual_app_screen_3_incoming_audio.png');
    await page.screenshot({ path: screen3Path });
    console.log(`✅ Saved: ${screen3Path}`);

    // 4. Capture Real App Screen 4: 2-Way Walkie-Talkie Explainer Modal
    console.log('📸 4. Capturing Real App Screen 4: Walkie Explainer Modal...');
    await page.goto(`${baseUrl}/?tab=Translate&walkie=true`, { waitUntil: 'networkidle0' });
    await setupAuthAndSession();
    await page.goto(`${baseUrl}/?tab=Translate&walkie=true`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const screen4Path = path.join(WORKSPACE_DIR, 'actual_app_screen_4_walkie_explainer.png');
    await page.screenshot({ path: screen4Path });
    console.log(`✅ Saved: ${screen4Path}`);

    // 5. Capture Real App Screen 5: WhatsApp Voice Note Decoder Modal
    console.log('📸 5. Capturing Real App Screen 5: WhatsApp Voice Note Decoder Modal...');
    await page.goto(`${baseUrl}/?tab=Translate&decoder=true`, { waitUntil: 'networkidle0' });
    await setupAuthAndSession();
    await page.goto(`${baseUrl}/?tab=Translate&decoder=true`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const screen5Path = path.join(WORKSPACE_DIR, 'actual_app_screen_5_voice_decoder.png');
    await page.screenshot({ path: screen5Path });
    console.log(`✅ Saved: ${screen5Path}`);

    // 6. Capture Real App Screen 6: Verified Bocas del Toro Directory Screen
    console.log('📸 6. Capturing Real App Screen 6: Verified Directory Tab...');
    await page.goto(`${baseUrl}/?tab=Directory`, { waitUntil: 'networkidle0' });
    await setupAuthAndSession();
    await page.goto(`${baseUrl}/?tab=Directory`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const screen6Path = path.join(WORKSPACE_DIR, 'actual_app_screen_6_directory.png');
    await page.screenshot({ path: screen6Path });
    console.log(`✅ Saved: ${screen6Path}`);

    // 7. Generate a gorgeous 3-Screen Comparison Showcase using the ACTUAL React Native App Screenshots!
    console.log('🎨 7. Generating High-Resolution 3-Screen Actual App Showcase...');
    const b64_1 = `data:image/png;base64,${fs.readFileSync(screen1Path).toString('base64')}`;
    const b64_2 = `data:image/png;base64,${fs.readFileSync(screen2Path).toString('base64')}`;
    const b64_3 = `data:image/png;base64,${fs.readFileSync(screen3Path).toString('base64')}`;

    const showcaseHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background-color: #FAF8F5;
      background-image: 
        radial-gradient(circle at 50% 0%, #FFF5EE 0%, #FAF8F5 45%, #F4EFEA 100%),
        radial-gradient(rgba(150, 72, 36, 0.04) 1px, transparent 1px);
      background-size: 100% 100%, 28px 28px;
      color: #1A1208;
      width: 1720px;
      height: 1100px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 44px 56px 40px;
      overflow: hidden;
      position: relative;
    }
    
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid rgba(150, 72, 36, 0.10);
      padding-bottom: 24px;
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 34px;
      font-weight: 900;
      color: #1A1208;
      display: flex;
      align-items: center;
      gap: 12px;
      letter-spacing: -0.8px;
    }
    .brand-badge {
      background: #964824;
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 17px;
      color: #5C4E3A;
      font-weight: 600;
      margin-top: 6px;
    }
    .real-badge {
      background: #ECFDF5;
      border: 1.5px solid #A7F3D0;
      color: #065F46;
      font-size: 13.5px;
      font-weight: 800;
      padding: 8px 16px;
      border-radius: 30px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .phones-row {
      display: flex;
      justify-content: center;
      gap: 36px;
      align-items: center;
      flex: 1;
      margin-top: 14px;
    }
    
    .phone-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 440px;
    }
    
    .stage-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      border: 2px solid rgba(150, 72, 36, 0.12);
      padding: 6px 16px;
      border-radius: 20px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }
    .stage-num {
      background: #964824;
      color: #FFF;
      width: 22px;
      height: 22px;
      border-radius: 11px;
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stage-title {
      font-size: 13.5px;
      font-weight: 800;
      color: #1A1208;
    }
    
    .device-frame {
      width: 380px;
      height: 824px;
      background: #000000;
      border-radius: 52px;
      padding: 9px;
      box-shadow: 
        0 24px 60px rgba(0, 0, 0, 0.16),
        0 8px 24px rgba(150, 72, 36, 0.10),
        inset 0 0 0 2px #3A3A3C,
        inset 0 0 0 4px #1C1C1E;
      position: relative;
      overflow: hidden;
    }
    .device-screen {
      width: 100%;
      height: 100%;
      border-radius: 44px;
      overflow: hidden;
      background: #FAF8F5;
      display: flex;
    }
    .device-screen img {
      width: 100%;
      height: 100%;
      object-fit: fill;
      display: block;
    }
    
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 2px solid rgba(150, 72, 36, 0.10);
      padding-top: 14px;
      font-size: 13.5px;
      color: #786C5E;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="top-header">
    <div>
      <div class="brand-title">
        <span>🦜 PoquitoTalk</span>
        <span class="brand-badge">Actual Expo App</span>
      </div>
      <div class="subtitle">Live Expat / Client Experience — Direct Screens from the Real React Native Codebase</div>
    </div>
    <div class="real-badge">
      <span style="display:inline-block; width:8px; height:8px; background:#10B981; border-radius:50%;"></span>
      <span>100% Genuine React Native Screens</span>
    </div>
  </div>

  <div class="phones-row">
    <!-- Stage 1 -->
    <div class="phone-column">
      <div class="stage-pill">
        <span class="stage-num">1</span>
        <span class="stage-title">Home Translation & Audio</span>
      </div>
      <div class="device-frame">
        <div class="device-screen">
          <img src="${b64_1}" alt="Stage 1">
        </div>
      </div>
    </div>

    <!-- Stage 2 -->
    <div class="phone-column">
      <div class="stage-pill">
        <span class="stage-num">2</span>
        <span class="stage-title">Active 2-Way Walkie Channel</span>
      </div>
      <div class="device-frame">
        <div class="device-screen">
          <img src="${b64_2}" alt="Stage 2">
        </div>
      </div>
    </div>

    <!-- Stage 3 -->
    <div class="phone-column">
      <div class="stage-pill">
        <span class="stage-num">3</span>
        <span class="stage-title">Incoming Contractor Audio (English)</span>
      </div>
      <div class="device-frame">
        <div class="device-screen">
          <img src="${b64_3}" alt="Stage 3">
        </div>
      </div>
    </div>
  </div>

  <div class="footer-bar">
    <div>PoquitoTalk • Bocas del Toro, Panamá 🇵🇦</div>
    <div>100% Real React Native / Expo UI Components</div>
  </div>
</body>
</html>
    `;

    const showcasePage = await browser.newPage();
    await showcasePage.setViewport({ width: 1720, height: 1100, deviceScaleFactor: 2 });
    await showcasePage.setContent(showcaseHtml, { waitUntil: 'load' });
    await sleep(800);

    const showcasePath = path.join(WORKSPACE_DIR, 'actual_app_expat_stages_showcase.png');
    await showcasePage.screenshot({ path: showcasePath });
    console.log(`✅ Saved Showcase -> ${showcasePath}`);
    await showcasePage.close();

  } finally {
    await browser.close();
    server.close();
  }
}

captureAllActualAppScreens().catch((err) => {
  console.error('❌ Error capturing actual app screens:', err);
  process.exit(1);
});

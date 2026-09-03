#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function startStaticServer(serveDir, port = 8171) {
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

async function captureThreadsScreens() {
  console.log('🚀 Starting static server on port 8171...');
  const { server, baseUrl } = await startStaticServer(DIST_DIR, 8171);

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
      deviceScaleFactor: 2,
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

    // 1. Capture Real Screen 7: Conversations & Threads List Tab
    console.log('📸 1. Capturing Real Screen 7: Conversations & Threads List Tab...');
    await page.goto(`${baseUrl}/?tab=Conversations`, { waitUntil: 'networkidle0' });
    await setupAuthAndSession();
    await page.goto(`${baseUrl}/?tab=Conversations`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const screen7Path = path.join(WORKSPACE_DIR, 'actual_app_screen_7_threads_list.png');
    await page.screenshot({ path: screen7Path });
    console.log(`✅ Saved: ${screen7Path}`);

    // 2. Capture Real Screen 8: 2-Way Contact Thread Chat Modal
    console.log('📸 2. Capturing Real Screen 8: 2-Way Contact Thread Chat Modal (Carlos A/C Repair)...');
    await page.goto(`${baseUrl}/?tab=Conversations&threadModal=true`, { waitUntil: 'networkidle0' });
    await setupAuthAndSession();
    await page.goto(`${baseUrl}/?tab=Conversations&threadModal=true`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const screen8Path = path.join(WORKSPACE_DIR, 'actual_app_screen_8_thread_chat_modal.png');
    await page.screenshot({ path: screen8Path });
    console.log(`✅ Saved: ${screen8Path}`);

    // 3. Render High-Resolution Showcase Image
    console.log('🎨 3. Generating Unified Actual App Threads Showcase...');
    const showcasePage = await browser.newPage();
    await showcasePage.setViewport({
      width: 1400,
      height: 1050,
      deviceScaleFactor: 2,
    });

    const s7Base64 = fs.readFileSync(screen7Path).toString('base64');
    const s8Base64 = fs.readFileSync(screen8Path).toString('base64');

    const showcaseHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Lexend:wght@700;800;900&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            width: 1400px;
            height: 1050px;
            background: #FAF8F5;
            background-image: 
              radial-gradient(circle at 10% 20%, rgba(150, 72, 36, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(20, 184, 166, 0.05) 0%, transparent 40%);
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 50px 60px 45px;
            overflow: hidden;
            position: relative;
          }

          .header {
            text-align: center;
            max-width: 900px;
          }

          .pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #FFFFFF;
            border: 1.5px solid rgba(150, 72, 36, 0.18);
            padding: 6px 16px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 800;
            color: #964824;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            margin-bottom: 12px;
          }

          h1 {
            font-family: 'Lexend', sans-serif;
            font-size: 38px;
            font-weight: 900;
            color: #1A1208;
            letter-spacing: -1.2px;
            line-height: 1.15;
            margin-bottom: 8px;
          }

          h1 span {
            color: #964824;
          }

          .subtitle {
            font-size: 16px;
            color: #5C4E3A;
            font-weight: 600;
            line-height: 1.4;
          }

          .devices-row {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 70px;
            width: 100%;
            margin-top: 15px;
          }

          .device-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .device-card-header {
            text-align: center;
          }

          .step-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 4px 12px;
            border-radius: 20px;
            letter-spacing: 0.6px;
            margin-bottom: 4px;
          }

          .badge-s1 { background: #FEF3C7; color: #92400E; }
          .badge-s2 { background: #ECFDF5; color: #047857; }

          .device-title {
            font-size: 16px;
            font-weight: 800;
            color: #1A1208;
          }

          .phone-frame {
            width: 380px;
            height: 680px;
            background: #000;
            border-radius: 46px;
            padding: 9px;
            box-shadow: 
              0 30px 60px -12px rgba(26, 18, 8, 0.22),
              0 18px 36px -18px rgba(26, 18, 8, 0.18),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset;
            position: relative;
          }

          .phone-inner {
            width: 100%;
            height: 100%;
            border-radius: 38px;
            overflow: hidden;
            background: #FAF8F5;
            position: relative;
          }

          .phone-inner img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top center;
            display: block;
          }

          .island-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
            font-size: 13.5px;
            font-weight: 700;
            color: #786B59;
          }

          .footer-tag {
            display: flex;
            align-items: center;
            gap: 6px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="pill">⚡ Real App Implementation</div>
          <h1>Persistent 2-Way <span>Service Contact Threads</span></h1>
          <p class="subtitle">Organize ongoing conversations with your boat captains, A/C trades & landlords with instant Spanish voice note dispatch.</p>
        </div>

        <div class="devices-row">
          <!-- Screen 1: Threads List & Quick Decks -->
          <div class="device-wrapper">
            <div class="device-card-header">
              <div class="step-badge badge-s1">Active Contacts Directory</div>
              <div class="device-title">Threads Tab & Quick Response Decks</div>
            </div>
            <div class="phone-frame">
              <div class="phone-inner">
                <img src="data:image/png;base64,${s7Base64}" />
              </div>
            </div>
          </div>

          <!-- Screen 2: 2-Way Thread View Modal -->
          <div class="device-wrapper">
            <div class="device-card-header">
              <div class="step-badge badge-s2">2-Way Conversation History</div>
              <div class="device-title">Carlos (A/C Repair) Voice Chat Modal</div>
            </div>
            <div class="phone-frame">
              <div class="phone-inner">
                <img src="data:image/png;base64,${s8Base64}" />
              </div>
            </div>
          </div>
        </div>

        <div class="island-footer">
          <div class="footer-tag">🇵🇦 Real React Native Codebase</div>
          <div>•</div>
          <div class="footer-tag">🎧 Dual-Channel Audio Playback</div>
          <div>•</div>
          <div class="footer-tag">💬 1-Tap WhatsApp Voice Note Sharing</div>
        </div>
      </body>
      </html>
    `;

    await showcasePage.setContent(showcaseHtml, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const showcasePath = path.join(WORKSPACE_DIR, 'actual_app_threads_showcase.png');
    await showcasePage.screenshot({ path: showcasePath });
    console.log(`✅ Showcase saved: ${showcasePath}`);

  } catch (err) {
    console.error('❌ Error capturing actual app threads screens:', err);
  } finally {
    await browser.close();
    server.close();
    console.log('🏁 Server closed.');
  }
}

captureThreadsScreens();

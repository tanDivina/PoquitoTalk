const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const PORT = 8115;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function startStaticServer() {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(DIST_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const fallbackHtml = path.join(DIST_DIR, 'index.html');
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
    server.listen(PORT, () => {
      console.log(`🌐 Server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function capturePaywalls() {
  console.log('🚀 Launching Chrome to capture Updated Paywall with poquito_talk_58_73_160...');
  const server = await startStaticServer();

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const CAPTURE_W = 390;
  const CAPTURE_H = 844;

  // 1. Soft Onboarding Paywall
  console.log('📸 1. Capturing Soft Onboarding Paywall...');
  const page1 = await browser.newPage();
  page1.on('pageerror', err => console.log('PAGE 1 ERROR:', err.message));
  page1.on('console', msg => console.log('PAGE 1 LOG:', msg.text()));
  await page1.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });
  await page1.goto(`http://localhost:${PORT}/?splash=false&onboarding=true&softPaywall=true`, { waitUntil: 'networkidle0' });
  await page1.addStyleTag({ content: '* { outline: none !important; -webkit-tap-highlight-color: transparent !important; } *:focus { outline: none !important; }' });
  await page1.evaluate(() => { if (document.activeElement) document.activeElement.blur(); });
  await new Promise(r => setTimeout(r, 1200));
  const shot1Path = path.join(WORKSPACE_DIR, 'updated_soft_paywall.png');
  await page1.screenshot({ path: shot1Path });
  const shot1Base64 = `data:image/png;base64,${fs.readFileSync(shot1Path).toString('base64')}`;
  await page1.close();

  // 2. In-App Paywall Modal Sheet
  console.log('📸 2. Capturing In-App Paywall Modal Sheet...');
  const page2 = await browser.newPage();
  await page2.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });
  await page2.goto(`http://localhost:${PORT}/?splash=false&onboarding=false&paywall=true`, { waitUntil: 'networkidle0' });
  await page2.addStyleTag({ content: '* { outline: none !important; -webkit-tap-highlight-color: transparent !important; } *:focus { outline: none !important; }' });
  await page2.evaluate(() => { if (document.activeElement) document.activeElement.blur(); });
  await new Promise(r => setTimeout(r, 1200));
  const shot2Path = path.join(WORKSPACE_DIR, 'updated_inapp_paywall.png');
  await page2.screenshot({ path: shot2Path });
  const shot2Base64 = `data:image/png;base64,${fs.readFileSync(shot2Path).toString('base64')}`;
  await page2.close();

  // 3. Compose Master Comparison Sheet
  console.log('🖼️ 3. Composing Master Comparison...');
  const composePage = await browser.newPage();
  await composePage.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 2 });

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      body {
        background: #FAF8F5;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 30px;
        color: #1A130E;
      }
      .badge-top {
        display: inline-flex;
        align-items: center;
        background: #D5E8D1;
        border: 1px solid #A7F3D0;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 800;
        color: #065F46;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        margin-bottom: 12px;
      }
      .header-title {
        font-size: 32px;
        font-weight: 900;
        color: #1A130E;
        text-align: center;
        letter-spacing: -0.5px;
      }
      .header-subtitle {
        font-size: 15px;
        color: #4A3E33;
        text-align: center;
        max-width: 720px;
        margin-top: 6px;
        margin-bottom: 36px;
        line-height: 1.5;
        font-weight: 600;
      }
      .cards-grid {
        display: flex;
        justify-content: center;
        gap: 40px;
        width: 100%;
        max-width: 1100px;
      }
      .option-column {
        background: #FFFFFF;
        border-radius: 32px;
        border: 1px solid #EBE4DA;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 10px 30px rgba(150, 72, 36, 0.05);
      }
      .col-tag {
        align-self: flex-start;
        display: inline-block;
        padding: 4px 12px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      .tag-a { background: #FFF7ED; color: #964824; border: 1px solid #FED7AA; }
      .tag-b { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }

      .col-title {
        font-size: 18px;
        font-weight: 900;
        color: #1A130E;
        align-self: flex-start;
        margin-bottom: 4px;
      }
      .col-desc {
        font-size: 12.5px;
        color: #4A3E33;
        align-self: flex-start;
        margin-bottom: 20px;
        min-height: 34px;
        font-weight: 500;
      }

      /* Titanium Phone Frame */
      .phone-chassis {
        width: 380px;
        height: 820px;
        border-radius: 52px;
        background: #111;
        padding: 11px;
        box-shadow:
          0 0 0 4px #D1C9BE,
          0 0 0 7px #78716A,
          0 25px 60px rgba(0, 0, 0, 0.35);
        position: relative;
      }
      .phone-screen-wrap {
        width: 100%;
        height: 100%;
        border-radius: 42px;
        overflow: hidden;
        background: #FAF8F5;
        position: relative;
      }
      .dynamic-island {
        position: absolute;
        top: 9px;
        left: 50%;
        transform: translateX(-50%);
        width: 118px;
        height: 30px;
        background: #000000;
        border-radius: 18px;
        z-index: 99;
      }
      .screen-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    </style>
  </head>
  <body>
    <div class="badge-top">UPDATED MASCOT & COPY</div>
    <h1 class="header-title">PoquitoTalk Final Paywall Screens</h1>
    <p class="header-subtitle">
      Updated with <code>poquito_talk_58_73_160.webp</code> (Mandible Beak Talk) and title <code>Speak Real 🇵🇦 Spanish</code>.
    </p>

    <div class="cards-grid">
      <!-- SCREEN 1: Soft Onboarding Paywall -->
      <div class="option-column">
        <span class="col-tag tag-a">Soft Onboarding Screen</span>
        <h2 class="col-title">1. Full-Screen Onboarding Paywall</h2>
        <p class="col-desc">Seamless open canvas, 7-Day trial pill, and zero white box gaps.</p>
        
        <div class="phone-chassis">
          <div class="dynamic-island"></div>
          <div class="phone-screen-wrap">
            <img class="screen-img" src="${shot1Base64}" />
          </div>
        </div>
      </div>

      <!-- SCREEN 2: In-App Limit Modal Sheet -->
      <div class="option-column">
        <span class="col-tag tag-b">In-App Trigger Sheet</span>
        <h2 class="col-title">2. In-App Paywall Bottom Sheet</h2>
        <p class="col-desc">Contextual bottom sheet with matching mascot, flag title & unclipped pricing.</p>
        
        <div class="phone-chassis">
          <div class="dynamic-island"></div>
          <div class="phone-screen-wrap">
            <img class="screen-img" src="${shot2Base64}" />
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await composePage.setContent(htmlContent, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));

  const finalShowcasePath = path.join(WORKSPACE_DIR, 'final_paywall_screens_updated.png');
  await composePage.screenshot({ path: finalShowcasePath, fullPage: true });
  console.log(`✅ Saved Final Showcase to: ${finalShowcasePath}`);

  await browser.close();
  server.close();
  console.log('🎉 Paywall captures successfully generated!');
}

capturePaywalls().catch(console.error);

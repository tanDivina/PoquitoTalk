const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const PORT = 8118;

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

async function captureComparison() {
  console.log('🚀 Launching Chrome to capture Onboarding Paywall vs Settings Short Paywall...');
  const server = await startStaticServer();

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  const CAPTURE_W = 390;
  const CAPTURE_H = 844;

  // 1. Soft Onboarding Paywall (Right After Onboarding)
  console.log('📸 1. Capturing Soft Onboarding Paywall (Right After Onboarding)...');
  const page1 = await browser.newPage();
  await page1.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });
  await page1.goto(`http://localhost:${PORT}/?splash=false&onboarding=true&softPaywall=true&tier=ANNUAL_TRIAL`, { waitUntil: 'networkidle0' });
  await page1.addStyleTag({ content: '* { outline: none !important; -webkit-tap-highlight-color: transparent !important; } *:focus { outline: none !important; }' });
  await page1.evaluate(() => { if (document.activeElement) document.activeElement.blur(); });
  await new Promise(r => setTimeout(r, 1200));
  const shot1Path = path.join(WORKSPACE_DIR, 'onboarding_paywall_shot.png');
  await page1.screenshot({ path: shot1Path });
  const shot1Base64 = `data:image/png;base64,${fs.readFileSync(shot1Path).toString('base64')}`;
  await page1.close();

  // 2. Short Paywall Shown in Settings (In-App Bottom Sheet Trigger)
  console.log('📸 2. Capturing Short Settings Paywall Bottom Sheet...');
  const page2 = await browser.newPage();
  await page2.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });
  await page2.goto(`http://localhost:${PORT}/?splash=false&onboarding=false&paywall=true`, { waitUntil: 'networkidle0' });
  await page2.addStyleTag({ content: '* { outline: none !important; -webkit-tap-highlight-color: transparent !important; } *:focus { outline: none !important; }' });
  await page2.evaluate(() => { if (document.activeElement) document.activeElement.blur(); });
  await new Promise(r => setTimeout(r, 1200));
  const shot2Path = path.join(WORKSPACE_DIR, 'settings_paywall_shot.png');
  await page2.screenshot({ path: shot2Path });
  const shot2Base64 = `data:image/png;base64,${fs.readFileSync(shot2Path).toString('base64')}`;
  await page2.close();

  await browser.close();
  server.close();

  // 3. Compose Master Comparison Sheet
  console.log('🖼️ 3. Composing Comparison Showcase...');
  const composeBrowser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const composePage = await composeBrowser.newPage();
  await composePage.setViewport({ width: 1200, height: 1040, deviceScaleFactor: 2 });

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
        background: #FFF7ED;
        border: 1px solid #FED7AA;
        padding: 6px 18px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.8px;
        color: #964824;
        text-transform: uppercase;
        margin-bottom: 14px;
      }
      h1 {
        font-size: 32px;
        font-weight: 900;
        color: #1A130E;
        margin-bottom: 8px;
        text-align: center;
        letter-spacing: -0.5px;
      }
      p.subtitle {
        font-size: 14.5px;
        font-weight: 500;
        color: #6B5E51;
        margin-bottom: 36px;
        text-align: center;
        max-width: 750px;
        line-height: 1.5;
      }
      .grid {
        display: flex;
        gap: 40px;
        justify-content: center;
        align-items: flex-start;
      }
      .card-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 380px;
      }
      .card-header-tag {
        font-size: 10.5px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 4px 12px;
        border-radius: 100px;
        margin-bottom: 8px;
        display: inline-block;
      }
      .tag-onboarding {
        background: #FFF7ED;
        color: #9A3412;
        border: 1px solid #FED7AA;
      }
      .tag-settings {
        background: #F0FDF4;
        color: #065F46;
        border: 1px solid #A7F3D0;
      }
      .card-title {
        font-size: 16px;
        font-weight: 800;
        color: #1A130E;
        margin-bottom: 4px;
        text-align: center;
      }
      .card-desc {
        font-size: 12px;
        color: #6B5E51;
        margin-bottom: 16px;
        text-align: center;
        max-width: 340px;
        line-height: 1.4;
      }
      .phone-frame {
        width: 340px;
        height: 735px;
        background: #1A130E;
        border-radius: 46px;
        padding: 10px;
        box-shadow: 0 20px 45px rgba(26, 19, 14, 0.16), 0 2px 6px rgba(26, 19, 14, 0.08);
        position: relative;
      }
      .phone-inner {
        width: 100%;
        height: 100%;
        background: #FAF8F5;
        border-radius: 38px;
        overflow: hidden;
      }
      .phone-inner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    </style>
  </head>
  <body>
    <div class="badge-top">Side-by-Side Screen Comparison</div>
    <h1>Onboarding Paywall vs. Settings Short Paywall</h1>
    <p class="subtitle">
      Comparing the full-screen onboarding paywall shown right after user setup with the contextual short paywall bottom sheet triggered in Settings.
    </p>

    <div class="grid">
      <!-- 1. Soft Onboarding Paywall -->
      <div class="card-wrap">
        <span class="card-header-tag tag-onboarding">Soft Onboarding Screen</span>
        <div class="card-title">1. Full-Screen Onboarding Paywall</div>
        <div class="card-desc">Presented right after user intake. Full canvas, elevated advantages card, Terracotta selection, and enlarged CTA.</div>
        <div class="phone-frame">
          <div class="phone-inner">
            <img src="${shot1Base64}" />
          </div>
        </div>
      </div>

      <!-- 2. In-App Settings Paywall -->
      <div class="card-wrap">
        <span class="card-header-tag tag-settings">Settings & App Trigger</span>
        <div class="card-title">2. Settings Short Paywall (Bottom Sheet)</div>
        <div class="card-desc">Triggered from Settings or PRO header icon. Slides up as a contextual bottom sheet overlaying the active app.</div>
        <div class="phone-frame">
          <div class="phone-inner">
            <img src="${shot2Base64}" />
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await composePage.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const finalOutputPath = path.join(WORKSPACE_DIR, 'onboarding_vs_settings_paywall_comparison.png');
  await composePage.screenshot({ path: finalOutputPath });
  console.log(`✅ Saved Comparison Showcase to: ${finalOutputPath}`);

  await composePage.close();
  await composeBrowser.close();
  console.log('🎉 Comparison captures successfully generated!');
}

captureComparison().catch(err => {
  console.error('ERROR during comparison capture:', err);
  process.exit(1);
});

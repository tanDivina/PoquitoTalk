const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const PORT = 8116;

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

async function captureShowcase() {
  console.log('🚀 Launching Chrome to capture Green Selection & Dynamic CTA Showcase...');
  const server = await startStaticServer();

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  const CAPTURE_W = 390;
  const CAPTURE_H = 844;

  const page = await browser.newPage();
  await page.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/?splash=false&onboarding=true&softPaywall=true`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Annual Selected (Default)
  console.log('📸 1. Capturing Annual Pass Selected (Terracotta)...');
  const page1 = await browser.newPage();
  await page1.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });
  await page1.goto(`http://localhost:${PORT}/?splash=false&onboarding=true&softPaywall=true&tier=ANNUAL_TRIAL`, { waitUntil: 'networkidle0' });
  await page1.addStyleTag({ content: '* { outline: none !important; -webkit-tap-highlight-color: transparent !important; } *:focus { outline: none !important; }' });
  await page1.evaluate(() => { if (document.activeElement) document.activeElement.blur(); });
  await new Promise(r => setTimeout(r, 1200));
  const shotAnnualPath = path.join(WORKSPACE_DIR, 'green_shot_annual.png');
  await page1.screenshot({ path: shotAnnualPath });
  const shotAnnualBase64 = `data:image/png;base64,${fs.readFileSync(shotAnnualPath).toString('base64')}`;
  await page1.close();

  // 2. Monthly Resident Pass
  console.log('📸 2. Capturing Monthly Resident Pass Selected (Terracotta)...');
  const page2 = await browser.newPage();
  await page2.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });
  await page2.goto(`http://localhost:${PORT}/?splash=false&onboarding=true&softPaywall=true&tier=MONTHLY`, { waitUntil: 'networkidle0' });
  await page2.addStyleTag({ content: '* { outline: none !important; -webkit-tap-highlight-color: transparent !important; } *:focus { outline: none !important; }' });
  await page2.evaluate(() => { if (document.activeElement) document.activeElement.blur(); });
  await new Promise(r => setTimeout(r, 1200));
  const shotMonthlyPath = path.join(WORKSPACE_DIR, 'green_shot_monthly.png');
  await page2.screenshot({ path: shotMonthlyPath });
  const shotMonthlyBase64 = `data:image/png;base64,${fs.readFileSync(shotMonthlyPath).toString('base64')}`;
  await page2.close();

  // 3. 7-Day Travel Pass
  console.log('📸 3. Capturing 7-Day Travel Pass Selected (Terracotta)...');
  const page3 = await browser.newPage();
  await page3.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });
  await page3.goto(`http://localhost:${PORT}/?splash=false&onboarding=true&softPaywall=true&tier=TRAVEL_PASS`, { waitUntil: 'networkidle0' });
  await page3.addStyleTag({ content: '* { outline: none !important; -webkit-tap-highlight-color: transparent !important; } *:focus { outline: none !important; }' });
  await page3.evaluate(() => { if (document.activeElement) document.activeElement.blur(); });
  await new Promise(r => setTimeout(r, 1200));
  const shotTravelPath = path.join(WORKSPACE_DIR, 'green_shot_travel.png');
  await page3.screenshot({ path: shotTravelPath });
  const shotTravelBase64 = `data:image/png;base64,${fs.readFileSync(shotTravelPath).toString('base64')}`;
  await page3.close();

  // 4. In-App Modal Sheet
  console.log('📸 4. Capturing In-App Paywall Modal Sheet...');
  const page4 = await browser.newPage();
  await page4.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });
  await page4.goto(`http://localhost:${PORT}/?splash=false&onboarding=false`, { waitUntil: 'networkidle0' });
  await page4.addStyleTag({ content: '* { outline: none !important; -webkit-tap-highlight-color: transparent !important; } *:focus { outline: none !important; }' });
  await new Promise(r => setTimeout(r, 1000));

  await page4.evaluate(() => {
    if (document.activeElement) document.activeElement.blur();
    const proBtns = Array.from(document.querySelectorAll('div, span, button')).filter(el =>
      el.textContent && el.textContent.includes('PRO')
    );
    if (proBtns.length > 0) {
      proBtns[0].click();
    }
  });
  await new Promise(r => setTimeout(r, 800));
  const shotModalPath = path.join(WORKSPACE_DIR, 'green_shot_modal.png');
  await page4.screenshot({ path: shotModalPath });
  const shotModalBase64 = `data:image/png;base64,${fs.readFileSync(shotModalPath).toString('base64')}`;

  await page4.close();
  await browser.close();
  server.close();

  // Compose Master Comparison Showcase
  console.log('🖼️ 5. Composing Master Showcase...');
  const compHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        background: #FAF8F5;
        padding: 50px 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 100vh;
      }
      .header-badge {
        display: inline-flex;
        align-items: center;
        background: #FFF7ED;
        border: 1px solid #FED7AA;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 800;
        color: #964824;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        margin-bottom: 16px;
      }
      .main-title {
        font-size: 34px;
        font-weight: 900;
        color: #1A130E;
        text-align: center;
        letter-spacing: -0.5px;
        margin-bottom: 8px;
      }
      .main-subtitle {
        font-size: 15px;
        font-weight: 500;
        color: #6B5E51;
        text-align: center;
        max-width: 680px;
        line-height: 1.5;
        margin-bottom: 40px;
      }
      .showcase-grid {
        display: flex;
        gap: 24px;
        justify-content: center;
        align-items: flex-start;
        flex-wrap: nowrap;
      }
      .card-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #FFFFFF;
        border: 1px solid #E8E1D7;
        border-radius: 28px;
        padding: 16px 14px 20px;
        box-shadow: 0 10px 25px rgba(150, 72, 36, 0.05);
        width: 320px;
      }
      .col-tag {
        font-size: 10px;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 100px;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .tag-emerald { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
      .tag-blue { background: #F0F9FF; color: #0369A1; border: 1px solid #BAE6FD; }
      .tag-amber { background: #FFF7ED; color: #9A3412; border: 1px solid #FED7AA; }
      .col-title {
        font-size: 14px;
        font-weight: 800;
        color: #1A130E;
        margin-bottom: 4px;
        text-align: center;
      }
      .col-cta-pill {
        font-size: 11px;
        font-weight: 700;
        color: #964824;
        background: #FFF9F6;
        border: 1px solid #FED7AA;
        padding: 3px 8px;
        border-radius: 6px;
        margin-bottom: 12px;
        text-align: center;
      }
      .device-frame {
        width: 290px;
        height: 627px;
        border-radius: 40px;
        background: #000;
        padding: 9px;
        box-shadow: 0 16px 35px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08);
        position: relative;
      }
      .device-inner {
        width: 100%;
        height: 100%;
        border-radius: 32px;
        overflow: hidden;
        background: #FAF8F5;
      }
      .device-inner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    </style>
  </head>
  <body>
    <div class="header-badge">Terracotta Selection & Dynamic CTA Showcase</div>
    <h1 class="main-title">PoquitoTalk Card Selection & Dynamic CTA States</h1>
    <p class="main-subtitle">Selected card highlighted in Warm Terracotta Brown (#964824) with warm peach tint (#FFF9F6). Clean top header without redundant badge, with an enlarged CTA button dynamically updating for each plan.</p>

    <div class="showcase-grid">
      <!-- 1. Annual Selected -->
      <div class="card-col">
        <div class="col-tag tag-amber">Option 1 • 7-Day Free Trial</div>
        <div class="col-title">Annual Explorer Pass</div>
        <div class="col-cta-pill">CTA: "Start 7–Day Free Trial →"</div>
        <div class="device-frame">
          <div class="device-inner">
            <img src="${shotAnnualBase64}" />
          </div>
        </div>
      </div>

      <!-- 2. Monthly Selected -->
      <div class="card-col">
        <div class="col-tag tag-amber">Option 2 • Month-to-Month</div>
        <div class="col-title">Monthly Resident Pass</div>
        <div class="col-cta-pill">CTA: "Get Monthly Pass ($9.99/mo) →"</div>
        <div class="device-frame">
          <div class="device-inner">
            <img src="${shotMonthlyBase64}" />
          </div>
        </div>
      </div>

      <!-- 3. Travel Pass Selected -->
      <div class="card-col">
        <div class="col-tag tag-blue">Option 3 • 1-Week Trip</div>
        <div class="col-title">7–Day Travel Pass</div>
        <div class="col-cta-pill">CTA: "Get 7–Day Travel Pass ($4.99) →"</div>
        <div class="device-frame">
          <div class="device-inner">
            <img src="${shotTravelBase64}" />
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  const composeBrowser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const composePage = await composeBrowser.newPage();
  await composePage.setViewport({ width: 1100, height: 940, deviceScaleFactor: 2 });
  await composePage.setContent(compHtml, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const finalOutputPath = path.join(WORKSPACE_DIR, 'terracotta_selection_cta_showcase.png');
  await composePage.screenshot({ path: finalOutputPath });
  console.log(`✅ Saved Final Terracotta Selection Showcase to: ${finalOutputPath}`);

  await composePage.close();
  await composeBrowser.close();
  console.log('🎉 Paywall captures successfully generated!');
}

captureShowcase().catch(err => {
  console.error('ERROR during showcase capture:', err);
  process.exit(1);
});

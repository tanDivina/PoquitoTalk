const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const FUNNEL_DIR = path.join(WORKSPACE_DIR, 'web-funnel');
const PORT = 8110;

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
    if (reqPath === '/') reqPath = '/poquito_studio.html';
    const filePath = path.join(FUNNEL_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`🌐 Funnel server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function captureStudioTabs() {
  console.log('🚀 Launching Chrome to capture Poquito 5-Tab Studio...');
  const server = await startStaticServer();

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/poquito_studio.html`, { waitUntil: 'networkidle0' });

  // 1. Capture Tab 1: Alpha WebP Matrix & Audio States
  console.log('📸 1. Capturing Tab 1 (Alpha WebP Matrix)...');
  await page.evaluate(() => window.showMasterTab('master-alpha-matrix'));
  await new Promise(r => setTimeout(r, 800));
  const tab1Path = path.join(WORKSPACE_DIR, 'studio_tab1_alpha_matrix.png');
  await page.screenshot({ path: tab1Path, fullPage: false });

  // 2. Capture Tab 2: Full AI Motion Archive
  console.log('📸 2. Capturing Tab 2 (AI Motion Archive)...');
  await page.evaluate(() => window.showMasterTab('master-seedance'));
  await new Promise(r => setTimeout(r, 800));
  const tab2Path = path.join(WORKSPACE_DIR, 'studio_tab2_ai_motion.png');
  await page.screenshot({ path: tab2Path, fullPage: false });

  // 3. Capture Tab 3: Interactive SVG Vector Rigs
  console.log('📸 3. Capturing Tab 3 (SVG Vector Rigs)...');
  await page.evaluate(() => window.showMasterTab('master-svg'));
  await new Promise(r => setTimeout(r, 800));
  const tab3Path = path.join(WORKSPACE_DIR, 'studio_tab3_svg_rigs.png');
  await page.screenshot({ path: tab3Path, fullPage: false });

  // 4. Capture Tab 4: Frame Inspector & Loop Builder
  console.log('📸 4. Capturing Tab 4 (Frame Inspector)...');
  await page.evaluate(() => window.showMasterTab('master-frames'));
  await new Promise(r => setTimeout(r, 800));
  const tab4Path = path.join(WORKSPACE_DIR, 'studio_tab4_frame_inspector.png');
  await page.screenshot({ path: tab4Path, fullPage: false });

  // 5. Capture Tab 5: Voice Calibration Lab
  console.log('📸 5. Capturing Tab 5 (Voice Calibration Lab)...');
  await page.evaluate(() => window.showMasterTab('master-voice'));
  await new Promise(r => setTimeout(r, 800));
  const tab5Path = path.join(WORKSPACE_DIR, 'studio_tab5_voice_lab.png');
  await page.screenshot({ path: tab5Path, fullPage: false });

  // 6. Compose Master Multi-Tab Showcase Sheet
  console.log('🖼️ 6. Composing Master 5-Tab Showcase...');
  const composePage = await browser.newPage();
  await composePage.setViewport({ width: 1920, height: 1600, deviceScaleFactor: 2 });

  const tab1Base64 = `data:image/png;base64,${fs.readFileSync(tab1Path).toString('base64')}`;
  const tab2Base64 = `data:image/png;base64,${fs.readFileSync(tab2Path).toString('base64')}`;
  const tab3Base64 = `data:image/png;base64,${fs.readFileSync(tab3Path).toString('base64')}`;
  const tab4Base64 = `data:image/png;base64,${fs.readFileSync(tab4Path).toString('base64')}`;
  const tab5Base64 = `data:image/png;base64,${fs.readFileSync(tab5Path).toString('base64')}`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      body {
        background: #0B0E14;
        color: #F8FAFC;
        padding: 40px 30px;
        min-height: 100vh;
      }
      .header-wrap {
        text-align: center;
        margin-bottom: 30px;
      }
      .badge {
        display: inline-block;
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.4);
        padding: 6px 18px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 800;
        color: #34D399;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        margin-bottom: 10px;
      }
      h1 {
        font-size: 34px;
        font-weight: 900;
        letter-spacing: -0.5px;
      }
      p.sub {
        font-size: 15px;
        color: #94A3B8;
        margin-top: 6px;
      }

      .tab-bar-preview {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin: 20px 0 30px;
        flex-wrap: wrap;
      }
      .tab-pill {
        background: #151A28;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 8px 16px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 700;
        color: #CBD5E1;
      }
      .tab-pill.active {
        background: rgba(16, 185, 129, 0.2);
        border-color: #10B981;
        color: #34D399;
      }

      .grid-tabs {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
        max-width: 1840px;
        margin: 0 auto;
      }

      .tab-card {
        background: #111622;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
      }
      .tab-card-header {
        padding: 16px 20px;
        background: #171D2D;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .tab-title {
        font-size: 16px;
        font-weight: 800;
        color: #F8FAFC;
      }
      .tab-tag {
        font-size: 11px;
        font-weight: 800;
        padding: 3px 8px;
        border-radius: 6px;
        text-transform: uppercase;
        background: rgba(16, 185, 129, 0.15);
        color: #34D399;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }
      .tab-img-wrap {
        width: 100%;
        height: 380px;
        overflow: hidden;
        background: #080B11;
      }
      .tab-img-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
      }

      .full-width-card {
        grid-column: span 2;
      }
      .full-width-card .tab-img-wrap {
        height: 480px;
      }
    </style>
  </head>
  <body>
    <div class="header-wrap">
      <div class="badge">POQUITOTALK UNIFIED STUDIO</div>
      <h1>Interactive 5-Tab Mascot & Behavior Studio</h1>
      <p class="sub">Local web application at <code>web-funnel/poquito_studio.html</code> featuring live interactive animation rigs, audio syncing, and vector states.</p>
      
      <div class="tab-bar-preview">
        <div class="tab-pill active">⚡ 1. Alpha WebP Matrix</div>
        <div class="tab-pill">🎬 2. Full AI Motion Archive</div>
        <div class="tab-pill">🦜 3. Interactive SVG Vector Rigs</div>
        <div class="tab-pill">🎞️ 4. Frame Inspector & Loop Builder</div>
        <div class="tab-pill">🎙️ 5. Voice Calibration Lab</div>
        <div class="tab-pill">🖨️ 6. Print & QR Launch Deck</div>
      </div>
    </div>

    <div class="grid-tabs">
      <!-- TAB 1 (Full Width Hero) -->
      <div class="tab-card full-width-card">
        <div class="tab-card-header">
          <span class="tab-title">Tab 1: Alpha WebP Matrix & Audio States (Live Animation Grid & Size Switcher)</span>
          <span class="tab-tag">Primary Mascot Selector</span>
        </div>
        <div class="tab-img-wrap">
          <img src="${tab1Base64}" />
        </div>
      </div>

      <!-- TAB 2 -->
      <div class="tab-card">
        <div class="tab-card-header">
          <span class="tab-title">Tab 2: Full AI Motion Archive (Seedance Behaviors & Multi-Angle Poses)</span>
          <span class="tab-tag">AI Video & Loops</span>
        </div>
        <div class="tab-img-wrap">
          <img src="${tab2Base64}" />
        </div>
      </div>

      <!-- TAB 3 -->
      <div class="tab-card">
        <div class="tab-card-header">
          <span class="tab-title">Tab 3: Interactive SVG Vector Rigs (Real-Time React/Web SVG Components)</span>
          <span class="tab-tag">Pure Scalable Vectors</span>
        </div>
        <div class="tab-img-wrap">
          <img src="${tab3Base64}" />
        </div>
      </div>

      <!-- TAB 4 -->
      <div class="tab-card">
        <div class="tab-card-header">
          <span class="tab-title">Tab 4: Frame Inspector & Loop Builder (Frame-by-Frame Scrubbing)</span>
          <span class="tab-tag">Animation Timing</span>
        </div>
        <div class="tab-img-wrap">
          <img src="${tab4Base64}" />
        </div>
      </div>

      <!-- TAB 5 -->
      <div class="tab-card">
        <div class="tab-card-header">
          <span class="tab-title">Tab 5: Voice Calibration Lab (VU Meters, Audio Tests & Walkie Simulation)</span>
          <span class="tab-tag">Audio & Dialect Engine</span>
        </div>
        <div class="tab-img-wrap">
          <img src="${tab5Base64}" />
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await composePage.setContent(html, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));

  const masterShowcasePath = path.join(WORKSPACE_DIR, 'poquito_master_studio_5tabs.png');
  await composePage.screenshot({ path: masterShowcasePath, fullPage: true });
  console.log(`✅ Saved Master 5-Tab Studio Showcase to: ${masterShowcasePath}`);

  await browser.close();
  server.close();
}

captureStudioTabs().catch(console.error);

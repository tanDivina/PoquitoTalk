const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const ARTIFACTS_DIR = '/Users/dorienvandenabbeele/.gemini/antigravity/brain/5c54b672-d44e-4931-835d-b08dcbdc368b';
const PORT = 8098;

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

async function captureRealPaywalls() {
  console.log('🚀 Launching Chrome to capture REAL app paywalls...');
  const server = await startStaticServer();

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const CAPTURE_W = 390;
  const CAPTURE_H = 844;

  // 1. CAPTURE REAL ONBOARDING STEP 1 (Reference)
  console.log('📸 1. Capturing Real Onboarding Step 1...');
  const pageOnboard = await browser.newPage();
  await pageOnboard.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });
  await pageOnboard.goto(`http://localhost:${PORT}/?splash=false&onboarding=true`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  const shotOnboardPath = path.join(WORKSPACE_DIR, 'real_onboarding_step1.png');
  await pageOnboard.screenshot({ path: shotOnboardPath });
  const shotOnboardBase64 = `data:image/png;base64,${fs.readFileSync(shotOnboardPath).toString('base64')}`;
  await pageOnboard.close();

  // 2. CAPTURE REAL SOFT ONBOARDING PAYWALL (From Onboarding Step 3)
  console.log('📸 2. Capturing Real SoftOnboardingPaywall...');
  const pageSoft = await browser.newPage();
  await pageSoft.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });
  await pageSoft.goto(`http://localhost:${PORT}/?splash=false&onboarding=true&softPaywall=true`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const shotSoftPath = path.join(WORKSPACE_DIR, 'real_soft_onboarding_paywall.png');
  await pageSoft.screenshot({ path: shotSoftPath });
  const shotSoftBase64 = `data:image/png;base64,${fs.readFileSync(shotSoftPath).toString('base64')}`;
  await pageSoft.close();

  // 3. CAPTURE REAL IN-APP LIMIT PAYWALL (PaywallModal.tsx)
  console.log('📸 3. Capturing Real PaywallModal (In-App Bottom Sheet)...');
  const pageInApp = await browser.newPage();
  await pageInApp.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2 });
  await pageInApp.goto(`http://localhost:${PORT}/?splash=false&onboarding=false&paywall=true`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const shotInAppPath = path.join(WORKSPACE_DIR, 'real_inapp_paywall_modal.png');
  await pageInApp.screenshot({ path: shotInAppPath });
  const shotInAppBase64 = `data:image/png;base64,${fs.readFileSync(shotInAppPath).toString('base64')}`;
  await pageInApp.close();

  // 4. MASTER REAL-SCREEN SHOWCASE CANVAS (1920 x 1080)
  console.log('🖼️ 4. Composing Master Real App Paywall Showcase...');
  const canvasPage = await browser.newPage();
  await canvasPage.setViewport({ width: 1720, height: 1040, deviceScaleFactor: 2 });

  const canvasHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Lexend:wght@700;800&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #FAF8F5;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 36px 44px;
      color: #1B1C1A;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .header-box {
      text-align: center;
      margin-bottom: 26px;
      max-width: 960px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #D5E8D1;
      border: 1px solid #A7F3D0;
      color: #065F46;
      font-size: 11px;
      font-weight: 800;
      padding: 5px 16px;
      border-radius: 100px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 10px;
    }
    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: #1B1C1A;
      letter-spacing: -0.02em;
    }
    p.subtitle {
      font-size: 14px;
      color: #6C6255;
      margin-top: 4px;
      line-height: 1.45;
    }

    .showcase-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 28px;
      width: 100%;
      max-width: 1600px;
      align-items: flex-start;
    }

    .column-panel {
      background: #FFFFFF;
      border: 1.5px solid #EDE8E1;
      border-radius: 28px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 8px 28px rgba(27, 28, 26, 0.04);
    }
    .panel-tag {
      align-self: flex-start;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.6px;
      padding: 4px 12px;
      border-radius: 8px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .tag-ref { background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; }
    .tag-soft { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
    .tag-inapp { background: #FFF7ED; color: #9A3412; border: 1px solid #FED7AA; }

    .panel-title {
      font-size: 17px;
      font-weight: 800;
      color: #1B1C1A;
      align-self: flex-start;
      margin-bottom: 2px;
    }
    .panel-sub {
      font-size: 11.5px;
      color: #6C6255;
      align-self: flex-start;
      margin-bottom: 16px;
      min-height: 32px;
    }

    /* Real Titanium Phone Chassis */
    .titanium-phone {
      width: 320px;
      height: 692px;
      background: #111215;
      border-radius: 46px;
      padding: 10px;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 0 0 2px #4B4842, inset 0 0 0 4px #262422;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    .dynamic-island {
      position: absolute;
      top: 18px;
      left: 50%;
      transform: translateX(-50%);
      width: 90px;
      height: 22px;
      background: #000;
      border-radius: 20px;
      z-index: 50;
    }
    .screen-viewport {
      width: 100%;
      height: 100%;
      border-radius: 36px;
      overflow: hidden;
      background: #FBF9F5;
      position: relative;
    }
    .screen-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Annotation Callout Box */
    .annotation-box {
      width: 100%;
      margin-top: 16px;
      background: #FAFAF8;
      border: 1px solid #EAE5DE;
      border-radius: 16px;
      padding: 12px 14px;
      font-size: 11.5px;
      color: #4D463E;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .bullet-row {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      line-height: 1.4;
    }
    .bullet-icon {
      font-weight: 800;
      color: #964824;
      flex-shrink: 0;
    }
  </style>
</head>
<body>

  <div class="header-box">
    <div class="badge">100% Real Live App Screen Captures</div>
    <h1>PoquitoTalk Actual In-App Paywalls Side-by-Side</h1>
    <p class="subtitle">
      Real screens extracted directly from the React Native application engine. Showing the approved <strong>Onboarding Baseline</strong>, the <strong>Soft Onboarding Paywall</strong>, and the <strong>Contextual In-App Modal</strong>.
    </p>
  </div>

  <div class="showcase-grid">

    <!-- 1. APPROVED ONBOARDING STEP 1 -->
    <div class="column-panel">
      <div class="panel-tag tag-ref">Design Reference</div>
      <div class="panel-title">1. New Onboarding Screen</div>
      <div class="panel-sub">Warm Terracotta (#964824), soft pastel discs & vector mascot.</div>

      <div class="titanium-phone">
        <div class="dynamic-island"></div>
        <div class="screen-viewport">
          <img src="${shotOnboardBase64}" class="screen-img" alt="Real Onboarding Step 1" />
        </div>
      </div>

      <div class="annotation-box">
        <div class="bullet-row"><span class="bullet-icon">✓</span><span>Clean warm cream background (#FBF9F5).</span></div>
        <div class="bullet-row"><span class="bullet-icon">✓</span><span>Crisp vector line icons and soft pastel discs.</span></div>
        <div class="bullet-row"><span class="bullet-icon">✓</span><span>Terracotta CTA with subtle elevation shadow.</span></div>
      </div>
    </div>

    <!-- 2. SOFT ONBOARDING PAYWALL -->
    <div class="column-panel">
      <div class="panel-tag tag-soft">Post-Onboarding Flow</div>
      <div class="panel-title">2. Soft Onboarding Paywall</div>
      <div class="panel-sub">Warm aesthetic, 7-Day Trial ($29.99/yr), Travel Pass & Credits.</div>

      <div class="titanium-phone">
        <div class="dynamic-island"></div>
        <div class="screen-viewport">
          <img src="${shotSoftBase64}" class="screen-img" alt="Real Soft Onboarding Paywall" />
        </div>
      </div>

      <div class="annotation-box">
        <div class="bullet-row"><span class="bullet-icon">✓</span><span>Full-screen flow with "Explore Free First" dismiss pill.</span></div>
        <div class="bullet-row"><span class="bullet-icon">✓</span><span>Annual Explorer Pass ($29.99/yr) with 7-Day Free Trial.</span></div>
        <div class="bullet-row"><span class="bullet-icon">✓</span><span>Includes 7-Day Travel Pass ($4.99) & 50 Credits Pack ($4.99).</span></div>
      </div>
    </div>

    <!-- 3. IN-APP LIMIT PAYWALL (PaywallModal.tsx) -->
    <div class="column-panel">
      <div class="panel-tag tag-soft">In-App Limit Flow</div>
      <div class="panel-title">3. Upgraded In-App Paywall</div>
      <div class="panel-sub">Now matching the warm aesthetic, pastel discs & factual copy.</div>

      <div class="titanium-phone">
        <div class="dynamic-island"></div>
        <div class="screen-viewport">
          <img src="${shotInAppBase64}" class="screen-img" alt="Real PaywallModal" />
        </div>
      </div>

      <div class="annotation-box">
        <div class="bullet-row"><span class="bullet-icon">✓</span><span>100% styled with warm cream background & pastel discs.</span></div>
        <div class="bullet-row"><span class="bullet-icon">✓</span><span>Zero hype / factual copy (no "premium voices" buzzwords).</span></div>
        <div class="bullet-row"><span class="bullet-icon">✓</span><span>Seamlessly unified 3 tiers across RevenueCat & Stripe.</span></div>
      </div>
    </div>

  </div>

</body>
</html>
  `;

  await canvasPage.setContent(canvasHtml, { waitUntil: 'networkidle0' });
  const realShowcasePath = path.join(WORKSPACE_DIR, 'paywall_real_app_showcase.png');
  await canvasPage.screenshot({ path: realShowcasePath, fullPage: true });
  console.log('✅ Saved Real App Showcase to:', realShowcasePath);

  // Copy to artifacts
  fs.copyFileSync(realShowcasePath, path.join(ARTIFACTS_DIR, 'paywall_real_app_showcase.png'));

  await browser.close();
  server.close();
  console.log('🎉 Real App Screenshots successfully captured and composed!');
}

captureRealPaywalls().catch(console.error);

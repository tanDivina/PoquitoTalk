const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const ARTIFACTS_DIR = '/Users/dorienvandenabbeele/.gemini/antigravity/brain/4a66e27a-ecea-4535-968c-f0db830ceb2b';
const PORT = 8125;

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
      resolve(server);
    });
  });
}

function copyToArtifacts(filename) {
  try {
    const src = path.join(WORKSPACE_DIR, filename);
    const dest = path.join(ARTIFACTS_DIR, filename);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  } catch (err) {
    console.error(`Failed to copy ${filename} to artifacts:`, err.message);
  }
}

async function captureShipathonScreens() {
  console.log('🚀 Launching Chrome to capture Shipathon screens...');
  const server = await startStaticServer();

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const CAPTURE_W = 390;
  const CAPTURE_H = 844;

  // 1. CAPTURE POST-PURCHASE ONBOARDING MODAL ("App Aftercare")
  console.log('📸 1. Capturing Post-Purchase Onboarding Screen...');
  const pageAftercare = await browser.newPage();
  await pageAftercare.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2.5 });
  await pageAftercare.goto(`http://localhost:${PORT}/?splash=false&onboarding=false&paidOnboarding=true`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });
  await new Promise((r) => setTimeout(r, 1800));

  const aftercarePath = path.join(WORKSPACE_DIR, 'screen_1_post_purchase_onboarding.png');
  await pageAftercare.screenshot({ path: aftercarePath });
  copyToArtifacts('screen_1_post_purchase_onboarding.png');
  const aftercareBase64 = `data:image/png;base64,${fs.readFileSync(aftercarePath).toString('base64')}`;
  await pageAftercare.close();

  // 2. CAPTURE REAL SOFT ONBOARDING PAYWALL (7-Day Trial + 4 Tiers)
  console.log('📸 2. Capturing Soft Onboarding Paywall...');
  const pagePaywall = await browser.newPage();
  await pagePaywall.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2.5 });
  await pagePaywall.goto(`http://localhost:${PORT}/?splash=false&onboarding=true&softPaywall=true`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });
  await new Promise((r) => setTimeout(r, 1800));

  const paywallPath = path.join(WORKSPACE_DIR, 'screen_2_paywall_7day_trial.png');
  await pagePaywall.screenshot({ path: paywallPath });
  copyToArtifacts('screen_2_paywall_7day_trial.png');
  const paywallBase64 = `data:image/png;base64,${fs.readFileSync(paywallPath).toString('base64')}`;
  await pagePaywall.close();

  // 3. CAPTURE ACTIVE TRANSLATE STUDIO WITH LOADED VOICE PROMPT
  console.log('📸 3. Capturing Translate Studio (Voice Note Ready)...');
  const pageTranslate = await browser.newPage();
  await pageTranslate.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2.5 });
  await pageTranslate.goto(
    `http://localhost:${PORT}/?splash=false&onboarding=false&tab=Translate&prompt=Can%20you%20pick%20us%20up%20at%20Carenero%20dock%20in%2015%20minutes%3F&output=%C2%A1Buenas!%20%C2%BFPuedes%20recogernos%20en%20el%20muelle%20de%20Carenero%20en%2015%20minutos%3F`,
    { waitUntil: 'networkidle0', timeout: 30000 }
  );
  await new Promise((r) => setTimeout(r, 2000));

  const translatePath = path.join(WORKSPACE_DIR, 'screen_3_translate_studio.png');
  await pageTranslate.screenshot({ path: translatePath });
  copyToArtifacts('screen_3_translate_studio.png');
  const translateBase64 = `data:image/png;base64,${fs.readFileSync(translatePath).toString('base64')}`;
  await pageTranslate.close();

  // 4. CAPTURE IN-APP REVENUECAT PAYWALL MODAL
  console.log('📸 4. Capturing In-App Paywall Modal...');
  const pageInApp = await browser.newPage();
  await pageInApp.setViewport({ width: CAPTURE_W, height: CAPTURE_H, deviceScaleFactor: 2.5 });
  await pageInApp.goto(`http://localhost:${PORT}/?splash=false&onboarding=false&paywall=true`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });
  await new Promise((r) => setTimeout(r, 1800));

  const inAppPath = path.join(WORKSPACE_DIR, 'screen_4_inapp_paywall.png');
  await pageInApp.screenshot({ path: inAppPath });
  copyToArtifacts('screen_4_inapp_paywall.png');
  await pageInApp.close();

  // 5. MASTER TWITTER / X SHOWCASE BANNER (1920 x 1080)
  console.log('🖼️ 5. Composing 1920x1080 Master Twitter / X Showcase Banner (RevenueCat Study Edition)...');
  const bannerPage = await browser.newPage();
  await bannerPage.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const bannerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Lexend:wght@700;800;900&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: linear-gradient(135deg, #FAF8F5 0%, #F5F1E8 40%, #EEF7F2 100%);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 50px 72px 42px;
    }

    .bloom-left {
      position: absolute;
      top: -160px;
      left: -120px;
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, rgba(150, 72, 36, 0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .bloom-right {
      position: absolute;
      bottom: -180px;
      right: -100px;
      width: 950px;
      height: 950px;
      background: radial-gradient(circle, rgba(5, 150, 105, 0.10) 0%, transparent 70%);
      pointer-events: none;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      z-index: 10;
    }
    .header-left {
      max-width: 1240px;
    }
    .badge-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .pill-revenuecat {
      background: #E84D3D15;
      color: #E84D3D;
      border: 1.5px solid rgba(232, 77, 61, 0.3);
    }
    .pill-shipathon {
      background: #05966915;
      color: #059669;
      border: 1.5px solid rgba(5, 150, 105, 0.3);
    }
    .pill-countdown {
      background: #96482415;
      color: #964824;
      border: 1.5px solid rgba(150, 72, 36, 0.3);
      font-family: 'JetBrains Mono', monospace;
    }

    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 45px;
      font-weight: 900;
      letter-spacing: -1.4px;
      line-height: 1.12;
      color: #1A1208;
    }
    h1 span.accent {
      color: #E84D3D;
    }
    h1 span.green {
      color: #059669;
    }
    p.subtitle {
      font-size: 19.5px;
      font-weight: 600;
      color: #5C4E3A;
      margin-top: 7px;
      line-height: 1.4;
    }

    .profile-card {
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      border: 1.5px solid rgba(150, 72, 36, 0.15);
      border-radius: 20px;
      padding: 12px 20px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
    }
    .avatar {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: #964824;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      font-weight: 800;
      font-size: 18px;
    }
    .profile-info {
      display: flex;
      flex-direction: column;
    }
    .profile-name {
      font-size: 15px;
      font-weight: 800;
      color: #1A1208;
    }
    .profile-handle {
      font-size: 13px;
      font-weight: 700;
      color: #059669;
    }

    .phones-row {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 40px;
      z-index: 10;
      margin-top: 8px;
      margin-bottom: 6px;
    }

    .phone-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .phone-tag {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 16px;
      border-radius: 999px;
    }
    .tag-step1 {
      background: #FFF;
      color: #4B5563;
      border: 1px solid #E5E7EB;
    }
    .tag-step2 {
      background: #ECFDF5;
      color: #059669;
      border: 1.5px solid #A7F3D0;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.15);
    }
    .tag-step3 {
      background: #FFF8F4;
      color: #964824;
      border: 1px solid #FDE4D6;
    }

    .device {
      width: 320px;
      height: 692px;
      background: #000;
      border-radius: 46px;
      padding: 10px;
      box-shadow: 0 28px 60px rgba(0, 0, 0, 0.14), 0 8px 18px rgba(0, 0, 0, 0.06);
      position: relative;
      border: 3.5px solid #E5E7EB;
      transition: transform 0.2s ease;
    }
    .device-screen {
      width: 100%;
      height: 100%;
      border-radius: 36px;
      overflow: hidden;
      background: #FAF8F5;
      position: relative;
    }
    .device-screen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .device-highlighted {
      transform: scale(1.05) translateY(-8px);
      box-shadow: 0 36px 80px rgba(5, 150, 105, 0.22), 0 12px 24px rgba(0, 0, 0, 0.08);
      border-color: #059669;
    }

    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.12);
      border-radius: 20px;
      padding: 14px 28px;
      z-index: 10;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.03);
    }
    .footer-pill-group {
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .footer-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .footer-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #059669;
    }
    .footer-dot.red {
      background: #E84D3D;
    }
    .footer-dot.terracotta {
      background: #964824;
    }
    .footer-label {
      font-size: 14.5px;
      font-weight: 700;
      color: #1A1208;
    }
    .footer-label span {
      font-weight: 500;
      color: #786C5E;
    }
    .app-link {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      color: #964824;
    }
  </style>
</head>
<body>
  <div class="bloom-left"></div>
  <div class="bloom-right"></div>

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="badge-row">
        <div class="pill-badge pill-revenuecat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          RevenueCat AI Study (3,500+ Apps)
        </div>
        <div class="pill-badge pill-shipathon">
          🚢 Shipathon Day 43 of 60
        </div>
        <div class="pill-badge pill-countdown">
          ⏳ 18 Days Left
        </div>
      </div>
      <h1>AI Apps Churn <span class="accent">30% Faster.</span> Top 30% Retain <span class="green">10x Better.</span></h1>
      <p class="subtitle">RevenueCat benchmarked 3,500+ AI apps: The secret isn't hype—it's delivering your first personalized output in &lt;60s.</p>
    </div>

    <!-- Creator Tag -->
    <div class="profile-card">
      <div class="avatar">D</div>
      <div class="profile-info">
        <div class="profile-name">Dorien Van den Abbeele</div>
        <div class="profile-handle">@DorienVibecodes</div>
      </div>
    </div>
  </div>

  <!-- 3 Phones Journey Row -->
  <div class="phones-row">
    <!-- Step 1: Paywall -->
    <div class="phone-container">
      <div class="phone-tag tag-step1">1. 7-Day Free Trial (+12.7% Retention)</div>
      <div class="device">
        <div class="device-screen">
          <img src="${paywallBase64}" />
        </div>
      </div>
    </div>

    <!-- Step 2: Post-Purchase Onboarding (Highlighted) -->
    <div class="phone-container">
      <div class="phone-tag tag-step2">✨ 2. Post-Purchase Value (Stops Churn)</div>
      <div class="device device-highlighted">
        <div class="device-screen">
          <img src="${aftercareBase64}" />
        </div>
      </div>
    </div>

    <!-- Step 3: Immediate 1-Tap Activation -->
    <div class="phone-container">
      <div class="phone-tag tag-step3">3. First Voice Note in &lt;60s ("Aha!" Moment)</div>
      <div class="device">
        <div class="device-screen">
          <img src="${translateBase64}" />
        </div>
      </div>
    </div>
  </div>

  <!-- Footer Value Bar -->
  <div class="footer-bar">
    <div class="footer-pill-group">
      <div class="footer-item">
        <div class="footer-dot red"></div>
        <div class="footer-label">First Renewal Cliff: <span>57.9% renew vs 30.2% in low group</span></div>
      </div>
      <div class="footer-item">
        <div class="footer-dot"></div>
        <div class="footer-label">Personalized Voice: <span>First output in &lt;60s beats 'one-and-done'</span></div>
      </div>
      <div class="footer-item">
        <div class="footer-dot terracotta"></div>
        <div class="footer-label">Hybrid Model: <span>Pro Subscriptions + Credit Safety Net</span></div>
      </div>
    </div>
    <div class="app-link">poquitotalk.hero-apps.com 🌴🇵🇦</div>
  </div>
</body>
</html>
  `;

  await bannerPage.setContent(bannerHtml, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1200));

  const bannerPath = path.join(WORKSPACE_DIR, 'shipathon_day43_showcase.png');
  await bannerPage.screenshot({ path: bannerPath });
  copyToArtifacts('shipathon_day43_showcase.png');
  await bannerPage.close();

  await browser.close();
  server.close();
  console.log('✅ All screens and Twitter showcase banner updated successfully!');
}

captureShipathonScreens().catch((err) => {
  console.error('❌ Error capturing screens:', err);
  process.exit(1);
});

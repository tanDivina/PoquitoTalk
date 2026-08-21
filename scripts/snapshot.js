#!/usr/bin/env node

/**
 * Automated Snapshot & Comparison Tool for PoquitoTalk (React Native / Expo App & Web)
 * 
 * Usage:
 *   npm run snap:before [--tab Presets|Threads|Saved|Settings|Translate] [--onboarding]
 *   npm run snap:after [--tab Presets|Threads|Saved|Settings|Translate] [--onboarding]
 *   npm run snap:compare ["Change Description"]
 *   npm run snap --tab Presets
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');
const DIST_DIR = path.join(process.cwd(), 'dist');

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  process.env.CHROME_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
];

function getChromePath() {
  for (const p of CHROME_PATHS) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error('Google Chrome was not found at /Applications/Google Chrome.app. Please set CHROME_PATH.');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'quick';
  let targetTab = null;
  let showOnboarding = false;
  let customUrl = null;
  let label = null;
  let useMarketingSite = false;
  let rebuild = false;
  let delay = 1500;
  let width = 393;
  let height = 852;
  let scale = 2;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--tab' && args[i + 1]) {
      targetTab = args[++i];
    } else if (arg === '--onboarding') {
      showOnboarding = true;
    } else if (arg === '--url' && args[i + 1]) {
      customUrl = args[++i];
    } else if (arg === '--web') {
      useMarketingSite = true;
    } else if (arg === '--rebuild') {
      rebuild = true;
    } else if (arg === '--delay' && args[i + 1]) {
      delay = parseInt(args[++i], 10);
    } else if (arg === '--width' && args[i + 1]) {
      width = parseInt(args[++i], 10);
    } else if (arg === '--height' && args[i + 1]) {
      height = parseInt(args[++i], 10);
    } else if (arg === '--scale' && args[i + 1]) {
      scale = parseFloat(args[++i]);
    } else if (!arg.startsWith('--') && !label) {
      label = arg;
    }
  }

  return { mode, targetTab, showOnboarding, customUrl, label, useMarketingSite, rebuild, delay, width, height, scale };
}

function ensureReactWebBuild(force = false) {
  const distIndex = path.join(DIST_DIR, 'index.html');
  if (force || !fs.existsSync(distIndex)) {
    console.log('📦 Bundling React app for web snapshot (`npx expo export -p web`)...');
    execSync('npx expo export -p web', { stdio: 'inherit' });
  }
}

function startStaticServer(serveDir, port = 8095) {
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
      // Single Page Application fallback for React Native Web navigation
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

async function captureScreen({ url, outputPath, delay, width, height, scale, scrollY }) {
  const chromePath = getChromePath();
  console.log(`🚀 Headless Chrome (${width}x${height} @${scale}x)`);
  console.log(`📱 App URL: ${url}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: scale,
      isMobile: true,
      hasTouch: true,
    });

    await page.goto(url, { waitUntil: ['load', 'networkidle2'], timeout: 25000 });

    // Inject strict reset to ensure zero margin clipping
    await page.addStyleTag({
      content: `
        * { box-sizing: border-box; }
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }
      `,
    });

    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }

    if (scrollY) {
      await page.evaluate((y) => {
        window.scrollTo(0, y);
        const allDivs = Array.from(document.querySelectorAll('div'));
        allDivs.forEach((el) => {
          if (el.scrollHeight > el.clientHeight) {
            el.scrollTop = y;
          }
        });
      }, scrollY);
      await new Promise((r) => setTimeout(r, 400));
    }

    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`📸 Saved screenshot -> ${outputPath}`);
  } finally {
    await browser.close();
  }
}

async function generateComparisonCard({ beforeImgPath, afterImgPath, outputComparisonPath, title }) {
  if (!fs.existsSync(beforeImgPath)) {
    throw new Error(`Before image not found at: ${beforeImgPath}. Run 'npm run snap:before' first.`);
  }
  if (!fs.existsSync(afterImgPath)) {
    throw new Error(`After image not found at: ${afterImgPath}. Run 'npm run snap:after' first.`);
  }

  const beforeBase64 = `data:image/png;base64,${fs.readFileSync(beforeImgPath).toString('base64')}`;
  const afterBase64 = `data:image/png;base64,${fs.readFileSync(afterImgPath).toString('base64')}`;

  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const cardTitle = title || 'React Native App UI Evolution';

  const htmlContent = `
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
      background-color: #FBF9F5;
      background-image: 
        radial-gradient(circle at 50% 0%, #FFF5EE 0%, #FBF9F5 45%, #F5F1EB 100%),
        radial-gradient(rgba(150, 72, 36, 0.04) 1px, transparent 1px);
      background-size: 100% 100%, 28px 28px;
      color: #1B1C1A;
      width: 1600px;
      height: 1050px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 64px;
      overflow: hidden;
      position: relative;
    }
    .background-orb-top {
      position: absolute;
      width: 650px;
      height: 650px;
      background: radial-gradient(circle, rgba(253, 154, 111, 0.16) 0%, rgba(251, 249, 245, 0) 70%);
      top: -160px;
      right: -80px;
      pointer-events: none;
      filter: blur(20px);
    }
    .background-orb-bottom {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(213, 232, 209, 0.22) 0%, rgba(251, 249, 245, 0) 70%);
      bottom: -160px;
      left: -80px;
      pointer-events: none;
      filter: blur(20px);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
      border-bottom: 1px solid #E4E2DE;
      padding-bottom: 18px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo-svg {
      width: 58px;
      height: 58px;
      flex-shrink: 0;
      filter: drop-shadow(0 4px 12px rgba(37, 211, 102, 0.2));
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: #1B1C1A;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .panama-badge {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #964824;
      background: #FFDBCD;
      padding: 4px 10px;
      border-radius: 100px;
      letter-spacing: 0.2px;
      border: 1px solid #FD9A6F;
    }
    .brand-subtitle {
      font-size: 14px;
      font-weight: 600;
      color: #594F42;
      margin-top: 2px;
    }
    .comparison-container {
      display: flex;
      gap: 56px;
      justify-content: center;
      align-items: center;
      flex: 1;
      margin: 16px 0;
      position: relative;
      z-index: 10;
    }
    .column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .tag {
      font-family: 'Lexend', sans-serif;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 100px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .tag-before {
      background: #FEE2E2;
      color: #B91C1C;
      border: 1.5px solid #FCA5A5;
    }
    .tag-after {
      background: #D5E8D1;
      color: #2E402D;
      border: 1.5px solid #82B37A;
    }
    .phone-frame {
      width: 360px;
      height: 760px;
      background: #18191B;
      border-radius: 44px;
      padding: 10px;
      box-shadow: 0 25px 60px rgba(89, 79, 66, 0.16), 0 8px 20px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.12);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 34px;
      overflow: hidden;
      background: #FAF7F2;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .phone-screen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
    .arrow-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #807264;
    }
    .arrow-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 1.5px solid #E4E2DE;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      color: #964824;
      box-shadow: 0 6px 18px rgba(150, 72, 36, 0.1);
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #E4E2DE;
      padding-top: 16px;
      font-size: 13px;
      color: #5C554D;
      position: relative;
      z-index: 10;
    }
    .footer-left {
      display: flex;
      gap: 22px;
    }
    .highlight {
      color: #1B1C1A;
      font-weight: 700;
    }
    .brand-link {
      color: #964824;
      font-weight: 700;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="background-orb-top"></div>
  <div class="background-orb-bottom"></div>
  
  <div class="header">
    <div class="brand">
      <svg class="brand-logo-svg" viewBox="0 0 200 200" fill="none">
        <path d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z" fill="none" stroke="#25D366" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 62 161 Q 86 159 112 161" stroke="#B45309" stroke-width="6" stroke-linecap="round" />
        <path d="M 74 152 C 72 158 74 164 78 164 M 80 152 C 78 158 80 164 84 164 M 91 152 C 89 158 91 164 95 164 M 97 152 C 95 158 97 164 101 164" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
        <path d="M 62 152 C 55 138 52 122 55 105 C 58 78 72 55 92 55 C 108 55 116 70 114 85 C 112 102 114 128 110 142 C 102 155 82 160 62 152 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" />
        <path d="M 58 112 C 62 98 76 92 86 108 C 92 122 86 145 70 148 C 62 140 57 126 58 112 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" />
        <circle cx="95" cy="74" r="8" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
        <circle cx="93.5" cy="74" r="4" fill="#0F172A" />
        <circle cx="92" cy="72" r="1.5" fill="#FFFFFF" />
        <path d="M 110 70 C 124 70 130 82 118 94 C 113 98 106 94 108 88 C 110 82 108 74 110 70 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M 114 84 C 120 86 119 92 112.4 92 C 113.2 88 113.6 86 114 84 Z" fill="#EF4444" />
        <path d="M 130 73 A 12 12 0 0 1 130 93" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
        <path d="M 140 66 A 19 19 0 0 1 140 100" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
        <path d="M 150 60 A 25 25 0 0 1 150 106" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" opacity="0.8" />
      </svg>
      <div>
        <div class="brand-title">
          PoquitoTalk
          <span class="panama-badge">Panamá 🇵🇦</span>
        </div>
        <div class="brand-subtitle">Instant Spanish Voice Notes for Expats</div>
      </div>
    </div>
  </div>

  <div class="comparison-container">
    <div class="column">
      <div class="tag tag-before">● BEFORE</div>
      <div class="phone-frame">
        <div class="phone-screen">
          <img src="${beforeBase64}" alt="Before UI" />
        </div>
      </div>
    </div>

    <div class="arrow-divider">
      <div class="arrow-icon">→</div>
      <span style="font-family: 'Lexend'; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #807264;">TRANSITION</span>
    </div>

    <div class="column">
      <div class="tag tag-after">● AFTER</div>
      <div class="phone-frame after">
        <div class="phone-screen">
          <img src="${afterBase64}" alt="After UI" />
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-left">
      <span>Captured: <strong class="highlight">${timestamp}</strong></span>
      <span>Engine: <strong class="highlight">React Native Web / Expo 54</strong></span>
    </div>
    <div>
      <span>Created by <strong class="highlight">@DorienVibecodes</strong> • <span class="brand-link">poquitotalk.hero-apps.com</span></span>
    </div>
  </div>
</body>
</html>
  `;

  const chromePath = getChromePath();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: outputComparisonPath, fullPage: false });
    
    // Copy to root workspace
    const rootCopyPath = path.join(process.cwd(), 'before_after_comparison.png');
    fs.copyFileSync(outputComparisonPath, rootCopyPath);

    console.log(`✨ Generated high-res comparison card:`);
    console.log(`   📁 ${outputComparisonPath}`);
    console.log(`   📁 ${rootCopyPath}`);
  } finally {
    await browser.close();
  }
}

async function generateShowcaseCard({ screenImgPath, outputShowcasePath, title, description, highlights = [] }) {
  const screenBuffer = fs.readFileSync(screenImgPath);
  const screenBase64 = `data:image/png;base64,${screenBuffer.toString('base64')}`;

  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const htmlContent = `
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
      background-color: #FBF9F5;
      background-image: 
        radial-gradient(circle at 75% 15%, #FFF5EE 0%, #FBF9F5 45%, #F5F1EB 100%),
        radial-gradient(rgba(150, 72, 36, 0.04) 1px, transparent 1px);
      background-size: 100% 100%, 28px 28px;
      color: #1B1C1A;
      width: 1600px;
      height: 1050px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 44px 70px;
      overflow: hidden;
      position: relative;
    }
    .background-orb-top {
      position: absolute;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(253, 154, 111, 0.18) 0%, rgba(251, 249, 245, 0) 70%);
      top: -160px;
      right: 50px;
      pointer-events: none;
      filter: blur(25px);
    }
    .background-orb-bottom {
      position: absolute;
      width: 650px;
      height: 650px;
      background: radial-gradient(circle, rgba(213, 232, 209, 0.25) 0%, rgba(251, 249, 245, 0) 70%);
      bottom: -180px;
      left: -100px;
      pointer-events: none;
      filter: blur(25px);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
      border-bottom: 1px solid #E4E2DE;
      padding-bottom: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo-svg {
      width: 58px;
      height: 58px;
      flex-shrink: 0;
      filter: drop-shadow(0 4px 12px rgba(37, 211, 102, 0.2));
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: #1B1C1A;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .panama-badge {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #964824;
      background: #FFDBCD;
      padding: 4px 10px;
      border-radius: 100px;
      letter-spacing: 0.2px;
      border: 1px solid #FD9A6F;
    }
    .brand-subtitle {
      font-size: 14px;
      font-weight: 600;
      color: #594F42;
      margin-top: 2px;
    }
    .content-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 60px;
      flex: 1;
      margin: 20px 0;
      position: relative;
      z-index: 10;
    }
    .info-panel {
      flex: 1;
      max-width: 620px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .main-title {
      font-family: 'Lexend', sans-serif;
      font-size: 38px;
      font-weight: 800;
      color: #1B1C1A;
      letter-spacing: -0.8px;
      line-height: 1.2;
    }
    .main-desc {
      font-size: 16px;
      color: #594F42;
      line-height: 1.6;
    }
    .highlights-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 8px;
    }
    .highlight-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      background: #FFFFFF;
      padding: 16px 20px;
      border-radius: 18px;
      border: 1px solid #E4E2DE;
      box-shadow: 0 4px 16px rgba(89, 79, 66, 0.05);
    }
    .highlight-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: #FFDBCD;
      color: #964824;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .highlight-title {
      font-family: 'Lexend', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #1B1C1A;
    }
    .highlight-desc {
      font-size: 13px;
      color: #594F42;
      margin-top: 2px;
      line-height: 1.4;
    }
    .phone-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .phone-frame {
      width: 375px;
      height: 770px;
      background: #18191B;
      border-radius: 46px;
      padding: 10px;
      border: 2.5px solid #FD9A6F;
      box-shadow: 0 32px 80px rgba(150, 72, 36, 0.22), 0 10px 30px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 36px;
      overflow: hidden;
      background: #FAF7F2;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .phone-screen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #E4E2DE;
      padding-top: 18px;
      font-size: 13px;
      color: #5C554D;
      position: relative;
      z-index: 10;
    }
    .highlight {
      color: #1B1C1A;
      font-weight: 700;
    }
    .brand-link {
      color: #964824;
      font-weight: 700;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="background-orb-top"></div>
  <div class="background-orb-bottom"></div>

  <div class="header">
    <div class="brand">
      <svg class="brand-logo-svg" viewBox="0 0 200 200" fill="none">
        <path d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z" fill="none" stroke="#25D366" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 62 161 Q 86 159 112 161" stroke="#B45309" stroke-width="6" stroke-linecap="round" />
        <path d="M 74 152 C 72 158 74 164 78 164 M 80 152 C 78 158 80 164 84 164 M 91 152 C 89 158 91 164 95 164 M 97 152 C 95 158 97 164 101 164" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
        <path d="M 62 152 C 55 138 52 122 55 105 C 58 78 72 55 92 55 C 108 55 116 70 114 85 C 112 102 114 128 110 142 C 102 155 82 160 62 152 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" />
        <path d="M 58 112 C 62 98 76 92 86 108 C 92 122 86 145 70 148 C 62 140 57 126 58 112 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" />
        <circle cx="95" cy="74" r="8" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
        <circle cx="93.5" cy="74" r="4" fill="#0F172A" />
        <circle cx="92" cy="72" r="1.5" fill="#FFFFFF" />
        <path d="M 110 70 C 124 70 130 82 118 94 C 113 98 106 94 108 88 C 110 82 108 74 110 70 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
        <path d="M 114 84 C 120 86 119 92 112.4 92 C 113.2 88 113.6 86 114 84 Z" fill="#EF4444" />
        <path d="M 130 73 A 12 12 0 0 1 130 93" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
        <path d="M 140 66 A 19 19 0 0 1 140 100" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
        <path d="M 150 60 A 25 25 0 0 1 150 106" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" opacity="0.8" />
      </svg>
      <div>
        <div class="brand-title">
          PoquitoTalk
          <span class="panama-badge">Panamá 🇵🇦</span>
        </div>
        <div class="brand-subtitle">Instant Spanish Voice Notes for Expats</div>
      </div>
    </div>
  </div>

  <div class="content-container">
    <div class="info-panel">
      <h1 class="main-title">${title}</h1>
      <p class="main-desc">${description}</p>
      
      <div class="highlights-list">
        ${highlights.map(h => `
          <div class="highlight-item">
            <div class="highlight-icon">${h.icon}</div>
            <div>
              <div class="highlight-title">${h.title}</div>
              <div class="highlight-desc">${h.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="phone-container">
      <div class="phone-frame">
        <div class="phone-screen">
          <img src="${screenBase64}" alt="${title}" />
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>
      <span>Engine: <strong class="highlight">React Native Web / Expo 54</strong></span>
    </div>
    <div>
      <span>Created by <strong class="highlight">@DorienVibecodes</strong> • <span class="brand-link">poquitotalk.hero-apps.com</span></span>
    </div>
  </div>
</body>
</html>
  `;

  const chromePath = getChromePath();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: outputShowcasePath, fullPage: false });
    
    // Copy to root workspace
    const rootCopyPath = path.join(process.cwd(), path.basename(outputShowcasePath));
    fs.copyFileSync(outputShowcasePath, rootCopyPath);

    console.log(`✨ Generated high-res showcase card:`);
    console.log(`   📁 ${outputShowcasePath}`);
    console.log(`   📁 ${rootCopyPath}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const { mode, targetTab, showOnboarding, customUrl, label, useMarketingSite, rebuild, delay, width, height, scale } = parseArgs();

  let serverInstance = null;
  let baseServerUrl = 'http://localhost:8095';
  let activeUrl = customUrl;

  if (!activeUrl) {
    if (useMarketingSite) {
      const webDir = path.join(process.cwd(), 'web-funnel');
      const { server, baseUrl } = await startStaticServer(webDir, 8097);
      serverInstance = server;
      baseServerUrl = baseUrl;
      activeUrl = baseUrl;
    } else {
      // Snapshot the actual React / Expo app
      ensureReactWebBuild(rebuild);
      const { server, baseUrl } = await startStaticServer(DIST_DIR, 8095);
      serverInstance = server;
      baseServerUrl = baseUrl;

      // Construct React App Query Params
      const params = new URLSearchParams();
      if (showOnboarding) {
        params.set('onboarding', 'true');
      } else {
        params.set('onboarding', 'false');
        if (targetTab) {
          params.set('tab', targetTab);
        }
      }

      const queryString = params.toString();
      activeUrl = queryString ? `${baseUrl}/?${queryString}` : baseUrl;
    }
  }

  try {
    if (mode === 'all') {
      const screens = [
        { name: '01_home_screen_v1_5', tab: 'Translate', rootName: 'mobile_home_screen.png' },
        { name: '02_templates_screen_v1_5', tab: 'Presets', rootName: 'mobile_templates_screen.png' },
        { name: '03_directory_screen_v1_5', tab: 'Directory', rootName: 'mobile_directory_screen.png' },
        { name: '04_document_scanner_lupa', customParam: 'scanner=true&tooltip=true', rootName: 'mobile_scanner_lupa.png' },
        { name: '05_voice_decoder', customParam: 'decoder=true', rootName: 'mobile_voice_decoder.png' },
        { name: '06_settings_v1_5', customParam: 'settings=true', rootName: 'mobile_settings_screen.png' },
      ];

      const galleryDir = path.join(SCREENSHOT_DIR, 'gallery');
      if (!fs.existsSync(galleryDir)) {
        fs.mkdirSync(galleryDir, { recursive: true });
      }

      console.log(`📸 Capturing full mobile app screen gallery (v1.5.0)...`);
      for (const item of screens) {
        let itemUrl = `${baseServerUrl}/?onboarding=false`;
        if (item.onboarding) {
          itemUrl = `${baseServerUrl}/?onboarding=true`;
        } else if (item.tab) {
          itemUrl = `${baseServerUrl}/?onboarding=false&tab=${item.tab}`;
        } else if (item.customParam) {
          itemUrl = `${baseServerUrl}/?onboarding=false&${item.customParam}`;
        }
        const outputPath = path.join(galleryDir, `${item.name}.png`);
        await captureScreen({ url: itemUrl, outputPath, delay, width, height, scale });
        
        if (item.rootName) {
          fs.copyFileSync(outputPath, path.join(process.cwd(), item.rootName));
        }
      }

      // Capture Website (Desktop & Mobile)
      console.log('🌐 Capturing Website Landing Page (poquitotalk.hero-apps.com / web-funnel)...');
      const webFunnelPath = `file://${path.resolve(__dirname, '..', 'web-funnel', 'index.html')}`;
      const webDesktopPath = path.join(process.cwd(), 'website_desktop_hero.png');
      const webMobilePath = path.join(process.cwd(), 'website_mobile_view.png');

      await captureScreen({ url: webFunnelPath, outputPath: webDesktopPath, width: 1440, height: 900, scale: 2, delay: 1000 });
      await captureScreen({ url: webFunnelPath, outputPath: webMobilePath, width: 393, height: 852, scale: 2, delay: 1000 });
      console.log('✅ Website screenshots saved to workspace root: website_desktop_hero.png & website_mobile_view.png');

      // Generate Mobile App v1.5 Before & After Comparison Card
      console.log('✨ Generating Mobile App v1.5 Before & After Comparison Card...');
      const beforeImgPath = path.join(SCREENSHOT_DIR, 'before.png');
      const afterImgPath = path.join(galleryDir, '01_home_screen_v1_5.png');
      const outputComparisonPath = path.join(SCREENSHOT_DIR, 'before_after_comparison.png');
      const rootComparisonPath = path.join(process.cwd(), 'before_after_comparison.png');

      await generateComparisonCard({
        beforeImgPath,
        afterImgPath,
        outputComparisonPath,
        title: 'PoquitoTalk Mobile App Evolution (v1.0 → v1.5.0)',
      });
      fs.copyFileSync(outputComparisonPath, rootComparisonPath);
      fs.copyFileSync(outputComparisonPath, path.join(process.cwd(), 'mobile_app_v1_5_before_after.png'));

      console.log(`🎉 All mobile app screens, website captures, and comparison cards saved to root!`);
    } else if (mode === 'before') {
      const filename = label ? `before_${label}.png` : 'before.png';
      const outputPath = path.join(SCREENSHOT_DIR, filename);
      await captureScreen({ url: activeUrl, outputPath, delay, width, height, scale });
      fs.copyFileSync(outputPath, path.join(process.cwd(), 'before.png'));
      console.log(`✅ React App 'Before' snapshot saved to: screenshots/${filename} and before.png`);
    } else if (mode === 'after') {
      const filename = label ? `after_${label}.png` : 'after.png';
      const outputPath = path.join(SCREENSHOT_DIR, filename);
      await captureScreen({ url: activeUrl, outputPath, delay, width, height, scale });
      fs.copyFileSync(outputPath, path.join(process.cwd(), 'after.png'));
      console.log(`✅ React App 'After' snapshot saved to: screenshots/${filename} and after.png`);
    } else if (mode === 'compare') {
      const beforeImgPath = path.join(SCREENSHOT_DIR, 'before.png');
      const afterImgPath = path.join(SCREENSHOT_DIR, 'after.png');
      const outputComparisonPath = path.join(SCREENSHOT_DIR, 'before_after_comparison.png');
      const title = label || 'React App UI Progress & Updates';
      await generateComparisonCard({ beforeImgPath, afterImgPath, outputComparisonPath, title });
    } else if (mode === 'showcase') {
      const galleryDir = path.join(SCREENSHOT_DIR, 'gallery');
      if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });
      const screenImgPath = path.join(galleryDir, '06_document_scanner_naturgy.png');
      
      console.log('📸 Capturing Naturgy Document Scanner screen...');
      await captureScreen({ url: `${baseServerUrl}/?onboarding=false&scanner=true`, outputPath: screenImgPath, delay, width, height, scale });
      fs.copyFileSync(screenImgPath, path.join(process.cwd(), 'document_scanner_naturgy.png'));

      const tooltipImgPath = path.join(galleryDir, '07_document_scanner_tooltip.png');
      console.log('📸 Capturing Naturgy Document Scanner Tooltip screen...');
      await captureScreen({ url: `${baseServerUrl}/?onboarding=false&scanner=true&tooltip=true`, outputPath: tooltipImgPath, delay, width, height, scale });
      fs.copyFileSync(tooltipImgPath, path.join(process.cwd(), 'document_scanner_tooltip.png'));

      const outputShowcasePath = path.join(SCREENSHOT_DIR, 'document_scanner_showcase.png');
      console.log('✨ Generating Naturgy Document Scanner Artisanal Showcase Card...');
      await generateShowcaseCard({
        screenImgPath,
        outputShowcasePath,
        title: 'Naturgy Utility & Document Scanner',
        description: 'Instant line-by-line English breakdown of local Panamanian electricity bills, municipal water, menus, and prescriptions with 1-tap Spanish audio inquiries.',
        highlights: [
          {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#964824" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
            title: 'Naturgy & IDAAN Bill Decoding',
            desc: 'Itemizes due amounts ($48.50), account/meter numbers (2049182-3), and kilowatt consumption into plain English.',
          },
          {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#964824" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
            title: '1-Tap Follow-Up Audio Questions',
            desc: 'Generates polite Panamanian Spanish questions with studio audio for WhatsApp inquiries.',
          },
          {
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#964824" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
            title: 'Full Document & Photo OCR',
            desc: 'Scan or upload restaurant seafood menus, pharmacy prescriptions, and contractor estimates.',
          },
        ],
      });
    } else if (mode === 'presets') {
      const presetsDeckPath = path.join(SCREENSHOT_DIR, 'presets_stacked_cards.png');
      console.log('📸 Capturing Presets Playing Cards Stacked Deck (Dining/Groceries prioritized)...');
      await captureScreen({ url: `${baseServerUrl}/?onboarding=false&tab=Presets`, outputPath: presetsDeckPath, delay, width, height, scale });
      fs.copyFileSync(presetsDeckPath, path.join(process.cwd(), 'presets_stacked_cards.png'));

      const dirDeckPath = path.join(SCREENSHOT_DIR, 'directory_stacked_decks.png');
      console.log('📸 Capturing Verified Directory Stacked Decks...');
      await captureScreen({ url: `${baseServerUrl}/?onboarding=false&tab=Directory`, outputPath: dirDeckPath, delay, width, height, scale });
      fs.copyFileSync(dirDeckPath, path.join(process.cwd(), 'directory_stacked_decks.png'));

      const convRepliesPath = path.join(SCREENSHOT_DIR, 'conversations_quick_replies.png');
      console.log('📸 Capturing WhatsApp Conversations Tactical Stacked Decks...');
      await captureScreen({ url: `${baseServerUrl}/?onboarding=false&tab=Threads`, outputPath: convRepliesPath, delay, width, height, scale });
      fs.copyFileSync(convRepliesPath, path.join(process.cwd(), 'conversations_quick_replies.png'));

      const scannerStackedPath = path.join(SCREENSHOT_DIR, 'document_scanner_stacked_questions.png');
      console.log('📸 Capturing Document Scanner Stacked Inquiries Flashcards...');
      await captureScreen({ url: `${baseServerUrl}/?onboarding=false&scanner=true`, outputPath: scannerStackedPath, delay, width, height, scale, scrollY: 550 });
      fs.copyFileSync(scannerStackedPath, path.join(process.cwd(), 'document_scanner_stacked_questions.png'));

      console.log('🎉 All 4 stacked deck screenshots saved to workspace root!');
    } else if (mode === 'tooltip-compare') {
      const beforeImgPath = path.join(SCREENSHOT_DIR, 'document_scanner_naturgy.png');
      console.log('📸 Capturing Naturgy Scanner Before (Collapsed)...');
      await captureScreen({ url: `${baseServerUrl}/?onboarding=false&scanner=true&tooltip=false`, outputPath: beforeImgPath, delay, width, height, scale });
      fs.copyFileSync(beforeImgPath, path.join(process.cwd(), 'document_scanner_naturgy.png'));

      const afterImgPath = path.join(SCREENSHOT_DIR, 'document_scanner_tooltip.png');
      console.log('📸 Capturing Naturgy Scanner After (Expanded Tooltip)...');
      await captureScreen({ url: `${baseServerUrl}/?onboarding=false&scanner=true&tooltip=true`, outputPath: afterImgPath, delay, width, height, scale });
      fs.copyFileSync(afterImgPath, path.join(process.cwd(), 'document_scanner_tooltip.png'));

      const outputComparisonPath = path.join(SCREENSHOT_DIR, 'naturgy_tooltip_before_after.png');
      console.log('✨ Generating Naturgy Currency Tooltip Before/After Comparison Card...');
      await generateComparisonCard({
        beforeImgPath,
        afterImgPath,
        outputComparisonPath,
        title: 'Naturgy Bill Scanner • B/. Currency Tooltip Interaction',
      });
      fs.copyFileSync(outputComparisonPath, path.join(process.cwd(), 'naturgy_tooltip_before_after.png'));
      console.log('🎉 Saved naturgy_tooltip_before_after.png to workspace root!');
    } else if (mode === 'quick') {
      const filename = label ? `snapshot_${label}.png` : `snapshot_${Date.now()}.png`;
      const outputPath = path.join(SCREENSHOT_DIR, filename);
      await captureScreen({ url: activeUrl, outputPath, delay, width, height, scale });
      console.log(`✅ Snapshot saved to: ${outputPath}`);
    } else {
      console.log(`Unknown mode: ${mode}. Available modes: all, before, after, compare, quick`);
    }
  } catch (err) {
    console.error('❌ Snapshot error:', err.message);
    process.exit(1);
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
  }
}

main();

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');
const DIST_DIR = path.join(process.cwd(), 'dist');
const WEB_DIR = path.join(process.cwd(), 'web-funnel');
const WORKSPACE_DIR = process.cwd();
const ARTIFACTS_DIR = '/Users/dorienvandenabbeele/.gemini/antigravity/brain/3d69dfac-9be7-467b-9b59-e92f4a5582c0';

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

async function captureScreen(browser, { url, width = 394, height = 852, scale = 2, delay = 1200, scrollY = 0 }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: scale, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: ['load', 'networkidle2'], timeout: 25000 });

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

  const buffer = await page.screenshot({ fullPage: false });
  await page.close();
  return buffer;
}

async function renderComparisonCard(browser, {
  beforeBase64,
  afterBase64,
  title,
  subtitle,
  beforeTag = '● BEFORE (v1.4.0)',
  afterTag = '● AFTER (v1.5.0) • RESTORED',
  beforeNotes = '',
  afterNotes = '',
  outputPath,
}) {
  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
        radial-gradient(circle at 50% 0%, #FFF5EE 0%, #FBF9F5 45%, #F5F1EB 100%),
        radial-gradient(rgba(150, 72, 36, 0.04) 1px, transparent 1px);
      background-size: 100% 100%, 28px 28px;
      color: #1B1C1A;
      width: 1600px;
      height: 1050px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 36px 64px;
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
      padding-bottom: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo-svg {
      width: 54px;
      height: 54px;
      flex-shrink: 0;
      filter: drop-shadow(0 4px 12px rgba(37, 211, 102, 0.2));
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: #1B1C1A;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .panama-badge {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11.5px;
      font-weight: 700;
      color: #964824;
      background: #FFDBCD;
      padding: 3px 10px;
      border-radius: 100px;
      letter-spacing: 0.2px;
      border: 1px solid #FD9A6F;
    }
    .header-right-title {
      text-align: right;
    }
    .header-title-text {
      font-family: 'Lexend', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #1B1C1A;
    }
    .header-sub-text {
      font-size: 13px;
      color: #64748B;
      margin-top: 2px;
    }

    .comparison-container {
      display: flex;
      gap: 56px;
      justify-content: center;
      align-items: center;
      flex: 1;
      margin: 12px 0;
      position: relative;
      z-index: 10;
    }
    .column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .tag {
      font-family: 'Lexend', sans-serif;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 5px 16px;
      border-radius: 100px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .tag-before {
      background: #FEE2E2;
      color: #B91C1C;
      border: 1.5px solid #FCA5A5;
    }
    .tag-after {
      background: #D1FAE5;
      color: #065F46;
      border: 1.5px solid #6EE7B7;
    }
    .phone-frame {
      width: 350px;
      height: 720px;
      background: #18191B;
      border-radius: 42px;
      padding: 10px;
      box-shadow: 0 20px 50px rgba(89, 79, 66, 0.15), 0 6px 16px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.12);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }
    .phone-frame.after {
      border: 2.5px solid #10B981;
      box-shadow: 0 25px 60px rgba(16, 185, 129, 0.2), 0 8px 24px rgba(0, 0, 0, 0.08);
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 32px;
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
    .notes-box {
      font-size: 11.5px;
      color: #5C554D;
      text-align: center;
      max-width: 340px;
      line-height: 1.4;
      margin-top: 4px;
    }
    .arrow-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #807264;
    }
    .arrow-icon {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 1.5px solid #E4E2DE;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #10B981;
      font-weight: 800;
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.12);
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #E4E2DE;
      padding-top: 14px;
      font-size: 12.5px;
      color: #5C554D;
      position: relative;
      z-index: 10;
    }
    .footer-left {
      display: flex;
      gap: 20px;
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
          <span class="panama-badge">Bocas del Toro 🇵🇦</span>
        </div>
        <div style="font-size: 13.5px; color: #594F42; margin-top: 2px;">Instant Panamanian Spanish Voice Notes</div>
      </div>
    </div>

    <div class="header-right-title">
      <div class="header-title-text">${title}</div>
      <div class="header-sub-text">${subtitle}</div>
    </div>
  </div>

  <div class="comparison-container">
    <div class="column">
      <div class="tag tag-before">${beforeTag}</div>
      <div class="phone-frame">
        <div class="phone-screen">
          <img src="data:image/png;base64,${beforeBase64}" alt="Before UI" />
        </div>
      </div>
      <div class="notes-box">${beforeNotes}</div>
    </div>

    <div class="arrow-divider">
      <div class="arrow-icon">→</div>
      <span style="font-family: 'Lexend'; font-size: 10.5px; font-weight: 700; letter-spacing: 1.5px; color: #807264;">EVOLUTION</span>
    </div>

    <div class="column">
      <div class="tag tag-after">${afterTag}</div>
      <div class="phone-frame after">
        <div class="phone-screen">
          <img src="data:image/png;base64,${afterBase64}" alt="After UI" />
        </div>
      </div>
      <div class="notes-box">${afterNotes}</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-left">
      <span>Generated: <strong class="highlight">${timestamp}</strong></span>
      <span>Platform: <strong class="highlight">React Native Web / Expo 54 (v1.5.0)</strong></span>
    </div>
    <div>
      <span>Created by <strong class="highlight">@DorienVibecodes</strong> • <span class="brand-link">poquitotalk.hero-apps.com</span></span>
    </div>
  </div>
</body>
</html>
  `;

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const cardBuffer = await page.screenshot({ fullPage: false });
  await page.close();

  fs.writeFileSync(outputPath, cardBuffer);
  fs.writeFileSync(path.join(WORKSPACE_DIR, path.basename(outputPath)), cardBuffer);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, path.basename(outputPath)), cardBuffer);
  console.log(`✨ Saved Before & After Comparison Card: ${path.basename(outputPath)}`);
}

async function run() {
  console.log('🚀 Starting Full Before & After Comparison Pipeline...');

  const { server: distServer, baseUrl: appUrl } = await startStaticServer(DIST_DIR, 8095);
  const { server: webServer, baseUrl: webUrl } = await startStaticServer(WEB_DIR, 8097);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // 1. Capture Presets Screen (After: v1.5.0 Fanned Deck)
    console.log('📸 Capturing Presets Screen (v1.5.0)...');
    const presetsAfterBuffer = await captureScreen(browser, { url: `${appUrl}/?onboarding=false&tab=Presets`, delay: 1500 });
    
    // Check if we have before image or fallback
    let presetsBeforeBuffer;
    const presetsBeforePath = path.join(SCREENSHOT_DIR, 'gallery/02_presets.png');
    if (fs.existsSync(presetsBeforePath)) {
      presetsBeforeBuffer = fs.readFileSync(presetsBeforePath);
    } else {
      presetsBeforeBuffer = presetsAfterBuffer;
    }

    await renderComparisonCard(browser, {
      beforeBase64: presetsBeforeBuffer.toString('base64'),
      afterBase64: presetsAfterBuffer.toString('base64'),
      title: 'Templates & Island Presets Screen',
      subtitle: 'Fanned Overlapping Playing Cards & Auto-Scroll Choreography',
      beforeTag: '● BEFORE (v1.4.0)',
      afterTag: '● AFTER (v1.5.0) • RESTORED',
      beforeNotes: 'Separated disconnected cards with gaps • Manual tap required',
      afterNotes: 'Zero-gap fanned playing card deck (-18px) • Bi-directional scroll auto-open',
      outputPath: path.join(SCREENSHOT_DIR, 'before_after_presets_screen.png'),
    });

    // 2. Capture Directory Screen (Verified Providers)
    console.log('📸 Capturing Directory Screen (v1.5.0)...');
    const dirAfterBuffer = await captureScreen(browser, { url: `${appUrl}/?onboarding=false&tab=Directory`, delay: 1500 });
    let dirBeforeBuffer;
    const dirBeforePath = path.join(SCREENSHOT_DIR, 'gallery/04_verified_providers.png');
    if (fs.existsSync(dirBeforePath)) {
      dirBeforeBuffer = fs.readFileSync(dirBeforePath);
    } else {
      dirBeforeBuffer = dirAfterBuffer;
    }

    await renderComparisonCard(browser, {
      beforeBase64: dirBeforeBuffer.toString('base64'),
      afterBase64: dirAfterBuffer.toString('base64'),
      title: 'Verified Local Directory Screen',
      subtitle: 'Overlapping Island Category Decks & WhatsApp Direct Dispatch',
      beforeTag: '● BEFORE (v1.4.0)',
      afterTag: '● AFTER (v1.5.0)',
      beforeNotes: 'Static cards with standard spacing',
      afterNotes: 'Stacked fanned decks with Bocas emergency numbers & captains',
      outputPath: path.join(SCREENSHOT_DIR, 'before_after_directory_screen.png'),
    });

    // 3. Capture Translate Home Screen
    console.log('📸 Capturing Translate Screen (v1.5.0)...');
    const homeAfterBuffer = await captureScreen(browser, { url: `${appUrl}/?onboarding=false&tab=Translate`, delay: 1500 });
    let homeBeforeBuffer;
    const homeBeforePath = path.join(SCREENSHOT_DIR, 'gallery/01_translate_home.png');
    if (fs.existsSync(homeBeforePath)) {
      homeBeforeBuffer = fs.readFileSync(homeBeforePath);
    } else {
      homeBeforeBuffer = homeAfterBuffer;
    }

    await renderComparisonCard(browser, {
      beforeBase64: homeBeforeBuffer.toString('base64'),
      afterBase64: homeAfterBuffer.toString('base64'),
      title: 'Translate & Voice Generator Home',
      subtitle: 'Version 1.5.0 Header Badge & Dialect Tone Switcher',
      beforeTag: '● BEFORE (v1.4.0)',
      afterTag: '● AFTER (v1.5.0)',
      beforeNotes: 'v1.4.0 header badge • Standard tone selector',
      afterNotes: 'v1.5.0 header badge • Synchronized parrot mascot & clipboard translation',
      outputPath: path.join(SCREENSHOT_DIR, 'before_after_translate_screen.png'),
    });

    // 4. Capture Website Funnel (poquitotalk.hero-apps.com)
    console.log('📸 Capturing Website Funnel (Web)...');
    const webAfterBuffer = await captureScreen(browser, { url: webUrl, width: 394, height: 852, delay: 1500 });
    let webBeforeBuffer;
    const webBeforePath = path.join(SCREENSHOT_DIR, 'snapshot_demo.png');
    if (fs.existsSync(webBeforePath)) {
      webBeforeBuffer = fs.readFileSync(webBeforePath);
    } else {
      webBeforeBuffer = webAfterBuffer;
    }

    await renderComparisonCard(browser, {
      beforeBase64: webBeforeBuffer.toString('base64'),
      afterBase64: webAfterBuffer.toString('base64'),
      title: 'Web Funnel & Voice Note Generator',
      subtitle: 'Perched Mascot, iOS Segmented Slider & Crisp Black Tooltips',
      beforeTag: '● BEFORE',
      afterTag: '● AFTER • LIVE ON WEB',
      beforeNotes: 'Walkie-talkie badge • Dark grey/blue tooltip • "Police Station ATM"',
      afterNotes: 'Perched Poquito mascot • iOS segmented slider • Pure black tooltips',
      outputPath: path.join(SCREENSHOT_DIR, 'before_after_web_funnel.png'),
    });

    console.log('🎉 All Before & After comparison cards generated successfully!');
  } finally {
    await browser.close();
    distServer.close();
    webServer.close();
  }
}

run().catch((err) => {
  console.error('Error running comparisons:', err);
  process.exit(1);
});

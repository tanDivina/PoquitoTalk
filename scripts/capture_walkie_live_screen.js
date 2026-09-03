#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const WORKSPACE_DIR = path.join(__dirname, '..');
const SCREENSHOT_DIR = path.join(WORKSPACE_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function startStaticServer(dir, port) {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.webp': 'image/webp',
      '.mp3': 'audio/mpeg',
      '.svg': 'image/svg+xml',
      '.ttf': 'font/ttf',
    };

    const server = http.createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      let filePath = path.join(dir, urlPath === '/' ? 'index.html' : urlPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(dir, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading file');
          return;
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        });
        res.end(content);
      });
    });

    server.listen(port, () => {
      resolve(server);
    });
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 Starting local web server on port 8140...');
  const server = await startStaticServer(DIST_DIR, 8140);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 393,
    height: 852,
    deviceScaleFactor: 3, // Retina 3x
    isMobile: true,
    hasTouch: true,
  });

  // Contractor response data
  const contractorName = encodeURIComponent('Capitán Mingo (Lancha)');
  const promptText = encodeURIComponent('¡Buenas jefe! Ya voy saliendo del muelle central de Bocas Town con la lancha. Llego a Carenero en unos diez minutos con los tanques de agua.');
  const outputText = encodeURIComponent('Captain Mingo is letting you know he just left the main Bocas Town dock in his boat and will arrive at your dock in Carenero in about 10 minutes with the water tanks.');

  const targetUrl = `http://localhost:8140/?onboarding=false&from=es&to=en&walkieSender=${contractorName}&prompt=${promptText}&output=${outputText}`;

  console.log('📱 Navigating to app with live walkie channel parameters...');
  await page.goto(targetUrl, { waitUntil: 'networkidle0' });

  // Wait for animations and fonts
  await sleep(1500);

  // Capture direct device screen
  const rawScreenPath = path.join(WORKSPACE_DIR, 'walkie_live_banner_screen.png');
  const screenshotPath = path.join(SCREENSHOT_DIR, 'walkie_live_banner_screen.png');

  await page.screenshot({ path: rawScreenPath, type: 'png' });
  fs.copyFileSync(rawScreenPath, screenshotPath);
  console.log(`✅ Raw mobile screenshot saved to: ${rawScreenPath}`);

  // Now create a framed high-resolution presentation card
  console.log('🎨 Generating framed showcase mockup on warm island background...');
  const showcasePage = await browser.newPage();
  await showcasePage.setViewport({
    width: 1200,
    height: 900,
    deviceScaleFactor: 2,
  });

  const rawBase64 = fs.readFileSync(rawScreenPath).toString('base64');

  const showcaseHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 1200px;
        height: 900px;
        background: radial-gradient(circle at 50% 20%, #FFFFFF 0%, #FAF8F5 55%, #F3EFEA 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Plus Jakarta Sans', sans-serif;
        position: relative;
        overflow: hidden;
      }

      /* Subtle grid background texture */
      .bg-grid {
        position: absolute;
        inset: 0;
        background-size: 32px 32px;
        background-image: 
          linear-gradient(to right, rgba(46, 64, 45, 0.035) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(46, 64, 45, 0.035) 1px, transparent 1px);
        pointer-events: none;
      }

      .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 1040px;
        z-index: 2;
        gap: 60px;
      }

      .info-side {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #D5E8D1;
        border: 1px solid #B7D9B1;
        color: #1B5E20;
        padding: 6px 14px;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        width: fit-content;
      }

      .live-dot {
        width: 8px;
        height: 8px;
        background: #16A34A;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(22, 163, 74, 0.8);
      }

      h1 {
        font-size: 36px;
        font-weight: 800;
        color: #1E293B;
        line-height: 1.2;
        letter-spacing: -0.02em;
      }

      h1 span {
        color: #D97706;
      }

      p {
        font-size: 16px;
        color: #475569;
        line-height: 1.55;
      }

      .feature-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 6px;
      }

      .feature-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(46, 64, 45, 0.08);
        border-radius: 14px;
        padding: 12px 16px;
        box-shadow: 0 4px 12px rgba(46, 64, 45, 0.03);
      }

      .feature-icon {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: #F0FDF4;
        border: 1px solid #BBF7D0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #16A34A;
        font-size: 14px;
        flex-shrink: 0;
      }

      .feature-text {
        font-size: 14px;
        color: #334155;
        line-height: 1.4;
      }

      .feature-text strong {
        color: #0F172A;
      }

      /* Realistic Titanium Phone Chassis */
      .phone-wrapper {
        position: relative;
        width: 375px;
        height: 760px;
        background: #000;
        border-radius: 50px;
        padding: 10px;
        box-shadow: 
          0 0 0 2px #475569,
          0 0 0 5px #1E293B,
          0 24px 60px rgba(0, 0, 0, 0.25),
          0 10px 20px rgba(0, 0, 0, 0.12);
        flex-shrink: 0;
      }

      .phone-screen {
        width: 100%;
        height: 100%;
        border-radius: 40px;
        overflow: hidden;
        position: relative;
        background: #FFFFFF;
      }

      .phone-screen img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
      }

      /* Dynamic Island */
      .dynamic-island {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 108px;
        height: 28px;
        background: #000000;
        border-radius: 20px;
        z-index: 100;
      }
    </style>
  </head>
  <body>
    <div class="bg-grid"></div>
    <div class="container">
      <div class="info-side">
        <div class="badge">
          <div class="live-dot"></div>
          Canal Walkie-Talkie en Vivo
        </div>
        <h1>Two-Way Radio Reception <span>Inside PoquitoTalk</span></h1>
        <p>
          When the contractor replies by voice via the zero-install web link, the Expat receives the transmission in real time with instant speech-to-text decoding and English translation.
        </p>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">🟢</div>
            <div class="feature-text">
              <strong>Active Live Radio Banner:</strong> Pulsing green live indicator and acoustic waveform signaling an incoming audio transmission.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎙️</div>
            <div class="feature-text">
              <strong>Gemma AI Speech-to-English:</strong> Raw Panamanian contractor audio decoded into clear English meaning with island landmark recognition.
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <div class="feature-text">
              <strong>Dual Audio Playback:</strong> Listen to authentic Spanish voice note or hear synthesized English audio on demand.
            </div>
          </div>
        </div>
      </div>

      <div class="phone-wrapper">
        <div class="dynamic-island"></div>
        <div class="phone-screen">
          <img src="data:image/png;base64,${rawBase64}" />
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await showcasePage.setContent(showcaseHtml, { waitUntil: 'networkidle0' });
  await sleep(1000);

  const showcasePath = path.join(WORKSPACE_DIR, 'walkie_live_banner_showcase.png');
  const screenshotShowcasePath = path.join(SCREENSHOT_DIR, 'walkie_live_banner_showcase.png');

  await showcasePage.screenshot({ path: showcasePath, type: 'png' });
  fs.copyFileSync(showcasePath, screenshotShowcasePath);
  console.log(`✅ Framed showcase screenshot saved to: ${showcasePath}`);

  await browser.close();
  server.close();
  console.log('🎉 Done! Screenshots successfully created.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

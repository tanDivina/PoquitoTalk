#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WEB_DIR = path.join(__dirname, '..', 'web-funnel');
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
    };

    const server = http.createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      let filePath = path.join(dir, urlPath === '/' ? 'talk.html' : urlPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(dir, 'talk.html');
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
  console.log('🚀 Starting local server on port 8155 for talk.html...');
  const server = await startStaticServer(WEB_DIR, 8155);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2, // 2x Retina
    isMobile: true,
    hasTouch: true,
  });

  const topicEs = encodeURIComponent('Hola amigo, ¿tienes lancha disponible para llevarnos de Bocas Town a Isla Solarte hoy a las 2:00 PM?');
  const topicEn = encodeURIComponent('Hello friend, do you have a boat available to take us from Bocas Town to Isla Solarte today at 2:00 PM?');
  const targetUrl = `http://localhost:8155/talk.html?room=session_bocas_88&client=Dorien&topic=${topicEs}&topicEn=${topicEn}`;

  console.log('📱 Loading talk.html...');
  await page.goto(targetUrl, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.body.style.paddingTop = '28px';
  });
  await sleep(1000);

  // 1. Stage 1: Standby State
  console.log('📸 Capturing Stage 1: Standby State...');
  await page.evaluate(() => {
    window.setMascotState('standby');
  });
  await sleep(500);
  const stage1Path = path.join(WORKSPACE_DIR, 'talk_stage_1_standby.png');
  await page.screenshot({ path: stage1Path, type: 'png' });
  fs.copyFileSync(stage1Path, path.join(SCREENSHOT_DIR, 'talk_stage_1_standby.png'));

  // 2. Stage 2: Listening State (Audio Playing / Walkie RX)
  console.log('📸 Capturing Stage 2: Listening State...');
  await page.evaluate(() => {
    window.setMascotState('listening');
    const btn = document.getElementById('openingListenBtn');
    const btnText = document.getElementById('openingListenBtnText');
    const icon = document.getElementById('openingPlayIcon');
    const soundwaves = document.getElementById('openingSoundwaves');

    if (btn) btn.classList.add('playing');
    if (btnText) btnText.innerText = 'Pausar Audio';
    if (icon) icon.innerHTML = '<rect x="6" y="4" width="4" height="16" fill="currentColor"></rect><rect x="14" y="4" width="4" height="16" fill="currentColor"></rect>';
    if (soundwaves) soundwaves.classList.remove('paused');
  });
  await sleep(600);
  const stage2Path = path.join(WORKSPACE_DIR, 'talk_stage_2_listening.png');
  await page.screenshot({ path: stage2Path, type: 'png' });
  fs.copyFileSync(stage2Path, path.join(SCREENSHOT_DIR, 'talk_stage_2_listening.png'));

  // 3. Stage 3: Recording State (Speaking / Walkie TX / Moving Beak)
  console.log('📸 Capturing Stage 3: Recording State...');
  await page.evaluate(() => {
    window.setMascotState('recording');
  });
  await sleep(600);
  const stage3Path = path.join(WORKSPACE_DIR, 'talk_stage_3_recording.png');
  await page.screenshot({ path: stage3Path, type: 'png' });
  fs.copyFileSync(stage3Path, path.join(SCREENSHOT_DIR, 'talk_stage_3_recording.png'));

  // 4. Generate High-Fidelity 3-Up Showcase Presentation Card
  console.log('🎨 Generating 3-Up Showcase Comparison Card...');
  const stage1Base64 = fs.readFileSync(stage1Path).toString('base64');
  const stage2Base64 = fs.readFileSync(stage2Path).toString('base64');
  const stage3Base64 = fs.readFileSync(stage3Path).toString('base64');

  const showcasePage = await browser.newPage();
  await showcasePage.setViewport({
    width: 1400,
    height: 960,
    deviceScaleFactor: 2,
  });

  const showcaseHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 1400px;
        height: 960px;
        background: radial-gradient(circle at 50% 15%, #FFFFFF 0%, #FAF8F5 50%, #F2ECE1 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Plus Jakarta Sans', sans-serif;
        position: relative;
        overflow: hidden;
        padding: 30px;
      }

      .bg-grid {
        position: absolute;
        inset: 0;
        background-size: 36px 36px;
        background-image: 
          linear-gradient(to right, rgba(46, 64, 45, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(46, 64, 45, 0.04) 1px, transparent 1px);
        pointer-events: none;
      }

      .header-block {
        text-align: center;
        margin-bottom: 24px;
        z-index: 2;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #EAF4E8;
        border: 1.5px solid #A8D5A2;
        color: #1E6426;
        padding: 5px 16px;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: 8px;
      }

      .live-dot {
        width: 8px;
        height: 8px;
        background: #16A34A;
        border-radius: 50%;
        box-shadow: 0 0 8px rgba(22, 163, 74, 0.9);
      }

      h1 {
        font-size: 32px;
        font-weight: 900;
        color: #1A1208;
        letter-spacing: -0.025em;
      }

      h1 span {
        color: #964824;
      }

      .subtitle {
        font-size: 15px;
        font-weight: 600;
        color: #5C4E3A;
        margin-top: 4px;
      }

      /* 3-Column Phone Grid */
      .stages-grid {
        display: flex;
        gap: 28px;
        justify-content: center;
        align-items: flex-start;
        z-index: 2;
        width: 100%;
        max-width: 1320px;
      }

      .stage-column {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .stage-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.02em;
      }

      .stage-1 .stage-header {
        background: #F1F5F9;
        border: 1px solid #CBD5E1;
        color: #334155;
      }

      .stage-2 .stage-header {
        background: #F0FDF4;
        border: 1px solid #86EFAC;
        color: #15803D;
      }

      .stage-3 .stage-header {
        background: #FEF2F2;
        border: 1px solid #FCA5A5;
        color: #B91C1C;
      }

      /* Phone Mockup Frame */
      .phone-chassis {
        width: 330px;
        height: 680px;
        background: #000;
        border-radius: 44px;
        padding: 8px;
        box-shadow: 
          0 0 0 2px #475569,
          0 0 0 4px #1E293B,
          0 20px 45px rgba(0, 0, 0, 0.18),
          0 4px 12px rgba(0, 0, 0, 0.08);
        position: relative;
        flex-shrink: 0;
      }

      .phone-screen {
        width: 100%;
        height: 100%;
        border-radius: 36px;
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

      .dynamic-island {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 18px;
        background: #000000;
        border-radius: 12px;
        z-index: 100;
      }

      /* Stage Description Footer */
      .stage-desc {
        text-align: center;
        font-size: 12.5px;
        color: #5C4E3A;
        line-height: 1.45;
        max-width: 310px;
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(150, 72, 36, 0.12);
        padding: 8px 12px;
        border-radius: 12px;
      }

      .stage-desc strong {
        color: #1A1208;
        display: block;
        margin-bottom: 2px;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <div class="bg-grid"></div>

    <div class="header-block">
      <div class="badge">
        <div class="live-dot"></div>
        Zero-Install Contractor Magic Link
      </div>
      <h1>Synchronized Walkie-Talkie <span>Mascot Stages</span></h1>
      <p class="subtitle">
        Crisp Vector SVG rig with 3 distinct behavioral animation states & unboxed natural layout
      </p>
    </div>

    <div class="stages-grid">
      <!-- Stage 1 -->
      <div class="stage-column stage-1">
        <div class="stage-header">
          <span>1. Standby (Resting)</span>
        </div>
        <div class="phone-chassis">
          <div class="dynamic-island"></div>
          <div class="phone-screen">
            <img src="data:image/png;base64,${stage1Base64}" />
          </div>
        </div>
        <div class="stage-desc">
          <strong>Perched & Calm</strong>
          Calm breathing, scanning pupils, steady green LED, unboxed transparent layout.
        </div>
      </div>

      <!-- Stage 2 -->
      <div class="stage-column stage-2">
        <div class="stage-header">
          <span>2. Listening (Client Audio)</span>
        </div>
        <div class="phone-chassis">
          <div class="dynamic-island"></div>
          <div class="phone-screen">
            <img src="data:image/png;base64,${stage2Base64}" />
          </div>
        </div>
        <div class="stage-desc">
          <strong>Audio Playing (Walkie RX)</strong>
          Ruffled feathers, dancing crest, pulsing green radio waves, "ESCUCHANDO AUDIO..."
        </div>
      </div>

      <!-- Stage 3 -->
      <div class="stage-column stage-3">
        <div class="stage-header">
          <span>3. Speaking (Recording)</span>
        </div>
        <div class="phone-chassis">
          <div class="dynamic-island"></div>
          <div class="phone-screen">
            <img src="data:image/png;base64,${stage3Base64}" />
          </div>
        </div>
        <div class="stage-desc">
          <strong>Voice Recording (Walkie TX)</strong>
          Moving lower beak opening/closing, alert crest, red glowing LED & live transcript.
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await showcasePage.setContent(showcaseHtml, { waitUntil: 'domcontentloaded' });
  await sleep(1500);

  const showcasePath = path.join(WORKSPACE_DIR, 'walkie_talkie_3_stages_showcase.png');
  await showcasePage.screenshot({ path: showcasePath, type: 'png' });
  fs.copyFileSync(showcasePath, path.join(SCREENSHOT_DIR, 'walkie_talkie_3_stages_showcase.png'));

  console.log(`✅ 3-Up Showcase saved to: ${showcasePath}`);

  await browser.close();
  server.close();
  console.log('🎉 Complete! All stage screenshots and showcase generated.');
}

main().catch((err) => {
  console.error('Error generating screenshots:', err);
  process.exit(1);
});

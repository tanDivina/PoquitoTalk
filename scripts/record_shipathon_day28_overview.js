#!/usr/bin/env node

/**
 * Premium 30-Second Shipathon Day 28 Complete Walkthrough Engine
 * Uses real-time 30 FPS FFmpeg pipe streaming with animated heartbeat & smooth bezier touch physics.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync, spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const WORKSPACE_DIR = path.join(__dirname, '..');
const OUTPUT_VIDEO = path.join(WORKSPACE_DIR, 'walkthrough_overview_30s.mp4');
const TEMP_RAW_VIDEO = path.join(WORKSPACE_DIR, 'temp_raw_screencast.mp4');
const PORT = 8098;

function startStaticServer() {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.ttf': 'font/ttf',
      '.ico': 'image/x-icon',
      '.mp3': 'audio/mpeg',
    };

    const server = http.createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading file');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });

    server.listen(PORT, () => {
      resolve(server);
    });
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('🎬 Starting Premium 30 FPS Shipathon Walkthrough Video Engine...');

  console.log('📦 Bundling app (`npx expo export -p web`)...');
  execSync('npx expo export -p web', { stdio: 'inherit', cwd: WORKSPACE_DIR });

  const server = await startStaticServer();
  console.log(`📡 Local server listening on http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-web-security',
      '--window-size=480,960',
    ],
  });

  const page = await browser.newPage();
  page.on('dialog', async (dialog) => {
    try { await dialog.dismiss(); } catch (e) {}
  });

  await page.setViewport({
    width: 480,
    height: 960,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  console.log('📱 Loading app at the Splash Screen...');
  await page.goto(`http://localhost:${PORT}/?splash=true&onboarding=true`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Inject device styling, FPS heartbeat, and smooth touch pointer
  await page.evaluate(() => {
    const root = document.getElementById('root');
    const pageWrapper = document.createElement('div');
    pageWrapper.id = 'android-page-wrapper';

    const chassis = document.createElement('div');
    chassis.id = 'android-chassis';

    const speaker = document.createElement('div');
    speaker.id = 'android-speaker';

    const screenBezel = document.createElement('div');
    screenBezel.id = 'android-screen';

    const cameraHole = document.createElement('div');
    cameraHole.id = 'android-camera-hole';

    if (root && root.parentNode) {
      root.parentNode.insertBefore(pageWrapper, root);
      pageWrapper.appendChild(chassis);
      chassis.appendChild(speaker);
      chassis.appendChild(screenBezel);
      screenBezel.appendChild(root);
      screenBezel.appendChild(cameraHole);
    }

    const style = document.createElement('style');
    style.innerHTML = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 480px !important;
        height: 960px !important;
        overflow: hidden !important;
        background: #FAF8F5 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: -apple-system, Roboto, sans-serif !important;
      }
      #android-page-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #FAF8F5;
      }
      #android-chassis {
        width: 422px;
        height: 880px;
        background: #151619;
        border-radius: 48px;
        padding: 12px 14px 14px 14px;
        box-shadow: 
          0 28px 70px rgba(89, 79, 66, 0.22),
          0 10px 25px rgba(0, 0, 0, 0.16),
          inset 0 0 0 1.5px rgba(255, 255, 255, 0.12);
        border: 3.5px solid #2E333D;
        position: relative;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      #android-speaker {
        position: absolute;
        top: 5px;
        left: 50%;
        transform: translateX(-50%);
        width: 46px;
        height: 3.5px;
        background: #0A0B0E;
        border-radius: 2px;
        z-index: 99999;
      }
      #android-screen {
        width: 394px;
        height: 852px;
        border-radius: 36px;
        overflow: hidden;
        position: relative;
        background: #FAF8F5;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
      }
      #root {
        width: 100% !important;
        height: 100% !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        overflow: hidden !important;
      }
      #android-camera-hole {
        position: absolute;
        top: 13px;
        left: 50%;
        transform: translateX(-50%);
        width: 13px;
        height: 13px;
        background: #040507;
        border-radius: 50%;
        border: 1.5px solid rgba(255, 255, 255, 0.08);
        box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.9);
        z-index: 99999;
        pointer-events: none;
      }
      #virtual-touch-pointer {
        position: fixed;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(160, 74, 38, 0.55);
        border: 2px solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease;
        opacity: 0;
      }
      #virtual-touch-pointer.visible {
        opacity: 1;
      }
      #virtual-touch-pointer.tapping {
        transform: translate(-50%, -50%) scale(0.75);
        background: rgba(160, 74, 38, 0.95);
      }
      .touch-ripple-effect {
        position: fixed;
        width: 65px;
        height: 65px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(160, 74, 38, 0.55) 0%, rgba(160, 74, 38, 0) 70%);
        pointer-events: none;
        z-index: 999998;
        transform: translate(-50%, -50%) scale(0.2);
        animation: touchRippleAnim 0.45s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
      }
      @keyframes touchRippleAnim {
        0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
      }
      #fps-heartbeat {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 1px;
        height: 1px;
        opacity: 0.01;
        animation: heartbeat 0.033s infinite linear;
      }
      @keyframes heartbeat {
        0% { opacity: 0.01; }
        50% { opacity: 0.02; }
        100% { opacity: 0.01; }
      }
    `;
    document.head.appendChild(style);

    const heartbeat = document.createElement('div');
    heartbeat.id = 'fps-heartbeat';
    document.body.appendChild(heartbeat);

    const pointer = document.createElement('div');
    pointer.id = 'virtual-touch-pointer';
    pointer.style.left = '240px';
    pointer.style.top = '1200px';
    document.body.appendChild(pointer);

    window.simulateTouchMove = (x, y) => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) {
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
      }
    };
  });

  // Start FFmpeg real-time pipe stream
  console.log('🎥 Starting ffmpeg real-time streaming process...');
  const ffmpegStream = spawn('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '30',
    '-i', '-',
    '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    TEMP_RAW_VIDEO
  ]);

  const cdp = await page.target().createCDPSession();
  let frameCount = 0;

  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 90,
    everyNthFrame: 1,
  });

  cdp.on('Page.screencastFrame', async ({ data, sessionId }) => {
    try {
      frameCount++;
      const buf = Buffer.from(data, 'base64');
      ffmpegStream.stdin.write(buf);
      await cdp.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {}
  });

  let curCursorX = 240;
  let curCursorY = 1200;

  async function moveTouchSmooth(toX, toY, durationMs = 500) {
    await page.evaluate(() => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) p.classList.add('visible');
    });

    const fromX = curCursorX;
    const fromY = curCursorY > 1000 ? toY + 60 : curCursorY;
    const steps = Math.max(8, Math.round((durationMs / 1000) * 30));
    const delay = durationMs / steps;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      curCursorX = fromX + (toX - fromX) * ease;
      curCursorY = fromY + (toY - fromY) * ease;

      await page.evaluate((x, y) => {
        if (window.simulateTouchMove) window.simulateTouchMove(x, y);
      }, Math.round(curCursorX), Math.round(curCursorY));

      await sleep(delay);
    }
  }

  async function tapSmooth(toX, toY, preMoveMs = 450) {
    await moveTouchSmooth(toX, toY, preMoveMs);
    await page.evaluate((x, y) => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) {
        p.classList.add('tapping');
        setTimeout(() => p.classList.remove('tapping'), 200);
      }
      const ripple = document.createElement('div');
      ripple.className = 'touch-ripple-effect';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 450);
    }, toX, toY);

    await sleep(140);
    await page.mouse.click(toX, toY);
    await sleep(100);
  }

  async function tapElementByText(queryText, preMoveMs = 450) {
    const coords = await page.evaluate((text) => {
      const all = Array.from(document.querySelectorAll('div, span, p, a, button, [role="button"], [aria-label]'));
      const matching = all.filter(el => {
        const txt = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim();
        const rect = el.getBoundingClientRect();
        return rect.width > 5 && rect.height > 5 && (txt === text || txt.includes(text));
      });
      if (matching.length === 0) return null;
      matching.sort((a, b) => (a.offsetWidth * a.offsetHeight) - (b.offsetWidth * b.offsetHeight));
      const target = matching[0];
      const rect = target.getBoundingClientRect();
      target.click();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, queryText);

    if (coords) {
      await tapSmooth(coords.x, coords.y, preMoveMs);
      return true;
    }
    return false;
  }

  async function hidePointer() {
    await page.evaluate(() => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) {
        p.classList.remove('visible', 'tapping');
        p.style.top = '1200px';
      }
    });
    curCursorY = 1200;
  }

  // =========================================================================
  // SCENE 1: SPLASH SCREEN (0:00 - 0:02.5) -> 2.5s
  // =========================================================================
  console.log('🌟 [Scene 1] Splash Screen: Mascot & Golden Soundwaves (2.5s)...');
  await hidePointer();
  await sleep(2500); // 2.5s fluid brand intro

  // =========================================================================
  // SCENE 2: ONBOARDING STEP 1 (0:02.5 - 0:05.5) -> 3.0s
  // =========================================================================
  console.log('📋 [Scene 2] Onboarding Step 1: Island Features & Setup (3.0s)...');
  await sleep(1200);
  console.log('👉 Tapping "Set Up My Voice"...');
  await tapElementByText('Set Up My Voice', 500);
  await sleep(1300);

  // =========================================================================
  // SCENE 3: ONBOARDING STEP 2 (0:05.5 - 0:09.0) -> 3.5s
  // =========================================================================
  console.log('📋 [Scene 3] Onboarding Step 2: Persona & Voice (3.5s)...');
  await sleep(600);
  console.log('👉 Selecting "Traveler" Persona...');
  await tapElementByText('Traveler', 400);
  await sleep(500);

  console.log('👉 Selecting "Male Voice"...');
  await tapElementByText('Male Voice', 400);
  await sleep(500);

  console.log('👉 Tapping "Next"...');
  await tapElementByText('Next', 450);
  await sleep(1000);

  // =========================================================================
  // SCENE 4: ONBOARDING STEP 3 (0:09.0 - 0:11.5) -> 2.5s
  // =========================================================================
  console.log('📋 [Scene 4] Onboarding Step 3: Summary & Dancing Mascot (2.5s)...');
  await hidePointer();
  await sleep(1500);

  console.log('👉 Tapping "Start Using PoquitoTalk"...');
  await tapElementByText('Start Using PoquitoTalk', 450);
  await sleep(800);

  // =========================================================================
  // SCENE 5: THE PAYWALL SCREEN (0:11.5 - 0:16.0) -> 4.5s
  // =========================================================================
  console.log('💎 [Scene 5] The Paywall Screen: Island Pass & Tiers (4.5s)...');
  await sleep(1200);

  console.log('👉 Toggling "Monthly" tier ($4.99)...');
  await tapElementByText('Monthly', 450);
  await sleep(1000);

  console.log('👉 Toggling "Annual Pass" ($39.99)...');
  await tapElementByText('Annual Pass', 450);
  await sleep(1200);

  console.log('👉 Dismissing Paywall to Enter Main App...');
  await page.evaluate(() => {
    const closeBtn = document.querySelector('[aria-label*="Close paywall"]') || document.querySelector('[aria-label*="Close"]');
    if (closeBtn) {
      closeBtn.click();
    } else {
      const all = Array.from(document.querySelectorAll('div, span, button'));
      const found = all.find(el => el.getAttribute('aria-label')?.includes('Close') || el.innerText === '✕');
      if (found) found.click();
    }
  });
  await hidePointer();
  await sleep(800);

  // =========================================================================
  // SCENE 6: HOME SCREEN & TRANSLATION (0:16.0 - 0:21.0) -> 5.0s
  // =========================================================================
  console.log('🏠 [Scene 6] Home Screen & Live Panama Spanish Translation (5.0s)...');
  await sleep(800);

  console.log('✍️ Typing island phrase in input...');
  await page.evaluate(() => {
    const input = document.querySelector('textarea, input[type="text"]');
    if (input) input.focus();
  });

  const phrase = 'Can you pick me up at 3pm?';
  await page.evaluate((txt) => {
    const input = document.querySelector('textarea, input[type="text"]');
    if (input) {
      input.value = txt;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, phrase);
  await sleep(1000);

  console.log('🦜 Tapping Translate to Panama Spanish...');
  await tapElementByText('Translate to Panama Spanish', 450);
  await hidePointer();
  await sleep(2200); // Admire translated result

  // =========================================================================
  // SCENE 7: BOCAS DIRECTORY (0:21.0 - 0:24.5) -> 3.5s
  // =========================================================================
  console.log('📖 [Scene 7] Bocas Island Directory (3.5s)...');
  await tapElementByText('Directory', 450);
  await hidePointer();
  await sleep(800);

  // Smooth realistic scroll
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => window.scrollBy({ top: 85, behavior: 'smooth' }));
    await sleep(550);
  }

  // =========================================================================
  // SCENE 8: PRESETS & PHRASEBOOKS (0:24.5 - 0:27.5) -> 3.0s
  // =========================================================================
  console.log('⚡ [Scene 8] Island Presets & Phrasebooks (3.0s)...');
  await tapElementByText('Templates', 450);
  await sleep(800);

  console.log('👉 Opening Water Taxis phrasebook...');
  await tapElementByText('Water Taxis', 400);
  await hidePointer();
  await sleep(1800);

  // =========================================================================
  // SCENE 9: 2-WAY WALKIE-TALKIE (0:27.5 - 0:30.5) -> 3.0s
  // =========================================================================
  console.log('📻 [Scene 9] 2-Way Walkie-Talkie Channel (3.0s)...');
  await tapElementByText('Translate', 400);
  await sleep(600);

  console.log('👉 Opening 2-Way Walkie...');
  await tapElementByText('2-Way Walkie', 450);
  await hidePointer();
  await sleep(2200);

  // Finalize video recording
  console.log('🛑 Finalizing video recording...');
  await cdp.send('Page.stopScreencast');
  await browser.close();
  server.close();

  ffmpegStream.stdin.end();
  await new Promise((resolve) => ffmpegStream.on('close', resolve));

  console.log(`✅ Raw video captured: ${frameCount} frames (${(frameCount / 30).toFixed(1)}s)`);

  // Final high-quality FFmpeg encode
  console.log('🎬 Encoding final polished MP4 video with FFmpeg...');
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -i "${TEMP_RAW_VIDEO}" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p "${OUTPUT_VIDEO}"`,
    { stdio: 'inherit' }
  );

  if (fs.existsSync(TEMP_RAW_VIDEO)) fs.unlinkSync(TEMP_RAW_VIDEO);

  console.log(`🎉 Perfectly Paced 30-Second Walkthrough Video created: ${OUTPUT_VIDEO}`);
}

main().catch((err) => {
  console.error('❌ Error executing video generator:', err);
  process.exit(1);
});

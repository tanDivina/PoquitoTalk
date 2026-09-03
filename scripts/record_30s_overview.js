#!/usr/bin/env node

/**
 * High-Speed, Dynamic 30-Second Mobile App Overview Video Engine
 * Flow:
 * 1. Screen 1 (0:00 - 0:06): First Screen / Home Translation (Poquito mascot, type & translate)
 * 2. Screen 2 (0:06 - 0:12): Bocas Directory (Water Taxis, Electricians, Contractors)
 * 3. Screen 3 (0:12 - 0:17): Island Presets & Emergency Templates
 * 4. Screen 4 (0:17 - 0:22): 2-Way Walkie-Talkie Feature
 * 5. Screen 5 (0:22 - 0:29): Full Paywall Screen (Unlimited Pro, Annual/Monthly Toggle, Free Trial CTA)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const WORKSPACE_DIR = path.join(__dirname, '..');
const FRAMES_DIR = path.join(__dirname, '..', '.temp_overview_frames');
const OUTPUT_VIDEO = path.join(WORKSPACE_DIR, 'walkthrough_overview_30s.mp4');
const PORT = 8098;

if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
} else {
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

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
  console.log('🎬 Starting Fast 30-Second PoquitoTalk Overview Video...');

  console.log('📦 Bundling app for web recording (`npx expo export -p web`)...');
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
  await page.setViewport({
    width: 480,
    height: 960,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  console.log('📱 Loading app directly onto the First Screen (Home)...');
  await page.goto(`http://localhost:${PORT}/?splash=false&onboarding=false`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Inject device styling and virtual touch pointer (hidden by default offscreen)
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
        font-family: -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
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
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(160, 74, 38, 0.55);
        border: 2px solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
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
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(160, 74, 38, 0.55) 0%, rgba(160, 74, 38, 0) 70%);
        pointer-events: none;
        z-index: 999998;
        transform: translate(-50%, -50%) scale(0.2);
        animation: touchRippleAnim 0.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
      }
      @keyframes touchRippleAnim {
        0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    const pointer = document.createElement('div');
    pointer.id = 'virtual-touch-pointer';
    pointer.style.left = '240px';
    pointer.style.top = '1200px'; // Parked off-screen
    document.body.appendChild(pointer);
  });

  // CDP Screencast Setup (Constant 30 FPS Stream)
  const client = await page.target().createCDPSession();
  let frameCount = 0;
  let lastFrameData = null;

  client.on('Page.screencastFrame', async (event) => {
    lastFrameData = event.data;
    frameCount++;
    const framePath = path.join(FRAMES_DIR, `frame_${String(frameCount).padStart(5, '0')}.jpg`);
    fs.writeFileSync(framePath, Buffer.from(event.data, 'base64'));
    try {
      await client.send('Page.screencastFrameAck', { sessionId: event.sessionId });
    } catch (e) {}
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 95,
    everyNthFrame: 1,
  });

  function recordStaticFrames(durationMs) {
    const count = Math.max(1, Math.round((durationMs / 1000) * 30));
    for (let i = 0; i < count; i++) {
      if (lastFrameData) {
        frameCount++;
        const framePath = path.join(FRAMES_DIR, `frame_${String(frameCount).padStart(5, '0')}.jpg`);
        fs.writeFileSync(framePath, Buffer.from(lastFrameData, 'base64'));
      }
    }
  }

  async function tapCoordinates(x, y) {
    await page.evaluate((posX, posY) => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) {
        p.style.left = `${posX}px`;
        p.style.top = `${posY}px`;
        p.classList.add('visible', 'tapping');

        const ripple = document.createElement('div');
        ripple.className = 'touch-ripple-effect';
        ripple.style.left = `${posX}px`;
        ripple.style.top = `${posY}px`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      }
    }, x, y);

    await sleep(150);
    await page.mouse.click(x, y);

    await page.evaluate(() => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) {
        p.classList.remove('tapping');
        p.classList.remove('visible');
        p.style.top = '1200px'; // Park offscreen
      }
    });
    await sleep(150);
  }

  async function tapByText(text) {
    const pos = await page.evaluate((queryText) => {
      const all = Array.from(document.querySelectorAll('div, span, p, a, button, [role="button"]'));
      const matching = all.filter(el => {
        const txt = (el.innerText || el.textContent || '').trim();
        const rect = el.getBoundingClientRect();
        const isVis = rect.width > 10 && rect.height > 10 && rect.top >= 0 && rect.top <= window.innerHeight;
        return isVis && (txt === queryText || (txt.includes(queryText) && txt.length <= queryText.length + 20));
      });
      if (matching.length === 0) return null;
      matching.sort((a, b) => (a.offsetWidth * a.offsetHeight) - (b.offsetWidth * b.offsetHeight));
      const rect = matching[0].getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, text);

    if (pos) {
      await tapCoordinates(pos.x, pos.y);
      return true;
    }
    return false;
  }

  // =========================================================================
  // SCENE 1 (0:00 - 0:06): FIRST SCREEN - HOME SCREEN & INSTANT TRANSLATION
  // =========================================================================
  console.log('🏠 SCENE 1: First Screen (Home) - Poquito Mascot & Translation Input...');
  recordStaticFrames(1500); // 1.5s admiring first screen

  // Type essential phrase into input
  console.log('✍️ Typing island phrase...');
  await page.evaluate(() => {
    const input = document.querySelector('textarea, input[type="text"]');
    if (input) {
      input.focus();
      input.value = 'Can you pick me up at 3pm?';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  recordStaticFrames(1200);

  // Tap Translate Button
  console.log('🦜 Tapping Translate...');
  await tapByText('Translate') || await tapByText('Traducir');
  recordStaticFrames(2500); // 2.5s showing translated result & soundwaves

  // =========================================================================
  // SCENE 2 (0:06 - 0:12): BOCAS ISLAND DIRECTORY
  // =========================================================================
  console.log('📖 SCENE 2: Bocas Directory Screen...');
  await tapByText('Directory') || await tapByText('Directorio');
  recordStaticFrames(1500);

  // Scroll down contractor cards smoothly
  console.log('📜 Scrolling Directory...');
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => window.scrollBy({ top: 80, behavior: 'smooth' }));
    recordStaticFrames(700);
  }

  // =========================================================================
  // SCENE 3 (0:12 - 0:17): ISLAND PRESETS & TEMPLATES
  // =========================================================================
  console.log('⚡ SCENE 3: Presets & Templates Screen...');
  await tapByText('Templates') || await tapByText('Presets') || await tapByText('Frases');
  recordStaticFrames(1800);

  // Tap Water Taxis preset
  await tapByText('Water Taxis') || await tapByText('Boat') || await tapByText('Lanchas');
  recordStaticFrames(2500);

  // =========================================================================
  // SCENE 4 (0:17 - 0:22): 2-WAY WALKIE-TALKIE FEATURE
  // =========================================================================
  console.log('📻 SCENE 4: 2-Way Walkie-Talkie...');
  await tapByText('Translate') || await tapByText('Home');
  recordStaticFrames(1000);

  // Open Walkie Talkie card
  await tapByText('2-Way Walkie') || await tapByText('Walkie-Talkie') || await tapByText('Live Walkie');
  recordStaticFrames(3000);

  // =========================================================================
  // SCENE 5 (0:22 - 0:30): THE FULL PAYWALL SCREEN
  // =========================================================================
  console.log('💎 SCENE 5: Opening and Exploring the Paywall Screen...');
  
  // Close walkie modal if open
  await tapByText('✕') || await tapByText('Close');
  recordStaticFrames(500);

  // Trigger PaywallModal directly in the React state
  await page.evaluate(() => {
    // Look for PRO badge or trigger settings/paywall
    const btns = Array.from(document.querySelectorAll('div, span, button, [role="button"]'));
    const proBtn = btns.find(b => (b.innerText || '').includes('PRO') || (b.innerText || '').includes('Get Pro'));
    if (proBtn) {
      proBtn.click();
    }
  });
  recordStaticFrames(2000); // Admire Paywall header and emerald badge

  // Toggle Annual vs Monthly Tiers
  console.log('👉 Toggling Monthly / Annual Tiers...');
  await tapByText('Monthly') || await tapByText('$4.99');
  recordStaticFrames(1800);

  await tapByText('Annual Pass') || await tapByText('Best Value') || await tapByText('$39.99');
  recordStaticFrames(2000);

  // Highlight Start Free Trial CTA button
  console.log('👉 Tapping Free Trial button...');
  await tapByText('Start 7-Day Free Trial') || await tapByText('Continue with') || await tapByText('Subscribe');
  recordStaticFrames(2200);

  // Stop screencast
  console.log(`⏹️ Captured total ${frameCount} frames (${(frameCount / 30).toFixed(1)}s runtime)`);
  await client.send('Page.stopScreencast');
  await browser.close();
  server.close();

  // Encode clean MP4 with FFmpeg
  console.log('🎬 Encoding crisp 30s overview MP4 with FFmpeg...');
  const ffmpegCmd = `ffmpeg -y -framerate 30 -i "${FRAMES_DIR}/frame_%05d.jpg" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" "${OUTPUT_VIDEO}"`;

  execSync(ffmpegCmd, { stdio: 'inherit' });
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });

  console.log(`✅ Clean 30-Second Walkthrough Video created: ${OUTPUT_VIDEO}`);
}

main().catch((err) => {
  console.error('❌ Overview video recording failed:', err);
  process.exit(1);
});

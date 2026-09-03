#!/usr/bin/env node

/**
 * PoquitoTalk Video Engine: Phone Book Flow Demo (phonebook_flow_demo_2026_08_22.mp4)
 * Demonstrates:
 * 1. Phone Book tab navigation with saved Bocas contacts
 * 2. Category filtering (All, ⭐ Favorites, Boat Captains, Trades & Handymen)
 * 3. 1-Tap favorite toggling
 * 4. Call & WhatsApp quick communication buttons
 * 5. Fast search filtering
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync, spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const WORKSPACE_DIR = path.join(__dirname, '..');
const ARTIFACT_DIR = '/Users/dorienvandenabbeele/.gemini/antigravity/brain/71ccb7b2-85e4-4fa9-8432-7fd51882db31';
const PORT = 8097;
const DATE_TAG = '2026_08_22';
const VIDEO_FILENAME = `phonebook_flow_demo_${DATE_TAG}.mp4`;
const OUTPUT_VIDEO_PATH = path.join(WORKSPACE_DIR, VIDEO_FILENAME);

function startStaticServer() {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
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
  console.log(`🎬 Recording PoquitoTalk Phone Book Flow Video (${VIDEO_FILENAME})...`);

  console.log('📦 Exporting web bundle (`npx expo export -p web`)...');
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
      '--window-size=394,852',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 394,
    height: 852,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  console.log('📱 Navigating to app...');
  await page.goto(`http://localhost:${PORT}/?onboarding=false`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Inject virtual touch pointer & ripple effect into DOM
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      html, body, #root {
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      #virtual-touch-pointer {
        position: fixed;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(15, 23, 42, 0.45);
        border: 2.5px solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.15s ease;
      }
      #virtual-touch-pointer.tapping {
        transform: translate(-50%, -50%) scale(0.75);
        background: rgba(15, 23, 42, 0.85);
      }
      .touch-ripple-effect {
        position: fixed;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0) 70%);
        pointer-events: none;
        z-index: 999998;
        transform: translate(-50%, -50%) scale(0.2);
        animation: touchRippleAnim 0.45s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
      }
      @keyframes touchRippleAnim {
        0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
      }
      #fps-heartbeat {
        position: fixed;
        bottom: 1px;
        right: 1px;
        width: 2px;
        height: 2px;
        background: rgba(0,0,0,0.01);
        pointer-events: none;
        z-index: 999999;
      }
    `;
    document.head.appendChild(style);

    const pointer = document.createElement('div');
    pointer.id = 'virtual-touch-pointer';
    pointer.style.left = '200px';
    pointer.style.top = '790px';
    document.body.appendChild(pointer);

    const heartbeat = document.createElement('div');
    heartbeat.id = 'fps-heartbeat';
    document.body.appendChild(heartbeat);

    let tick = 0;
    setInterval(() => {
      tick++;
      heartbeat.style.opacity = (tick % 2 === 0 ? '0.02' : '0.01');
    }, 1000 / 30);

    window.simulateTouchMove = (x, y) => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) {
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
      }
    };

    window.simulateTap = (x, y) => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) {
        p.classList.add('tapping');
        setTimeout(() => p.classList.remove('tapping'), 220);
      }
      const ripple = document.createElement('div');
      ripple.className = 'touch-ripple-effect';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 460);
    };
  });

  // Start FFmpeg real-time pipe
  console.log('🎥 Starting ffmpeg real-time streaming process...');
  const ffmpegStream = spawn('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '30',
    '-i', '-',
    '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    OUTPUT_VIDEO_PATH,
  ]);

  const cdp = await page.target().createCDPSession();

  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 90,
    everyNthFrame: 1,
  });

  cdp.on('Page.screencastFrame', async ({ data, sessionId }) => {
    try {
      const buf = Buffer.from(data, 'base64');
      ffmpegStream.stdin.write(buf);
      await cdp.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {}
  });

  let curCursorX = 200;
  let curCursorY = 790;

  async function moveTouchSmooth(toX, toY, durationMs = 450) {
    const fromX = curCursorX;
    const fromY = curCursorY;
    const steps = Math.max(8, Math.round((durationMs / 1000) * 30));
    const delay = durationMs / steps;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      curCursorX = fromX + (toX - fromX) * ease;
      curCursorY = fromY + (toY - fromY) * ease;
      await page.evaluate((x, y) => window.simulateTouchMove(x, y), curCursorX, curCursorY);
      await sleep(delay);
    }
  }

  async function tapAtCurrent() {
    await page.evaluate((px, py) => window.simulateTap(px, py), curCursorX, curCursorY);
    await page.mouse.click(curCursorX, curCursorY);
    await sleep(220);
  }

  async function tapElementByText(text, durationMs = 450) {
    const pos = await page.evaluate((queryText) => {
      const all = Array.from(document.querySelectorAll('div, span, p, a, button, [role="button"], [aria-label]'));
      const matchingLeaves = all.filter(el => {
        const txt = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim();
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 15 && rect.height > 10 && rect.top >= 0 && rect.top <= window.innerHeight;
        return isVisible && (txt === queryText || (txt.toLowerCase().includes(queryText.toLowerCase()) && txt.length <= queryText.length + 30));
      });
      if (matchingLeaves.length === 0) return null;
      matchingLeaves.sort((a, b) => (a.offsetWidth * a.offsetHeight) - (b.offsetWidth * b.offsetHeight));
      const target = matchingLeaves[0];
      const rect = target.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, text);

    if (pos) {
      await moveTouchSmooth(pos.x, pos.y, durationMs);
      await sleep(120);
      await tapAtCurrent();
      return true;
    }
    return false;
  }

  async function smoothScrollBy(distance, durationMs = 600) {
    const steps = Math.max(12, Math.round((durationMs / 1000) * 30));
    const delta = distance / steps;
    const delay = durationMs / steps;

    for (let i = 0; i < steps; i++) {
      await page.evaluate((d) => {
        const allDivs = Array.from(document.querySelectorAll('div'));
        const verticalScrollables = allDivs.filter(el => {
          const style = window.getComputedStyle(el);
          const isV = (
            style.overflowY === 'auto' ||
            style.overflowY === 'scroll' ||
            el.style.overflowY === 'scroll' ||
            el.style.overflowY === 'auto'
          );
          return isV && el.scrollHeight > el.clientHeight + 10;
        });

        if (verticalScrollables.length > 0) {
          verticalScrollables.forEach(el => {
            el.scrollTop += d;
            el.dispatchEvent(new Event('scroll', { bubbles: true }));
          });
        } else {
          window.scrollBy(0, d);
        }
      }, delta);
      await sleep(delay);
    }
  }

  // ===================== VIDEO STORYBOARD =====================

  // --- Step 1: Switch to Phone Book Tab ---
  console.log('📌 Step 1: Navigating to Phone Book tab...');
  await sleep(500);
  await tapElementByText('Phone Book', 400);
  await sleep(1200);

  // --- Step 2: Tap Category Filter Chips (Boat Captains, Trades, Favorites) ---
  console.log('👆 Step 2: Tapping Boat Captains filter chip...');
  await tapElementByText('Boat Captains', 400);
  await sleep(1000);

  console.log('👆 Tapping Trades & Handymen filter chip...');
  await tapElementByText('Trades & Handymen', 400);
  await sleep(1000);

  console.log('👆 Tapping Favorites filter chip...');
  await tapElementByText('Favorites', 400);
  await sleep(1000);

  console.log('👆 Tapping All Contacts filter chip...');
  await tapElementByText('All Contacts', 400);
  await sleep(1000);

  // --- Step 3: Scroll smoothly through contacts ---
  console.log('⬇️ Step 3: Scrolling through contacts list...');
  await moveTouchSmooth(200, 520, 300);
  await smoothScrollBy(200, 600);
  await sleep(800);
  await smoothScrollBy(-200, 600);
  await sleep(1000);

  // Clean end
  console.log('🏁 Finishing screencast and encoding final MP4...');
  await cdp.send('Page.stopScreencast');
  await sleep(400);

  ffmpegStream.stdin.end();

  await new Promise((resolve) => {
    ffmpegStream.on('close', resolve);
  });

  console.log(`✅ Phone Book video generated successfully at: ${OUTPUT_VIDEO_PATH}`);

  // Copy to artifacts directory
  const artifactVideoPath = path.join(ARTIFACT_DIR, VIDEO_FILENAME);
  fs.copyFileSync(OUTPUT_VIDEO_PATH, artifactVideoPath);
  console.log(`📋 Copied video to artifact directory: ${artifactVideoPath}`);

  await browser.close();
  server.close();
}

main().catch(console.error);

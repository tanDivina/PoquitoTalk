#!/usr/bin/env node

/**
 * PoquitoTalk Video Engine: Directory Interaction Showcase
 * Demonstrates:
 * 1. Stacked decks overview
 * 2. Opening Island Vets & Animal Care deck
 * 3. Horizontal swiping across provider cards to inspect details without interference
 * 4. Intentional vertical scrolling to next category
 * 5. Category chip selection for dedicated view
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync, spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const WORKSPACE_DIR = path.join(__dirname, '..');
const PORT = 8098;
const DATE_TAG = '2026_08_22';
const VIDEO_FILENAME = `directory_flow_demo_${DATE_TAG}.mp4`;
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
  console.log(`🎬 Recording PoquitoTalk Directory Flow Video (${VIDEO_FILENAME})...`);

  console.log('📦 Re-exporting web bundle (`npx expo export -p web`)...');
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

  console.log('📱 Navigating to Directory Screen...');
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
    pointer.style.left = '200px';
    pointer.style.top = '450px';
    document.body.appendChild(pointer);

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
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.classList.add('tapping');
        setTimeout(() => p.classList.remove('tapping'), 220);
      }
      const ripple = document.createElement('div');
      ripple.className = 'touch-ripple-effect';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
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

  let curCursorX = 200;
  let curCursorY = 790;

  async function moveTouchSmooth(toX, toY, durationMs = 500) {
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
    await sleep(250);
  }

  async function tapElementByText(text, durationMs = 500) {
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
      await sleep(150);
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

  async function smoothSwipeToCard(targetCardIndex, y = 430, durationMs = 600) {
    const cardStep = 332; // 320 card width + 12 gap
    const targetScrollLeft = targetCardIndex * cardStep;

    const currentScrollLeft = await page.evaluate(() => {
      const allDivs = Array.from(document.querySelectorAll('div'));
      const h = allDivs.find(el => {
        const style = window.getComputedStyle(el);
        return (style.overflowX === 'auto' || style.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 10;
      });
      return h ? h.scrollLeft : 0;
    });

    const isForward = targetScrollLeft > currentScrollLeft;
    const startX = isForward ? 310 : 80;
    const endX = isForward ? 70 : 320;

    await moveTouchSmooth(startX, y, 250);
    await sleep(100);

    const steps = Math.max(16, Math.round((durationMs / 1000) * 30));
    const delay = durationMs / steps;

    await page.evaluate(() => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) p.classList.add('tapping');
    });

    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentX = startX + (endX - startX) * ease;
      const curScroll = currentScrollLeft + (targetScrollLeft - currentScrollLeft) * ease;

      await page.evaluate(({ px, py, sLeft }) => {
        const p = document.getElementById('virtual-touch-pointer');
        if (p) {
          p.style.left = `${px}px`;
          p.style.top = `${py}px`;
        }

        const allDivs = Array.from(document.querySelectorAll('div'));
        const horizontalContainers = allDivs.filter(el => {
          const style = window.getComputedStyle(el);
          return (style.overflowX === 'auto' || style.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 10;
        });

        horizontalContainers.forEach(el => {
          el.scrollLeft = sLeft;
          el.dispatchEvent(new Event('scroll', { bubbles: true }));
        });
      }, { px: currentX, py: y, sLeft: curScroll });

      curCursorX = currentX;
      await sleep(delay);
    }

    // Dock squarely at target snap position
    await page.evaluate((target) => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) p.classList.remove('tapping');

      const allDivs = Array.from(document.querySelectorAll('div'));
      const horizontalContainers = allDivs.filter(el => {
        const style = window.getComputedStyle(el);
        return (style.overflowX === 'auto' || style.overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 10;
      });

      horizontalContainers.forEach(el => {
        el.scrollLeft = target;
        el.dispatchEvent(new Event('scroll', { bubbles: true }));
      });
    }, targetScrollLeft);

    await sleep(200);
  }

  // --- Step 1: Switch to Directory Tab ---
  console.log('📌 Navigating to Directory bottom tab (showing resting Fanned Accordion Stack of all 11 categories)...');
  await sleep(600);
  await tapElementByText('Directory', 450);
  await sleep(1500);

  // --- Step 2: 1-Tap on Boat Captains in the Fanned Stack to Expand it in place ---
  console.log('👆 Tapping Boat Captains in fanned stack to unfold carousel in place...');
  await tapElementByText('Boat Captains & Water Taxis', 450);
  await sleep(1400);

  // --- Step 3: Calibrated Snapping Horizontal Swipes on Expanded Deck ---
  console.log('👉 Swiping cleanly to Boat Captain 2...');
  await smoothSwipeToCard(1, 460, 650);
  await sleep(1400);

  console.log('👈 Swiping back cleanly to Boat Captain 1...');
  await smoothSwipeToCard(0, 460, 650);
  await sleep(1200);

  // --- Step 4: Scroll down into continuous feed ---
  console.log('⬇️ Scrolling down into continuous feed (verifying smooth unfolding)...');
  await moveTouchSmooth(200, 560, 300);
  await smoothScrollBy(320, 700);
  await sleep(1200);
  await smoothScrollBy(320, 700);
  await sleep(1200);
  await smoothScrollBy(320, 700);
  await sleep(1400);

  // --- Step 5: Scroll back to the top to see Accordion Deck fold back into resting fanned stack ---
  console.log('⬆️ Scrolling back to top (Accordion Deck re-folds into resting fanned stack)...');
  await smoothScrollBy(-960, 900);
  await sleep(1500);

  // --- Step 6: Tap Gardening & Living Soils Card / See All to verify Solarte Soil Works ---
  console.log('🌱 Tapping Gardening & Living Soils card in resting stack...');
  await tapElementByText('Gardening & Living Soils', 450);
  await sleep(1400);

  // Tap See All on Gardening
  console.log('🔍 Tapping See All on Gardening category to view verified list...');
  await tapElementByText('See All (3)', 450);
  await sleep(1400);

  // Smooth scroll through dedicated view
  console.log('⬇️ Scrolling through Gardening category (showing Solarte Soil Works)...');
  await smoothScrollBy(180, 500);
  await sleep(1200);
  await smoothScrollBy(-180, 500);
  await sleep(1200);

  // Return to All Services
  console.log('🔄 Tapping View All button (returning to resting fanned accordion feed)...');
  await tapElementByText('View All', 500);
  await sleep(1500);

  // Clean end
  console.log('🏁 Finishing screencast and encoding final MP4...');
  await cdp.send('Page.stopScreencast');
  await sleep(500);

  ffmpegStream.stdin.end();

  await new Promise((resolve) => {
    ffmpegStream.on('close', resolve);
  });

  await browser.close();
  server.close();

  console.log(`✅ Video generated successfully at: ${OUTPUT_VIDEO_PATH}`);

  // Copy to artifacts dir for easy previewing
  const artifactDir = '/Users/dorienvandenabbeele/.gemini/antigravity/brain/71ccb7b2-85e4-4fa9-8432-7fd51882db31';
  const artifactVideoPath = path.join(artifactDir, VIDEO_FILENAME);
  fs.copyFileSync(OUTPUT_VIDEO_PATH, artifactVideoPath);
  console.log(`📋 Copied video to artifact directory: ${artifactVideoPath}`);
}

main().catch((err) => {
  console.error('❌ Error recording demo video:', err);
  process.exit(1);
});

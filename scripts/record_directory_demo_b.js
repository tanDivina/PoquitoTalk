#!/usr/bin/env node

/**
 * PoquitoTalk Video Engine: Directory Interaction Showcase (Version B)
 * Demonstrates:
 * 1. Initial 100% visible resting fanned accordion stack (11 categories)
 * 2. 1-tap open of Boat Captains card in place
 * 3. Isolated horizontal swiping across provider cards (top filter bar remains completely solid)
 * 4. Dedicated horizontal swiping across top category filter bar
 * 5. 1-tap category selection from top filter bar (opens that category card)
 * 6. Continuous vertical feed scrolling and smooth re-folding to resting stack
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
const PORT = 8099;
const DATE_TAG = '2026_08_22_b';
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
  console.log(`🎬 Recording PoquitoTalk Directory Flow Video Version B (${VIDEO_FILENAME})...`);

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

  // Horizontal Swipe ONLY on Provider Cards (Y > 250) — Top Bar Remains 100% Solid & Static
  async function smoothSwipeProviderCards(targetCardIndex, y = 520, durationMs = 650) {
    const cardStep = 332; // 320 card width + 12 gap
    const targetScrollLeft = targetCardIndex * cardStep;

    const currentScrollLeft = await page.evaluate(() => {
      const allDivs = Array.from(document.querySelectorAll('div'));
      const carousel = allDivs.find(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
               el.scrollWidth > el.clientWidth + 10 &&
               rect.top > 250;
      });
      return carousel ? carousel.scrollLeft : 0;
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
        const carousels = allDivs.filter(el => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
                 el.scrollWidth > el.clientWidth + 10 &&
                 rect.top > 250;
        });

        carousels.forEach(el => {
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
      const carousels = allDivs.filter(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
               el.scrollWidth > el.clientWidth + 10 &&
               rect.top > 250;
      });

      carousels.forEach(el => {
        el.scrollLeft = target;
        el.dispatchEvent(new Event('scroll', { bubbles: true }));
      });
    }, targetScrollLeft);

    await sleep(200);
  }

  // Horizontal Swipe ONLY on Top Filter Bar (Y < 250)
  async function smoothSwipeTopFilterBar(targetScrollX, durationMs = 600) {
    const y = 190;
    const currentScrollLeft = await page.evaluate(() => {
      const allDivs = Array.from(document.querySelectorAll('div'));
      const bar = allDivs.find(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
               el.scrollWidth > el.clientWidth + 10 &&
               rect.top < 250;
      });
      return bar ? bar.scrollLeft : 0;
    });

    const isForward = targetScrollX > currentScrollLeft;
    const startX = isForward ? 320 : 80;
    const endX = isForward ? 80 : 320;

    await moveTouchSmooth(startX, y, 300);
    await sleep(100);

    const steps = Math.max(16, Math.round((durationMs / 1000) * 30));
    const delay = durationMs / steps;

    await page.evaluate(() => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) p.classList.add('tapping');
    });

    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentX = startX + (endX - startX) * ease;
      const curScroll = currentScrollLeft + (targetScrollX - currentScrollLeft) * ease;

      await page.evaluate(({ px, py, sLeft }) => {
        const p = document.getElementById('virtual-touch-pointer');
        if (p) {
          p.style.left = `${px}px`;
          p.style.top = `${py}px`;
        }

        const allDivs = Array.from(document.querySelectorAll('div'));
        const bars = allDivs.filter(el => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
                 el.scrollWidth > el.clientWidth + 10 &&
                 rect.top < 250;
        });

        bars.forEach(el => {
          el.scrollLeft = sLeft;
          el.dispatchEvent(new Event('scroll', { bubbles: true }));
        });
      }, { px: currentX, py: y, sLeft: curScroll });

      curCursorX = currentX;
      await sleep(delay);
    }

    await page.evaluate((target) => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) p.classList.remove('tapping');

      const allDivs = Array.from(document.querySelectorAll('div'));
      const bars = allDivs.filter(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
               el.scrollWidth > el.clientWidth + 10 &&
               rect.top < 250;
      });

      bars.forEach(el => {
        el.scrollLeft = target;
        el.dispatchEvent(new Event('scroll', { bubbles: true }));
      });
    }, targetScrollX);

    await sleep(200);
  }

  // ===================== VIDEO STORYBOARD =====================

  // --- Step 1: Switch to Directory Tab ---
  console.log('📌 Step 1: Navigating to Directory bottom tab (showing resting Fanned Accordion Stack of all 11 categories)...');
  await sleep(600);
  await tapElementByText('Directory', 450);
  await sleep(1500);

  // --- Step 2: 1-Tap on Boat Captains in the Fanned Stack to Expand it in place ---
  console.log('👆 Step 2: Tapping Boat Captains in fanned stack to unfold carousel in place...');
  await tapElementByText('Boat Captains & Water Taxis', 450);
  await sleep(1400);

  // --- Step 3: Isolated Horizontal Swiping on Provider Cards (Top Bar Remains Solid) ---
  console.log('👉 Step 3: Swiping cleanly across Boat Captain cards (top bar is completely solid)...');
  await smoothSwipeProviderCards(1, 520, 650);
  await sleep(1400);

  console.log('👈 Swiping back to Boat Captain 1...');
  await smoothSwipeProviderCards(0, 520, 650);
  await sleep(1200);

  // --- Step 4: Swipe Horizontally through Top Category Filter Bar ---
  console.log('👉 Step 4: Swiping across top category filter bar...');
  await smoothSwipeTopFilterBar(300, 650);
  await sleep(1000);
  await smoothSwipeTopFilterBar(520, 650);
  await sleep(1200);

  // --- Step 5: Tap a Category Chip from Top Bar to Open that Card ---
  console.log('👆 Step 5: Tapping Gardening & Plants category chip in top bar...');
  await tapElementByText('Gardening & Plants', 450);
  await sleep(1500);

  // --- Step 6: Inspect Gardening Card & Solarte Soil Works ---
  console.log('🔍 Step 6: Inspecting Gardening & Living Soils (Solarte Soil Works)...');
  await smoothScrollBy(120, 500);
  await sleep(1200);
  await smoothScrollBy(-120, 500);
  await sleep(1200);

  // --- Step 7: Tap All Services Chip in Top Bar to Return to Resting Fanned Stack ---
  console.log('🔄 Step 7: Swiping filter bar back and tapping All Services chip...');
  await smoothSwipeTopFilterBar(0, 550);
  await sleep(800);
  await tapElementByText('All Services', 450);
  await sleep(1500);

  // --- Step 8: Scroll down into continuous feed and scroll back to top ---
  console.log('⬇️ Step 8: Scrolling down into continuous feed...');
  await moveTouchSmooth(200, 560, 300);
  await smoothScrollBy(320, 700);
  await sleep(1200);
  await smoothScrollBy(320, 700);
  await sleep(1200);

  console.log('⬆️ Scrolling back to top (Accordion Deck re-folds into resting fanned stack)...');
  await smoothScrollBy(-640, 800);
  await sleep(1600);

  // Clean end
  console.log('🏁 Finishing screencast and encoding final MP4 Version B...');
  await cdp.send('Page.stopScreencast');
  await sleep(500);

  ffmpegStream.stdin.end();

  await new Promise((resolve) => {
    ffmpegStream.on('close', resolve);
  });

  console.log(`✅ Video Version B generated successfully at: ${OUTPUT_VIDEO_PATH}`);

  // Copy to artifacts directory
  const artifactVideoPath = path.join(ARTIFACT_DIR, VIDEO_FILENAME);
  fs.copyFileSync(OUTPUT_VIDEO_PATH, artifactVideoPath);
  console.log(`📋 Copied video to artifact directory: ${artifactVideoPath}`);

  await browser.close();
  server.close();
}

main().catch(console.error);

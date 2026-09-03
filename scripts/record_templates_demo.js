#!/usr/bin/env node

/**
 * PoquitoTalk Video Engine: Templates Flow Demo (templates_flow_demo_2026_08_22.mp4)
 * Perfected with:
 * 1. Initial 100% resting fanned accordion deck
 * 2. Slow, smooth vertical scroll demonstrating calibrated auto-expansion in sequence
 * 3. Smooth return scroll re-folding deck back to top resting stack
 * 4. 1-Tap card unfold (e.g. Restaurants & Dining)
 * 5. Slow, smooth horizontal scenario swiping (Scenario 1 -> Scenario 2 -> Scenario 3)
 * 6. Speaker audio playback tap demonstration
 * 7. 1-Tap card collapse
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
const PORT = 8096;
const DATE_TAG = '2026_08_22';
const VIDEO_FILENAME = `templates_flow_demo_${DATE_TAG}.mp4`;
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
  console.log(`🎬 Recording PoquitoTalk Templates Flow Video (${VIDEO_FILENAME})...`);

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

  let frameCount = 0;
  let audioCueFrame = null;
  const tempRawVideo = path.join(WORKSPACE_DIR, 'temp_raw_templates.mp4');

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
    tempRawVideo,
  ]);

  const cdp = await page.target().createCDPSession();

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
    const steps = Math.max(10, Math.round((durationMs / 1000) * 30));
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
        return isVisible && (txt === queryText || (txt.toLowerCase().includes(queryText.toLowerCase()) && txt.length <= queryText.length + 35));
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
    console.warn(`⚠️ Could not find element with text: "${text}"`);
    return false;
  }

  async function smoothScrollBy(distance, durationMs = 900) {
    const steps = Math.max(16, Math.round((durationMs / 1000) * 30));
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

  // Horizontal Swipe inside Scenario Carousel with visible finger drag
  async function smoothSwipeScenarioCards(targetIndex, durationMs = 1200) {
    const cardStep = 332;
    const targetScrollLeft = targetIndex * cardStep;

    const currentScrollLeft = await page.evaluate(() => {
      const allDivs = Array.from(document.querySelectorAll('div'));
      const carousel = allDivs.find(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
               el.scrollWidth > el.clientWidth + 10 &&
               rect.top > 200 && rect.top < 650;
      });
      return carousel ? carousel.scrollLeft : 0;
    });

    const isForward = targetScrollLeft > currentScrollLeft;
    const y = 490;
    const startX = isForward ? 330 : 65;
    const endX = isForward ? 65 : 330;

    // Move touch pointer to drag start position
    await moveTouchSmooth(startX, y, 400);
    await sleep(200);

    // Finger down (press)
    await page.evaluate(() => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) p.classList.add('tapping');
    });
    await sleep(100);

    const steps = Math.max(25, Math.round((durationMs / 1000) * 30));
    const delay = durationMs / steps;

    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      // Smooth sinusoidal ease in-out
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
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
                 rect.top > 200 && rect.top < 650;
        });

        carousels.forEach(el => {
          el.scrollLeft = sLeft;
          el.dispatchEvent(new Event('scroll', { bubbles: true }));
        });
      }, { px: currentX, py: y, sLeft: curScroll });

      curCursorX = currentX;
      await sleep(delay);
    }

    // Finger release
    await page.evaluate((target) => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) p.classList.remove('tapping');

      const allDivs = Array.from(document.querySelectorAll('div'));
      const carousels = allDivs.filter(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
               el.scrollWidth > el.clientWidth + 10 &&
               rect.top > 200 && rect.top < 650;
      });

      carousels.forEach(el => {
        el.scrollLeft = target;
        el.dispatchEvent(new Event('scroll', { bubbles: true }));
      });
    }, targetScrollLeft);

    await sleep(400);
  }

  // Explicitly expand a category card by title and verify DOM state
  async function expandCategoryCard(cardTitle, durationMs = 600) {
    console.log(`🔍 Locating card header for "${cardTitle}"...`);

    const headerPos = await page.evaluate((title) => {
      const allDivs = Array.from(document.querySelectorAll('div, [role="button"], span'));
      const header = allDivs.find(el => {
        const text = (el.innerText || el.textContent || '').trim();
        const rect = el.getBoundingClientRect();
        return text.includes(title) &&
               rect.width > 200 && rect.height > 30 && rect.height < 100 &&
               rect.top >= 150 && rect.top <= window.innerHeight;
      });

      if (!header) return null;
      const rect = header.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, cardTitle);

    if (headerPos) {
      await moveTouchSmooth(headerPos.x, headerPos.y, durationMs);
      await sleep(150);
      await tapAtCurrent();
    } else {
      console.warn(`⚠️ Header not found via text, attempting fallback coordinate tap...`);
      await moveTouchSmooth(200, 240, durationMs);
      await sleep(150);
      await tapAtCurrent();
    }

    // Ensure DOM state is expanded
    await page.evaluate((title) => {
      const isExpanded = document.body.innerText.includes('Reserve Dinner Table') ||
                         document.body.innerText.includes('Scenarios • Swipe');
      if (!isExpanded) {
        // Find and click the touchable row directly
        const headers = Array.from(document.querySelectorAll('div, [role="button"]')).filter(el =>
          (el.innerText || '').includes(title) && el.getBoundingClientRect().height < 100
        );
        if (headers.length > 0) {
          headers[headers.length - 1].click();
        }
      }
    }, cardTitle);

    await sleep(1200);
  }

  // ===================== VIDEO STORYBOARD =====================

  // --- Step 1: Switch to Templates Tab (Initial Resting Stack) ---
  console.log('📌 Step 1: Switching to Templates tab...');
  await sleep(800);
  await tapElementByText('Templates', 500);
  await sleep(2000); // Allow viewer to see the full resting fanned deck

  // --- Step 2: Very Slow, Smooth Vertical Scroll (Showing Progressive Auto-Expansion) ---
  console.log('⬇️ Step 2: Slow, smooth vertical scroll through deck...');
  await moveTouchSmooth(200, 620, 500);
  await smoothScrollBy(150, 1500);
  await sleep(1000);
  await smoothScrollBy(180, 1500);
  await sleep(1000);
  await smoothScrollBy(180, 1500);
  await sleep(1200);

  // --- Step 3: Slow Smooth Scroll back to top (Re-folds deck to 100% resting fanned stack) ---
  console.log('⬆️ Step 3: Slow scroll back up (re-folding deck to resting stack)...');
  await smoothScrollBy(-510, 2200);
  await sleep(2000); // Verify deck is resting and collapsed

  // --- Step 4: 1-Tap on "Restaurants & Dining" Card Header to Unfold in Place ---
  console.log('👆 Step 4: 1-Tap on Restaurants & Dining to expand in place...');
  await expandCategoryCard('Restaurants & Dining', 600);
  await sleep(1500); // Allow viewer to clearly see the expanded Scenario 1

  // --- Step 5: Smooth, Visible Finger Drag Swipes Across Scenarios ---
  console.log('👉 Step 5: Dragging swipe to Scenario 2 (Vegan / Dietary Options)...');
  await smoothSwipeScenarioCards(1, 1300);
  await sleep(1800); // Allow viewer to read Scenario 2

  console.log('👉 Dragging swipe to Scenario 3 (Menu & Specials)...');
  await smoothSwipeScenarioCards(2, 1300);
  await sleep(1800); // Allow viewer to read Scenario 3

  console.log('👈 Dragging swipe back to Scenario 1 (Reserve Dinner Table)...');
  await smoothSwipeScenarioCards(0, 1400);
  await sleep(1600);

  // --- Step 6: Tap the Audio Speaker icon on Scenario 1 ---
  console.log('🔊 Step 6: Tapping speaker icon to preview pronunciation audio...');
  await moveTouchSmooth(68, 540, 500);
  await sleep(200);
  audioCueFrame = frameCount;
  console.log(`🎵 Audio cue triggered at Frame ${audioCueFrame} (~${(audioCueFrame / 30).toFixed(2)}s)`);
  await tapAtCurrent();
  await sleep(6500); // Allow full 6.27s Spanish pronunciation audio to play

  // --- Step 7: Tap Card Header to Collapse back into resting stack ---
  console.log('👆 Step 7: Collapsing card back into resting stack...');
  await moveTouchSmooth(200, 240, 500);
  await sleep(200);
  await tapAtCurrent();
  await sleep(2200);

  // Clean finish
  console.log('🏁 Finishing screencast and encoding final MP4...');
  await cdp.send('Page.stopScreencast');
  await sleep(500);

  ffmpegStream.stdin.end();

  await new Promise((resolve) => {
    ffmpegStream.on('close', resolve);
  });

  const audioFile = path.join(WORKSPACE_DIR, 'assets', 'audio', 'presets', 'diego_dining_table_reservation.mp3');
  if (audioCueFrame && fs.existsSync(audioFile)) {
    const delayMs = Math.max(0, Math.round((audioCueFrame / 30) * 1000));
    console.log(`🎵 Muxing synchronized audio starting at ${delayMs}ms (Frame ${audioCueFrame})...`);
    const muxCmd = `/opt/homebrew/bin/ffmpeg -y -i "${tempRawVideo}" -i "${audioFile}" -filter_complex "[1:a]adelay=${delayMs}|${delayMs}[aout]" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "${OUTPUT_VIDEO_PATH}"`;
    execSync(muxCmd, { stdio: 'inherit' });
  } else {
    fs.copyFileSync(tempRawVideo, OUTPUT_VIDEO_PATH);
  }

  if (fs.existsSync(tempRawVideo)) {
    try { fs.unlinkSync(tempRawVideo); } catch (e) {}
  }

  console.log(`✅ Templates video with synchronized audio generated successfully at: ${OUTPUT_VIDEO_PATH}`);

  // Copy to artifacts directory
  const artifactVideoPath = path.join(ARTIFACT_DIR, VIDEO_FILENAME);
  fs.copyFileSync(OUTPUT_VIDEO_PATH, artifactVideoPath);
  console.log(`📋 Copied video to artifact directory: ${artifactVideoPath}`);

  await browser.close();
  server.close();
}

main().catch(console.error);

#!/usr/bin/env node

/**
 * PoquitoTalk Frame-Accurate Automated Walkthrough Video Engine with Synchronized Studio Audio
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync, spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');
const AUDIO_DIR = path.join(__dirname, '..', 'assets', 'audio', 'presets');
const WORKSPACE_DIR = path.join(__dirname, '..');
const PORT = 8099;

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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
  console.log('🎬 Starting PoquitoTalk Walkthrough Video Engine (Full 30FPS Frame Lock & Audio Sync)...');

  // Re-export web bundle
  console.log('📦 Bundling React app for web video recording (`npx expo export -p web`)...');
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

  console.log('📱 Loading PoquitoTalk React app...');
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
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(160, 74, 38, 0.55);
        border: 2.5px solid rgba(255, 255, 255, 0.95);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.15s ease;
      }
      #virtual-touch-pointer.tapping {
        transform: translate(-50%, -50%) scale(0.75);
        background: rgba(160, 74, 38, 0.95);
      }
      .touch-ripple-effect {
        position: fixed;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(160, 74, 38, 0.55) 0%, rgba(160, 74, 38, 0) 70%);
        pointer-events: none;
        z-index: 999998;
        transform: translate(-50%, -50%) scale(0.2);
        animation: touchRippleAnim 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
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
      setTimeout(() => ripple.remove(), 550);
    };
  });

  const tempRawVideo = path.join(OUTPUT_DIR, 'raw_temp_screencast.mp4');
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
    tempRawVideo
  ]);

  console.log('🎥 Starting CDP frame recording stream...');
  const cdp = await page.target().createCDPSession();
  let frameCount = 0;
  let lastFrameData = null;
  const audioCues = []; // Stores { frameNumber, file }

  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 85,
    everyNthFrame: 1,
  });

  cdp.on('Page.screencastFrame', async ({ data, sessionId }) => {
    try {
      frameCount++;
      lastFrameData = data;
      const buf = Buffer.from(data, 'base64');
      ffmpegStream.stdin.write(buf);
      await cdp.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {}
  });

  let curCursorX = 200;
  let curCursorY = 450;

  async function moveTouchSmooth(toX, toY, durationMs = 600) {
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
    await sleep(300);
  }

  async function tapElementByText(text, durationMs = 600) {
    const pos = await page.evaluate((queryText) => {
      const all = Array.from(document.querySelectorAll('div, span, p, a, button, [role="button"], [aria-label]'));
      const matchingLeaves = all.filter(el => {
        const txt = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim();
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 15 && rect.height > 10 && rect.top >= 0 && rect.top <= window.innerHeight;
        return isVisible && (txt === queryText || (txt.toLowerCase().includes(queryText.toLowerCase()) && txt.length <= queryText.length + 25));
      });
      if (matchingLeaves.length === 0) return null;
      matchingLeaves.sort((a, b) => (a.offsetWidth * a.offsetHeight) - (b.offsetWidth * b.offsetHeight));
      const target = matchingLeaves[0];
      const rect = target.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }, text);

    if (pos) {
      await moveTouchSmooth(pos.x, pos.y, durationMs);
      await sleep(200);
      await tapAtCurrent();
      return true;
    }
    return false;
  }

  async function smoothScrollBy(distance, durationMs = 700) {
    const steps = Math.max(14, Math.round((durationMs / 1000) * 30));
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

  async function smoothSwipeHorizontal(startX, endX, y, durationMs = 700) {
    await moveTouchSmooth(startX, y, 250);
    await sleep(60);

    const steps = Math.max(16, Math.round((durationMs / 1000) * 30));
    const deltaX = (endX - startX) / steps;
    const scrollDistance = -(endX - startX); // swiping left (startX > endX) -> scrollLeft increases
    const scrollDelta = scrollDistance / steps;
    const delay = durationMs / steps;

    // Show visual touch ring
    await page.evaluate((px, py) => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) p.classList.add('tapping');
    }, startX, y);

    for (let i = 0; i < steps; i++) {
      curCursorX += deltaX;

      await page.evaluate(({ px, py, sDelta }) => {
        const p = document.getElementById('virtual-touch-pointer');
        if (p) {
          p.style.left = `${px}px`;
          p.style.top = `${py}px`;
        }

        // Find horizontal scrollable containers near this Y coordinate
        const allDivs = Array.from(document.querySelectorAll('div'));
        const horizontalContainers = allDivs.filter(el => {
          const style = window.getComputedStyle(el);
          const isH = (
            style.overflowX === 'auto' ||
            style.overflowX === 'scroll' ||
            el.style.overflowX === 'scroll' ||
            el.style.overflowX === 'auto' ||
            el.scrollWidth > el.clientWidth + 10
          );
          const rect = el.getBoundingClientRect();
          const inYRange = (py >= rect.top - 30 && py <= rect.bottom + 30);
          return isH && inYRange && rect.height > 15;
        });

        horizontalContainers.forEach(el => {
          el.scrollLeft += sDelta;
          el.dispatchEvent(new Event('scroll', { bubbles: true }));
        });
      }, { px: curCursorX, py: y, sDelta: scrollDelta });

      await sleep(delay);
    }

    // Touch up
    await page.evaluate(() => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) p.classList.remove('tapping');
    });
    await sleep(150);
  }

  function recordStaticFrames(durationMs) {
    const count = Math.max(1, Math.round((durationMs / 1000) * 30));
    if (lastFrameData) {
      const buf = Buffer.from(lastFrameData, 'base64');
      for (let i = 0; i < count; i++) {
        frameCount++;
        ffmpegStream.stdin.write(buf);
      }
    }
  }

  // --- SCENE 1: Home Translate Screen & Studio Audio Sync ---
  console.log('👉 Scene 1: Exploring Home Translate Screen & Dialect AI...');
  await sleep(1000);
  recordStaticFrames(1200); // 1.2s pause to read top header and quick scenarios

  // Move directly to the "Water Delivery Refill" scenario chip
  console.log('💧 Finding & tapping "Water Delivery Refill" chip...');
  const tappedChip = await tapElementByText('Water Delivery Refill', 500);
  if (!tappedChip) {
    await moveTouchSmooth(115, 650, 500);
    await tapAtCurrent();
  }
  await sleep(800);
  recordStaticFrames(1200);

  // Smooth scroll to bring the translated Spanish card into full focus
  console.log('📜 Scrolling to reveal Spanish output card with exact 1,500 gallon text...');
  await smoothScrollBy(150, 600);
  await sleep(500);
  recordStaticFrames(1200);

  // Tap Audio & Play Diego Voice Note with FRAME-ACCURATE SYNC
  console.log('🔊 Finding & tapping Play Speaker Audio button...');
  const tappedAudio = await tapElementByText('Play Speaker Audio', 500);
  if (!tappedAudio) {
    await moveTouchSmooth(62, 498, 500);
    await tapAtCurrent();
  }

  // Record exact frame index at the instant the button is tapped
  console.log(`🎙️ Recording Audio Cue at Frame #${frameCount} (${(frameCount / 30).toFixed(2)}s in video timeline)...`);
  audioCues.push({
    frameNumber: frameCount,
    file: path.join(AUDIO_DIR, 'diego_water_cistern_truck_lvl2.mp3'),
  });

  // Pause during audio playback (~4.8s)
  console.log('⏳ Listening to Diego Panamanian Spanish audio clip in full (~4.8s)...');
  await sleep(1500);
  recordStaticFrames(4800);

  // Demonstrate Save (Bookmark) action
  console.log('🔖 Demonstrating 1-Tap Save (Bookmark) interaction...');
  const tappedSave = await tapElementByText('Save', 400);
  if (!tappedSave) {
    await moveTouchSmooth(180, 498, 400);
    await tapAtCurrent();
  }
  await sleep(400);
  recordStaticFrames(1000);

  // Scroll back to top
  console.log('📜 Scrolling back to top of Translate screen...');
  await smoothScrollBy(-150, 500);
  await sleep(400);

  // --- SCENE 2: Inbound WhatsApp Voice Note Decoder ---
  console.log('👉 Scene 2: Testing "Decode Voice Note" Super-Tool...');
  const tappedVoiceDecoder = await tapElementByText('Decode Voice Note', 500);
  if (!tappedVoiceDecoder) {
    await moveTouchSmooth(100, 180, 500);
    await tapAtCurrent();
  }
  await sleep(600);
  recordStaticFrames(1800); // 1.8s pause to read audio transcription & 1-tap Spanish reply options

  // Close decoder modal
  console.log('✖️ Closing Voice Note Decoder modal...');
  const closedDecoder = await tapElementByText('Done', 400);
  if (!closedDecoder) {
    await moveTouchSmooth(355, 120, 400);
    await tapAtCurrent();
  }
  await sleep(400);
  recordStaticFrames(600);

  // --- SCENE 3: Document & Utility Bill Scanner ---
  console.log('👉 Scene 3: Testing "Scan Bill or Menu" Super-Tool...');
  const tappedScanner = await tapElementByText('Scan Bill or Menu', 500);
  if (!tappedScanner) {
    await moveTouchSmooth(280, 180, 500);
    await tapAtCurrent();
  }
  await sleep(600);
  recordStaticFrames(1800); // 1.8s pause to inspect Naturgy electricity breakdown

  // Close scanner modal
  console.log('✖️ Closing Document Scanner modal...');
  const closedScanner = await tapElementByText('Done', 400);
  if (!closedScanner) {
    await moveTouchSmooth(355, 120, 400);
    await tapAtCurrent();
  }
  await sleep(400);
  recordStaticFrames(600);

  // --- SCENE 4: Navigate to Presets Tab & Showcase Dynamic Stacked Cards Opening & Horizontal Swiping ---
  console.log('👉 Scene 4: Navigating to Presets Tab & Stacked Cards Deck...');
  // Tap Presets bottom tab icon
  await moveTouchSmooth(197, 795, 500);
  await tapAtCurrent();
  await sleep(700);
  recordStaticFrames(1000); // Initial view on Water Delivery expanded card

  // 1. Horizontal swipe across scenarios inside Water Delivery card (Scenario 1 -> Scenario 2 -> Scenario 3 -> back)
  console.log('👉 Swiping horizontally across Water Delivery scenario deck...');
  await smoothSwipeHorizontal(330, 60, 420, 650);
  recordStaticFrames(800);
  await smoothSwipeHorizontal(330, 60, 420, 650);
  recordStaticFrames(800);
  await smoothSwipeHorizontal(60, 330, 420, 650);
  recordStaticFrames(600);

  // 2. Open Air Conditioning card
  console.log('🃏 Tapping Air Conditioning template card to open and fan out...');
  const tappedAC = await tapElementByText('Air Conditioning', 450);
  if (!tappedAC) {
    await tapElementByText('Air Conditioning & Refrigeration', 450);
  }
  await sleep(400);
  recordStaticFrames(1000);

  // Horizontal swipe on A/C scenarios
  console.log('👉 Swiping horizontally across A/C scenario cards...');
  await smoothSwipeHorizontal(330, 60, 420, 650);
  recordStaticFrames(800);
  await smoothSwipeHorizontal(60, 330, 420, 600);
  recordStaticFrames(600);

  // 3. Open Boat Captains card
  console.log('🃏 Tapping Boat Captains template card to open and fan out...');
  const tappedBoat = await tapElementByText('Boat Captains', 450);
  if (!tappedBoat) {
    await tapElementByText('Boat Captains & Marine Mechanics', 450);
  }
  await sleep(400);
  recordStaticFrames(1000);

  // Horizontal swipe on Boat Captain scenarios
  console.log('👉 Swiping horizontally across Boat Captain scenario cards...');
  await smoothSwipeHorizontal(330, 60, 420, 650);
  recordStaticFrames(800);
  await smoothSwipeHorizontal(60, 330, 420, 600);
  recordStaticFrames(600);

  // 4. Open Power Outages card
  console.log('🃏 Tapping Power Outage template card to open and fan out...');
  const tappedPower = await tapElementByText('Power Outage', 450);
  if (!tappedPower) {
    await tapElementByText('Power Outages & Generators', 450);
  }
  await sleep(400);
  recordStaticFrames(1000);

  // 5. Demonstrate vertical scrolling through the stacked deck
  console.log('📜 Demonstrating vertical scroll through fanned cards deck...');
  await smoothScrollBy(250, 600);
  recordStaticFrames(600);
  await smoothScrollBy(-250, 600);
  recordStaticFrames(600);

  // Tap back on Water Delivery to restore top card
  await tapElementByText('Water Delivery', 400);
  await sleep(300);
  recordStaticFrames(600);

  // --- SCENE 5: Navigate to Providers Directory Tab & Horizontal Swiping ---
  console.log('👉 Scene 5: Navigating to Providers Directory Tab & Horizontal Swiping...');
  // Tap Directory / Providers bottom tab icon
  await moveTouchSmooth(330, 795, 500);
  await tapAtCurrent();
  await sleep(700);
  recordStaticFrames(1000);

  // 1. Showcase horizontal swipe on the pinned top category filter bar
  console.log('👉 Swiping horizontally across top category filters...');
  await smoothSwipeHorizontal(330, 60, 138, 650);
  recordStaticFrames(600);
  await smoothSwipeHorizontal(330, 60, 138, 650);
  recordStaticFrames(600);

  // Swipe filter bar back
  console.log('👉 Swiping category filter bar back to start...');
  await smoothSwipeHorizontal(60, 330, 138, 600);
  recordStaticFrames(600);

  // 2. Open Boat Captains & Water Taxis deck and swipe horizontally through provider cards
  console.log('👉 Swiping horizontally across Boat Captain provider cards...');
  await smoothSwipeHorizontal(330, 60, 390, 650);
  recordStaticFrames(800);
  await smoothSwipeHorizontal(330, 60, 390, 650);
  recordStaticFrames(800);
  await smoothSwipeHorizontal(60, 330, 390, 600);
  recordStaticFrames(600);

  // 3. Tap ATMs & Banks category filter to open ATM deck
  console.log('🏧 Tapping ATMs & Banks category filter...');
  await tapElementByText('ATMs & Banks', 450);
  await sleep(400);
  recordStaticFrames(1000);

  // Swipe across ATM provider cards
  console.log('👉 Swiping horizontally across ATM & banking cards...');
  await smoothSwipeHorizontal(330, 60, 390, 650);
  recordStaticFrames(800);
  await smoothSwipeHorizontal(60, 330, 390, 600);
  recordStaticFrames(600);

  // 4. Tap "All Services" and scroll through directory
  console.log('📜 Scrolling through directory to showcase verified ATMs & services...');
  await tapElementByText('All Services', 400);
  await sleep(300);
  await smoothScrollBy(350, 700);
  recordStaticFrames(800);

  // Scroll back up to top
  await smoothScrollBy(-350, 600);
  recordStaticFrames(600);

  // --- SCENE 6: Header Modals & Saved Translations Note Reuse ---
  console.log('👉 Scene 6: Inspecting Saved Translations Header Modal & 1-Tap Note Reuse...');
  // Tap Bookmark icon in top header
  await moveTouchSmooth(305, 55, 500);
  await tapAtCurrent();
  await sleep(600);
  recordStaticFrames(1400); // 1.4s reading pause for saved items modal

  // Demonstrate 1-tap Copy on the saved note
  console.log('📋 Demonstrating 1-Tap Copy on saved water delivery note...');
  const tappedCopy = await tapElementByText('Copy', 400);
  if (!tappedCopy) {
    await moveTouchSmooth(180, 480, 400);
    await tapAtCurrent();
  }
  await sleep(400);
  recordStaticFrames(1500); // Pause to clearly show "Copied" checkmark feedback

  // Close Saved Translations modal
  console.log('✖️ Closing Saved Translations modal...');
  const closedSaved = await tapElementByText('Close Saved Modal', 400);
  if (!closedSaved) {
    await moveTouchSmooth(355, 120, 400);
    await tapAtCurrent();
  }
  await sleep(400);
  recordStaticFrames(800);

  // --- SCENE 7: Return to Home Translate Screen ---
  console.log('👉 Scene 7: Returning to Translate Home Screen...');
  await moveTouchSmooth(65, 795, 500);
  await tapAtCurrent();
  await sleep(600);
  recordStaticFrames(1500); // Final aesthetic pause

  console.log(`🛑 Stopping screencast. Total frames captured: ${frameCount}`);
  await cdp.send('Page.stopScreencast');
  await sleep(600);

  await browser.close();
  server.close();

  // Close ffmpeg stream and wait for it to exit cleanly
  console.log('⏳ Finalizing raw video stream encoder...');
  await new Promise((resolve) => {
    ffmpegStream.stdin.end();
    ffmpegStream.on('close', resolve);
  });

  const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '_');
  const datedFilename = `walkthrough_demo_${todayStr}.mp4`;
  const versionedFilename = `walkthrough_demo_v1_5_mvp.mp4`;

  const outputVideoPath = path.join(OUTPUT_DIR, datedFilename);
  const rootVideoPath = path.join(WORKSPACE_DIR, datedFilename);
  const rootVersionedPath = path.join(WORKSPACE_DIR, versionedFilename);

  console.log(`⚙️ Muxing final MP4 with frame-accurate audio synchronization (${datedFilename})...`);

  let ffmpegCmd = '';
  if (audioCues.length > 0) {
    let inputArgs = '';
    let filterParts = [];
    let mixInputs = [];

    audioCues.forEach((cue, idx) => {
      const inputIdx = idx + 1;
      inputArgs += ` -i "${cue.file}"`;
      const delayMs = Math.max(0, Math.round((cue.frameNumber / 30) * 1000));
      console.log(`   🎵 Audio Track #${inputIdx}: starting at ${delayMs}ms (Frame ${cue.frameNumber})`);
      filterParts.push(`[${inputIdx}:a]adelay=${delayMs}|${delayMs}[a${inputIdx}]`);
      mixInputs.push(`[a${inputIdx}]`);
    });

    const filterComplex = `${filterParts.join('; ')}; ${mixInputs.join('')}amix=inputs=${audioCues.length}:dropout_transition=0[aout]`;
    ffmpegCmd = `/opt/homebrew/bin/ffmpeg -y -i "${tempRawVideo}"${inputArgs} -filter_complex "${filterComplex}" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "${outputVideoPath}"`;
  } else {
    ffmpegCmd = `/opt/homebrew/bin/ffmpeg -y -i "${tempRawVideo}" -c:v copy -movflags +faststart "${outputVideoPath}"`;
  }

  execSync(ffmpegCmd, { stdio: 'inherit' });
  if (fs.existsSync(tempRawVideo)) {
    fs.unlinkSync(tempRawVideo);
  }

  // Copy date-stamped and versioned files to workspace root and web-funnel
  fs.copyFileSync(outputVideoPath, rootVideoPath);
  fs.copyFileSync(outputVideoPath, rootVersionedPath);

  const webFunnelDatedPath = path.join(WORKSPACE_DIR, 'web-funnel', datedFilename);
  const webFunnelVersionedPath = path.join(WORKSPACE_DIR, 'web-funnel', versionedFilename);
  if (fs.existsSync(path.dirname(webFunnelDatedPath))) {
    fs.copyFileSync(outputVideoPath, webFunnelDatedPath);
    fs.copyFileSync(outputVideoPath, webFunnelVersionedPath);
  }

  console.log(`\n🎉 Frame-Accurate Cinematic Walkthrough Video Successfully Created!`);
  console.log(`   📹 Dated File: ${rootVideoPath}`);
  console.log(`   📹 Versioned File: ${rootVersionedPath}`);
  console.log(`   ⏱️ Total Duration: ~${(frameCount / 30).toFixed(1)}s`);
}

main().catch((err) => {
  console.error('Error generating walkthrough video:', err);
  process.exit(1);
});

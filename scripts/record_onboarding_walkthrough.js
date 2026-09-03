#!/usr/bin/env node

/**
 * Automated High-Fidelity Onboarding Walkthrough Video Engine
 * Captures 30 FPS frame-accurate recording of Steps 1, 2, 3 and transition into the live app.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync, spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');
const WORKSPACE_DIR = path.join(__dirname, '..');
const PORT = 8097;

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
  console.log('🎬 Starting PoquitoTalk Onboarding Walkthrough Engine...');

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

  console.log('📱 Loading PoquitoTalk Onboarding flow inside Android Phone Frame...');
  await page.goto(`http://localhost:${PORT}/?onboarding=true`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Inject Android phone chassis, bezel, camera punch-hole, and virtual touch pointer
  await page.evaluate(() => {
    // 1. Wrap the existing #root inside an Android phone chassis
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

    // Move #root inside #android-screen
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
        font-family: -apple-system, Roboto, 'Helvetica Neue', sans-serif !important;
      }
      #android-page-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #FAF8F5;
      }
      /* Realistic Modern Android Titanium Chassis with Bezels */
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
      /* Top Speaker Slit */
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
      /* Android Phone Screen Area */
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
      /* Android Center Punch-Hole Selfie Camera */
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
        background: radial-gradient(circle, rgba(160, 74, 38, 0.55) 0%, rgba(160, 74, 38) 70%);
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
    pointer.style.left = '240px';
    pointer.style.top = '720px';
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
    };
  });

  const tempRawVideo = path.join(OUTPUT_DIR, 'raw_onboarding_screencast.mp4');
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

  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 90,
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

  let curCursorX = 197;
  let curCursorY = 500;

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

      await page.evaluate((x, y) => {
        if (window.simulateTouchMove) window.simulateTouchMove(x, y);
      }, Math.round(curCursorX), Math.round(curCursorY));

      await sleep(delay);
    }
  }

  async function tapAtCurrent() {
    await page.evaluate((x, y) => {
      if (window.simulateTap) window.simulateTap(x, y);
    }, Math.round(curCursorX), Math.round(curCursorY));

    await page.mouse.click(curCursorX, curCursorY);
    await sleep(250);
  }

  async function tapElementByText(text, durationMs = 600) {
    const pos = await page.evaluate((queryText) => {
      const all = Array.from(document.querySelectorAll('div, span, p, a, button, [role="button"], input'));
      const matchingLeaves = all.filter(el => {
        const txt = (el.innerText || el.textContent || '').trim().toLowerCase();
        const rect = el.getBoundingClientRect();
        const isVisible = rect.width > 15 && rect.height > 10 && rect.top >= 0 && rect.top <= window.innerHeight;
        return isVisible && txt.includes(queryText.toLowerCase());
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
      await page.evaluate((queryText) => {
        const all = Array.from(document.querySelectorAll('div, span, p, a, button, [role="button"], input'));
        const matchingLeaves = all.filter(el => {
          const txt = (el.innerText || el.textContent || '').trim().toLowerCase();
          const rect = el.getBoundingClientRect();
          const isVisible = rect.width > 15 && rect.height > 10 && rect.top >= 0 && rect.top <= window.innerHeight;
          return isVisible && txt.includes(queryText.toLowerCase());
        });
        if (matchingLeaves.length > 0) {
          matchingLeaves.sort((a, b) => (a.offsetWidth * a.offsetHeight) - (b.offsetWidth * b.offsetHeight));
          let cur = matchingLeaves[0];
          while (cur && cur !== document.body) {
            cur.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            cur = cur.parentElement;
          }
        }
      }, text);
      return true;
    }
    console.log(`⚠️ Could not find element with text: "${text}"`);
    return false;
  }

  function recordStaticFrames(durationMs) {
    const count = Math.max(1, Math.round((durationMs / 1000) * 30));
    for (let i = 0; i < count; i++) {
      if (lastFrameData) {
        frameCount++;
        ffmpegStream.stdin.write(Buffer.from(lastFrameData, 'base64'));
      }
    }
  }

  // Hide pointer temporarily for pristine screenshots
  async function hidePointer() {
    await page.evaluate(() => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) p.style.display = 'none';
    });
  }

  async function showPointer() {
    await page.evaluate(() => {
      const p = document.getElementById('virtual-touch-pointer');
      if (p) p.style.display = 'block';
    });
  }

  // --- SCENE 0: SPLASH SCREEN (Exactly 3.0s) ---
  console.log('🌟 [Scene 0] Splash Screen display (3.0s)...');
  await sleep(3000); // Exactly 3.0s for splash animation & smooth transition

  // --- SCENE 1: STEP 1 (Welcome Screen - Fast & Punchy) ---
  console.log('🌟 [Scene 1] Step 1: Welcome to PoquitoTalk (Reduced by 4s)...');
  await hidePointer();
  await sleep(1000); // 1.0s of clean reading time (reduced by 4s)

  // Capture pristine Step 1 High-Res Screenshot
  const step1Path = path.join(OUTPUT_DIR, 'onboarding_step1_welcome.png');
  await page.screenshot({ path: step1Path });
  console.log(`📸 Step 1 screenshot saved to ${step1Path}`);
  await showPointer();

  // Tap "Set Up My Voice" and advance
  console.log('👉 Moving pointer to "Set Up My Voice"...');
  await tapElementByText('Set Up My Voice', 400);
  await sleep(350);

  // --- SCENE 2: STEP 2 (Personalize Your Voice & Persona Color Showcase) ---
  console.log('🌟 [Scene 2] Step 2: Personalize Your Voice & Persona Switching...');
  await sleep(300);

  // 1. Showcase Traveler (Blue border & cyan tint)
  console.log('👉 Tapping "Traveler" persona...');
  await tapElementByText('Traveler', 400);
  await sleep(450);

  // 2. Showcase Local Resident (Green border & emerald tint)
  console.log('👉 Tapping "Local Resident" persona...');
  await tapElementByText('Local Resident', 400);
  await sleep(450);

  // 3. Select Expat for Dorien (Terracotta border & amber tint)
  console.log('👉 Selecting "Expat" persona...');
  await tapElementByText('Expat', 400);
  await sleep(450);

  // Focus and type name "Dorien"
  const inputPos = await page.evaluate(() => {
    const input = document.querySelector('input');
    if (input) {
      const rect = input.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return null;
  });

  if (inputPos) {
    await moveTouchSmooth(inputPos.x, inputPos.y, 350);
    await tapAtCurrent();
    await sleep(100);

    // Focus input and type
    await page.evaluate(() => {
      const input = document.querySelector('input');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    const name = 'Dorien';
    for (const char of name.split('')) {
      await page.keyboard.type(char);
      await sleep(80);
    }
    await sleep(200);
  }

  // Select Female Voice Engine as requested
  console.log('👉 Tapping "Female Voice" chip...');
  await tapElementByText('Female Voice', 400);
  await sleep(350);

  // Capture pristine Step 2 High-Res Screenshot
  await hidePointer();
  const step2Path = path.join(OUTPUT_DIR, 'onboarding_step2_voice_setup.png');
  await page.screenshot({ path: step2Path });
  console.log(`📸 Step 2 screenshot saved to ${step2Path}`);
  await showPointer();

  // Tap "Next" on Step 2
  console.log('👉 Tapping "Next"...');
  await tapElementByText('Next', 450);
  await sleep(450);

  // --- SCENE 3: STEP 3 (You're All Set & Dancing Mascot - Exactly 3.0s) ---
  console.log("🌟 [Scene 3] Step 3: You're All Set (Celebration Jumping - 3.0s)...");
  
  // Hide pointer so Poquito's rapid happy jumps are in full focus
  await hidePointer();
  
  // Showcase exactly 3.0 seconds of continuous happy rapid jumping on Step 3
  await sleep(3000);

  // Capture pristine Step 3 High-Res Screenshot
  const step3Path = path.join(OUTPUT_DIR, 'onboarding_step3_ready_mascot.png');
  await page.screenshot({ path: step3Path });
  console.log(`📸 Step 3 screenshot saved to ${step3Path}`);

  // Stop screencast cleanly right at Step 3
  console.log('🛑 Finalizing video recording at Step 3 celebration...');
  await cdp.send('Page.stopScreencast');
  await browser.close();
  server.close();

  ffmpegStream.stdin.end();

  await new Promise((resolve) => {
    ffmpegStream.on('close', resolve);
  });

  console.log(`✅ Raw video captured: ${frameCount} frames (${(frameCount / 30).toFixed(1)}s)`);

  // Final multiplexing into dated & versioned MP4 files
  const dateStr = '2026_08_26';
  const outMainMp4 = path.join(WORKSPACE_DIR, 'onboarding_walkthrough.mp4');
  const outDatedMp4 = path.join(WORKSPACE_DIR, `onboarding_walkthrough_${dateStr}.mp4`);
  const outVersionMp4 = path.join(WORKSPACE_DIR, `onboarding_walkthrough_v1_5.mp4`);
  const outScreenshotMp4 = path.join(OUTPUT_DIR, `onboarding_walkthrough_${dateStr}.mp4`);
  const outWebFunnelMp4 = path.join(WORKSPACE_DIR, 'web-funnel', `onboarding_walkthrough_${dateStr}.mp4`);

  console.log('⚡ Encoding final polished MP4 video...');
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -i "${tempRawVideo}" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p "${outMainMp4}"`,
    { stdio: 'inherit' }
  );

  // Copy to versioned paths
  fs.copyFileSync(outMainMp4, outDatedMp4);
  fs.copyFileSync(outMainMp4, outVersionMp4);
  fs.copyFileSync(outMainMp4, outScreenshotMp4);
  fs.copyFileSync(outMainMp4, outWebFunnelMp4);

  // Copy step screenshots to workspace root
  fs.copyFileSync(step1Path, path.join(WORKSPACE_DIR, 'onboarding_step1_welcome.png'));
  fs.copyFileSync(step2Path, path.join(WORKSPACE_DIR, 'onboarding_step2_voice_setup.png'));
  fs.copyFileSync(step3Path, path.join(WORKSPACE_DIR, 'onboarding_step3_ready_mascot.png'));
  fs.copyFileSync(step3Path, path.join(WORKSPACE_DIR, 'onboarding_step3_after.png'));

  // Also copy to brain artifacts directory
  const brainDir = path.join('/Users/dorienvandenabbeele/.gemini/antigravity/brain/29fda69b-1c4c-487d-bfcd-67ab5689ef0e');
  if (fs.existsSync(brainDir)) {
    fs.copyFileSync(outMainMp4, path.join(brainDir, 'onboarding_walkthrough.mp4'));
    fs.copyFileSync(outDatedMp4, path.join(brainDir, `onboarding_walkthrough_${dateStr}.mp4`));
    fs.copyFileSync(outVersionMp4, path.join(brainDir, `onboarding_walkthrough_v1_5.mp4`));
    fs.copyFileSync(step1Path, path.join(brainDir, 'onboarding_step1_welcome.png'));
    fs.copyFileSync(step2Path, path.join(brainDir, 'onboarding_step2_voice_setup.png'));
    fs.copyFileSync(step3Path, path.join(brainDir, 'onboarding_step3_ready_mascot.png'));
    fs.copyFileSync(step3Path, path.join(brainDir, 'onboarding_step3_after.png'));
  }

  console.log('🎉 Onboarding walkthrough video & screenshots generated successfully!');
  console.log(`📁 Workspace Video: ${outMainMp4}`);
}

main().catch((err) => {
  console.error('❌ Error executing onboarding video generator:', err);
  process.exit(1);
});

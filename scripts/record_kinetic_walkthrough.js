const puppeteer = require('puppeteer-core');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 8099;
const DIST_DIR = path.join(__dirname, '..', 'dist');
const AUDIO_DIR = path.join(__dirname, '..', 'assets', 'audio', 'presets');
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'videos');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Starting PoquitoTalk Fast-Paced Kinetic Walkthrough Video Recorder (~28s)...');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Serve static web build
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    let filePath = path.join(DIST_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.ttf': 'font/ttf',
    };

    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(filePath).pipe(res);
  });

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`🌐 Local HTTP server listening at http://localhost:${PORT}`);

  // 2. Launch Puppeteer Browser
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=394,852',
      '--hide-scrollbars',
      '--mute-audio',
    ],
  });

  const page = await browser.newPage();
  page.on('pageerror', (err) => console.error('💥 PAGE ERROR:', err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('BROWSER ERROR:', msg.text());
  });

  await page.setViewport({
    width: 394,
    height: 852,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const promptText = encodeURIComponent('Hi! Do you have water delivery trucks available to refill our rainwater storage tank in Bocas?');
  const outputText = encodeURIComponent('¡Buenas! ¿Tienen camiones cisterna disponibles para rellenar nuestro tanque de agua en Bocas?');

  console.log('📱 Loading PoquitoTalk React app with pre-populated scenario...');
  await page.goto(`http://localhost:${PORT}/?onboarding=false&prompt=${promptText}&output=${outputText}`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // 3. Inject touch pointer, ripple, and heartbeat styles
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
        transition: transform 0.16s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.15s ease;
      }
      #virtual-touch-pointer.tapping {
        transform: translate(-50%, -50%) scale(0.72);
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
        animation: touchRippleAnim 0.45s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
      }
      @keyframes touchRippleAnim {
        0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.9; }
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
    pointer.style.left = '320px';
    pointer.style.top = '270px';
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
        setTimeout(() => p.classList.remove('tapping'), 200);
      }
      const ripple = document.createElement('div');
      ripple.className = 'touch-ripple-effect';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    };
  });

  // Ensure splash screen is 100% faded out and UI is completely rested before recording
  console.log('⏳ Waiting for splash screen fade-out and UI stabilization...');
  await sleep(1400);

  const tempRawVideo = path.join(OUTPUT_DIR, 'raw_temp_kinetic_screencast.mp4');
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
    tempRawVideo,
  ]);

  console.log('🎥 Starting CDP frame recording stream...');
  const cdp = await page.target().createCDPSession();
  let frameCount = 0;
  let lastFrameData = null;
  const audioCues = [];

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

  let curCursorX = 320;
  let curCursorY = 270;

  async function moveTouchSmooth(toX, toY, durationMs = 400) {
    const fromX = curCursorX;
    const fromY = curCursorY;
    const steps = Math.max(8, Math.round((durationMs / 1000) * 30));
    const delay = durationMs / steps;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      curCursorX = fromX + (toX - fromX) * ease;
      curCursorY = fromY + (toY - fromY) * ease;
      await page.evaluate((x, y) => window.simulateTouchMove(x, y), curCursorX, curCursorY);
      await sleep(delay);
    }
  }

  async function tapAtCurrent() {
    await page.evaluate((px, py) => window.simulateTap(px, py), curCursorX, curCursorY);
    await sleep(220);
  }

  async function smoothScrollBy(distance, durationMs = 500) {
    const steps = Math.max(10, Math.round((durationMs / 1000) * 30));
    const delta = distance / steps;
    const delay = durationMs / steps;

    for (let i = 0; i < steps; i++) {
      await page.evaluate((d) => {
        const allDivs = Array.from(document.querySelectorAll('div'));
        const scrollables = allDivs.filter((el) => {
          const style = window.getComputedStyle(el);
          return (
            (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
            el.scrollHeight > el.clientHeight + 10
          );
        });

        if (scrollables.length > 0) {
          scrollables.forEach((el) => {
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

  // =========================================================================
  // SCENE 1: Home Screen Instant Translation & Studio Audio Sync (~6.0s)
  // =========================================================================
  console.log('👉 Scene 1: Instant Translation & Panamanian Spanish Audio Sync...');
  recordStaticFrames(600); // 0.6s clean resting pause on initial screen

  // Find exact dynamic position of Speaker button
  const speakerPos = await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Play Speaker Audio"]') ||
                document.querySelector('button[aria-label*="Speaker"]') ||
                document.querySelector('div[aria-label*="Speaker"]');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { x: 63, y: 544 };
  });

  // Move directly to the Speaker button
  console.log(`🔊 Gliding cursor to Play Speaker Audio button at (${speakerPos.x}, ${speakerPos.y})...`);
  await moveTouchSmooth(speakerPos.x, speakerPos.y, 300);
  await tapAtCurrent();

  // Visually activate speaker button playing state
  await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Play Speaker Audio"]') ||
                document.querySelector('button[aria-label*="Speaker"]') ||
                document.querySelector('div[aria-label*="Speaker"]');
    if (btn) {
      btn.style.transition = 'all 0.2s ease';
      btn.style.backgroundColor = '#FFE4E6';
      btn.style.transform = 'scale(1.12)';
    }
  });

  // Log audio cue at this exact frame instant
  console.log(`🎙️ Recording Audio Cue at Frame #${frameCount} (${(frameCount / 30).toFixed(2)}s in video)...`);
  audioCues.push({
    frameNumber: frameCount,
    file: path.join(AUDIO_DIR, 'diego_water_cistern_truck_exact.mp3'),
  });

  // Hold during Diego audio playback (5.28s = ~158 frames)
  console.log('⏳ Synchronized Diego voice note playing (~5.28s)...');
  recordStaticFrames(5280);

  // Revert speaker button to resting state
  await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Play Speaker Audio"]') ||
                document.querySelector('button[aria-label*="Speaker"]') ||
                document.querySelector('div[aria-label*="Speaker"]');
    if (btn) {
      btn.style.backgroundColor = '';
      btn.style.transform = '';
    }
  });
  await sleep(200);

  // =========================================================================
  // SCENE 2: Templates Tab & Fanned Accordion Deck (~4.6s)
  // =========================================================================
  console.log('👉 Scene 2: Navigating to Templates & Fanned Accordion Deck...');
  // Tap Templates bottom tab (x: 122, y: 795)
  await moveTouchSmooth(122, 795, 220);
  await tapAtCurrent();
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('a[role="tab"], div[role="tab"]'));
    const tTab = tabs.find((t) => (t.innerText || '').includes('Templates'));
    if (tTab) tTab.click();
  });
  await sleep(300);
  recordStaticFrames(300); // 100% resting stack state (Rule 6)

  // Tap Boat Captains & Marine card to expand fanned deck
  console.log('🃏 Expanding fanned card deck for Boat Captains & Marine...');
  await moveTouchSmooth(197, 199, 200);
  await tapAtCurrent();
  await page.evaluate(() => {
    if (window.__expandPresetCard) {
      window.__expandPresetCard('boat');
    }
  });
  await sleep(300);
  recordStaticFrames(600); // Pause on expanded card

  // Smooth scroll through dialect levels
  console.log('📜 Scrolling through Level 1, Level 2, and Level 3 dialect options...');
  await smoothScrollBy(180, 300);
  recordStaticFrames(600); // Pause to read dialect options
  await smoothScrollBy(-180, 250);
  recordStaticFrames(200);

  // =========================================================================
  // SCENE 3: Directory Tab & Falling Rainbow Spectrum (~4.6s)
  // =========================================================================
  console.log('👉 Scene 3: Navigating to Verified Directory Tab...');
  // Tap Directory tab (x: 271, y: 795)
  await moveTouchSmooth(271, 795, 220);
  await tapAtCurrent();
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('a[role="tab"], div[role="tab"]'));
    const dTab = tabs.find((t) => (t.innerText || '').includes('Directory'));
    if (dTab) dTab.click();
  });
  await sleep(300);
  recordStaticFrames(350); // Pause on falling rainbow categories

  // Smooth scroll through rainbow categories
  console.log('🌈 Scrolling through falling rainbow categories & verified providers...');
  await smoothScrollBy(250, 350);
  recordStaticFrames(500);

  // Tap a verified provider card
  console.log('⭐ Tapping verified provider card...');
  await moveTouchSmooth(197, 380, 200);
  await tapAtCurrent();
  recordStaticFrames(400);

  // Scroll back to top
  await smoothScrollBy(-250, 300);
  recordStaticFrames(200);

  // =========================================================================
  // SCENE 4: Threads Tab & 2-Way Walkie-Talkie Stream (~4.6s)
  // =========================================================================
  console.log('👉 Scene 4: Navigating to Threads Tab (2-Way Conversation Stream)...');
  // Tap Threads bottom tab (x: 196, y: 795)
  await moveTouchSmooth(196, 795, 220);
  await tapAtCurrent();
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('a[role="tab"], div[role="tab"]'));
    const thTab = tabs.find((t) => (t.innerText || '').includes('Threads'));
    if (thTab) thTab.click();
  });
  await sleep(300);
  recordStaticFrames(200);

  // Tap Carlos A/C Repair thread (x: 162, y: 185)
  console.log('💬 Tapping Carlos (A/C Repair) thread...');
  await moveTouchSmooth(162, 185, 200);
  await tapAtCurrent();
  await page.evaluate(() => {
    if (window.__openThreadModal) {
      window.__openThreadModal();
    }
  });
  await sleep(300);

  // Pause to view dual-language 2-way bubbles
  console.log('👀 Viewing dual English/Spanish bubbles in active 2-way walkie channel...');
  recordStaticFrames(1400);

  // Tap Back button (x: 36, y: 69)
  console.log('🔙 Closing thread modal via back button...');
  await moveTouchSmooth(36, 69, 200);
  await tapAtCurrent();
  await page.evaluate(() => {
    if (window.__closeThreadModal) {
      window.__closeThreadModal();
    }
  });
  await sleep(200);
  recordStaticFrames(150);

  // =========================================================================
  // SCENE 5: Settings & Paywall Modal Showcase (~4.6s)
  // =========================================================================
  console.log('👉 Scene 5: Showcasing Paywall Modal & Unique Indigo CTA (Rule 10)...');
  // Open paywall via exposed helper
  await moveTouchSmooth(355, 45, 220);
  await tapAtCurrent();
  await page.evaluate(() => {
    if (window.__openPaywall) window.__openPaywall();
  });
  await sleep(300);

  // Pause to admire clean paywall with unique CTA button #4F46E5
  console.log('💎 Showcasing Annual 7-Day Free Trial vs Monthly & Unique CTA (#4F46E5)...');
  recordStaticFrames(1200);

  // Glide to CTA button (x: 197, y: 700)
  await moveTouchSmooth(197, 700, 250);
  recordStaticFrames(600);

  // Close paywall via close button (x: 355, y: 345)
  console.log('✖️ Closing paywall modal...');
  await moveTouchSmooth(355, 345, 200);
  await tapAtCurrent();
  await page.evaluate(() => {
    if (window.__closePaywall) window.__closePaywall();
  });
  await sleep(450);
  recordStaticFrames(150);

  // =========================================================================
  // SCENE 6: Return to Translate & Mascot Outro (~2.1s)
  // =========================================================================
  console.log('👉 Scene 6: Returning to Translate Home Screen & Mascot Outro...');
  // Tap Translate bottom tab (x: 48, y: 795)
  await moveTouchSmooth(48, 795, 200);
  await tapAtCurrent();
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('a[role="tab"], div[role="tab"]'));
    const tTab = tabs.find((t) => (t.innerText || '').includes('Translate'));
    if (tTab) tTab.click();
  });
  await sleep(350);

  // Final resting hold on animated mascot
  console.log('🦜 Resting hold on animated Poquito mascot...');
  recordStaticFrames(900);

  console.log(`🛑 Stopping screencast. Total frames captured: ${frameCount}`);
  await cdp.send('Page.stopScreencast');
  await sleep(500);

  await browser.close();
  server.close();

  // Close ffmpeg stream and wait for it to exit
  console.log('⏳ Finalizing raw video stream encoder...');
  await new Promise((resolve) => {
    ffmpegStream.stdin.end();
    ffmpegStream.on('close', resolve);
  });

  const outputVideoPath = path.join(OUTPUT_DIR, 'walkthrough_demo.mp4');
  const rootVideoPath = path.join(__dirname, '..', 'walkthrough_demo.mp4');
  const webFunnelVideoPath = path.join(__dirname, '..', 'web-funnel', 'walkthrough_demo.mp4');

  console.log('⚙️ Muxing final MP4 with frame-accurate audio synchronization...');

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

  // Copy to root workspace and web-funnel per Rule 4
  fs.copyFileSync(outputVideoPath, rootVideoPath);
  fs.copyFileSync(outputVideoPath, webFunnelVideoPath);

  const durationSec = (frameCount / 30).toFixed(1);
  console.log(`\n🎉 Fast-Paced Kinetic Walkthrough Video Successfully Created!`);
  console.log(`   📹 Root File: ${rootVideoPath}`);
  console.log(`   📹 Web Funnel Copy: ${webFunnelVideoPath}`);
  console.log(`   ⏱️ Total Duration: ~${durationSec}s (Target: ~28-30s)`);
}

main().catch((err) => {
  console.error('Error generating kinetic walkthrough video:', err);
  process.exit(1);
});

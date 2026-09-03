#!/usr/bin/env node

/**
 * PoquitoTalk Walkie-Talkie Automated Demonstration Screencast Engine
 * Synchronized with Studio ElevenLabs Male Voice (Capt. Jim) & Synthetic Touch Physics
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WEB_DIR = path.join(__dirname, '..', 'web-funnel');
const OUTPUT_VIDEO = path.join(__dirname, '..', 'walkie_talkie_demo.mp4');
const TEMP_RAW_VIDEO = path.join(__dirname, '..', '.tmp_walkie_raw.mp4');
const CAPTAIN_JIM_AUDIO = path.join(__dirname, '..', 'assets', 'audio', 'captain_jim_elevenlabs.mp3');
const BEEP_AUDIO = path.join(__dirname, '..', 'assets', 'audio', 'walkie_beep.mp3');
const PORT = 8129;
const FPS = 30;

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
      '.mp3': 'audio/mpeg',
      '.svg': 'image/svg+xml',
    };

    const server = http.createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      let filePath = path.join(WEB_DIR, urlPath === '/' ? 'talk.html' : urlPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(WEB_DIR, 'talk.html');
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

    server.listen(PORT, () => {
      console.log(`Walkie demo server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const server = await startStaticServer();

  console.log('Launching headless Chrome for mobile Walkie-Talkie demonstration...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=460,920',
      '--hide-scrollbars',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 440,
    height: 880,
    deviceScaleFactor: 2, // Ultra-crisp Retina rendering
  });

  console.log('Loading Walkie-Talkie interface with Captain Jim room...');
  await page.goto(`http://localhost:${PORT}/talk.html?name=Capt.%20Jim%20(Bocas%20Marina)`, { waitUntil: 'networkidle0' });

  // Invalidate cache and pre-warm WebP mascots
  await page.evaluate(() => {
    ['poquito_tilt_34_51_160.webp', 'poquito_talk_58_73_160.webp', 'poquito_listening_49_60_160.webp'].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  });

  // Inject virtual touch pointer and animations
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      #virtual-touch {
        position: fixed;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: rgba(46, 64, 45, 0.4);
        border: 2.5px solid #232B22;
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
        box-shadow: 0 0 16px rgba(35, 43, 34, 0.35);
        left: 220px;
        top: 760px;
      }
      #virtual-touch.pressing {
        transform: translate(-50%, -50%) scale(0.85);
        background: rgba(220, 38, 38, 0.65);
        border-color: #DC2626;
        box-shadow: 0 0 22px rgba(220, 38, 38, 0.8);
      }
      #fps-heartbeat {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 2px;
        height: 2px;
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

    const hb = document.createElement('div');
    hb.id = 'fps-heartbeat';
    document.body.appendChild(hb);

    const touch = document.createElement('div');
    touch.id = 'virtual-touch';
    document.body.appendChild(touch);

    window.setTouchPos = (x, y) => {
      const t = document.getElementById('virtual-touch');
      if (t) {
        t.style.left = `${x}px`;
        t.style.top = `${y}px`;
      }
    };

    window.setTouchPress = (isPressing) => {
      const t = document.getElementById('virtual-touch');
      if (t) {
        if (isPressing) t.classList.add('pressing');
        else t.classList.remove('pressing');
      }
    };
  });

  // Start FFmpeg raw capture stream
  console.log('🎥 Starting FFmpeg screencast stream capture...');
  const ffmpegStream = spawn('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', `${FPS}`,
    '-i', '-',
    '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-pix_fmt', 'yuv420p',
    '-r', `${FPS}`,
    TEMP_RAW_VIDEO,
  ]);

  const client = await page.target().createCDPSession();
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    everyNthFrame: 1,
  });

  let frameCount = 0;
  client.on('Page.screencastFrame', async (frame) => {
    try {
      frameCount++;
      const buffer = Buffer.from(frame.data, 'base64');
      ffmpegStream.stdin.write(buffer);
      await client.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
    } catch (e) {}
  });

  // Helper for smooth touch movement
  let curX = 220;
  let curY = 760;
  async function moveTouch(toX, toY, durationMs = 600) {
    const fromX = curX;
    const fromY = curY;
    const steps = Math.max(10, Math.round((durationMs / 1000) * 30));
    const delay = durationMs / steps;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      curX = fromX + (toX - fromX) * ease;
      curY = fromY + (toY - fromY) * ease;
      await page.evaluate((x, y) => window.setTouchPos(x, y), curX, curY);
      await sleep(delay);
    }
  }

  const audioCues = []; // Stores { frameNumber, audioPath }

  console.log('🎬 Recording Walkie-Talkie demonstration scenario...');

  // Phase 1: Resting state display (3s) -> poquito_tilt_34_51_160.webp
  console.log('1. Resting State: Poquito perched with curious head tilt...');
  await page.evaluate(() => setMascotState('resting'));
  await sleep(3000);

  // Phase 2: Move touch smoothly to Ceramic & Deep Sage PTT Button (0.8s)
  console.log('2. Moving touch to Ceramic & Deep Sage PTT button...');
  const btnBox = await page.evaluate(() => {
    const el = document.getElementById('talk-btn');
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  await moveTouch(btnBox.x, btnBox.y, 800);
  await sleep(300);

  // Phase 3: Press down PTT & hold to speak (4.5s) -> poquito_talk_58_73_160.webp
  console.log('3. Recording State: Pressing PTT button, Poquito talking into microphone...');
  audioCues.push({ frameNumber: frameCount, audioPath: BEEP_AUDIO });

  await page.evaluate(() => {
    window.setTouchPress(true);
    document.getElementById('talk-btn').classList.add('recording');
    document.getElementById('mascotContainer').classList.add('active-transmitting');
    setMascotState('recording');
    const status = document.getElementById('status-text');
    status.innerHTML = `
      <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#DC2626; animation: pulseRipple 0.8s infinite;"></span>
      <span style="color: #DC2626; font-weight: 700;">Transmitiendo en vivo • Habla ahora...</span>
    `;
  });

  await sleep(4500);

  // Phase 4: Release PTT button & process AI translation (1.8s) -> poquito_tilt_34_51_160.webp
  console.log('4. Releasing PTT button: Processing AI translation...');
  audioCues.push({ frameNumber: frameCount, audioPath: BEEP_AUDIO });

  await page.evaluate(() => {
    window.setTouchPress(false);
    document.getElementById('talk-btn').classList.remove('recording');
    document.getElementById('mascotContainer').classList.remove('active-transmitting');
    setMascotState('resting');
    const status = document.getElementById('status-text');
    status.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E402D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span style="color: #2E402D; font-weight: 600;">Traduciendo con IA instantánea...</span>
    `;
  });

  // Move touch smoothly to "Escuchar Mensaje Traducido" button
  const playBtnBox = await page.evaluate(() => {
    const el = document.getElementById('play-incoming-btn');
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  await moveTouch(playBtnBox.x, playBtnBox.y, 600);
  await sleep(1200);

  // Phase 5: Tap Play Translated Audio & Play Captain Jim's Male ElevenLabs Voice (8s) -> poquito_listening_49_60_160.webp
  console.log('5. Receiving State: Tapping Play, Captain Jim (Male ElevenLabs) speaks, Poquito listening with radio transceiver...');
  
  // Tap animation
  await page.evaluate(() => window.setTouchPress(true));
  await sleep(150);
  await page.evaluate(() => window.setTouchPress(false));

  const audioPlayCueFrame = frameCount;
  audioCues.push({ frameNumber: audioPlayCueFrame, audioPath: CAPTAIN_JIM_AUDIO });

  await page.evaluate(() => {
    setMascotState('receiving');
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('incoming-time').innerText = timeStr;
    const transEl = document.getElementById('incoming-transcript');
    if (transEl) {
      transEl.style.display = 'block';
      transEl.innerHTML = `
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #16A34A; font-weight: 700; margin-bottom: 4px;">Mensaje de Capt. Jim (Voz masculina):</div>
        <div>"Hey buenas tardes! Perfect. Tomorrow morning around nine works great. The boat is docked at slip number four at Bocas Marina."</div>
      `;
    }
    document.getElementById('play-incoming-btn').innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
      <span>Reproduciendo voz de Capt. Jim...</span>
    `;
  });

  // Keep screen visible during full ElevenLabs male voice playback (7.9s)
  await sleep(8200);

  // Phase 6: Playback Finished -> Return to Resting Perch (3s) -> poquito_tilt_34_51_160.webp
  console.log('6. Playback complete: Mascot returning to resting perched tilt...');
  await page.evaluate(() => {
    setMascotState('resting');
    document.getElementById('play-incoming-btn').innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
      <span>Escuchar Mensaje Traducido</span>
    `;
  });

  // Move touch back down smoothly
  await moveTouch(220, 760, 800);
  await sleep(3000);

  // Stop screencast and close browser
  await client.send('Page.stopScreencast');
  await browser.close();
  server.close();

  ffmpegStream.stdin.end();
  await new Promise((resolve) => ffmpegStream.on('close', resolve));

  console.log(`🎬 Video recording complete. Total frames captured: ${frameCount}`);
  console.log('Muxing synchronized ElevenLabs audio timeline with FFmpeg...');

  // Build FFmpeg filter_complex for multiplexing all audio cues
  const inputArgs = ['-y', '-i', TEMP_RAW_VIDEO];
  let filterParts = [];

  audioCues.forEach((cue, idx) => {
    inputArgs.push('-i', cue.audioPath);
    const delayMs = Math.max(0, Math.round((cue.frameNumber / FPS) * 1000));
    const streamIdx = idx + 1;
    filterParts.push(`[${streamIdx}:a]adelay=${delayMs}|${delayMs}[a${idx}]`);
  });

  const mixInputs = audioCues.map((_, idx) => `[a${idx}]`).join('');
  const filterComplex = `${filterParts.join(';')};${mixInputs}amix=inputs=${audioCues.length}:normalize=0[aout]`;

  const finalFFmpegArgs = [
    ...inputArgs,
    '-filter_complex', `"${filterComplex}"`,
    '-map', '0:v',
    '-map', '[aout]',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-movflags', '+faststart',
    OUTPUT_VIDEO,
  ];

  execSync(`/opt/homebrew/bin/ffmpeg ${finalFFmpegArgs.join(' ')}`);

  if (fs.existsSync(TEMP_RAW_VIDEO)) {
    fs.unlinkSync(TEMP_RAW_VIDEO);
  }

  console.log(`✅ Demonstration video saved to: ${OUTPUT_VIDEO}`);
}

main().catch((err) => {
  console.error('Fatal error during recording:', err);
  process.exit(1);
});

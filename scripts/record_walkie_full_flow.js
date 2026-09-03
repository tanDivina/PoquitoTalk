#!/usr/bin/env node

/**
 * PoquitoTalk Full End-to-End Walkie-Talkie Flow Screencast Engine
 * From WhatsApp Invite Tap -> Instant Zero-Install Web Walkie -> 2-Way Voice Translation
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WEB_DIR = path.join(__dirname, '..', 'web-funnel');
const OUTPUT_VIDEO = path.join(__dirname, '..', 'walkie_talkie_full_flow_demo.mp4');
const TEMP_RAW_VIDEO = path.join(__dirname, '..', '.tmp_full_flow_raw.mp4');
const CAPTAIN_JIM_AUDIO = path.join(__dirname, '..', 'assets', 'audio', 'captain_jim_elevenlabs.mp3');
const BEEP_AUDIO = path.join(__dirname, '..', 'assets', 'audio', 'walkie_beep.mp3');
const PORT = 8130;
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
      let filePath = path.join(WEB_DIR, urlPath === '/' ? 'whatsapp_flow.html' : urlPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(WEB_DIR, 'whatsapp_flow.html');
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
      console.log(`Full flow server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function injectVirtualTouch(page) {
  await page.evaluate(() => {
    if (document.getElementById('virtual-touch')) return;

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
      #virtual-touch.tapping {
        transform: translate(-50%, -50%) scale(0.8);
        background: rgba(37, 211, 102, 0.8);
        border-color: #25D366;
        box-shadow: 0 0 20px rgba(37, 211, 102, 0.9);
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

    window.setTouchMode = (mode) => {
      const t = document.getElementById('virtual-touch');
      if (!t) return;
      t.classList.remove('pressing', 'tapping');
      if (mode) t.classList.add(mode);
    };
  });
}

async function main() {
  const server = await startStaticServer();

  console.log('Launching headless Chrome for full-flow Walkie-Talkie demonstration...');
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
    deviceScaleFactor: 2, // Retina HD
  });

  // Start FFmpeg raw capture stream
  console.log('🎥 Starting FFmpeg stream capture...');
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
      await page.evaluate((x, y) => {
        if (window.setTouchPos) window.setTouchPos(x, y);
      }, curX, curY);
      await sleep(delay);
    }
  }

  const audioCues = []; // Stores { frameNumber, audioPath }

  console.log('🎬 1. SCENE 1: WhatsApp Chat View with Capt. Jim invite link...');
  await page.goto(`http://localhost:${PORT}/whatsapp_flow.html`, { waitUntil: 'networkidle0' });
  await injectVirtualTouch(page);
  await page.evaluate((x, y) => window.setTouchPos(x, y), curX, curY);
  await sleep(3000);

  // Move touch to WhatsApp Walkie Link Card
  console.log('🎬 2. SCENE 2: Tapping Walkie-Talkie link card in WhatsApp...');
  const cardBox = await page.evaluate(() => {
    const el = document.getElementById('walkie-link-card');
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  await moveTouch(cardBox.x, cardBox.y, 700);
  await sleep(300);

  // Tap animation on link card
  await page.evaluate(() => window.setTouchMode('tapping'));
  await sleep(200);
  await page.evaluate(() => window.setTouchMode(null));

  // Navigate smoothly to Talk page
  console.log('🎬 3. SCENE 3: Launching zero-install web Walkie-Talkie...');
  await page.goto(`http://localhost:${PORT}/talk.html?name=Capt.%20Jim%20(Bocas%20Marina)`, { waitUntil: 'networkidle0' });
  await injectVirtualTouch(page);
  await page.evaluate((x, y) => window.setTouchPos(x, y), curX, curY);

  // Resting state overview
  await page.evaluate(() => setMascotState('resting'));
  await sleep(2500);

  // Move touch to Ceramic PTT button
  console.log('🎬 4. SCENE 4: Moving to Ceramic & Deep Sage PTT button...');
  const btnBox = await page.evaluate(() => {
    const el = document.getElementById('talk-btn');
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  await moveTouch(btnBox.x, btnBox.y, 700);
  await sleep(300);

  // Press down PTT & hold to speak in Spanish
  console.log('🎬 5. SCENE 5: Pressing & holding PTT, contractor speaks Spanish...');
  audioCues.push({ frameNumber: frameCount, audioPath: BEEP_AUDIO });

  await page.evaluate(() => {
    window.setTouchMode('pressing');
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

  // Release PTT button & process AI translation
  console.log('🎬 6. SCENE 6: Releasing PTT button, AI translating instant voice...');
  audioCues.push({ frameNumber: frameCount, audioPath: BEEP_AUDIO });

  await page.evaluate(() => {
    window.setTouchMode(null);
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
  await sleep(1000);

  // Play incoming message with Capt. Jim's ElevenLabs voice
  console.log('🎬 7. SCENE 7: Tapping Play, Captain Jim speaks in ElevenLabs studio voice...');
  await page.evaluate(() => window.setTouchMode('tapping'));
  await sleep(150);
  await page.evaluate(() => window.setTouchMode(null));

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

  // Keep screen visible during ElevenLabs playback
  await sleep(8200);

  // Return to resting state
  console.log('🎬 8. SCENE 8: Playback finished, mascot returning to resting state...');
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

  console.log(`✅ Full Flow Demonstration video saved to: ${OUTPUT_VIDEO}`);
}

main().catch((err) => {
  console.error('Fatal error during recording:', err);
  process.exit(1);
});

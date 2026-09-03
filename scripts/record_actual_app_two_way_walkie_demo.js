#!/usr/bin/env node

/**
 * PoquitoTalk Actual App Two-Way Walkie-Talkie Flow Demonstration
 * Records BOTH SIDES using the ACTUAL React Native App (dist/) and Contractor Web Walkie (talk.html)
 * Synchronized with Studio ElevenLabs & Native Voice Tracks via FFmpeg.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const WEB_DIR = path.join(__dirname, '..', 'web-funnel');
const OUTPUT_VIDEO = path.join(__dirname, '..', 'walkie_talkie_actual_app_flow_demo.mp4');
const TEMP_RAW_VIDEO = path.join(__dirname, '..', '.tmp_actual_app_flow_raw.mp4');

const CAPTAIN_JIM_AUDIO = path.join(__dirname, '..', 'assets', 'audio', 'captain_jim_elevenlabs.mp3');
const TURN1_SPANISH_AUDIO = path.join(__dirname, '..', 'assets', 'audio', 'simulation', 'turn1_spanish_trans.mp3');
const TURN2_CONTRACTOR_AUDIO = path.join(__dirname, '..', 'assets', 'audio', 'simulation', 'turn2_contractor_spanish.mp3');
const TURN2_EXPAT_AUDIO = path.join(__dirname, '..', 'assets', 'audio', 'simulation', 'turn2_expat_trans.mp3');
const BEEP_AUDIO = path.join(__dirname, '..', 'assets', 'audio', 'walkie_beep.mp3');

const PORT_APP = 8099;
const PORT_WEB = 8130;
const FPS = 30;

function startStaticServer(dir, port) {
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
      '.ttf': 'font/ttf',
    };

    const server = http.createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      let filePath = path.join(dir, urlPath === '/' ? 'index.html' : urlPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(dir, 'index.html');
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

    server.listen(port, () => {
      console.log(`Static server running on http://localhost:${port} -> ${dir}`);
      resolve(server);
    });
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function injectVirtualTouch(page) {
  await page.evaluate(() => {
    if (document.getElementById('virtual-touch-pointer')) return;

    const style = document.createElement('style');
    style.innerHTML = `
      #virtual-touch-pointer {
        position: fixed;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: rgba(37, 211, 102, 0.4);
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.15s ease, opacity 0.2s ease;
        left: 200px;
        top: 400px;
        opacity: 0.9;
      }
      #virtual-touch-pointer.pressing {
        transform: translate(-50%, -50%) scale(0.85);
        background: rgba(220, 38, 38, 0.45);
        border-color: #EF4444;
        box-shadow: 0 0 16px rgba(220, 38, 38, 0.6);
        opacity: 0.75;
      }
      #virtual-touch-pointer.tapping {
        transform: translate(-50%, -50%) scale(0.75);
        background: rgba(37, 211, 102, 0.8);
      }
      .touch-ripple-effect {
        position: fixed;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(37, 211, 102, 0.6) 0%, rgba(37, 211, 102, 0) 70%);
        pointer-events: none;
        z-index: 999998;
        transform: translate(-50%, -50%) scale(0.2);
        animation: touchRippleAnim 0.4s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
      }
      @keyframes touchRippleAnim {
        0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
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
    touch.id = 'virtual-touch-pointer';
    document.body.appendChild(touch);

    window.setTouchPos = (x, y) => {
      const t = document.getElementById('virtual-touch-pointer');
      if (t) {
        t.style.left = x + 'px';
        t.style.top = y + 'px';
      }
    };

    window.setTouchMode = (mode) => {
      const t = document.getElementById('virtual-touch-pointer');
      if (!t) return;
      t.classList.remove('pressing', 'tapping');
      if (mode) t.classList.add(mode);
    };

    window.spawnRipple = (x, y) => {
      const r = document.createElement('div');
      r.className = 'touch-ripple-effect';
      r.style.left = x + 'px';
      r.style.top = y + 'px';
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 450);
    };
  });
}

async function main() {
  const appServer = await startStaticServer(DIST_DIR, PORT_APP);
  const webServer = await startStaticServer(WEB_DIR, PORT_WEB);

  console.log('Launching Headless Chrome for Full Flow 2-Way Demo...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=430,900',
      '--hide-scrollbars',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions(`http://localhost:${PORT_WEB}`, ['microphone']);
  await context.overridePermissions(`http://localhost:${PORT_APP}`, ['microphone']);

  const page = await browser.newPage();
  await page.setViewport({
    width: 394,
    height: 852,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // Start FFmpeg raw capture stream
  console.log('Starting FFmpeg raw screencast capture (394x852 @ 30FPS)...');
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

  let latestFrameBuffer = null;
  let isRecording = true;
  let recordedFrames = 0;

  client.on('Page.screencastFrame', async (frame) => {
    try {
      latestFrameBuffer = Buffer.from(frame.data, 'base64');
      await client.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
    } catch (e) {}
  });

  // Capture initial screenshot so we have a frame immediately
  latestFrameBuffer = await page.screenshot({ type: 'jpeg', quality: 92 });

  // Stream at exact 30 FPS
  const frameIntervalMs = 1000 / FPS;
  const frameWriter = setInterval(() => {
    if (!isRecording) return;
    if (latestFrameBuffer) {
      recordedFrames++;
      ffmpegStream.stdin.write(latestFrameBuffer);
    }
  }, frameIntervalMs);

  let curX = 197;
  let curY = 426;

  async function moveTouch(toX, toY, durationMs = 500) {
    const fromX = curX;
    const fromY = curY;
    const steps = Math.max(8, Math.round((durationMs / 1000) * 30));
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

  const audioCues = []; // Stores { frameNumber: recordedFrames, audioPath }

  // ==========================================
  // ACT 1: ACTUAL EXPAT REACT NATIVE APP
  // ==========================================
  console.log('🎬 ACT 1: Expat opens actual React Native App (HomeScreen)...');
  await page.goto(`http://localhost:${PORT_APP}/?onboarding=false`, { waitUntil: 'networkidle0' });
  await injectVirtualTouch(page);
  await page.evaluate((x, y) => window.setTouchPos(x, y), curX, curY);
  await sleep(1500);

  // Expat taps Mic button in actual app
  console.log('Expat taps Mic button in actual app...');
  await moveTouch(197, 375, 600);
  await sleep(200);

  audioCues.push({ frameNumber: recordedFrames, audioPath: BEEP_AUDIO });
  await page.evaluate(() => {
    window.setTouchMode('tapping');
    window.spawnRipple(197, 375);
  });
  await sleep(150);
  await page.evaluate(() => window.setTouchMode(null));

  // Captain Jim speaks English in actual app
  console.log('Captain Jim speaks in ElevenLabs studio voice (6.09s)...');
  audioCues.push({ frameNumber: recordedFrames, audioPath: CAPTAIN_JIM_AUDIO });

  // Navigate to actual app with populated translation output
  const expatPrompt = encodeURIComponent('Hey buenas tardes! Tomorrow morning around nine AM works great at slip number four, Bocas Marina.');
  const expatOutput = encodeURIComponent('¡Buenas tardes! Mañana a las nueve de la mañana está perfecto en el muelle número cuatro de Bocas Marina.');
  
  await sleep(1200);
  await page.goto(`http://localhost:${PORT_APP}/?onboarding=false&prompt=${expatPrompt}&output=${expatOutput}`, { waitUntil: 'networkidle0' });
  await injectVirtualTouch(page);
  await page.evaluate((x, y) => window.setTouchPos(x, y), curX, curY);

  // Wait for Captain Jim speech to finish
  await sleep(5200);

  // Expat taps "Start 2-Way PoquitoTalkie Live Channel" in actual React Native app
  console.log('Expat taps Walkie Channel button in actual app...');
  const walkiePos = await page.evaluate(() => {
    const allDivs = Array.from(document.querySelectorAll('div, button'));
    const btn = allDivs.find(d => d.textContent && d.textContent.includes('Start 2-Way PoquitoTalkie'));
    if (btn) {
      const r = btn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    return { x: 197, y: 610 };
  });

  await moveTouch(walkiePos.x, walkiePos.y, 600);
  await sleep(200);

  audioCues.push({ frameNumber: recordedFrames, audioPath: BEEP_AUDIO });
  await page.evaluate((x, y) => {
    window.setTouchMode('tapping');
    window.spawnRipple(x, y);
  }, walkiePos.x, walkiePos.y);
  await sleep(250);
  await page.evaluate(() => window.setTouchMode(null));
  await sleep(1200);

  // ==========================================
  // ACT 2: WHATSAPP NOTIFICATION FLOW
  // ==========================================
  console.log('🎬 ACT 2: Contractor receives voice note in WhatsApp...');
  await page.goto(`http://localhost:${PORT_WEB}/whatsapp_flow.html`, { waitUntil: 'networkidle0' });
  await injectVirtualTouch(page);
  await page.evaluate((x, y) => window.setTouchPos(x, y), curX, curY);
  await sleep(1500);

  // Move touch to WhatsApp voice note play button
  console.log('Contractor taps Play on WhatsApp voice note (6s duration)...');
  const waPlayPos = await page.evaluate(() => {
    const el = document.getElementById('waPlayBtn');
    if (!el) return { x: 92, y: 130 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  await moveTouch(waPlayPos.x, waPlayPos.y, 600);
  await sleep(200);

  // Tap play button
  audioCues.push({ frameNumber: recordedFrames, audioPath: BEEP_AUDIO });
  await page.evaluate((x, y) => {
    window.setTouchMode('tapping');
    window.spawnRipple(x, y);
  }, waPlayPos.x, waPlayPos.y);
  await sleep(150);
  await page.evaluate(() => window.setTouchMode(null));

  // Voice Note Audio in Spanish (Capt Jim translated)
  console.log('Playing WhatsApp Spanish Voice Note audio...');
  audioCues.push({ frameNumber: recordedFrames, audioPath: TURN1_SPANISH_AUDIO });

  // Animate waveform bars during playback (6.06s)
  const totalWaMs = 6100;
  const updateIntervalMs = 100;
  const totalSteps = Math.floor(totalWaMs / updateIntervalMs);

  for (let s = 0; s < totalSteps; s++) {
    await sleep(updateIntervalMs);
    const ratio = s / totalSteps;
    await page.evaluate((r) => {
      if (window.setVoicePlaying) window.setVoicePlaying(true, r);
    }, ratio);
  }
  await page.evaluate(() => {
    if (window.setVoicePlaying) window.setVoicePlaying(false, 0);
  });
  await sleep(600);

  // Move touch to WhatsApp link card
  console.log('Contractor taps PoquitoTalk Walkie card in WhatsApp...');
  const cardPos = await page.evaluate(() => {
    const el = document.getElementById('walkie-link-card');
    if (!el) return { x: 197, y: 240 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  await moveTouch(cardPos.x, cardPos.y, 500);
  await sleep(250);

  audioCues.push({ frameNumber: recordedFrames, audioPath: BEEP_AUDIO });
  await page.evaluate((x, y) => {
    window.setTouchMode('tapping');
    window.spawnRipple(x, y);
  }, cardPos.x, cardPos.y);
  await sleep(200);
  await page.evaluate(() => window.setTouchMode(null));
  await sleep(1000);

  // ==========================================
  // ACT 3: CONTRACTOR OPENS ZERO-INSTALL WEB WALKIE
  // ==========================================
  console.log('🎬 ACT 3: Launching actual zero-install Web Walkie (talk.html)...');
  await page.goto(`http://localhost:${PORT_WEB}/talk.html?name=Capt.%20Jim%20(Bocas%20Marina)`, { waitUntil: 'networkidle0' });
  await page.addStyleTag({
    content: '#mic-permission-banner { display: none !important; }'
  });
  await injectVirtualTouch(page);
  await page.evaluate((x, y) => window.setTouchPos(x, y), curX, curY);

  // 1. Carlos lands on Web Walkie. Poquito visibly enters receiving mode with green acoustic halo
  console.log('Poquito in Web Walkie visibly receives & plays incoming audio from Captain Jim...');
  await page.evaluate(() => {
    setMascotState('receiving');
    const status = document.getElementById('status-text');
    if (status) {
      status.innerHTML = `
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#16A34A; animation: pulseRippleGreen 0.8s infinite;"></span>
        <span style="color: #16A34A; font-weight: 700;">Recibiendo audio en vivo de Capt. Jim...</span>
      `;
    }
  });

  audioCues.push({ frameNumber: recordedFrames, audioPath: BEEP_AUDIO });
  await sleep(2200);

  // Status transitions to ready to reply
  await page.evaluate(() => {
    setMascotState('resting');
    const status = document.getElementById('status-text');
    if (status) {
      status.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span style="color: #16A34A; font-weight: 600;">Audio recibido • Toca para responder</span>
      `;
    }
  });
  await sleep(800);

  // Contractor presses & holds PTT button at the docked HABLAR pill
  console.log('Contractor presses and holds PTT HABLAR pill (Carlos speaks Spanish)...');
  const talkBtnPos = await page.evaluate(() => {
    const pill = document.getElementById('pttPill');
    if (pill) {
      const r = pill.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    const el = document.getElementById('talk-btn');
    if (!el) return { x: 197, y: 720 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.bottom - 16 };
  });

  await moveTouch(talkBtnPos.x, talkBtnPos.y, 500);
  await sleep(200);

  audioCues.push({ frameNumber: recordedFrames, audioPath: BEEP_AUDIO });
  await page.evaluate(() => {
    window.setTouchMode('pressing');
    setMascotState('recording');
    const status = document.getElementById('status-text');
    if (status) {
      status.innerHTML = `
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#DC2626; animation: pulseRippleRed 0.8s infinite;"></span>
        <span style="color: #DC2626; font-weight: 700;">Transmitiendo en vivo • Habla ahora...</span>
      `;
    }
  });

  // Carlos speaks Spanish: "¡Buenas tardes Capitán Jim! Con mucho gusto..." (9.01s)
  audioCues.push({ frameNumber: recordedFrames, audioPath: TURN2_CONTRACTOR_AUDIO });
  await sleep(9050);

  // Contractor releases button
  console.log('Contractor releases PTT button...');
  audioCues.push({ frameNumber: recordedFrames, audioPath: BEEP_AUDIO });
  await page.evaluate(() => {
    window.setTouchMode(null);
    setMascotState('resting');
    const b2 = document.getElementById('bubble_msg_2');
    if (b2) {
      b2.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    const status = document.getElementById('status-text');
    if (status) {
      status.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span style="color: #16A34A; font-weight: 600;">¡Mensaje transmitido con éxito!</span>
      `;
    }
  });

  await sleep(2000);

  // ==========================================
  // ACT 4: EXPAT APP RECEIVES INCOMING TRANSLATION
  // ==========================================
  console.log('🎬 ACT 4: Expat App receives Carlos translated response with Live Walkie Banner...');
  const carlosPrompt = encodeURIComponent('¡Buenas tardes Capitán Jim! Con mucho gusto, mañana a las nueve de la mañana en el muelle número cuatro. Voy a llevar el alternador nuevo y las herramientas.');
  const carlosOutput = encodeURIComponent("Good afternoon Captain Jim! With pleasure, tomorrow at nine AM at dock number four. I will bring the new alternator and tools.");

  await page.goto(`http://localhost:${PORT_APP}/?onboarding=false&from=es&to=en&walkieSender=Carlos%20(Contratista)&prompt=${carlosPrompt}&output=${carlosOutput}`, { waitUntil: 'networkidle0' });
  await injectVirtualTouch(page);
  await page.evaluate((x, y) => window.setTouchPos(x, y), curX, curY);

  audioCues.push({ frameNumber: recordedFrames, audioPath: BEEP_AUDIO });
  audioCues.push({ frameNumber: recordedFrames, audioPath: TURN2_EXPAT_AUDIO });

  await sleep(8000);
  await moveTouch(197, 860, 500);
  await sleep(1500);

  // Stop screencast
  console.log('Finishing CDP screencast stream...');
  isRecording = false;
  clearInterval(frameWriter);
  await client.send('Page.stopScreencast');
  await browser.close();
  appServer.close();
  webServer.close();

  ffmpegStream.stdin.end();
  await new Promise((resolve) => ffmpegStream.on('close', resolve));
  console.log(`Raw video recorded. Total frames: ${recordedFrames}`);

  // Multiplexing Audio with FFmpeg adelay filter
  console.log('Multiplexing all synchronized audio tracks with FFmpeg adelay filter...');
  const validCues = audioCues.filter((c) => fs.existsSync(c.audioPath));

  const inputArgs = ['-y', '-i', TEMP_RAW_VIDEO];
  const filterParts = [];

  validCues.forEach((cue, idx) => {
    inputArgs.push('-i', cue.audioPath);
    const delayMs = Math.max(0, Math.round((cue.frameNumber / FPS) * 1000));
    const streamIdx = idx + 1;
    filterParts.push(`[${streamIdx}:a]adelay=${delayMs}|${delayMs}[a${idx}]`);
  });

  const mixInputs = validCues.map((_, idx) => `[a${idx}]`).join('');
  const filterComplex = `${filterParts.join(';')};${mixInputs}amix=inputs=${validCues.length}:normalize=0[aout]`;

  const finalFFmpegArgs = [
    ...inputArgs,
    '-filter_complex', filterComplex,
    '-map', '0:v',
    '-map', '[aout]',
    '-vf', 'format=yuv420p',
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-level', '4.1',
    '-preset', 'fast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-colorspace', 'bt709',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
    '-color_range', 'tv',
    '-tag:v', 'avc1',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '44100',
    '-movflags', '+faststart',
    OUTPUT_VIDEO,
  ];

  console.log('Executing FFmpeg muxing command...');
  const { spawnSync } = require('child_process');
  const result = spawnSync('/opt/homebrew/bin/ffmpeg', finalFFmpegArgs, { stdio: 'inherit' });
  if (result.error || result.status !== 0) {
    throw new Error(`FFmpeg muxing failed with code ${result.status}`);
  }

  if (fs.existsSync(TEMP_RAW_VIDEO)) {
    fs.unlinkSync(TEMP_RAW_VIDEO);
  }

  console.log(`SUCCESS! Actual App Two-Way Flow Demonstration generated at: ${OUTPUT_VIDEO}`);
  const dur = execSync(`/opt/homebrew/bin/ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${OUTPUT_VIDEO}"`).toString().trim();
  console.log(`Output video duration: ${dur} seconds`);
}

main().catch((err) => {
  console.error('Error generating actual app flow demo:', err);
  process.exit(1);
});

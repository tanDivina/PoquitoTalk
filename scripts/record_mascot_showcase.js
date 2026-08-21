#!/usr/bin/env node

/**
 * Poquito Mascot Animation Showcase Video Engine
 * Real-time CDP Screencast capturing all 8 personality states with smooth cursor interaction.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WEB_DIR = path.join(__dirname, '..', 'web-funnel');
const OUTPUT_VIDEO = path.join(__dirname, '..', 'poquito_mascot_showcase.mp4');
const TEMP_VIDEO = path.join(__dirname, '..', '.tmp_mascot_raw.mp4');
const PORT = 8119;
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
      '.svg': 'image/svg+xml',
    };

    const server = http.createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      let filePath = path.join(WEB_DIR, urlPath === '/' ? 'poquito_studio.html' : urlPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(WEB_DIR, 'poquito_studio.html');
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
      console.log(`Static server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const server = await startStaticServer();

  console.log('Launching Chrome for high-definition video capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=1200,820',
      '--hide-scrollbars',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1200,
    height: 820,
    deviceScaleFactor: 1.5, // 1800x1230 crisp HD resolution
  });

  console.log('Loading Poquito Mascot Studio...');
  await page.goto(`http://localhost:${PORT}/poquito_studio.html`, { waitUntil: 'networkidle0' });

  // Inject custom smooth pointer and continuous 30fps heartbeat
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      #virtual-cursor {
        position: fixed;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(16, 185, 129, 0.45);
        border: 2px solid #10B981;
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        transition: left 0.35s cubic-bezier(0.25, 1, 0.5, 1), top 0.35s cubic-bezier(0.25, 1, 0.5, 1), transform 0.15s ease, background 0.15s ease;
        box-shadow: 0 0 16px rgba(16, 185, 129, 0.6);
        left: 600px;
        top: 400px;
      }
      #virtual-cursor.clicking {
        transform: translate(-50%, -50%) scale(0.7);
        background: rgba(16, 185, 129, 0.95);
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

    const cur = document.createElement('div');
    cur.id = 'virtual-cursor';
    document.body.appendChild(cur);

    window.moveCursorTo = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cursor = document.getElementById('virtual-cursor');
      cursor.style.left = `${rect.left + rect.width / 2}px`;
      cursor.style.top = `${rect.top + rect.height / 2}px`;
    };

    window.clickCursor = () => {
      const cursor = document.getElementById('virtual-cursor');
      cursor.classList.add('clicking');
      setTimeout(() => cursor.classList.remove('clicking'), 180);
    };
  });

  // Start FFmpeg stream
  console.log('🎥 Starting ffmpeg real-time screencast...');
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
    TEMP_VIDEO,
  ]);

  const client = await page.target().createCDPSession();
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 95,
    everyNthFrame: 1,
  });

  client.on('Page.screencastFrame', async (frame) => {
    try {
      const buffer = Buffer.from(frame.data, 'base64');
      ffmpegStream.stdin.write(buffer);
      await client.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
    } catch (e) {}
  });

  console.log('🎬 Recording mascot animations live...');

  // State trigger helper
  async function triggerState(state, label, durationMs) {
    console.log(`- ${label}`);
    await page.evaluate((s) => window.moveCursorTo(`.btn[data-state="${s}"]`), state);
    await sleep(400);
    await page.evaluate(() => window.clickCursor());
    await page.evaluate((s) => setState(s), state);
    await sleep(durationMs);
  }

  // 1. Initial Idle Pause
  console.log('- 🌿 Initial Idle state');
  await sleep(2500);

  // 2. Pensive Thought
  await triggerState('pensive', '🤔 Pensive Thought (AI Latency Masking)', 3000);

  // 3. Listening
  await triggerState('listening', '👂 Listening Attentive Lean', 2800);

  // 4. Feather Flutter
  await triggerState('fluff', '✨ Feather Flutter Shake', 3400);

  // 5. Front View Talking
  await triggerState('talking', '🗣️ Front View Talking', 3000);

  // 6. Curious Tilt
  await triggerState('curious', '🤨 Curious "¿Qué xopa?" Tilt', 2800);

  // 7. Tropical Sway
  await triggerState('sway', '🌴 Tropical Sway Perch Groove', 3200);

  // 8. Sleepy Doze
  await triggerState('sleepy', '😴 Sleepy Chill Doze', 2600);

  // 9. Full Simulated Conversation Demo
  console.log('- 📞 Full AI Voice Conversation Demo');
  await page.evaluate(() => window.moveCursorTo('.sim-btn'));
  await sleep(400);
  await page.evaluate(() => window.clickCursor());
  await page.evaluate(() => runSim());
  await sleep(15500);

  console.log('Stopping screencast and finalizing video...');
  await client.send('Page.stopScreencast');
  ffmpegStream.stdin.end();

  await new Promise((resolve) => ffmpegStream.on('close', resolve));
  await browser.close();
  server.close();

  // Final high-quality pass with web optimization
  console.log('Optimizing final MP4 for X / Twitter...');
  const finalizeCmd = [
    '/opt/homebrew/bin/ffmpeg',
    '-y',
    `-i "${TEMP_VIDEO}"`,
    '-c:v libx264',
    '-profile:v high',
    '-level 4.2',
    '-pix_fmt yuv420p',
    '-preset medium',
    '-crf 18',
    '-movflags +faststart',
    `"${OUTPUT_VIDEO}"`,
  ].join(' ');

  execSync(finalizeCmd, { stdio: 'inherit' });

  if (fs.existsSync(TEMP_VIDEO)) {
    fs.unlinkSync(TEMP_VIDEO);
  }

  console.log(`\n🎉 High-Definition Video Created: ${OUTPUT_VIDEO}`);
}

main().catch((err) => {
  console.error('Recording error:', err);
  process.exit(1);
});

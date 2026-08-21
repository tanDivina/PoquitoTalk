#!/usr/bin/env node

/**
 * Poquito Solo Reel Video Generator
 * Captures ONLY Poquito close-up (no text, no buttons) cycling through all his states.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WEB_DIR = path.join(__dirname, '..', 'web-funnel');
const OUTPUT_VIDEO = path.join(__dirname, '..', 'poquito_solo_reel.mp4');
const TEMP_VIDEO = path.join(__dirname, '..', '.tmp_solo_raw.mp4');
const PORT = 8125;
const FPS = 30;

function startStaticServer() {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    };

    const server = http.createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      let filePath = path.join(WEB_DIR, urlPath === '/' ? 'poquito_solo_reel.html' : urlPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(WEB_DIR, 'poquito_solo_reel.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading file');
          return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
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

  console.log('Launching Chrome for clean solo mascot capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=1080,1080',
      '--hide-scrollbars',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1080,
    height: 1080,
    deviceScaleFactor: 1.0,
  });

  console.log('Loading Poquito Solo Reel...');
  await page.goto(`http://localhost:${PORT}/poquito_solo_reel.html`, { waitUntil: 'networkidle0' });

  // Start FFmpeg stream
  console.log('🎥 Starting ffmpeg screencast...');
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

  console.log('🎬 Recording Poquito states close-up...');

  // Helper to transition state
  async function showState(stateName, durationMs) {
    console.log(`- Showing: ${stateName}`);
    await page.evaluate((s) => window.setPoquitoState(s), stateName);
    await sleep(durationMs);
  }

  // 1. Idle
  await showState('idle', 2600);

  // 2. Pensive
  await showState('pensive', 2800);

  // 3. Listening
  await showState('listening', 2800);

  // 4. Curious
  await showState('curious', 2600);

  // 5. Feather Flutter
  await showState('fluff', 3200);

  // 6. Front Talking
  await showState('talking', 3000);

  // 7. Tropical Sway
  await showState('sway', 3200);

  // 8. Sleepy
  await showState('sleepy', 2600);

  // 9. Back to Idle
  await showState('idle', 2200);

  console.log('Stopping screencast...');
  await client.send('Page.stopScreencast');
  ffmpegStream.stdin.end();

  await new Promise((resolve) => ffmpegStream.on('close', resolve));
  await browser.close();
  server.close();

  // Final high-quality pass
  console.log('Compiling final clean video...');
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

  console.log(`\n🎉 Poquito Solo Video Created: ${OUTPUT_VIDEO}`);
}

main().catch((err) => {
  console.error('Recording error:', err);
  process.exit(1);
});

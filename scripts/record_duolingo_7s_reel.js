#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG_PATH = '/opt/homebrew/bin/ffmpeg';
const WEB_DIR = path.join(__dirname, '..', 'web-funnel');
const AUDIO_TRACK = path.join(__dirname, '..', 'temp_7s_audio', 'master_7s_audio.wav');
const OUTPUT_VIDEO = path.join(__dirname, '..', 'duolingo_7s_reel.mp4');
const TEMP_VIDEO = path.join(__dirname, '..', '.tmp_7s_raw.mp4');
const PORT = 8130;
const FPS = 30;
const DURATION_S = 7.0;

function startStaticServer() {
  return new Promise((resolve) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };

    const server = http.createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      let filePath = path.join(WEB_DIR, urlPath === '/' ? 'duolingo_7s_reel.html' : urlPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(WEB_DIR, 'duolingo_7s_reel.html');
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
      console.log(`📡 7s Reel Server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const server = await startStaticServer();

  console.log('🎨 Launching Chrome for 1080x1920 7s Reel capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--window-size=1080,1920',
      '--hide-scrollbars',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1080,
    height: 1920,
    deviceScaleFactor: 1.0,
  });

  console.log('📐 Loading 7s Reel HTML...');
  await page.goto(`http://localhost:${PORT}/duolingo_7s_reel.html`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  await sleep(1000);

  console.log('🎥 Starting ffmpeg raw video pipe...');
  const ffmpegStream = spawn(FFMPEG_PATH, [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', `${FPS}`,
    '-i', '-',
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

  let frameCount = 0;
  client.on('Page.screencastFrame', async (frame) => {
    try {
      const buffer = Buffer.from(frame.data, 'base64');
      ffmpegStream.stdin.write(buffer);
      frameCount++;
      await client.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
    } catch (e) {}
  });

  await sleep(DURATION_S * 1000 + 500);

  console.log(`📊 Captured ${frameCount} frames in ${DURATION_S}s`);
  console.log('🛑 Stopping screencast...');
  await client.send('Page.stopScreencast');
  ffmpegStream.stdin.end();

  await new Promise((resolve) => ffmpegStream.on('close', resolve));
  await browser.close();
  server.close();

  console.log('🎬 Muxing Video + Master 7s Audio...');
  const finalizeCmd = [
    FFMPEG_PATH,
    '-y',
    `-i "${TEMP_VIDEO}"`,
    `-i "${AUDIO_TRACK}"`,
    `-t ${DURATION_S}`,
    '-c:v libx264',
    '-profile:v high',
    '-level 4.2',
    '-pix_fmt yuv420p',
    '-preset medium',
    '-crf 18',
    '-c:a aac',
    '-b:a 192k',
    '-shortest',
    '-movflags +faststart',
    `"${OUTPUT_VIDEO}"`,
  ].join(' ');

  execSync(finalizeCmd, { stdio: 'inherit' });

  if (fs.existsSync(TEMP_VIDEO)) {
    fs.unlinkSync(TEMP_VIDEO);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🎉 7-Second Vox Retention Reel Created: ${OUTPUT_VIDEO}`);
  console.log('   Format: 1080×1920 (9:16 vertical)');
  console.log('   Audio: Voiceover Hook + Acoustic BGM + Vinyl Scratch SFX');
  console.log('   Style: Deadpan Storybook + Vector Badges (No Clipart Emojis)');
  console.log('═══════════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ Recording error:', err);
  process.exit(1);
});

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function startStaticServer(serveDir, port = 8166) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(serveDir, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const fallbackHtml = path.join(serveDir, 'index.html');
      if (fs.existsSync(fallbackHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(fallbackHtml).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve({ server, port, baseUrl: `http://localhost:${port}` });
    });
  });
}

async function captureRealScreens() {
  console.log('📦 Starting static server for real Expo dist bundle on port 8166...');
  const { server, baseUrl } = await startStaticServer(DIST_DIR, 8166);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 393,
      height: 852,
      deviceScaleFactor: 2, // 2x Retina
      isMobile: true,
      hasTouch: true,
    });

    // 1. Capture Real Screen 1: Home / Translate Screen with input & translation
    console.log('📸 1. Capturing Real App Screen: Translate Tab...');
    await page.goto(`${baseUrl}/?tab=Translate`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    // Populate actual input text in React Native TextInput
    await page.evaluate(() => {
      const textInputs = Array.from(document.querySelectorAll('textarea, input[type="text"]'));
      if (textInputs.length > 0) {
        const input = textInputs[0];
        input.value = "Hello friend, do you have a boat available to take us from Bocas Town to Isla Solarte today at 2:00 PM?";
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(800);

    const screen1Path = path.join(WORKSPACE_DIR, 'real_app_screen_1_translate.png');
    await page.screenshot({ path: screen1Path });
    console.log(`✅ Saved: ${screen1Path}`);

    // 2. Capture Real Screen 2: Walkie-Talkie Explainer Modal in the real app
    console.log('📸 2. Capturing Real App Screen: Walkie-Talkie Explainer Modal...');
    await page.goto(`${baseUrl}/?walkie=true`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const screen2Path = path.join(WORKSPACE_DIR, 'real_app_screen_2_walkie_explainer.png');
    await page.screenshot({ path: screen2Path });
    console.log(`✅ Saved: ${screen2Path}`);

    // 3. Capture Real Screen 3: Presets Tab in the real app
    console.log('📸 3. Capturing Real App Screen: Presets Tab...');
    await page.goto(`${baseUrl}/?tab=Presets`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const screen3Path = path.join(WORKSPACE_DIR, 'real_app_screen_3_presets.png');
    await page.screenshot({ path: screen3Path });
    console.log(`✅ Saved: ${screen3Path}`);

    // 4. Capture Real Screen 4: Directory Tab in the real app
    console.log('📸 4. Capturing Real App Screen: Directory Tab...');
    await page.goto(`${baseUrl}/?tab=Directory`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const screen4Path = path.join(WORKSPACE_DIR, 'real_app_screen_4_directory.png');
    await page.screenshot({ path: screen4Path });
    console.log(`✅ Saved: ${screen4Path}`);

    // 5. Capture Real Screen 5: Phone Book / Contacts in the real app
    console.log('📸 5. Capturing Real App Screen: Phone Book Tab...');
    await page.goto(`${baseUrl}/?tab=Contacts`, { waitUntil: 'networkidle0' });
    await sleep(1500);

    const screen5Path = path.join(WORKSPACE_DIR, 'real_app_screen_5_contacts.png');
    await page.screenshot({ path: screen5Path });
    console.log(`✅ Saved: ${screen5Path}`);

  } finally {
    await browser.close();
    server.close();
  }
}

captureRealScreens().catch((err) => {
  console.error('❌ Error capturing real screens:', err);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const DIST_DIR = path.join(process.cwd(), 'dist');
const WORKSPACE_DIR = process.cwd();

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

function getChromePath() {
  for (const p of CHROME_PATHS) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error('Chrome not found');
}

function startServer(port = 8097) {
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.mp3': 'audio/mpeg',
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(DIST_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const fallbackHtml = path.join(DIST_DIR, 'index.html');
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
    server.listen(port, () => resolve({ server, baseUrl: `http://localhost:${port}` }));
  });
}

async function run() {
  const { server, baseUrl } = await startServer();
  console.log(`Server listening on ${baseUrl}`);

  const browser = await puppeteer.launch({
    executablePath: getChromePath(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 393,
      height: 852,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    // 1. Step 1 Welcome Screen
    console.log('Capturing Step 1 (Welcome & Legal Notice)...');
    await page.goto(`${baseUrl}/?onboarding=true`, { waitUntil: ['load', 'networkidle2'] });
    await new Promise(r => setTimeout(r, 1200));

    const step1Path = path.join(WORKSPACE_DIR, 'onboarding_step1_before.png');
    await page.screenshot({ path: step1Path });
    console.log(`✓ Saved ${step1Path}`);

    // 2. Step 2 Name & Voice
    console.log('Navigating to Step 2...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="button"], div[tabindex="0"]'));
      const setupBtn = buttons.find(b => b.innerText && b.innerText.includes('Set Up My Voice'));
      if (setupBtn) setupBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const step2Path = path.join(WORKSPACE_DIR, 'onboarding_step2_before.png');
    await page.screenshot({ path: step2Path });
    console.log(`✓ Saved ${step2Path}`);

    // 3. Step 3 Confirmation
    console.log('Navigating to Step 3...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="button"], div[tabindex="0"]'));
      const continueBtn = buttons.find(b => b.innerText && b.innerText.includes('Continue to Final Step'));
      if (continueBtn) continueBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const step3Path = path.join(WORKSPACE_DIR, 'onboarding_step3_before.png');
    await page.screenshot({ path: step3Path });
    console.log(`✓ Saved ${step3Path}`);

    // 4. Main Home / Translate Screen
    console.log('Capturing Main Translate Screen...');
    await page.goto(`${baseUrl}/?tab=Translate`, { waitUntil: ['load', 'networkidle2'] });
    await new Promise(r => setTimeout(r, 1200));

    const homePath = path.join(WORKSPACE_DIR, 'home_screen_before.png');
    await page.screenshot({ path: homePath });
    console.log(`✓ Saved ${homePath}`);

    // 5. Presets Tab
    console.log('Capturing Presets Screen...');
    await page.goto(`${baseUrl}/?tab=Presets`, { waitUntil: ['load', 'networkidle2'] });
    await new Promise(r => setTimeout(r, 1200));

    const presetsPath = path.join(WORKSPACE_DIR, 'presets_screen_before.png');
    await page.screenshot({ path: presetsPath });
    console.log(`✓ Saved ${presetsPath}`);

    // 6. Settings Tab
    console.log('Capturing Settings Screen...');
    await page.goto(`${baseUrl}/?tab=Settings`, { waitUntil: ['load', 'networkidle2'] });
    await new Promise(r => setTimeout(r, 1200));

    const settingsPath = path.join(WORKSPACE_DIR, 'settings_screen_before.png');
    await page.screenshot({ path: settingsPath });
    console.log(`✓ Saved ${settingsPath}`);

  } finally {
    await browser.close();
    server.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const WORKSPACE_DIR = path.join(__dirname, '..');

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

function startServer(port = 8098) {
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const { server, baseUrl } = await startServer();
  const chromePath = getChromePath();

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=393,852'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  console.log('Loading Step 3 directly (?splash=false&onboarding=true&step=3&name=Dorien)...');
  await page.goto(`${baseUrl}/?splash=false&onboarding=true&step=3&name=Dorien`, { waitUntil: 'networkidle0' });
  await sleep(1500);

  // Now on Step 3
  const outPath1 = path.join(WORKSPACE_DIR, 'onboarding_step3_after.png');
  const outPath2 = path.join(WORKSPACE_DIR, 'screenshots', 'onboarding_step3_after.png');
  const brainPath = '/Users/dorienvandenabbeele/.gemini/antigravity/brain/29fda69b-1c4c-487d-bfcd-67ab5689ef0e/onboarding_step3_after.png';

  await page.screenshot({ path: outPath1, fullPage: false });
  fs.copyFileSync(outPath1, outPath2);
  fs.copyFileSync(outPath1, brainPath);

  console.log('✅ Captured Step 3 to:', outPath1);

  await browser.close();
  server.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

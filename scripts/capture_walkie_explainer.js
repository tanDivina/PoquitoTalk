const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const WORKSPACE_DIR = process.cwd();
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const OUTPUT_WALKIE_EXPLAINER = path.join(WORKSPACE_DIR, 'walkie_explainer_sheet.png');

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

function startStaticServer(port = 8102) {
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

(async () => {
  const { execSync } = require('child_process');
  console.log('Exporting web bundle...');
  execSync('npx expo export -p web', { stdio: 'inherit', cwd: WORKSPACE_DIR });

  const { server, baseUrl } = await startStaticServer(8102);

  const browser = await puppeteer.launch({
    executablePath: getChromePath(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('has_completed_onboarding', 'true');
    localStorage.setItem('has_seen_welcome_guide', 'true');
    localStorage.setItem('poquito_is_pro', 'true');
  });

  console.log('Navigating to Walkie Explainer...');
  await page.goto(`${baseUrl}/?tab=Translate&onboarding=false&splash=false&walkie=true`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2500));

  await page.screenshot({
    path: OUTPUT_WALKIE_EXPLAINER,
    type: 'png',
    fullPage: false,
  });
  console.log(`✅ Saved Explainer Modal: ${OUTPUT_WALKIE_EXPLAINER}`);

  await browser.close();
  server.close();
  process.exit(0);
})();

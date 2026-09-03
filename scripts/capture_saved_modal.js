const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const WORKSPACE_DIR = process.cwd();
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const OUTPUT_IMAGE = path.join(WORKSPACE_DIR, 'saved_phrases_sheet.png');

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

(async () => {
  console.log('1. Exporting fresh web bundle...');
  const { execSync } = require('child_process');
  execSync('npx expo export --platform web', { stdio: 'inherit' });

  console.log('2. Starting local server for saved phrases modal...');
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    let filePath = path.join(DIST_DIR, reqPath === '/' ? 'index.html' : reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }
    const ext = path.extname(filePath);
    const contentType = ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : ext === '.json' ? 'application/json' : 'text/html';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });

  await new Promise((resolve) => server.listen(8096, resolve));
  const baseUrl = 'http://localhost:8096';

  console.log('3. Launching browser to capture Saved Phrases Modal...');
  const browser = await puppeteer.launch({
    executablePath: getChromePath(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
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

  console.log(`4. Navigating to ${baseUrl}/?tab=Translate&onboarding=false&splash=false&saved=true...`);
  await page.goto(`${baseUrl}/?tab=Translate&onboarding=false&splash=false&saved=true`, { waitUntil: 'networkidle0', timeout: 30000 });

  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({
    path: OUTPUT_IMAGE,
    type: 'png',
    fullPage: false,
  });

  console.log(`✅ Saved Phrases Modal screenshot saved directly to workspace root: ${OUTPUT_IMAGE}`);

  await browser.close();
  server.close();
  process.exit(0);
})();

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const FUNNEL_DIR = path.join(WORKSPACE_DIR, 'web-funnel');
const PORT = 8112;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

function startStaticServer() {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/poquito_studio.html';
    const filePath = path.join(FUNNEL_DIR, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => resolve(server));
  });
}

async function captureFullStudioTabs() {
  const server = await startStaticServer();
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/poquito_studio.html`, { waitUntil: 'networkidle0' });

  // Full Page capture of Tab 1 (Alpha Matrix & Behavior Cards)
  await page.evaluate(() => window.showMasterTab('master-alpha-matrix'));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, 'studio_tab1_alpha_matrix_full.png'), fullPage: true });

  // Full Page capture of Tab 3 (Interactive SVG Vector Rigs)
  await page.evaluate(() => window.showMasterTab('master-svg'));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(WORKSPACE_DIR, 'studio_tab3_svg_rigs_full.png'), fullPage: true });

  await browser.close();
  server.close();
  console.log('✅ Full tab screenshots saved!');
}

captureFullStudioTabs().catch(console.error);

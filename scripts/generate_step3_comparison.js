const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const BRAIN_DIR = '/Users/dorienvandenabbeele/.gemini/antigravity/brain/29fda69b-1c4c-487d-bfcd-67ab5689ef0e';

async function generateComparison() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 960, deviceScaleFactor: 2 });

  const beforeImg = fs.readFileSync(path.join(WORKSPACE_DIR, 'onboarding_step3_before.png')).toString('base64');
  const afterImg = fs.readFileSync(path.join(WORKSPACE_DIR, 'onboarding_step3_after.png')).toString('base64');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Lexend:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #FAF8F5;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 36px 40px;
      color: #1B1C1A;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .header {
      text-align: center;
      margin-bottom: 28px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #E8F5E9;
      border: 1px solid #C8E6C9;
      color: #2E7D32;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: #1B1C1A;
      letter-spacing: -0.5px;
    }
    p.sub {
      font-size: 13.5px;
      color: #6C6255;
      margin-top: 5px;
    }
    .grid {
      display: flex;
      gap: 32px;
      justify-content: center;
      align-items: flex-start;
      max-width: 1000px;
      width: 100%;
    }
    .col {
      flex: 1;
      background: #FFFFFF;
      border: 1.5px solid #EAE5DE;
      border-radius: 24px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    }
    .col.featured {
      border-color: #FED7AA;
      background: #FFFFFF;
      box-shadow: 0 12px 32px rgba(150, 72, 36, 0.08);
    }
    .col-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 14px;
      padding: 0 4px;
    }
    .col-title {
      font-size: 13px;
      font-weight: 800;
      color: #4D463E;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .col-tag {
      font-size: 10.5px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 100px;
    }
    .tag-before {
      background: #FEE2E2;
      color: #DC2626;
      border: 1px solid #FECACA;
    }
    .tag-after {
      background: #ECFDF5;
      color: #059669;
      border: 1px solid #A7F3D0;
    }
    .device-chassis {
      width: 100%;
      max-width: 320px;
      border-radius: 36px;
      border: 6px solid #D5C8BA;
      overflow: hidden;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
      background: #FAF6EF;
    }
    .device-chassis img {
      width: 100%;
      height: auto;
      display: block;
    }
    .feature-list {
      margin-top: 16px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12px;
      color: #6C6255;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dot-green { color: #059669; font-weight: 800; }
    .dot-red { color: #DC2626; font-weight: 800; }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">ONBOARDING STEP 3 REFINEMENT</div>
    <h1>"You're All Set" & Studio Happy Dance</h1>
    <p class="sub">Header starts directly with completion greeting • Lower half features dancing & celebrating studio Poquito mascot</p>
  </div>

  <div class="grid">
    <div class="col">
      <div class="col-header">
        <span class="col-title">Previous Step 3</span>
        <span class="col-tag tag-before">Icon at Top</span>
      </div>
      <div class="device-chassis">
        <img src="data:image/png;base64,${beforeImg}" />
      </div>
      <div class="feature-list">
        <div class="feature-item"><span class="dot-red">✕</span> Mascot placed in top header icon slot</div>
        <div class="feature-item"><span class="dot-red">✕</span> Static layout composition</div>
      </div>
    </div>

    <div class="col featured">
      <div class="col-header">
        <span class="col-title">New Step 3 Flow</span>
        <span class="col-tag tag-after">★ Studio Dancing Mascot</span>
      </div>
      <div class="device-chassis">
        <img src="data:image/png;base64,${afterImg}" />
      </div>
      <div class="feature-list">
        <div class="feature-item"><span class="dot-green">✓</span> Starts cleanly with "You're All Set, [Name]!"</div>
        <div class="feature-item"><span class="dot-green">✓</span> Moving, happy dancing & celebrating studio Poquito</div>
        <div class="feature-item"><span class="dot-green">✓</span> Uncluttered composition focused on celebration</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  const outPath = path.join(WORKSPACE_DIR, 'onboarding_step3_before_after.png');
  const brainPath = path.join(BRAIN_DIR, 'onboarding_step3_before_after.png');

  await page.screenshot({ path: outPath });
  fs.copyFileSync(outPath, brainPath);

  console.log('✅ Generated Light Before/After showcase to:', outPath);

  await browser.close();
}

generateComparison().catch((e) => {
  console.error(e);
  process.exit(1);
});

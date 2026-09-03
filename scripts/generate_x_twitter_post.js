const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const http = require('http');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler');

const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const DESKTOP_DIR = '/Users/dorienvandenabbeele/Desktop';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const POQUITO_TALKIE_SVG = fs.readFileSync(path.join(WORKSPACE_DIR, 'src/assets/poquito_talkie.svg'), 'utf8');

function startStaticServer() {
  return new Promise((resolve) => {
    const serve = serveStatic(DIST_DIR, { index: ['index.html'] });
    const server = http.createServer((req, res) => {
      serve(req, res, finalhandler(req, res));
    });
    server.listen(8099, () => {
      resolve(server);
    });
  });
}

async function generateTwitterPost() {
  const server = await startStaticServer();
  console.log('🌐 Server running on port 8099');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  // 1. Capture App Screen cleanly
  const appPage = await browser.newPage();
  await appPage.setViewport({ width: 393, height: 852, deviceScaleFactor: 2.5 });
  await appPage.goto(
    'http://localhost:8099/?tab=Translate&prompt=Can%20you%20check%20the%20AC%20freon%20today%3F&output=%C2%A1Buenas!%20%C2%BFPuedes%20revisar%20el%20gas%20del%20aire%20hoy%20mismo%3F',
    { waitUntil: 'networkidle0', timeout: 30000 }
  );
  await new Promise((r) => setTimeout(r, 2200));
  const appBuffer = await appPage.screenshot({ type: 'png' });
  await appPage.close();
  const appImg = `data:image/png;base64,${appBuffer.toString('base64')}`;

  // 2. Render 1920x1080 Twitter / X Feed Banner
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1920px;
    height: 1080px;
    background: linear-gradient(135deg, #FAF7F0 0%, #F3F9F5 45%, #EAF5F1 100%);
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    overflow: hidden;
    position: relative;
  }

  /* Ambient Soft Glows */
  .glow-left {
    position: absolute;
    top: -120px;
    left: -100px;
    width: 900px;
    height: 900px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.14) 0%, transparent 70%);
    pointer-events: none;
  }
  .glow-right {
    position: absolute;
    bottom: -150px;
    right: -100px;
    width: 1100px;
    height: 1100px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 70%);
    pointer-events: none;
  }

  .container {
    position: absolute;
    inset: 0;
    padding: 60px 85px 60px 95px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Left Editorial Column */
  .left-side {
    width: 1040px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .badge-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 22px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(16, 185, 129, 0.12);
    border: 1.8px solid rgba(16, 185, 129, 0.35);
    padding: 11px 24px;
    border-radius: 100px;
    font-size: 16px;
    font-weight: 800;
    color: #059669;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }
  .badge-dot {
    width: 9px;
    height: 9px;
    background: #10B981;
    border-radius: 50%;
  }
  .badge-store {
    background: #FFF7ED;
    border: 1.8px solid rgba(234, 88, 12, 0.32);
    color: #EA580C;
  }

  h1 {
    font-family: 'Lexend', sans-serif;
    font-size: 76px;
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -2.8px;
    color: #1A1208;
    margin-bottom: 18px;
  }
  h1 em {
    color: #059669;
    font-style: normal;
  }

  .sub {
    font-size: 23px;
    font-weight: 600;
    color: #4A5E52;
    line-height: 1.45;
    max-width: 920px;
    margin-bottom: 34px;
  }

  /* 3 Feature Pills Row */
  .proof-row {
    display: flex;
    gap: 16px;
    margin-bottom: 38px;
  }
  .proof-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #FFFFFF;
    border-radius: 22px;
    padding: 16px 20px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.03);
    border: 2px solid rgba(150, 72, 36, 0.12);
  }
  .proof-icon {
    width: 48px;
    height: 48px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .proof-icon-sound { background: rgba(16, 185, 129, 0.12); border: 1.8px solid rgba(16, 185, 129, 0.28); }
  .proof-icon-heart { background: rgba(239, 68, 68, 0.10); border: 1.8px solid rgba(239, 68, 68, 0.25); }
  .proof-icon-bolt  { background: rgba(245, 158, 11, 0.12); border: 1.8px solid rgba(245, 158, 11, 0.28); }

  .proof-t {
    font-size: 20px;
    font-weight: 900;
    color: #1A1208;
    line-height: 1.15;
    letter-spacing: -0.3px;
  }
  .proof-s {
    font-size: 15.5px;
    font-weight: 700;
    color: #5C4E3A;
    margin-top: 3px;
  }

  /* Mascot & Speech Area */
  .mascot-area {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .mascot-bubble {
    position: relative;
    background: #FFFFFF;
    border-radius: 26px;
    padding: 16px 24px;
    box-shadow: 0 16px 38px rgba(0,0,0,0.12), 0 3px 10px rgba(0,0,0,0.04);
    border: 2.8px solid rgba(5, 150, 105, 0.30);
    font-size: 21px;
    font-weight: 900;
    color: #059669;
    line-height: 1.28;
    white-space: nowrap;
  }
  .mascot-bubble::before {
    content: "";
    position: absolute;
    left: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    border-right: 16px solid rgba(5, 150, 105, 0.30);
  }
  .mascot-bubble::after {
    content: "";
    position: absolute;
    left: -10px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 9px solid transparent;
    border-bottom: 9px solid transparent;
    border-right: 13px solid #FFFFFF;
  }

  /* Right Phone Stage */
  .right-side {
    position: relative;
    width: 540px;
    height: 980px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  .phone {
    position: relative;
    width: 450px;
    height: 930px;
    background: #111;
    border-radius: 56px;
    padding: 12px;
    box-shadow:
      0 45px 110px rgba(0, 0, 0, 0.28),
      0 14px 40px rgba(150, 72, 36, 0.22);
    border: 3.5px solid #222;
    transform: rotate(2deg);
  }
  .notch {
    position: absolute;
    top: 21px;
    left: 50%;
    transform: translateX(-50%);
    width: 82px;
    height: 20px;
    background: #000;
    border-radius: 12px;
    z-index: 20;
  }
  .screen {
    width: 100%;
    height: 100%;
    border-radius: 46px;
    overflow: hidden;
    background: #FAF8F5;
  }
  .screen img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Top Right Watermark */
  .watermark {
    position: absolute;
    bottom: 26px;
    right: 85px;
    font-size: 15px;
    font-weight: 700;
    color: #8C7B68;
    letter-spacing: 0.5px;
  }
</style>
</head>
<body>

<div class="glow-left"></div>
<div class="glow-right"></div>

<div class="container">
  <!-- Left Column -->
  <div class="left-side">
    <div class="badge-row">
      <div class="badge"><div class="badge-dot"></div> LOCALS PREFER VOICE NOTES</div>
      <div class="badge badge-store">🇵🇦 GOOGLE PLAY READY</div>
    </div>

    <h1>Stress-Free Translations<br><em>Into Warm Spanish</em></h1>
    <p class="sub">Speak naturally in English. Poquito creates authentic Panamanian voice notes that build genuine trust and get fast replies on WhatsApp.</p>

    <!-- 3 Features in Row -->
    <div class="proof-row">
      <div class="proof-card">
        <div class="proof-icon proof-icon-sound">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        </div>
        <div>
          <div class="proof-t">Ready-to-Tap Audio</div>
          <div class="proof-s">Voice notes for WhatsApp</div>
        </div>
      </div>

      <div class="proof-card">
        <div class="proof-icon proof-icon-heart">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </div>
        <div>
          <div class="proof-t">Authentic Panameño</div>
          <div class="proof-s">Warm & respectful tone</div>
        </div>
      </div>

      <div class="proof-card">
        <div class="proof-icon proof-icon-bolt">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div>
          <div class="proof-t">Works Offline</div>
          <div class="proof-s">Emergency presets</div>
        </div>
      </div>
    </div>

    <!-- Mascot & Speech -->
    <div class="mascot-area">
      ${POQUITO_TALKIE_SVG.replace('<svg ', '<svg width="230" height="230" style="filter:drop-shadow(0 16px 32px rgba(16,185,129,0.32));" ')}
      <div class="mascot-bubble">
        ¡Buenas tardes!<br><span style="font-size:18px;font-weight:700;color:#2D5A43;">Listo para traducir.</span>
      </div>
    </div>
  </div>

  <!-- Right Column Phone Mockup -->
  <div class="right-side">
    <div class="phone">
      <div class="notch"></div>
      <div class="screen"><img src="${appImg}"/></div>
    </div>
  </div>
</div>

<div class="watermark">poquitotalk.hero-apps.com • @DorienVibecodes</div>

</body>
</html>`;

  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));

  const outProject = path.join(WORKSPACE_DIR, 'poquitotalk_x_twitter_post.png');
  const outDesktop = path.join(DESKTOP_DIR, 'poquitotalk_x_twitter_post.png');
  const outAssets = path.join(WORKSPACE_DIR, 'play_store_final_assets/poquitotalk_x_twitter_post.png');

  await page.screenshot({ path: outProject });
  fs.copyFileSync(outProject, outDesktop);
  fs.copyFileSync(outProject, outAssets);

  await page.close();
  await browser.close();
  server.close();

  console.log('🎉 16:9 X/Twitter Banner generated successfully!');
}

generateTwitterPost().catch(console.error);

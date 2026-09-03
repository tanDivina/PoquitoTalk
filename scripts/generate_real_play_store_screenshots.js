const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const DIST_DIR = path.join(WORKSPACE_DIR, 'dist');
const PORT = 8097;

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
};

function startStaticServer() {
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
    server.listen(PORT, () => {
      console.log(`🌐 Server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function captureRealScreens() {
  const server = await startStaticServer();
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  // Target viewport for the phone capture: 393 x 852 (exact iPhone / Modern Android aspect ratio)
  const CAPTURE_W = 393;
  const CAPTURE_H = 852;

  const screens = [
    {
      tab: 'Translate',
      urlParams: 'tab=Translate&prompt=Can%20you%20check%20the%20AC%20freon%20today%3F&output=%C2%A1Buenas!%20%C2%BFPuedes%20revisar%20el%20gas%20del%20aire%20hoy%20mismo%3F',
      badge: 'LOCALS PREFER VOICE NOTES',
      title: 'Send 1-Tap WhatsApp Voice Notes',
      subtitle: 'Speak English naturally. Poquito formats and speaks warm, respectful Panama Spanish.',
      filename: 'play_store_screenshot_1_home.png',
      action: async (page) => {
        await new Promise(r => setTimeout(r, 2000));
      }
    },
    {
      tab: 'Presets',
      urlParams: 'tab=Presets',
      badge: 'GET THINGS DONE STRESS-FREE',
      title: 'Instant Audio For Island Errands',
      subtitle: 'Ready-to-go voice notes for boat taxis, power outages, drinking water, and repairs.',
      filename: 'play_store_screenshot_2_presets.png',
      action: async (page) => {
        await new Promise(r => setTimeout(r, 2000));
      }
    },
    {
      tab: 'Directory',
      urlParams: 'tab=Directory',
      badge: 'FAST ISLAND REPAIRS & SERVICES',
      title: 'Verified Island Directory',
      subtitle: 'Direct 1-tap WhatsApp to trusted Bocas del Toro mechanics, A/C techs, captains, and clinics.',
      filename: 'play_store_screenshot_3_directory.png',
      action: async (page) => {
        await new Promise(r => setTimeout(r, 2000));
      }
    },
    {
      tab: 'Translate',
      urlParams: 'tab=Translate&walkie=true',
      badge: 'WARM RESPECT FOR LOCALS',
      title: 'Understand Rapid Island Spanish',
      subtitle: 'Real-time 2-way live voice translation and 1-tap WhatsApp voice note decoding.',
      filename: 'play_store_screenshot_4_tones.png',
      action: async (page) => {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  ];

  for (let i = 0; i < screens.length; i++) {
    const s = screens[i];
    console.log(`📸 Capturing Real App Screen ${i + 1} (${s.tab})...`);

    const appPage = await browser.newPage();
    await appPage.setViewport({
      width: CAPTURE_W,
      height: CAPTURE_H,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    const url = `http://localhost:${PORT}/?${s.urlParams || ('tab=' + s.tab)}`;
    await appPage.goto(url, { waitUntil: ['load', 'networkidle2'], timeout: 20000 });

    await appPage.evaluate(() => {
      try {
        localStorage.setItem('@poquito_onboarding_completed', 'true');
        localStorage.setItem('@poquito_user_voice', 'diego');
      } catch (e) {}
    });

    await appPage.addStyleTag({
      content: `
        * { box-sizing: border-box; }
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }
      `,
    });

    if (s.action) {
      await s.action(appPage);
    }

    const tempAppShotPath = path.join(WORKSPACE_DIR, `temp_app_${i}.png`);
    await appPage.screenshot({ path: tempAppShotPath });
    await appPage.close();

    const appBase64 = `data:image/png;base64,${fs.readFileSync(tempAppShotPath).toString('base64')}`;
    fs.unlinkSync(tempAppShotPath);

    // 2. Compose into 1080x1920 Play Store Card with FULL FLOATING PHONE (No Cutoff!)
    console.log(`🖼️ Composing Play Store Screenshot: ${s.filename}...`);
    const framePage = await browser.newPage();
    await framePage.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const cardHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Lexend:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1920px;
      background-color: #FAF8F5;
      background-image: 
        radial-gradient(circle at 50% 0%, #FFF5EE 0%, #FAF8F5 45%, #F0EAE1 100%),
        radial-gradient(rgba(150, 72, 36, 0.04) 1px, transparent 1px);
      background-size: 100% 100%, 32px 32px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #0F172A;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 75px 60px 70px 60px;
      position: relative;
    }
    .header-block {
      text-align: center;
      max-width: 960px;
      z-index: 2;
    }
    .top-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.25);
      padding: 8px 22px;
      border-radius: 100px;
      font-size: 17px;
      font-weight: 800;
      color: #964824;
      letter-spacing: 1px;
      margin-bottom: 16px;
      box-shadow: 0 4px 14px rgba(150, 72, 36, 0.08);
    }
    .screenshot-title {
      font-family: 'Lexend', sans-serif;
      font-size: 52px;
      font-weight: 900;
      line-height: 1.15;
      color: #1E293B;
      margin-bottom: 14px;
      letter-spacing: -0.5px;
    }
    .screenshot-subtitle {
      font-size: 23px;
      font-weight: 500;
      color: #594F42;
      line-height: 1.4;
      max-width: 860px;
      margin: 0 auto;
    }
    .device-stage {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      flex: 1;
      margin-top: 25px;
      margin-bottom: 10px;
      z-index: 2;
    }
    /* Fully enclosed titanium chassis with zero cutoff */
    .phone-chassis {
      width: 630px;
      height: 1366px;
      background: #18191B;
      border-radius: 54px;
      padding: 12px;
      box-shadow: 
        0 30px 80px rgba(89, 79, 66, 0.25),
        0 12px 30px rgba(0, 0, 0, 0.15),
        inset 0 0 0 2px rgba(255, 255, 255, 0.12);
      border: 4px solid #2D3748;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    /* Top camera / dynamic island bar inside bezel */
    .phone-notch {
      position: absolute;
      top: 22px;
      left: 50%;
      transform: translateX(-50%);
      width: 110px;
      height: 24px;
      background: #000000;
      border-radius: 20px;
      z-index: 10;
    }
    .screen-container {
      width: 100%;
      height: 100%;
      border-radius: 44px;
      overflow: hidden;
      background: #FAF7F2;
      position: relative;
    }
    .screen-img {
      width: 100%;
      height: 100%;
      object-fit: fill;
      display: block;
    }
  </style>
</head>
<body>
  <div class="header-block">
    <div class="top-badge">${s.badge}</div>
    <h1 class="screenshot-title">${s.title}</h1>
    <p class="screenshot-subtitle">${s.subtitle}</p>
  </div>

  <div class="device-stage">
    <div class="phone-chassis">
      <div class="phone-notch"></div>
      <div class="screen-container">
        <img class="screen-img" src="${appBase64}" alt="Real App Screen" />
      </div>
    </div>
  </div>
</body>
</html>
    `;

    await framePage.setContent(cardHtml, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    const outputPath = path.join(WORKSPACE_DIR, s.filename);
    await framePage.screenshot({ path: outputPath, type: 'png' });
    const dynamicAlias = path.join(WORKSPACE_DIR, `play_store_screenshot_${i + 1}_dynamic.png`);
    fs.copyFileSync(outputPath, dynamicAlias);
    console.log(`✅ Saved Floating Screen: ${outputPath} & ${dynamicAlias}`);
    await framePage.close();
  }

  // Generate 4-in-1 Marketing Review Composite
  console.log('🎨 Composing 4-in-1 Review Image...');
  const pAll = await browser.newPage();
  await pAll.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });

  const b1 = `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'play_store_screenshot_1_dynamic.png')).toString('base64')}`;
  const b2 = `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'play_store_screenshot_2_dynamic.png')).toString('base64')}`;
  const b3 = `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'play_store_screenshot_3_dynamic.png')).toString('base64')}`;
  const b4 = `data:image/png;base64,${fs.readFileSync(path.join(WORKSPACE_DIR, 'play_store_screenshot_4_dynamic.png')).toString('base64')}`;

  const htmlAll = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Lexend:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 2400px;
      height: 1350px;
      background: radial-gradient(circle at 50% 0%, #FFF8F0 0%, #FAF8F5 50%, #EDE4D8 100%);
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 50px 70px 40px 70px;
      overflow: hidden;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid rgba(150, 72, 36, 0.12);
      padding-bottom: 20px;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 36px;
      font-weight: 900;
      color: #1E293B;
      letter-spacing: -0.5px;
    }
    .badge-dynamic {
      background: #FFDBCD;
      color: #964824;
      font-size: 15px;
      font-weight: 800;
      padding: 6px 16px;
      border-radius: 100px;
      border: 1px solid #FD9A6F;
      margin-left: 12px;
    }
    .sub {
      font-size: 18px;
      font-weight: 600;
      color: #786C5E;
      margin-top: 4px;
    }
    .stage {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 32px;
      flex: 1;
      margin: 24px 0;
    }
    .card-wrap {
      flex: 1;
      height: 100%;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(89, 79, 66, 0.18), 0 6px 16px rgba(0, 0, 0, 0.06);
      border: 2.5px solid rgba(255, 255, 255, 0.9);
      background: #FFFFFF;
    }
    .card-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1.5px solid rgba(150, 72, 36, 0.12);
      padding-top: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #5C554D;
    }
    .footer strong { color: #1E293B; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-group">
      <div>
        <div class="brand-title">PoquitoTalk <span class="badge-dynamic">Outcome-Driven Storefront Suite</span></div>
        <div class="sub">Locals Prefer Voice Notes • Stress-Free Island Errands • 2-Way Live Talk</div>
      </div>
    </div>
    <div style="font-weight: 700; color: #964824;">Google Play Store & App Store Ready (1080×1920)</div>
  </div>

  <div class="stage">
    <div class="card-wrap"><img src="${b1}" /></div>
    <div class="card-wrap"><img src="${b2}" /></div>
    <div class="card-wrap"><img src="${b3}" /></div>
    <div class="card-wrap"><img src="${b4}" /></div>
  </div>

  <div class="footer">
    <div>Emotional Relief & Cultural Respect Messaging Framework</div>
    <div>PoquitoTalk • Created by <strong>@DorienVibecodes</strong> • poquitotalk.hero-apps.com</div>
  </div>
</body>
</html>
  `;

  await pAll.setContent(htmlAll, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  await pAll.screenshot({ path: path.join(WORKSPACE_DIR, 'poquitotalk_dynamic_showcase_4up.png') });
  await pAll.close();
  console.log('✅ Generated 4-up Showcase: poquitotalk_dynamic_showcase_4up.png');

  await browser.close();
  server.close();
  console.log('🎉 All Floating Real App Screenshots Generated Successfully!');
}

captureRealScreens().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

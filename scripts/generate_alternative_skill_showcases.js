const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';

async function generateSkillVariations() {
  const img1Path = path.join(WORKSPACE_DIR, 'play_store_screenshot_1_home.png');
  const img2Path = path.join(WORKSPACE_DIR, 'play_store_screenshot_2_presets.png');
  const img3Path = path.join(WORKSPACE_DIR, 'play_store_screenshot_3_directory.png');
  const img4Path = path.join(WORKSPACE_DIR, 'play_store_screenshot_4_tones.png');

  const base64_1 = `data:image/png;base64,${fs.readFileSync(img1Path).toString('base64')}`;
  const base64_2 = `data:image/png;base64,${fs.readFileSync(img2Path).toString('base64')}`;
  const base64_3 = `data:image/png;base64,${fs.readFileSync(img3Path).toString('base64')}`;
  const base64_4 = `data:image/png;base64,${fs.readFileSync(img4Path).toString('base64')}`;

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // ==========================================
  // VARIATION A: Hyperframes 3D Isometric Staggered Perspective
  // ==========================================
  console.log('🎨 Generating Variation A: Hyperframes 3D Isometric Showcase...');
  const pageA = await browser.newPage();
  await pageA.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });

  const htmlA = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Lexend:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 2400px;
      height: 1350px;
      background: radial-gradient(circle at 75% 40%, #FFF5EA 0%, #FAF6F0 45%, #EADBCE 100%);
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 80px 100px;
      overflow: hidden;
      position: relative;
    }
    
    /* Left Info Column */
    .info-pane {
      max-width: 820px;
      z-index: 20;
    }
    .skill-tag {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.3);
      padding: 8px 20px;
      border-radius: 100px;
      font-size: 15px;
      font-weight: 800;
      color: #964824;
      letter-spacing: 1px;
      margin-bottom: 24px;
      box-shadow: 0 4px 16px rgba(150, 72, 36, 0.08);
      text-transform: uppercase;
    }
    .main-title {
      font-family: 'Lexend', sans-serif;
      font-size: 64px;
      font-weight: 900;
      line-height: 1.12;
      color: #1E293B;
      letter-spacing: -1px;
      margin-bottom: 24px;
    }
    .main-title span {
      color: #964824;
    }
    .subtext {
      font-size: 24px;
      font-weight: 500;
      color: #594F42;
      line-height: 1.5;
      margin-bottom: 40px;
    }
    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 48px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 20px;
      font-weight: 700;
      color: #2D3748;
    }
    .feature-icon {
      width: 36px;
      height: 36px;
      background: #FFDBCD;
      color: #964824;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
    }
    .author-badge {
      font-size: 18px;
      font-weight: 600;
      color: #786C5E;
    }
    .author-badge strong {
      color: #1E293B;
    }

    /* Right 3D Perspective Isometric Stage */
    .stage-3d {
      position: relative;
      width: 1200px;
      height: 1100px;
      perspective: 2000px;
      perspective-origin: 30% 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stack-container {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transform: rotateY(-26deg) rotateX(14deg) rotateZ(3deg);
    }
    .iso-card {
      position: absolute;
      width: 480px;
      height: 980px;
      border-radius: 36px;
      overflow: hidden;
      box-shadow: 
        -25px 35px 80px rgba(89, 79, 66, 0.35),
        -10px 15px 30px rgba(0, 0, 0, 0.15);
      border: 3px solid rgba(255, 255, 255, 0.9);
      background: #FFFFFF;
      transition: all 0.5s ease;
    }
    .iso-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
    .card-1 {
      top: 60px;
      left: 60px;
      z-index: 1;
      opacity: 0.85;
      transform: translateZ(-160px);
      filter: brightness(0.95);
    }
    .card-2 {
      top: 100px;
      left: 240px;
      z-index: 2;
      opacity: 0.92;
      transform: translateZ(-80px);
      filter: brightness(0.98);
    }
    .card-3 {
      top: 140px;
      left: 420px;
      z-index: 3;
      transform: translateZ(0px);
      border: 4px solid #FFFFFF;
      box-shadow: 
        -35px 45px 100px rgba(150, 72, 36, 0.3),
        -15px 20px 40px rgba(0, 0, 0, 0.2);
    }
    .card-4 {
      top: 180px;
      left: 600px;
      z-index: 4;
      transform: translateZ(80px);
    }
  </style>
</head>
<body>

  <!-- Left Info -->
  <div class="info-pane">
    <div class="skill-tag">Skill: Hyperframes 3D Isometric</div>
    <h1 class="main-title">Bocas del Toro’s <span>#1 Expat Pocket Translator</span> & Island Directory</h1>
    <p class="subtext">Speak in plain English. PoquitoTalk formats and transmits studio-grade Panamanian Spanish audio notes directly to island WhatsApp contacts in one tap.</p>
    
    <div class="feature-list">
      <div class="feature-item">
        <div class="feature-icon">✓</div>
        <span>Instant WhatsApp Voice Note Dispatch</span>
      </div>
      <div class="feature-item">
        <div class="feature-icon">✓</div>
        <span>Offline Emergency & Service Presets (Water Taxi, Power, Groceries)</span>
      </div>
      <div class="feature-item">
        <div class="feature-icon">✓</div>
        <span>Verified Island Service Providers & Direct Contractor Contacts</span>
      </div>
    </div>

    <div class="author-badge">Designed for Android • Google Play Release • By <strong>@DorienVibecodes</strong></div>
  </div>

  <!-- Right 3D Isometric Stage -->
  <div class="stage-3d">
    <div class="stack-container">
      <div class="iso-card card-1"><img src="${base64_4}" alt="Tones" /></div>
      <div class="iso-card card-2"><img src="${base64_3}" alt="Directory" /></div>
      <div class="iso-card card-3"><img src="${base64_2}" alt="Presets" /></div>
      <div class="iso-card card-4"><img src="${base64_1}" alt="Home" /></div>
    </div>
  </div>

</body>
</html>
  `;

  await pageA.setContent(htmlA, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 800));
  const outA = path.join(WORKSPACE_DIR, 'showcase_style_hyperframes_3d.png');
  await pageA.screenshot({ path: outA, type: 'png' });
  console.log(`✅ Saved Variation A: ${outA}`);
  await pageA.close();


  // ==========================================
  // VARIATION B: Before & After Showcase (Dual Device Contrast)
  // ==========================================
  console.log('🎨 Generating Variation B: Before & After Showcase...');
  const pageB = await browser.newPage();
  await pageB.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });

  const htmlB = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Lexend:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 2400px;
      height: 1350px;
      background-color: #FAF8F5;
      background-image: 
        radial-gradient(circle at 50% 10%, #FFF5EE 0%, #FAF8F5 50%, #EDE6DC 100%),
        radial-gradient(rgba(150, 72, 36, 0.05) 1.5px, transparent 1.5px);
      background-size: 100% 100%, 36px 36px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 100px 50px 100px;
      overflow: hidden;
    }
    .header {
      text-align: center;
      max-width: 1400px;
      margin: 0 auto;
    }
    .skill-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.3);
      padding: 8px 22px;
      border-radius: 100px;
      font-size: 15px;
      font-weight: 800;
      color: #964824;
      letter-spacing: 1.2px;
      margin-bottom: 16px;
      text-transform: uppercase;
    }
    .title {
      font-family: 'Lexend', sans-serif;
      font-size: 56px;
      font-weight: 900;
      color: #1E293B;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
    }
    .subtitle {
      font-size: 22px;
      font-weight: 500;
      color: #594F42;
    }

    /* Comparison Stage */
    .compare-stage {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 80px;
      margin: 20px 0;
    }
    .device-card {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .pill-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 24px;
      border-radius: 100px;
      font-size: 17px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
    }
    .pill-status.before {
      background: #FEE2E2;
      color: #991B1B;
      border: 1.5px solid #FCA5A5;
    }
    .pill-status.after {
      background: #DCFCE7;
      color: #166534;
      border: 1.5px solid #86EFAC;
    }
    .phone-box {
      width: 480px;
      height: 850px;
      border-radius: 32px;
      overflow: hidden;
      box-shadow: 0 30px 70px rgba(89, 79, 66, 0.22);
      border: 3px solid #FFFFFF;
      background: #FFFFFF;
    }
    .phone-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
    
    .vs-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .vs-circle {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: #964824;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Lexend', sans-serif;
      font-size: 24px;
      font-weight: 900;
      box-shadow: 0 10px 25px rgba(150, 72, 36, 0.35);
    }

    .footer {
      display: flex;
      justify-content: space-between;
      border-top: 1.5px solid rgba(150, 72, 36, 0.12);
      padding-top: 20px;
      font-size: 17px;
      font-weight: 600;
      color: #5C554D;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="skill-badge">Skill: Before & After Visual Comparison</div>
    <h1 class="title">From Stiff Robot Spanish to Authentic Panama Voice Notes</h1>
    <p class="subtitle">See the difference between generic textbook tools and PoquitoTalk’s verified Bocas del Toro ecosystem.</p>
  </div>

  <div class="compare-stage">
    <!-- Before -->
    <div class="device-card">
      <div class="pill-status before">❌ General Translation Tools</div>
      <div class="phone-box">
        <img src="${base64_1}" alt="Before State" />
      </div>
    </div>

    <div class="vs-divider">
      <div class="vs-circle">VS</div>
    </div>

    <!-- After -->
    <div class="device-card">
      <div class="pill-status after">✓ PoquitoTalk 1-Tap Voice Dispatch</div>
      <div class="phone-box">
        <img src="${base64_2}" alt="After State" />
      </div>
    </div>
  </div>

  <div class="footer">
    <div>PoquitoTalk • Island Expat Audio Companion</div>
    <div>Created by <strong>@DorienVibecodes</strong> • poquitotalk.hero-apps.com</div>
  </div>

</body>
</html>
  `;

  await pageB.setContent(htmlB, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 800));
  const outB = path.join(WORKSPACE_DIR, 'showcase_style_before_after.png');
  await pageB.screenshot({ path: outB, type: 'png' });
  console.log(`✅ Saved Variation B: ${outB}`);
  await pageB.close();


  // ==========================================
  // VARIATION C: Dark Luxury Glassmorphism (Hero-Apps Style Guide)
  // ==========================================
  console.log('🎨 Generating Variation C: Hero-Apps Dark Glassmorphic Showcase...');
  const pageC = await browser.newPage();
  await pageC.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });

  const htmlC = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Lexend:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 2400px;
      height: 1350px;
      background-color: #050507;
      background-image: 
        radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15) 0%, rgba(5, 5, 7, 0.95) 60%),
        radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 100% 100%, 32px 32px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #F8FAFC;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 80px 50px 80px;
      overflow: hidden;
      position: relative;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 24px;
      z-index: 10;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .parrot-logo {
      width: 64px;
      height: 64px;
      border-radius: 18px;
      background: #0C0C0F;
      padding: 8px;
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 38px;
      font-weight: 900;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .country-badge {
      background: rgba(16, 185, 129, 0.15);
      color: #34D399;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 16px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 100px;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }
    .brand-subtitle {
      font-size: 18px;
      font-weight: 500;
      color: #94A3B8;
      margin-top: 4px;
    }
    .skill-tag {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #38BDF8;
      font-weight: 800;
      font-size: 15px;
      padding: 10px 20px;
      border-radius: 100px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* 4 Dark Glass Cards */
    .showcase-stage {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 36px;
      flex: 1;
      margin: 30px 0;
      z-index: 10;
    }
    .card-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }
    .col-label {
      font-family: 'Lexend', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: #34D399;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(52, 211, 153, 0.3);
      padding: 6px 16px;
      border-radius: 100px;
      letter-spacing: 1.2px;
      margin-bottom: 16px;
      text-transform: uppercase;
    }
    .screenshot-frame {
      width: 100%;
      height: 940px;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 
        0 25px 60px rgba(0, 0, 0, 0.8),
        0 0 40px rgba(16, 185, 129, 0.1);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      background: #0C0C0F;
    }
    .screenshot-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 20px;
      font-size: 17px;
      font-weight: 600;
      color: #64748B;
      z-index: 10;
    }
    .footer strong {
      color: #F8FAFC;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="brand-group">
      <svg class="parrot-logo" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="#0C0C0F" />
        <path d="M50 20C35 20 25 32 25 48C25 64 35 78 50 78C60 78 68 72 73 63C75 59 75 53 72 49L66 43C62 38 60 30 50 20Z" fill="#10B981"/>
        <path d="M66 43L78 46C82 47 84 52 80 55L73 63C68 72 60 78 50 78V65C58 65 64 58 66 43Z" fill="#F59E0B"/>
        <circle cx="42" cy="38" r="5" fill="#FFFFFF"/>
      </svg>
      <div>
        <div class="brand-title">PoquitoTalk <span class="country-badge">Panamá 🇵🇦</span></div>
        <div class="brand-subtitle">Instant Panama Spanish Voice Notes & Verified Bocas del Toro Directory</div>
      </div>
    </div>
    <div class="skill-tag">Skill: Hero-Apps Dark Glassmorphism</div>
  </div>

  <div class="showcase-stage">
    <div class="card-col">
      <div class="col-label">1 • 1-Tap Dispatch</div>
      <div class="screenshot-frame"><img src="${base64_1}" alt="Home" /></div>
    </div>
    <div class="card-col">
      <div class="col-label">2 • Offline Presets</div>
      <div class="screenshot-frame"><img src="${base64_2}" alt="Presets" /></div>
    </div>
    <div class="card-col">
      <div class="col-label">3 • Island Directory</div>
      <div class="screenshot-frame"><img src="${base64_3}" alt="Directory" /></div>
    </div>
    <div class="card-col">
      <div class="col-label">4 • Dialect Tones</div>
      <div class="screenshot-frame"><img src="${base64_4}" alt="Tones" /></div>
    </div>
  </div>

  <div class="footer">
    <div>Hero-Apps Design System • Dark Glassmorphism</div>
    <div>Built by <strong>@DorienVibecodes</strong> • poquitotalk.hero-apps.com</div>
  </div>

</body>
</html>
  `;

  await pageC.setContent(htmlC, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 800));
  const outC = path.join(WORKSPACE_DIR, 'showcase_style_hero_apps_dark.png');
  await pageC.screenshot({ path: outC, type: 'png' });
  console.log(`✅ Saved Variation C: ${outC}`);
  await pageC.close();

  await browser.close();
  console.log('🎉 All Skill Variations Generated Successfully!');
}

generateSkillVariations().catch(err => {
  console.error('❌ Error generating skill variations:', err);
  process.exit(1);
});

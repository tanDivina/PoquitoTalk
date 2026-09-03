const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

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

async function renderSplashConcepts() {
  const browser = await puppeteer.launch({
    executablePath: getChromePath(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const logoSvg = `
    <svg width="120" height="120" viewBox="0 0 200 200" fill="none">
      <path d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z" fill="none" stroke="#25D366" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M 62 161 Q 86 159 112 161" stroke="#B45309" stroke-width="6" stroke-linecap="round" />
      <path d="M 74 152 C 72 158 74 164 78 164 M 80 152 C 78 158 80 164 84 164 M 91 152 C 89 158 91 164 95 164 M 97 152 C 95 158 97 164 101 164" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
      <path d="M 62 152 C 55 138 52 122 55 105 C 58 78 72 55 92 55 C 108 55 116 70 114 85 C 112 102 114 128 110 142 C 102 155 82 160 62 152 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" />
      <path d="M 58 112 C 62 98 76 92 86 108 C 92 122 86 145 70 148 C 62 140 57 126 58 112 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" />
      <circle cx="95" cy="74" r="8" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
      <circle cx="93.5" cy="74" r="4" fill="#0F172A" />
      <circle cx="92" cy="72" r="1.5" fill="#FFFFFF" />
      <path d="M 110 70 C 124 70 130 82 118 94 C 113 98 106 94 108 88 C 110 82 108 74 110 70 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
      <path d="M 114 84 C 120 86 119 92 112.4 92 C 113.2 88 113.6 86 114 84 Z" fill="#EF4444" />
      <path class="soundwave wave-1" d="M 130 73 A 12 12 0 0 1 130 93" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
      <path class="soundwave wave-2" d="M 140 66 A 19 19 0 0 1 140 100" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
      <path class="soundwave wave-3" d="M 150 60 A 25 25 0 0 1 150 106" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" opacity="0.8" />
    </svg>
  `;

  // Phone 1: Option A - Pure Clean Animated Brand Splash
  const splashOptionAHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 393px;
        height: 852px;
        background-color: #FBF9F5;
        background-image: 
          radial-gradient(circle at 50% 30%, #FFF5EE 0%, #FBF9F5 55%, #F5F1EB 100%),
          radial-gradient(rgba(150, 72, 36, 0.04) 1px, transparent 1px);
        background-size: 100% 100%, 24px 24px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 60px 28px 48px;
        position: relative;
        overflow: hidden;
      }
      .ambient-glow {
        position: absolute;
        width: 320px;
        height: 320px;
        background: radial-gradient(circle, rgba(253, 154, 111, 0.22) 0%, rgba(251, 249, 245, 0) 70%);
        top: 25%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        filter: blur(30px);
      }
      .center-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 140px;
        z-index: 2;
      }
      .logo-wrapper {
        width: 140px;
        height: 140px;
        background: #FFFFFF;
        border-radius: 40px;
        border: 2px solid #E4E2DE;
        box-shadow: 0 16px 36px rgba(150, 72, 36, 0.12), 0 4px 12px rgba(0,0,0,0.04);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 28px;
        position: relative;
      }
      .brand-title {
        font-family: 'Lexend', sans-serif;
        font-size: 34px;
        font-weight: 900;
        color: #1B1C1A;
        letter-spacing: -0.6px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .panama-pill {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 13px;
        font-weight: 800;
        color: #964824;
        background: #FFDBCD;
        padding: 5px 12px;
        border-radius: 100px;
        border: 1px solid #FD9A6F;
        margin-top: 8px;
      }
      .tagline {
        font-size: 15px;
        font-weight: 600;
        color: #594F42;
        text-align: center;
        margin-top: 14px;
        max-width: 280px;
        line-height: 1.45;
      }
      .footer-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        z-index: 2;
      }
      .loading-dots {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #FD9A6F;
      }
      .dot:nth-child(2) { background: #964824; }
      .dot:nth-child(3) { background: #10B981; }
      .footer-sub {
        font-size: 12px;
        font-weight: 700;
        color: #8C8276;
        letter-spacing: 0.5px;
      }
    </style>
  </head>
  <body>
    <div class="ambient-glow"></div>
    <div></div>
    <div class="center-content">
      <div class="logo-wrapper">
        ${logoSvg}
      </div>
      <div class="brand-title">PoquitoTalk</div>
      <div class="panama-pill">Panamá 🇵🇦</div>
      <div class="tagline">Instant Spanish Voice Notes for Expats & Travelers</div>
    </div>

    <div class="footer-section">
      <div class="loading-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <div class="footer-sub">Connecting with WhatsApp & Local Dialect</div>
    </div>
  </body>
  </html>
  `;

  // Phone 2: Option B - Splash with Instant Value / Feature Highlights
  const splashOptionBHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: 393px;
        height: 852px;
        background-color: #FBF9F5;
        background-image: 
          radial-gradient(circle at 50% 25%, #FFF5EE 0%, #FBF9F5 55%, #F5F1EB 100%),
          radial-gradient(rgba(150, 72, 36, 0.04) 1px, transparent 1px);
        background-size: 100% 100%, 24px 24px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 56px 24px 44px;
        position: relative;
        overflow: hidden;
      }
      .ambient-glow {
        position: absolute;
        width: 320px;
        height: 320px;
        background: radial-gradient(circle, rgba(253, 154, 111, 0.2) 0%, rgba(251, 249, 245, 0) 70%);
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        filter: blur(30px);
      }
      .top-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 32px;
        z-index: 2;
      }
      .logo-wrapper {
        width: 110px;
        height: 110px;
        background: #FFFFFF;
        border-radius: 34px;
        border: 2px solid #E4E2DE;
        box-shadow: 0 16px 36px rgba(150, 72, 36, 0.12), 0 4px 12px rgba(0,0,0,0.04);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }
      .brand-title {
        font-family: 'Lexend', sans-serif;
        font-size: 28px;
        font-weight: 900;
        color: #1B1C1A;
        letter-spacing: -0.5px;
      }
      .panama-pill {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 12px;
        font-weight: 800;
        color: #964824;
        background: #FFDBCD;
        padding: 4px 10px;
        border-radius: 100px;
        border: 1px solid #FD9A6F;
        margin-top: 6px;
      }
      .features-card {
        width: 100%;
        background: #FFFFFF;
        border: 1.5px solid #E4E2DE;
        border-radius: 24px;
        padding: 18px 20px;
        box-shadow: 0 8px 24px rgba(89, 79, 66, 0.06);
        display: flex;
        flex-direction: column;
        gap: 14px;
        z-index: 2;
      }
      .feature-row {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .feature-icon-box {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 17px;
        flex-shrink: 0;
      }
      .box-green { background: #D5E8D1; color: #2E402D; border: 1px solid #82B37A; }
      .box-coral { background: #FFDBCD; color: #964824; border: 1px solid #FD9A6F; }
      .box-blue { background: #CFFAFE; color: #0E7490; border: 1px solid #67E8F9; }
      .feature-text { display: flex; flex-direction: column; }
      .feature-title { font-family: 'Lexend', sans-serif; font-size: 14px; font-weight: 700; color: #1B1C1A; }
      .feature-sub { font-size: 12px; font-weight: 600; color: #594F42; }
      .bottom-bar {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        z-index: 2;
      }
      .loading-dots { display: flex; gap: 8px; }
      .dot { width: 8px; height: 8px; border-radius: 50%; background: #964824; }
      .status-label { font-size: 12px; font-weight: 700; color: #8C8276; }
    </style>
  </head>
  <body>
    <div class="ambient-glow"></div>
    <div class="top-content">
      <div class="logo-wrapper">
        ${logoSvg}
      </div>
      <div class="brand-title">PoquitoTalk</div>
      <div class="panama-pill">Panamá 🇵🇦</div>
    </div>

    <div class="features-card">
      <div class="feature-row">
        <div class="feature-icon-box box-green">🎙️</div>
        <div class="feature-text">
          <span class="feature-title">Natural Spanish Voice Notes</span>
          <span class="feature-sub">Speaks clearly in your chosen voice</span>
        </div>
      </div>
      <div class="feature-row">
        <div class="feature-icon-box box-coral">⚡</div>
        <div class="feature-text">
          <span class="feature-title">1-Tap Direct to WhatsApp</span>
          <span class="feature-sub">No awkward copy-pasting required</span>
        </div>
      </div>
      <div class="feature-row">
        <div class="feature-icon-box box-blue">🌴</div>
        <div class="feature-text">
          <span class="feature-title">Bocas & Panama Tuned</span>
          <span class="feature-sub">Local vocabulary for boats, power & repairs</span>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="loading-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <span class="status-label">Loading Panama Dialect Engine...</span>
    </div>
  </body>
  </html>
  `;

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  
  await page.setContent(splashOptionAHtml, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  const optAPath = path.join(process.cwd(), 'splash_concept_a_clean.png');
  await page.screenshot({ path: optAPath, fullPage: false });
  console.log('✓ Saved ' + optAPath);

  await page.setContent(splashOptionBHtml, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  const optBPath = path.join(process.cwd(), 'splash_concept_b_features.png');
  await page.screenshot({ path: optBPath, fullPage: false });
  console.log('✓ Saved ' + optBPath);

  // Showcase Comparison Card
  const optABase64 = fs.readFileSync(optAPath).toString('base64');
  const optBBase64 = fs.readFileSync(optBPath).toString('base64');
  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const showcaseHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        background-color: #FBF9F5;
        background-image: 
          radial-gradient(circle at 50% 0%, #FFF5EE 0%, #FBF9F5 45%, #F5F1EB 100%),
          radial-gradient(rgba(150, 72, 36, 0.04) 1px, transparent 1px);
        background-size: 100% 100%, 28px 28px;
        color: #1B1C1A;
        width: 1600px;
        height: 1050px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 40px 64px;
        overflow: hidden;
        position: relative;
      }
      .background-orb-top {
        position: absolute;
        width: 650px;
        height: 650px;
        background: radial-gradient(circle, rgba(253, 154, 111, 0.16) 0%, rgba(251, 249, 245, 0) 70%);
        top: -160px;
        right: -80px;
        pointer-events: none;
        filter: blur(20px);
      }
      .background-orb-bottom {
        position: absolute;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(213, 232, 209, 0.22) 0%, rgba(251, 249, 245, 0) 70%);
        bottom: -160px;
        left: -80px;
        pointer-events: none;
        filter: blur(20px);
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 10;
        border-bottom: 1px solid #E4E2DE;
        padding-bottom: 18px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .brand-logo-svg {
        width: 58px;
        height: 58px;
        flex-shrink: 0;
        filter: drop-shadow(0 4px 12px rgba(37, 211, 102, 0.2));
      }
      .brand-title {
        font-family: 'Lexend', sans-serif;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.4px;
        color: #1B1C1A;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .panama-badge {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 12px;
        font-weight: 700;
        color: #964824;
        background: #FFDBCD;
        padding: 4px 10px;
        border-radius: 100px;
        letter-spacing: 0.2px;
        border: 1px solid #FD9A6F;
      }
      .brand-subtitle {
        font-size: 14px;
        font-weight: 600;
        color: #594F42;
        margin-top: 2px;
      }
      .feature-title-pill {
        background: #FFFFFF;
        border: 1px solid #E4E2DE;
        padding: 8px 18px;
        border-radius: 100px;
        font-family: 'Lexend', sans-serif;
        font-size: 14px;
        font-weight: 700;
        color: #964824;
        box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      }
      .comparison-container {
        display: flex;
        gap: 64px;
        justify-content: center;
        align-items: center;
        flex: 1;
        margin: 16px 0;
        position: relative;
        z-index: 10;
      }
      .column {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .tag {
        font-family: 'Lexend', sans-serif;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        padding: 6px 18px;
        border-radius: 100px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      }
      .tag-a {
        background: #D5E8D1;
        color: #2E402D;
        border: 1.5px solid #82B37A;
      }
      .tag-b {
        background: #FFDBCD;
        color: #964824;
        border: 1.5px solid #FD9A6F;
      }
      .phone-frame {
        width: 360px;
        height: 760px;
        background: #18191B;
        border-radius: 44px;
        padding: 10px;
        box-shadow: 0 25px 60px rgba(89, 79, 66, 0.16), 0 8px 20px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.12);
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
      }
      .phone-frame.a {
        border: 2.5px solid #82B37A;
        box-shadow: 0 30px 70px rgba(46, 64, 45, 0.18), 0 8px 24px rgba(0,0,0,0.08);
      }
      .phone-frame.b {
        border: 2.5px solid #FD9A6F;
        box-shadow: 0 30px 70px rgba(150, 72, 36, 0.18), 0 8px 24px rgba(0,0,0,0.08);
      }
      .phone-screen {
        width: 100%;
        height: 100%;
        border-radius: 34px;
        overflow: hidden;
        background: #FAF7F2;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .phone-screen img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
      }
      .vs-divider {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #807264;
      }
      .vs-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #FFFFFF;
        border: 1.5px solid #E4E2DE;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Lexend', sans-serif;
        font-size: 16px;
        font-weight: 800;
        color: #964824;
        box-shadow: 0 6px 18px rgba(150, 72, 36, 0.1);
      }
      .caption {
        font-size: 14px;
        font-weight: 700;
        color: #594F42;
        text-align: center;
      }
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #E4E2DE;
        padding-top: 16px;
        font-size: 13px;
        color: #5C554D;
        position: relative;
        z-index: 10;
      }
      .footer-left {
        display: flex;
        gap: 22px;
      }
      .highlight {
        color: #1B1C1A;
        font-weight: 700;
      }
      .brand-link {
        color: #964824;
        font-weight: 700;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="background-orb-top"></div>
    <div class="background-orb-bottom"></div>
    
    <div class="header">
      <div class="brand">
        <svg class="brand-logo-svg" viewBox="0 0 200 200" fill="none">
          <path d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z" fill="none" stroke="#25D366" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M 62 161 Q 86 159 112 161" stroke="#B45309" stroke-width="6" stroke-linecap="round" />
          <path d="M 74 152 C 72 158 74 164 78 164 M 80 152 C 78 158 80 164 84 164 M 91 152 C 89 158 91 164 95 164 M 97 152 C 95 158 97 164 101 164" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
          <path d="M 62 152 C 55 138 52 122 55 105 C 58 78 72 55 92 55 C 108 55 116 70 114 85 C 112 102 114 128 110 142 C 102 155 82 160 62 152 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" />
          <path d="M 58 112 C 62 98 76 92 86 108 C 92 122 86 145 70 148 C 62 140 57 126 58 112 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" />
          <circle cx="95" cy="74" r="8" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
          <circle cx="93.5" cy="74" r="4" fill="#0F172A" />
          <circle cx="92" cy="72" r="1.5" fill="#FFFFFF" />
          <path d="M 110 70 C 124 70 130 82 118 94 C 113 98 106 94 108 88 C 110 82 108 74 110 70 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
          <path d="M 114 84 C 120 86 119 92 112.4 92 C 113.2 88 113.6 86 114 84 Z" fill="#EF4444" />
          <path d="M 130 73 A 12 12 0 0 1 130 93" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
          <path d="M 140 66 A 19 19 0 0 1 140 100" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
          <path d="M 150 60 A 25 25 0 0 1 150 106" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" opacity="0.8" />
        </svg>
        <div>
          <div class="brand-title">
            PoquitoTalk
            <span class="panama-badge">Panamá 🇵🇦</span>
          </div>
          <div class="brand-subtitle">Instant Spanish Voice Notes for Expats & Travelers</div>
        </div>
      </div>
      <div class="feature-title-pill">Splash Screen Design Exploration</div>
    </div>

    <div class="comparison-container">
      <div class="column">
        <div class="tag tag-a">● OPTION A &bull; PURE ANIMATED BRAND (RECOMMENDED)</div>
        <div class="phone-frame a">
          <div class="phone-screen">
            <img src="data:image/png;base64,${optABase64}" alt="Option A Pure Brand Splash" />
          </div>
        </div>
        <span class="caption">Clean Mascot Speech Bubble + Soundwaves + Tagline</span>
      </div>

      <div class="vs-divider">
        <div class="vs-icon">VS</div>
        <span style="font-family: 'Lexend'; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #807264;">EXPLORE</span>
      </div>

      <div class="column">
        <div class="tag tag-b">● OPTION B &bull; FEATURE-HIGHLIGHTED SPLASH</div>
        <div class="phone-frame b">
          <div class="phone-screen">
            <img src="data:image/png;base64,${optBBase64}" alt="Option B Feature Splash" />
          </div>
        </div>
        <span class="caption">Logo + 3 Instant Value Cards + Loading Status</span>
      </div>
    </div>

    <div class="footer">
      <div class="footer-left">
        <span>Exploration: <strong class="highlight">Splash / Launch Screen Architecture</strong></span>
        <span>Palette: <strong class="highlight">Warm Linen, Panama Terracotta & WhatsApp Green</strong></span>
      </div>
      <div>
        <span>Created by <strong class="highlight">@DorienVibecodes</strong> • <span class="brand-link">poquitotalk.hero-apps.com</span></span>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });
  await page.setContent(showcaseHtml, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));
  const cardPath = path.join(process.cwd(), 'splash_screen_options_showcase.png');
  await page.screenshot({ path: cardPath, fullPage: false });
  console.log('✓ Saved ' + cardPath);

  await browser.close();
}

renderSplashConcepts().catch(err => {
  console.error(err);
  process.exit(1);
});

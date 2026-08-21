const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');
const WORKSPACE_DIR = process.cwd();
const ARTIFACTS_DIR = '/Users/dorienvandenabbeele/.gemini/antigravity/brain/3d69dfac-9be7-467b-9b59-e92f4a5582c0';

async function generateWebsiteDesktopComparison() {
  console.log('🚀 Generating Desktop Website Before & After Comparison Showcase...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1080, deviceScaleFactor: 2 });

  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
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
      height: 1080px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 32px 56px;
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
      padding-bottom: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo-svg {
      width: 54px;
      height: 54px;
      flex-shrink: 0;
      filter: drop-shadow(0 4px 12px rgba(37, 211, 102, 0.2));
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: #1B1C1A;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .panama-badge {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11.5px;
      font-weight: 700;
      color: #964824;
      background: #FFDBCD;
      padding: 3px 10px;
      border-radius: 100px;
      letter-spacing: 0.2px;
      border: 1px solid #FD9A6F;
    }
    .header-right-title {
      text-align: right;
    }
    .header-title-text {
      font-family: 'Lexend', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #1B1C1A;
    }
    .header-sub-text {
      font-size: 13px;
      color: #64748B;
      margin-top: 2px;
    }

    /* Comparison Dual Browser Grid */
    .comparison-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 36px;
      flex: 1;
      margin: 16px 0;
      position: relative;
      z-index: 10;
    }
    .column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .tag {
      font-family: 'Lexend', sans-serif;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 5px 16px;
      border-radius: 100px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .tag-before {
      background: #FEE2E2;
      color: #B91C1C;
      border: 1.5px solid #FCA5A5;
    }
    .tag-after {
      background: #D1FAE5;
      color: #065F46;
      border: 1.5px solid #6EE7B7;
    }

    /* Desktop macOS Browser Window Frame */
    .browser-frame {
      width: 100%;
      background: #FFFFFF;
      border-radius: 18px;
      border: 1.5px solid #E2E8F0;
      box-shadow: 0 16px 40px rgba(89, 79, 66, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      flex: 1;
    }
    .browser-frame.after-frame {
      border-color: #10B981;
      box-shadow: 0 18px 48px rgba(16, 185, 129, 0.18), 0 4px 14px rgba(0, 0, 0, 0.06);
    }
    .browser-titlebar {
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .traffic-dots {
      display: flex;
      gap: 6px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-red { background: #FF5F56; }
    .dot-yellow { background: #FFBD2E; }
    .dot-green { background: #27C93F; }
    .address-bar {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 3px 12px;
      font-size: 11px;
      color: #475569;
      font-family: monospace;
      flex: 1;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Browser Body Content: The Interactive Card Section */
    .browser-content {
      padding: 20px 24px;
      background: #FAF8F5;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }

    .card-panel-mock {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 20px;
      border: 1.5px solid #E6E0D6;
      box-shadow: 0 8px 24px rgba(0,0,0,0.04);
      position: relative;
    }
    .card-heading {
      font-size: 16px;
      font-weight: 800;
      color: #1F1B18;
      margin-bottom: 4px;
    }
    .card-subheading {
      font-size: 11.5px;
      color: #64748B;
      margin-bottom: 14px;
    }

    /* Presets Pills */
    .presets-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .p-pill {
      background: #F4EFEB;
      color: #5C554D;
      border-radius: 100px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      border: 1px solid #E6E0D6;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .p-pill.active {
      background: #8A3E1B;
      color: #FFFFFF;
      border-color: #8A3E1B;
    }

    /* Input area */
    .input-box {
      background: #FAF8F5;
      border: 1.5px solid #E6E0D6;
      border-radius: 12px;
      padding: 10px 12px;
      font-size: 12px;
      color: #2D2721;
      margin-bottom: 12px;
      font-family: inherit;
    }
    .input-label {
      font-size: 10px;
      font-weight: 800;
      color: #807264;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Output Box */
    .result-box-mock {
      background: #FAF8F5;
      border: 1.5px solid #E8DCD5;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .result-text-mock {
      font-size: 13px;
      font-weight: 600;
      color: #1F1B18;
      line-height: 1.45;
      margin-bottom: 10px;
    }
    .actions-row {
      display: flex;
      gap: 8px;
    }
    .btn-audio {
      background: #8A3E1B;
      color: #FFFFFF;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 11.5px;
      font-weight: 700;
      border: none;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-wa {
      background: #25D366;
      color: #FFFFFF;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 11.5px;
      font-weight: 700;
      border: none;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* BEFORE Specific: Spaced buttons & Walkie badge */
    .before-tone-row {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
    }
    .btn-tone-old {
      background: #F4EFEB;
      border: 1px solid #E6E0D6;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 700;
      color: #5C554D;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-tone-old.active {
      background: #8A3E1B;
      color: #FFFFFF;
      border-color: #8A3E1B;
    }
    .old-tooltip {
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 11px;
      color: #94A3B8;
      margin-top: 6px;
      line-height: 1.4;
    }
    .old-tooltip strong { color: #38BDF8; font-weight: 700; }

    /* AFTER Specific: Perched Mascot & Segmented Slider */
    .after-perched-mascot {
      position: absolute;
      top: -34px;
      right: 18px;
      width: 72px;
      height: 72px;
    }
    .segmented-switch {
      display: inline-flex;
      background: #EFE9E1;
      border-radius: 100px;
      padding: 3px;
      border: 1px solid #E0D7CC;
      margin-bottom: 12px;
    }
    .seg-button {
      padding: 5px 14px;
      border-radius: 100px;
      font-size: 11.5px;
      font-weight: 700;
      color: #5C554D;
      display: flex;
      align-items: center;
      gap: 5px;
      background: transparent;
      border: none;
    }
    .seg-button.active {
      background: #FFFFFF;
      color: #8A3E1B;
      font-weight: 800;
      box-shadow: 0 2px 6px rgba(138, 62, 27, 0.15);
    }
    .new-tooltip {
      background: #FFFFFF;
      border: 1.5px solid #D0C9BD;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 11.5px;
      color: #000000;
      font-weight: 600;
      margin-top: 6px;
      line-height: 1.45;
      box-shadow: 0 4px 14px rgba(0,0,0,0.06);
    }
    .new-tooltip em { color: #8A3E1B; font-weight: 800; font-style: normal; }

    .notes-box {
      font-size: 11.5px;
      color: #5C554D;
      text-align: center;
      max-width: 600px;
      line-height: 1.4;
      margin-top: 2px;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #E4E2DE;
      padding-top: 14px;
      font-size: 12.5px;
      color: #5C554D;
      position: relative;
      z-index: 10;
    }
    .footer-left {
      display: flex;
      gap: 20px;
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
          <span class="panama-badge">Bocas del Toro 🇵🇦</span>
        </div>
        <div style="font-size: 13.5px; color: #594F42; margin-top: 2px;">Marketing Web Funnel & Live Voice Note Generator</div>
      </div>
    </div>

    <div class="header-right-title">
      <div class="header-title-text">Website Live Demo Section</div>
      <div class="header-sub-text">Desktop Browser Comparison (poquitotalk.hero-apps.com)</div>
    </div>
  </div>

  <div class="comparison-container">
    <!-- BEFORE COLUMN (DESKTOP BROWSER) -->
    <div class="column">
      <div class="tag tag-before">● BEFORE (Original Web Demo)</div>
      <div class="browser-frame">
        <div class="browser-titlebar">
          <div class="traffic-dots">
            <div class="dot dot-red"></div>
            <div class="dot dot-yellow"></div>
            <div class="dot dot-green"></div>
          </div>
          <div class="address-bar">
            <span>🔒</span>
            <span>https://poquitotalk.hero-apps.com/#demo</span>
          </div>
        </div>

        <div class="browser-content">
          <div class="card-panel-mock">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <div class="card-heading">Try the Voice Note Generator</div>
                <div class="card-subheading">Natural Panamanian phrasing in 1-tap</div>
              </div>
              <div style="background: #DCFCE7; border: 1.5px solid #10B981; border-radius: 50px; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #047857;">
                📻 Walkie-Talkie
              </div>
            </div>

            <div class="presets-row">
              <div class="p-pill">A/C Leaking</div>
              <div class="p-pill">Boat Engine</div>
              <div class="p-pill active">Police Station ATM</div>
            </div>

            <div class="input-label">ORIGINAL MESSAGE (ENGLISH)</div>
            <div class="input-box">
              "Hi! Does anyone know if the Banco Nacional ATM currently has cash dispensed?"
            </div>

            <div class="before-tone-row">
              <div class="btn-tone-old active">🛡️ Poquito (Amable)</div>
              <div class="btn-tone-old">⚡ Full panameño</div>
            </div>

            <div class="result-box-mock">
              <div class="result-text-mock">¡Buenas! ¿Alguien sabe si el cajero del súper frente a la policía tiene plata dispensando ahorita?</div>
              <div class="actions-row">
                <button class="btn-audio">▶ Listen to Voice Note</button>
                <button class="btn-wa">Share via WhatsApp</button>
              </div>
            </div>

            <div class="old-tooltip">
              <strong>Poquito (Amable)</strong><br>
              Natural Panameño warmth — friendly, polite phrasing
            </div>
          </div>
        </div>
      </div>
      <div class="notes-box">
        ❌ Walkie-talkie badge • Separated tone buttons • Faint grey/blue tooltips • "Police Station ATM"
      </div>
    </div>

    <!-- AFTER COLUMN (DESKTOP BROWSER) -->
    <div class="column">
      <div class="tag tag-after">● AFTER (Live on Website) • ENHANCED</div>
      <div class="browser-frame after-frame">
        <div class="browser-titlebar">
          <div class="traffic-dots">
            <div class="dot dot-red"></div>
            <div class="dot dot-yellow"></div>
            <div class="dot dot-green"></div>
          </div>
          <div class="address-bar">
            <span>🔒</span>
            <span>https://poquitotalk.hero-apps.com/#demo</span>
          </div>
        </div>

        <div class="browser-content">
          <div class="card-panel-mock">
            <!-- Perched Poquito Mascot -->
            <svg class="after-perched-mascot" viewBox="0 0 160 160" fill="none" style="transform: scaleX(-1);">
              <g id="side-perch"><path d="M 30 135 Q 70 132 115 135" stroke="#B45309" stroke-width="7" stroke-linecap="round"/></g>
              <g id="side-claws"><path d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round"/></g>
              <path d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z" fill="#10B981" stroke="#047857" stroke-width="4.5"/>
              <path d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5"/>
              <circle cx="76" cy="42" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5"/>
              <circle cx="74.5" cy="42" r="4.5" fill="#0F172A"/>
              <circle cx="72.5" cy="40" r="1.8" fill="#FFFFFF"/>
              <path d="M 87 34 C 102 36 112 43 112 48 C 112 51 98 56 86 54 Z" fill="#F59E0B" stroke="#D97706" stroke-width="2.5"/>
            </svg>

            <div style="padding-right: 75px;">
              <div class="card-heading">Try the Voice Note Generator</div>
              <div class="card-subheading">Natural Panamanian phrasing ready for WhatsApp</div>
            </div>

            <div class="presets-row">
              <div class="p-pill">A/C Leaking</div>
              <div class="p-pill">Boat Engine</div>
              <div class="p-pill active">Power Outage</div>
            </div>

            <div class="input-label">ORIGINAL MESSAGE (ENGLISH)</div>
            <div class="input-box">
              "Hi! Did the power go out in the whole area, or does anyone know when it comes back?"
            </div>

            <!-- Unified iOS Segmented Pill Slider -->
            <div class="segmented-switch">
              <button class="seg-button active">💬 Poquito</button>
              <button class="seg-button">⚡ Full panameño</button>
            </div>

            <div class="result-box-mock">
              <div class="result-text-mock">¡Buenas! ¿Se fue la luz en todo el sector o se sabe a qué hora regresará el servicio eléctrico?</div>
              <div class="actions-row">
                <button class="btn-audio">▶ Listen to Voice Note</button>
                <button class="btn-wa">Share via WhatsApp</button>
              </div>
            </div>

            <div class="new-tooltip">
              Natural Panameño — <em>warm, friendly, polite, and respectful phrasing</em> (e.g., "¡Buenas!", "¿Podría venir a revisarlo?").
            </div>
          </div>
        </div>
      </div>
      <div class="notes-box">
        ✅ Perched Poquito mascot (mirrored & animated) • iOS segmented slider • Solid black tooltips • "Power Outage" & Sync Audio
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-left">
      <span>Generated: <strong class="highlight">${timestamp}</strong></span>
      <span>Format: <strong class="highlight">Desktop Web Browser (1600 × 1080 @2x Retina)</strong></span>
    </div>
    <div>
      <span>Created by <strong class="highlight">@DorienVibecodes</strong> • <span class="brand-link">poquitotalk.hero-apps.com</span></span>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const cardBuffer = await page.screenshot({ fullPage: false });
  await page.close();
  await browser.close();

  const outputPath = path.join(SCREENSHOT_DIR, 'before_after_website_desktop.png');
  fs.writeFileSync(outputPath, cardBuffer);
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'before_after_website_desktop.png'), cardBuffer);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'before_after_website_desktop.png'), cardBuffer);
  console.log('✨ Saved Before & After Desktop Website Card: before_after_website_desktop.png');
}

generateWebsiteDesktopComparison().catch((err) => {
  console.error('Error generating website comparison:', err);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = process.cwd();
const SCREENSHOT_DIR = path.join(WORKSPACE_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Canonical Green Parrot Logo Vector SVG
const parrotSvg = `
<svg width="44" height="44" viewBox="0 0 200 200" fill="none">
  <path
    d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
    fill="#FFFFFF"
    stroke="#25D366"
    stroke-width="12"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <g transform="translate(43, 39) scale(0.75)">
    <path d="M 30 135 Q 70 132 115 135" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    <path
      d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138"
      stroke="#F59E0B"
      stroke-width="4.5"
      stroke-linecap="round"
    />
    <g id="body-group">
      <path
        d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z"
        fill="#10B981"
        stroke="#047857"
        stroke-width="4.5"
        stroke-linejoin="round"
      />
      <path d="M 58 19.2 C 55 13 52 9 47 8" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
      <path d="M 67 17.8 C 64 12 61 9 56 7" stroke="#047857" stroke-width="3" stroke-linecap="round" fill="none" />
    </g>
    <path
      d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z"
      fill="#06B6D4"
      stroke="#047857"
      stroke-width="3.5"
      stroke-linejoin="round"
    />
    <g id="head-group">
      <circle cx={76} cy={42} r={9} fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
      <circle cx={74.5} cy={42} r={4.5} fill="#0F172A" />
      <circle cx={72.5} cy={40} r={1.8} fill="#FFFFFF" />
      <path d="M 87 34 C 102 36 112 43 112 48 C 112 51 98 56 86 54 Z" fill="#F59E0B" stroke="#D97706" stroke-width="2.5" stroke-linejoin="round" />
    </g>
  </g>
</svg>
`;

const miniParrotSvg = `
<svg width="30" height="30" viewBox="0 0 200 200" fill="none">
  <path
    d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
    fill="#FFFFFF"
    stroke="#25D366"
    stroke-width="12"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <g transform="translate(43, 39) scale(0.75)">
    <path d="M 30 135 Q 70 132 115 135" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
    <path d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" stroke-linejoin="round" />
    <path d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
    <circle cx="76" cy="42" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
    <circle cx="74.5" cy="42" r="4.5" fill="#0F172A" />
    <path d="M 87 34 C 102 36 112 43 112 48 C 112 51 98 56 86 54 Z" fill="#F59E0B" stroke="#D97706" stroke-width="2.5" stroke-linejoin="round" />
  </g>
</svg>
`;

async function generateEvolutionShowcase() {
  console.log('🚀 Generating High-Fidelity Mobile App MVP Evolution Before & After Showcase...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background-color: #FAF8F5;
      background-image: 
        radial-gradient(circle at 50% 0%, #FFF5EE 0%, #FAF8F5 45%, #F0EAE1 100%),
        radial-gradient(rgba(150, 72, 36, 0.04) 1px, transparent 1px);
      background-size: 100% 100%, 28px 28px;
      color: #1B1C1A;
      width: 1600px;
      height: 1050px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 34px 60px 26px 60px;
      overflow: hidden;
      position: relative;
    }

    /* Ambient Background Glow */
    .bg-glow {
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 1000px;
      height: 380px;
      background: radial-gradient(circle, rgba(253, 154, 111, 0.15) 0%, rgba(250, 248, 245, 0) 70%);
      pointer-events: none;
      z-index: 1;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
      border-bottom: 1px solid #E6DFD5;
      padding-bottom: 14px;
    }
    .brand { display: flex; align-items: center; gap: 14px; }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #1B1C1A;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #964824;
      background: #FFDBCD;
      padding: 3.5px 12px;
      border-radius: 100px;
      border: 1px solid #FD9A6F;
    }
    .brand-subtitle {
      font-size: 13.5px;
      font-weight: 600;
      color: #594F42;
      margin-top: 2px;
    }

    .header-context {
      text-align: right;
    }
    .context-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: #8A3E1B;
      background: #F4EBE2;
      padding: 3.5px 10px;
      border-radius: 6px;
      border: 1px solid #E5D5C6;
      display: inline-block;
      margin-bottom: 2px;
    }
    .context-desc {
      font-size: 12.5px;
      font-weight: 600;
      color: #6B5E51;
    }

    /* Comparison Container */
    .comparison-container {
      display: flex;
      gap: 52px;
      justify-content: center;
      align-items: center;
      flex: 1;
      margin: 10px 0;
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
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      padding: 5px 16px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tag-before {
      background: #FEE2E2;
      color: #991B1B;
      border: 1.5px solid #F87171;
    }
    .tag-after {
      background: #DCFCE7;
      color: #166534;
      border: 1.5px solid #4ADE80;
    }

    /* Phone Chassis - Titanium Finish */
    .phone-frame {
      width: 376px;
      height: 750px;
      background: #18191B;
      border-radius: 46px;
      padding: 10px;
      box-shadow: 
        0 24px 60px rgba(89, 79, 66, 0.22),
        0 10px 24px rgba(0, 0, 0, 0.12),
        inset 0 0 0 1.5px rgba(255, 255, 255, 0.12);
      border: 3.5px solid #2D3748;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .phone-frame.after {
      border-color: #8A3E1B;
      box-shadow: 
        0 28px 70px rgba(138, 62, 27, 0.22),
        0 10px 24px rgba(0, 0, 0, 0.14),
        inset 0 0 0 1.5px rgba(255, 255, 255, 0.18);
    }

    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 36px;
      overflow: hidden;
      background: #FAF8F5;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }

    /* Status Bar */
    .status-bar {
      height: 36px;
      padding: 10px 22px 0 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      font-weight: 700;
      color: #1E293B;
      z-index: 20;
    }
    .notch {
      width: 100px;
      height: 20px;
      background: #000000;
      border-radius: 20px;
      margin: 0 auto;
    }

    /* App Internal UI */
    .app-body {
      flex: 1;
      padding: 6px 14px 6px 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    /* App Header inside phone */
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .app-logo-row {
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .app-name {
      font-family: 'Lexend', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: #1F1B18;
      line-height: 1.1;
    }
    .app-loc {
      font-size: 10px;
      font-weight: 600;
      color: #64748B;
    }
    .app-actions {
      display: flex;
      gap: 6px;
    }
    .icon-btn-round {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #F1EAE1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #475569;
    }

    /* BEFORE: Dialect Switcher */
    .old-mode-pill-container {
      background: #F0E6DC;
      border-radius: 100px;
      padding: 2.5px;
      display: flex;
      margin-bottom: 6px;
      border: 1px solid #D9C8B8;
    }
    .old-mode-btn {
      flex: 1;
      padding: 4.5px 0;
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      color: #5C554D;
      border-radius: 100px;
    }
    .old-mode-btn.active-full {
      background: #D97706;
      color: #FFFFFF;
      font-weight: 800;
      box-shadow: 0 2px 6px rgba(217, 119, 6, 0.3);
    }

    /* AFTER: Streamlined Voice Toggle */
    .new-voice-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .new-voice-toggle {
      display: inline-flex;
      background: #EFE8DF;
      border-radius: 100px;
      padding: 2px;
      border: 1px solid #DCD1C2;
    }
    .voice-btn-tab {
      padding: 3.5px 9px;
      border-radius: 100px;
      font-size: 10px;
      font-weight: 700;
      color: #5C554D;
    }
    .voice-btn-tab.active {
      background: #FFFFFF;
      color: #8A3E1B;
      font-weight: 800;
      box-shadow: 0 1.5px 4px rgba(0,0,0,0.08);
    }
    .lang-badge {
      background: #F3ECE4;
      border: 1px solid #E2D5C7;
      padding: 3px 8px;
      border-radius: 100px;
      font-size: 9.5px;
      font-weight: 800;
      color: #8A3E1B;
    }

    /* Input Card */
    .app-input-box {
      background: #FFFFFF;
      border: 1.5px solid #E5DCD2;
      border-radius: 14px;
      padding: 8px 11px;
      margin-bottom: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    }
    .input-label {
      font-size: 9px;
      font-weight: 800;
      color: #94A3B8;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .input-text {
      font-size: 11px;
      color: #1E293B;
      font-weight: 500;
      line-height: 1.35;
    }

    /* Output Card */
    .app-output-card {
      background: #FFFFFF;
      border-radius: 16px;
      padding: 10px 11px;
      border: 1.5px solid #E5DCD2;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      margin-bottom: 6px;
    }
    .output-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }
    .out-tag-old {
      background: #FEF3C7;
      border: 1px solid #F59E0B;
      color: #B45309;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 5px;
      text-transform: uppercase;
    }
    .out-tag-new {
      font-size: 9px;
      font-weight: 800;
      color: #64748B;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .out-spanish-text {
      font-size: 12px;
      font-weight: 700;
      color: #0F172A;
      line-height: 1.38;
      margin-bottom: 8px;
    }
    .highlight-slang {
      background: #FEF08A;
      color: #854D0E;
      padding: 1px 3px;
      border-radius: 3px;
      font-weight: 800;
    }

    /* Actions Bar */
    .old-actions-row {
      display: flex;
      gap: 6px;
    }
    .old-act-btn {
      flex: 1;
      background: #F1EAE1;
      border: 1px solid #D8CABE;
      border-radius: 8px;
      padding: 5px 0;
      text-align: center;
      font-size: 10px;
      font-weight: 700;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    /* AFTER Action Hierarchy */
    .new-actions-grid {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .new-top-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .speaker-circle {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #F1EAE1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1F1B18;
    }
    .mini-util-btn {
      background: #FAF6F1;
      border: 1px solid #E5DBD0;
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 9.5px;
      font-weight: 700;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .dual-dispatch-row {
      display: flex;
      gap: 6px;
    }
    .dispatch-text {
      flex: 1;
      background: #FAF8F5;
      border: 1.5px solid #25D366;
      border-radius: 8px;
      padding: 5px 0;
      text-align: center;
      font-size: 10px;
      font-weight: 800;
      color: #128C7E;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .dispatch-voice {
      flex: 1.3;
      background: #25D366;
      border-radius: 8px;
      padding: 5px 0;
      text-align: center;
      font-size: 10px;
      font-weight: 800;
      color: #FFFFFF;
      box-shadow: 0 2px 6px rgba(37, 211, 102, 0.28);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .walkie-cta-btn {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 8px;
      padding: 4.5px 0;
      text-align: center;
      font-size: 9.5px;
      font-weight: 700;
      color: #1D4ED8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    /* Central Mic Button Container */
    .mic-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 4px 0;
    }
    .mic-button-big {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #964824;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(150, 72, 36, 0.35);
      margin-bottom: 2px;
    }
    .mic-label {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748B;
    }

    /* Scenarios Grid */
    .scenarios-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 2px;
    }
    .scenario-pill {
      background: #F5EFEB;
      border: 1px solid #E2D7CC;
      border-radius: 20px;
      padding: 4.5px 9px;
      font-size: 9.5px;
      font-weight: 700;
      color: #4A4036;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* Bottom Tab Bar */
    .app-tabbar {
      height: 48px;
      background: #FFFFFF;
      border-top: 1px solid #EAE3D9;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 0 10px;
    }
    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      font-size: 9px;
      font-weight: 700;
      color: #94A3B8;
    }
    .tab-item.active {
      color: #8A3E1B;
    }

    /* Transition Arrow */
    .arrow-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #807264;
    }
    .arrow-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 2px solid #E6DFD5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      color: #8A3E1B;
      box-shadow: 0 8px 24px rgba(138, 62, 27, 0.14);
    }
    .arrow-label {
      font-family: 'Lexend', sans-serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: #8A3E1B;
      text-transform: uppercase;
      text-align: center;
      line-height: 1.3;
    }

    /* Explanatory Cards under devices */
    .key-points-card {
      width: 376px;
      background: #FFFFFF;
      border: 1.5px solid #E6DFD5;
      border-radius: 16px;
      padding: 12px 14px;
      font-size: 11.5px;
      line-height: 1.45;
      box-shadow: 0 4px 16px rgba(0,0,0,0.03);
    }
    .key-points-card.before-points {
      border-left: 4px solid #EF4444;
      color: #450A0A;
    }
    .key-points-card.after-points {
      border-left: 4px solid #10B981;
      color: #064E3B;
    }
    .key-points-card strong {
      display: inline-block;
      margin-bottom: 2px;
    }

    /* Footer */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #E6DFD5;
      padding-top: 12px;
      font-size: 12px;
      color: #5C554D;
      position: relative;
      z-index: 10;
    }
    .highlight { color: #1B1C1A; font-weight: 700; }
  </style>
</head>
<body>
  <div class="bg-glow"></div>

  <!-- Header Banner -->
  <div class="header">
    <div class="brand">
      ${parrotSvg}
      <div>
        <div class="brand-title">PoquitoTalk <span class="badge">Panamá 🇵🇦</span></div>
        <div class="brand-subtitle">Mobile App UI Evolution: Prototype Dialect Selector vs. Streamlined Rock-Solid MVP</div>
      </div>
    </div>
    <div class="header-context">
      <div class="context-tag">PRODUCT ARCHITECTURE</div>
      <div class="context-desc">Simplified for Instant Island Logistics</div>
    </div>
  </div>

  <!-- Dual Device Showcase -->
  <div class="comparison-container">
    
    <!-- BEFORE COLUMN -->
    <div class="column">
      <div class="tag tag-before">● BEFORE (Early Prototype)</div>
      
      <div class="phone-frame">
        <div class="phone-screen">
          <div class="status-bar">
            <span>9:41</span>
            <div class="notch"></div>
            <span>100%</span>
          </div>

          <div class="app-body">
            <!-- App Header -->
            <div class="app-header">
              <div class="app-logo-row">
                ${miniParrotSvg}
                <div>
                  <div class="app-name">PoquitoTalk</div>
                  <div class="app-loc">Bocas del Toro (Panama) 🇵🇦</div>
                </div>
              </div>
              <div class="app-actions">
                <div class="icon-btn-round">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div class="icon-btn-round">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </div>
              </div>
            </div>

            <!-- Tone / Dialect Mode Switcher (Prototype Feature) -->
            <div class="old-mode-pill-container">
              <div class="old-mode-btn">Poquito (Amable)</div>
              <div class="old-mode-btn active-full">Full Panameño (Jerga)</div>
            </div>

            <!-- Input Box -->
            <div class="app-input-box">
              <div class="input-label">English Request</div>
              <div class="input-text">"Hi! My air conditioning unit is leaking water inside the bedroom. Can someone inspect it today?"</div>
            </div>

            <!-- Central Mic Button -->
            <div class="mic-section">
              <div class="mic-button-big">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </div>
              <span class="mic-label">Tap to Speak</span>
            </div>

            <!-- Output Translation Card with Slang -->
            <div class="app-output-card">
              <div class="output-top-bar">
                <span class="out-tag-old">Full Panameño (Slang Mode)</span>
                <span style="font-size: 9.5px; color: #8A3E1B; font-weight: 700;">Diego</span>
              </div>
              <div class="out-spanish-text">
                “¡Qué xopa! El <span class="highlight-slang">split</span> está botando <span class="highlight-slang">buco</span> agua en la recámara. ¿A qué hora puede pasar a <span class="highlight-slang">chequearlo</span>?”
              </div>

              <!-- Old Prototype Audio Bar -->
              <div class="old-actions-row">
                <div class="old-act-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  Speaker
                </div>
                <div class="old-act-btn" style="background: #25D366; color: #FFF; border-color: #25D366; font-weight: 800;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                  WhatsApp Audio
                </div>
              </div>
            </div>

            <!-- Note Callout -->
            <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 9px; padding: 6px 9px; font-size: 9.5px; color: #92400E; margin-bottom: 4px;">
              <strong>Colloquial Street Slang:</strong> Words like <em>split</em>, <em>buco</em>, and <em>xopa</em> are informal and often misaligned with polite contractor negotiations.
            </div>
          </div>

          <!-- Tab Bar -->
          <div class="app-tabbar">
            <div class="tab-item active">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Translate</span>
            </div>
            <div class="tab-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Dialects</span>
            </div>
            <div class="tab-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
              <span>Templates</span>
            </div>
            <div class="tab-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Directory</span>
            </div>
          </div>
        </div>
      </div>

      <div class="key-points-card before-points">
        <strong>❌ Complex Tone Modes:</strong> Switching between "Poquito" and "Full Panameño" added cognitive friction and inappropriate street slang for polite contractor requests.
      </div>
    </div>

    <!-- CENTRAL DIVIDER -->
    <div class="arrow-divider">
      <div class="arrow-icon">→</div>
      <div class="arrow-label">MVP<br>SIMPLIFIED</div>
    </div>

    <!-- AFTER COLUMN -->
    <div class="column">
      <div class="tag tag-after">● AFTER (v1.5.0 Live MVP)</div>
      
      <div class="phone-frame after">
        <div class="phone-screen">
          <div class="status-bar">
            <span>9:41</span>
            <div class="notch"></div>
            <span>100%</span>
          </div>

          <div class="app-body">
            <!-- App Header -->
            <div class="app-header">
              <div class="app-logo-row">
                ${miniParrotSvg}
                <div>
                  <div class="app-name">PoquitoTalk</div>
                  <div class="app-loc">Bocas del Toro (Panama) 🇵🇦</div>
                </div>
              </div>
              <div class="app-actions">
                <div class="icon-btn-round">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div class="icon-btn-round">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </div>
              </div>
            </div>

            <!-- Streamlined 1-Tap Voice & Language Row -->
            <div class="new-voice-row">
              <div class="new-voice-toggle">
                <div class="voice-btn-tab active">♂ Male</div>
                <div class="voice-btn-tab">♀ Female</div>
              </div>
              <div class="lang-badge">EN ⇄ ES</div>
            </div>

            <!-- Clean Input Box -->
            <div class="app-input-box">
              <div class="input-label">English Request</div>
              <div class="input-text">"Hello, the air conditioner in the main bedroom is leaking water and not cooling."</div>
            </div>

            <!-- Clean Output Translation Card -->
            <div class="app-output-card">
              <div class="output-top-bar">
                <span class="out-tag-new">SPANISH • POLITE & RESPECTFUL</span>
                <span style="font-size: 9.5px; color: #166534; font-weight: 800; background: #DCFCE7; padding: 2px 6px; border-radius: 4px;">✓ Bocas Del Toro</span>
              </div>
              <div class="out-spanish-text" style="color: #1E293B;">
                “¡Buenas! El aire acondicionado en la recámara principal está botando agua y no enfría. ¿Podría venir a revisarlo?”
              </div>

              <!-- Refined Action Hierarchy -->
              <div class="new-actions-grid">
                <div class="new-top-actions">
                  <div class="speaker-circle">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  </div>
                  <div style="display: flex; gap: 5px;">
                    <span class="mini-util-btn">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copy
                    </span>
                    <span class="mini-util-btn">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                      Saved
                    </span>
                  </div>
                </div>
                <div class="dual-dispatch-row">
                  <div class="dispatch-text">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                    Text
                  </div>
                  <div class="dispatch-voice">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                    Voice Note
                  </div>
                </div>
                <div class="walkie-cta-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>
                  Start 2-Way PoquitoTalkie Live Channel
                </div>
              </div>
            </div>

            <!-- Quick 1-Tap Island Scenarios -->
            <div class="scenarios-grid">
              <div class="scenario-pill">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                Water Tanker Cistern Delivery Refill
              </div>
              <div class="scenario-pill">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2 6.3-6.4 2 2-6.3z"/></svg>
                Water Taxi to Old Bank Bastimentos
              </div>
            </div>
          </div>

          <!-- Tab Bar -->
          <div class="app-tabbar">
            <div class="tab-item active">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>Translate</span>
            </div>
            <div class="tab-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h0M2 9.5h20"/></svg>
              <span>Templates</span>
            </div>
            <div class="tab-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Providers</span>
            </div>
          </div>
        </div>
      </div>

      <div class="key-points-card after-points">
        <strong>✅ Rock-Solid Streamlined MVP:</strong> 1-tap polite Panamanian Spanish calibrated for local service contacts, instant 1-tap WhatsApp voice notes, and zero dialect confusion.
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div class="footer">
    <div>PoquitoTalk MVP Evolution • <span class="highlight">Bocas del Toro, Panamá</span></div>
    <div>Created by <span class="highlight">@DorienVibecodes</span> • <span class="highlight">poquitotalk.hero-apps.com</span></div>
  </div>

</body>
</html>
`;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // 1. Save to screenshots/app_mvp_dialect_evolution_before_after.png
  const screenshotPath = path.join(SCREENSHOT_DIR, 'app_mvp_dialect_evolution_before_after.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`✅ Saved comparison screenshot to ${screenshotPath}`);

  // 2. Automatically copy to workspace root per Rule 4 and Semantic Naming rule
  const rootPath = path.join(WORKSPACE_DIR, 'app_mvp_dialect_evolution_before_after.png');
  const buffer = fs.readFileSync(screenshotPath);
  fs.writeFileSync(rootPath, buffer);

  console.log(`✅ Copied comparison screenshot to workspace root: ${rootPath}`);

  await browser.close();
}

generateEvolutionShowcase().catch(err => {
  console.error('❌ Error generating comparison showcase:', err);
  process.exit(1);
});

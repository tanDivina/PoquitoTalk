const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const ARTIFACTS_DIR = '/Users/dorienvandenabbeele/.gemini/antigravity/brain/3d69dfac-9be7-467b-9b59-e92f4a5582c0';

async function generateComparisons() {
  console.log('🚀 Generating Before & After Comparison Showcase...');
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. Comparison 1: Templates / Presets Screen (Fanned Overlapping Playing Card Deck)
  const page1 = await browser.newPage();
  await page1.setViewport({ width: 1280, height: 860, deviceScaleFactor: 2 });

  const htmlPresets = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Lexend:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0B0F19;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 32px 40px;
      color: #F8FAFC;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .header-banner {
      text-align: center;
      margin-bottom: 24px;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #10B981;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }
    p.subtitle {
      font-size: 13.5px;
      color: #94A3B8;
      margin-top: 5px;
    }
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      width: 100%;
      max-width: 1200px;
    }
    .card-column {
      background: #131D2E;
      border: 1.5px solid #23334D;
      border-radius: 24px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 12px 36px rgba(0,0,0,0.35);
    }
    .card-column.after-col {
      border-color: #10B981;
      box-shadow: 0 12px 40px rgba(16, 185, 129, 0.18);
    }
    .col-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .col-tag {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .tag-before { background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .tag-after { background: rgba(16, 185, 129, 0.2); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .col-title {
      font-size: 15px;
      font-weight: 800;
      color: #E2E8F0;
    }

    /* Simulated Mobile Phone Container */
    .phone-screen {
      background: #FAF9F6;
      border-radius: 20px;
      padding: 16px;
      color: #0F172A;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 540px;
      position: relative;
      overflow: hidden;
      border: 1px solid #E2E8F0;
    }
    .screen-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #E5E2DA;
    }
    .app-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .app-title {
      font-size: 15px;
      font-weight: 800;
      color: #0F172A;
    }
    .ver-badge {
      background: #E2E8F0;
      color: #475569;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 6px;
    }
    .ver-badge-new {
      background: #10B981;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 6px;
    }

    /* BEFORE Layout: Separated blocks with gap */
    .before-deck-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .before-card {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 16px;
      padding: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }
    .card-row-head {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .c-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .c-title {
      font-size: 13.5px;
      font-weight: 800;
      color: #0F172A;
      flex: 1;
    }
    .c-sub {
      font-size: 11px;
      color: #64748B;
    }

    /* AFTER Layout: Fanned Overlapping Playing Card Deck */
    .after-deck-list {
      position: relative;
      display: flex;
      flex-direction: column;
    }
    .stacked-playing-card {
      border-radius: 20px;
      padding: 14px 16px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      position: relative;
      transition: transform 0.2s ease;
    }
    .stacked-card-1 {
      background: #FAF0ED;
      border: 2px solid #8A3E1B;
      z-index: 10;
      margin-top: 0;
      box-shadow: 0 8px 24px rgba(138, 62, 27, 0.15);
    }
    .stacked-card-2 {
      background: #F0F7F9;
      border: 1.5px solid #CFE3EB;
      z-index: 9;
      margin-top: -18px;
    }
    .stacked-card-3 {
      background: #F0F8F7;
      border: 1.5px solid #D0E6E3;
      z-index: 8;
      margin-top: -18px;
    }
    .stacked-card-4 {
      background: #FFFBEB;
      border: 1.5px solid #FDE68A;
      z-index: 7;
      margin-top: -18px;
    }

    /* Expanded Content with Horizontal Scenario Slide */
    .expanded-carousel-box {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid rgba(138, 62, 27, 0.12);
    }
    .carousel-badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .swipe-badge {
      background: #FDE8E1;
      color: #8A3E1B;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .scenario-slide {
      background: #FFFFFF;
      border: 1px solid #E8DCD5;
      border-radius: 12px;
      padding: 10px 12px;
      margin-bottom: 8px;
    }
    .sc-title {
      font-size: 12px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 3px;
    }
    .sc-eng {
      font-size: 11px;
      color: #64748B;
      margin-bottom: 6px;
    }
    .sc-spanish {
      background: #FAF8F5;
      border-left: 3px solid #8A3E1B;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 700;
      color: #8A3E1B;
    }

    .key-points {
      margin-top: 14px;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.5;
    }
    .key-points strong { color: #F1F5F9; }
  </style>
</head>
<body>
  <div class="header-banner">
    <div class="badge-pill">MOBILE APP INTERACTION UPGRADE</div>
    <h1>Templates Screen: Fanned Playing Card Deck & Auto-Scroll</h1>
    <p class="subtitle">Side-by-side comparison of the restored hand-held playing card deck with synchronized scroll auto-opening.</p>
  </div>

  <div class="comparison-grid">
    <!-- BEFORE COLUMN -->
    <div class="card-column">
      <div class="col-header">
        <span class="col-tag tag-before">Before (v1.4.0)</span>
        <span class="col-title">Separated Block List</span>
      </div>
      <div class="phone-screen">
        <div class="screen-header">
          <div class="app-brand">
            <span style="font-size: 20px;">🦜</span>
            <span class="app-title">PoquitoTalk</span>
            <span class="ver-badge">v1.4.0</span>
          </div>
          <span style="font-size: 11px; font-weight: 700; color: #64748B;">Templates</span>
        </div>

        <div class="before-deck-list">
          <div class="before-card">
            <div class="card-row-head">
              <div class="c-icon" style="background: #FFE4E6; color: #E11D48;">🍽️</div>
              <div>
                <div class="c-title">Restaurant & Food Orders</div>
                <div class="c-sub">8 phrase templates</div>
              </div>
            </div>
          </div>
          <div class="before-card">
            <div class="card-row-head">
              <div class="c-icon" style="background: #E0F2FE; color: #0284C7;">🚤</div>
              <div>
                <div class="c-title">Boat Taxis & Transfers</div>
                <div class="c-sub">6 phrase templates</div>
              </div>
            </div>
          </div>
          <div class="before-card">
            <div class="card-row-head">
              <div class="c-icon" style="background: #DCFCE7; color: #16A34A;">❄️</div>
              <div>
                <div class="c-title">A/C & Appliance Repair</div>
                <div class="c-sub">5 phrase templates</div>
              </div>
            </div>
          </div>
          <div class="before-card">
            <div class="card-row-head">
              <div class="c-icon" style="background: #FEF3C7; color: #D97706;">💧</div>
              <div>
                <div class="c-title">Water Truck Delivery</div>
                <div class="c-sub">4 phrase templates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="key-points">
        ❌ <strong>Disconnected Blocks:</strong> Standard separated cards with 12px white space gaps.<br>
        ❌ <strong>Manual Tapping Only:</strong> No auto-expansion when scrolling through the list.
      </div>
    </div>

    <!-- AFTER COLUMN -->
    <div class="card-column after-col">
      <div class="col-header">
        <span class="col-tag tag-after">After (v1.5.0) • Restored</span>
        <span class="col-title">Fanned Overlapping Playing Card Deck</span>
      </div>
      <div class="phone-screen">
        <div class="screen-header">
          <div class="app-brand">
            <span style="font-size: 20px;">🦜</span>
            <span class="app-title">PoquitoTalk</span>
            <span class="ver-badge-new">v1.5.0</span>
          </div>
          <span style="font-size: 11px; font-weight: 800; color: #10B981;">Templates</span>
        </div>

        <div class="after-deck-list">
          <!-- Card 1 (Active & Expanded) -->
          <div class="stacked-playing-card stacked-card-1">
            <div class="card-row-head">
              <div class="c-icon" style="background: #FDE8E1; color: #8A3E1B;">🍽️</div>
              <div style="flex: 1;">
                <div class="c-title" style="color: #8A3E1B;">Restaurant & Island Dining</div>
                <div class="c-sub">8 phrase templates • Active Deck</div>
              </div>
              <span style="font-size: 14px; color: #8A3E1B;">▲</span>
            </div>
            
            <div class="expanded-carousel-box">
              <div class="carousel-badge-row">
                <span style="font-size: 11px; color: #64748B;">Scenario 1 of 8</span>
                <span class="swipe-badge">Swipe →</span>
              </div>
              <div class="scenario-slide">
                <div class="sc-title">Order Local Panamanian Dishes</div>
                <div class="sc-eng">"Hi! I would like to order two plates of coconut rice with fried fish..."</div>
                <div class="sc-spanish">¡Buenas! Quisiéramos dos platos de arroz con coco y pescado frito...</div>
              </div>
            </div>
          </div>

          <!-- Card 2 (Overlapping below) -->
          <div class="stacked-playing-card stacked-card-2">
            <div class="card-row-head">
              <div class="c-icon" style="background: #DEEDF3; color: #2F6278;">🚤</div>
              <div>
                <div class="c-title">Boat Taxis & Water Captains</div>
                <div class="c-sub">6 phrase templates</div>
              </div>
              <span style="font-size: 14px; color: #2F6278;">▼</span>
            </div>
          </div>

          <!-- Card 3 (Overlapping below) -->
          <div class="stacked-playing-card stacked-card-3">
            <div class="card-row-head">
              <div class="c-icon" style="background: #DEEFECE; color: #2F6761;">❄️</div>
              <div>
                <div class="c-title">A/C & Appliance Repair</div>
                <div class="c-sub">5 phrase templates</div>
              </div>
              <span style="font-size: 14px; color: #2F6761;">▼</span>
            </div>
          </div>

          <!-- Card 4 (Overlapping below) -->
          <div class="stacked-playing-card stacked-card-4">
            <div class="card-row-head">
              <div class="c-icon" style="background: #FEF3C7; color: #B45309;">💧</div>
              <div>
                <div class="c-title">Water Truck Delivery</div>
                <div class="c-sub">4 phrase templates</div>
              </div>
              <span style="font-size: 14px; color: #B45309;">▼</span>
            </div>
          </div>
        </div>
      </div>
      <div class="key-points">
        ✅ <strong>Zero White Space Overlap:</strong> Negative margins (-18px) and dynamic 3D zIndex depth layering.<br>
        ✅ <strong>Calibrated Scroll-Trigger:</strong> Scrolling smoothly auto-opens each card in sequence.
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await page1.setContent(htmlPresets, { waitUntil: 'networkidle0' });
  const presetsBuffer = await page1.screenshot({ fullPage: true });
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'comparison_presets_deck.png'), presetsBuffer);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'comparison_presets_deck.png'), presetsBuffer);
  console.log('✅ Created comparison_presets_deck.png');

  // 2. Comparison 2: Website Voice Note Generator Demo
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1280, height: 860, deviceScaleFactor: 2 });

  const htmlDemo = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Lexend:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0B0F19;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 32px 40px;
      color: #F8FAFC;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .header-banner {
      text-align: center;
      margin-bottom: 24px;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #10B981;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }
    p.subtitle {
      font-size: 13.5px;
      color: #94A3B8;
      margin-top: 5px;
    }
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      width: 100%;
      max-width: 1200px;
    }
    .card-column {
      background: #131D2E;
      border: 1.5px solid #23334D;
      border-radius: 24px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 12px 36px rgba(0,0,0,0.35);
    }
    .card-column.after-col {
      border-color: #10B981;
      box-shadow: 0 12px 40px rgba(16, 185, 129, 0.18);
    }
    .col-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .col-tag {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .tag-before { background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .tag-after { background: rgba(16, 185, 129, 0.2); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .col-title {
      font-size: 15px;
      font-weight: 800;
      color: #E2E8F0;
    }

    /* Card Preview Container */
    .card-panel-preview {
      background: #FFFFFF;
      border-radius: 24px;
      padding: 22px;
      color: #1F1B18;
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      border: 1px solid #E6E0D6;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .preset-pills-row {
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
    }
    .p-pill.active {
      background: #8A3E1B;
      color: #FFFFFF;
      border-color: #8A3E1B;
    }

    .demo-input-box {
      background: #FAF8F5;
      border: 1.5px solid #E6E0D6;
      border-radius: 14px;
      padding: 10px 12px;
      font-size: 12px;
      color: #2D2721;
      margin-bottom: 12px;
    }

    /* Tone controls comparison */
    .tone-row-before {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }
    .btn-tone-old {
      background: #F4EFEB;
      border: 1px solid #E6E0D6;
      border-radius: 10px;
      padding: 6px 12px;
      font-size: 11.5px;
      font-weight: 700;
      color: #5C554D;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .segmented-switch-new {
      display: inline-flex;
      background: #EFE9E1;
      border-radius: 100px;
      padding: 3px;
      border: 1px solid #E0D7CC;
      margin-bottom: 10px;
    }
    .seg-btn {
      padding: 5px 12px;
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
    .seg-btn.active {
      background: #FFFFFF;
      color: #8A3E1B;
      font-weight: 800;
      box-shadow: 0 2px 6px rgba(138, 62, 27, 0.15);
    }

    .output-box {
      background: #FAF8F5;
      border: 1.5px solid #E8DCD5;
      border-radius: 14px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .out-text {
      font-size: 13.5px;
      font-weight: 600;
      color: #1F1B18;
      line-height: 1.45;
    }

    /* Tooltip comparison callouts */
    .tooltip-callout {
      border-radius: 12px;
      padding: 10px 12px;
      margin-top: 10px;
      font-size: 11.5px;
      line-height: 1.4;
    }
    .tooltip-old {
      background: #1E293B;
      color: #94A3B8;
      border: 1px solid #334155;
    }
    .tooltip-old strong { color: #38BDF8; }

    .tooltip-new {
      background: #FFFFFF;
      color: #000000;
      border: 1.5px solid #D0C9BD;
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
      font-weight: 600;
    }
    .tooltip-new em { color: #8A3E1B; font-weight: 800; font-style: normal; }

    .key-points {
      margin-top: 14px;
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.5;
    }
    .key-points strong { color: #F1F5F9; }
  </style>
</head>
<body>
  <div class="header-banner">
    <div class="badge-pill">WEBSITE LIVE DEMO ENHANCEMENT</div>
    <h1>Voice Note Generator: Mascot, Segmented Slider & Crisp Tooltips</h1>
    <p class="subtitle">Side-by-side comparison of the interactive Voice Note Demo section on poquitotalk.hero-apps.com.</p>
  </div>

  <div class="comparison-grid">
    <!-- BEFORE COLUMN -->
    <div class="card-column">
      <div class="col-header">
        <span class="col-tag tag-before">Before</span>
        <span class="col-title">Talkie Mascot, Spaced Buttons & Grey Tooltip</span>
      </div>
      <div class="card-panel-preview">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <div style="font-size: 16px; font-weight: 800; color: #1F1B18;">Try the Voice Note Generator</div>
              <div style="font-size: 11.5px; color: #64748B;">Natural Panamanian phrasing in 1-tap</div>
            </div>
            <!-- Old Walkie-Talkie Badge -->
            <div style="background: #DCFCE7; border: 1.5px solid #10B981; border-radius: 50px; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #047857;">
              📻 Walkie-Talkie
            </div>
          </div>

          <div class="preset-pills-row">
            <div class="p-pill">A/C Leaking</div>
            <div class="p-pill">Boat Engine</div>
            <div class="p-pill active">Police Station ATM</div>
          </div>

          <div class="demo-input-box">
            "Hi! Does anyone know if the Banco Nacional ATM currently has cash dispensed?"
          </div>

          <div class="tone-row-before">
            <div class="btn-tone-old">🛡️ Poquito (Amable)</div>
            <div class="btn-tone-old">⚡ Full panameño</div>
          </div>

          <div class="output-box">
            <div class="out-text">¡Buenas! ¿Alguien sabe si el cajero del súper frente a la policía tiene plata dispensando ahorita?</div>
          </div>
        </div>

        <div class="tooltip-callout tooltip-old">
          <strong>Poquito (Amable)</strong><br>
          <span style="color: #94A3B8;">Natural Panameño warmth — friendly, polite phrasing</span>
        </div>
      </div>

      <div class="key-points">
        ❌ <strong>Cluttered Badges:</strong> Walkie-talkie mascot container and shield icon.<br>
        ❌ <strong>Low-Contrast Tooltips:</strong> Dark slate box with faint blue/grey text.<br>
        ❌ <strong>Awkward Phrasing:</strong> "Police Station ATM" and "has cash dispensed".
      </div>
    </div>

    <!-- AFTER COLUMN -->
    <div class="card-column after-col">
      <div class="col-header">
        <span class="col-tag tag-after">After • Live on Web</span>
        <span class="col-title">Perched Poquito, Segmented Slider & Black Text</span>
      </div>
      <div class="card-panel-preview" style="position: relative;">
        <!-- Pure Perched Poquito Mascot (Looking Inward) -->
        <div style="position: absolute; top: -38px; right: 16px; display: flex; align-items: center; justify-content: center;">
          <svg width="68" height="68" viewBox="0 0 160 160" fill="none" style="transform: scaleX(-1);">
            <g id="side-perch"><path d="M 30 135 Q 70 132 115 135" stroke="#B45309" stroke-width="7" stroke-linecap="round"/></g>
            <g id="side-claws"><path d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round"/></g>
            <path d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z" fill="#10B981" stroke="#047857" stroke-width="4.5"/>
            <path d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5"/>
            <circle cx="76" cy="42" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5"/>
            <circle cx="74.5" cy="42" r="4.5" fill="#0F172A"/>
            <circle cx="72.5" cy="40" r="1.8" fill="#FFFFFF"/>
            <path d="M 87 34 C 102 36 112 43 112 48 C 112 51 98 56 86 54 Z" fill="#F59E0B" stroke="#D97706" stroke-width="2.5"/>
          </svg>
        </div>

        <div>
          <div style="margin-bottom: 12px; padding-right: 70px;">
            <div style="font-size: 16px; font-weight: 800; color: #1F1B18;">Try the Voice Note Generator</div>
            <div style="font-size: 11.5px; color: #64748B;">Natural Panamanian phrasing ready for WhatsApp</div>
          </div>

          <div class="preset-pills-row">
            <div class="p-pill">A/C Leaking</div>
            <div class="p-pill">Boat Engine</div>
            <div class="p-pill active">Downtown ATM</div>
          </div>

          <div class="demo-input-box">
            "Hi! Does anyone know if the Downtown ATM has cash today?"
          </div>

          <!-- Modern iOS Segmented Slider -->
          <div class="segmented-switch-new">
            <button class="seg-btn active">💬 Poquito</button>
            <button class="seg-btn">⚡ Full panameño</button>
          </div>

          <div class="output-box">
            <div class="out-text">¡Buenas! ¿Alguien sabe si el cajero del centro tiene efectivo hoy?</div>
          </div>
        </div>

        <!-- Solid Black Text High-Contrast Tooltip -->
        <div class="tooltip-callout tooltip-new">
          Natural Panameño — <em>warm, friendly, polite, and respectful phrasing</em> (e.g., "¡Buenas!", "¿Podría venir a revisarlo?").
        </div>
      </div>

      <div class="key-points">
        ✅ <strong>Solid Black Tooltips:</strong> Pure solid black text with deep terracotta accents.
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await page2.setContent(htmlDemo, { waitUntil: 'networkidle0' });
  const demoBuffer = await page2.screenshot({ fullPage: true });
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'comparison_demo_generator.png'), demoBuffer);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'comparison_demo_generator.png'), demoBuffer);
  console.log('✅ Created comparison_demo_generator.png');

  // 3. Combined Master Showcase Card
  const page3 = await browser.newPage();
  await page3.setViewport({ width: 1280, height: 960, deviceScaleFactor: 2 });

  const htmlMaster = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Lexend:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0B0F19;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 32px 40px;
      color: #F8FAFC;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .header-banner {
      text-align: center;
      margin-bottom: 24px;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #10B981;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
    }
    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }
    p.subtitle {
      font-size: 13.5px;
      color: #94A3B8;
      margin-top: 5px;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      width: 100%;
      max-width: 1200px;
    }
    .feature-card {
      background: #131D2E;
      border: 1.5px solid #23334D;
      border-radius: 20px;
      padding: 18px;
      display: flex;
      flex-direction: column;
    }
    .feat-tag {
      font-size: 10.5px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      align-self: flex-start;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(16, 185, 129, 0.2);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }
    .feat-title {
      font-size: 16px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 6px;
    }
    .feat-desc {
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.45;
      margin-bottom: 14px;
    }
    .mini-preview {
      background: #FAF9F6;
      border-radius: 14px;
      padding: 12px;
      color: #0F172A;
      border: 1px solid #E2E8F0;
      flex: 1;
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <div class="badge-pill">POQUITOTALK RELEASE OVERVIEW</div>
    <h1>Before & After Enhancements Summary</h1>
    <p class="subtitle">Complete visual verification of mobile app interaction systems and web funnel upgrades.</p>
  </div>

  <div class="cards-grid">
    <!-- Card 1: Fanned Playing Card Deck -->
    <div class="feature-card">
      <span class="feat-tag">Mobile App</span>
      <div class="feat-title">Fanned Playing Card Deck</div>
      <div class="feat-desc">Zero white space overlap with negative margins (-18px) and dynamic 3D depth layering.</div>
      <div class="mini-preview">
        <div style="background: #FAF0ED; border: 2px solid #8A3E1B; border-radius: 12px; padding: 10px; margin-bottom: -10px; position: relative; z-index: 3;">
          <div style="font-size: 12px; font-weight: 800; color: #8A3E1B;">🍽️ Restaurant & Food</div>
          <div style="font-size: 10px; color: #8A3E1B;">8 Scenarios • Active</div>
        </div>
        <div style="background: #F0F7F9; border: 1px solid #CFE3EB; border-radius: 12px; padding: 10px; margin-bottom: -10px; position: relative; z-index: 2;">
          <div style="font-size: 12px; font-weight: 800; color: #2F6278;">🚤 Boat Captains</div>
        </div>
        <div style="background: #F0F8F7; border: 1px solid #D0E6E3; border-radius: 12px; padding: 10px; position: relative; z-index: 1;">
          <div style="font-size: 12px; font-weight: 800; color: #2F6761;">❄️ A/C & Repair</div>
        </div>
      </div>
    </div>

    <!-- Card 2: Auto-Opening Scroll Trigger -->
    <div class="feature-card">
      <span class="feat-tag">Interaction Motion</span>
      <div class="feat-title">Bi-Directional Scroll Trigger</div>
      <div class="feat-desc">Scrolling up or down automatically fans open each card in calibrated 48px steps.</div>
      <div class="mini-preview" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 6px;">📜 ↕️ 🎴</div>
        <div style="font-size: 12.5px; font-weight: 800; color: #0F172A;">Smooth Scroll Choreography</div>
        <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Top guard reset (scrollY &lt; 20px) + ample bottom padding (350px)</div>
      </div>
    </div>

    <!-- Card 3: Website Voice Generator -->
    <div class="feature-card">
      <span class="feat-tag">Website Demo</span>
      <div class="feat-title">Pure Mascot & Segmented Pill</div>
      <div class="feat-desc">Side Poquito parrot perched on corner, unified slider pill, and crisp solid black tooltips.</div>
      <div class="mini-preview">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 12px; font-weight: 800; color: #1F1B18;">Live Generator</span>
          <span style="font-size: 16px;">🦜</span>
        </div>
        <div style="background: #EFE9E1; border-radius: 100px; padding: 2px; display: inline-flex; margin-bottom: 6px;">
          <span style="background: #FFFFFF; color: #8A3E1B; font-size: 10.5px; font-weight: 800; padding: 3px 8px; border-radius: 100px;">💬 Poquito</span>
          <span style="color: #5C554D; font-size: 10.5px; font-weight: 700; padding: 3px 8px;">⚡ Full</span>
        </div>
        <div style="background: #FFFFFF; border: 1px solid #D0C9BD; border-radius: 8px; padding: 6px; font-size: 10.5px; color: #000000; font-weight: 600;">
          Solid black high-contrast tooltip text
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await page3.setContent(htmlMaster, { waitUntil: 'networkidle0' });
  const masterBuffer = await page3.screenshot({ fullPage: true });
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'before_after_showcase_all.png'), masterBuffer);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'before_after_showcase_all.png'), masterBuffer);
  console.log('✅ Created before_after_showcase_all.png');

  await browser.close();
  console.log('🎉 All comparison screenshots generated and copied to workspace root!');
}

generateComparisons().catch(err => {
  console.error('Error generating comparisons:', err);
  process.exit(1);
});

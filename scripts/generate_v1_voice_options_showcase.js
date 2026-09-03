const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';

async function generateV1VoiceShowcase() {
  console.log('🚀 Generating Calibrated Realistic Light-Themed Showcase & Standalone V1 Screen...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars']
  });

  // ==========================================
  // 1. STANDALONE REALISTIC V1 SCREEN (Device Framed)
  // ==========================================
  const pageStandaloneV1 = await browser.newPage();
  await pageStandaloneV1.setViewport({ width: 440, height: 880, deviceScaleFactor: 2 });

  const htmlStandaloneV1 = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lexend:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #F8FAF9;
      background-image: 
        radial-gradient(circle at 50% 0%, #FFFDF7 0%, #F8FAF9 45%, #F0F4F2 100%),
        radial-gradient(rgba(140, 74, 38, 0.04) 1px, transparent 1px);
      background-size: 100% 100%, 24px 24px;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }

    .phone-chassis {
      width: 360px;
      height: 760px;
      background: #18191B;
      border-radius: 44px;
      padding: 10px;
      box-shadow: 0 25px 65px rgba(45, 36, 30, 0.16), 0 8px 24px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .phone-screen {
      background: #F8F6F0;
      border-radius: 34px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 14px 16px 10px 16px;
      position: relative;
      overflow: hidden;
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      font-weight: 800;
      color: #2D241E;
      padding: 0 6px;
      margin-bottom: 10px;
    }
    .dynamic-island {
      width: 86px;
      height: 20px;
      background: #000000;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 7px;
    }
    .camera-lens {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #111E2E;
      border: 1px solid #1E293B;
    }
    .status-icons {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 10.5px;
      font-weight: 700;
    }

    .step-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    .step-dot {
      width: 9px;
      height: 9px;
      border-radius: 4.5px;
      background-color: #E2DBD0;
    }
    .step-dot.active {
      background-color: #8C4A26;
      width: 22px;
      border-radius: 5px;
    }
    .step-dot.done {
      background-color: #2D5A27;
    }
    .step-line {
      width: 20px;
      height: 2.5px;
      background-color: #E2DBD0;
      margin: 0 4px;
    }
    .step-line.done {
      background-color: #2D5A27;
    }

    .step-card {
      background-color: #FFFFFF;
      border-radius: 22px;
      padding: 16px 14px;
      border: 1px solid #EBE4D8;
      box-shadow: 0 6px 18px rgba(45, 36, 30, 0.05);
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: space-between;
    }

    .step-tag {
      font-size: 9.5px;
      font-weight: 800;
      color: #2D5A27;
      letter-spacing: 1px;
      margin-bottom: 2px;
      text-transform: uppercase;
    }
    .title {
      font-family: 'Lexend', sans-serif;
      font-size: 17px;
      font-weight: 800;
      color: #2D241E;
      line-height: 1.25;
      margin-bottom: 2px;
    }
    .subtitle {
      font-size: 11px;
      color: #786B5E;
      line-height: 14.5px;
      margin-bottom: 8px;
    }

    .field-block {
      margin-top: 6px;
    }
    .field-label {
      font-size: 8.5px;
      font-weight: 800;
      color: #9C8E80;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .text-input {
      background-color: #F8F6F0;
      border-radius: 11px;
      padding: 8px 12px;
      font-size: 12.5px;
      font-weight: 600;
      color: #2D241E;
      border: 1px solid #EBE4D8;
    }

    .options-row {
      display: flex;
      gap: 6px;
    }
    .option-chip {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      background-color: #F8F6F0;
      padding: 7px 4px;
      border-radius: 11px;
      border: 1.5px solid #EBE4D8;
      font-size: 10px;
      font-weight: 600;
      color: #786B5E;
    }
    .option-chip.selected {
      background-color: #FBEFEA;
      border-color: #8C4A26;
      color: #8C4A26;
      font-weight: 800;
    }
    .chip-icon {
      font-size: 14px;
    }

    .voice-result-card {
      background-color: #FAF8F5;
      border-radius: 12px;
      padding: 8px 10px;
      margin-top: 6px;
      border: 1.5px solid #EAD8C7;
    }
    .voice-result-tag {
      font-size: 8px;
      font-weight: 800;
      color: #8C4A26;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
      text-transform: uppercase;
    }
    .voice-result-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .voice-icon-bubble {
      width: 26px;
      height: 26px;
      border-radius: 13px;
      background-color: #FBEFEA;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: #8C4A26;
      flex-shrink: 0;
    }
    .voice-result-info {
      flex: 1;
      min-width: 0;
    }
    .voice-result-name {
      font-size: 11.5px;
      font-weight: 800;
      color: #2D241E;
    }
    .voice-result-model {
      font-size: 9px;
      font-weight: 700;
      color: #8C4A26;
    }
    .demo-scenario {
      font-size: 9px;
      color: #786B5E;
      margin-top: 1px;
      font-style: italic;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .listen-demo-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      background-color: #FFFFFF;
      border-radius: 8px;
      padding: 5px 8px;
      margin-top: 5px;
      border: 1px solid #EAD8C7;
      font-size: 9.5px;
      font-weight: 800;
      color: #8C4A26;
    }

    .primary-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background-color: #8C4A26;
      color: #FFFFFF;
      padding: 10px;
      border-radius: 14px;
      margin-top: 8px;
      font-size: 12.5px;
      font-weight: 800;
      box-shadow: 0 4px 10px rgba(140, 74, 38, 0.2);
    }

    .home-indicator-bar {
      width: 120px;
      height: 4px;
      background-color: #CBD5E1;
      border-radius: 2px;
      margin: 8px auto 1px auto;
    }
  </style>
</head>
<body>

  <div class="phone-chassis">
    <div class="phone-screen">
      <div class="status-bar">
        <span>9:41</span>
        <div class="dynamic-island">
          <div class="camera-lens"></div>
        </div>
        <div class="status-icons">
          <span>5G</span>
          <span>100%</span>
        </div>
      </div>

      <div class="step-bar">
        <div class="step-dot done"></div>
        <div class="step-line done"></div>
        <div class="step-dot active"></div>
        <div class="step-line"></div>
        <div class="step-dot"></div>
      </div>

      <div class="step-card">
        <div>
          <div class="step-tag">STEP 2 OF 3</div>
          <h2 class="title">Personalize Your Voice Persona</h2>
          <p class="subtitle">Choose your preferred voice persona for sending natural Spanish WhatsApp voice notes.</p>

          <div class="field-block">
            <div class="field-label">YOUR NAME OR NICKNAME</div>
            <div class="text-input">Dorien</div>
          </div>

          <div class="field-block">
            <div class="field-label">PREFERRED VOICE GENDER</div>
            <div class="options-row">
              <div class="option-chip selected">
                <span class="chip-icon">♂</span>
                <span>Male Voice</span>
              </div>
              <div class="option-chip">
                <span class="chip-icon">♀</span>
                <span>Female Voice</span>
              </div>
            </div>
          </div>

          <div class="field-block">
            <div class="field-label">VOICE TONE / STYLE</div>
            <div class="options-row">
              <div class="option-chip">
                <span class="chip-icon">⚡</span>
                <span>Casual & Upbeat</span>
              </div>
              <div class="option-chip selected">
                <span class="chip-icon">🎙️</span>
                <span>Calm & Authority</span>
              </div>
            </div>
          </div>

          <div class="voice-result-card">
            <div class="voice-result-tag">PAIRED VOICE PERSONA</div>
            <div class="voice-result-header">
              <div class="voice-icon-bubble">♂</div>
              <div class="voice-result-info">
                <div class="voice-result-name">Diego</div>
                <div class="voice-result-model">Google Neural2 • es-PA-Neural2-B</div>
                <div class="demo-scenario">Scenario: Bocas Boat Shuttle Coordination</div>
              </div>
            </div>
            <div class="listen-demo-btn">
              <span>▶</span> Listen Practical Voice Demo (14s)
            </div>
          </div>
        </div>

        <div class="primary-btn">
          <span>Continue to Final Step</span>
          <span>→</span>
        </div>
      </div>

      <div class="home-indicator-bar"></div>
    </div>
  </div>

</body>
</html>
`;

  await pageStandaloneV1.setContent(htmlStandaloneV1, { waitUntil: 'networkidle0' });
  const v1ScreenshotBuffer = await pageStandaloneV1.screenshot({ type: 'png' });
  const v1OutPath = path.join(WORKSPACE_DIR, 'onboarding_v1_voice_options_step2.png');
  const v1GalleryPath = path.join(WORKSPACE_DIR, 'screenshots', 'onboarding_v1_voice_options_step2.png');
  fs.writeFileSync(v1OutPath, v1ScreenshotBuffer);
  fs.writeFileSync(v1GalleryPath, v1ScreenshotBuffer);
  console.log(`📸 Realistic V1 Step 2 Screen saved to ${v1OutPath}`);

  // ==========================================
  // 2. MASTER REALISTIC BEFORE & AFTER SHOWCASE (Warm Light Linen Theme & Realistic Chassis)
  // ==========================================
  const pageMaster = await browser.newPage();
  await pageMaster.setViewport({ width: 1400, height: 1040, deviceScaleFactor: 2 });

  const htmlMasterShowcase = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background-color: #F8FAF9;
      background-image: 
        radial-gradient(circle at 50% 0%, #FFFDF7 0%, #F8FAF9 45%, #F0F4F2 100%),
        radial-gradient(rgba(140, 74, 38, 0.05) 1px, transparent 1px);
      background-size: 100% 100%, 28px 28px;
      color: #0F172A;
      width: 1400px;
      height: 1040px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 28px 48px;
      overflow: hidden;
      position: relative;
    }

    .glow-left {
      position: absolute;
      top: -100px;
      left: 80px;
      width: 450px;
      height: 350px;
      background: radial-gradient(circle, rgba(239, 68, 68, 0.06) 0%, transparent 70%);
      pointer-events: none;
    }
    .glow-right {
      position: absolute;
      top: -100px;
      right: 80px;
      width: 450px;
      height: 350px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.09) 0%, transparent 70%);
      pointer-events: none;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
      border-bottom: 1.5px solid #E2E8F0;
      padding-bottom: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .mascot-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: #FFF5EE;
      border: 1.5px solid #FCD3B6;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(140, 74, 38, 0.12);
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0F172A;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-badge {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: #964824;
      background: #FFDBCD;
      padding: 4px 10px;
      border-radius: 100px;
      border: 1px solid #FD9A6F;
    }
    .header-tagline {
      font-size: 13px;
      font-weight: 600;
      color: #64748B;
    }

    .hero-title-bar {
      text-align: center;
      margin-top: 4px;
      margin-bottom: 12px;
      z-index: 10;
    }
    .hero-kicker {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #059669;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      display: inline-block;
      padding: 3px 12px;
      border-radius: 100px;
      margin-bottom: 5px;
    }
    .hero-title {
      font-family: 'Lexend', sans-serif;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.8px;
      color: #0F172A;
      line-height: 1.2;
    }
    .hero-title span.highlight {
      color: #059669;
      background: linear-gradient(120deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.25) 100%);
      padding: 0 8px;
      border-radius: 6px;
    }

    /* Main Symmetrical Showcase Flex/Grid */
    .showcase-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 52px;
      position: relative;
      z-index: 10;
      flex: 1;
      margin-bottom: 8px;
    }

    .column-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      width: 360px;
    }
    .col-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 4px;
    }
    .col-pill {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pill-before {
      background: #FEE2E2;
      color: #B91C1C;
      border: 1.5px solid #FCA5A5;
    }
    .pill-after {
      background: #D1FAE5;
      color: #065F46;
      border: 1.5px solid #6EE7B7;
    }
    .col-caption {
      font-size: 11.5px;
      font-weight: 700;
      color: #64748B;
    }

    /* Realistic Titanium Phone Chassis (Symmetrical 360x640) */
    .phone-chassis {
      width: 360px;
      height: 640px;
      background: #18191B;
      border-radius: 40px;
      padding: 9px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.12), 0 6px 18px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .phone-screen {
      background: #F8F6F0;
      border-radius: 31px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 12px 14px 8px 14px;
      position: relative;
      overflow: hidden;
    }

    .phone-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 800;
      color: #2D241E;
      padding: 0 4px;
      margin-bottom: 6px;
    }
    .status-notch {
      width: 74px;
      height: 18px;
      background: #000000;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 6px;
    }
    .notch-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #111E2E;
      border: 1px solid #1E293B;
    }
    .status-icons {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      font-weight: 700;
    }

    .transition-divider {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .trans-arrow-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
      color: #059669;
      font-size: 22px;
      font-weight: 800;
    }
    .trans-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: #64748B;
      text-transform: uppercase;
    }

    .step-bar-mini {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    .s-dot { width: 8px; height: 8px; border-radius: 4px; background: #E2DBD0; }
    .s-dot.active { background: #8C4A26; width: 18px; }
    .s-dot.done { background: #2D5A27; }
    .s-line { width: 18px; height: 2px; background: #E2DBD0; margin: 0 3px; }
    .s-line.done { background: #2D5A27; }

    .card-mini {
      background: #FFFFFF;
      border-radius: 18px;
      padding: 12px 11px;
      border: 1px solid #EBE4D8;
      box-shadow: 0 4px 12px rgba(45, 36, 30, 0.05);
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: space-between;
    }

    .t-tag { font-size: 8px; font-weight: 800; color: #2D5A27; letter-spacing: 0.8px; text-transform: uppercase; }
    .t-title { font-family: 'Lexend', sans-serif; font-size: 14px; font-weight: 800; color: #2D241E; line-height: 1.2; margin-top: 2px; }
    .t-sub { font-size: 9.5px; color: #786B5E; line-height: 12.5px; margin-top: 2px; margin-bottom: 6px; }

    .f-label { font-size: 8px; font-weight: 800; color: #9C8E80; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px; }
    .f-input { background: #F8F6F0; border-radius: 9px; padding: 6px 9px; font-size: 11px; font-weight: 600; color: #2D241E; border: 1px solid #EBE4D8; }

    .chip-group { display: flex; gap: 5px; }
    .chip-item {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 2px; background: #F8F6F0; padding: 5px 3px; border-radius: 9px; border: 1.5px solid #EBE4D8;
      font-size: 9px; font-weight: 600; color: #786B5E;
    }
    .chip-item.active { background: #FBEFEA; border-color: #8C4A26; color: #8C4A26; font-weight: 800; }

    .chip-item-large {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 4px; background: #F8F6F0; padding: 16px 8px; border-radius: 14px; border: 1.5px solid #EBE4D8;
      font-size: 12px; font-weight: 600; color: #786B5E;
    }
    .chip-item-large.active { background: #FBEFEA; border-color: #8C4A26; color: #8C4A26; font-weight: 800; }

    .voice-box {
      background: #FAF8F5; border-radius: 9px; padding: 6px 7px; margin-top: 5px; border: 1px solid #EAD8C7;
    }
    .v-tag { font-size: 7px; font-weight: 800; color: #8C4A26; text-transform: uppercase; }
    .v-row { display: flex; align-items: center; gap: 5px; margin-top: 1px; }
    .v-avatar { width: 20px; height: 20px; border-radius: 10px; background: #FBEFEA; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #8C4A26; flex-shrink: 0; }
    .v-name { font-size: 10px; font-weight: 800; color: #2D241E; }
    .v-desc { font-size: 7.5px; font-weight: 700; color: #8C4A26; }
    .v-btn { background: #FFF; border: 1px solid #EAD8C7; border-radius: 5px; padding: 3px; text-align: center; font-size: 8px; font-weight: 800; color: #8C4A26; margin-top: 3px; }

    .p-btn {
      background: #8C4A26; color: #FFF; padding: 8px; border-radius: 11px; font-size: 11px; font-weight: 800;
      display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 6px;
    }

    .home-bar { width: 90px; height: 3px; background: #CBD5E1; border-radius: 2px; margin: 4px auto 0 auto; }

    .audit-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
    }
    .audit-card {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 11px;
      line-height: 1.4;
      padding: 7px 11px;
      border-radius: 10px;
    }
    .audit-card.before {
      background: #FEF2F2;
      border: 1.5px solid #FECACA;
      color: #991B1B;
    }
    .audit-card.after {
      background: #ECFDF5;
      border: 1.5px solid #A7F3D0;
      color: #065F46;
    }
    .audit-icon { font-size: 13px; flex-shrink: 0; }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1.5px solid #E2E8F0;
      padding-top: 10px;
      font-size: 12px;
      color: #64748B;
      position: relative;
      z-index: 10;
    }
    .footer-highlight { font-weight: 700; color: #0F172A; }
  </style>
</head>
<body>

  <div class="glow-left"></div>
  <div class="glow-right"></div>

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="mascot-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8C4A26" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
        </svg>
      </div>
      <div>
        <div class="brand-title">PoquitoTalk <span class="brand-badge">Panamá 🇵🇦</span></div>
      </div>
    </div>
    <div class="header-tagline">UX Friction Reduction • Onboarding Voice Personalization</div>
  </div>

  <!-- Hero Title Bar -->
  <div class="hero-title-bar">
    <div class="hero-kicker">Friction-Free Onboarding Upgrade</div>
    <h1 class="hero-title">From Multi-Tier Voice Matrix to <span class="highlight">Instant 1-Tap Setup</span></h1>
  </div>

  <!-- Main Symmetrical Centered Layout -->
  <div class="showcase-container">

    <!-- BEFORE (v1.0) -->
    <div class="column-wrapper">
      <div class="col-header">
        <span class="col-pill pill-before">● BEFORE (v1.0)</span>
        <span class="col-caption">Cognitive Friction</span>
      </div>

      <!-- Titanium Device Frame -->
      <div class="phone-chassis">
        <div class="phone-screen">
          <div class="phone-status-bar">
            <span>9:41</span>
            <div class="status-notch">
              <div class="notch-dot"></div>
            </div>
            <div class="status-icons">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          <div class="step-bar-mini">
            <div class="s-dot done"></div>
            <div class="s-line done"></div>
            <div class="s-dot active"></div>
            <div class="s-line"></div>
            <div class="s-dot"></div>
          </div>

          <div class="card-mini">
            <div>
              <div class="t-tag">STEP 2 OF 3</div>
              <div class="t-title">Personalize Your Voice Persona</div>
              <div class="t-sub">Choose your preferred voice persona for sending natural Spanish WhatsApp notes.</div>

              <div style="margin-top: 3px;">
                <div class="f-label">YOUR NAME OR NICKNAME</div>
                <div class="f-input">Dorien</div>
              </div>

              <div style="margin-top: 4px;">
                <div class="f-label">PREFERRED VOICE GENDER</div>
                <div class="chip-group">
                  <div class="chip-item active"><span>♂</span><span>Male Voice</span></div>
                  <div class="chip-item"><span>♀</span><span>Female Voice</span></div>
                </div>
              </div>

              <div style="margin-top: 4px;">
                <div class="f-label">VOICE TONE / STYLE</div>
                <div class="chip-group">
                  <div class="chip-item"><span>⚡</span><span>Casual & Upbeat</span></div>
                  <div class="chip-item active"><span>🎙️</span><span>Calm & Authority</span></div>
                </div>
              </div>

              <div class="voice-box">
                <div class="v-tag">PAIRED VOICE PERSONA</div>
                <div class="v-row">
                  <div class="v-avatar">♂</div>
                  <div>
                    <div class="v-name">Diego</div>
                    <div class="v-desc">Google Neural2 • es-PA-Neural2-B</div>
                  </div>
                </div>
                <div class="v-btn">▶ Listen Practical Demo (14s)</div>
              </div>
            </div>

            <div class="p-btn">
              <span>Continue to Final Step</span>
              <span>→</span>
            </div>
          </div>

          <div class="home-bar"></div>
        </div>
      </div>

      <div class="audit-list">
        <div class="audit-card before">
          <span class="audit-icon">⚠️</span>
          <span><strong>4 Decision Layers:</strong> Name + Gender + Tone Matrix + Paired Demo.</span>
        </div>
        <div class="audit-card before">
          <span class="audit-icon">⚠️</span>
          <span><strong>Technical Jargon:</strong> Displayed internal model keys (<code>Google Neural2</code>).</span>
        </div>
      </div>
    </div>

    <!-- Center Transition Arrow -->
    <div class="transition-divider">
      <div class="trans-arrow-circle">→</div>
      <div class="trans-label">TRANSITION</div>
    </div>

    <!-- AFTER (v1.5) -->
    <div class="column-wrapper">
      <div class="col-header">
        <span class="col-pill pill-after">● AFTER (v1.5)</span>
        <span class="col-caption">1-Tap Experience</span>
      </div>

      <!-- Titanium Device Frame -->
      <div class="phone-chassis">
        <div class="phone-screen">
          <div class="phone-status-bar">
            <span>9:41</span>
            <div class="status-notch">
              <div class="notch-dot"></div>
            </div>
            <div class="status-icons">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          <div class="step-bar-mini">
            <div class="s-dot done"></div>
            <div class="s-line done"></div>
            <div class="s-dot active"></div>
            <div class="s-line"></div>
            <div class="s-dot"></div>
          </div>

          <div class="card-mini">
            <div>
              <div class="t-tag">STEP 2 OF 3</div>
              <div class="t-title">Personalize Your Voice</div>
              <div class="t-sub">Choose your preferred voice for sending natural Spanish WhatsApp voice notes.</div>

              <div style="margin-top: 10px;">
                <div class="f-label">YOUR NAME OR NICKNAME</div>
                <div class="f-input" style="padding: 9px 11px; font-size: 12.5px;">Dorien</div>
              </div>

              <div style="margin-top: 14px;">
                <div class="f-label">CHOOSE VOICE</div>
                <div class="chip-group">
                  <div class="chip-item-large active">
                    <span style="font-size: 20px;">♂</span>
                    <span>Male</span>
                  </div>
                  <div class="chip-item-large">
                    <span style="font-size: 20px;">♀</span>
                    <span>Female</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-btn" style="padding: 10px; font-size: 12.5px; margin-top: 12px;">
              <span>Continue to Final Step</span>
              <span>→</span>
            </div>
          </div>

          <div class="home-bar"></div>
        </div>
      </div>

      <div class="audit-list">
        <div class="audit-card after">
          <span class="audit-icon">✨</span>
          <span><strong>1-Tap Instant Flow:</strong> Direct Male ♂ / Female ♀ toggle with instant highlight.</span>
        </div>
        <div class="audit-card after">
          <span class="audit-icon">✨</span>
          <span><strong>Zero Jargon & <5s Setup:</strong> Eliminates roadblocks; fast flow to mascot.</span>
        </div>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div class="footer">
    <div>Project: <span class="footer-highlight">PoquitoTalk Voice Translator (Bocas del Toro, Panamá)</span></div>
    <div>Design Standard: <span class="footer-highlight">Hero-Apps System (@DorienVibecodes)</span> • <span class="footer-highlight">poquitotalk.hero-apps.com</span></div>
  </div>

</body>
</html>
`;

  await pageMaster.setContent(htmlMasterShowcase, { waitUntil: 'networkidle0' });
  const masterScreenshotBuffer = await pageMaster.screenshot({ type: 'png' });
  const masterOutPath = path.join(WORKSPACE_DIR, 'onboarding_voice_options_before_after.png');
  const masterGalleryPath = path.join(WORKSPACE_DIR, 'screenshots', 'onboarding_voice_options_before_after.png');
  fs.writeFileSync(masterOutPath, masterScreenshotBuffer);
  fs.writeFileSync(masterGalleryPath, masterScreenshotBuffer);
  console.log(`🎉 Calibrated Light Comparison Showcase saved to ${masterOutPath}`);

  await browser.close();
  console.log('✅ All assets updated successfully!');
}

generateV1VoiceShowcase().catch(err => {
  console.error('Error generating v1 voice showcase:', err);
  process.exit(1);
});

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';

async function generateSlangComparison() {
  console.log('🚀 Generating Polished Symmetrical Titanium Device Showcase...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background-color: #F8FAF9;
      background-image: 
        radial-gradient(circle at 50% 0%, #FFFDF7 0%, #F8FAF9 45%, #F0F4F2 100%),
        radial-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px);
      background-size: 100% 100%, 28px 28px;
      color: #0F172A;
      width: 1600px;
      height: 1050px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 30px 52px;
      overflow: hidden;
      position: relative;
    }

    /* Ambient glow */
    .glow-left {
      position: absolute;
      top: -120px;
      left: 100px;
      width: 500px;
      height: 400px;
      background: radial-gradient(circle, rgba(239, 68, 68, 0.06) 0%, transparent 70%);
      pointer-events: none;
    }
    .glow-right {
      position: absolute;
      top: -120px;
      right: 100px;
      width: 500px;
      height: 400px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Top Navigation / Brand Header */
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
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: #E8F5E9;
      border: 1.5px solid #A7F3D0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 25px;
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
      color: #047857;
      background: #D1FAE5;
      padding: 4px 10px;
      border-radius: 100px;
      border: 1px solid #6EE7B7;
    }
    .header-tagline {
      font-size: 13px;
      font-weight: 600;
      color: #64748B;
      letter-spacing: -0.1px;
    }

    /* Hero Title Bar */
    .hero-title-bar {
      text-align: center;
      margin-top: 4px;
      margin-bottom: 14px;
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
      margin-bottom: 6px;
    }
    .hero-title {
      font-family: 'Lexend', sans-serif;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.8px;
      color: #0F172A;
      line-height: 1.2;
    }
    .hero-title span.strike {
      color: #EF4444;
      text-decoration: line-through;
      text-decoration-thickness: 3px;
      text-decoration-color: #EF4444;
    }
    .hero-title span.highlight {
      color: #059669;
      background: linear-gradient(120deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.25) 100%);
      padding: 0 8px;
      border-radius: 6px;
    }

    /* Main Showcase Grid */
    .showcase-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 32px;
      align-items: stretch;
      position: relative;
      z-index: 10;
      flex: 1;
      margin-bottom: 10px;
    }

    /* Columns */
    .column-wrapper {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .col-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 6px;
    }
    .col-pill {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
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
      font-size: 12px;
      font-weight: 700;
      color: #64748B;
    }

    /* Titanium Phone Chassis - Symmetrical & Balanced */
    .phone-chassis {
      background: #18191B;
      border-radius: 36px;
      padding: 10px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      position: relative;
      height: 600px;
    }
    .phone-screen {
      background: #FAF9F6;
      border-radius: 26px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 14px 16px 14px 16px;
      position: relative;
      overflow: hidden;
    }

    /* Status Bar */
    .phone-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      font-weight: 800;
      color: #0F172A;
      padding: 0 4px;
    }
    .status-notch {
      width: 76px;
      height: 16px;
      background: #18191B;
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
      background: #0B0F19;
      border: 1px solid #334155;
    }

    .screen-body-flow {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Contractor Top Header */
    .contractor-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 8px 12px;
    }
    .contractor-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .c-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 11px;
    }
    .avatar-before { background: #F1F5F9; color: #475569; }
    .avatar-after { background: #D1FAE5; color: #047857; border: 1.5px solid #6EE7B7; }
    .c-info-name {
      font-size: 12.5px;
      font-weight: 800;
      color: #0F172A;
      line-height: 1.2;
    }
    .c-info-role {
      font-size: 10.5px;
      font-weight: 600;
      color: #64748B;
    }
    .c-status-chip {
      font-size: 9.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 100px;
    }
    .status-offline { background: #FEE2E2; color: #991B1B; }
    .status-online { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }

    /* Input English Box */
    .prompt-card {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 10px 12px;
    }
    .prompt-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3px;
    }
    .prompt-label {
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #64748B;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .prompt-body {
      font-size: 13px;
      font-weight: 600;
      color: #1E293B;
      line-height: 1.35;
    }

    /* Translation Speech Bubble */
    .speech-card {
      border-radius: 14px;
      padding: 12px 14px;
      position: relative;
    }
    .speech-bad {
      background: #FFFFFF;
      border: 1.5px solid #FECACA;
    }
    .speech-good {
      background: #ECFDF5;
      border: 2px solid #6EE7B7;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.08);
    }
    .speech-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .speech-tag {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 5px;
    }
    .tag-tone-bad { background: #FEE2E2; color: #991B1B; }
    .tag-tone-good { background: #10B981; color: #FFFFFF; }
    
    .speech-text-block {
      font-size: 14.5px;
      line-height: 1.45;
      font-weight: 700;
    }
    .text-robotic { color: #475569; font-family: -apple-system, sans-serif; }
    .text-slang { color: #064E3B; font-family: 'Plus Jakarta Sans', sans-serif; }
    
    .slang-hl {
      background: #FEF08A;
      color: #854D0E;
      padding: 0 2px;
      border-radius: 3px;
      font-weight: 800;
      border: 1px solid #FDE047;
      display: inline;
    }

    /* Robotic audio placeholder bar */
    .audio-bar-bad {
      background: #F8FAFC;
      border: 1.5px dashed #CBD5E1;
      border-radius: 10px;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
    }
    .audio-tag-bad {
      font-size: 10px;
      font-weight: 700;
      color: #94A3B8;
    }

    /* Audio Player Bar */
    .audio-bar {
      background: #FFFFFF;
      border: 1.5px solid #A7F3D0;
      border-radius: 10px;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
    .play-btn {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #10B981;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      flex-shrink: 0;
    }
    .bars-wrap {
      display: flex;
      align-items: center;
      gap: 2.5px;
      flex: 1;
      height: 14px;
    }
    .b {
      width: 2.5px;
      background: #34D399;
      border-radius: 2px;
    }
    .audio-tag {
      font-size: 10px;
      font-weight: 800;
      color: #047857;
      white-space: nowrap;
    }

    /* Real-world WhatsApp interaction snippet */
    .wa-chat-box {
      border-radius: 12px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .wa-bad {
      background: #FFF1F2;
      border: 1.5px solid #FECDD3;
    }
    .wa-good {
      background: #F0FDF4;
      border: 1.5px solid #BBF7D0;
    }
    .wa-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
    }
    .wa-reply {
      font-size: 11.5px;
      line-height: 1.35;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 8px;
    }
    .reply-bad {
      background: #FFFFFF;
      color: #991B1B;
      border: 1px dashed #FDA4AF;
    }
    .reply-good {
      background: #FFFFFF;
      color: #065F46;
      border: 1px solid #A7F3D0;
    }

    /* Bottom Outcome summary */
    .outcome-summary {
      text-align: center;
      font-size: 11.5px;
      font-weight: 800;
      padding-top: 6px;
    }
    .out-bad { color: #DC2626; }
    .out-good { color: #059669; }

    /* Central Transition Divider */
    .divider-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      z-index: 20;
    }
    .arrow-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 2px solid #10B981;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.25);
      color: #059669;
      font-size: 20px;
      font-weight: 900;
    }
    .vs-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #475569;
      background: #F1F5F9;
      border: 1px solid #CBD5E1;
      padding: 3px 9px;
      border-radius: 100px;
    }
    .metric-badge {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 14px;
      padding: 8px 12px;
      text-align: center;
      box-shadow: 0 6px 16px rgba(0,0,0,0.04);
      width: 130px;
    }
    .metric-val {
      font-family: 'Lexend', sans-serif;
      font-size: 17px;
      font-weight: 900;
      color: #059669;
    }
    .metric-sub {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748B;
      margin-top: 1px;
    }

    /* Bottom Features & Slang Glossary Bar */
    .footer-bar {
      border-top: 1.5px solid #E2E8F0;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
    }
    .glossary-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .glossary-label {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #64748B;
    }
    .glossary-chips {
      display: flex;
      gap: 7px;
    }
    .chip {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 10.5px;
      font-weight: 700;
      color: #334155;
    }
    .chip span {
      color: #059669;
      font-weight: 800;
    }
    .meta-credits {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 11.5px;
      font-weight: 700;
      color: #64748B;
    }
    .meta-credits a {
      color: #059669;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <!-- Ambient Glow -->
  <div class="glow-left"></div>
  <div class="glow-right"></div>

  <!-- Header -->
  <header class="header">
    <div class="brand">
      <div class="mascot-icon">
        <svg width="26" height="26" viewBox="0 0 180 180" fill="none">
          <path d="M 40 142 C 30 124 28 104 32 82 C 36 54 54 30 78 30 C 98 30 108 48 106 68 C 103 90 104 118 98 134 C 88 150 62 154 40 142 Z" fill="#10B981" stroke="#047857" stroke-width="4.5"/>
          <circle cx="82" cy="54" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
          <circle cx="80.5" cy="54" r="4.5" fill="#0F172A" />
          <path d="M 96 48 C 112 48 120 62 106 74 C 101 77 94 73 95 67 C 97 61 94 52 96 48 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" />
        </svg>
      </div>
      <div class="brand-title">
        PoquitoTalk
        <span class="brand-badge">Bocas del Toro (Panama) 🇵🇦</span>
      </div>
    </div>
    <div class="header-tagline">
      Real Dialect Audio for WhatsApp & Island Living
    </div>
  </header>

  <!-- Hero Title -->
  <div class="hero-title-bar">
    <div class="hero-kicker">COMMUNICATION BREAKTHROUGH</div>
    <h1 class="hero-title">
      <span class="strike">Robotic Textbook Spanish</span> vs. <span class="highlight">Authentic Panamanian Street Slang</span>
    </h1>
  </div>

  <!-- Showcase Grid -->
  <div class="showcase-grid">

    <!-- BEFORE COLUMN: WITHOUT SLANG -->
    <div class="column-wrapper">
      <div class="col-header">
        <div class="col-pill pill-before">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          WITHOUT SLANG
        </div>
        <div class="col-caption">Standard Generic Translation</div>
      </div>

      <!-- Left Device Chassis -->
      <div class="phone-chassis">
        <div class="phone-screen">
          
          <!-- Status Bar -->
          <div class="phone-status-bar">
            <span>9:41</span>
            <div class="status-notch"><div class="notch-dot"></div></div>
            <span>5G 100%</span>
          </div>

          <div class="screen-body-flow">
            <!-- Contractor Bar -->
            <div class="contractor-bar">
              <div class="contractor-left">
                <div class="c-avatar avatar-before">MC</div>
                <div>
                  <div class="c-info-name">Contractor</div>
                  <div class="c-info-role">A/C Technician</div>
                </div>
              </div>
              <span class="c-status-chip status-offline">Unfamiliar User</span>
            </div>

            <!-- English Prompt -->
            <div class="prompt-card">
              <div class="prompt-label-row">
                <div class="prompt-label">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  English Request
                </div>
              </div>
              <div class="prompt-body">
                "Hi, my air conditioner is leaking water in the bedroom. Can a technician come check it today?"
              </div>
            </div>

            <!-- Spanish Translation -->
            <div class="speech-card speech-bad">
              <div class="speech-meta-row">
                <span class="speech-tag tag-tone-bad">Robotic Output</span>
                <span style="font-size: 10px; font-weight: 700; color: #94A3B8;">Text-only generic</span>
              </div>
              <div class="speech-text-block text-robotic">
                "Hola señor, disculpe las molestias. El acondicionador de aire tiene una fuga de líquido en la recámara. ¿Sería posible que un técnico venga hoy?"
              </div>

              <!-- Audio fallback bar -->
              <div class="audio-bar-bad">
                <span class="audio-tag-bad">✕ No localized audio voice note available</span>
                <span style="font-size: 9px; color: #94A3B8; font-weight: 700;">Copy text only</span>
              </div>
            </div>

            <!-- Real-world WhatsApp outcome -->
            <div class="wa-chat-box wa-bad">
              <div class="wa-row" style="color: #991B1B;">
                <span>WhatsApp (10:14 AM)</span>
                <span>⚪ Sent (Unread)</span>
              </div>
              <div class="wa-reply reply-bad">
                <strong>Left on Read:</strong> "Sounds like a tourist. Contractor prioritizes locals first or quotes high gringo rates."
              </div>
            </div>
          </div>

          <div class="outcome-summary out-bad">
            ✕ Delayed response • Misunderstood urgency • Tourist markup
          </div>

        </div>
      </div>
    </div>

    <!-- CENTER DIVIDER -->
    <div class="divider-zone">
      <div class="vs-pill">VS</div>
      <div class="arrow-circle">➔</div>
      <div class="metric-badge">
        <div class="metric-val">4.8x</div>
        <div class="metric-sub">Faster WhatsApp Replies</div>
      </div>
      <div class="metric-badge">
        <div class="metric-val">0%</div>
        <div class="metric-sub">"Gringo Tax" Markup</div>
      </div>
    </div>

    <!-- AFTER COLUMN: WITH PANAMANIAN SLANG -->
    <div class="column-wrapper">
      <div class="col-header">
        <div class="col-pill pill-after">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          WITH PANAMANIAN SLANG
        </div>
        <div class="col-caption">PoquitoTalk Studio Audio</div>
      </div>

      <!-- Right Device Chassis -->
      <div class="phone-chassis">
        <div class="phone-screen" style="background: #FAFDF9;">
          
          <!-- Status Bar -->
          <div class="phone-status-bar">
            <span>9:41</span>
            <div class="status-notch"><div class="notch-dot"></div></div>
            <span>5G 100%</span>
          </div>

          <div class="screen-body-flow">
            <!-- Contractor Bar -->
            <div class="contractor-bar" style="border-color: #BBF7D0; background: #F0FDF4;">
              <div class="contractor-left">
                <div class="c-avatar avatar-after">MC</div>
                <div>
                  <div class="c-info-name">Maestro Carlos</div>
                  <div class="c-info-role">A/C & Refrigeration • Bocas Town</div>
                </div>
              </div>
              <span class="c-status-chip status-online">🟢 Active Now</span>
            </div>

            <!-- English Prompt -->
            <div class="prompt-card" style="background: #FFFFFF; border-color: #A7F3D0;">
              <div class="prompt-label-row">
                <div class="prompt-label" style="color: #047857;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  English Request
                </div>
              </div>
              <div class="prompt-body">
                "Hi, my air conditioner is leaking water in the bedroom. Can a technician come check it today?"
              </div>
            </div>

            <!-- Authentic Panamanian Spanish -->
            <div class="speech-card speech-good">
              <div class="speech-meta-row">
                <span class="speech-tag tag-tone-good">Authentic Panamanian</span>
                <span style="font-size: 10px; font-weight: 700; color: #047857;">Voice: Diego (Panamá)</span>
              </div>
              <div class="speech-text-block text-slang">“<span class="slang-hl">¡Qué xopa!</span> Maestro Carlos, el <span class="slang-hl">split</span> está botando <span class="slang-hl">buco</span> agua en la recámara. ¿A qué hora puede pasar a <span class="slang-hl">chequearlo</span>?”</div>

              <!-- Audio Player Bar -->
              <div class="audio-bar">
                <div class="play-btn">▶</div>
                <div class="bars-wrap">
                  <div class="b" style="height: 5px;"></div>
                  <div class="b" style="height: 10px;"></div>
                  <div class="b" style="height: 14px;"></div>
                  <div class="b" style="height: 8px;"></div>
                  <div class="b" style="height: 15px;"></div>
                  <div class="b" style="height: 12px;"></div>
                  <div class="b" style="height: 7px;"></div>
                  <div class="b" style="height: 13px;"></div>
                  <div class="b" style="height: 9px;"></div>
                  <div class="b" style="height: 6px;"></div>
                </div>
                <span class="audio-tag">0:04 • 1-Tap Voice Note</span>
              </div>
            </div>

            <!-- Real-world WhatsApp outcome -->
            <div class="wa-chat-box wa-good">
              <div class="wa-row" style="color: #065F46;">
                <span>WhatsApp (10:16 AM)</span>
                <span>✓✓ Read & Replied</span>
              </div>
              <div class="wa-reply reply-good">
                <strong>Maestro Carlos:</strong> "¡Qué xopa compa! Voy saliendo con el manómetro y el gas. Llego a las 2pm a chequearlo."
              </div>
            </div>
          </div>

          <div class="outcome-summary out-good">
            ✓ 2-minute reply • Same-day service • Fair local rate
          </div>

        </div>
      </div>
    </div>

  </div>

  <!-- Footer Glossary -->
  <footer class="footer-bar">
    <div class="glossary-row">
      <span class="glossary-label">Bocas Slang Decoded:</span>
      <div class="glossary-chips">
        <div class="chip"><span>Qué xopa</span> = What's up / Greeting</div>
        <div class="chip"><span>Split</span> = AC Unit</div>
        <div class="chip"><span>Buco</span> = A ton / Lots of</div>
        <div class="chip"><span>Chequear</span> = Inspect / Fix</div>
        <div class="chip"><span>Panga</span> = Water Taxi</div>
        <div class="chip"><span>Fren</span> = Friend / Bro</div>
      </div>
    </div>
    <div class="meta-credits">
      <span>PoquitoTalk v1.5</span>
      <span>•</span>
      <a href="https://poquitotalk.hero-apps.com">poquitotalk.hero-apps.com</a>
    </div>
  </footer>

</body>
</html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 600));

    const screenshotDir = path.join(WORKSPACE_DIR, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(screenshotDir, 'before_after_slang_comparison.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`✅ Saved screenshot to: ${screenshotPath}`);

    const rootPath = path.join(WORKSPACE_DIR, 'slang_before_after_comparison.png');
    fs.copyFileSync(screenshotPath, rootPath);
    console.log(`✅ Copied directly to root workspace: ${rootPath}`);

    const rootAltPath = path.join(WORKSPACE_DIR, 'before_after_slang_comparison.png');
    fs.copyFileSync(screenshotPath, rootAltPath);

  } finally {
    await browser.close();
  }

  console.log('🎉 Slang Before & After Showcase Generated Successfully!');
}

generateSlangComparison().catch(err => {
  console.error('Error generating comparison:', err);
  process.exit(1);
});

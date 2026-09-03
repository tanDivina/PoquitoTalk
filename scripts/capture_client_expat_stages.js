#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = path.join(__dirname, '..');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateClientExpatShowcase() {
  console.log('🚀 Launching Puppeteer to generate Client / Expat Phone Stages Showcase...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1400,
    height: 940,
    deviceScaleFactor: 2, // 2x Retina
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Lexend:wght@600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    body {
      width: 1400px;
      height: 940px;
      background: #FAF8F5;
      background-image: 
        linear-gradient(to right, rgba(150, 72, 36, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(150, 72, 36, 0.05) 1px, transparent 1px);
      background-size: 32px 32px;
      color: #1A1208;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 28px 40px 24px;
      overflow: hidden;
    }

    /* Top Showcase Header */
    .showcase-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      background: #EAF4E8;
      border: 1px solid #A8D5A2;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 800;
      color: #1E6426;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .badge-pill .live-dot {
      width: 7px;
      height: 7px;
      background: #16A34A;
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(22, 163, 74, 0.8);
    }

    .main-title {
      font-family: 'Lexend', sans-serif;
      font-size: 27px;
      font-weight: 900;
      letter-spacing: -0.8px;
      color: #1A1208;
    }

    .main-title span {
      color: #964824;
    }

    .main-subtitle {
      font-size: 13.5px;
      font-weight: 600;
      color: #6B5E4C;
    }

    /* 3-Column Phone Grid */
    .phones-grid {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: 32px;
      width: 100%;
    }

    .stage-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .stage-tag {
      font-size: 12px;
      font-weight: 800;
      padding: 4px 14px;
      border-radius: 20px;
      letter-spacing: 0.02em;
    }

    .tag-step1 { background: #E0F2FE; color: #0369A1; border: 1px solid #BAE6FD; }
    .tag-step2 { background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; }
    .tag-step3 { background: #DCFCE7; color: #15803D; border: 1px solid #BBF7D0; }

    /* iPhone 16 Chassis */
    .phone-chassis {
      width: 320px;
      height: 648px;
      background: #111417;
      border-radius: 46px;
      padding: 9px;
      box-shadow: 
        0 24px 48px -12px rgba(26, 18, 8, 0.35),
        0 0 0 1px rgba(255, 255, 255, 0.15),
        inset 0 0 0 2px #262B30;
      position: relative;
    }

    .phone-screen {
      width: 100%;
      height: 100%;
      background: #FBF9F5;
      border-radius: 38px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Status Bar */
    .status-bar {
      height: 32px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 700;
      color: #1A1208;
      z-index: 30;
    }

    .dynamic-island {
      width: 82px;
      height: 20px;
      background: #000000;
      border-radius: 100px;
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
    }

    /* Screen Navbar */
    .screen-navbar {
      padding: 6px 14px 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(150, 72, 36, 0.10);
      background: rgba(251, 249, 245, 0.95);
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .brand-svg {
      width: 26px;
      height: 26px;
    }

    .brand-text-col {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .brand-text-col .title {
      font-family: 'Lexend', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: #1A1208;
    }

    .brand-text-col .title span {
      color: #964824;
    }

    .brand-text-col .sub {
      font-size: 8.5px;
      font-weight: 600;
      color: #78716C;
    }

    .header-pill {
      font-size: 9.5px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 100px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .pill-pro { background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; }
    .pill-live { background: #EAF4E8; color: #1E6426; border: 1px solid #A8D5A2; }

    /* Screen Content Area */
    .screen-content {
      flex: 1;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow: hidden;
    }

    /* Cards */
    .card {
      background: #FFFFFF;
      border: 1px solid rgba(150, 72, 36, 0.12);
      border-radius: 16px;
      padding: 10px 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }

    .card-label {
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .label-en { color: #0284C7; }
    .label-es { color: #D97706; }
    .label-contractor { color: #059669; }

    .card-text-en {
      font-size: 12px;
      font-weight: 600;
      color: #1A1208;
      line-height: 1.35;
    }

    .card-text-es {
      font-size: 11.5px;
      font-weight: 700;
      color: #1A1208;
      line-height: 1.35;
    }

    .card-translation-sub {
      font-size: 10px;
      font-style: italic;
      color: #6B5E4C;
      margin-top: 3px;
    }

    /* Audio Waveform Row */
    .audio-player-row {
      margin-top: 6px;
      background: #F4F0E8;
      border-radius: 10px;
      padding: 5px 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .play-btn-mini {
      width: 22px;
      height: 22px;
      background: #964824;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 9px;
    }

    .wave-bars-mini {
      display: flex;
      align-items: center;
      gap: 2px;
      flex: 1;
    }

    .wave-bar {
      width: 2.5px;
      background: #964824;
      border-radius: 2px;
      height: 8px;
    }

    .wave-bar:nth-child(2) { height: 14px; }
    .wave-bar:nth-child(3) { height: 18px; }
    .wave-bar:nth-child(4) { height: 10px; }
    .wave-bar:nth-child(5) { height: 16px; }
    .wave-bar:nth-child(6) { height: 12px; }
    .wave-bar:nth-child(7) { height: 6px; }
    .wave-bar:nth-child(8) { height: 15px; }

    .audio-time {
      font-size: 9px;
      font-weight: 700;
      color: #6B5E4C;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Action Buttons */
    .btn-whatsapp {
      background: #25D366;
      color: #FFFFFF;
      border: none;
      border-radius: 12px;
      padding: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 11.5px;
      font-weight: 800;
      box-shadow: 0 3px 10px rgba(37, 211, 102, 0.3);
    }

    .btn-walkie-secondary {
      background: #FFFFFF;
      color: #964824;
      border: 1.5px solid rgba(150, 72, 36, 0.3);
      border-radius: 12px;
      padding: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 700;
    }

    /* Recipient Bar */
    .recipient-bar {
      background: #FFFFFF;
      border: 1px solid rgba(150, 72, 36, 0.12);
      border-radius: 14px;
      padding: 7px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .recipient-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .recipient-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #E0F2FE;
      color: #0369A1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }

    .recipient-meta h4 {
      font-size: 11px;
      font-weight: 800;
      color: #1A1208;
    }

    .recipient-meta p {
      font-size: 9px;
      font-weight: 600;
      color: #059669;
    }

    /* Radar / Waiting Card */
    .radar-card {
      background: linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%);
      border: 1.5px dashed #86EFAC;
      border-radius: 16px;
      padding: 14px 10px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .radar-animation {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(37, 211, 102, 0.15);
      border: 2px solid #22C55E;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .radar-card h3 {
      font-size: 11.5px;
      font-weight: 800;
      color: #15803D;
    }

    .radar-card p {
      font-size: 9.5px;
      font-weight: 600;
      color: #166534;
      line-height: 1.3;
    }

    /* Live Feed Bubbles */
    .chat-bubble-out {
      background: #FFFFFF;
      border: 1px solid rgba(150, 72, 36, 0.15);
      border-radius: 14px 14px 4px 14px;
      padding: 8px 10px;
      align-self: flex-end;
      max-width: 92%;
    }

    .chat-bubble-in {
      background: #ECFDF5;
      border: 1.5px solid #A7F3D0;
      border-radius: 14px 14px 14px 4px;
      padding: 8px 10px;
      align-self: flex-start;
      max-width: 95%;
    }

    /* Quick Suggestion Chips */
    .quick-chips {
      display: flex;
      gap: 4px;
      overflow: hidden;
      margin-top: 2px;
    }

    .chip {
      background: #FFFFFF;
      border: 1px solid rgba(150, 72, 36, 0.15);
      border-radius: 100px;
      padding: 4px 8px;
      font-size: 9px;
      font-weight: 700;
      color: #6B5E4C;
      white-space: nowrap;
    }

    /* Footer Controls */
    .screen-footer {
      padding: 8px 14px 12px;
      background: #FFFFFF;
      border-top: 1px solid rgba(150, 72, 36, 0.10);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .ptt-btn {
      width: 100%;
      background: #964824;
      color: #FFFFFF;
      border: none;
      border-radius: 14px;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 11.5px;
      font-weight: 800;
      box-shadow: 0 3px 12px rgba(150, 72, 36, 0.3);
    }

    .ptt-sub {
      font-size: 9px;
      font-weight: 600;
      color: #78716C;
    }

    /* Bottom Showcase Explanation Bar */
    .showcase-footer {
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      background: #FFFFFF;
      border: 1px solid rgba(150, 72, 36, 0.12);
      border-radius: 18px;
      padding: 12px 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }

    .footer-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 2px;
      max-width: 320px;
    }

    .footer-col h4 {
      font-size: 12.5px;
      font-weight: 800;
      color: #1A1208;
    }

    .footer-col p {
      font-size: 11px;
      font-weight: 600;
      color: #6B5E4C;
    }
  </style>
</head>
<body>

  <!-- Top Showcase Header -->
  <header class="showcase-header">
    <div class="badge-pill">
      <div class="live-dot"></div>
      Expat / Client App Experience (English Side)
    </div>
    <h1 class="main-title">What Happens on the <span>Expat's Phone</span></h1>
    <p class="main-subtitle">From English voice input & WhatsApp dispatch to real-time translated incoming contractor audio.</p>
  </header>

  <!-- 3 Phone Columns -->
  <div class="phones-grid">

    <!-- STAGE 1: Speak & Dispatch -->
    <div class="stage-column">
      <div class="stage-tag tag-step1">1. Speak & Dispatch Voice Note</div>
      <div class="phone-chassis">
        <div class="phone-screen">
          <div class="status-bar">
            <span>9:41</span>
            <div class="dynamic-island"></div>
            <span>5G 100%</span>
          </div>

          <div class="screen-navbar">
            <div class="brand-wrap">
              <svg class="brand-svg" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="46" fill="#10B981" />
                <circle cx="50" cy="42" r="22" fill="#FFFFFF" />
                <circle cx="54" cy="40" r="8" fill="#1A1208" />
                <path d="M68 40 L88 44 L68 54 Z" fill="#F59E0B" />
              </svg>
              <div class="brand-text-col">
                <span class="title">Poquito<span>Talk</span></span>
                <span class="sub">Bocas del Toro, Panamá</span>
              </div>
            </div>
            <div class="header-pill pill-pro">★ Pro Unlimited</div>
          </div>

          <div class="screen-content">
            <!-- English Input Card -->
            <div class="card">
              <div class="card-label label-en">
                <span>🇺🇸 Your English Voice Message</span>
                <span>0:04</span>
              </div>
              <p class="card-text-en">"Hello friend, do you have a boat available to take us from Bocas Town to Isla Solarte today at 2:00 PM?"</p>
            </div>

            <!-- Spanish Translation Card -->
            <div class="card" style="border-color: rgba(217, 119, 6, 0.3); background: #FFFDF9;">
              <div class="card-label label-es">
                <span>🇵🇦 Island Spanish Voice Note (Mateo)</span>
                <span>HD Audio</span>
              </div>
              <p class="card-text-es">"Hola amigo, ¿tienes lancha disponible para llevarnos de Bocas Town a Isla Solarte hoy a las 2:00 PM?"</p>
              
              <div class="audio-player-row">
                <div class="play-btn-mini">▶</div>
                <div class="wave-bars-mini">
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                  <div class="wave-bar"></div>
                </div>
                <span class="audio-time">0:05</span>
              </div>
            </div>

            <!-- Send Action -->
            <div class="btn-whatsapp">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.075-2.227-.557-1.959-.808-3.21-2.824-3.307-2.955-.097-.13-.787-1.047-.787-1.996 0-.949.499-1.413.676-1.606.178-.193.388-.242.518-.242.13 0 .259.001.372.007.119.006.278-.045.434.331.162.389.551 1.344.6 1.442.048.097.08.211.016.34-.064.13-.097.211-.194.324-.097.114-.204.254-.291.34-.097.098-.199.204-.086.398.113.195.503.829 1.08 1.344.742.662 1.368.866 1.562.963.194.097.307.081.421-.049.113-.13.486-.567.616-.761.13-.194.259-.162.437-.097.178.065 1.133.535 1.327.632.195.097.324.146.372.227.049.081.049.47-.095.875z"/></svg>
              Send Voice Note & Open Channel
            </div>

            <div class="btn-walkie-secondary">
              ⚡ 2-Way Magic Link Included
            </div>
          </div>

          <div class="screen-footer">
            <button class="ptt-btn">🎙️ Tap to Speak in English</button>
            <span class="ptt-sub">Auto-converts to Panamanian Spanish</span>
          </div>
        </div>
      </div>
    </div>

    <!-- STAGE 2: Channel Live & Waiting -->
    <div class="stage-column">
      <div class="stage-tag tag-step2">2. Live Channel • Contractor Listening</div>
      <div class="phone-chassis">
        <div class="phone-screen">
          <div class="status-bar">
            <span>9:42</span>
            <div class="dynamic-island"></div>
            <span>5G 100%</span>
          </div>

          <div class="screen-navbar">
            <div class="brand-wrap">
              <svg class="brand-svg" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="46" fill="#10B981" />
                <circle cx="50" cy="42" r="22" fill="#FFFFFF" />
                <circle cx="54" cy="40" r="8" fill="#1A1208" />
                <path d="M68 40 L88 44 L68 54 Z" fill="#F59E0B" />
              </svg>
              <div class="brand-text-col">
                <span class="title">Poquito<span>Talk</span></span>
                <span class="sub">Canal Walkie-Talkie</span>
              </div>
            </div>
            <div class="header-pill pill-live">● Live 14:48</div>
          </div>

          <div class="screen-content">
            <!-- Recipient Connected -->
            <div class="recipient-bar">
              <div class="recipient-info">
                <div class="recipient-avatar">🚤</div>
                <div class="recipient-meta">
                  <h4>Capitán Luis (Boat Taxi)</h4>
                  <p>● Link Opened in Bocas Town</p>
                </div>
              </div>
              <span style="font-size: 9px; font-weight: 700; color: #78716C;">Turn 1/15</span>
            </div>

            <!-- Outgoing Message Bubble -->
            <div class="chat-bubble-out">
              <div class="card-label label-en" style="margin-bottom: 2px;">
                <span>You (English Voice Note Sent)</span>
                <span>✓✓ Sent</span>
              </div>
              <p class="card-text-en">"Hello friend, do you have a boat available to take us to Isla Solarte today at 2:00 PM?"</p>
              <p class="card-translation-sub">Spanish Audio Dispatched to Contractor's Phone</p>
            </div>

            <!-- Waiting Radar -->
            <div class="radar-card">
              <div class="radar-animation">📡</div>
              <h3>Contractor is Listening</h3>
              <p>Capitán Luis received your Spanish voice note and is recording his reply...</p>
            </div>
          </div>

          <div class="screen-footer">
            <button class="ptt-btn" style="background: #0284C7;">🎙️ Push to Talk (Add Message)</button>
            <span class="ptt-sub">Channel active for 15 minutes</span>
          </div>
        </div>
      </div>
    </div>

    <!-- STAGE 3: Incoming Contractor Audio Translated -->
    <div class="stage-column">
      <div class="stage-tag tag-step3">3. Contractor Reply Received in English</div>
      <div class="phone-chassis">
        <div class="phone-screen">
          <div class="status-bar">
            <span>9:43</span>
            <div class="dynamic-island"></div>
            <span>5G 100%</span>
          </div>

          <div class="screen-navbar">
            <div class="brand-wrap">
              <svg class="brand-svg" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="46" fill="#10B981" />
                <circle cx="50" cy="42" r="22" fill="#FFFFFF" />
                <circle cx="54" cy="40" r="8" fill="#1A1208" />
                <path d="M68 40 L88 44 L68 54 Z" fill="#F59E0B" />
              </svg>
              <div class="brand-text-col">
                <span class="title">Poquito<span>Talk</span></span>
                <span class="sub">Canal Walkie-Talkie</span>
              </div>
            </div>
            <div class="header-pill pill-live">● Live 13:20</div>
          </div>

          <div class="screen-content">
            <!-- Outgoing Bubble (Compact) -->
            <div class="chat-bubble-out" style="padding: 6px 8px;">
              <div class="card-label label-en" style="margin-bottom: 1px; font-size: 8.5px;">
                <span>You</span>
                <span>9:41 AM</span>
              </div>
              <p class="card-text-en" style="font-size: 10.5px;">"Boat available to Isla Solarte at 2:00 PM?"</p>
            </div>

            <!-- Incoming Contractor Message Translated -->
            <div class="chat-bubble-in">
              <div class="card-label label-contractor">
                <span>🔊 Capitán Luis (Panamá)</span>
                <span style="color: #15803D; font-weight: 800;">Translated to English</span>
              </div>

              <!-- English Translated Audio Banner -->
              <p class="card-text-en" style="font-size: 12.5px; color: #064E3B; font-weight: 700;">
                "Hello! Yes sure, I have the boat ready at Bocas Town main dock. I'll see you at 2:00 PM."
              </p>

              <!-- Audio Player English -->
              <div class="audio-player-row" style="background: #DCFCE7;">
                <div class="play-btn-mini" style="background: #059669;">▶</div>
                <div class="wave-bars-mini">
                  <div class="wave-bar" style="background: #059669;"></div>
                  <div class="wave-bar" style="background: #059669;"></div>
                  <div class="wave-bar" style="background: #059669;"></div>
                  <div class="wave-bar" style="background: #059669;"></div>
                  <div class="wave-bar" style="background: #059669;"></div>
                  <div class="wave-bar" style="background: #059669;"></div>
                </div>
                <span class="audio-time" style="color: #064E3B;">0:04 EN</span>
              </div>

              <!-- Original Spanish Transcript Accordion -->
              <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid rgba(5, 150, 105, 0.2); font-size: 9.5px; color: #047857;">
                <strong>Original Spanish:</strong> "¡Hola! Sí claro, tengo la lancha lista en el muelle de Bocas Town. Los veo a las 2:00 PM."
              </div>
            </div>

            <!-- Quick Response Suggestions -->
            <div class="quick-chips">
              <div class="chip">👍 See you there!</div>
              <div class="chip">💵 How much is fare?</div>
              <div class="chip">🙏 Gracias!</div>
            </div>
          </div>

          <div class="screen-footer">
            <button class="ptt-btn" style="background: #16A34A;">🎙️ Reply with Voice in English</button>
            <span class="ptt-sub">Bilingual 2-Way Audio Connected</span>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Bottom Showcase Explanation Bar -->
  <footer class="showcase-footer">
    <div class="footer-col">
      <h4>1. Natural Voice in English</h4>
      <p>Speak English naturally. Poquito generates studio-quality island Spanish audio and creates a zero-install magic link.</p>
    </div>
    <div style="width: 1px; height: 32px; background: rgba(150, 72, 36, 0.15);"></div>
    <div class="footer-col">
      <h4>2. Live Walkie-Talkie Radar</h4>
      <p>Contractor opens WhatsApp link on any browser with zero app installation. Live session connects automatically.</p>
    </div>
    <div style="width: 1px; height: 32px; background: rgba(150, 72, 36, 0.15);"></div>
    <div class="footer-col">
      <h4>3. Instant English Translation</h4>
      <p>Contractor speaks Spanish from the boat or site. Expat hears clear English audio with full bilingual transcripts.</p>
    </div>
  </footer>

</body>
</html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await sleep(800);

  const showcasePath = path.join(WORKSPACE_DIR, 'client_expat_3_stages_showcase.png');
  await page.screenshot({
    path: showcasePath,
    type: 'png',
    fullPage: false,
  });

  console.log(`✅ Client / Expat Showcase saved to: ${showcasePath}`);

  // Also capture individual phone screens for isolated high-res presentation
  const chassisHandles = await page.$$('.phone-chassis');
  if (chassisHandles.length === 3) {
    await chassisHandles[0].screenshot({ path: path.join(WORKSPACE_DIR, 'client_expat_stage_1_dispatch.png') });
    await chassisHandles[1].screenshot({ path: path.join(WORKSPACE_DIR, 'client_expat_stage_2_waiting.png') });
    await chassisHandles[2].screenshot({ path: path.join(WORKSPACE_DIR, 'client_expat_stage_3_reply.png') });
    console.log('✅ Individual stage screenshots saved to workspace root.');
  }

  await browser.close();
}

generateClientExpatShowcase().catch((err) => {
  console.error('❌ Error generating showcase:', err);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const WORKSPACE = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const DESKTOP = '/Users/dorienvandenabbeele/Desktop';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Read official mascot asset (2 curved feathers)
const mascotPath = path.join(WORKSPACE, 'src/assets/poquito_front_talking_v2_clean_256.webp');
const mascotBase64 = fs.readFileSync(mascotPath).toString('base64');
const mascotDataUri = `data:image/webp;base64,${mascotBase64}`;

// Read canonical PoquitoTalk Logo SVG (parrot in WhatsApp green bubble with soundwaves)
const logoSvgPath = path.join(WORKSPACE, 'web-funnel/logo.svg');
const logoSvg = fs.readFileSync(logoSvgPath, 'utf8');

// Monoline SVG icons
const ICONS = {
  whatsapp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.072-1.848-.432-1.464-.608-2.433-2.091-2.505-2.188-.073-.096-.589-.785-.589-1.498 0-.713.375-1.064.508-1.209.133-.145.29-.182.388-.182.097 0 .194.001.278.006.089.005.208-.034.325.247.12.289.412 1.006.449 1.079.036.073.06.157.012.253-.048.096-.073.156-.145.24-.072.085-.152.19-.217.255-.073.072-.149.15-.064.296.085.145.376.621.808 1.004.556.495 1.025.648 1.17.72.145.073.23.061.315-.036.085-.097.363-.423.46-.569.097-.145.194-.121.327-.072.133.048.847.399.992.472.145.073.242.109.278.17.036.061.036.353-.108.758zM12 2C6.477 2 2 6.477 2 12c0 1.891.527 3.659 1.442 5.168L2 22l4.981-1.408A9.95 9.95 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>`,
  mic: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
  volume: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  checkDouble: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 6 7 17 2 12"/><polyline points="22 10 13 19 11 17"/></svg>`,
  arrowRight: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  bolt: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
};

function generateWaveformBars(count = 28, activeCount = 14) {
  const heights = [10, 18, 14, 28, 22, 34, 16, 26, 32, 20, 14, 30, 24, 18, 12, 22, 28, 16, 32, 24, 14, 20, 16, 26, 18, 12, 16, 10];
  return heights.slice(0, count).map((h, i) => {
    const color = i < activeCount ? '#059669' : '#CBD5E1';
    return `<div style="width: 4px; height: ${h}px; background: ${color}; border-radius: 2px;"></div>`;
  }).join('');
}

function getSlide1Html() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1350px;
      background: #FAF8F5;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      color: #1A1208;
      padding: 64px 72px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .ambient-1 {
      position: absolute;
      top: -120px;
      right: -120px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(37, 211, 102, 0.12) 0%, rgba(250, 248, 245, 0) 70%);
      pointer-events: none;
    }
    .ambient-2 {
      position: absolute;
      bottom: -150px;
      left: -150px;
      width: 650px;
      height: 650px;
      background: radial-gradient(circle, rgba(150, 72, 36, 0.08) 0%, rgba(250, 248, 245, 0) 70%);
      pointer-events: none;
    }

    /* Top Brand Bar */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    /* Brand logo breathes freely with no solid box border */
    .brand-logo-svg {
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 3px 10px rgba(37, 211, 102, 0.35));
    }
    .brand-logo-svg svg {
      width: 52px;
      height: 52px;
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 28px;
      font-weight: 900;
      color: #1B1C1A;
      letter-spacing: -0.6px;
      line-height: 1.1;
    }
    /* Talk in terracotta brown */
    .brand-title .brand-talk {
      color: #964824;
    }
    .brand-sub {
      font-size: 13.5px;
      font-weight: 700;
      color: #78716C;
      margin-top: 2px;
      letter-spacing: 0.2px;
    }
    .slide-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      border: 1.8px solid rgba(150, 72, 36, 0.18);
      padding: 9px 20px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 800;
      color: #964824;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    /* Header Section */
    .header-section {
      position: relative;
      z-index: 10;
      margin-top: 10px;
    }
    .step-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #DCFCE7;
      color: #047857;
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 50px;
      font-weight: 900;
      line-height: 1.08;
      letter-spacing: -1.6px;
      color: #1A1208;
      margin-bottom: 12px;
    }
    .subtitle {
      font-size: 19.5px;
      line-height: 1.45;
      font-weight: 600;
      color: #5C4E3A;
      max-width: 900px;
    }

    /* Main Showcase White Card */
    .showcase-card {
      position: relative;
      z-index: 10;
      background: #FFFFFF;
      border: 2px solid rgba(150, 72, 36, 0.12);
      border-radius: 28px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03);
      padding: 34px 38px;
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    /* English Input Box */
    .input-box {
      background: #FAF8F5;
      border: 1.5px solid rgba(150, 72, 36, 0.12);
      border-radius: 20px;
      padding: 20px 22px;
    }
    .box-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .box-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #B45309;
    }
    .lang-badge {
      background: #FFFFFF;
      border: 1px solid rgba(150, 72, 36, 0.15);
      border-radius: 8px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 800;
      color: #5C4E3A;
    }
    .input-text {
      font-size: 23px;
      font-weight: 700;
      color: #1A1208;
      line-height: 1.35;
    }

    /* Middle Connector Indicator */
    .connector-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #059669;
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: -6px 0;
    }
    .connector-line {
      flex: 1;
      height: 1px;
      background: #E5E7EB;
    }

    /* Output Spanish Box */
    .output-box {
      background: #F0FDF4;
      border: 2px solid #86EFAC;
      border-radius: 20px;
      padding: 22px 24px;
    }
    .output-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .output-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #047857;
    }
    .output-text {
      font-size: 22px;
      font-weight: 700;
      color: #14532D;
      line-height: 1.4;
      margin-bottom: 16px;
    }

    /* Audio Waveform Bar inside output */
    .audio-player-bar {
      background: #FFFFFF;
      border: 1.5px solid #BBF7D0;
      border-radius: 16px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .play-btn-circle {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .waveform-bars {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      height: 34px;
    }
    .audio-duration {
      font-size: 14px;
      font-weight: 700;
      color: #059669;
      font-feature-settings: 'tnum';
    }

    /* WhatsApp Primary Action Button */
    .cta-btn {
      background: #25D366;
      color: #FFFFFF;
      border-radius: 18px;
      padding: 17px 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-family: 'Lexend', sans-serif;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.2px;
      box-shadow: 0 8px 20px rgba(37, 211, 102, 0.35);
    }

    /* Bottom Mascot Callout */
    .bottom-mascot-row {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 18px;
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.12);
      border-radius: 20px;
      padding: 16px 22px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.03);
    }
    .mascot-img {
      width: 62px;
      height: 62px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .mascot-speech {
      font-size: 16px;
      font-weight: 700;
      color: #1A1208;
      line-height: 1.4;
    }
    .mascot-speech strong {
      color: #964824;
    }
  </style>
</head>
<body>
  <div class="ambient-1"></div>
  <div class="ambient-2"></div>

  <!-- Top Bar -->
  <div class="top-bar">
    <div class="brand-wrap">
      <div class="brand-logo-svg">
        ${logoSvg}
      </div>
      <div>
        <div class="brand-title">Poquito<span class="brand-talk">Talk</span></div>
        <div class="brand-sub">Bocas del Toro, Panamá • poquitotalk.hero-apps.com</div>
      </div>
    </div>
    <div class="slide-badge">Slide 1 of 2 • Mobile App</div>
  </div>

  <!-- Header Section -->
  <div class="header-section">
    <div class="step-pill">🇵🇦 1-Tap Voice Translation</div>
    <h1>Speak English naturally.<br>Send polite Panama Spanish.</h1>
    <p class="subtitle">Textbook translations sound stiff and often get ignored. PoquitoTalk formats the proper island greetings, technical trade phrasing, and authentic voice note in one tap.</p>
  </div>

  <!-- Main Showcase Card -->
  <div class="showcase-card">
    <!-- User Input -->
    <div class="input-box">
      <div class="box-header">
        <div class="box-tag">${ICONS.mic} 1. You Speak In Plain English</div>
        <div class="lang-badge">English Input</div>
      </div>
      <div class="input-text">"Can you come check my water pump today? It's losing pressure."</div>
    </div>

    <!-- Connector -->
    <div class="connector-row">
      <div class="connector-line"></div>
      <div style="display:flex; align-items:center; gap:6px;">${ICONS.bolt} Generated in 1 Tap</div>
      <div class="connector-line"></div>
    </div>

    <!-- Panamanian Spanish Output -->
    <div class="output-box">
      <div class="output-header">
        <div class="output-tag">${ICONS.volume} 2. Panamanian Spanish & Voice Note</div>
        <div class="lang-badge" style="background:#DCFCE7; color:#047857; border-color:#86EFAC;">Polite Panama Tone</div>
      </div>
      <div class="output-text">"¡Buenas tardes maestro! ¿Cómo está? Mire, una consulta: ¿Tendrá tiempo de revisar la bomba de agua hoy? Perdió presión. Muchas gracias."</div>
      
      <!-- Audio Waveform -->
      <div class="audio-player-bar">
        <div class="play-btn-circle">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF"><polygon points="6 4 19 12 6 20 6 4"/></svg>
        </div>
        <div class="waveform-bars">
          ${generateWaveformBars(26, 14)}
        </div>
        <div class="audio-duration">0:16</div>
      </div>
    </div>

    <!-- Action Button -->
    <div class="cta-btn">
      ${ICONS.whatsapp}
      <span>Send Voice Note to WhatsApp</span>
      ${ICONS.arrowRight}
    </div>
  </div>

  <!-- Bottom Mascot Row -->
  <div class="bottom-mascot-row">
    <img src="${mascotDataUri}" class="mascot-img" alt="Poquito Mascot" />
    <div class="mascot-speech">
      <strong>Built for island life in Bocas del Toro:</strong> Includes polite openers ("Buenas tardes maestro"), correct regional terminology for cisterns, outboards & pumps, and calibrated speech.
    </div>
  </div>
</body>
</html>`;
}

function getSlide2Html() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px;
      height: 1350px;
      background: #FAF8F5;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      color: #1A1208;
      padding: 64px 72px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .ambient-1 {
      position: absolute;
      top: -120px;
      right: -120px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(37, 211, 102, 0.12) 0%, rgba(250, 248, 245, 0) 70%);
      pointer-events: none;
    }
    .ambient-2 {
      position: absolute;
      bottom: -150px;
      left: -150px;
      width: 650px;
      height: 650px;
      background: radial-gradient(circle, rgba(150, 72, 36, 0.08) 0%, rgba(250, 248, 245, 0) 70%);
      pointer-events: none;
    }

    /* Top Bar */
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    /* Brand logo breathes freely with no solid box border */
    .brand-logo-svg {
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 3px 10px rgba(37, 211, 102, 0.35));
    }
    .brand-logo-svg svg {
      width: 52px;
      height: 52px;
    }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 28px;
      font-weight: 900;
      color: #1B1C1A;
      letter-spacing: -0.6px;
      line-height: 1.1;
    }
    /* Talk in terracotta brown */
    .brand-title .brand-talk {
      color: #964824;
    }
    .brand-sub {
      font-size: 13.5px;
      font-weight: 700;
      color: #78716C;
      margin-top: 2px;
      letter-spacing: 0.2px;
    }
    .slide-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      border: 1.8px solid rgba(37, 211, 102, 0.4);
      padding: 9px 20px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 800;
      color: #15803D;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    /* Header Section */
    .header-section {
      position: relative;
      z-index: 10;
      margin-top: 10px;
    }
    .step-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #E0F2FE;
      color: #0369A1;
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 50px;
      font-weight: 900;
      line-height: 1.08;
      letter-spacing: -1.6px;
      color: #1A1208;
      margin-bottom: 12px;
    }
    .subtitle {
      font-size: 19.5px;
      line-height: 1.45;
      font-weight: 600;
      color: #5C4E3A;
      max-width: 900px;
    }

    /* Realistic WhatsApp Interface Card */
    .whatsapp-card {
      position: relative;
      z-index: 10;
      background: #EFEAE2;
      border: 2px solid rgba(150, 72, 36, 0.12);
      border-radius: 28px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* WhatsApp Header */
    .wa-header {
      background: #075E54;
      color: #FFFFFF;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .wa-user-cluster {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .wa-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #128C7E;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      color: #FFFFFF;
      font-weight: 800;
      border: 2px solid rgba(255,255,255,0.25);
    }
    .wa-name {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: -0.2px;
    }
    .wa-status {
      font-size: 13.5px;
      color: #A7F3D0;
      font-weight: 600;
    }
    .wa-icons {
      display: flex;
      gap: 16px;
      opacity: 0.85;
    }

    /* WhatsApp Chat Body */
    .wa-chat-body {
      padding: 26px 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      background-image: radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px);
      background-size: 16px 16px;
    }

    /* Message 1: Outgoing Audio + Text from User */
    .bubble-out {
      align-self: flex-end;
      max-width: 820px;
      background: #D9FDD3;
      border-radius: 18px 18px 4px 18px;
      padding: 16px 18px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .wa-voice-player {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }
    .wa-play-btn {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: #25D366;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .wa-waveform {
      display: flex;
      align-items: center;
      gap: 3.5px;
      flex: 1;
      height: 32px;
    }
    .wa-time-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 700;
      color: #4B5563;
    }
    .wa-transcript-text {
      font-size: 17.5px;
      color: #111827;
      line-height: 1.45;
      font-weight: 500;
    }
    .wa-meta-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: #6B7280;
      font-weight: 600;
    }

    /* Message 2: Incoming Reply from Contractor */
    .bubble-in {
      align-self: flex-start;
      max-width: 800px;
      background: #FFFFFF;
      border-radius: 18px 18px 18px 4px;
      padding: 16px 20px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .in-sender-label {
      font-size: 13px;
      font-weight: 800;
      color: #075E54;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .in-text {
      font-size: 18px;
      color: #1F2937;
      line-height: 1.45;
      font-weight: 600;
    }
    .in-meta-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: #9CA3AF;
      font-weight: 600;
    }
    .reply-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #DCFCE7;
      color: #166534;
      padding: 4px 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 800;
      margin-top: 4px;
      width: fit-content;
    }

    /* Bottom 3 Pills Grid */
    .feature-pills-row {
      position: relative;
      z-index: 10;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .pill-card {
      background: #FFFFFF;
      border: 1.5px solid rgba(150, 72, 36, 0.12);
      border-radius: 18px;
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .pill-title {
      font-family: 'Lexend', sans-serif;
      font-size: 16.5px;
      font-weight: 800;
      color: #1A1208;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pill-desc {
      font-size: 13.5px;
      color: #5C4E3A;
      font-weight: 600;
      line-height: 1.35;
    }
  </style>
</head>
<body>
  <div class="ambient-1"></div>
  <div class="ambient-2"></div>

  <!-- Top Bar -->
  <div class="top-bar">
    <div class="brand-wrap">
      <div class="brand-logo-svg">
        ${logoSvg}
      </div>
      <div>
        <div class="brand-title">Poquito<span class="brand-talk">Talk</span></div>
        <div class="brand-sub">Bocas del Toro, Panamá • poquitotalk.hero-apps.com</div>
      </div>
    </div>
    <div class="slide-badge">Slide 2 of 2 • WhatsApp Reality</div>
  </div>

  <!-- Header Section -->
  <div class="header-section">
    <div class="step-pill">📲 Zero Friction Delivery</div>
    <h1>Zero apps for the contractor.<br>Delivered straight into WhatsApp.</h1>
    <p class="subtitle">Local tradespeople and boat captains work with their hands. They won't install a new app or register an account—they just tap play in native WhatsApp.</p>
  </div>

  <!-- Realistic WhatsApp Card -->
  <div class="whatsapp-card">
    <!-- Header -->
    <div class="wa-header">
      <div class="wa-user-cluster">
        <div class="wa-avatar">🛠️</div>
        <div>
          <div class="wa-name">Maestro Carlos • Plomería Bocas</div>
          <div class="wa-status">en línea (online)</div>
        </div>
      </div>
      <div class="wa-icons">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
      </div>
    </div>

    <!-- Chat Body -->
    <div class="wa-chat-body">
      <!-- Outgoing Audio Message from User -->
      <div class="bubble-out">
        <div class="wa-voice-player">
          <div class="wa-play-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF"><polygon points="6 4 19 12 6 20 6 4"/></svg>
          </div>
          <div class="wa-waveform">
            ${generateWaveformBars(26, 26)}
          </div>
          <div class="wa-time-meta">0:16</div>
        </div>
        <div class="wa-transcript-text">
          "¡Buenas tardes maestro! ¿Cómo está? Mire, una consulta: ¿Tendrá tiempo de revisar la bomba de agua hoy? Perdió presión. Muchas gracias."
        </div>
        <div class="wa-meta-row">
          <span>10:42 AM</span>
          ${ICONS.checkDouble}
        </div>
      </div>

      <!-- Incoming Fast Reply from Contractor -->
      <div class="bubble-in">
        <div class="in-sender-label">Maestro Carlos</div>
        <div class="in-text">
          "¡Buenas tardes amigo! Sí, claro que sí. Ahorita ando terminando una instalación en Carenero. A las 2:00 pm paso por su casa para revisarle la bomba."
        </div>
        <div class="reply-badge">⚡ Respondió en 2 minutos</div>
        <div class="in-meta-row">
          <span>10:44 AM</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom 3 Pills -->
  <div class="feature-pills-row">
    <div class="pill-card">
      <div class="pill-title">0 Apps to Install</div>
      <div class="pill-desc">The contractor never downloads any third-party app or creates an account.</div>
    </div>
    <div class="pill-card">
      <div class="pill-title">Listens On The Go</div>
      <div class="pill-desc">Tradesmen and boat drivers can tap play while driving or working with hands.</div>
    </div>
    <div class="pill-card">
      <div class="pill-title">Polite Tone Priority</div>
      <div class="pill-desc">Respectful Panamanian opening phrases eliminate friction and get fast replies.</div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('🚀 Re-rendering LinkedIn Carousel Slides with Official Logo & Terracotta Brown "Talk"...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const slides = [
    { name: 'linkedin_carousel_slide_1_app.png', html: getSlide1Html() },
    { name: 'linkedin_carousel_slide_2_whatsapp.png', html: getSlide2Html() }
  ];

  for (const slide of slides) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
    await page.setContent(slide.html, { waitUntil: 'networkidle0' });

    // Output paths
    const workspaceDest = path.join(WORKSPACE, slide.name);
    const desktopDest = path.join(DESKTOP, slide.name);

    await page.screenshot({ path: workspaceDest, width: 1080, height: 1350 });
    fs.copyFileSync(workspaceDest, desktopDest);

    console.log(`✅ Rendered: ${slide.name} -> Workspace & Desktop`);
    await page.close();
  }

  await browser.close();
  console.log('🎉 All LinkedIn carousel slides updated successfully!');
}

main().catch(err => {
  console.error('Error generating slides:', err);
  process.exit(1);
});

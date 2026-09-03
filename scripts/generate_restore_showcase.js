const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';

// Canonical Poquito Vector SVG Generator
function getCanonicalPoquitoSvg(mood = 'searching', pupilX = 0, pupilY = 0, tiltDeg = 0, leftClawY = 0, rightClawY = 0, crestDeg = 0, wingDeg = 0, soundwaves = false) {
  const isSad = mood === 'sad';
  const isSuccess = mood === 'success';

  return `
    <svg viewBox="0 0 160 160" width="135" height="135" style="overflow: visible;">
      <!-- 1. Wooden Perch Branch -->
      <path d="M 22 135 Q 70 132 138 135" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
      
      <!-- 2. Left Golden Claws -->
      <g transform="translate(0, ${leftClawY})">
        <path d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
      </g>
      
      <!-- 3. Right Golden Claws -->
      <g transform="translate(0, ${rightClawY})">
        <path d="M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
      </g>
      
      <!-- 4. Body & Features Group (Tilted around perch connection) -->
      <g transform="translate(0, ${isSad ? 4 : isSuccess ? -10 : 0}) rotate(${tiltDeg} 70 130)">
        <!-- Crown Feathers -->
        <g transform="rotate(${crestDeg} 60 19)">
          <path d="M 58 19.2 C 55 13 52 9 47 8" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
          <path d="M 67 17.8 C 64 12 61 9 56 7" stroke="#047857" stroke-width="3" stroke-linecap="round" fill="none" />
        </g>
        
        <!-- Emerald Body -->
        <path
          d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z"
          fill="#10B981"
          stroke="#047857"
          stroke-width="4.5"
          stroke-linejoin="round"
        />
        
        <!-- Eye White Ring -->
        <circle cx="76" cy="42" r="10" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
        
        <!-- Hooked Golden Beak -->
        <path
          d="M 90 36 C 106 36 114 50 100 62 C 95 65 88 61 89 55 C 91 49 88 40 90 36 Z"
          fill="#F59E0B"
          stroke="#047857"
          stroke-width="3.5"
          stroke-linejoin="round"
        />
        <path
          d="M 90 56 C 96 58 98 62 92 63 C 89 63 88 59 90 56 Z"
          fill="#D97706"
          stroke="#047857"
          stroke-width="1.8"
          stroke-linejoin="round"
        />
        
        <!-- Cyan Wing -->
        <g transform="rotate(${wingDeg} 45 90)">
          <path
            d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z"
            fill="#06B6D4"
            stroke="#047857"
            stroke-width="3.5"
            stroke-linejoin="round"
          />
        </g>
        
        <!-- Pupil & Catchlight -->
        <g transform="translate(${pupilX}, ${pupilY})">
          <circle cx="75" cy="42" r="5" fill="#0F172A" />
          <circle cx="73" cy="40" r="1.8" fill="#FFFFFF" />
        </g>
        
        <!-- Radiating Soundwaves (Success) -->
        ${soundwaves ? `
          <path d="M 112 43 A 11 11 0 0 1 112 60" fill="none" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round" />
          <path d="M 120 37 A 17 17 0 0 1 120 66" fill="none" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round" />
          <path d="M 128 31 A 23 23 0 0 1 128 72" fill="none" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round" opacity="0.8" />
        ` : ''}
      </g>
    </svg>
  `;
}

function renderScreenHtml(state = 'searching') {
  let mascotSvg = '';
  let badgeText = '';
  let badgeColor = '';
  let badgeBg = '';
  let badgeBorder = '';
  let title = '';
  let subtitle = '';
  let bodyContent = '';

  if (state === 'searching') {
    // Wiggling on left leg, looking left
    mascotSvg = getCanonicalPoquitoSvg('searching', -3.5, 0, -6, 1, -3.5, -3, 2, false);
    badgeText = 'SEARCHING APP STORE';
    badgeColor = '#964824';
    badgeBg = '#FFF7ED';
    badgeBorder = '#FED7AA';
    title = 'Looking for Past Passes...';
    bodyContent = `
      <div style="font-size: 13.5px; font-weight: 600; color: #964824; text-align: center; margin: 10px 0 16px 0;">
        Asking Captain Jim for previous receipts... 🚤
      </div>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px;">
        <div style="width: 14px; height: 14px; border: 2px solid #964824; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span style="font-size: 12px; color: #64748B; font-weight: 500;">Syncing App Store receipts</span>
      </div>
    `;
  } else if (state === 'sad') {
    // Sad canonical Poquito (droopy crest, looking down, slouch)
    mascotSvg = getCanonicalPoquitoSvg('sad', 0.5, 3, -3, 0, 0, -15, 6, false);
    badgeText = 'NO SUBSCRIPTION FOUND';
    badgeColor = '#DC2626';
    badgeBg = '#FEF2F2';
    badgeBorder = '#FECACA';
    title = '¡Nada en el Nido!';
    subtitle = "Poquito looked everywhere, but couldn't find an active pass or credits linked to this store account.";
    bodyContent = `
      <div style="font-size: 11.5px; color: #4A3E33; text-align: center; line-height: 16px; margin-top: 2px; margin-bottom: 10px; padding: 0 8px;">
        ${subtitle}
      </div>
      <button style="width: 100%; background: #964824; color: #FFF; border: none; padding: 12.5px; border-radius: 18px; font-weight: 800; font-size: 14.5px; display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 8px; box-shadow: 0 3px 8px rgba(150,72,36,0.25);">
        🔄 Search Again
      </button>
      <button style="width: 100%; background: #FAF8F5; color: #964824; border: 1.5px solid #E8E1D7; padding: 11.5px; border-radius: 18px; font-weight: 800; font-size: 13.5px; display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 8px;">
        ✨ Start 7-Day Free Trial
      </button>
      <div style="text-align: center; font-size: 11px; font-weight: 700; color: #4A3E33; text-decoration: underline; margin-bottom: 4px;">
        Contact Support Desk (Dorien)
      </div>
    `;
  } else if (state === 'success') {
    // Victorious canonical Poquito with radiating soundwaves
    mascotSvg = getCanonicalPoquitoSvg('success', 1, -0.5, 4, -4, -4, 5, -10, true);
    badgeText = 'RESTORE COMPLETE';
    badgeColor = '#059669';
    badgeBg = '#ECFDF5';
    badgeBorder = '#A7F3D0';
    title = "¡Qué xopa! You're In! 🌴";
    subtitle = "Your PoquitoTalk subscription is active. Natural voice notes and island Spanish are ready to go!";
    bodyContent = `
      <div style="font-size: 11.5px; color: #4A3E33; text-align: center; line-height: 16px; margin-top: 2px; margin-bottom: 12px; padding: 0 8px;">
        ${subtitle}
      </div>
      <button style="width: 100%; background: #059669; color: #FFF; border: none; padding: 13px; border-radius: 18px; font-weight: 800; font-size: 14.5px; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 3px 8px rgba(5,150,105,0.25);">
        ¡Vámonos! Back to Island Spanish ➔
      </button>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 400px;
      height: 820px;
      background: #EBE6DF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      overflow: hidden;
      position: relative;
    }
    
    /* Background Mock Content */
    .bg-app {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: #FAF8F5;
      padding: 50px 20px;
      opacity: 0.35;
      filter: blur(2px);
    }
    .bg-card {
      background: #FFF;
      border: 1px solid #EDE8E1;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
      height: 70px;
    }
    
    .overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    
    .sheet {
      background: #FAF8F5;
      border-top-left-radius: 28px;
      border-top-right-radius: 28px;
      padding: 14px 18px 22px 18px;
      border-top: 1px solid #EDE8E1;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 -10px 30px rgba(0,0,0,0.12);
      gap: 6px;
    }
    
    .header-row {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    
    .badge {
      background: ${badgeBg};
      color: ${badgeColor};
      border: 1px solid ${badgeBorder};
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      padding: 3.5px 10px;
      border-radius: 20px;
    }
    
    .close-btn {
      width: 28px;
      height: 28px;
      border-radius: 14px;
      background: #F3EFE9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: #64748B;
      font-weight: 700;
    }
    
    .mascot-wrap {
      height: 135px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 2px 0;
    }
    
    .title {
      font-size: 18px;
      font-weight: 900;
      color: #1A130E;
      text-align: center;
      letter-spacing: -0.3px;
    }
    
    .reassurance-text {
      font-size: 10px;
      font-weight: 700;
      color: #1A130E;
      text-align: center;
      margin-top: 4px;
    }
    
    .legal-footer-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      margin-top: 2px;
    }
    .legal-link {
      font-size: 10px;
      color: #1A130E;
      font-weight: 700;
      text-decoration: underline;
    }
    .legal-dot {
      font-size: 10px;
      color: #1A130E;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="bg-app">
    <div class="bg-card"></div>
    <div class="bg-card"></div>
    <div class="bg-card"></div>
    <div class="bg-card"></div>
  </div>
  
  <div class="overlay">
    <div class="sheet">
      <div class="header-row">
        <div class="badge">${badgeText}</div>
        <div class="close-btn">✕</div>
      </div>
      
      <div class="mascot-wrap">
        ${mascotSvg}
      </div>
      
      <div class="title">${title}</div>
      
      <div style="width: 100%;">
        ${bodyContent}
      </div>
      
      <div class="reassurance-text">
        Secure instant checkout processed via App Store / Google Play
      </div>
      
      <div class="legal-footer-row">
        <span class="legal-link">Restore</span>
        <span class="legal-dot">•</span>
        <span class="legal-link">Terms of Service</span>
        <span class="legal-dot">•</span>
        <span class="legal-link">Privacy Policy</span>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

async function generateAll() {
  console.log('🚀 Launching Puppeteer to capture Canonical Poquito Restore screens...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 820, deviceScaleFactor: 2 });

  // 1. Capture State 1 (Searching)
  await page.setContent(renderScreenHtml('searching'), { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 150));
  const file1 = path.join(WORKSPACE_DIR, 'restore_screenshot_1_searching.png');
  await page.screenshot({ path: file1 });
  console.log(`✅ Saved State 1: ${file1}`);

  // 2. Capture State 2 (Sad / Empty Nest)
  await page.setContent(renderScreenHtml('sad'), { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 150));
  const file2 = path.join(WORKSPACE_DIR, 'restore_screenshot_2_sad.png');
  await page.screenshot({ path: file2 });
  console.log(`✅ Saved State 2: ${file2}`);

  // 3. Capture State 3 (Success)
  await page.setContent(renderScreenHtml('success'), { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 150));
  const file3 = path.join(WORKSPACE_DIR, 'restore_screenshot_3_success.png');
  await page.screenshot({ path: file3 });
  console.log(`✅ Saved State 3: ${file3}`);

  // 4. Generate 3-Up Master Showcase Canvas (2400 x 1350)
  console.log('🎨 Composing 3-Up Comparison Showcase Card on warm neutral background...');
  await page.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });

  const b64_1 = `data:image/png;base64,${fs.readFileSync(file1).toString('base64')}`;
  const b64_2 = `data:image/png;base64,${fs.readFileSync(file2).toString('base64')}`;
  const b64_3 = `data:image/png;base64,${fs.readFileSync(file3).toString('base64')}`;

  const showcaseHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 2400px;
      height: 1350px;
      background-color: #FAF8F5;
      background-image: 
        radial-gradient(circle at 50% 0%, #FFF5EE 0%, #FAF8F5 50%, #EDE5D8 100%),
        radial-gradient(rgba(150, 72, 36, 0.04) 1.5px, transparent 1.5px);
      background-size: 100% 100%, 36px 36px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 90px 50px 90px;
      overflow: hidden;
      position: relative;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .badge-wrap {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #FFF;
      border: 1px solid #EDE8E1;
      padding: 8px 18px;
      border-radius: 999px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.04);
      margin-bottom: 14px;
    }
    .badge-dot {
      width: 10px; height: 10px; border-radius: 50%; background: #10B981;
    }
    .badge-text {
      font-size: 14px; font-weight: 800; letter-spacing: 1px; color: #964824; text-transform: uppercase;
    }
    
    .title {
      font-size: 44px;
      font-weight: 900;
      color: #1B1C1A;
      letter-spacing: -0.8px;
      line-height: 1.15;
    }
    
    .subtitle {
      font-size: 20px;
      font-weight: 500;
      color: #64748B;
      margin-top: 8px;
    }
    
    .meta-tag {
      background: #FFF;
      border: 1px solid #E2E8F0;
      padding: 12px 24px;
      border-radius: 16px;
      font-weight: 700;
      font-size: 16px;
      color: #334155;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    
    /* Device Trio Grid */
    .devices-grid {
      display: flex;
      justify-content: center;
      gap: 50px;
      align-items: flex-end;
      margin-top: 20px;
    }
    
    .device-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    .column-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      padding: 8px 18px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 800;
      color: #1B1C1A;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
    }
    
    .device-frame {
      width: 440px;
      height: 880px;
      background: #1E293B;
      border-radius: 46px;
      padding: 12px;
      box-shadow: 
        0 25px 60px -15px rgba(15, 23, 42, 0.22),
        0 10px 25px -5px rgba(15, 23, 42, 0.12),
        inset 0 0 0 2px #475569;
      position: relative;
    }
    
    .notch {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 24px;
      background: #000;
      border-radius: 12px;
      z-index: 10;
    }
    
    .screen-img {
      width: 100%;
      height: 100%;
      border-radius: 36px;
      object-fit: cover;
      display: block;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #E2E8F0;
      padding-top: 20px;
      font-size: 15px;
      font-weight: 600;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="badge-wrap">
        <div class="badge-dot"></div>
        <span class="badge-text">Canonical Poquito Mascot</span>
      </div>
      <h1 class="title">Animated Restore Purchases Experience</h1>
      <p class="subtitle">Official emerald & cyan mascot with side-to-side leg wiggle, searching eye scan, and island theme alignment.</p>
    </div>
    
    <div class="meta-tag">
      PoquitoTalk 🇵🇦 • Official Brand Styling
    </div>
  </div>
  
  <div class="devices-grid">
    <!-- State 1 -->
    <div class="device-column">
      <div class="column-tag" style="border-color: #FED7AA;">
        <span style="color: #964824;">●</span> 1. Scanning (Leg Wiggle & Eye Scan)
      </div>
      <div class="device-frame">
        <div class="notch"></div>
        <img class="screen-img" src="${b64_1}" />
      </div>
    </div>
    
    <!-- State 2 -->
    <div class="device-column">
      <div class="column-tag" style="border-color: #FECACA;">
        <span style="color: #DC2626;">●</span> 2. Empty Nest (Sad Poquito "¡Nada!")
      </div>
      <div class="device-frame">
        <div class="notch"></div>
        <img class="screen-img" src="${b64_2}" />
      </div>
    </div>
    
    <!-- State 3 -->
    <div class="device-column">
      <div class="column-tag" style="border-color: #A7F3D0;">
        <span style="color: #059669;">●</span> 3. Restored (Soundwaves & Celebration)
      </div>
      <div class="device-frame">
        <div class="notch"></div>
        <img class="screen-img" src="${b64_3}" />
      </div>
    </div>
  </div>
  
  <div class="footer">
    <span>PoquitoTalk • 100% Vector Motion • Zero Raster Blurriness</span>
    <span>Hero-Apps.com • Warm Terracotta & Island Aesthetic</span>
  </div>
</body>
</html>
  `;

  await page.setContent(showcaseHtml, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 200));
  const showcaseFile = path.join(WORKSPACE_DIR, 'restore_modal_showcase.png');
  await page.screenshot({ path: showcaseFile });
  console.log(`🏆 Saved 3-Up Comparison Showcase: ${showcaseFile}`);

  await browser.close();
  console.log('🎉 All screenshots regenerated with canonical Poquito mascot!');
}

generateAll().catch((err) => {
  console.error('Error generating screenshots:', err);
  process.exit(1);
});

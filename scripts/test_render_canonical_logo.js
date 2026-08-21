const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';

const canonicalLogoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <!-- Outer Speech Bubble (WhatsApp Green) -->
  <path
    d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
    fill="none"
    stroke="#25D366"
    stroke-width="12"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- Canonical Studio Parrot Group (Scaled & centered within speech bubble) -->
  <g transform="translate(18, 22) scale(0.92)">
    <!-- 1. Wooden Perch Branch -->
    <path d="M 30 135 Q 70 132 115 135" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />

    <!-- 2. Golden Parrot Claws -->
    <path
      d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138"
      stroke="#F59E0B"
      stroke-width="4.5"
      stroke-linecap="round"
    />

    <!-- 3. Body & Anchored 2 Crown Feathers (Zero Gap, seamless skull connection) -->
    <g id="body-group">
      <path
        d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z"
        fill="#10B981"
        stroke="#047857"
        stroke-width="4.5"
        stroke-linejoin="round"
      />
      <!-- Two Feathers seamlessly rooted in head -->
      <path d="M 58 19.2 C 55 13 52 9 47 8" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
      <path d="M 67 17.8 C 64 12 61 9 56 7" stroke="#047857" stroke-width="3" stroke-linecap="round" fill="none" />
    </g>

    <!-- 4. Sleek Cyan Wing -->
    <path
      d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z"
      fill="#06B6D4"
      stroke="#047857"
      stroke-width="3.5"
      stroke-linejoin="round"
    />

    <!-- 5. Head Group (Big Eye & Golden Beak) -->
    <g id="head-group">
      <circle cx="76" cy="42" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
      <circle cx="74.5" cy="42" r="4.5" fill="#0F172A" />
      <circle cx="72.5" cy="40" r="1.8" fill="#FFFFFF" />

      <!-- Golden Beak -->
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
    </g>

    <!-- 6. Audio Soundwave Arcs -->
    <path d="M 116 41 A 14 14 0 0 1 116 63" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
    <path d="M 127 33 A 22 22 0 0 1 127 71" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
    <path d="M 138 26 A 29 29 0 0 1 138 78" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" opacity="0.8" />
  </g>
</svg>
`;

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    headless: 'new'
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        background: #0B0D13;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        gap: 30px;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 40px;
      }
      .card {
        background: #141824;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 24px;
        padding: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
      .card-light {
        background: #FBF9F5;
        border: 1px solid #E4E2DE;
      }
      .card-title {
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #94A3B8;
      }
      .card-light .card-title {
        color: #5C554D;
      }
      .icon-box {
        width: 180px;
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-box svg {
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <h1>Canonical Poquito Mascot in WhatsApp Speech Bubble</h1>
    <div class="row">
      <div class="card">
        <div class="card-title">Dark Theme (App UI / Marketing)</div>
        <div class="icon-box">${canonicalLogoSvg}</div>
      </div>
      <div class="card card-light">
        <div class="card-title">Light Theme (Store / Web Funnel)</div>
        <div class="icon-box">${canonicalLogoSvg}</div>
      </div>
      <div class="card card-light" style="background: #FFFFFF;">
        <div class="card-title">White Background (Store Icon 512)</div>
        <div class="icon-box" style="width: 200px; height: 200px;">
          <svg viewBox="0 0 200 200" fill="none" style="width:100%; height:100%;">
            <!-- Filled White Bubble with WhatsApp Green Border -->
            <path
              d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
              fill="#FFFFFF"
              stroke="#25D366"
              stroke-width="12"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <g transform="translate(18, 22) scale(0.92)">
              <path d="M 30 135 Q 70 132 115 135" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
              <g>
                <path d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" stroke-linejoin="round" />
                <path d="M 58 19.2 C 55 13 52 9 47 8" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
                <path d="M 67 17.8 C 64 12 61 9 56 7" stroke="#047857" stroke-width="3" stroke-linecap="round" fill="none" />
              </g>
              <path d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
              <g>
                <circle cx="76" cy="42" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
                <circle cx="74.5" cy="42" r="4.5" fill="#0F172A" />
                <circle cx="72.5" cy="40" r="1.8" fill="#FFFFFF" />
                <path d="M 90 36 C 106 36 114 50 100 62 C 95 65 88 61 89 55 C 91 49 88 40 90 36 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
                <path d="M 90 56 C 96 58 98 62 92 63 C 89 63 88 59 90 56 Z" fill="#D97706" stroke="#047857" stroke-width="1.8" stroke-linejoin="round" />
              </g>
              <path d="M 116 41 A 14 14 0 0 1 116 63" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
              <path d="M 127 33 A 22 22 0 0 1 127 71" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
              <path d="M 138 26 A 29 29 0 0 1 138 78" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" opacity="0.8" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  const previewPath = path.join(WORKSPACE_DIR, 'canonical_logo_preview.png');
  await page.screenshot({ path: previewPath, fullPage: true });

  // Render 512x512 Store Icon
  const iconPage = await browser.newPage();
  await iconPage.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  await iconPage.setContent(`
  <!DOCTYPE html>
  <html>
  <body style="margin:0; width:512px; height:512px; display:flex; align-items:center; justify-content:center; background:#FFFFFF;">
    <svg width="460" height="460" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 100 20 C 50 20 20 52 20 95 C 20 120 32 142 50 156 C 42 172 26 182 25 182 C 25 182 52 186 78 174 C 85 177 92 178 100 178 C 150 178 180 146 180 95 C 180 52 150 20 100 20 Z"
        fill="#FFFFFF"
        stroke="#25D366"
        stroke-width="12"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <g transform="translate(18, 22) scale(0.92)">
        <path d="M 30 135 Q 70 132 115 135" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
        <g>
          <path d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" stroke-linejoin="round" />
          <path d="M 58 19.2 C 55 13 52 9 47 8" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none" />
          <path d="M 67 17.8 C 64 12 61 9 56 7" stroke="#047857" stroke-width="3" stroke-linecap="round" fill="none" />
        </g>
        <path d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
        <g>
          <circle cx="76" cy="42" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
          <circle cx="74.5" cy="42" r="4.5" fill="#0F172A" />
          <circle cx="72.5" cy="40" r="1.8" fill="#FFFFFF" />
          <path d="M 90 36 C 106 36 114 50 100 62 C 95 65 88 61 89 55 C 91 49 88 40 90 36 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
          <path d="M 90 56 C 96 58 98 62 92 63 C 89 63 88 59 90 56 Z" fill="#D97706" stroke="#047857" stroke-width="1.8" stroke-linejoin="round" />
        </g>
        <path d="M 116 41 A 14 14 0 0 1 116 63" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
        <path d="M 127 33 A 22 22 0 0 1 127 71" fill="none" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
        <path d="M 138 26 A 29 29 0 0 1 138 78" fill="none" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" opacity="0.8" />
      </g>
    </svg>
  </body>
  </html>
  `, { waitUntil: 'networkidle0' });

  const icon512Path = path.join(WORKSPACE_DIR, 'canonical_store_icon_512.png');
  await iconPage.screenshot({ path: icon512Path, width: 512, height: 512 });

  await browser.close();
  console.log("Rendered successfully to:", previewPath, "and", icon512Path);
}

main().catch(console.error);

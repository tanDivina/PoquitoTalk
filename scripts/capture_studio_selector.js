const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const ASSETS_DIR = path.join(WORKSPACE_DIR, 'src', 'assets');

function getBase64Asset(filename) {
  const filePath = path.join(ASSETS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Missing asset: ${filePath}`);
    return '';
  }
  const ext = path.extname(filename).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.webp' ? 'image/webp' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

async function renderMascotStudio() {
  console.log('🎨 Generating Poquito Mascot Studio Selection Gallery...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1350, deviceScaleFactor: 2 });

  // Load all assets
  const walkieLoop = getBase64Asset('poquito_listening_rx_256.webp');
  const talkingLoop = getBase64Asset('poquito_front_talking_v2_clean_256.webp');
  const victoryLoop = getBase64Asset('poquito_victory_jump_256.webp');
  const danceLoop = getBase64Asset('poquito_seedance_animated_256.webp');
  const thinkingLoop = getBase64Asset('poquito_thinking_loop_256.webp');
  
  const talkieSvg = getBase64Asset('poquito_talkie.svg');
  const frontSvg = getBase64Asset('poquito_front.svg');
  const sideSvg = getBase64Asset('poquito_static_side.svg');
  const victorySvg = getBase64Asset('poquito_victory.svg');
  const cleanSvg = getBase64Asset('poquito_clean.svg');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      body {
        background: #FAF8F5;
        min-height: 100vh;
        padding: 50px 40px;
        color: #1A130E;
      }
      .header-wrap {
        text-align: center;
        margin-bottom: 36px;
      }
      .badge {
        display: inline-block;
        background: #D5E8D1;
        border: 1px solid #A7F3D0;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 800;
        color: #065F46;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        margin-bottom: 12px;
      }
      h1 {
        font-size: 36px;
        font-weight: 900;
        letter-spacing: -0.5px;
        color: #1A130E;
      }
      p.sub {
        font-size: 16px;
        color: #4A3E33;
        margin-top: 8px;
        font-weight: 600;
      }

      .section-title {
        font-size: 20px;
        font-weight: 900;
        color: #1A130E;
        margin: 28px 0 16px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .section-pill {
        background: #964824;
        color: #FFF;
        font-size: 11px;
        font-weight: 800;
        padding: 3px 10px;
        border-radius: 6px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .mascot-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 20px;
        margin-bottom: 30px;
      }

      .mascot-card {
        background: #FFFFFF;
        border-radius: 24px;
        border: 1.5px solid #E8E1D7;
        padding: 24px 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: 0 4px 16px rgba(150, 72, 36, 0.04);
        position: relative;
        transition: transform 0.2s;
      }
      .card-num {
        position: absolute;
        top: 12px;
        left: 14px;
        font-size: 12px;
        font-weight: 900;
        color: #964824;
        background: #FFF7ED;
        border: 1px solid #FED7AA;
        padding: 2px 8px;
        border-radius: 6px;
      }
      .card-type-tag {
        position: absolute;
        top: 12px;
        right: 14px;
        font-size: 10px;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 6px;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .tag-animated { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
      .tag-vector { background: #F0F9FF; color: #0284C7; border: 1px solid #BAE6FD; }

      .img-preview-box {
        width: 140px;
        height: 140px;
        margin: 18px 0 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #FAF8F5;
        border-radius: 18px;
        border: 1px dashed #E8E1D7;
      }
      .img-preview-box img {
        max-width: 110px;
        max-height: 110px;
        object-fit: contain;
      }

      .mascot-name {
        font-size: 16px;
        font-weight: 900;
        color: #1A130E;
        margin-bottom: 4px;
      }
      .mascot-desc {
        font-size: 12px;
        color: #4A3E33;
        line-height: 1.4;
        font-weight: 500;
      }
      .mascot-best-for {
        margin-top: 12px;
        background: #FFF7ED;
        border: 1px solid #FED7AA;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
        color: #964824;
      }
    </style>
  </head>
  <body>
    <div class="header-wrap">
      <div class="badge">POQUITOTALK MASCOT STUDIO</div>
      <h1>Choose Your Mascot Style for Paywalls & Features</h1>
      <p class="sub">Select any number or mascot pose below to lock it into your Paywall and Onboarding screens.</p>
    </div>

    <!-- CATEGORY 1: ANIMATED MOTION LOOPS -->
    <div class="section-title">
      <span class="section-pill">Category 1</span>
      <span>Smooth Animated Motion Loops (High Resolution WEBP)</span>
    </div>

    <div class="mascot-grid">
      <!-- 1. Walkie-Talkie Radio Loop -->
      <div class="mascot-card">
        <span class="card-num">#1</span>
        <span class="card-type-tag tag-animated">Animated Loop</span>
        <div class="img-preview-box">
          <img src="${walkieLoop}" />
        </div>
        <div class="mascot-name">Walkie Radio Listening</div>
        <div class="mascot-desc">Poquito holding the walkie-talkie radio with live antenna signals.</div>
        <div class="mascot-best-for">⚡ Best for Paywall & Walkie</div>
      </div>

      <!-- 2. Talking Front Loop -->
      <div class="mascot-card">
        <span class="card-num">#2</span>
        <span class="card-type-tag tag-animated">Animated Loop</span>
        <div class="img-preview-box">
          <img src="${talkingLoop}" />
        </div>
        <div class="mascot-name">Talking Front Active</div>
        <div class="mascot-desc">Front-facing expressive talking animation with beak motion.</div>
        <div class="mascot-best-for">🎙️ Best for Voice Translation</div>
      </div>

      <!-- 3. Victory Jump Loop -->
      <div class="mascot-card">
        <span class="card-num">#3</span>
        <span class="card-type-tag tag-animated">Animated Loop</span>
        <div class="img-preview-box">
          <img src="${victoryLoop}" />
        </div>
        <div class="mascot-name">Victory Jump</div>
        <div class="mascot-desc">Happy celebratory leap with hands up in the air.</div>
        <div class="mascot-best-for">🎉 Best for Unlock Success</div>
      </div>

      <!-- 4. Dancing Parrot Loop -->
      <div class="mascot-card">
        <span class="card-num">#4</span>
        <span class="card-type-tag tag-animated">Animated Loop</span>
        <div class="img-preview-box">
          <img src="${danceLoop}" />
        </div>
        <div class="mascot-name">Caribbean Dance</div>
        <div class="mascot-desc">Upbeat island salsa rhythm dance step with wing groove.</div>
        <div class="mascot-best-for">🌴 Best for Island Energy</div>
      </div>

      <!-- 5. Thinking Loop -->
      <div class="mascot-card">
        <span class="card-num">#5</span>
        <span class="card-type-tag tag-animated">Animated Loop</span>
        <div class="img-preview-box">
          <img src="${thinkingLoop}" />
        </div>
        <div class="mascot-name">Thinking & Processing</div>
        <div class="mascot-desc">Thoughtful head tilt while AI translates complex Spanish slang.</div>
        <div class="mascot-best-for">🧠 Best for Loading / AI</div>
      </div>
    </div>

    <!-- CATEGORY 2: CRISP VECTOR RIGS -->
    <div class="section-title">
      <span class="section-pill">Category 2</span>
      <span>Authentic Crisp Vector Rigs (Scalable Vector SVG)</span>
    </div>

    <div class="mascot-grid">
      <!-- 6. 2-Way Walkie Vector -->
      <div class="mascot-card">
        <span class="card-num">#6</span>
        <span class="card-type-tag tag-vector">Vector SVG</span>
        <div class="img-preview-box">
          <img src="${talkieSvg}" />
        </div>
        <div class="mascot-name">Walkie Vector Rig</div>
        <div class="mascot-desc">Official vector artwork with black antenna & walkie mic.</div>
        <div class="mascot-best-for">📻 Crisp 2-Way Walkie Tag</div>
      </div>

      <!-- 7. Front Facing Vector -->
      <div class="mascot-card">
        <span class="card-num">#7</span>
        <span class="card-type-tag tag-vector">Vector SVG</span>
        <div class="img-preview-box">
          <img src="${frontSvg}" />
        </div>
        <div class="mascot-name">Front Facing Vector</div>
        <div class="mascot-desc">Symmetric front view with friendly green crest and yellow chest.</div>
        <div class="mascot-best-for">✨ Clean App Branding</div>
      </div>

      <!-- 8. Static Side Profile -->
      <div class="mascot-card">
        <span class="card-num">#8</span>
        <span class="card-type-tag tag-vector">Vector SVG</span>
        <div class="img-preview-box">
          <img src="${sideSvg}" />
        </div>
        <div class="mascot-name">Side Profile Vector</div>
        <div class="mascot-desc">Classic mascot profile used across Panama island guides.</div>
        <div class="mascot-best-for">📖 Directory & Booklets</div>
      </div>

      <!-- 9. Victory Hands Up Vector -->
      <div class="mascot-card">
        <span class="card-num">#9</span>
        <span class="card-type-tag tag-vector">Vector SVG</span>
        <div class="img-preview-box">
          <img src="${victorySvg}" />
        </div>
        <div class="mascot-name">Victory Vector</div>
        <div class="mascot-desc">Static high-resolution vector of the celebratory jump.</div>
        <div class="mascot-best-for">🏆 Badges & Level Ups</div>
      </div>

      <!-- 10. Clean Floating Vector -->
      <div class="mascot-card">
        <span class="card-num">#10</span>
        <span class="card-type-tag tag-vector">Vector SVG</span>
        <div class="img-preview-box">
          <img src="${cleanSvg}" />
        </div>
        <div class="mascot-name">Clean Island Vector</div>
        <div class="mascot-desc">Pure vector mascot with animated soundwave support in React.</div>
        <div class="mascot-best-for">🔊 Onboarding & Chat</div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 1200));

  const outputPath = path.join(WORKSPACE_DIR, 'mascot_studio_selection_gallery.png');
  await page.screenshot({ path: outputPath, fullPage: true });
  console.log(`✅ Saved Mascot Studio Showcase to: ${outputPath}`);

  await browser.close();
}

renderMascotStudio().catch(console.error);

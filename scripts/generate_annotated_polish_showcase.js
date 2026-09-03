const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const BRAIN_DIR = '/Users/dorienvandenabbeele/.gemini/antigravity/brain/29fda69b-1c4c-487d-bfcd-67ab5689ef0e';

async function generateAnnotatedShowcase() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const comparisonPage = await browser.newPage();
  await comparisonPage.setViewport({ width: 1240, height: 980, deviceScaleFactor: 2 });

  const beforeRaw = fs.readFileSync(path.join(WORKSPACE_DIR, 'onboarding_step3_before.png')).toString('base64');
  const afterRaw = fs.readFileSync(path.join(WORKSPACE_DIR, 'screenshots', 'step3_raw_clean.png')).toString('base64');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Lexend:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #FAF8F5;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 32px 36px;
      color: #1B1C1A;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .header {
      text-align: center;
      margin-bottom: 22px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFF1F2;
      border: 1px solid #FECDD3;
      color: #E11D48;
      padding: 5px 14px;
      border-radius: 100px;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 26px;
      font-weight: 900;
      color: #1B1C1A;
      letter-spacing: -0.5px;
    }
    p.sub {
      font-size: 13.5px;
      color: #6C6255;
      margin-top: 4px;
      font-weight: 500;
    }
    .comparison-grid {
      display: flex;
      gap: 28px;
      justify-content: center;
      align-items: stretch;
      max-width: 1080px;
      width: 100%;
    }
    .card-col {
      flex: 1;
      background: #FFFFFF;
      border: 1.5px solid #EAE5DE;
      border-radius: 24px;
      padding: 20px 24px 24px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      position: relative;
    }
    .card-col.after-col {
      border-color: #E11D48;
      box-shadow: 0 12px 32px rgba(225, 29, 72, 0.08);
    }
    .col-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 16px;
      padding: 0 4px;
    }
    .col-title {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .tag-before {
      background: #F1F5F9;
      color: #475569;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }
    .tag-after {
      background: #E8F5E9;
      color: #15803D;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
    }
    
    /* Uniform Android Phone Chassis for both sides */
    .phone-chassis {
      width: 280px;
      height: 560px;
      background: #151619;
      border-radius: 36px;
      padding: 8px 7px 9px 7px;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.14);
      border: 2px solid #2F333D;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 28px;
      overflow: hidden;
      position: relative;
      background: #FAF8F5;
    }
    .screen-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    
    /* Punch hole camera & speaker slit */
    .camera-punch {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 9px;
      height: 9px;
      background: #000000;
      border-radius: 50%;
      z-index: 30;
      box-shadow: inset 0 0 1px 1px #111;
    }
    .speaker-slit {
      position: absolute;
      top: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 38px;
      height: 2.5px;
      background: #333;
      border-radius: 3px;
      z-index: 30;
    }

    /* Red Callout Overlay Rings on After Device */
    .callout-ring {
      position: absolute;
      border: 2.5px solid #E11D48;
      border-radius: 10px;
      background: rgba(225, 29, 72, 0.08);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9), 0 4px 12px rgba(225, 29, 72, 0.35);
      pointer-events: none;
      z-index: 25;
    }
    .callout-badge {
      position: absolute;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #E11D48;
      color: #FFFFFF;
      font-size: 11.5px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      top: -11px;
      right: -11px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      border: 2px solid #FFFFFF;
    }

    /* Calibrated positions on top of the clean 280x560 screen */
    .callout-subtitle {
      top: 130px;
      left: 36px;
      width: 195px;
      height: 24px;
    }
    .callout-voice {
      top: 202px;
      left: 36px;
      width: 195px;
      height: 28px;
    }
    .callout-mascot {
      top: 236px;
      left: 80px;
      width: 105px;
      height: 60px;
      border-radius: 14px;
    }

    /* Breakdown Points Section */
    .breakdown-section {
      margin-top: 24px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      max-width: 1080px;
      width: 100%;
    }
    .breakdown-card {
      background: #FFFFFF;
      border: 1.5px solid #EAE5DE;
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    }
    .breakdown-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #E11D48;
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .breakdown-content h3 {
      font-size: 13px;
      font-weight: 800;
      color: #1B1C1A;
      margin-bottom: 3px;
    }
    .breakdown-content p {
      font-size: 11.5px;
      color: #594F42;
      line-height: 1.4;
    }
    .strike {
      text-decoration: line-through;
      color: #94A3B8;
    }
    .highlight {
      color: #E11D48;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">App Craftsmanship · Micro-Polish Breakdown</div>
    <h1>How Small Word & Motion Details Transform an App</h1>
    <p class="sub">Side-by-side comparison of AI prototype copy vs. human, delight-driven production UX</p>
  </div>

  <div class="comparison-grid">
    <!-- BEFORE CARD -->
    <div class="card-col">
      <div class="col-header">
        <span class="col-title" style="color: #64748B;">Before: Robotic & Passive</span>
        <span class="tag-before">AI Prototype</span>
      </div>
      <div class="phone-chassis">
        <div class="speaker-slit"></div>
        <div class="camera-punch"></div>
        <div class="phone-screen">
          <img class="screen-img" src="data:image/png;base64,${beforeRaw}" alt="Before Onboarding Step 3" />
        </div>
      </div>
    </div>

    <!-- AFTER CARD WITH RED CALLOUT ANNOTATIONS -->
    <div class="card-col after-col">
      <div class="col-header">
        <span class="col-title" style="color: #E11D48;">After: Human, Warm & Celebrating</span>
        <span class="tag-after">✨ Polished UX</span>
      </div>
      <div class="phone-chassis">
        <div class="speaker-slit"></div>
        <div class="camera-punch"></div>
        <div class="phone-screen">
          <img class="screen-img" src="data:image/png;base64,${afterRaw}" alt="After Onboarding Step 3" />
          
          <!-- Callout 1: "Calibrated" -> "Ready" -->
          <div class="callout-ring callout-subtitle">
            <div class="callout-badge">1</div>
          </div>

          <!-- Callout 2: "Voice Engine" -> "Chosen Voice" -->
          <div class="callout-ring callout-voice">
            <div class="callout-badge">2</div>
          </div>

          <!-- Callout 3: Happy Jumping Mascot -->
          <div class="callout-ring callout-mascot">
            <div class="callout-badge">3</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 3-Column Breakdown Cards Below -->
  <div class="breakdown-section">
    <div class="breakdown-card">
      <div class="breakdown-num">1</div>
      <div class="breakdown-content">
        <h3><span class="strike">"Calibrated"</span> → <span class="highlight">"Ready"</span></h3>
        <p>AI models default to engineering jargon like <i>"calibrated"</i> or <i>"configured"</i>. Replace them with warm, human language users actually speak.</p>
      </div>
    </div>

    <div class="breakdown-card">
      <div class="breakdown-num">2</div>
      <div class="breakdown-content">
        <h3><span class="strike">"Voice Engine"</span> → <span class="highlight">"Chosen Voice"</span></h3>
        <p>Never expose backend terms to your user. Change technical labels into direct choices (<i>"Pick Your Voice"</i> / <i>"Female Voice"</i>).</p>
      </div>
    </div>

    <div class="breakdown-card">
      <div class="breakdown-num">3</div>
      <div class="breakdown-content">
        <h3><span class="strike">Static Icon</span> → <span class="highlight">Celebration Mascot</span></h3>
        <p>Completing onboarding is a milestone! Replace passive icons with an active happy dancing mascot loop to reward the user with delight.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await comparisonPage.setContent(html, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 600));

  const outWorkspace = path.join(WORKSPACE_DIR, 'onboarding_polish_before_after.png');
  const outBrain = path.join(BRAIN_DIR, 'onboarding_polish_before_after.png');

  await comparisonPage.screenshot({ path: outWorkspace, type: 'png' });
  if (fs.existsSync(BRAIN_DIR)) {
    fs.copyFileSync(outWorkspace, outBrain);
  }

  console.log(`✅ Generated Annotated Before/After showcase to: ${outWorkspace}`);
  await browser.close();
}

generateAnnotatedShowcase().catch(console.error);

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras';
const ARTIFACTS_DIR = '/Users/dorienvandenabbeele/.gemini/antigravity/brain/5c54b672-d44e-4931-835d-b08dcbdc368b';

// Helper to convert local image to base64
function getBase64Image(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath);
      const ext = path.extname(filePath).slice(1);
      const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'webp' ? 'image/webp' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
      return `data:${mime};base64,${fileData.toString('base64')}`;
    }
  } catch (e) {
    console.warn('Error reading image:', filePath, e);
  }
  return '';
}

const mascotImg = getBase64Image(path.join(WORKSPACE_DIR, 'src/assets/poquito_tilt_34_51_160.webp')) ||
                 getBase64Image(path.join(WORKSPACE_DIR, 'src/assets/poquito_front_talking_v2_clean_160.webp'));

async function generatePaywallShowcase() {
  console.log('🎨 Generating High-Resolution Paywall Design Comparison Showcase...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. MASTER COMPARISON CANVAS (1920x1080 / 2x scale)
  const masterPage = await browser.newPage();
  await masterPage.setViewport({ width: 1720, height: 1100, deviceScaleFactor: 2 });

  const masterHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lexend:wght@700;800&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #FAF8F5;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 40px 48px;
      color: #1B1C1A;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .header-block {
      text-align: center;
      margin-bottom: 32px;
      max-width: 900px;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #D5E8D1;
      border: 1px solid #A7F3D0;
      color: #065F46;
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: #1B1C1A;
      letter-spacing: -0.02em;
    }
    p.subtitle {
      font-size: 15px;
      color: #6C6255;
      margin-top: 6px;
      line-height: 1.5;
    }

    .cards-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 28px;
      width: 100%;
      max-width: 1600px;
      align-items: stretch;
    }

    .concept-card {
      background: #FFFFFF;
      border-radius: 28px;
      border: 1.5px solid #EDE8E1;
      padding: 24px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 12px 32px rgba(27, 28, 26, 0.05);
      position: relative;
    }

    .concept-tag {
      align-self: flex-start;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.6px;
      padding: 4px 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    .tag-a { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
    .tag-b { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
    .tag-c { background: #FFF7ED; color: #9A3412; border: 1px solid #FED7AA; }

    .concept-title {
      font-size: 20px;
      font-weight: 800;
      color: #1B1C1A;
      margin-bottom: 4px;
    }
    .concept-desc {
      font-size: 12.5px;
      color: #6C6255;
      line-height: 1.45;
      margin-bottom: 18px;
      min-height: 38px;
    }

    /* Device Preview Chassis */
    .device-chassis {
      background: #FBF9F5;
      border-radius: 24px;
      border: 1.5px solid #E5E0D8;
      padding: 18px 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.02);
    }

    .device-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .skip-pill {
      background: #FFFFFF;
      border: 1px solid #EDE8E1;
      padding: 3px 10px;
      border-radius: 10px;
      font-size: 10.5px;
      font-weight: 700;
      color: #6C6255;
    }
    .close-icon {
      width: 24px;
      height: 24px;
      border-radius: 12px;
      background: #FFFFFF;
      border: 1px solid #EDE8E1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #6C6255;
    }

    .hero-mascot-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 4px;
    }
    .mascot-img {
      width: 52px;
      height: 52px;
      object-fit: contain;
    }
    .trial-pill {
      background: #D5E8D1;
      border: 1px solid #A7F3D0;
      color: #065F46;
      font-size: 9.5px;
      font-weight: 800;
      padding: 2px 10px;
      border-radius: 10px;
      letter-spacing: 0.4px;
    }
    .device-headline {
      font-size: 15px;
      font-weight: 800;
      color: #1B1C1A;
      text-align: center;
      line-height: 1.3;
      margin-top: 2px;
    }
    .device-sub {
      font-size: 11px;
      color: #6C6255;
      text-align: center;
      line-height: 1.35;
    }

    /* Pastel Value Pills */
    .benefit-box {
      background: #FFFFFF;
      border-radius: 14px;
      border: 1px solid #EDE8E1;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .benefit-row {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 11px;
      font-weight: 700;
      color: #1B1C1A;
    }
    .icon-disc {
      width: 24px;
      height: 24px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
    }
    .disc-green { background: #ECFDF5; border: 1px solid #A7F3D0; color: #059669; }
    .disc-orange { background: #FFF7ED; border: 1px solid #FED7AA; color: #964824; }
    .disc-blue { background: #F0F9FF; border: 1px solid #BAE6FD; color: #0284C7; }

    /* Plan Selection Cards */
    .plan-card {
      background: #FFFFFF;
      border-radius: 14px;
      border: 1.5px solid #EDE8E1;
      padding: 10px 12px;
      position: relative;
    }
    .plan-card.selected {
      border-color: #964824;
      background: #FFF9F6;
      border-width: 2px;
    }
    .ribbon {
      position: absolute;
      top: -8px;
      right: 12px;
      background: #964824;
      color: #FFF;
      font-size: 8px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
      letter-spacing: 0.4px;
    }
    .plan-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .plan-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .radio-dot {
      width: 14px;
      height: 14px;
      border-radius: 7px;
      border: 1.5px solid #964824;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .radio-inner {
      width: 7px;
      height: 7px;
      border-radius: 3.5px;
      background: #964824;
    }
    .plan-name {
      font-size: 12px;
      font-weight: 800;
      color: #1B1C1A;
    }
    .plan-sub {
      font-size: 9.5px;
      color: #6C6255;
    }
    .plan-price {
      text-align: right;
    }
    .price-num {
      font-size: 14px;
      font-weight: 800;
      color: #1B1C1A;
    }
    .price-per {
      font-size: 9px;
      color: #6C6255;
    }

    /* CTA Button */
    .cta-btn {
      background: #964824;
      color: #FFFFFF;
      padding: 12px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 800;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(150, 72, 36, 0.25);
    }
    .reassurance {
      font-size: 9.5px;
      color: #8C8276;
      text-align: center;
      line-height: 1.3;
    }

    /* In-App Sheet Variant in Option C */
    .sheet-card {
      background: #FFFFFF;
      border-radius: 18px 18px 12px 12px;
      border: 1.5px solid #E5E0D8;
      border-bottom: none;
      padding: 12px;
      margin-top: 4px;
      box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
    }
    .handle-bar {
      width: 32px;
      height: 4px;
      background: #D1CBC3;
      border-radius: 2px;
      margin: 0 auto 8px;
    }

    .footer-eval {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #EDE8E1;
      font-size: 11.5px;
      color: #4D463E;
    }
    .eval-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .eval-key { font-weight: 600; color: #6C6255; }
    .eval-val { font-weight: 800; color: #1B1C1A; }

    /* Bottom Architecture Legend */
    .bridge-banner {
      width: 100%;
      max-width: 1600px;
      margin-top: 28px;
      background: #FFFFFF;
      border: 1.5px solid #EDE8E1;
      border-radius: 20px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.03);
    }
    .bridge-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .bridge-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      color: #1D4ED8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .bridge-title {
      font-size: 15px;
      font-weight: 800;
      color: #1B1C1A;
    }
    .bridge-sub {
      font-size: 12.5px;
      color: #6C6255;
      margin-top: 2px;
    }
    .bridge-flow {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .channel-badge-pill {
      padding: 6px 14px;
      border-radius: 10px;
      font-size: 11.5px;
      font-weight: 800;
    }
    .ch-rc { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
    .ch-strp { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
    .arrow-icon { color: #8C8276; font-size: 16px; font-weight: 800; }
  </style>
</head>
<body>

  <div class="header-block">
    <div class="badge-pill">
      🇵🇦 Visual Design Options • PoquitoTalk Monetization
    </div>
    <h1>Paywall Architecture & Design Alternatives</h1>
    <p class="subtitle">
      Evaluating 3 high-converting design options rooted in the new <strong>Warm Terracotta & Island Aesthetic</strong>, with unified product IDs across RevenueCat (In-App) and Stripe (Web Funnel).
    </p>
  </div>

  <div class="cards-row">

    <!-- OPTION A: PERSONA-ADAPTIVE -->
    <div class="concept-card">
      <div class="concept-tag tag-a">Option A • Smart Dynamic</div>
      <div class="concept-title">Persona-Adaptive Paywall</div>
      <div class="concept-desc">Dynamically switches hero value propositions based on user role (🏡 Expat vs ✈️ Traveler vs 🤝 Local Host).</div>

      <div class="device-chassis">
        <div class="device-top-bar">
          <div class="skip-pill">Explore Free First</div>
          <div class="close-icon">✕</div>
        </div>

        <div class="hero-mascot-box">
          <img src="${mascotImg}" class="mascot-img" alt="Poquito Mascot" />
          <div class="trial-badge trial-pill">7-DAY FREE TRIAL INCLUDED</div>
          <div class="device-headline">Island Resident Pass 🏡</div>
          <div class="device-sub">A/C, boat captains, water outages & verified Bocas phonebook.</div>
        </div>

        <div class="benefit-box">
          <div class="benefit-row">
            <div class="icon-disc disc-orange">🛠️</div>
            <span>Island Presets: Plumbers, Boats & A/C</span>
          </div>
          <div class="benefit-row">
            <div class="icon-disc disc-green">💬</div>
            <span>1-Tap WhatsApp Voice Notes in Spanish</span>
          </div>
          <div class="benefit-row">
            <div class="icon-disc disc-blue">📻</div>
            <span>2-Way Contractor Walkie-Talkie Links</span>
          </div>
        </div>

        <div class="plan-card selected">
          <div class="ribbon">SAVE 58% • BEST VALUE</div>
          <div class="plan-header">
            <div class="plan-left">
              <div class="radio-dot"><div class="radio-inner"></div></div>
              <div>
                <div class="plan-name">Annual Explorer Pass</div>
                <div class="plan-sub">7 Days Free • Then $29.99 / yr</div>
              </div>
            </div>
            <div class="plan-price">
              <div class="price-num">$2.49</div>
              <div class="price-per">/ month</div>
            </div>
          </div>
        </div>

        <div class="plan-card">
          <div class="plan-header">
            <div class="plan-left">
              <div class="radio-dot" style="border-color:#CFC5BB;"></div>
              <div>
                <div class="plan-name">Monthly Resident</div>
                <div class="plan-sub">Cancel anytime in 1 tap</div>
              </div>
            </div>
            <div class="plan-price">
              <div class="price-num">$9.99</div>
              <div class="price-per">/ month</div>
            </div>
          </div>
        </div>

        <div class="cta-btn">
          <span>Start 7-Day Free Trial</span>
          <span>→</span>
        </div>
        <div class="reassurance">No charge today • Reminded 2 days before trial ends</div>
      </div>

      <div class="footer-eval">
        <div class="eval-row"><span class="eval-key">Onboarding Fit:</span><span class="eval-val">⭐⭐⭐⭐⭐ Perfect Match</span></div>
        <div class="eval-row"><span class="eval-key">Conversion Driver:</span><span class="eval-val">Role relevance + 7-Day Trial</span></div>
      </div>
    </div>

    <!-- OPTION B: 3-TIER HORIZONTAL STACK -->
    <div class="concept-card">
      <div class="concept-tag tag-b">Option B • Direct & Transparent</div>
      <div class="concept-title">3-Tier Unified Stack</div>
      <div class="concept-desc">Presents Annual Trial, Monthly, and 50 Credits Pack side-by-side so tourists and expats immediately find their tier.</div>

      <div class="device-chassis">
        <div class="device-top-bar">
          <div class="skip-pill">Explore Free First</div>
          <div class="close-icon">✕</div>
        </div>

        <div class="hero-mascot-box">
          <img src="${mascotImg}" class="mascot-img" alt="Poquito Mascot" />
          <div class="trial-badge trial-pill">CHOOSE YOUR MEMBERSHIP</div>
          <div class="device-headline">Speak Natural Spanish 🇵🇦</div>
          <div class="device-sub">Human Panamanian voice notes & offline island packs.</div>
        </div>

        <!-- TIER 1 -->
        <div class="plan-card selected">
          <div class="ribbon">7 DAYS FREE • SAVE 58%</div>
          <div class="plan-header">
            <div class="plan-left">
              <div class="radio-dot"><div class="radio-inner"></div></div>
              <div>
                <div class="plan-name">Annual Explorer Pass</div>
                <div class="plan-sub">7 Days Free • Then $29.99/yr</div>
              </div>
            </div>
            <div class="plan-price">
              <div class="price-num">$2.49</div>
              <div class="price-per">/ mo</div>
            </div>
          </div>
        </div>

        <!-- TIER 2 -->
        <div class="plan-card">
          <div class="plan-header">
            <div class="plan-left">
              <div class="radio-dot" style="border-color:#CFC5BB;"></div>
              <div>
                <div class="plan-name">Monthly Resident Pass</div>
                <div class="plan-sub">Month-to-month flexibility</div>
              </div>
            </div>
            <div class="plan-price">
              <div class="price-num">$9.99</div>
              <div class="price-per">/ mo</div>
            </div>
          </div>
        </div>

        <!-- TIER 3 (CONSUMABLE NON-SUB) -->
        <div class="plan-card">
          <div class="plan-header">
            <div class="plan-left">
              <div class="radio-dot" style="border-color:#CFC5BB;"></div>
              <div>
                <div class="plan-name">50 Poquito Credits Pack</div>
                <div class="plan-sub">50 Voice Notes • Never expires</div>
              </div>
            </div>
            <div class="plan-price">
              <div class="price-num">$4.99</div>
              <div class="price-per">one-time</div>
            </div>
          </div>
        </div>

        <div class="cta-btn">
          <span>Start 7-Day Free Trial</span>
          <span>→</span>
        </div>
        <div class="reassurance">Secured via Apple App Store / Google Play</div>
      </div>

      <div class="footer-eval">
        <div class="eval-row"><span class="eval-key">Tourist Handling:</span><span class="eval-val">⭐⭐⭐⭐⭐ $4.99 non-sub option</span></div>
        <div class="eval-row"><span class="eval-key">Clarity:</span><span class="eval-val">100% Upfront transparency</span></div>
      </div>
    </div>

    <!-- OPTION C: UNIFIED DUAL-MODE -->
    <div class="concept-card">
      <div class="concept-tag tag-c">Option C • Unified Dual-Mode</div>
      <div class="concept-title">Fullscreen + In-App Drawer</div>
      <div class="concept-desc">One unified component rendering as Fullscreen after onboarding, and as a lightweight Slide-Up Drawer on limit hit.</div>

      <div class="device-chassis" style="justify-content: flex-end; position:relative; overflow:hidden;">
        <!-- Top Half: Dimmed App Context -->
        <div style="opacity: 0.35; padding: 6px 0; display:flex; flex-direction:column; gap:8px;">
          <div style="height:20px; width:60%; background:#EDE8E1; border-radius:6px;"></div>
          <div style="height:44px; width:100%; background:#FFF; border-radius:12px; border:1px solid #EDE8E1;"></div>
          <div style="height:44px; width:100%; background:#FFF; border-radius:12px; border:1px solid #EDE8E1;"></div>
        </div>

        <!-- Bottom Sheet Drawer -->
        <div class="sheet-card">
          <div class="handle-bar"></div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <div style="width:28px; height:28px; border-radius:14px; background:#FEF3C7; display:flex; align-items:center; justify-content:center; font-size:14px;">⚡</div>
            <div>
              <div style="font-size:12.5px; font-weight:800; color:#1B1C1A;">Daily Free Limit Reached (10/10)</div>
              <div style="font-size:10px; color:#6C6255;">Unlock unlimited Panamanian voices in 1 tap</div>
            </div>
          </div>

          <div class="plan-card selected" style="margin-bottom:8px; padding:8px 10px;">
            <div class="plan-header">
              <div class="plan-left">
                <div class="radio-dot"><div class="radio-inner"></div></div>
                <div>
                  <div class="plan-name" style="font-size:11.5px;">Annual Pass (7 Days Free)</div>
                  <div class="plan-sub">$29.99/yr ($2.49/mo)</div>
                </div>
              </div>
              <div class="price-num" style="font-size:13px;">$2.49<span style="font-size:9px; color:#6C6255;">/mo</span></div>
            </div>
          </div>

          <div class="plan-card" style="margin-bottom:8px; padding:8px 10px;">
            <div class="plan-header">
              <div class="plan-left">
                <div class="radio-dot" style="border-color:#CFC5BB;"></div>
                <div>
                  <div class="plan-name" style="font-size:11.5px;">Top-Up 50 Poquito Credits</div>
                  <div class="plan-sub">Instant unblock • No recurring billing</div>
                </div>
              </div>
              <div class="price-num" style="font-size:13px;">$4.99</div>
            </div>
          </div>

          <div class="cta-btn" style="padding:10px; font-size:12px;">
            <span>Unlock Now (7 Days Free)</span>
            <span>→</span>
          </div>
        </div>
      </div>

      <div class="footer-eval">
        <div class="eval-row"><span class="eval-key">Code Architecture:</span><span class="eval-val">⭐⭐⭐⭐⭐ Single Source of Truth</span></div>
        <div class="eval-row"><span class="eval-key">User Friction:</span><span class="eval-val">Zero disruption during tasks</span></div>
      </div>
    </div>

  </div>

  <!-- CROSS-CHANNEL BRIDGE: REVENUECAT VS STRIPE -->
  <div class="bridge-banner">
    <div class="bridge-left">
      <div class="bridge-icon-box">⚡</div>
      <div>
        <div class="bridge-title">Unified Multi-Channel Monetization Bridge</div>
        <div class="bridge-sub">Same 3 Products across Mobile App Stores (RevenueCat) and Online Web Funnel (Stripe) with 1-Tap Claim Token</div>
      </div>
    </div>

    <div class="bridge-flow">
      <div class="channel-badge-pill ch-strp">🌐 Stripe Web Funnel ($29.99 / $12.99 / $4.99)</div>
      <div class="arrow-icon">→</div>
      <div class="channel-badge-pill" style="background:#F1F5F9; color:#0F172A; border:1px solid #CBD5E1;">🔑 pt_claim_... Token</div>
      <div class="arrow-icon">→</div>
      <div class="channel-badge-pill ch-rc">📱 In-App Claim & RevenueCat Pro</div>
    </div>
  </div>

</body>
</html>
  `;

  await masterPage.setContent(masterHtml, { waitUntil: 'networkidle0' });
  const showcasePath = path.join(WORKSPACE_DIR, 'paywall_options_showcase.png');
  await masterPage.screenshot({ path: showcasePath, fullPage: true });
  console.log('✅ Saved Master Showcase to:', showcasePath);

  // 2. DETAILED COMPARISON 2: CROSS-CHANNEL STRIPE VS REVENUECAT DIAGRAM
  const bridgePage = await browser.newPage();
  await bridgePage.setViewport({ width: 1400, height: 800, deviceScaleFactor: 2 });

  const bridgeHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Lexend:wght@700;800&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #FAF8F5;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 40px 48px;
      color: #1B1C1A;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .header { text-align: center; margin-bottom: 28px; }
    .badge {
      display: inline-block;
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      color: #065F46;
      font-size: 11px;
      font-weight: 800;
      padding: 5px 14px;
      border-radius: 100px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 10px;
    }
    h1 { font-family: 'Lexend', sans-serif; font-size: 28px; color: #1B1C1A; }
    p { font-size: 14px; color: #6C6255; margin-top: 4px; }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      width: 100%;
      max-width: 1200px;
    }
    .col-card {
      background: #FFFFFF;
      border: 1.5px solid #EDE8E1;
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.04);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .col-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid #EDE8E1;
    }
    .channel-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
    .ic-strp { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
    .ic-rc { background: #FFF7ED; color: #964824; border: 1px solid #FED7AA; }
    .col-title { font-size: 18px; font-weight: 800; color: #1B1C1A; }
    .col-sub { font-size: 12px; color: #6C6255; }

    .item-box {
      background: #FBF9F5;
      border: 1px solid #E5E0D8;
      border-radius: 14px;
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .item-name { font-size: 13.5px; font-weight: 800; color: #1B1C1A; }
    .item-id { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #6C6255; margin-top: 2px; }
    .item-price { font-size: 15px; font-weight: 800; color: #964824; }

    .bridge-middle-box {
      grid-column: 1 / -1;
      background: #FFFFFF;
      border: 2px dashed #CBD5E1;
      border-radius: 20px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .bridge-text-box h3 { font-size: 15px; font-weight: 800; color: #1B1C1A; }
    .bridge-text-box p { font-size: 12px; color: #6C6255; }
    .token-chip {
      background: #0F172A;
      color: #38BDF8;
      font-family: 'JetBrains Mono', monospace;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="badge">Cross-Channel Unified Matrix</div>
    <h1>Stripe Web Funnel vs In-App RevenueCat</h1>
    <p>How the 3 product tiers and web-to-app token claims bridge together flawlessly.</p>
  </div>

  <div class="grid-2">

    <!-- STRIPE WEB FUNNEL -->
    <div class="col-card">
      <div class="col-header">
        <div class="channel-icon ic-strp">🌐</div>
        <div>
          <div class="col-title">Online Web Funnel (Stripe)</div>
          <div class="col-sub">poquitotalk.hero-apps.com/ #pricing</div>
        </div>
      </div>

      <div class="item-box">
        <div>
          <div class="item-name">Pro Annual Explorer Pass</div>
          <div class="item-id">metadata: {"package_type": "pro_annual"}</div>
        </div>
        <div class="item-price">$29.99 / yr</div>
      </div>

      <div class="item-box">
        <div>
          <div class="item-name">Pro Monthly Resident</div>
          <div class="item-id">metadata: {"package_type": "pro_monthly"}</div>
        </div>
        <div class="item-price">$12.99 / mo</div>
      </div>

      <div class="item-box">
        <div>
          <div class="item-name">50 Poquito Credits Pack</div>
          <div class="item-id">metadata: {"package_type": "credits_50"}</div>
        </div>
        <div class="item-price">$4.99 once</div>
      </div>
    </div>

    <!-- REVENUECAT IN-APP -->
    <div class="col-card">
      <div class="col-header">
        <div class="channel-icon ic-rc">📱</div>
        <div>
          <div class="col-title">Mobile In-App (RevenueCat)</div>
          <div class="col-sub">Apple App Store & Google Play Store</div>
        </div>
      </div>

      <div class="item-box">
        <div>
          <div class="item-name">Annual Explorer Pass (7-Day Trial)</div>
          <div class="item-id">Product: pt_annual_2999 → Entitlement: pro</div>
        </div>
        <div class="item-price">$29.99 / yr</div>
      </div>

      <div class="item-box">
        <div>
          <div class="item-name">Monthly Resident Pass</div>
          <div class="item-id">Product: pt_monthly_1299 → Entitlement: pro</div>
        </div>
        <div class="item-price">$12.99 / mo</div>
      </div>

      <div class="item-box">
        <div>
          <div class="item-name">50 Poquito Credits Pack</div>
          <div class="item-id">Product: pt_credits_50 (Consumable)</div>
        </div>
        <div class="item-price">$4.99 once</div>
      </div>
    </div>

    <!-- WEB-TO-APP CLAIM BRIDGE -->
    <div class="bridge-middle-box">
      <div class="bridge-text-box">
        <h3>⚡ 1-Tap Web-to-App Claim Bridge (api/stripe_webhook.php)</h3>
        <p>When a customer pays on the web, Stripe automatically fires a webhook generating a unique token. The user taps "Open App" or scans the QR code to instantly deposit credits or activate Pro on their phone.</p>
      </div>
      <div class="token-chip">poquitotalk://claim?token=pt_claim_...</div>
    </div>

  </div>

</body>
</html>
  `;

  await bridgePage.setContent(bridgeHtml, { waitUntil: 'networkidle0' });
  const bridgePath = path.join(WORKSPACE_DIR, 'paywall_cross_channel_stripe_rc.png');
  await bridgePage.screenshot({ path: bridgePath, fullPage: true });
  console.log('✅ Saved Cross-Channel Bridge Diagram to:', bridgePath);

  await browser.close();
  console.log('🎉 All Visual Examples successfully generated and copied to workspace root!');
}

generatePaywallShowcase().catch(console.error);

---
name: before-after-showcase
description: Generates high-resolution Before & After visual comparison social cards, UI progress showcases, and interactive state transitions using automated headless Chrome captures, dual realistic titanium device frames, and tailored light/dark canvas templates.
---

# Before & After Visual Showcase & UI Comparison Skill

Use this skill whenever asked to:
- Generate a visual **Before & After comparison** card or showcase of a web or mobile application.
- Compare two distinct UI states (e.g. baseline vs. redesigned, collapsed vs. expanded interactive tooltip, raw data vs. decoded explanation, light vs. dark theme).
- Create high-converting promotional graphics for social media (Twitter/X, LinkedIn), pitch decks, documentation, or changelogs.
- Document and celebrate UI evolutions with pixel-perfect, `@2x retina` dual device frames.

---

## 🏗️ 1. Pipeline Architecture

```
┌──────────────────────────────────────────────┐
│  Live Web / Mobile App Viewport              │
└──────────────────────┬───────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│ State A: "BEFORE"       │ │ State B: "AFTER"        │
│ (Baseline / Collapsed)  │ │ (Upgraded / Expanded)   │
│ ?state=before           │ │ ?state=after            │
└────────────┬────────────┘ └────────────┬────────────┘
             │                           │
             ▼                           ▼
┌─────────────────────────────────────────────────────┐
│ Headless Chrome Capture (@2x Retina Scale)          │
│ • Phone: 393 × 852 @ 2x   • Desktop: 1280 × 800 @ 2x│
└──────────────────────────┬──────────────────────────┘
                           │ In-Memory Base64 Conversion
                           ▼
┌─────────────────────────────────────────────────────┐
│ Artisanal HTML Showcase Card Canvas                 │
│ • 1600 × 1050 (or 2400 × 1575 4K)                   │
│ • Dual Titanium Frames + "→ TRANSITION" Arrow       │
│ • Inline SVG Logo + Brand Badge + Value Copy        │
│ • Metadata Footer (@DorienVibecodes, Timestamp)     │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│ Final High-Res Comparison PNG                       │
│ 1. Saved to screenshots/before_after_comparison.png │
│ 2. Copied to workspace root ./comparison.png        │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 2. Visual Aesthetic Standards

### A. Dual Column Device Layout
- **Left Column ("● BEFORE")**:
  - Badge: Soft coral/rose pill (`background: #FEE2E2; color: #B91C1C; border: 1.5px solid #FCA5A5; font-weight: 800;`).
  - Frame: Neutral titanium/matte black chassis (`background: #18191B; border-radius: 44px; padding: 10px; box-shadow: 0 25px 60px rgba(0,0,0,0.12);`).
- **Central Divider ("→ TRANSITION")**:
  - Glowing circular button with directional arrow (`width: 48px; height: 48px; border-radius: 50%; background: #FFF; box-shadow: 0 6px 18px rgba(0,0,0,0.08);`).
  - Micro-label: `font-family: 'Lexend'; font-size: 11px; font-weight: 700; letter-spacing: 1.5px;`.
- **Right Column ("● AFTER")**:
  - Badge: Soft sage/emerald pill (`background: #D5E8D1; color: #2E402D; border: 1.5px solid #82B37A; font-weight: 800;`).
  - Frame: Identical clean titanium/matte black chassis (`background: #18191B; border-radius: 44px; padding: 10px; box-shadow: 0 25px 60px rgba(0,0,0,0.14);`). Never use colored border outlines or glows around the device frame.

### B. Color Themes
1. **Soothing Light Pastel Theme (Default for Consumer / Utility Apps)**:
   - Backdrop: Warm radial linen (`radial-gradient(circle at 50% 0%, #FFF5EE 0%, #FBF9F5 45%, #F5F1EB 100%)`).
   - Grid Texture: 28px dot matrix (`radial-gradient(rgba(150, 72, 36, 0.04) 1px, transparent 1px)`).
   - Typography: `#1B1C1A` primary, `#594F42` secondary.
2. **Hero-Apps Premium Dark Theme (For Developer / B2B SaaS Tools)**:
   - Backdrop: Pitch-black `#050507` with charcoal card containers (`#0c0c0f`).
   - Accents: Neon green `#a8ff35` and subtle borders `rgba(255, 255, 255, 0.06)`.

### C. Branding & Iconography Rules
- **Vector SVGs Only**: Always use crisp, inline vector SVGs for brand logos (`stroke-linecap="round"`, `stroke-linejoin="round"`). Never use low-resolution PNG placeholders.
- **Zero Cartoonish Emojis**: Never place decorative cartoon emojis in titles or headers. The sole exception is official country flag emojis (e.g., 🇵🇦).
- **No Hyped Buzzwords**: Ban tacky buzzwords like *"Expert AI Super-Tool"*. Keep copywriting grounded, precise, and human.

---

## ⚡ 3. Automated Capture & Card Generation Script Template

Below is the standalone Node.js script structure for generating pixel-perfect Before & After showcases:

```javascript
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');

async function captureScreen({ url, outputPath, width = 393, height = 852, scale = 2, scrollY = 0, delay = 800 }) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: scale });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, delay));

    if (scrollY > 0) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await new Promise((r) => setTimeout(r, 300));
    }

    await page.screenshot({ path: outputPath, fullPage: false });
  } finally {
    await browser.close();
  }
}

async function generateComparisonCard({
  beforeImgPath,
  afterImgPath,
  outputComparisonPath,
  brandName = 'PoquitoTalk',
  brandBadge = 'Panamá 🇵🇦',
  subtitle = 'Instant Spanish Voice Notes for Expats',
  title = 'Interactive Tooltip & Currency Parity Evolution',
  author = '@DorienVibecodes',
  domain = 'poquitotalk.hero-apps.com',
  logoSvg = '',
}) {
  const beforeBase64 = `data:image/png;base64,${fs.readFileSync(beforeImgPath).toString('base64')}`;
  const afterBase64 = `data:image/png;base64,${fs.readFileSync(afterImgPath).toString('base64')}`;

  const timestamp = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@500;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background-color: #FBF9F5;
      background-image: 
        radial-gradient(circle at 50% 0%, #FFF5EE 0%, #FBF9F5 45%, #F5F1EB 100%),
        radial-gradient(rgba(150, 72, 36, 0.04) 1px, transparent 1px);
      background-size: 100% 100%, 28px 28px;
      color: #1B1C1A;
      width: 1600px;
      height: 1050px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 64px;
      overflow: hidden;
      position: relative;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
      border-bottom: 1px solid #E4E2DE;
      padding-bottom: 18px;
    }
    .brand { display: flex; align-items: center; gap: 16px; }
    .brand-title {
      font-family: 'Lexend', sans-serif;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: #1B1C1A;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #964824;
      background: #FFDBCD;
      padding: 4px 10px;
      border-radius: 100px;
      border: 1px solid #FD9A6F;
    }
    .brand-subtitle { font-size: 14px; font-weight: 600; color: #594F42; margin-top: 2px; }
    .comparison-container {
      display: flex;
      gap: 56px;
      justify-content: center;
      align-items: center;
      flex: 1;
      margin: 16px 0;
      position: relative;
      z-index: 10;
    }
    .column { display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .tag {
      font-family: 'Lexend', sans-serif;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 100px;
    }
    .tag-before { background: #FEE2E2; color: #B91C1C; border: 1.5px solid #FCA5A5; }
    .tag-after { background: #D5E8D1; color: #2E402D; border: 1.5px solid #82B37A; }
    .phone-frame {
      width: 360px;
      height: 760px;
      background: #18191B;
      border-radius: 44px;
      padding: 10px;
      box-shadow: 0 25px 60px rgba(89, 79, 66, 0.16), 0 8px 20px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
    }
    .phone-frame.after {
      border: 2.5px solid #FD9A6F;
      box-shadow: 0 30px 70px rgba(150, 72, 36, 0.18), 0 8px 24px rgba(0,0,0,0.08);
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 34px;
      overflow: hidden;
      background: #FAF7F2;
    }
    .phone-screen img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
    .arrow-divider { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #807264; }
    .arrow-icon {
      width: 48px; height: 48px; border-radius: 50%; background: #FFFFFF;
      border: 1.5px solid #E4E2DE; display: flex; align-items: center; justify-content: center;
      font-size: 22px; color: #964824; box-shadow: 0 6px 18px rgba(150, 72, 36, 0.1);
    }
    .footer {
      display: flex; justify-content: space-between; align-items: center;
      border-top: 1px solid #E4E2DE; padding-top: 16px; font-size: 13px; color: #5C554D;
      position: relative; z-index: 10;
    }
    .highlight { color: #1B1C1A; font-weight: 700; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      ${logoSvg}
      <div>
        <div class="brand-title">${brandName} <span class="badge">${brandBadge}</span></div>
        <div class="brand-subtitle">${subtitle}</div>
      </div>
    </div>
  </div>

  <div class="comparison-container">
    <div class="column">
      <div class="tag tag-before">● BEFORE</div>
      <div class="phone-frame">
        <div class="phone-screen">
          <img src="${beforeBase64}" alt="Before UI" />
        </div>
      </div>
    </div>

    <div class="arrow-divider">
      <div class="arrow-icon">→</div>
      <span style="font-family: 'Lexend'; font-size: 11px; font-weight: 700; letter-spacing: 1.5px;">TRANSITION</span>
    </div>

    <div class="column">
      <div class="tag tag-after">● AFTER</div>
      <div class="phone-frame after">
        <div class="phone-screen">
          <img src="${afterBase64}" alt="After UI" />
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>Captured: <span class="highlight">${timestamp}</span></div>
    <div>Created by <span class="highlight">${author}</span> • <span class="highlight">${domain}</span></div>
  </div>
</body>
</html>
`;

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: outputComparisonPath, fullPage: false });
  } finally {
    await browser.close();
  }
}
```

---

## 📌 4. Mandatory Workspace Delivery & Semantic Naming Rules

Whenever a Before & After card is generated:
1. **Strict Semantic Naming (No Generic Overwrite Collisions)**:
   - **NEVER** name files generic names like `before_after_comparison.png`, `comparison.png`, `before.png`, or `after.png`.
   - **ALWAYS** use unique, feature-specific names: `[feature_name]_before_after.png` (e.g. `app_mvp_dialect_evolution_before_after.png`, `naturgy_tooltip_before_after.png`, `directory_screen_before_after.png`).
2. **Dual Location Archiving**:
   - Save to `screenshots/[feature_name]_before_after.png`.
   - **Always automatically copy** to the active workspace root `./[feature_name]_before_after.png` so it is immediately visible to the user.
3. Provide a direct clickable markdown link `[filename](file:///path/to/file)` in the response.


---
name: static-store-screenshots
description: Generates clean, disciplined, single-device framed App Store and Google Play Store screenshots (Apple, Linear, Stripe style) with uniform titanium device chassis, editorial typography, uppercase category tags, and uncluttered full-screen UI captures.
metadata:
  version: 1.0.0
---

# Static App Store Screenshots (Clean Disciplined Single-Device Suite)

This skill provides the architectural framework, typographic hierarchy, device chassis parameters, and automated Puppeteer rendering pipeline for creating **clean, consistent, single-device App Store & Google Play screenshots**.

This style is ideal for utility tools, developer products, and high-fidelity apps where **clean aesthetic discipline, uniform symmetry, and uncluttered full-UI visibility** are preferred.

---

## 1. The Disciplined Single-Device Framework

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│     SLOT 1      │ │     SLOT 2      │ │     SLOT 3      │ │     SLOT 4      │
│  VOICE DISPATCH │ │ PRESET DIALECTS │ │ LOCAL DIRECTORY │ │ SMART CAM SCAN  │
│                 │ │                 │ │                 │ │                 │
│  [CATEGORY TAG] │ │  [CATEGORY TAG] │ │  [CATEGORY TAG] │ │  [CATEGORY TAG] │
│  [Main Title]   │ │  [Main Title]   │ │  [Main Title]   │ │  [Main Title]   │
│  [Subtitle]     │ │  [Subtitle]     │ │  [Subtitle]     │ │  [Subtitle]     │
│                 │ │                 │ │                 │ │                 │
│   ┌─────────┐   │ │   ┌─────────┐   │ │   ┌─────────┐   │ │   ┌─────────┐   │
│   │ Dynamic │   │ │   │ Dynamic │   │ │   │ Dynamic │   │ │   │ Dynamic │   │
│   │  Phone  │   │ │   │  Phone  │   │ │   │  Phone  │   │ │   │  Phone  │   │
│   │ Screen  │   │ │   │ Screen  │   │ │   │ Screen  │   │ │   │ Screen  │   │
│   │         │   │ │   │         │   │ │   │         │   │ │   │         │
│   └─────────┘   │ │   └─────────┘   │ │   └─────────┘   │ │   └─────────┘   │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Visual Characteristics
* **Exact Geometric Uniformity**: Every screenshot in the sequence shares the identical phone scale, border radius, elevation shadow, and top margin.
* **Triple-Tier Typographic Header**:
  1. **Category Tag**: Uppercase mono/sans pill (`font-size: 20px`, letter-spacing `+2.5px`, subtle brand background).
  2. **Main Headline**: ExtraBold sans (`Lexend / Plus Jakarta Sans`, `72px - 76px`, line-height `1.12`).
  3. **Sub-caption**: Medium sans (`24px - 26px`, muted warm gray `#6E665B`, max 2 lines).
* **Uncompromised UI Visibility**: The entire mobile viewport (status bar to bottom tab navigation) is cleanly contained inside the titanium frame with no cutting off or clipping.

---

## 2. Typographic & Chassis Design Tokens

| Token | Specification |
|---|---|
| **Pill Category Tag** | `font-size: 20px`, `font-weight: 800`, `letter-spacing: 2px`, `padding: 10px 24px`, `border-radius: 100px` |
| **Main Headline** | `Lexend`, `weight: 900`, `size: 74px`, `color: #1E293B`, highlight in brand accent |
| **Subtitle** | `Plus Jakarta Sans`, `weight: 600`, `size: 25px`, `color: #6E665B`, `line-height: 1.35` |
| **Chassis Width** | `680px` centered inside `1080px` canvas (yielding 200px lateral breathing margins) |
| **Chassis Border** | `4px solid #2D3748`, `border-radius: 60px`, `background: #111215` |
| **Dynamic Island** | `width: 140px`, `height: 32px`, `border-radius: 20px`, `background: #000000` |
| **Canvas Dimensions**| `1080 × 1920` (Google Play Store & Apple App Store standard) |

---

## 3. Automated Rendering Pipeline (Puppeteer Engine)

```javascript
// Launch headless Chrome & capture live screens
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

// Render 1080x1920 static template
const renderPage = await browser.newPage();
await renderPage.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
await renderPage.setContent(staticTemplateHtml, { waitUntil: "domcontentloaded" });
await renderPage.screenshot({ path: "play_store_screenshot_1.png" });
```

---

## 4. 4-in-1 Social Composite Output
Always compile the 4 vertical screenshots into a **2400 × 1350 (16:9)** showcase card (`poquitotalk_app_showcase_4up.png`) with clean drop-shadowed vector logo and creator attribution.

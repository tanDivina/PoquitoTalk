---
name: dynamic-store-screenshots
description: Generates high-converting, character-driven multi-format App Store and Google Play Store screenshot suites (Duolingo, Clucky, Headspace style) featuring expressive mascot interactions (walkie-talkie dispatch, peeking curiosity, localized personas), floating feature badge grids with count script, social proof trust laurels, and zoomed bottom-bleed screens via automated headless Chrome emulation.
metadata:
  version: 1.1.0
---

# Dynamic App Store Screenshots (High-Conversion Mascot-Integrated Suite)

This skill provides the architectural framework, visual psychology, mascot integration rules, typographic standards, and automated Puppeteer rendering pipeline for creating **dynamic, high-converting App Store & Google Play screenshots**.

Instead of repeating the same static phone frame across all slots, this style introduces **visual rhythm, scale contrast, expressive mascot storytelling, floating feature tiles, and social proof anchors** proven to maximize App Store conversion rates (CVR).

---

## 1. Mascot-Driven Conversion Architecture

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│      SLOT 1      │ │      SLOT 2      │ │      SLOT 3      │ │      SLOT 4      │
│ MASCOT DISPATCH  │ │ PEEKING MASCOT & │ │  TRUST LAUREL &  │ │ COOL MASCOT &    │
│   ACTION HERO    │ │  FEATURE BADGES  │ │   ZOOMED BLEED   │ │ DIALECT SWITCHER │
│                  │ │                  │ │                  │ │                  │
│  [Big Headline]  │ │  [Big Headline]  │ │  [Big Headline]  │ │  [Big Headline]  │
│  🦜 Radio Parrot │ │        👀 Peeking │ │  ★★★★★ Laurel    │ │ [Pill Switcher]  │
│  💬 Speech Bubble│ │  ┌───┐    ┌───┐  │ │   ┌────────────┐ │ │        😎 Mascot │
│   ┌────────────┐ │ │  └───┘    └───┘  │ │   │            │ │ │   ┌────────────┐ │
│   │ Phone Hero │ │ │  ┌───┐    ┌───┐  │ │   │   Zoomed   │ │ │   │   Zoomed   │ │
│   │            │ │ │  └───┘    └───┘  │ │   │  Directory │ │ │   │  Templates │ │
│   └────────────┘ │ │   + 15 presets ✍️ │ │   │   (Bleed)  │ │ │   │   (Bleed)  │ │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Slot 1: The Mascot Dispatch Hero (In-Context Problem Solver)
* **Goal**: Stop the scroll within 1.5 seconds by grounding the app's value proposition in an expressive character moment.
* **Composition**:
  - Massive 3-line benefit headline (`Lexend ExtraBold / 900`, 78–84px).
  - Subtitle clarifying the core input/output value (e.g., *"Speak English • Translates Studio-Quality Panama Spanish"*).
  - **Character Interaction Row**: Mascot in action (e.g. Poquito wearing radio headset and island walkie-talkie) paired with a contextual speech bubble directly targeting the phone's voice input (e.g. `1-Tap Voice Dispatch`).
  - Titanium smartphone chassis with realistic screen capture.

### Slot 2: Peeking Mascot & Floating Feature Badges (Breadth & Curiosity)
* **Goal**: Break visual monotony; prove feature breadth at a glance without forcing users to read dense UI.
* **Composition**:
  - Punchy headline: *"Instant Audio Presets For Island Emergencies"*.
  - **Peeking Mascot**: Cute, wide-eyed surprised mascot peeking over the top corner of the feature grid to create curiosity and emotional connection.
  - **2×2 Feature Grid**: Clean rounded cards (`border-radius: 36px`, subtle elevation) featuring the **exact in-app vector SVG icons** (Speedboat, Power Flash, A/C Snowflake, Water Tank Refill).
  - Hand-drawn/script count accent (e.g., *"+ 15 island emergency presets 🌴"* using `Caveat`, tilt `-3deg`).
  - Dark utility badge at bottom (e.g., *"100% Offline Ready • No WiFi Needed"*).

### Slot 3: Social Proof & Zoomed Bottom Bleed (Trust + Legibility)
* **Goal**: Prove local authority and make UI details readable without pinching or squinting.
* **Composition**:
  - Benefit headline: *"Verified Island Contractor Directory"*.
  - **5-Star Laurel Trust Badge**: `★★★★★ TRUSTED BOCAS DEL TORO PROS ★★★★★` inside a floating pill.
  - Massive bottom-bleed phone screen (enlarged to 780px width) cropped cleanly at the bottom edge so contractor listings, phone buttons, and categories are crisp and legible.

### Slot 4: Persona / Mode Switcher with Thematic Mascot (Differentiation)
* **Goal**: Show unique tonal flexibility (e.g., Polite vs Local Slang) with personality.
* **Composition**:
  - Headline: *"Speak Like A Local, Not A Stiff Robot"*.
  - Dual-tone floating toggle (`🌿 Poquito (Polite)` vs `⚡️ Full Panameño`).
  - **Thematic Mascot**: Character styled in accordance with the theme (e.g. Poquito rocking dark sunglasses).
  - Zoomed bottom-bleed UI showing natural translated phrases and voice audio buttons.

---

## 2. Typographic & Visual Standards

| Element | Specification |
|---|---|
| **Primary Headline** | `Lexend`, `weight: 900`, `size: 78px - 84px`, `line-height: 1.08`, `letter-spacing: -1.6px` |
| **Accent Keyword** | Highlighted in brand accent color (e.g. Terracotta `#964824` or Emerald `#10B981`) |
| **Handwritten Accents** | `Caveat` or `Nanum Pen Script`, `weight: 700`, `size: 74px - 78px`, `tilt: -3deg` |
| **Device Frame** | Pure Titanium Chassis (`#111215` with `#2D3748` rim), Dynamic Island Notch, unclipped navigation |
| **Background** | Subtle radial depth (`radial-gradient(circle at 50% 12%, #FFF8F0 0%, #FAF8F5 50%, #ECE4D8 100%)`) |
| **Dimensions** | 1080 × 1920 (Standard Google Play & Apple App Store 9:16 Portrait) |

---

## 3. Automated Rendering Pipeline (Puppeteer Engine)

```javascript
// Launch headless Chrome & capture live DOM
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

// Capture live screens @2.5x retina
const page = await browser.newPage();
await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true });
await page.goto("http://localhost:8099/?tab=Translate", { waitUntil: "networkidle2" });
const screenHomeB64 = await page.screenshot({ encoding: "base64" });

// Render 1080x1920 composite
const renderPage = await browser.newPage();
await renderPage.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
await renderPage.setContent(templateHtml, { waitUntil: "domcontentloaded" });
await renderPage.screenshot({ path: "play_store_screenshot_1_dynamic.png" });
```

---

## 4. 4-in-1 Social Showcase Generator
Always compile the 4 vertical screenshots into a **2400 × 1350 (16:9)** marketing showcase card (`poquitotalk_dynamic_showcase_4up.png`) with an unboxed vector logo in the header and creator profile attribution in the footer (`@DorienVibecodes` • `poquitotalk.hero-apps.com`).

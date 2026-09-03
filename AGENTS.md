# Expo Mobile Development & Diagnostic Rules

## 1. FIRST DIAGNOSTIC STEP FOR EXPO CONNECTION ISSUES (MANDATORY)
Whenever a user reports connection errors, timeouts, or "failed to download remote update" in Expo Go:
1. **IMMEDIATELY check the current Mac local IP address** (`ipconfig getifaddr en0`).
2. Compare it against the previously generated QR code/URL. Router DHCP reassigns Mac IPs frequently.
3. NEVER make code changes, package downgrades, or config edits until the local IP address has been verified FIRST.

## 2. EXPO GO SDK VERSION ALIGNMENT
If Expo Go outputs *"The installed version of Expo Go is for SDK XX. The project uses SDK YY"*:
1. Align `"sdkVersion"` in `app.json` to match the installed Expo Go app version (e.g., `"54.0.0"` or `"57.0.0"`).
2. Run `npx expo install --fix` to update native dependencies to match that exact SDK version.

## 3. DOMAIN & DEPLOYMENT ARCHITECTURE
- **`poquitotalk.hero-apps.com`**: Hosted on **Namecheap cPanel LiteSpeed Server** (`66.29.146.28`).
  - **Automated Web Funnel Deployment**: Deploy static `web-funnel/` updates using:
    `rsync -avz -e "ssh -p 21098 -i ~/.ssh/id_rsa_cpanel -o StrictHostKeyChecking=no" ./web-funnel/ finclazc@premium225-5.web-hosting.com:/home/finclazc/public_html/poquitotalk/`

## 4. STRICT BAN ON TACKY AI BADGES & HYPE BUZZWORDS
- **NEVER** use ridiculous buzzwords or badges like *"Expert AI Super-Tool"*, *"Super-Tool"*, *"Revolutionary AI"*, or *"AI Super-App"* anywhere on headers, cards, promotional graphics, showcases, or copy.
- Keep copywriting, badges, and headers clean, grounded, direct, and human.

## 5. CRISP VECTOR SVGS ONLY — NO CARTOONISH EMOJIS/ICONS
- **ALWAYS** use clean, monoline/duotone inline vector SVGs (`stroke-linecap="round"`, `stroke-linejoin="round"`) for UI icons, cards, feature highlights, and showcase graphics.
- **NEVER** use cartoonish emojis or decorative clipart icons across UI or marketing graphics. The only standard exception is official country flag emojis (e.g. 🇵🇦).

## 6. MOBILE DIRECTORY ACCORDION STACK & DEMO VIDEO STANDARDS
- **Initial Resting Stack State**: Always initialize fanned accordion decks in their 100% resting collapsed state (`activeDeckId = ''`) so all category cards fit neatly above the fold at a glance without half-open or default-expanded cards pushing other categories off-screen.
- **Carousel Gesture Isolation**: In demo scripts and touch handlers, card swiping must strictly isolate the card carousel (`y > 250`), keeping top filter bars completely solid and stationary.
## 7. MANDATORY SYNCHRONIZED AUDIO ON VIDEO PLAY / SPEAKER INTERACTIONS
- **NEVER** export or deliver a walkthrough demo video where a speaker icon, "Listen", or audio play button is tapped with silent audio.
- Because headless browser screencasts do not capture browser speech synthesizer output natively:
  1. **Log Frame Cue**: The recording script must log the exact frame number/timestamp when the audio button is tapped.
  2. **Pause for Audio Duration**: Keep the screen visible and active for the full duration of the audio clip (e.g. 5–7 seconds).
  3. **Multiplex with FFmpeg**: Use FFmpeg's `adelay` filter (`-filter_complex "[1:a]adelay=${delayMs}|${delayMs}[aout]"`) to mux the actual high-definition audio clip (`.mp3`) into the video timeline at the exact millisecond of the tap.
  4. If real audio is unavailable or intentionally not needed, cut the demo action cleanly before tapping the speaker button rather than leaving a dead silent tap.

## 8. STRICT BAN ON DARK BACKGROUNDS FOR BEFORE & AFTER COMPARISONS
- **NEVER** use dark / black / pitch backgrounds for Before & After comparison cards, showcase images, or mockup presentation sheets unless the user explicitly asks for a dark theme.
- **ALWAYS** use a clean, warm, airy neutral / light background (e.g. `#FAF8F5`, `#F4F1EA`, or `#FFFFFF`) that complements PoquitoTalk's warm terracotta & island aesthetic.

## 9. 2-WAY LIVE AUDIO SESSION LIFECYCLE & CREDIT ARCHITECTURE
- **Session Start Trigger**: A live 2-way audio room (`/talk?room=xxx`) only transitions to `active` and begins its timer/deduction when the **first voice message is transmitted** (recorded/sent). Merely opening the URL leaves the session in `waiting` state, protecting against accidental or unused link charges.
- **Fair Use Boundaries & Abuse Prevention**:
  - **Active Conversation Window**: Max **15 minutes** from the first voice transmission (`SESSION_MAX_DURATION_MS = 15 * 60 * 1000`).
  - **Inactivity Auto-Close**: Closes automatically after **5 minutes of silence** (`SESSION_INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000`).
  - **Turn Limit**: Max **15 voice turns** (back-and-forth messages) per session (`SESSION_MAX_TURNS = 15`).
- **Credit Economics**:
  - **Pro Subscribers (Annual & Monthly)**: Unlimited live sessions and unlimited voice notes.
  - **Pay-As-You-Go / Travel Pass**: 1 Live Session = 5 Credits (e.g. 50 Credits Pack = 10 complete live sessions or 50 single voice notes; 7-Day Travel Pass = 20 live sessions or 100 single voice notes).

## 10. PAYWALL CTA COLOR — MUST BE UNIQUE IN THE APP
- **RULE**: The primary Call-To-Action button on the paywall (e.g. "Start Free Trial", "Subscribe", "Unlock Pro") **MUST use a color that does not appear anywhere else in the app.**
- **Rationale**: A unique CTA color has zero competition from other UI elements. It draws the eye instantly, signals that this is the single most important action on screen, and removes cognitive hesitation at the conversion moment.
## 11. ASYMMETRICAL VOICE PERSONA ARCHITECTURE (USER IDENTITY VS. SPEAKER IDENTITY)
- **RULE**: The app must strictly maintain a dual-channel voice separation:
  1. **Outgoing Audio (User ➔ Contractor)**: Uses the user's **Chosen Voice** preference (`getPreferredVoiceGender()` / Male or Female) to express the user's own identity when generating Spanish voice notes, speaking phrases, or dispatching messages.
  2. **Incoming Audio (Contractor ➔ User)**: The user's personal setting must **NEVER** override the contractor's identity. Incoming voice notes (from WhatsApp or 2-way live sessions) must be synthesized/played in English matching the **contractor's actual gender** (e.g., female voice for female boat operators/tour coordinators; male voice for male contractors/electricians).
- **Rationale**: Translating a female contractor's voice note into a male voice just because the expat user is male sounds unnatural, confusing, and disrespectful to the provider's real-world identity.

## 12. DIRECTORY CATEGORY LOGIC, RAINBOW SPECTRUM & COPY RULES
- **Category Ordering & Falling Rainbow Spectrum**:
  1. **Boat Captains & Water Taxis** (`#0284C7`) — *Ocean Blue* [Mobility]
  2. **Land Taxis & Transport** (`#0891B2`) — *Caribbean Cyan* [Mobility]
  3. **Plumbing & Water Systems** (`#0D9488`) — *Sea Teal* [Trades & Utilities]
  4. **Electricians, A/C & Solar Trades** (`#059669`) — *Emerald Green* [Trades & Utilities]
  5. **Gardening & Nurseries** (`#65A30D`) — *Fresh Lime* [Trades & Utilities]
  6. **Contractors & Handymen** (`#CA8A04`) — *Construction Gold* [Trades & Utilities]
  7. **Starlink & Internet Techs** (`#D97706`) — *Tech Amber* [Trades & Utilities]
  8. **ATMs & Western Union** (`#EA580C`) — *Tangerine Orange* [Commerce & Cash]
  9. **Supermarkets & Dining** (`#F43F5E`) — *Coral Red* [Commerce & Food]
  10. **Doctor & Pharmacy** (`#E11D48`) — *Ruby Rose* [Health & Clinic]
  11. **Island Vets & Animal Care** (`#C026D3`) — *Fuchsia / Magenta* [Animal Care]
  12. **Community & Island Culture** (`#7C3AED`) — *Purple / Violet* [Community]
- **Logical Domain Clustered Architecture**: When adding or revising categories, always group related services adjacent to each other and preserve the smooth falling rainbow color flow.
- **Strict Prohibition on Specific Business & Proper Names in Descriptions**: Never include individual business names, physician/contractor names, or private company brands in category titles, subtitles, or feature summaries (e.g., no *'Aguafiel'*, *'Solarte Soil Works'*, *'Super Gourmet'*, *'Dr. Pitti'*, or *'Dr. Laura'*).
- **Sole Approved Exception**: The official international conservation marine designation **'Hope Spot certified'** (strictly singular *"Spot"*, not *"Hope Spots"*).

## 13. PLAY STORE & APP STORE SCREENSHOT DESIGN SYSTEM (REVERSE-ENGINEERED STANDARDS)
- **1. Pure White Feature Cards Only**:
  - All feature cards across all screenshot canvases MUST use pure solid white background (`#FFFFFF`). Never use solid dark, black, or full green gradient fills on feature cards.
  - Border & Elevation: `border: 2px solid rgba(150,72,36,0.12); border-radius: 24px; box-shadow: 0 12px 30px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.03);`.
- **2. Snug Card Width & Whitespace Elimination**:
  - Horizontal width must hug content snugly (`345px - 365px`), preventing empty dead whitespace on the right side.
  - Padding: `15px 20px` to `16px 22px` with `gap: 14px - 16px`.
- **3. High-Contrast Legibility & Calibrated Typography**:
  - **Card Titles**: `font-size: 21px - 22px; font-weight: 900; color: #1A1208; letter-spacing: -0.4px; line-height: 1.15;`.
  - **Card Subtitles**: `font-size: 15.5px - 16.5px; font-weight: 700; color: #5C4E3A; margin-top: 3px;`.
  - **Main Screen Title (`H1`)**: `font-family: 'Lexend', sans-serif; font-size: 74px - 78px; font-weight: 900; line-height: 1.04; letter-spacing: -2.5px; color: #1A1208;`.
  - **Header Subtitle (`.sub`)**: `font-size: 21px - 22px; font-weight: 600; color: #4A5E52; line-height: 1.45; max-width: 680px;`.
  - **Left Section Title (`H2`)**: `font-size: 41px - 42px; font-weight: 900; line-height: 1.10; color: #1A1208; letter-spacing: -1.2px;`.
  - **Left Section Paragraph (`.left-p`)**: `font-size: 19.5px; font-weight: 600; color: #5C4E3A; line-height: 1.42; max-width: 365px;`.
- **4. Icon Badges**:
  - Squircles/Circles `50px - 52px` with `border-radius: 16px`, soft pastel tint background matching theme, housing `26px` crisp inline monoline vector SVGs (`stroke-width="2.3"`).
- **5. Mascot & Speech Balloon Positioning**:
  - Poquito anchors cleanly to the bottom (`bottom: 25px - 35px`).
  - Speech bubble is elevated to head/crest level (`bottom: 175px - 185px; left: 210px; padding: 16px 24px; border-radius: 26px; border: 2.8px solid rgba(5,150,105,0.30);`).
  - Pointer tail points directly towards Poquito's face/beak (`top: 70% - 75%`).

<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "poquito-talk".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->

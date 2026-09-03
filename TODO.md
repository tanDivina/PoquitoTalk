# 📋 PoquitoTalk Master Roadmap & To-Do List

---

## 🚀 Phase 1: Web Funnel & Stripe Payment Architecture (High Priority)

- [ ] **Stripe & RevenueCat Multi-Profile Alignment**:
  - [ ] Invite personal email (`Dorien.vda@gmail.com`) as Admin/Owner to the Stripe Projects RevenueCat account (`dorien@rankbeacon.dev`) under **Project Settings > Team** to manage both seamlessly.
  - [x] Retrieve Public App API key from the `dorien@rankbeacon.dev` project and update `src/services/revenuecat.ts` for Stripe contest tracking (`strp_oRCQHGzTOCydzvQECdMeNnbVXTI`).
- [ ] **Paywall Architecture & A/B Comparison**:
  - [x] **Contextual Limit Paywall** ([PaywallModal.tsx](file:///Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras/src/components/PaywallModal.tsx)): Direct, high-converting unlock triggered upon exhausting 10 daily translations or tapping locked directory features.
  - [x] **Soft Onboarding Paywall** ([SoftOnboardingPaywall.tsx](file:///Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras/src/components/SoftOnboardingPaywall.tsx)): Warm, low-friction entry paywall featuring 7-Day Free Trial callout, multi-tier pricing cards (Annual / Monthly / Lifetime), purchase restoration, and seamless soft-dismiss.
  - [ ] Document paywall conversion funnel test matrix and metrics comparison in `TECHNICAL_DOCUMENTATION.md`.
- [x] **Stripe Checkout Web-to-App Claim Flow**:
  - [x] Implement `checkout.session.completed` Stripe webhook endpoint (`api/stripe_webhook.php`) to generate secure 1-time claim tokens (e.g. `pt_claim_...`).
  - [x] Build `/success.html` on `poquitotalk.hero-apps.com` (using Poquito Studio animation assets: victory jump, confetti, sound effects) with:
    - **Mobile**: 1-Tap *"Open in PoquitoTalk App"* deep link (`poquitotalk://claim?token=...`).
    - **Desktop**: Scannable QR code linking to the same claim token.
  - [x] Add App Deep Link handler in `App.tsx` / `deepLinks.ts` to automatically validate the token, deposit credits / activate Pro in local guest storage, and show Poquito victory celebration modal ([ClaimCelebrationModal.tsx](file:///Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras/src/components/ClaimCelebrationModal.tsx)).
- [ ] **Email Receipt Claim Backup**:
  - [ ] Send automated receipt email via Stripe containing the 1-tap activation link (`https://poquitotalk.hero-apps.com/activate?token=...`).
- [ ] **Stripe Pricing Tier Cleanup**:
  - [ ] Standardize active pricing across Web Funnel and App:
    - 50 Poquito Credits ($4.99 one-time)
    - 7-Day Travel Pass ($4.99 / week)
    - Pro Monthly Membership ($12.99 / month)

---

## 📱 Phase 2: Mobile App Experience & Polish

- [x] **Neighbor Referral Growth & Viral Tracking**:
  - [x] Dedicated Referral Tracking API (`api/referral.php`) on LiteSpeed server.
  - [x] Real-time Admin Dashboard Tab: **Neighbor Referrals** with invites sent, joins, and bonus credits awarded on `poquitotalk.hero-apps.com/admin.html`.
  - [x] Clean vector SVG icon on "Invite a Bocas Neighbor" card.
- [ ] **Voice Persona UI Overhaul & Happy Dance Mascot**:
  - [ ] Rename abstract names to functional labels (`Male — Warm & Natural`, `Female — Warm & Clear`, etc.).
  - [ ] Add rhythmic `danceMode` to `AnimatedParrotMascot` with energetic bounce, tilt sway, and soundwaves on voice demo preview.
- [ ] **Pro Contractor Recommendation & Anti-Duplicate System**:
  - [ ] Friend/client-assisted contractor submission form.
  - [ ] Phone number normalization and fuzzy name deduplication check before adding new directory entries.
- [ ] **Dispatch Preferences**:
  - [ ] Allow users to set their default WhatsApp preference (Send Text vs Send Voice Note) in Settings, while maintaining the 1-tap choice on each card.
- [ ] **Magic PoquitoTalkie Channel Polish**:
  - [ ] Ensure the browser-based live walkie-talkie audio recording and streaming interface is fully calibrated with low-bandwidth mobile cellular connections in Bocas.

---

## 🎬 Phase 3: Marketing, Promo Video & Store Listings

- [ ] **App Walkthrough Demo Video Refresh**:
  - [ ] Update automated video recording script (`scripts/record_walkthrough.js` / `mobile-app-walkthrough-video`) to showcase:
    - The clean **2-Tone Switcher** (*Poquito* vs *Full Panameño*).
    - Horizontal swipeable scenario carousels on Templates.
    - Horizontal swipeable provider carousels on Directory.
    - Zero mentions of "jerga" or obsolete 3-tone sliders.
- [ ] **App Store & Google Play Store Submission**:
  - [ ] Generate fresh 6.5" and 5.5" iOS / Android store screenshots using the latest UI.
  - [ ] Finalize App Store metadata, keywords, and description for Bocas del Toro expats and tourists.

---

## 📍 Phase 4: Local Merchant & Expat Flyering Strategy (Bocas del Toro O2O)

- [ ] **Pocket Business Cards & Vinyl Mascot Stickers**:
  - [ ] **Standard 3.5"×2" Double-Sided Business Cards**:
    - Front: Poquito mascot + *"PoquitoTalk: Panama Expat Directory & WhatsApp Voice Translator"* + Large high-contrast QR code.
    - Back: *"Are you a local business or captain? Get listed free in our Bocas Directory → Scan to join."*
    - Distribution: Leave stacks at cashier counters (Super Gourmet, Amaranto, Ferretería Bocas, Selina) and hand directly to water taxi captains/tradesmen.
  - [ ] **Die-Cut / Vinyl Contour Mascot Stickers**:
    - Poquito WhatsApp speech bubble sticker for laptops, water bottles, surfboards, golf carts, and boat consoles.
- [ ] **Counter Cards & Community Board Posters**:
  - [ ] **Format A: Counter Cards / Table Tents (A6 / 4"×6" Cardstock)** for high-traffic registers.
  - [ ] **Format B: Community Board Tear-Off Flyers (A5 / Letter)** for marinas, ferry docks, expat cafes.
- [ ] **Town Walk & Zero-Hassle Voice Memo / Photo Merchant Pipeline**:
  - [ ] Walk through town, snap 1-second photos of business cards/storefront signs, or record 15-second WhatsApp/voice memos introducing local providers.
  - [ ] Ingest audio & photos via Antigravity multimodal parser to auto-generate and populate directory entries in `src/services/directory.ts` and `web-funnel/directory.html`.
- [ ] **Merchant Onboarding & Free Verified Listing Incentive**:
  - [ ] Pitch: Free "Verified Local Business" badge + direct 1-tap WhatsApp button in PoquitoTalk directory in exchange for displaying a small counter stand.
- [ ] **O2O Analytics & UTM Scan Tracking**:
  - [ ] Track QR scans per location using source parameters (`?src=bocas_counter`, `?src=super_gourmet`, `?src=dock_taxi25`).

---

## 🔮 Phase 5: Future Innovations & Persona Customization (Post-V1 Expansion)

- [ ] **Dynamic Persona Customization (🌴 Tourist vs. 🏡 Expat vs. 🤝 Local Host)**:
  - *Mechanism*: Onboarding selection that dynamically tailors app navigation, scanner presets, templates, and paywalls to the user's stay duration and goals.
  - *Tourist Mode (🌴)*:
    - **Included**: Waterfront Restaurant & Seafood Menu Scanner, Panamanian Pharmacy & OTC Medicine Scanner, Water Taxi Dock Timetables, Island Activities & Beach Emergency Spanish.
    - **Excluded/Hidden**: Completely hides resident utility bill tools (Naturgy/IDAAN), residential lease agreements, and landlord negotiation phrasing.
  - *Expat Mode (🏡)*:
    - **Full-Stack Access**: Has access to all dining & pharmacy scanners PLUS Panama Utility Bills (Naturgy/IDAAN), IDAAN Water Outage Noticeboards, Long-Term Lease Agreements, and Full Tradesmen Directory.
  - *Local Provider Mode (🤝)*: Prioritizes bilingual booking confirmations, WhatsApp invoice cards, and client inquiry replies.

- [ ] **Tourist Waterfront Restaurant & Seafood Menu Scanner (OCR)**:
  - *Mechanism*: Multimodal OCR camera scanner tailored for physical paper & chalkboard menus across Bocas del Toro and Panama.
  - *Features*:
    - Translates Panamanian dishes (*Pargo Entero Frito*, *Corvina al Ajillo*, *Patacones*, *Arroz con Coco*, *Langosta*, *Ceviche*, *Sancocho*).
    - Detects dietary & allergy alerts (shellfish / *mariscos*, nuts, gluten, dairy).
    - Explains local pricing customs & tipping (*Propina Voluntaria* vs. 10% included service charge).
    - Generates 1-tap Spanish ordering & customization phrases (*"Sin mariscos por favor"*, *"¿El pescado viene con patacones o arroz?"*).

- [ ] **Water Taxi & Ferry Dock Timetable Scanner**:
  - *Mechanism*: OCR parser for dock chalkboards and timetable flyers at Bocas Town, Carenero, Bastimentos, and Almirante.
  - *Features*: Extracts first/last boat departures, night surcharges ($2.00 vs $3.00), and cargo/luggage freight fees.

- [ ] **Community Noticeboards & Emergency Alerts Scanner (Expat Mode)**:
  - *Mechanism*: OCR parser for physical bulletin boards, water shutoff notices from IDAAN (*Avisos de Suspensión*), roadwork, and power maintenance flyers.
  - *Features*: Extracts affected sectors, shutoff time windows (e.g., 8:00 AM – 4:00 PM), and emergency cistern delivery contacts.

- [ ] **Panamanian Pharmacy Prescription & Medication Label Scanner (Expat & Tourist)**:
  - *Mechanism*: Parses dosage instructions (*1 cápsula cada 8 horas por 7 días*), food interactions, traveler illness/OTC remedies, and refill requirements from local pharmacy stickers.

- [ ] **Simultaneous Two-Way Hands-Free Conversation (Face-to-Face Dual-Stream Mode)**:
  - *Deferred to Future Release*: Continuous streaming STT/TTS requires real-time VAD and higher API token bandwidth; deferred past V1 launch to properly calibrate credit cost structures.
  - *Mechanism*: Continuous Voice Activity Detection (VAD) + Auto Language Identification (Auto-LID) with Acoustic Echo Cancellation (AEC).
  - *UX Flow*: Place phone between two people on a table. Dual split-screen (top half inverted 180° for contractor/local, bottom half for expat). Both speak naturally without button tapping while live side-by-side transcripts stream in real-time.
  - *Credit / Monetization Strategy*: Dedicated metering (e.g., 5 credits/minute or exclusive Pro Pass perk) to protect token margins.

- [ ] **Direct WhatsApp Inbound Share-Target (V2 Decoder)**:
  - *Mechanism*: Register native iOS Share Extension (`NSExtension`) and Android Send Intent Filter (`android.intent.action.SEND` for `audio/*`) so PoquitoTalk appears in the system share sheet.
  - *UX Flow*: In WhatsApp, long-press a rapid Spanish voice note from a boat captain/contractor $\rightarrow$ tap **Share** $\rightarrow$ tap **PoquitoTalk** $\rightarrow$ app automatically ingests audio, transcribes with Whisper/Gemini, and displays an English summary with 1-tap Spanish reply options.
  - *Impact*: Closes the 2-way conversation loop without making the user manually save or upload audio files.

- [ ] **"Slow-Down" & Phonetic Learning Mode (0.75x Audio Playback)**:
  - *Mechanism*: Add playback speed toggles (`0.75x`, `1.0x`, `1.25x`) on all synthesized speech and incoming voice notes using `expo-av` / Web Audio API.
  - *UX Flow*: Listening to Diego or Sofia at 0.75x speed with synchronized text highlighting.
  - *Impact*: Turns day-to-day errand communications into passive, confidence-building language learning for expats.

- [ ] **Habit-Forming Retention Engine (Hook Model & Daily Morning Rituals)**:
  - *Daily Morning Panama Coffee Ritual*: "Frase del Día" with 1-tap Diego audio + "Listen & Echo" waveform challenge (< 60s habit loop).
  - *Streak Flame & Freezes*: Visual streak counter with protective weekend/travel freezes.
  - *Lock & Home Screen Widgets*: iOS/Android widget showing today's slang + 1-tap boat taxi phrase dispatcher.
  - *Poquito Tamagotchi Gamification*: XP and reputation tier progression (*Gringo Recién Llegado* ➔ *Puro Panameño*) with unlockable mascot outfits.
  - *Island Survival Vault (Stored Value)*: Searchable history of translations, bill scans, and contractor CRM notes with private rating tags.
  - *Context-Aware Smart Triggers*: Friday happy hour, Saturday market, and 15th-of-the-month Naturgy bill reminder notifications.
  - *Live Bocas Noticeboard*: Community pulse ticker (water outages, weather/swell advisories, holiday closures).


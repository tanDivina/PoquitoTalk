# 📋 PoquitoTalk Master Roadmap & To-Do List

---

## 🚀 Phase 1: Web Funnel & Stripe Payment Architecture (High Priority)

- [ ] **Stripe & RevenueCat Multi-Profile Alignment**:
  - [ ] Invite personal email (`Dorien.vda@gmail.com`) as Admin/Owner to the Stripe Projects RevenueCat account (`dorien@rankbeacon.dev`) under **Project Settings > Team** to manage both seamlessly.
  - [ ] Retrieve Public App API key from the `dorien@rankbeacon.dev` project and update `src/services/revenuecat.ts` for Stripe contest tracking.
- [ ] **Stripe Checkout Web-to-App Claim Flow**:
  - [ ] Implement `checkout.session.completed` Stripe webhook endpoint to generate secure 1-time claim tokens (e.g. `pt_claim_...`).
  - [ ] Build `/success` page on `poquitotalk.hero-apps.com` with:
    - **Mobile**: 1-Tap *"Open in PoquitoTalk App"* deep link (`poquitotalk://claim?token=...`).
    - **Desktop**: Scannable QR code linking to the same claim token.
  - [ ] Add App Deep Link handler in `App.tsx` / `deepLinks.ts` to automatically validate the token, deposit credits / activate Pro in local guest storage, and show a celebration modal.
- [ ] **Email Receipt Claim Backup**:
  - [ ] Send automated receipt email via Stripe containing the 1-tap activation link (`https://poquitotalk.hero-apps.com/activate?token=...`).
- [ ] **Stripe Pricing Tier Cleanup**:
  - [ ] Standardize active pricing across Web Funnel and App:
    - 50 Poquito Credits ($4.99 one-time)
    - 7-Day Tourist Pass ($4.99 / week)
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


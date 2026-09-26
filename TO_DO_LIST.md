# PoquitoTalk Product Roadmap & To-Do List

## 🚀 Version 1.0 (Current MVP Launch Priorities)
- [x] **Core Scenario Audio & Diego Spanish Voice**: High-definition native pronunciation audio and interactive player.
- [x] **Mascot Animation Suite**: Clean vector & transparent WebP rigs (Greeting Wave, Listening RX, Thinking Loop, Victory Leap, Front Talking).
- [x] **Templates Flow & Fanned Deck UI**: Resting collapsed stack with 1-tap accordion expand and carousel gesture isolation.
- [x] **Local Phonebook & Verified Directory**: Direct WhatsApp action buttons, categorized services, and vouched listings.
- [x] **Soft Onboarding Paywall Integration**:
  - 7-Day Free Trial offer with annual plan highlight ($29.99/yr, Save 58%) and monthly anchor ($5.99/mo).
  - Clear `✕` dismiss button ("Explore Free First") to prevent drop-offs.
  - Apple StoreKit & RevenueCat subscription bindings with restore purchase link.
  - "Listen & Echo" 10-second pronunciation practice coached by Poquito, the parrot mascot, using Diego/Sofia voices.
  - 1-tap WhatsApp voice note decode from iOS Share Sheet and Android Share Intent — user long-presses a Spanish voice note in WhatsApp → Share → PoquitoTalk auto-decodes it to English.
  - Designed in PoquitoTalk's signature warm cream, terracotta, and Panama sage green theme.
- [ ] **Review & App Store / Play Store Submission Assets**: Final build packaging and store screenshot exports.

---

## 🌟 Version 2.0 (Post-Launch Feature Expansion)

### 1. Persona-Segmented Onboarding Flow
- **1-Tap Persona Selector on Onboarding**:
  - 🌴 **Tourist / Short-term Vacationer** (Days to weeks in Panama / Bocas).
  - 🏡 **Expat / Long-term Resident** (Living, renting, or building in Bocas).
  - 🤝 **Local Service Provider / Bilingual Guide / Host** (Offering tours, rentals, trades, or hospitality).

### 2. Dynamic Persona App Customization & Feature Matrix

- **Tourist Customization (🌴 Short-Term Visitor / Traveler)**:
  - *Design Principle*: Keep interface ultra-lean and zero-clutter; completely hide complex resident tools that travelers never encounter.
  - **Included Tools & Scanners**:
    - **Waterfront Restaurant & Seafood Menu Scanner (OCR)**: Translates local dishes (*Pargo Entero Frito, Corvina al Ajillo, Patacones, Arroz con Coco, Langosta, Ceviche*), dietary/allergen alerts (shellfish/nuts/gluten), tipping advice (*Propina Voluntaria* vs. 10% included), and 1-tap ordering Spanish.
    - **Panamanian Pharmacy & OTC Label Scanner**: Translates traveler health needs, OTC medications, stomach remedies, insect bite relief, and suncare instructions.
    - **Water Taxi & Ferry Dock Timetable Scanner**: Departure schedules (Bocas Town ↔ Carenero / Bastimentos / Almirante), night fares, and luggage surcharges.
    - **Island Activities & Emergency Contacts**: Hospital, hyperbaric diving chamber, marine rescue.
  - **Hidden / Excluded Resident Tools**:
    - *Hidden*: Naturgy electricity bills, IDAAN water utility bills, residential lease contracts, municipal trash notices, and landlord negotiation templates.

- **Expat Customization (🏡 Long-Term Resident / Property Owner / Renter)**:
  - *Design Principle*: Full-stack access to all everyday life tools (dining, health, home maintenance, and island utilities).
  - **Included Tools & Scanners (Full Access)**:
    - **All Tourist Scanners**: Complete access to Restaurant Menus, Pharmacy Labels, and Ferry/Dock Timetables.
    - **Panama Utility Bill Scanner**: Naturgy electricity & IDAAN water bills with NIS supply ID, meter readings, consumption tiers, and Punto Pago instructions.
    - **Rental Lease & Landlord Agreement Scanner**: Deposit terms, utility cost splits, and 1-tap WhatsApp payment confirmation templates.
    - **Community Noticeboards & Emergency Alerts Scanner**: Multimodal OCR for physical bulletin boards, IDAAN water shutoff alerts (*Avisos de Suspensión* with affected sectors & time windows), roadwork, and power maintenance flyers.
    - **Contractor & Tradesmen Directory**: Verified local plumbers, electricians, A/C technicians, boat captains, and hardware store vocabulary.

- **Service Provider Customization (🤝 Local Captain / Host / Tradesman)**:
  - **Top Features**: English/Spanish client inquiry templates, booking deposit phrases, directory profile management, WhatsApp booking card generator.

### 3. Dynamic Persona Paywalls
- **Tourist Paywall**:
  - Offer: **1-Week Trip Pass ($4.99 - $9.99)** or **Season Pass ($24.99)**.
  - Value Props: Menu & dish scanner, offline maps & audio (no cell service needed on boats/islands), instant boat captain WhatsApp connections, emergency medical Spanish.
- **Expat Paywall**:
  - Offer: **Annual Membership ($29.99/yr with 7-Day Trial)** or **Monthly ($12.99/mo)**.
  - Value Props: Complete local utility & legal guides, contractor directory, community noticeboard translator, ongoing cultural & slang updates.
- **Service Provider Paywall**:
  - Offer: **Pro Business Listing ($49.99/yr)**.
  - Value Props: Featured placement in the local directory, direct WhatsApp lead generator, bilingual client templates.

---

### 4. Habit-Forming Retention Architecture & Daily Engagement Loops (V2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE POQUITOTALK V2 RETENTION HOOK MODEL                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. TRIGGER (Internal & External)                                          │
│     • External: Morning Coffee "Frase del Día" notification, Lock Screen    │
│       slang widget, Friday happy hour prompt, IDAAN bill reminder.          │
│     • Internal: Desire to fit in with locals, fear of overpaying, social     │
│       confidence, streak preservation.                                      │
│                                                                             │
│  2. ACTION (Frictionless < 60s Micro-Habit)                                 │
│     • Tap 1 daily audio card while brewing coffee.                          │
│     • "Listen & Echo" 10-second pronunciation practice with Diego.          │
│     • 1-tap WhatsApp voice note decode from iOS Share Sheet.                │
│                                                                             │
│  3. VARIABLE REWARD (Tribe, Hunt, & Self)                                   │
│     • Tribe: Local insider cultural context ("Why Bocatoreños say X").      │
│     • Hunt: Daily slang drops, unlocking secret island idioms & badges.     │
│     • Self: Fluency level progression (*Gringo Perdido* ➔ *Puro Panameño*). │
│                                                                             │
│  4. INVESTMENT (Stored Value & Switching Costs)                             │
│     • Personal "Island Survival Vault" of saved phrases & custom notes.     │
│     • Curated directory of favorite contractors with private rating tags.   │
│     • Preserved daily streak flame & XP level for Poquito mascot.           │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### A. The "Daily Panama Coffee Ritual" (Daily Morning Loop — < 60 Seconds)
- **"Frase del Día" (Panamanian Slang & Survival Expression)**:
  - Deliver 1 high-utility, authentic Panamanian expression every morning at 8:30 AM (e.g., *"¿Qué xopa, fren?"*, *"Tírame la toalla"*, *"Pide la cuenta por favor"*, *"¿A cómo está el plátano?"*).
  - Includes: Crisp native voice audio (Diego/Sofia), literal vs. local meaning, cultural backstory, and a sample real-life island dialogue.
- **"Listen & Echo" Pronunciation Challenge**:
  - 1-tap mic button allowing user to repeat the phrase.
  - Instant on-device waveform comparison and feedback badge (*"Perfect Panameño!"* / *"Try again with more island rhythm"*).
- **Streak Engine & Freeze Tokens**:
  - Visually rewarding streak flame on the header with milestone celebrations (Day 3, 7, 14, 30, 100).
  - "Streak Freeze" tokens earned through active WhatsApp dispatches or available in Pro Pass so travel days don't penalize users.

#### B. Context-Aware Smart Push Notifications (Behavioral Triggers)
- **Time & Lifestyle Calibrated Alerts**:
  - **Friday 5:15 PM**: *"Heading out tonight? Learn how to order una pinta fría (cold Balboa) like a Bocas local 🍻"*
  - **Saturday 8:00 AM**: *"Visiting the local vegetable truck or fish market? 3 phrases to negotiate fresh catch prices 🐟"*
  - **15th of the Month (Expat Mode)**: *"Naturgy electricity bills usually arrive this week! Scan your bill to check consumption tiers ⚡"*
  - **Rainy Afternoon**: *"Rainy day in Bocas? Tap to learn 3 rainy day island idioms 🌧️"*
- **Adaptive Re-engagement (Anti-Churn)**:
  - If inactive for 3 days: Send a low-pressure, charming message from Poquito: *"Diego missed you today! Here is a 10-second phrase for your next water taxi ride."*

#### C. Interactive iOS & Android Widgets (Home Screen & Lock Screen Real Estate)
- **Lock Screen Live Activity & Widget**:
  - **"Daily Slang Drop"**: Displays the phrase of the day + English meaning directly on the lock screen without opening the app.
  - **"Quick Boat Taxi Dispatcher"**: 1-tap emergency dock phrase button for instant audio play.
- **Home Screen Interactive Widgets (Small & Medium)**:
  - **Medium Widget**: Shows daily streak count, mascot mood, today's Panama idiom, and a 1-tap "Play Audio" button.
  - **Small Action Widget**: Quick-launch buttons directly into Voice Translator, WhatsApp Share Decoder, or Contractor Directory.

#### D. Poquito Mascot Tamagotchi & Gamification ("Reputation Progression")
- **Island Reputation Tier Progression**:
  - Levels:
    1. 🐣 *Gringo Recién Llegado* (Level 1–5: Just arrived, learning greetings).
    2. 🚤 *Water Taxi Regular* (Level 6–15: Mastering boats, fondas, groceries).
    3. 🏡 *Bocas Residente* (Level 16–30: Utility bills, leases, contractor dispatches).
    4. 🦜 *Puro Panameño / Island Legend* (Level 31+: Full local slang mastery).
- **Poquito Mascot Outfits & Visual Customization**:
  - Earn Poquito XP for every phrase practiced, scan completed, or voice note sent.
  - Unlock cosmetic outfits for Poquito: *Boat Captain Cap*, *Panama Straw Hat*, *Surfer Shades*, *Highland Boquete Coffee Farmer Jacket*.

#### E. WhatsApp Share-Target Decoder (Daily Workflow Attachment)
- **The Core Expat Friction**: Boat captains and contractors send rapid 15-second Spanish voice notes with dropped consonants and heavy slang that expats can't decipher.
- **Inbound Share Extension Flow**:
  1. User receives rapid voice note in WhatsApp.
  2. Long-press ➔ **Share** ➔ Select **PoquitoTalk**.
  3. PoquitoTalk pops a lightweight floating sheet:
     - Transcribes rapid audio in real-time.
     - Highlights key action items (Time, Price, Location, Confirmation).
     - Provides **0.75x Slow-Down playback** with synchronized highlighted text.
     - Offers 3 pre-built **1-Tap Spanish Voice Replies** (*"Understood, see you at 10 AM"*, *"How much will that cost?"*, *"Confirmed, thank you"*).
- **Retention Impact**: Embeds PoquitoTalk directly inside the user's primary daily messaging app (WhatsApp).

#### F. "Island Survival Vault" & Stored Value (Investment Phase)
- **Personal Phrasebook & Errand History**:
  - Every translation, menu scan, or custom audio generated is automatically indexed in the user's searchable "Vault".
  - Ability to bookmark "Frequent Phrases" for 1-tap offline replay on boats where cellular signal drops.
- **Contractor Personal CRM / Notes**:
  - Users can attach private notes to directory listings (*"Carlos: Repaired dock piling for $40, punctual, prefers cash/Yappy"*).
  - Increases switching costs—the app becomes their irreplaceable personal island rolodex.
- **Micro-Spaced Repetition (SRS Flashcards)**:
  - Smart 60-second review deck that re-surfaces phrases the user looked up earlier in the week, cementing long-term memory.

#### 5. iOS App Store Publication & Release Checklist (v2)

#### A. Codebase & Configuration (`app.json` & `eas.json`)
- [ ] **iOS Bundle Identifier**: Configure `"bundleIdentifier": "com.heroapps.poquitotalk"` under `"ios"` in `app.json`.
- [ ] **iOS Build Number**: Set `"buildNumber": "1"` in `app.json`.
- [ ] **Info.plist Permission Strings**:
  - `NSMicrophoneUsageDescription`: *"PoquitoTalk requires microphone access to record voice notes and translate spoken conversations in Panama."*
  - `NSContactsUsageDescription`: *"PoquitoTalk accesses contacts to allow you to easily find and message local service providers via WhatsApp."*
- [ ] **Device Target Strategy**: Explicitly set `"supportsTablet": false` unless full 13" iPad Pro screenshot suites are created.
- [ ] **EAS Build Configuration**: Add iOS production profile to `eas.json` for `.ipa` generation.

#### B. In-App Purchase & RevenueCat iOS Architecture
- [ ] **RevenueCat iOS SDK Key**: Add Apple public API key (`appl_...`) to `src/services/revenuecat.ts` using `Platform.select`.
- [ ] **App Store Connect In-App Purchases / Subscriptions**:
  - Create Subscription Group: `PoquitoTalk Pro Subscriptions`
  - Products:
    - Annual Pass: `poquitotalk_pro_annual` ($39.99/yr with 7-Day Free Trial)
    - Monthly Pass: `poquitotalk_pro_monthly` ($9.99/mo)
    - 7-Day Travel Pass: `poquitotalk_travel_pass_7d` ($4.99 non-renewing)
    - 50 Poquito Credits Pack: `poquitotalk_credits_50` ($4.99 consumable)
- [ ] **Paywall Compliance Audit**: Verify `PaywallModal.tsx` and `SoftOnboardingPaywall.tsx` adhere to Guideline 3.1.2 with active Restore Purchases, EULA, and Privacy links.

#### C. App Store Connect Metadata & Legal
- [ ] **App Name**: `PoquitoTalk: Panama Translator` (or `PoquitoTalk`)
- [ ] **Subtitle**: `Panamá Spanish Voice Notes` (Max 30 chars)
- [ ] **Keywords**: `panama,bocas del toro,spanish translator,voice notes,whatsapp translator,travel,expat,spanish audio`
- [ ] **URLs**: Support (`https://poquitotalk.hero-apps.com`), Privacy (`https://poquitotalk.hero-apps.com/privacy.html`), Terms (`https://poquitotalk.hero-apps.com/terms.html`).
- [ ] **Age Rating & App Privacy Nutrition Label**: Complete questionnaire (4+ rating, ephemeral microphone audio without ad tracking).

#### D. Visual Store Assets (iOS Specs)
- [ ] **App Store Icon**: 1024 × 1024 px PNG (RGB, 72 dpi, no transparency/alpha).
- [ ] **6.9" / 6.7" iPhone Screenshots**: 1290 × 2796 px or 1320 × 2868 px set.
- [ ] **6.5" / 5.5" iPhone Screenshots**: 1242 × 2688 px set.


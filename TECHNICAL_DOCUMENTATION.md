# 🇵🇦 PoquitoTalk — Master Technical Documentation & Architecture Reference

## 1. Executive Summary & System Overview
**PoquitoTalk** is a dual-platform communication engine (React Native iOS/Android mobile app + localized high-converting web funnel) tailored for expats, tourists, and homeowners living in **Bocas del Toro, Panama**.

It eliminates language and cultural barriers when dealing with local tradespeople and services (A/C technicians, boat captains, water delivery trucks, Starlink installers, veterinarians, banks, and utilities) by generating **authentic, polite Panamanian Spanish WhatsApp voice notes** using custom voice personas.

---

## 2. System Architecture & Tech Stack

```
                                ┌────────────────────────────────────────┐
                                │            PoquitoTalk App             │
                                │        (Expo SDK 54-57 / React Native) │
                                └───────────────────┬────────────────────┘
                                                    │
                 ┌──────────────────────────────────┼──────────────────────────────────┐
                 │                                  │                                  │
      ┌──────────▼──────────┐            ┌──────────▼──────────┐            ┌──────────▼──────────┐
      │   Gemma AI Engine   │            │ ElevenLabs Studio + │            │  RevenueCat SDK v9  │
      │ (Panamá Regional)   │            │ Google Cloud Voice  │            │  & Stripe Projects  │
      │                     │            │ (Diego, Mateo, etc) │            │ (Pro Subscriptions) │
      └─────────────────────┘            └──────────┬──────────┘            └─────────────────────┘
                                                    │
                                         ┌──────────▼──────────┐
                                         │ WhatsApp Audio Share│
                                         │  (.mp3 Voice Note)  │
                                         └─────────────────────┘
```

### Core Technologies
- **Mobile Client**: React Native with Expo SDK (`"expo": "~54.0.0"` / `"sdkVersion": "54.0.0"`).
- **Type Safety**: TypeScript 5.3+ strict mode.
- **Navigation**: `@react-navigation/bottom-tabs` v7 with custom elevated floating pill bar.
- **Styling**: Tailored MD3 design tokens, `react-native-safe-area-context`, and `@expo/vector-icons`.
- **Speech Synthesis (Hybrid)**:
  - **Studio Quality (Web & Offline Presets)**: **ElevenLabs** `eleven_multilingual_v2` model with 240 pre-rendered studio voice notes across all 4 personas (`scripts/generate_elevenlabs_presets.py`).
  - **Dynamic In-App Inference**: Google Cloud Text-to-Speech REST API + `expo-av` + `expo-file-system/legacy`.
- **Optical Document Scanner**: Regex-powered and OCR-ready Panamanian utility bill analyzer (`src/services/documentScanner.ts`) with smart tooltips and WhatsApp message drafting.
- **Directory Service**: Offline-first hardcoded cache (`INITIAL_BOCAS_DIRECTORY`) with MongoDB Atlas Data API cloud sync (`EXPO_PUBLIC_MONGO_ATLAS_URL`).
- **Web Funnel Infrastructure**: Semantic HTML5, Vanilla CSS3, and JavaScript hosted on **Namecheap cPanel LiteSpeed Server** (`poquitotalk.hero-apps.com`).
- **Social Previews & Metadata**: 1200x630 OpenGraph & Twitter Large Image cards (`twitter_card.png`, `og_preview.png`) with `@DorienVibecodes` creator tags.

---

## 3. Deployment & DevOps Infrastructure

| Property | Value / Configuration |
| :--- | :--- |
| **Production Domain** | `https://poquitotalk.hero-apps.com/` |
| **Server Host** | Namecheap cPanel LiteSpeed (`66.29.146.28`) |
| **SSH Port** | `21098` |
| **Remote Directory** | `/home/finclazc/public_html/poquitotalk/` |
| **Automated Rsync Deploy** | `rsync -avz -e "ssh -p 21098 -i ~/.ssh/id_rsa_cpanel -o StrictHostKeyChecking=no" ./web-funnel/ finclazc@premium225-5.web-hosting.com:/home/finclazc/public_html/poquitotalk/` |
| **Google Search Console** | Auto-verified via Service Account + HTML token `google09e1c5938c1b52ba.html` |
| **Stripe Project CLI** | Configured for project `poquito-talk` (`.agents/skills/stripe-projects-cli/`) |

---

## 4. Voice Persona System & ElevenLabs Pipeline

PoquitoTalk provides **4 distinct Panamanian studio voice personas**:

| Persona | Gender | Voice Model ID | Pitch / Intonation | Tone Description |
| :--- | :--- | :--- | :--- | :--- |
| 👨 **Diego** | Male | ElevenLabs `diego` (`es-US-Neural2-B`) | Balanced, warm | Warm, friendly local contractor |
| 🧔 **Mateo** | Male | ElevenLabs `mateo` (`es-US-Neural2-C`) | Deep, authoritative | Grounded marine mechanic / boat captain |
| 👩 **Sofia** | Female | ElevenLabs `sofia` (`es-US-Neural2-A`) | Clear, bright | Professional office, medical & utility dispatch |
| 👧 **Valeria** | Female | ElevenLabs `valeria` (`es-US-Journey-F`) | Expressive, youthful | Energetic everyday hospitality & island living |

### Batch Audio Pipeline
- **Generator Script**: `scripts/generate_elevenlabs_presets.py`
- **Output Directories**:
  - `assets/audio/presets/{persona}_{preset_id}.mp3` (Mobile App Bundled Assets)
  - `web-funnel/audio/presets/{persona}_{preset_id}.mp3` (Web Funnel Studio Audio)
- **Total Library**: 60 high-impact real-world phrases $\times$ 4 personas = **240 pre-rendered studio recordings**.

---

## 5. Document Scanner & Optical Utility Parser

Located in `src/services/documentScanner.ts`, the scanner analyzes documents and bills common in Panama:

1. **Naturgy Electricity Bills (Edechi)**:
   - NIS Number (`Número de Identificación del Suministro`)
   - Due Date (`Fecha de Vencimiento`)
   - Total Amount Due (`Total a Pagar en USD`)
   - Service Tariff (`Tarifa BTS / BTD`)
2. **IDAAN Water Utility Invoices**:
   - Account number (`Cuenta IDAAN`)
   - Meter reading & cubic meters consumed
3. **Smart Tooltips & WhatsApp Drafting**:
   - Explains confusing Panamanian utility concepts (e.g. *“Why does my Naturgy bill have an adjustment charge?”*).
   - Generates 1-tap Spanish inquiry messages ready to send to the landlord or utility office.

---

## 6. Verified Regional Directory Architecture

Strictly bans unverified mock placeholders. Contains real, active services in Bocas del Toro:

1. **Banco Nacional de Panamá**: Calle 4ta (Vía Aeropuerto), Bocas Town • +507 757-9230 • Branch + 3 ATMs 24/7.
2. **Duo2 Market ATM (Near Police Station)**: In front of Duo2 Market, Calle 1ra/2da next to Policía Nacional & Parque Simón Bolívar.
3. **Supermarket Alba ATM (Calle 3ra)**: In front of Supermarket Alba on the main street.
4. **Western Union Changuinola Main**: Av. 17 de Abril, Edificio Sincota • +507 301-2623.
5. **Western Union Guabito Border**: Ave. Principal Guabito (Costa Rica border crossing) • +507 758-3877.
6. **Punto Pago Kiosks**: Supermercado Isla Colón and regional pharmacies for automated Naturgy bill payments.
7. **Naturgy Customer Service Office**: Calle E, frente al Edificio de la Gobernación, Isla Colón.
8. **75+ Bocas Hope Spots Certified Boat Captains & Water Taxis**:
   - Official certified dataset integrated from `bocashopespot.com/certified-captains` (`web-funnel/data/captains.json`).
   - Includes real names, tour operators (Ngabe Tours, Bocas Island Adventours, Kawi Voyage, VIP Tours, etc.), direct WhatsApp links, and offline caching inside `INITIAL_BOCAS_DIRECTORY`.
9. **Contractor Registration Portal**: Live portal ([`contractors.html`](file:///Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras/web-funnel/contractors.html) / [`contratistas.html`](file:///Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras/web-funnel/es/contratistas.html)) logging incoming registrations to `api/waitlist.php` and `support@hero-apps.com`.

---

## 7. 1-Tap Community Vouching & Verification Engine

### Overview
Because local word-of-mouth recommendations are essential in Bocas del Toro, PoquitoTalk incorporates an authentic, lightweight **Community Vouching System** (`src/services/vouch.ts` & `web-funnel/api/vouch.php`). It replaces unverified 5-star rating widgets with a concrete, binary **Community Vouch Counter** (`+ Vouch` / `N Vouches`) backed by 3 specific vector-icon service badges:
- **Fast Response & On Time** (`fast_response` — flash/bolt vector icon)
- **Fair & Transparent Price** (`fair_price` — price-tag vector icon)
- **Great Service & Friendly** (`great_service` — star vector icon)

---

### Data Storage Architecture

```
┌────────────────────────────────────────────────────────┐
│               Client Device (App / Web)                │
│                                                        │
│  • AsyncStorage / localStorage:                        │
│    "poquito_local_vouches": ["captain-50767450876", …] │
│                                                        │
│  • Enforces 1-vouch-per-device without user sign-in    │
└───────────────────────────┬────────────────────────────┘
                            │ REST POST (Anonymous Payload)
                            │ { providerId: "…", reason: "fast_response" }
                            ▼
┌────────────────────────────────────────────────────────┐
│            Backend Server (cPanel LiteSpeed)           │
│                                                        │
│  • Endpoint: /api/vouch.php                            │
│  • Storage: web-funnel/data/vouches.json               │
│  • Concurrency: Thread-safe flock(LOCK_EX) file mutex  │
│  • Zero PII: No phone numbers, IP logs, or user IDs    │
└────────────────────────────────────────────────────────┘
```

1. **Client-Side Storage (Anti-Spam & State Persistence)**:
   - **Mobile Client**: Persisted via `expo-file-system/legacy` (`poquito_local_vouches.json`).
   - **Web Client**: Persisted via browser `localStorage` (`poquito_local_vouches`).
   - Stores a local set of `provider_id`s that the device has vouched for. This prevents repeated clicking and ensures users cannot artificially inflate numbers without requiring a friction-heavy account registration.
2. **Backend Server Persistence**:
   - **Endpoint**: `https://poquitotalk.hero-apps.com/api/vouch.php`
   - **Database File**: `web-funnel/data/vouches.json`
   - **Concurrency Control**: Utilizes PHP `flock($fp, LOCK_EX)` for thread-safe atomic increments during simultaneous user requests.
   - **Schema**:
     ```json
     {
       "captain-50767450876": {
         "count": 14,
         "reasons": {
           "fast_response": 6,
           "fair_price": 4,
           "great_service": 4
         },
         "last_vouched_at": "2026-08-15T18:30:00-05:00"
       }
     }
     ```

---

### Trigger Flow & User Experience

Users are prompted through two distinct, frictionless paths:

1. **Direct Exploration (Active Vouch)**:
   - Any user browsing the Directory can tap the `+ Vouch` button on a provider card at any time to open the 1-Tap Vouch modal and vote.
2. **Post-Contact Check-In (Passive Trigger)**:
   - When a user taps the **WhatsApp** or **Call** button on a provider card, the app/browser initiates the native external intent (`https://wa.me/...` or `tel:...`).
   - If the user has not previously vouched for that specific provider, the client arms a lightweight post-contact check-in prompt upon returning to the app:
     > *"Did you connect with Capt. Justo? Help the Bocas community by leaving a 1-tap vouch."*
   - The user selects one of the 3 positive feedback tags and taps submit, which increments the live vouch counter.

---

### Privacy Architecture & Trust Model

> [!IMPORTANT]
> **Why the Vouching System Does NOT Invade User Privacy:**
> 1. **Zero WhatsApp Introspection**: PoquitoTalk does **NOT** and **CANNOT** read, intercept, or monitor WhatsApp chats, audio notes, call durations, or conversation history. All WhatsApp messages remain 100% end-to-end encrypted between the user and the contractor.
> 2. **Local UI Intent Trigger Only**: The prompt is triggered purely because the user tapped the outbound contact hyperlink inside PoquitoTalk (`wa.me` button click event). It operates identically to standard web link navigation without any background spying or device daemons.
> 3. **100% Anonymous Backend Storage**: The server API only receives `{ "providerId": "captain-50767450876", "reason": "fast_response" }`. **No user phone numbers, IP addresses, names, or contact logs are recorded or linked to the vouch.**
> 4. **Voluntary & Non-Intrusive**: The check-in modal is completely optional and dismissible with 1 tap (or by tapping outside the modal) with zero friction or penalties.
> 5. **Empowering Community Framing**: The copy is framed around community mutual aid (*"Help fellow Bocas expats & locals know who is active and reliable"*), avoiding intrusive survey fatigue.

---

### Anti-Revenge & Anti-Fraud Protection Architecture

Traditional 1-to-5 star platforms (like Google Maps or Yelp) are frequently weaponized by competitors or disgruntled actors through "review bombing" and public defamatory smears. PoquitoTalk structurally eliminates this:

1. **Positive-Only Additive Architecture (No Downvotes / No 1-Stars)**:
   - Users can only award positive community signals (Fast Response, Fair Price, Great Service).
   - There are **no downvotes, no 1-star ratings, and no unmoderated public comment walls**.
   - **Result**: Bad-faith actors cannot defame, manipulate, or artificially drag down another captain or tradesperson's score.
2. **Private Administrative Dispute & Delisting Channel**:
   - If a contractor or captain engages in serious fraud, dangerous conduct, or unreliability, users report the issue privately through the dedicated Dispute channel (`support@hero-apps.com`).
   - The administration team directly verifies the report and delists or suspends the provider from the directory, protecting the community without allowing public flame wars.
3. **Self-Vouching Safeguards**:
   - Every physical device is locked to **1 single vouch per provider** via client sandbox keys (`poquito_local_vouches`).
   - While a contractor or family member might vouch once for their own listing, they cannot generate artificial surges, ensuring aggregate counts reflect real multi-client community activity over time.

---

## 8. Headless Walkthrough Video Pipeline

Built using headless Chrome emulation and FFmpeg (`scripts/record_walkthrough.js`):
1. Emulates high-DPI iPhone viewport (`393 x 852` @ 3x scale).
2. Uses synthetic touch physics with cubic bezier momentum scrolling and visual touch indicator pulses.
3. Captures PNG frames at 60 FPS.
4. Multiplexes video frames with studio voiceovers using FFmpeg:
   ```bash
   ffmpeg -framerate 60 -i frames/frame_%05d.png -i voiceover.mp3 -c:v libx264 -pix_fmt yuv420p -c:a aac walkthrough_demo.mp4
   ```

---

## 9. Web Funnel, OpenGraph & Social Preview Architecture

- **Social Card Standard**: 1200 $\times$ 630 PNG card (`twitter_card.png`, `og_preview.png`) rendered via `scripts/generate_twitter_card.py`.
- **Meta Tags**: Standardized across all 6 HTML templates:
  ```html
  <meta property="og:image" content="https://poquitotalk.hero-apps.com/twitter_card.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@DorienVibecodes" />
  <meta name="twitter:creator" content="@DorienVibecodes" />
  <meta name="twitter:image" content="https://poquitotalk.hero-apps.com/twitter_card.png" />
  ```
- **Cache Busting**: Unique version query parameters on all stylesheets and scripts (`style.css?v=4.4.0`, `script.js?v=4.0.0`).

---

## 10. Future Roadmap: Context-Aware Panamanian Dialect Engine (v2.0)

For complete architectural specifications, linguistic rules, and failure analysis of static template transformations, refer to [`docs/FUTURE_DIALECT_ENGINE.md`](file:///Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras/docs/FUTURE_DIALECT_ENGINE.md).

### MVP Decision & Key Learnings:
- **Stripped Static Tone Switcher**: Removed naive regex-based "Full Panameño" toggle for v1.0 MVP to prevent repetitive template hallucination (e.g. rigid suffix tagging).
- **Core Priority**: Deliver 100% reliable, polite, and natural Panamanian Spanish that works flawlessly in real-world WhatsApp exchanges with local contractors.
- **v2.0 LLM Architecture**: Moving to few-shot semantic prompt rewriting conditioned on domain, recipient relationship, and urgency rather than string concatenation.


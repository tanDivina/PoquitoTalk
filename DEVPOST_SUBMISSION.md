# PoquitoTalk — Devpost Hackathon Submission Guide

This document contains everything you need to fill out the Devpost submission form field by field. Copy and paste directly into each box.

---

## 1. Project Overview (Page 1)

### Project Name
`PoquitoTalk`

### Elevator Pitch / Tagline
*(Devpost character limit: ~200 characters)*

**Option 1 — Recommended (156 characters):**
> Instant Panamanian Spanish WhatsApp voice notes and a zero-install 2-way walkie-talkie for expats talking to boat captains and trades in Bocas del Toro.

**Option 2 — Punchy & Short (118 characters):**
> Turn English into local Panamanian Spanish WhatsApp voice notes, with 2-way live audio translation for island trades.

**Option 3 — Problem & Solution (192 characters):**
> Local boat captains and trades in Panama communicate almost exclusively by WhatsApp voice notes. PoquitoTalk bridges the gap with 1-tap Panamanian audio translation and zero-install 2-way talk.

---

## 2. Project Media / GIF (Page 1)

Devpost allows uploading image and GIF files up to **5 MB**. We generated two optimized GIFs located directly in the root of this project:

1. **Flagship 16:9 Landscape GIF (Recommended for Gallery Header):**
   - **File:** `poquitotalk_devpost_demo.gif` (3.4 MB, 960x540, 14 fps)
   - **What it shows:** Two phones side by side. Sarah on Isla Solarte speaks English into the native app asking for a boat pickup. Capitán Luis opens the zero-install web link on his phone, listens in Panamanian Spanish, and replies with audio. Sarah receives the translated English response in real time.
2. **Mobile Walkthrough GIF (Alternative / Supplementary):**
   - **File:** `poquitotalk_devpost_mobile.gif` (3.4 MB, 320x692, 12 fps)
   - **What it shows:** 1-tap translation flow, audio voice note card, and the falling rainbow spectrum template decks.

> Both files are saved in the project root:
> `/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras/poquitotalk_devpost_demo.gif`
> `/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras/poquitotalk_devpost_mobile.gif`

---

## 3. Project Story / "About the Project" (Page 2)

Copy and paste the markdown below directly into the Devpost story text area.

```markdown
### Inspiration

I live in Bocas del Toro, an island archipelago in Panama. Around here, there are no highways connecting the islands. You travel by water taxi, rely on rainwater catchment tanks, and depend on local tradespeople to keep your solar panels, boat motors, and A/C running in tropical heat.

Every newcomer quickly runs into the same wall: **the WhatsApp voice note culture**.

In Panama, nobody texts. Local boat captains steering a panga through waves and carpenters working on ladders rarely type or read long WhatsApp messages. Over 90% of local trade communication happens via rapid-fire Spanish voice notes. 

If you use Google Translate, you get stiff, formal textbook Spanish pasted as text. It doesn't work. The captain listens to voice notes while driving the boat, and replies with a five-second Panamanian audio message (*"¡Buenas! Voy saliendo de Almirante, llego en veinte..."*). If you can't speak or understand spoken Panamanian Spanish, you are stuck.

Every day, the local expat groups on Facebook and WhatsApp are flooded with the exact same messages: *"Anyone have a boat captain to Carenero right now?"*, *"Need a plumber who can fix a pressure tank"*, *"Who does Starlink installs?"*.

I built PoquitoTalk to solve my own daily headache: an app that turns English into natural Panamanian Spanish WhatsApp voice notes, lets local trades reply without downloading anything, and organizes the verified local island directory in one place.

---

### What it does

PoquitoTalk is a mobile assistant and web service built for everyday island communication:

1. **1-Tap Panamanian Audio Translation**: You speak or type in English, and PoquitoTalk generates a natural Panamanian Spanish audio voice note. It uses local phrasing (like starting with *"¡Buenas!"* and using regional terminology) instead of stiff textbook grammar.
2. **Direct WhatsApp Audio Sharing**: Generates real `.mp3` voice note files that attach straight into your WhatsApp chats with one tap.
3. **Zero-Install 2-Way Walkie-Talkie Web Link**: When contacting a boat captain or plumber, you can share a private 2-way walkie link (`poquitotalk.hero-apps.com/talk?room=...`). The contractor taps the link in WhatsApp, opens it in Safari or Chrome without installing an app or creating an account, and talks back in Spanish. Their audio is transcribed and translated back into English on your screen in real time.
4. **Asymmetrical Voice Personas**: Your outbound Spanish audio matches your chosen voice (Diego, Sofia, Mateo, or Valeria). But when a local contractor replies, incoming audio preserves their actual gender in the English playback. If a female boat operator or clinic receptionist responds, you hear a female voice in English.
5. **Verified Bocas del Toro Directory**: Pre-loaded with local island contacts across 12 categories—boat captains, water delivery, electricians, Starlink techs, pharmacies, and island vets—paired with quick-tap situational phrase templates.
6. **Web Funnel & Travel Passes**: A live web landing page (`poquitotalk.hero-apps.com`) built with Stripe Checkout and RevenueCat, offering $4.99 credit packs and 7-day travel passes for visiting tourists.

---

### How we built it

- **Mobile App**: Built with React Native and Expo using TypeScript. Designed with a warm terracotta and neutral palette that fits the Bocas island feel, with high-contrast touch targets and custom vector icons.
- **Audio & Translation Pipeline**: We used Google Gemini with tailored system prompts trained on regional Panamanian Spanish idioms, vocabulary, and island context. Spoken inputs pass through an automated repetition cleaner (`cleanSpeechRepetitions`) before translation to catch stutters and thinking pauses.
- **Voice Synthesis**: Integrated ElevenLabs to synthesize warm, natural audio clips for outbound voice personas and incoming English translations.
- **Zero-Install Web Walkie-Talkie**: Built a lightweight web audio interface deployed on LiteSpeed that connects directly with the mobile app via WebSocket and REST endpoints, giving tradespeople a zero-barrier experience.
- **Directory & Templates**: Backed by MongoDB Atlas to organize categorized contacts and structured phrase decks.
- **Subscriptions & Funnel**: Integrated RevenueCat SDK for mobile subscriptions and credit packs, paired with Stripe Checkout on the web funnel.

---

### Challenges we ran into

1. **The Voice Identity Collision**: Initially, app settings had a global voice gender. But in live testing, when an expat user selected a male voice, voice replies from female clinic receptionists or boat coordinators were translated into English with a male voice. It sounded completely wrong and stripped away the speaker's identity. We completely decoupled the audio pipelines: outbound voice matches the user, while inbound audio dynamically preserves the contractor's actual gender.
2. **Zero-Friction for Island Tradespeople**: A local boat captain or handyman is not going to install an English app from the App Store. If the tool required them to download an app, it would be useless. That is why we built the web walkie-talkie link: one tap in WhatsApp, zero installation, no login, just press and talk.
3. **Island Acoustic Noise & Caribbean Dialect**: Panamanian Caribbean Spanish drops syllables (*"pa' lante"*, *"ta' bien"*), and voice notes are often recorded over noisy outboard boat motors or rain on tin roofs. We tuned our Gemini prompts specifically to handle conversational Caribbean Spanish cadence and built audio preprocessing to handle noisy input gracefully.

---

### Accomplishments that we're proud of

- **Solving a Real Daily Need**: PoquitoTalk isn't a mock project or a generic demo. It was designed and tested right here on the ground in Bocas del Toro to solve everyday island communication.
- **The Two-Phone Live Walkie Test**: Seeing an English resident ask for a boat pickup on one phone, while a Panamanian captain hears the Spanish audio and answers back on a standard mobile browser—with translations updating on both screens in under 400ms—was the biggest breakthrough of the project.
- **Full Production Deployment**: We shipped both the native Expo mobile app builds and the live web funnel (`poquitotalk.hero-apps.com`) with working Stripe payments and RevenueCat integration.

---

### What we learned

- **Voice is culturally non-negotiable in Central America**: In many parts of the world, text messaging is standard. In Panama, audio notes are the primary way business gets done. You cannot build a communication tool for this market without audio at the center.
- **Designing for both sides of the interaction**: An expat utility is only as good as the local provider's willingness to use it. Removing all friction for the receiving person (zero app installs, native Spanish UI, web browser compatibility) was just as important as the mobile app itself.

---

### What's next for PoquitoTalk

- **Native WhatsApp Share Extension**: Forward incoming Spanish voice notes directly from WhatsApp into PoquitoTalk for one-tap translation and quick response generation.
- **0.75x Slow Replay & Word Highlighting**: A dedicated learning mode that lets users replay local voice notes at 0.75x speed with synchronized Spanish/English subtitles so they can learn the local dialect over time.
- **Island Notice Camera Scanner**: Expanding the scanner to read paper dock notices, IDAAN water outage bulletins, and community announcements.
```

---

## 4. Built With / Tech Stack Tags (Page 2)

Add these tags to the "Built With" field:
`react-native`, `expo`, `typescript`, `google-gemini`, `elevenlabs`, `revenuecat`, `stripe`, `mongodb-atlas`, `node-js`, `tailwind-css`

---

## 5. Links & Resources (Page 2/3)

- **GitHub Repository:** [https://github.com/tanDivina/PoquitoTalk](https://github.com/tanDivina/PoquitoTalk)
- **Live Web Funnel:** [https://poquitotalk.hero-apps.com](https://poquitotalk.hero-apps.com)
- **Zero-Install Walkie Link Demo:** [https://poquitotalk.hero-apps.com/talk](https://poquitotalk.hero-apps.com/talk)

---

## 6. Required Submission Checklist Items

### * Did you attach a 1024 x 1024 uncropped image of your app icon?
**YES.**
- **File:** `app_icon_1024x1024.png` (Saved in project root)
- **Dimensions:** 1024 x 1024 px uncropped square
- **Path:** `/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras/app_icon_1024x1024.png`

### * Did you attach a screenshot of your app WITHOUT device frames?
**YES.**
- **Primary Translation Screen (Frameless):** `app_screenshot_no_device_frame.png` (786 x 1704 px)
- **Verified Directory Screen (Frameless):** `app_screenshot_directory_no_device_frame.png` (786 x 1704 px)
- **2-Way Walkie-Talkie Screen (Frameless):** `app_screenshot_walkie_no_device_frame.png` (786 x 1704 px)
- **All files saved in:** `/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras/`

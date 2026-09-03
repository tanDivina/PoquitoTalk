# 🔮 PoquitoTalk: Future Features & V2 Technical Architecture

This document tracks advanced features, experimental capabilities, and post-V1 roadmap items deferred from the initial launch to maintain airtight stability, low operating costs, and optimized credit margins.

---

## 1. 🎙️ Simultaneous Two-Way Hands-Free Conversation ("Live Duo / Table Mode")

### Overview & User Experience
* **What It Does**: Allows two people speaking different languages (e.g., an English-speaking expat and a Spanish-speaking Panamanian contractor or doctor) to sit across a table and hold a natural, continuous conversation without pressing or holding any buttons.
* **Dual-Display Split Screen**:
  * **Top Half (Rotated 180°)**: Faces the local contractor/tradesperson right-side up with real-time Spanish transcription and translated English replies.
  * **Bottom Half (Normal Orientation)**: Faces the user/expat with English transcription and translated Spanish replies.
  * **Zero Tap Interaction**: Both speakers converse naturally; live transcripts stream simultaneously side-by-side.

### Why Deferred from V1 Initial Release
1. **API Token & Infrastructure Cost**:
   - Continuous audio streaming requires maintaining open WebSocket / WebRTC audio channels, running constant Voice Activity Detection (VAD), and repeatedly hitting speech-to-text / translation endpoints.
   - Unlike discrete Push-To-Talk voice notes (which cost a fixed ~0.005 USD per message), open continuous streaming can consume 5× to 10× more API tokens per minute.
2. **Credit Pricing Model Calibration**:
   - Needs dedicated credit metering (e.g., 5 credits per continuous minute or gated exclusively to the Pro Travel Pass / Annual Subscription) to ensure healthy unit economics.
3. **Bandwidth & Acoustic Stability in Tropical Island Conditions**:
   - Background boat engine rumble, tropical rainstorms, and intermittent cellular 3G/LTE in Bocas del Toro require specialized acoustic noise suppression profiles before deploying to production.

### Proposed Technical Architecture (V2)
```
       [ 🎙️ Continuous Open Audio Stream (AEC + Noise Suppression) ]
                                    │
                                    ▼
       [ ⚡ Voice Activity Detection (VAD) + Auto-LID (ES / EN) ]
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
         [ 🇵🇦 Panamanian Spanish ]            [ 🇺🇸 English ]
                  │                                   │
         Stream STT (Whisper/Gemini)          Stream STT (Whisper/Gemini)
         Instant Translate to EN              Instant Translate to ES
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    ▼
               [ 📱 Dual Split-Screen Live Transcript Stream ]
               (Top half inverted 180° / Bottom half normal)
```

---

## 2. 📲 Direct WhatsApp Inbound Share-Target (V2 Audio Decoder)

* **Overview**: Allows users inside WhatsApp to long-press any rapid incoming Spanish voice note, tap **Share**, and send it directly to PoquitoTalk without manual file saving.
* **Native Implementation**:
  * iOS: Native `NSExtension` (Share Extension).
  * Android: System Intent Filter (`android.intent.action.SEND` handling `audio/*`).
* **Output**: Instant English breakdown + 3 quick 1-tap Spanish voice reply suggestions.

---

## 3. 🐢 "Slow-Down" & Phonetic Learning Mode (0.75x Playback)

* **Overview**: Toggles audio playback speed (`0.75x`, `1.0x`, `1.25x`) on all synthesized speech and incoming voice notes with synchronized syllable/word highlighting.
* **Impact**: Empowers expats and digital nomads to train their ears and build conversational confidence at their own pace.

---

## 4. 📷 Island Noticeboard & Screenshot OCR Scanner

* **Overview**: Expands the multimodal Gemini OCR parser to interpret physical ferry timetables, water outage bulletin boards, and WhatsApp group flyers into actionable English calendar events and directory contacts.

---

*Last Updated: August 2026 • PoquitoTalk Product & Engineering*

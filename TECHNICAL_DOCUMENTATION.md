# 🇵🇦 PoquitoTalk — Technical Documentation

## 1. System Overview
**PoquitoTalk** is a hybrid mobile application and web conversion funnel built for expats and travelers in **Bocas del Toro, Panama**. It bridges communication barriers between English-speaking expats and local Spanish service providers (boat captains, A/C technicians, Starlink installers, plumbers, medical clinics) by generating instant, friendly **Panamanian Spanish WhatsApp Voice Notes** spoken by custom voice personas.

---

## 2. Architecture & Tech Stack

```
                               ┌────────────────────────────────────────┐
                               │            PoquitoTalk App             │
                               │           (Expo SDK 54 / RN)           │
                               └───────────────────┬────────────────────┘
                                                   │
                ┌──────────────────────────────────┼──────────────────────────────────┐
                │                                  │                                  │
     ┌──────────▼──────────┐            ┌──────────▼──────────┐            ┌──────────▼──────────┐
     │   Gemma AI Engine   │            │ Google Cloud Voice  │            │  RevenueCat SDK v9 │
     │ (Panamá Regional)   │            │ (Diego, Mateo, etc) │            │ (Pro Subscriptions)│
     └─────────────────────┘            └──────────┬──────────┘            └────────────────────┘
                                                   │
                                        ┌──────────▼──────────┐
                                        │ WhatsApp Audio Share│
                                        │   (.mp3 Attachment) │
                                        └─────────────────────┘
```

### Core Technologies
- **Mobile Framework**: React Native with Expo SDK 54 (`"expo": "~54.0.0"`).
- **Navigation**: `@react-navigation/bottom-tabs` v7 with custom elevated floating pill bar.
- **UI & Layout**: Custom Material Design 3 tokens + `react-native-safe-area-context` + `@expo/vector-icons` (`Ionicons`, `FontAwesome5`, `MaterialCommunityIcons`).
- **Translation Engine**: Gemma AI Panamanian Spanish Inference Engine (`src/services/gemma.ts`).
- **Speech Synthesis & Voice Personas**: Google Cloud Text-to-Speech REST API + `expo-file-system/legacy` + `expo-av` (`src/services/googleVoice.ts`).
- **Sharing & Attachments**: `expo-sharing` (`Sharing.shareAsync`) + `expo-clipboard` + `expo-document-picker`.
- **Monetization SDK**: `react-native-purchases` v9 (RevenueCat Purchases).
- **Regional Service Directory**: MongoDB Atlas Data API (`EXPO_PUBLIC_MONGO_ATLAS_URL`).
- **Web Conversion Funnel**: Static HTML5/CSS3 Stitch Artisanal Clarity tokens on Vercel + Namecheap CPanel with Let's Encrypt RSA 2048-bit SSL (`poquitotalk.hero-apps.com`).

---

## 3. Voice Persona System & Pitch Calibrations

PoquitoTalk features **4 distinct studio voice personas** mapped across gender and tone preferences:

| Persona | Gender | Tone Description | Voice Model ID | Native Pitch | Speed Rate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 👨 **Diego** | Male | Warm & Natural Male (Panamá) | `es-US-Neural2-B` | `-5.0` (0.35 native) | `0.88` |
| 🧔 **Mateo** | Male | Calm & Authoritative Male | `es-US-Neural2-C` | `-7.5` (0.20 native) | `0.82` |
| 👩 **Sofia** | Female | Clear & Friendly Female | `es-US-Neural2-A` | `+3.0` (1.45 native) | `0.92` |
| 👧 **Valeria** | Female | Young & Expressive Female | `es-US-Journey-F` | `+5.5` (1.75 native) | `0.98` |

### Audio Generation Pipeline
1. Input text is validated for Spanish question marks (`¿...?`).
2. If text contains `?`, SSML tags (`<speak>...</speak>`) and pitch boost (`+2.0`) are applied to enforce authentic Spanish question intonation.
3. High-quality `.mp3` audio files are generated and saved to `${FileSystem.cacheDirectory}poquitotalk_[persona]_[timestamp].mp3`.
4. Playback executes via `expo-av` (`Audio.Sound.createAsync`).
5. Attachment sharing triggers `Sharing.shareAsync(fileUri, { mimeType: 'audio/mp3', UTI: 'public.mp3' })` to attach the `.mp3` directly into WhatsApp chats.

---

## 4. Closed 2-Way WhatsApp Conversation Loop

```
  [Expat Types/Speaks English]
               │
               ▼
   [Gemma Panamanian Spanish] ──► [Generate .mp3 Voice Note] ──► [1-Tap Send to WhatsApp]
               ▲                                                               │
               │                                                               ▼
  [1-Tap Follow-Up Response] ◄── [Translate to English] ◄── [Auto-Detect Copied Spanish Reply]
```

### Key Components:
- **Clipboard Spanish Reply Detector**: Auto-detects copied Spanish messages from WhatsApp and displays a 1-tap green banner: *"Copied WhatsApp Reply Detected: Translate to English?"*
- **1-Tap Follow-Up Response Chips**: Displays contextual English follow-up choices (*"3:00 PM works great!"*, *"How much is the inspection cost?"*, *"Here is my location on Isla Colón."*) that translate back to Panamanian Spanish in 1 tap.
- **Incoming Voice Note Helper**:
  - `Listen via Mic`: Listens to Spanish audio playing from speaker live.
  - `Import Audio File`: Imports `.m4a` / `.opus` / `.mp3` files via `expo-document-picker`.
  - `WhatsApp Guide`: Provides 4-step instructions on enabling WhatsApp's native Voice Message Transcripts.

---

## 5. Component Structure & Data Flow

- `App.tsx`: Navigation container, `SafeAreaProvider`, RevenueCat initialization, onboarding state, and floating pill tab bar.
- `src/screens/OnboardingScreen.tsx`: 3-step intake flow (App concept $\rightarrow$ Voice Persona selection $\rightarrow$ Final locking).
- `src/screens/HomeScreen.tsx`: Primary translation workspace, mic dictation, clipboard detection banner, and follow-up response chips.
- `src/screens/PresetsScreen.tsx`: Categorized service phrases + Bocas del Toro local directory contacts (MongoDB Atlas).
- `src/screens/SavedScreen.tsx`: Bookmarked translations storage.
- `src/screens/SettingsScreen.tsx`: Subscription details, hackathon info, and 1-tap onboarding reset trigger (`v1.0.2 Intake`).
- `src/components/TranslationCard.tsx`: Translation output display, voice persona selector modal, audio player, copy, save, and 2-row WhatsApp Voice Note button.
- `src/components/Header.tsx`: Brand header with Pro status badge and `v1.0.2 Intake` reset button.

# 🇵🇦 PoquitoTalk — Real-Time Voice Translation & WhatsApp Assistant

> **Built for RevenueCat Shipaton 2026** ($150,000+ Prize Pool)  
> *Targeting Categories*: **Best Mobile App** • **Funnel Vision Award — Stripe** ($15k–$100k)

PoquitoTalk bridges the communication gap between English-speaking expats/travelers and local Panamanian service providers (plumbers, boat mechanics, A/C technicians, Starlink installers, doctors, and landlords) in **Bocas del Toro, Panama 🇵🇦**.

Instead of awkward Google Translate text that locals ignore, PoquitoTalk generates **polite, authentic 1-tap WhatsApp voice notes** powered by **Google Gemini AI** and **Panamanian Spanish voice synthesis**.

---

## 🌟 Key Features

1. **🎙️ 1-Tap WhatsApp Voice Notes**:
   - Converts your requests into natural `.mp3` audio files and shares them directly into WhatsApp chats.

2. **🎭 Personalized Voice Personas**:
   - Select between male/female and young/mature voice personas (👨 Diego, 👩 Sofia, 👧 Valeria, 🧔 Mateo, ✨ Lucía).

3. **🛠️ Service & Emergency Repair Presets**:
   - Built-in scenarios for **A/C leaking**, **boat motor failure**, **Starlink dish alignment**, **plumbing/water pressure**, **doctor emergencies**, and **dentist appointments**.

4. **📍 Local Service Provider Directory (MongoDB Atlas)**:
   - Verified local WhatsApp contact directory pre-configured for Bocas del Toro.

5. **🌐 Web Conversion Funnel (`poquitotalk.hero-apps.com`)**:
   - Interactive live web translation demo + Stripe Checkout + RevenueCat Web Funnels for credit packs and annual passes.

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Mobile Framework** | React Native (Expo v57) |
| **In-App Subscriptions** | RevenueCat SDK v9 (`react-native-purchases`) |
| **Web Payments & Funnel** | RevenueCat Web Funnels + Stripe Checkout |
| **AI Translation Engine** | Google Gemma 2B AI (Local Panamanian Phrasing) |
| **Voice Synthesis** | Google Cloud Text-to-Speech API |
| **Database** | MongoDB Atlas (Free M0 Regional Provider Directory) |
| **Hosting & SSL** | Namecheap CPanel + Vercel (`poquitotalk.hero-apps.com`) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Expo Go app on iOS or Android

### Installation & Local Run

```bash
# 1. Clone the repository
git clone https://github.com/tanDivina/PoquitoTalk.git
cd PoquitoTalk

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npx expo start
```

Scan the QR code printed in your terminal using the **Expo Go app** on your phone!

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

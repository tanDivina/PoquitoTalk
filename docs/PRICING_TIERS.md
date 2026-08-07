# PoquitoTalk Tier & Monetization Architecture

## Overview
PoquitoTalk provides a zero-friction, multi-tiered monetization strategy tailored for both short-term tourists visiting Bocas del Toro/Panama and long-term expat residents.

---

## 1. Plan Structure & Pricing Matrix

| Plan Tier | Price | Voice Notes | Walkie-Talkie | Target Audience |
| :--- | :--- | :--- | :--- | :--- |
| **Free Forever** | **$0.00** | Unlimited (Device TTS + 10 Studio Presets) | Preview Mode | Casual Browsers |
| **50 Poquito Credits Pack** | **$4.99** *(one-time)* | 50 Custom Voice Notes (1 Credit/note) | 10 Walkie Sessions (5 Credits/session) | Pay-as-you-go users |
| **Weekly Tourist Pass** | **$4.99** */ week* | **Unlimited** ElevenLabs Studio Voices | **Unlimited** 2-Way Walkie-Talkie | Short-term travelers & island visitors (7 Days) |
| **Pro Monthly Membership** | **$9.99** */ month* | **Unlimited** ElevenLabs Studio Voices | **Unlimited** 2-Way Walkie-Talkie | Expats, nomads & local Panama residents |

---

## 2. Unified Credit Consumption Engine ("Poquito Credits")

Instead of confusing customers with separate credit balances, PoquitoTalk uses **1 Unified Credit Balance**:

* **1 Custom ElevenLabs Voice Note** = **1 Credit**
  - Generates custom high-fidelity Spanish voice notes (Diego, Sofia, Mateo, Valeria).
* **1 Live Walkie-Talkie Session** = **5 Credits**
  - Starts a 2-way zero-install contractor web session with real-time accent cleaning.

> **Graceful Fallback**: If credits reach 0, users can still generate unlimited text translations and play voice notes using the **Free Native Device TTS** engine without being blocked.

---

## 3. Web & Mobile Funnel Alignment

Both the web application (`poquitotalk.hero-apps.com`) and the mobile app share the exact same unified entitlement state synced via Stripe Checkout and RevenueCat:

- **Weekly Tourist Pass ($4.99/wk)**
- **Monthly Pro Pass ($9.99/mo)**
- **50 Poquito Credits ($4.99 one-time)**

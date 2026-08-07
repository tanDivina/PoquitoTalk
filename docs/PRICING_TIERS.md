# PoquitoTalk Tier, Pricing & Unit Economics Architecture

## Overview
PoquitoTalk provides a zero-friction, multi-tiered monetization strategy tailored for both short-term tourists visiting Bocas del Toro/Panama and permanent expat residents.

---

## 1. Plan Structure, Pricing & Fair-Use Caps

| Plan Tier | Price | Fair-Use Voice Cap | Fair-Use Walkie Cap | Target Audience |
| :--- | :--- | :--- | :--- | :--- |
| **Free Forever** | **$0.00** | Unlimited (Device TTS + 10 Studio Presets) | Preview Mode | Casual Browsers |
| **50 Poquito Credits Pack** | **$4.99** *(one-time)* | 50 Custom Voice Notes (1 Credit/note) | 10 Walkie Sessions (5 Credits/session) | Pay-as-you-go users (Never expires) |
| **Weekly Tourist Pass** | **$4.99** */ week* | 150 Studio Voice Notes / week (~21/day) | 30 Walkie Sessions / week (~4/day) | Short-term travelers & island visitors (7 Days) |
| **Pro Monthly Membership** | **$12.99** */ month* | 450 Studio Voice Notes / month (~15/day) | 100 Walkie Sessions / month (~3/day) | Expats, nomads & permanent Panama residents |

---

## 2. Unit Economics & Profit Margins

| Feature | Average Length / Units | Cost per Use |
| :--- | :--- | :--- |
| **Custom ElevenLabs Voice Note** | ~120 characters (~15 words / 12s audio) | **~$0.018** *(1.8 cents)* |
| **Magic Walkie-Talkie Session** | ~4 audio turns + STT + Gemma translation | **~$0.060** *(6.0 cents)* |

### Profit Margin Calculations:

1. **50 Credits Pack ($4.99 One-Time)**:
   - Gross: $4.99 | Net Revenue (after Stripe): **~$4.54**
   - Max API Cost (50 notes): **$0.90**
   - **Net Profit: +$3.64 (80% Margin)**

2. **Weekly Tourist Pass ($4.99 / Week)**:
   - Gross: $4.99 | Net Revenue (after Stripe): **~$4.54**
   - Max API Cost (150 notes + 30 sessions cap): **~$2.70**
   - **Net Profit: +$1.84 (40% Margin)**

3. **Pro Monthly Membership ($12.99 / Month)**:
   - Gross: $12.99 | Net Revenue (after Stripe): **~$12.31**
   - Typical Expat Usage (~150 notes + 15 sessions): **~$3.60 API Cost**
   - **Net Profit (Typical): +$8.71 (71% Margin)**
   - Heavy Expat Usage (~300 notes + 40 sessions): **~$7.80 API Cost**
   - **Net Profit (Heavy User): +$4.51 (37% Margin)**

---

## 3. Unified Credit Consumption Engine ("Poquito Credits")

Instead of confusing customers with separate credit balances, PoquitoTalk uses **1 Unified Credit Balance**:

* **1 Custom ElevenLabs Voice Note** = **1 Credit**
* **1 Live Walkie-Talkie Session** = **5 Credits**

---

## 4. Graceful Overage Guardrail (Zero Friction)

If a user reaches their Fair-Use weekly/monthly cap:
1. **Translations never stop or block**.
2. Custom voice notes fall back gracefully to **Free Native Device TTS** for the remainder of their billing period.
3. Users can optionally tap a button to top up 50 extra ElevenLabs credits for $4.99.

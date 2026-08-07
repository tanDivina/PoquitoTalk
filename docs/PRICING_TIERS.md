# PoquitoTalk Tier, Pricing & Guaranteed Profit Architecture

## Overview
PoquitoTalk provides a zero-loss, multi-tiered monetization strategy. Every single tier is mathematically capped so that even if a customer uses 100% of their maximum quota, **there is ZERO financial loss and a guaranteed positive net profit margin**.

---

## 1. Zero-Loss Plan Structure & Guaranteed Profit Matrix

| Plan Tier | Price | Max Voice Notes | Max Walkie Sessions | Max API Cost | Absolute Min Net Profit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Free Forever** | **$0.00** | Unlimited (Device TTS + 10 Studio Presets) | Preview Mode | $0.00 | **$0.00 (Zero Risk)** |
| **50 Poquito Credits Pack** | **$4.99** *(one-time)* | 50 Custom Voice Notes (1 Credit/note) | 10 Walkie Sessions (5 Credits/session) | $0.90 max | **+$3.64 Profit (80% Margin)** |
| **Weekly Tourist Pass** | **$4.99** */ week* | 100 Studio Voice Notes / week (~14/day) | 25 Walkie Sessions / week (~3.5/day) | $3.30 max | **+$1.24 Profit (27% Min Margin)** |
| **Pro Monthly Membership** | **$12.99** */ month* | 300 Studio Voice Notes / month (~10/day) | 65 Walkie Sessions / month (~2/day) | $9.30 max | **+$3.01 Profit (24% Min Margin)** |

---

## 2. Unit Cost & Profit Guarantee Breakdown

| Feature | Unit Measure | API Unit Cost |
| :--- | :--- | :--- |
| **Custom ElevenLabs Voice Note** | ~120 characters (~15 words / 12s audio) | **$0.018** *(1.8 cents)* |
| **Magic Walkie-Talkie Session** | ~4 audio turns + STT + Gemma translation | **$0.060** *(6.0 cents)* |

### Guaranteed Profit Calculations (Worst-Case 100% Capacity):

1. **50 Credits Pack ($4.99 One-Time)**:
   - Gross: $4.99 | Net Revenue (after Stripe): **$4.54**
   - Max Cost (50 notes): 50 × $0.018 = **$0.90**
   - **Guaranteed Minimum Profit: +$3.64 (80% Net Margin)**

2. **Weekly Tourist Pass ($4.99 / Week)**:
   - Gross: $4.99 | Net Revenue (after Stripe): **$4.54**
   - Max Cost (100 notes + 25 sessions): (100 × $0.018) + (25 × $0.060) = $1.80 + $1.50 = **$3.30**
   - **Guaranteed Minimum Profit: +$1.24 (27% Net Margin)**

3. **Pro Monthly Membership ($12.99 / Month)**:
   - Gross: $12.99 | Net Revenue (after Stripe): **$12.31**
   - Max Cost (300 notes + 65 sessions): (300 × $0.018) + (65 × $0.060) = $5.40 + $3.90 = **$9.30**
   - **Guaranteed Minimum Profit: +$3.01 (24% Net Margin)**
   - *Average User Profit (at ~120 notes + 15 sessions)*: **+$8.71 (71% Net Margin)**

---

## 3. Unified Credit Consumption Engine ("Poquito Credits")

* **1 Custom ElevenLabs Voice Note** = **1 Credit**
* **1 Live Walkie-Talkie Session** = **5 Credits**

---

## 4. Automatic Overage Protection

When a subscriber hits their maximum quota:
1. **No Service Disruption**: Custom voice notes fall back gracefully to **Free Native Device TTS** for the remainder of their period.
2. **Top-Up Option**: Users can optionally tap to add 50 extra ElevenLabs credits for $4.99.

# I Built a 1-Way AI Translator for Expats in Panama. Then Reddit Showed Me I Was Solving Only 50% of the Problem.

*By Dorien Van den Abbeele ([@DorienVibecodes](https://x.com/DorienVibecodes))*

---

## TL;DR
When building software for local communities, it’s easy to get tunnel vision and solve the problem from only one user's perspective. I originally built **PoquitoTalk** to help English-speaking expats in Bocas del Toro, Panama generate 1-tap Spanish WhatsApp voice notes for local service providers. But after posting on a Spanish-speaking Panamanian Reddit thread, I uncovered a huge blind spot: local contractors faced the exact same language friction from the opposite side, constantly hearing *"What did you say?"* due to their heavy English accents. 

Here is how building in public—and listening to both sides of the conversation—forced me to re-architect PoquitoTalk into a 2-way AI "Magic Web Walkie-Talkie" with offline island queueing.

---

```
  BEFORE (1-Way Tunnel Vision):
  [Expat] ──► (Generates Spanish Voice Note) ──► [Contractor] ──► [🤐 Stuck replying in Spanish]

  AFTER (2-Way Closed Loop):
  [Expat] ◄── (Cleaned English Audio) ◄── [Magic Web Walkie-Talkie] ◄── [Contractor inside WhatsApp]
                                                     ▲
                                                     │ (AI Accent & Noise Cleanser)
                                                     │ (Offline Signal Queueing)
```

---

## Act 1: Validating the Expat Pain on Local Forums

If you've ever lived in or visited an expat hub like **Bocas del Toro, Panama**, you know that WhatsApp is the absolute backbone of daily life. Whether you need a water taxi between islands, an A/C technician during a 95°F heatwave, a plumber, or a Starlink installer, you don’t call a front desk—you send a WhatsApp message.

And in Panama, local service providers don't text. They communicate almost exclusively via **Spanish voice notes** (*"¡Buenas! Voy saliendo del muelle..."*).

When I first started building **PoquitoTalk** for the RevenueCat Shipathon, I focused entirely on the expat side of the equation. I validated the concept across local expat Facebook groups and forums. The response was immediate:
* Expats hated typing formal, rigid Google Translate sentences.
* They wanted 1-tap voice notes spoken in authentic, friendly Panamanian Spanish by natural voice personas.

So I built Version 1: a mobile app where an expat types or speaks English, and PoquitoTalk generates a custom `.mp3` voice note ready to drop into WhatsApp with a single tap.

**Validation checked. Ship it, right? Not quite.**

---

## Act 2: The Reddit Epiphany — Seeing the Other Side of the Mirror

Building in public means putting your assumptions out where people can tear them down. After validating with the expat community, I realized I had ignored half of the equation: **the local Panamanian service providers themselves.**

I went to a local Spanish-speaking Reddit thread frequented by Panamanians, boat captains, and field technicians, and asked them open-ended questions about communicating with expat customers.

The feedback was an eye-opener.

Local contractors told me that they *do* try to speak English whenever they can to accommodate American expats. But because of their heavy regional accents, expats frequently didn't understand them, responding with blank stares or repeated *"What did you say?"* requests. 

This created immense friction and embarrassment on both sides:
* **The Expat** felt frustrated trying to decipher heavily accented English or rapid-fire Spanish over noisy boat engines.
* **The Contractor** felt discouraged trying to speak English, leading them to retreat back to short Spanish voice notes or skip explanation details entirely.

My initial "solution" was completely one-sided. PoquitoTalk v1 helped the expat send a message, but left the Panamanian contractor stranded when trying to reply. 

---

## Act 3: Re-Architecting PoquitoTalk into a 2-Way Closed Loop

That Reddit thread changed our product roadmap overnight. I realized we didn't need just a translator—we needed a **fluent, 2-way walkie-talkie bridge**.

However, there was a strict constraint: **Panamanian contractors will NEVER install a new app.** WhatsApp is their business tool. Forcing a boat captain or plumber to download a third-party app just to talk to one expat customer is a 100% drop-off guarantee.

We had to bring the walkie-talkie *inside* WhatsApp.

```
                           POQUITOTALK 4-TIER MODEL
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ Tier 1: Free Text & Basic Translation                                  │
 │ Tier 2: Studio Voice Personas (Diego, Mateo, Sofia, Valeria)            │
 │ Tier 3: Bocas Service Directory & 1-Tap WhatsApp Voice Notes            │
 │ Tier 4: Magic Web Walkie-Talkie (2-Way Real-Time Audio + Accent Clean) │
 └─────────────────────────────────────────────────────────────────────────┘
```

### Introducing Tier 4: The Magic Web Walkie-Talkie

To solve this, we introduced **Tier 4 (PoquitoTalk Pro)**:

1. **The Magic Web Link**: When an expat wants to start a 2-way conversation, PoquitoTalk drops a lightweight link into WhatsApp: `poquitotalk.hero-apps.com/talk?room=abc123`.
2. **Zero-Install Web HUD**: The contractor taps the link inside WhatsApp. It opens a mobile-optimized PWA with **one massive green button**: *"Mantenga presionado para hablar"* (Hold to Speak).
3. **AI Accent & Noise Cleanser**: The contractor holds the button and speaks in Spanish or heavily accented English.
4. **Semantic Normalization**: Our backend (powered by Gemma AI & Whisper) transcribes the audio, strips out background boat/engine noise, normalizes heavy regional accents, and converts the message into crystal-clear English audio streamed live to the expat’s PoquitoTalk app!
5. **Instant Expat Response**: The expat replies in English, which gets synthesized into natural Panamanian Spanish audio played directly on the contractor's web screen.

---

## Act 4: Island Reality — Building for Remote Offline Dead Zones

Testing software in a cozy coffee shop is very different from testing it on a wooden water taxi in the middle of the Caribbean. 

In Bocas del Toro, island infrastructure is notoriously unpredictable. Boat captains zip between islands where cell service drops completely, and technicians often work inside concrete houses or metal Starlink roofs with zero signal.

If a walkie-talkie app requires 100% continuous 5G connection, it fails in the field.

To handle this, we engineered an **Offline Message Queueing System**:

* **Local Audio Caching**: If a contractor on the web link or an expat in the app records a voice note while offline, the audio payload is encrypted and queued locally on their device's storage (`IndexedDB` on Web / `FileSystem` on mobile).
* **Automatic Re-Connection Dispatch**: A persistent background listener monitors network status (`window.addEventListener('online')` / `NetInfo`). The second cellular or Wi-Fi signal returns, the queued audio batch automatically dispatches, translates, and delivers to the recipient without losing a single word.

---

## 4 Lessons for Fellow Builders

1. **Never Assume a 1-Sided Problem is Complete**: Every communication friction has two sides. If your product only solves the buyer's pain while ignoring the service provider's workflow, your retention will stall.
2. **Meet Users Where They Already Live**: Forcing non-technical field workers to download an app is a death sentence. Lightweight Web PWAs shared via WhatsApp give you the power of an app without the friction.
3. **AI Should Clean Intent, Not Just Translate Words**: Raw Speech-to-Text fails on heavy regional accents and background noise. Using AI to clean up accents and noise before translation turns gibberish into clarity.
4. **Build for Real-World Field Conditions**: Always account for offline dead zones, boat noise, rain, and intermittent connectivity. Defensive offline queueing turns fragile web apps into bulletproof tools.

---

### What’s Next?
PoquitoTalk is currently live in beta for expats and local service providers in Bocas del Toro, Panama! You can check out our live web platform at [poquitotalk.hero-apps.com](https://poquitotalk.hero-apps.com) or follow our build-in-public updates on X ([@DorienVibecodes](https://x.com/DorienVibecodes)).

*What's the biggest blind spot you've uncovered while building in public? Let me know in the comments below!*

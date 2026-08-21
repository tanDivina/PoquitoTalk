# Expo Mobile Development & Diagnostic Rules

## 1. FIRST DIAGNOSTIC STEP FOR EXPO CONNECTION ISSUES (MANDATORY)
Whenever a user reports connection errors, timeouts, or "failed to download remote update" in Expo Go:
1. **IMMEDIATELY check the current Mac local IP address** (`ipconfig getifaddr en0`).
2. Compare it against the previously generated QR code/URL. Router DHCP reassigns Mac IPs frequently.
3. NEVER make code changes, package downgrades, or config edits until the local IP address has been verified FIRST.

## 2. EXPO GO SDK VERSION ALIGNMENT
If Expo Go outputs *"The installed version of Expo Go is for SDK XX. The project uses SDK YY"*:
1. Align `"sdkVersion"` in `app.json` to match the installed Expo Go app version (e.g., `"54.0.0"` or `"57.0.0"`).
2. Run `npx expo install --fix` to update native dependencies to match that exact SDK version.

## 3. DOMAIN & DEPLOYMENT ARCHITECTURE
- **`poquitotalk.hero-apps.com`**: Hosted on **Namecheap cPanel LiteSpeed Server** (`66.29.146.28`).
  - **Automated Web Funnel Deployment**: Deploy static `web-funnel/` updates using:
    `rsync -avz -e "ssh -p 21098 -i ~/.ssh/id_rsa_cpanel -o StrictHostKeyChecking=no" ./web-funnel/ finclazc@premium225-5.web-hosting.com:/home/finclazc/public_html/poquitotalk/`

## 4. STRICT BAN ON TACKY AI BADGES & HYPE BUZZWORDS
- **NEVER** use ridiculous buzzwords or badges like *"Expert AI Super-Tool"*, *"Super-Tool"*, *"Revolutionary AI"*, or *"AI Super-App"* anywhere on headers, cards, promotional graphics, showcases, or copy.
- Keep copywriting, badges, and headers clean, grounded, direct, and human.

## 5. CRISP VECTOR SVGS ONLY — NO CARTOONISH EMOJIS/ICONS
- **ALWAYS** use clean, monoline/duotone inline vector SVGs (`stroke-linecap="round"`, `stroke-linejoin="round"`) for UI icons, cards, feature highlights, and showcase graphics.
- **NEVER** use cartoonish emojis or decorative clipart icons across UI or marketing graphics. The only standard exception is official country flag emojis (e.g. 🇵🇦).

<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "poquito-talk".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->

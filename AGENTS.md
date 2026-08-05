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

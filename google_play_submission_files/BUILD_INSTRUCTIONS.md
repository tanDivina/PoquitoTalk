# 📦 Building the Production Android App Bundle (.aab)

Google Play Console requires an **Android App Bundle (.aab)** for all new apps.

You have two simple ways to generate the `.aab` file:

---

## Method 1: EAS Cloud Build (Easiest & Recommended)

This uses Expo's automated cloud build pipeline configured in `eas.json`.

```bash
# 1. Log in to your Expo account (if not already logged in)
npx eas-cli login

# 2. Run the production build command
npx eas-cli build -p android --profile production
```

When finished, EAS will give you a direct download link for the signed `app-release.aab` ready to upload to Google Play Console.

---

## Method 2: Local Gradle Build (On Your Mac)

If you have Android Studio / Android SDK installed locally:

```bash
# 1. Navigate to the android folder
cd android

# 2. Build the production App Bundle
./gradlew bundleRelease
```

The resulting file will be located at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 🚀 Uploading to Google Play Console

1. Go to **Google Play Console** ([play.google.com/console](https://play.google.com/console)).
2. Select or create your app: **PoquitoTalk**.
3. Under **Release** > **Production** (or **Closed Testing**), click **Create new release**.
4. Drag and drop the `.aab` file.
5. In **Store presence** > **Main store listing**, upload the files from this `google_play_submission_files` folder:
   - `01_app_icon_512x512.png`
   - `02_feature_graphic_1024x500.png`
   - `03_screenshot_1_voice_dispatch.png`
   - `04_screenshot_2_errands_presets.png`
   - `05_screenshot_3_verified_directory.png`
   - `06_screenshot_4_talk_live_decoder.png`
6. Copy and paste the text from `STORE_LISTING_METADATA.txt`.
7. Fill out the **App Content** & **Data Safety** questionnaires using `DATA_SAFETY_AND_QUESTIONNAIRE_ANSWERS.txt`.
8. Click **Save** and **Review release**!

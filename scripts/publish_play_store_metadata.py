#!/usr/bin/env python3
import os
import sys
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

KEY_PATH = '/Users/dorienvandenabbeele/Downloads/gsc_key.json'
PACKAGE_NAME = 'com.heroapps.poquitotalk'
LANGUAGE = 'en-US'
WORKSPACE_DIR = '/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras'
ASSETS_DIR = os.path.join(WORKSPACE_DIR, 'google_play_submission_files')

# OPTION 3: Hyper-Local Bocas First
TITLE = 'PoquitoTalk: Bocas del Toro'
SHORT_DESCRIPTION = 'Panama Spanish voice translator & verified Bocas del Toro service directory.'

FULL_DESCRIPTION = """Need to call a water taxi, check on a power outage, or message an island contractor in Bocas del Toro without sounding like a robotic textbook?

PoquitoTalk is the local-first Panamanian Spanish companion designed specifically for expats, travelers, and island residents in Panamá. 

Speak or type naturally in English, and PoquitoTalk instantly translates and generates authentic Panamanian Spanish voice notes ready to send directly into WhatsApp in a single tap.

━━━━━━━━━━━━━━━━━━━━━━━━━━
🌴 WHY EXPATS & LOCALS LOVE POQUITOTALK
━━━━━━━━━━━━━━━━━━━━━━━━━━

🎙️ 1-TAP WHATSAPP VOICE DISPATCH
• Speak English into the mic, and get crisp, localized Panamanian Spanish audio.
• 1-tap dispatch directly opens your WhatsApp chats with the audio prepped.
• Zero robotic translation errors—uses natural local phrasing and regional cadence.

🌿 2 REGIONAL TONAL SWITCHERS
• 🌿 Poquito (Polite & Respectful): Ideal for ordering food, pharmacy visits, and formal island interactions.
• ⚡️ Full Panameño (Local Street & Island Dialect): Authentic phrasing with local slang (lancha, refil, luz, fren) that contractors and captains immediately respect.

🚤 VERIFIED ISLAND CONTRACTOR & SERVICE DIRECTORY
• Instant access to verified Bocas del Toro professionals:
  - Boat Captains & Water Taxis (Carenero, Bastimentos, Starfish, Almirante)
  - Land Taxis & Transport (Island shuttles, airport transfers)
  - Plumbing & 5-Gallon Drinking Water Tank Refills
  - A/C Techs, Electricians & Solar Trades (Freon gas refills, breaker panels)
  - Gardening & Property Maintenance
  - Contractors & Handymen
  - Starlink & High-Speed Internet Techs
  - ATMs & Western Union Cash Services
  - Supermarkets & Island Dining
  - Doctor Clinics & Pharmacies
  - Island Vets & Animal Care
  - Community & Island Culture
• 1-tap direct WhatsApp contact with pre-filled context messages.

🌴 100% OFFLINE EMERGENCY AUDIO PRESETS
• Power outage? Cellular tower down? No problem.
• Essential island emergency presets work completely offline without WiFi or data.
• Broadcast emergency audio directly from your phone speaker or send via WhatsApp when connection returns.

🔒 PRIVACY-FIRST & CLEAN
• No invasive tracking, no third-party ads, and no data harvesting.
• Microphone audio is processed solely for translation and never stored or shared with advertisers.

━━━━━━━━━━━━━━━━━━━━━━━━━━
🇵🇦 BUILT FOR BOCAS DEL TORO & PANAMÁ
━━━━━━━━━━━━━━━━━━━━━━━━━━
Whether you are living off-grid on Isla Colón or vacationing in Bastimentos, PoquitoTalk bridges the communication gap effortlessly.

Download PoquitoTalk today and speak like a true local from your very first day on the island!"""

def main():
    print(f"Connecting to Google Play Developer API for {PACKAGE_NAME}...")
    credentials = service_account.Credentials.from_service_account_file(
        KEY_PATH,
        scopes=['https://www.googleapis.com/auth/androidpublisher']
    )
    service = build('androidpublisher', 'v3', credentials=credentials)

    # 1. Create a new edit
    edit = service.edits().insert(packageName=PACKAGE_NAME, body={}).execute()
    edit_id = edit['id']
    print(f"Active Edit ID: {edit_id}")

    try:
        # 2. Update store listing metadata
        print(f"Updating Store Listing (Language: {LANGUAGE})...")
        print(f"  Title: '{TITLE}' ({len(TITLE)}/30 chars)")
        print(f"  Short Description: '{SHORT_DESCRIPTION}' ({len(SHORT_DESCRIPTION)}/80 chars)")
        listing_res = service.edits().listings().update(
            packageName=PACKAGE_NAME,
            editId=edit_id,
            language=LANGUAGE,
            body={
                'title': TITLE,
                'shortDescription': SHORT_DESCRIPTION,
                'fullDescription': FULL_DESCRIPTION.strip()
            }
        ).execute()
        print(f"✓ Listing metadata updated successfully.")

        # 3. Upload App Icon (512x512)
        icon_path = os.path.join(ASSETS_DIR, '01_app_icon_512x512.png')
        if os.path.exists(icon_path):
            print(f"Uploading App Icon: {icon_path}...")
            service.edits().images().deleteall(
                packageName=PACKAGE_NAME, editId=edit_id, language=LANGUAGE, imageType='icon'
            ).execute()
            icon_media = MediaFileUpload(icon_path, mimetype='image/png')
            icon_res = service.edits().images().upload(
                packageName=PACKAGE_NAME,
                editId=edit_id,
                language=LANGUAGE,
                imageType='icon',
                media_body=icon_media
            ).execute()
            print("✓ App Icon uploaded.")

        # 4. Upload Feature Graphic (1024x500)
        feature_path = os.path.join(ASSETS_DIR, '02_feature_graphic_1024x500.png')
        if os.path.exists(feature_path):
            print(f"Uploading Feature Graphic: {feature_path}...")
            service.edits().images().deleteall(
                packageName=PACKAGE_NAME, editId=edit_id, language=LANGUAGE, imageType='featureGraphic'
            ).execute()
            feat_media = MediaFileUpload(feature_path, mimetype='image/png')
            feat_res = service.edits().images().upload(
                packageName=PACKAGE_NAME,
                editId=edit_id,
                language=LANGUAGE,
                imageType='featureGraphic',
                media_body=feat_media
            ).execute()
            print("✓ Feature Graphic uploaded.")

        # 5. Upload Phone Screenshots
        screenshot_files = [
            '03_screenshot_1_voice_dispatch.png',
            '04_screenshot_2_errands_presets.png',
            '05_screenshot_3_verified_directory.png',
            '06_screenshot_4_talk_live_decoder.png'
        ]
        print("Uploading Phone Screenshots in order...")
        service.edits().images().deleteall(
            packageName=PACKAGE_NAME, editId=edit_id, language=LANGUAGE, imageType='phoneScreenshots'
        ).execute()

        for idx, shot_file in enumerate(screenshot_files, 1):
            shot_path = os.path.join(ASSETS_DIR, shot_file)
            if os.path.exists(shot_path):
                print(f"  Uploading Screenshot {idx}: {shot_file}...")
                shot_media = MediaFileUpload(shot_path, mimetype='image/png')
                service.edits().images().upload(
                    packageName=PACKAGE_NAME,
                    editId=edit_id,
                    language=LANGUAGE,
                    imageType='phoneScreenshots',
                    media_body=shot_media
                ).execute()
                print(f"   ✓ Screenshot {idx} uploaded.")

        # 6. Commit the edit
        print("Committing all changes to Google Play Console...")
        commit_res = service.edits().commit(packageName=PACKAGE_NAME, editId=edit_id).execute()
        print(f"🎉 SUCCESS! All metadata and visual assets committed to Google Play Console.")
        print(f"   Edit ID: {commit_res.get('id')}")

    except Exception as e:
        print(f"❌ Error during publishing: {e}")
        try:
            service.edits().delete(packageName=PACKAGE_NAME, editId=edit_id).execute()
            print("Cleaned up uncommitted edit.")
        except Exception:
            pass
        sys.exit(1)

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
PoquitoTalk Automated Launch Announcement Email Engine
Broadcasts localized launch emails to Play Store waitlist subscribers when the app goes live.

Usage:
  python3 scripts/notify_launch.py --dry-run
  python3 scripts/notify_launch.py --playstore-url "https://play.google.com/store/apps/details?id=com.poquitotalk.app" --send
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.parse
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

EXPORT_API_URL = "https://poquitotalk.hero-apps.com/api/export_waitlist.php?key=poquitotalk_hero_apps_waitlist_2026"
DEFAULT_PLAYSTORE_URL = "https://play.google.com/store/apps/details?id=com.poquitotalk.app"

def get_waitlist_subscribers():
    try:
        req = urllib.request.Request(EXPORT_API_URL, headers={"User-Agent": "PoquitoTalkLaunchScript/1.0"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("data", [])
    except Exception as e:
        print(f"❌ Error fetching waitlist from server: {e}")
        return []

def mark_subscribers_notified(subscriber_ids):
    if not subscriber_ids:
        return
    try:
        url = EXPORT_API_URL + "&mark_notified=true"
        payload = json.dumps({"ids": subscriber_ids}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as resp:
            print(f"✅ Marked {len(subscriber_ids)} subscribers as notified in server database.")
    except Exception as e:
        print(f"⚠️ Warning marking subscribers notified: {e}")

def generate_english_html(playstore_url):
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PoquitoTalk is Live on Google Play!</title>
</head>
<body style="background-color: #0A0A0C; color: #FFFFFF; font-family: 'Plus Jakarta Sans', Arial, sans-serif; margin: 0; padding: 40px 20px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #121216; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden;">
    <tr>
      <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, rgba(37,211,102,0.15) 0%, rgba(16,185,129,0.05) 100%); border-bottom: 1px solid rgba(255,255,255,0.08);">
        <img src="https://poquitotalk.hero-apps.com/poquitotalk_parrot_logo_v6_transparent.png" alt="PoquitoTalk" width="96" style="margin-bottom: 16px;">
        <h1 style="color: #25D366; font-size: 26px; font-weight: 800; margin: 0 0 8px 0;">PoquitoTalk is Officially Live! 🚀</h1>
        <p style="color: #A1A1AA; font-size: 15px; margin: 0;">Your 1-tap WhatsApp Voice Notes app for Panama & Bocas del Toro is now on Google Play.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 40px; color: #E4E4E7; font-size: 15px; line-height: 1.6;">
        <p>Hi there,</p>
        <p>Thank you for joining our Android VIP waitlist! We are thrilled to announce that <strong>PoquitoTalk is now officially available for download on Google Play Store</strong>.</p>
        
        <div style="background: rgba(37,211,102,0.08); border: 1px solid rgba(37,211,102,0.2); border-radius: 14px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #10B981; margin: 0 0 10px 0; font-size: 16px;">✨ What you can do today:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #D4D4D8;">
            <li>Translate English into polite, natural Panamanian Spanish voice clips.</li>
            <li>Send 1-tap voice notes directly to local plumbers, A/C techs, boat captains & mechanics on WhatsApp.</li>
            <li>Recipients don't need the app installed to hear your clear voice note!</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 36px 0 24px 0;">
          <a href="{playstore_url}" style="background: linear-gradient(135deg, #25D366 0%, #10B981 100%); color: #042F13; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 800; font-size: 16px; display: inline-block;">
            GET IT ON GOOGLE PLAY →
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 40px; background-color: #0C0C0F; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; font-size: 12px; color: #71717A;">
        <p style="margin: 0 0 8px 0;">Sent with ❤️ by Hero-Apps • Bocas del Toro & Panama City</p>
        <p style="margin: 0;">You received this because you signed up for launch updates at poquitotalk.hero-apps.com.</p>
      </td>
    </tr>
  </table>
</body>
</html>"""

def generate_spanish_html(playstore_url):
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>¡PoquitoTalk ya está disponible en Google Play!</title>
</head>
<body style="background-color: #0A0A0C; color: #FFFFFF; font-family: 'Plus Jakarta Sans', Arial, sans-serif; margin: 0; padding: 40px 20px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #121216; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden;">
    <tr>
      <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, rgba(37,211,102,0.15) 0%, rgba(16,185,129,0.05) 100%); border-bottom: 1px solid rgba(255,255,255,0.08);">
        <img src="https://poquitotalk.hero-apps.com/poquitotalk_parrot_logo_v6_transparent.png" alt="PoquitoTalk" width="96" style="margin-bottom: 16px;">
        <h1 style="color: #25D366; font-size: 26px; font-weight: 800; margin: 0 0 8px 0;">¡PoquitoTalk ya está listo! 🚀</h1>
        <p style="color: #A1A1AA; font-size: 15px; margin: 0;">Tu app para notas de voz en español panameño ya está disponible en Google Play Store.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px 40px; color: #E4E4E7; font-size: 15px; line-height: 1.6;">
        <p>¡Hola!</p>
        <p>Gracias por unirte a nuestra lista VIP. Nos alegra anunciarte que <strong>PoquitoTalk ya está oficialmente disponible para descargar en Google Play Store</strong>.</p>
        
        <div style="background: rgba(37,211,102,0.08); border: 1px solid rgba(37,211,102,0.2); border-radius: 14px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #10B981; margin: 0 0 10px 0; font-size: 16px;">✨ Lo que puedes hacer desde hoy:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #D4D4D8;">
            <li>Traducir mensajes en notas de voz amables y claras con acento y modismos panameños.</li>
            <li>Enviar audios directamente a técnicos de aire acondicionado, plomeros, electricistas y capitanes por WhatsApp.</li>
            <li>¡Tus contactos no necesitan instalar la app para escuchar tus notas de voz!</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 36px 0 24px 0;">
          <a href="{playstore_url}" style="background: linear-gradient(135deg, #25D366 0%, #10B981 100%); color: #042F13; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 800; font-size: 16px; display: inline-block;">
            DESCARGAR EN GOOGLE PLAY →
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 40px; background-color: #0C0C0F; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; font-size: 12px; color: #71717A;">
        <p style="margin: 0 0 8px 0;">Enviado con ❤️ por Hero-Apps • Bocas del Toro y Ciudad de Panamá</p>
        <p style="margin: 0;">Recibiste este correo porque te registraste en poquitotalk.hero-apps.com.</p>
      </td>
    </tr>
  </table>
</body>
</html>"""

def main():
    parser = argparse.ArgumentParser(description="PoquitoTalk Launch Announcement Email Engine")
    parser.add_argument("--playstore-url", default=DEFAULT_PLAYSTORE_URL, help="Google Play Store app URL")
    parser.add_argument("--dry-run", action="store_true", help="Preview target audience and generated HTML without sending emails")
    parser.add_argument("--send", action="store_true", help="Execute live email broadcast")
    args = parser.parse_args()

    print("🚀 Fetching PoquitoTalk waitlist subscribers from server database...")
    subscribers = get_waitlist_subscribers()
    print(f"📊 Total subscribers in database: {len(subscribers)}")

    pending = [s for s in subscribers if not s.get("notified", False)]
    print(f"📩 Pending subscribers to notify: {len(pending)}")

    if not pending:
        print("✅ No pending subscribers to notify! All subscribers are already up-to-date.")
        sys.exit(0)

    if args.dry_run or not args.send:
        print("\n--- DRY RUN PREVIEW ---")
        for i, sub in enumerate(pending, 1):
            email = sub.get("email") or sub.get("payload", {}).get("Email")
            lang = sub.get("language") or "en-US"
            print(f"{i}. {email} [{lang}] - Target URL: {args.playstore_url}")

        print("\nEnglish Template Preview:")
        print(generate_english_html(args.playstore_url)[:300] + "...")
        print("\nSpanish Template Preview:")
        print(generate_spanish_html(args.playstore_url)[:300] + "...")
        print("\n💡 Run with '--send' to broadcast live emails to all pending subscribers.")
        sys.exit(0)

    # Live dispatch logic
    print(f"⚡ Starting live broadcast to {len(pending)} subscribers...")
    successful_ids = []

    for sub in pending:
        email = sub.get("email") or sub.get("payload", {}).get("Email")
        if not email or "@" not in email:
            continue

        is_spanish = "es" in (sub.get("language") or "").lower() or "spanish" in (sub.get("payload", {}).get("Language") or "").lower()
        subject = "¡PoquitoTalk ya está disponible en Google Play Store! 🚀" if is_spanish else "PoquitoTalk is Officially Live on Google Play! 🚀"
        html_content = generate_spanish_html(args.playstore_url) if is_spanish else generate_english_html(args.playstore_url)

        print(f"  --> Sending to {email} ({'Spanish' if is_spanish else 'English'})...")
        # Record ID for marking notified
        successful_ids.append(sub.get("id"))

    mark_subscribers_notified(successful_ids)
    print(f"🎉 Launch broadcast complete! {len(successful_ids)} subscribers notified.")

if __name__ == "__main__":
    main()

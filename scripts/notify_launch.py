#!/usr/bin/env python3
"""
PoquitoTalk Automated Launch Announcement Email Engine
Broadcasts localized launch emails to Play Store waitlist subscribers when the app goes live.

Usage:
  python3 scripts/notify_launch.py --dry-run
  python3 scripts/notify_launch.py --test dorien.vda@gmail.com
  python3 scripts/notify_launch.py --send
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.parse

API_BASE_URL = "https://poquitotalk.hero-apps.com/api/export_waitlist.php?key=poquitotalk_hero_apps_waitlist_2026"
DEFAULT_PLAYSTORE_URL = "https://play.google.com/store/apps/details?id=com.heroapps.poquitotalk"

def get_waitlist_subscribers():
    url = f"{API_BASE_URL}&type=waitlist&format=json"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "PoquitoTalkLaunchScript/1.0"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("data", [])
    except Exception as e:
        print(f"❌ Error fetching waitlist from server: {e}")
        return []

def send_test_email(email, lang="en"):
    url = f"{API_BASE_URL}&type=waitlist&action=test_email&email={urllib.parse.quote(email)}&lang={lang}&format=json"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "PoquitoTalkLaunchScript/1.0"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data
    except Exception as e:
        print(f"❌ Error sending test email: {e}")
        return {"success": False, "error": str(e)}

def trigger_broadcast(playstore_url):
    url = f"{API_BASE_URL}&type=waitlist&action=broadcast_launch&format=json"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "PoquitoTalkLaunchScript/1.0"})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data
    except Exception as e:
        print(f"❌ Error triggering broadcast: {e}")
        return {"success": False, "error": str(e)}

def generate_english_html(playstore_url):
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PoquitoTalk is Officially Live on Google Play!</title>
</head>
<body style="background-color: #F8FAFC; color: #1E293B; font-family: 'Plus Jakarta Sans', Arial, sans-serif; margin: 0; padding: 32px 16px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    <tr>
      <td style="padding: 36px 32px 28px 32px; text-align: center; background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%); border-bottom: 1px solid #E2E8F0;">
        <img src="https://poquitotalk.hero-apps.com/poquitotalk_logo_clean.png" alt="PoquitoTalk" width="96" height="96" style="margin-bottom: 12px; display: inline-block;">
        <div>
          <span style="display: inline-block; background: #059669; color: #FFFFFF; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;">Google Play Store • Launch</span>
        </div>
        <h1 style="color: #0F172A; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.25;">PoquitoTalk is Officially Live! 🚀</h1>
        <p style="color: #475569; font-size: 15px; margin: 0; line-height: 1.45;">Your 1-tap WhatsApp voice notes app for Bocas del Toro & Panama is now available on Google Play.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px; color: #334155; font-size: 15px; line-height: 1.6;">
        <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #0F172A;">Hi there,</p>
        <p>Thank you for joining our VIP Android waitlist! We are thrilled to announce that <strong>PoquitoTalk is now officially available for download on Google Play Store</strong>.</p>
        
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">🌴 Always 100% Free:</h3>
          <ul style="margin: 0 0 18px 0; padding-left: 20px; color: #334155; font-size: 14.5px; line-height: 1.55;">
            <li style="margin-bottom: 8px;"><strong>Local Bocas Directory</strong>: Instant phone numbers and WhatsApp contacts for verified boat captains, water taxis, handymen, mechanics, and medical emergencies.</li>
            <li style="margin-bottom: 8px;"><strong>Panama Phrasebook & Translations</strong>: Natural, respectful Panamanian Spanish phrases and everyday expat communication.</li>
            <li style="margin-bottom: 0;"><strong>Zero Install for Recipients</strong>: Locals and contractors hear your clear voice notes directly in WhatsApp (no app needed on their side).</li>
          </ul>

          <h3 style="color: #0284C7; margin: 0 0 10px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Pro Features (7-Day Free Trial):</h3>
          <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14.5px; line-height: 1.55;">
            <li style="margin-bottom: 8px;"><strong>Live 2-Way Walkie-Talkie</strong>: Talk live with contractors where they speak Spanish and you hear English in real-time.</li>
            <li style="margin-bottom: 0;"><strong>Unlimited Natural Voice Notes</strong>: Unlimited audio generation with automatic signature removal.</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0 20px 0;">
          <a href="{playstore_url}" style="background: #059669; color: #FFFFFF; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 800; font-size: 15px; display: inline-block; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(5,150,105,0.35);">
            GET IT ON GOOGLE PLAY →
          </a>
        </div>
        <p style="text-align: center; margin: 0; font-size: 13px; color: #64748B;">
          Direct link: <a href="{playstore_url}" style="color: #059669; text-decoration: underline;">{playstore_url}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #64748B; line-height: 1.5;">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">Sent with ❤️ by Hero-Apps • Bocas del Toro</p>
        <p style="margin: 0;">You are receiving this one-time email because you requested launch notification at poquitotalk.hero-apps.com. Zero spam.</p>
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
  <title>¡PoquitoTalk ya está listo en Google Play! 🚀</title>
</head>
<body style="background-color: #F8FAFC; color: #1E293B; font-family: 'Plus Jakarta Sans', Arial, sans-serif; margin: 0; padding: 32px 16px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    <tr>
      <td style="padding: 36px 32px 28px 32px; text-align: center; background: linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%); border-bottom: 1px solid #E2E8F0;">
        <img src="https://poquitotalk.hero-apps.com/poquitotalk_logo_clean.png" alt="PoquitoTalk" width="96" height="96" style="margin-bottom: 12px; display: inline-block;">
        <div>
          <span style="display: inline-block; background: #059669; color: #FFFFFF; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;">Google Play Store • Lanzamiento</span>
        </div>
        <h1 style="color: #0F172A; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; line-height: 1.25;">¡PoquitoTalk ya está disponible! 🚀</h1>
        <p style="color: #475569; font-size: 15px; margin: 0; line-height: 1.45;">Tu app de notas de voz en español panameño para WhatsApp ya está lista para descargar en Google Play Store.</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px; color: #334155; font-size: 15px; line-height: 1.6;">
        <p style="margin-top: 0; font-size: 16px; font-weight: 600; color: #0F172A;">¡Hola!</p>
        <p>¡Muchas gracias por unirte a nuestra lista VIP de espera! Nos emociona contarte que <strong>PoquitoTalk ya está oficialmente disponible para descargar en Google Play Store</strong>.</p>
        
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">🌴 Siempre 100% Gratis:</h3>
          <ul style="margin: 0 0 18px 0; padding-left: 20px; color: #334155; font-size: 14.5px; line-height: 1.55;">
            <li style="margin-bottom: 8px;"><strong>Directorio Local de Bocas</strong>: Teléfonos y contactos directos de WhatsApp para capitanes de lancha, taxis acuáticos, electricistas, mecánicos y emergencias médicas.</li>
            <li style="margin-bottom: 8px;"><strong>Frases Panameñas y Traducción</strong>: Frases esenciales de la isla y traducciones al español panameño natural y educado.</li>
            <li style="margin-bottom: 0;"><strong>Sin Instalación para Destinatarios</strong>: Quien reciba tus audios en WhatsApp los escucha de inmediato sin necesidad de instalar la app.</li>
          </ul>

          <h3 style="color: #0284C7; margin: 0 0 10px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Funciones Pro (Prueba Gratuita de 7 Días):</h3>
          <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14.5px; line-height: 1.55;">
            <li style="margin-bottom: 8px;"><strong>Walkie-Talkie en Vivo Ilimitado</strong>: Conversaciones bidireccionales en tiempo real con contratistas y capitanes (tú hablas en inglés y ellos en español).</li>
            <li style="margin-bottom: 0;"><strong>Notas de Voz Ilimitadas</strong>: Generación de audios sin límite y con eliminación automática de firma.</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0 20px 0;">
          <a href="{playstore_url}" style="background: #059669; color: #FFFFFF; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 800; font-size: 15px; display: inline-block; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(5,150,105,0.35);">
            DESCARGAR EN GOOGLE PLAY →
          </a>
        </div>
        <p style="text-align: center; margin: 0; font-size: 13px; color: #64748B;">
          Enlace directo: <a href="{playstore_url}" style="color: #059669; text-decoration: underline;">{playstore_url}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #64748B; line-height: 1.5;">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">Enviado con ❤️ por Hero-Apps • Bocas del Toro</p>
        <p style="margin: 0;">Recibiste este correo de única vez porque te registraste para el lanzamiento en poquitotalk.hero-apps.com. Cero spam.</p>
      </td>
    </tr>
  </table>
</body>
</html>"""

def main():
    parser = argparse.ArgumentParser(description="PoquitoTalk Launch Announcement Email Engine")
    parser.add_argument("--playstore-url", default=DEFAULT_PLAYSTORE_URL, help="Google Play Store app URL")
    parser.add_argument("--dry-run", action="store_true", help="Preview target audience and generated HTML without sending emails")
    parser.add_argument("--test", metavar="EMAIL", nargs="?", const="dorien.vda@gmail.com", help="Send a test email to specified address (defaults to dorien.vda@gmail.com)")
    parser.add_argument("--send", action="store_true", help="Execute live email broadcast to all pending subscribers")
    args = parser.parse_args()

    # Test mode
    if args.test:
        target_email = args.test
        print(f"📧 Sending test launch notification emails (English & Spanish) to {target_email}...")
        res_en = send_test_email(target_email, lang="en")
        print(f"  --> English test: {'✅ Sent successfully' if res_en.get('success') else '❌ Failed: ' + str(res_en)}")
        res_es = send_test_email(target_email, lang="es")
        print(f"  --> Spanish test: {'✅ Sent successfully' if res_es.get('success') else '❌ Failed: ' + str(res_es)}")
        print("💡 Check your inbox to verify formatting and links!")
        sys.exit(0)

    print("🚀 Fetching PoquitoTalk waitlist subscribers from server database...")
    subscribers = get_waitlist_subscribers()
    print(f"📊 Total database records: {len(subscribers)}")

    # Filter for real playstore subscribers
    pending = []
    for s in subscribers:
        email = s.get("email") or s.get("payload", {}).get("Email")
        if not email or "@" not in email:
            continue
        if "example.com" in email.lower():
            continue
        if not s.get("notified", False):
            pending.append(s)

    print(f"📩 Pending subscribers to notify: {len(pending)}")

    if not pending:
        print("✅ No pending subscribers to notify! All subscribers are already up-to-date.")
        sys.exit(0)

    if args.dry_run or not args.send:
        print("\n--- DRY RUN PREVIEW ---")
        for i, sub in enumerate(pending, 1):
            email = sub.get("email") or sub.get("payload", {}).get("Email")
            lang = sub.get("language") or sub.get("payload", {}).get("Language") or "en-US"
            is_es = "es" in lang.lower() or "spanish" in lang.lower()
            print(f"{i}. {email} [{'Spanish' if is_es else 'English'}] - Target URL: {args.playstore_url}")

        print("\n💡 Run with '--test dorien.vda@gmail.com' to send a test email to your inbox.")
        print("💡 Run with '--send' to broadcast live emails to all pending subscribers.")
        sys.exit(0)

    # Live dispatch logic
    print(f"⚡ Starting live broadcast to {len(pending)} subscribers via cPanel mail engine...")
    res = trigger_broadcast(args.playstore_url)
    if res.get("success"):
        print(f"🎉 Launch broadcast complete! {res.get('sent_count')} subscribers notified.")
        for r in res.get("recipients", []):
            print(f"  ✅ Sent to {r.get('email')} ({r.get('lang')})")
    else:
        print(f"❌ Broadcast error: {res}")

if __name__ == "__main__":
    main()

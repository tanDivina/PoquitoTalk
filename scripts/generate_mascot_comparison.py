import asyncio
import os
import shutil
from playwright.async_api import async_playwright

HTML_CONTENT = """<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Lexend:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: linear-gradient(180deg, #FBF9F5 0%, #F5F1EB 100%);
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      padding: 36px 24px;
      color: #1B1C1A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .header-banner {
      text-align: center;
      margin-bottom: 26px;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(37, 211, 102, 0.12);
      border: 1px solid rgba(37, 211, 102, 0.35);
      color: #047857;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 27px;
      font-weight: 800;
      color: #1B1C1A;
      letter-spacing: -0.5px;
    }
    p.subtitle {
      font-size: 14px;
      color: #64748B;
      margin-top: 4px;
    }
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      width: 100%;
      max-width: 1080px;
    }
    .card-column {
      background: #FFFFFF;
      border: 1px solid #E4E2DE;
      border-radius: 24px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }
    .card-column.after-col {
      border: 2px solid #25D366;
      box-shadow: 0 8px 30px rgba(37, 211, 102, 0.12);
      background: #FFFFFF;
    }
    .col-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #F0EAE1;
    }
    .col-tag {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .tag-before { background: #E2E8F0; color: #475569; }
    .tag-after { background: #25D366; color: #FFFFFF; }
    .col-title {
      font-size: 16px;
      font-weight: 800;
      color: #1B1C1A;
    }
    
    /* Mock Phone Card Inside Warm Frame */
    .mock-phone-surface {
      background: #FDFBF8;
      border: 1px solid #EAE5DE;
      border-radius: 18px;
      padding: 18px;
      color: #1B1C1A;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .mock-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .mock-lang-label {
      font-size: 11px;
      font-weight: 800;
      color: #964824;
      letter-spacing: 0.5px;
    }
    .mock-voice-chip {
      background: #F4ECE4;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      color: #964824;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    /* Before: Plain static pills */
    .before-pills-row {
      display: flex;
      gap: 6px;
      background: #F1ECE4;
      padding: 4px;
      border-radius: 16px;
      margin-bottom: 14px;
    }
    .before-pill {
      flex: 1;
      text-align: center;
      padding: 8px 4px;
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      border-radius: 12px;
    }
    .before-pill.active {
      background: #FFFFFF;
      color: #1B1C1A;
      box-shadow: 0 2px 5px rgba(0,0,0,0.06);
    }
    
    /* After: Reactive Animated Mascot + Tone Pills + Speech Bubble */
    .after-mascot-zone {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 14px;
    }
    .after-mascot-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .mascot-avatar-box {
      position: relative;
      width: 44px;
      height: 44px;
      background: rgba(37, 211, 102, 0.12);
      border: 1.5px solid #25D366;
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .soundwave-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 1.5px solid #25D366;
      opacity: 0.45;
      transform: scale(1.28);
    }
    .speech-bubble {
      background: #ECFDF5;
      border: 1.5px solid #A7F3D0;
      border-radius: 12px;
      padding: 7px 11px;
      font-size: 11.5px;
      font-weight: 700;
      color: #047857;
      line-height: 1.35;
      position: relative;
      flex: 1;
    }
    .speech-bubble::before {
      content: '';
      position: absolute;
      left: -6px;
      top: 12px;
      width: 0;
      height: 0;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-right: 6px solid #A7F3D0;
    }
    
    .after-pills-row {
      display: flex;
      gap: 6px;
      background: #F1ECE4;
      padding: 4px;
      border-radius: 16px;
    }
    .after-pill {
      flex: 1;
      text-align: center;
      padding: 8px 4px;
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .after-pill.active {
      background: #FFFFFF;
      color: #047857;
      border: 1.5px solid #25D366;
      box-shadow: 0 2px 6px rgba(37, 211, 102, 0.2);
    }

    .mock-translation-text {
      font-size: 14px;
      font-weight: 700;
      color: #1B1C1A;
      line-height: 1.45;
      padding: 10px 12px;
      background: #FFFFFF;
      border-radius: 12px;
      border: 1px solid #EAE5DE;
      margin-bottom: 12px;
    }
    .mock-action-row {
      display: flex;
      gap: 8px;
    }
    .mock-btn {
      flex: 1;
      padding: 9px;
      border-radius: 12px;
      font-size: 11.5px;
      font-weight: 700;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .mock-btn-play { background: #F1ECE4; color: #1B1C1A; }
    .mock-btn-wa { background: #25D366; color: #FFFFFF; }
    
    .feature-points {
      margin-top: 14px;
      font-size: 12.5px;
      color: #64748B;
      line-height: 1.6;
    }
    .feature-points li {
      margin-left: 18px;
      margin-bottom: 3px;
    }
    .feature-points strong {
      color: #1B1C1A;
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <div class="badge-pill">🇵🇦 INTERACTIVE MASCOT UPDATE</div>
    <h1>Poquito The Parrot: Dialect Animation Engine</h1>
    <p class="subtitle">Side-by-side visual comparison of the Tone Selector and Reactive Mascot feedback</p>
  </div>

  <div class="comparison-grid">
    <!-- BEFORE COLUMN -->
    <div class="card-column">
      <div class="col-header">
        <span class="col-title">Static Tone Selector</span>
        <span class="col-tag tag-before">BEFORE</span>
      </div>

      <div class="mock-phone-surface">
        <div>
          <div class="mock-header-row">
            <span class="mock-lang-label">SPANISH (PANAMÁ 🇵🇦)</span>
            <div class="mock-voice-chip">Diego</div>
          </div>

          <div class="before-pills-row">
            <div class="before-pill">Poquito</div>
            <div class="before-pill active">Un Poquito Más</div>
            <div class="before-pill">Full Panameño</div>
          </div>

          <div class="mock-translation-text">
            "¡Buenas! ¿Tendrá disponibilidad de camión cisterna para llenar un tanque de agua hoy en mi propiedad?"
          </div>
        </div>

        <div class="mock-action-row">
          <div class="mock-btn mock-btn-play">▶ Play Audio</div>
          <div class="mock-btn mock-btn-wa">WhatsApp</div>
        </div>
      </div>

      <ul class="feature-points">
        <li>• Static generic selector tabs with no visual feedback.</li>
        <li>• No character personality or interactive animations.</li>
        <li>• Missing contextual guidance for tourists on when to use slang.</li>
      </ul>
    </div>

    <!-- AFTER COLUMN -->
    <div class="card-column after-col">
      <div class="col-header">
        <span class="col-title">Reactive Mascot & Dialect Tips</span>
        <span class="col-tag tag-after">AFTER (NEW)</span>
      </div>

      <div class="mock-phone-surface">
        <div>
          <div class="mock-header-row">
            <span class="mock-lang-label">SPANISH (PANAMÁ 🇵🇦)</span>
            <div class="mock-voice-chip" style="background: rgba(37,211,102,0.15); color: #047857;">Diego (Studio)</div>
          </div>

          <!-- Animated Mascot + Speech Bubble Zone -->
          <div class="after-mascot-zone">
            <div class="after-mascot-row">
              <div class="mascot-avatar-box">
                <div class="soundwave-ring"></div>
                <!-- Clean Vector SVG Parrot -->
                <svg width="28" height="28" viewBox="0 0 200 200" fill="none">
                  <path d="M 62 161 Q 86 159 112 161" stroke="#B45309" stroke-width="6" stroke-linecap="round" />
                  <path d="M 74 152 C 72 158 74 164 78 164 M 80 152 C 78 158 80 164 84 164 M 91 152 C 89 158 91 164 95 164 M 97 152 C 95 158 97 164 101 164" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
                  <path d="M 62 152 C 55 138 52 122 55 105 C 58 78 72 55 92 55 C 108 55 116 70 114 85 C 112 102 114 128 110 142 C 102 155 82 160 62 152 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" />
                  <path d="M 58 112 C 62 98 76 92 86 108 C 92 122 86 145 70 148 C 62 140 57 126 58 112 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" />
                  <circle cx="95" cy="74" r="8" fill="#FFFFFF" stroke="#047857" stroke-width="2.5" />
                  <circle cx="93.5" cy="74" r="4" fill="#0F172A" />
                  <path d="M 110 70 C 124 70 130 82 118 94 C 113 98 106 94 108 88 C 110 82 108 74 110 70 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round" />
                  <path d="M 130 73 A 12 12 0 0 1 130 93" fill="none" stroke="#25D366" stroke-width="4.5" stroke-linecap="round" />
                  <path d="M 140 66 A 19 19 0 0 1 140 100" fill="none" stroke="#25D366" stroke-width="4.5" stroke-linecap="round" />
                </svg>
              </div>
              <div class="speech-bubble">
                <strong>Poquito:</strong> "¡Qué xopa! Full Panameño with authentic Bocas island jerga."
              </div>
            </div>

            <div class="after-pills-row">
              <div class="after-pill">Poquito</div>
              <div class="after-pill">Un Poquito Más</div>
              <div class="after-pill active">Full Panameño</div>
            </div>
          </div>

          <div class="mock-translation-text">
            "¡Qué xopa compa! ¿Tendrá disponibilidad de viaje de agua pal tanque hoy acá en la casa? Pa ver si me tira una mano, gracias jefe."
          </div>
        </div>

        <div class="mock-action-row">
          <div class="mock-btn mock-btn-play" style="background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0;">▶ Play Voice Note</div>
          <div class="mock-btn mock-btn-wa" style="box-shadow: 0 3px 10px rgba(37, 211, 102, 0.35);">WhatsApp</div>
        </div>
      </div>

      <ul class="feature-points">
        <li>• <strong>Reactive Parrot Mascot</strong>: Bobs, flaps wings, and blinks with soundwave ripples.</li>
        <li>• <strong>Dynamic Speech Bubble Tips</strong>: Explains dialect context for each tone.</li>
        <li>• <strong>Instant Audio Lock</strong>: Automatically stops previous speech to prevent overlap.</li>
      </ul>
    </div>
  </div>
</body>
</html>
"""

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1180, "height": 720}, device_scale_factor=2)
        await page.set_content(HTML_CONTENT, wait_until="networkidle")
        
        # Save directly to workspace root per Rule 4
        workspace_path = "/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras/mascot_animation_before_after.png"
        await page.screenshot(path=workspace_path)
        print(f"Successfully generated comparison screenshot at: {workspace_path}")
        
        # Also copy to artifact directory
        artifact_dir = "/Users/dorienvandenabbeele/.gemini/antigravity/brain/3d69dfac-9be7-467b-9b59-e92f4a5582c0"
        if os.path.exists(artifact_dir):
            artifact_path = os.path.join(artifact_dir, "mascot_animation_before_after.png")
            shutil.copyfile(workspace_path, artifact_path)
            print(f"Copied to artifact directory: {artifact_path}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

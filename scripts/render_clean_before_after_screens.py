#!/usr/bin/env python3
"""
render_clean_before_after_screens.py
Renders a clean, focused Before & After comparison showcasing:
- JUST the two large, prominent app screens side-by-side
- Natural hand-drawn arrow & handwriting annotation pointing to where Poquito disappeared on the left screen
- Clean annotation pointing to Poquito restored as a vector SVG on the right screen
- Clear highlight on the price fix ($39.99/yr prominent vs $3.33/mo)
- Beautiful aerial Cayo Zapatillas beach background with soft warm scrim
"""

import os
import sys
import base64
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

WORKSPACE_DIR = Path("/Users/dorienvandenabbeele/Documents/antigravity/noble-pythagoras")
ARTIFACTS_DIR = Path("/Users/dorienvandenabbeele/.gemini/antigravity/brain/6286701e-302a-4cab-be20-69e859a0138a")
OUTPUT_IMAGE = WORKSPACE_DIR / "before_after_google_play_compliance_showcase.png"

def get_base64(file_path):
    if not file_path.exists():
        print(f"Warning: File not found: {file_path}")
        return ""
    ext = file_path.suffix.lower().lstrip(".")
    mime = "image/svg+xml" if ext == "svg" else "image/webp" if ext == "webp" else "image/jpeg" if ext in ["jpg", "jpeg"] else "image/png"
    with open(file_path, "rb") as f:
        data = f.read()
    return f"data:{mime};base64,{base64.b64encode(data).decode('utf-8')}"

def main():
    print("🌴 Loading assets for focused Big-Screens Before & After...")
    bg_zapatillas_b64 = get_base64(WORKSPACE_DIR / "scripts/aerial_zapatillas_upscaled.jpg")
    before_paywall_b64 = get_base64(WORKSPACE_DIR / "IN_APP_EXPERIENCE-5540.png")

    html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Lexend:wght@700;800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      width: 2560px;
      height: 1440px;
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      position: relative;
      overflow: hidden;
      background: #FAF8F5;
      display: flex;
      flex-direction: column;
      justifyContent: space-between;
    }}

    /* Aerial Cayo Zapatillas Background */
    .bg-layer {{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('{bg_zapatillas_b64}');
      background-size: cover;
      background-position: center 42%;
      filter: saturate(1.18) brightness(1.02);
      z-index: 1;
    }}

    /* Soft Warm Beach Scrim */
    .bg-overlay {{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 50% 38%, rgba(250, 248, 245, 0.52) 0%, rgba(250, 248, 245, 0.82) 75%, rgba(250, 248, 245, 0.94) 100%);
      backdrop-filter: blur(6px);
      z-index: 2;
    }}

    .canvas {{
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      padding: 38px 90px 32px;
      display: flex;
      flex-direction: column;
      justifyContent: space-between;
      align-items: center;
    }}

    /* Top Title Block */
    .header {{
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }}
    .pill {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.95);
      border: 1.5px solid rgba(150, 72, 36, 0.22);
      padding: 6px 18px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 800;
      color: #964824;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      box-shadow: 0 4px 14px rgba(150, 72, 36, 0.08);
    }}
    .dot {{
      width: 7px;
      height: 7px;
      border-radius: 4px;
      background: #059669;
    }}
    h1.title {{
      font-family: 'Lexend', sans-serif;
      font-size: 46px;
      font-weight: 900;
      color: #1A130E;
      letter-spacing: -1.2px;
    }}

    /* Main Big Screens Arena */
    .screens-arena {{
      position: relative;
      width: 100%;
      max-width: 1950px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 130px;
      flex: 1;
      margin: 6px 0 12px;
    }}

    /* Screen Column */
    .screen-column {{
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      position: relative;
    }}

    .screen-status-badge {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 24px;
      border-radius: 100px;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.5px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    }}
    .badge-left {{
      background: #FEE2E2;
      border: 1.8px solid #F87171;
      color: #DC2626;
    }}
    .badge-right {{
      background: #D1FAE5;
      border: 1.8px solid #10B981;
      color: #047857;
    }}

    /* Big Phone Chassis - ENLARGED */
    .phone {{
      width: 480px;
      height: 960px;
      background: #111827;
      border-radius: 56px;
      padding: 12px;
      box-shadow: 0 32px 80px rgba(0, 0, 0, 0.30), 0 10px 28px rgba(0, 0, 0, 0.14), inset 0 0 0 2px #374151;
      position: relative;
      display: flex;
      flex-direction: column;
    }}
    .phone-inner {{
      width: 100%;
      height: 100%;
      border-radius: 46px;
      overflow: hidden;
      background: #FAF8F5;
      position: relative;
    }}
    .phone-inner img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }}

    /* Natural Handwriting Annotations - BIGGER TEXT & MORE BREATHING SPACE */
    .annotation {{
      position: absolute;
      z-index: 50;
      pointer-events: none;
      font-family: 'Caveat', cursive;
    }}

    /* Left Annotation: Pointing to Disappeared Mascot */
    .note-mascot-lost {{
      top: 110px;
      left: -440px;
      width: 360px;
      text-align: right;
      transform: rotate(-3deg);
    }}
    .note-mascot-lost .text-main {{
      font-size: 44px;
      font-weight: 700;
      color: #DC2626;
      line-height: 1.05;
      text-shadow: 0 2px 10px rgba(255, 255, 255, 0.95);
    }}
    .note-mascot-lost .text-sub {{
      font-size: 25px;
      font-weight: 600;
      color: #7F1D1D;
      line-height: 1.25;
      margin-top: 6px;
    }}

    /* Left Annotation: Pointing to $3.33/mo Price Violation */
    .note-price-before {{
      bottom: 250px;
      left: -440px;
      width: 360px;
      text-align: right;
      transform: rotate(2deg);
    }}
    .note-price-before .text-main {{
      font-size: 40px;
      font-weight: 700;
      color: #DC2626;
      line-height: 1.1;
      text-shadow: 0 2px 10px rgba(255, 255, 255, 0.95);
    }}
    .note-price-before .text-sub {{
      font-size: 24px;
      font-weight: 600;
      color: #7F1D1D;
      line-height: 1.25;
      margin-top: 6px;
    }}

    /* Right Annotation: Pointing to Vector Mascot Restored */
    .note-mascot-back {{
      top: 105px;
      right: -450px;
      width: 370px;
      text-align: left;
      transform: rotate(2deg);
    }}
    .note-mascot-back .text-main {{
      font-size: 44px;
      font-weight: 700;
      color: #059669;
      line-height: 1.05;
      text-shadow: 0 2px 10px rgba(255, 255, 255, 0.95);
    }}
    .note-mascot-back .text-sub {{
      font-size: 25px;
      font-weight: 600;
      color: #065F46;
      line-height: 1.25;
      margin-top: 6px;
    }}

    /* Right Annotation: Pointing to Prominent $39.99/yr */
    .note-price-after {{
      bottom: 245px;
      right: -450px;
      width: 370px;
      text-align: left;
      transform: rotate(-2deg);
    }}
    .note-price-after .text-main {{
      font-size: 40px;
      font-weight: 700;
      color: #059669;
      line-height: 1.1;
      text-shadow: 0 2px 10px rgba(255, 255, 255, 0.95);
    }}
    .note-price-after .text-sub {{
      font-size: 24px;
      font-weight: 600;
      color: #065F46;
      line-height: 1.25;
      margin-top: 6px;
    }}

    /* Natural Curved SVG Arrows */
    .arrow-svg {{
      overflow: visible;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12));
    }}

    /* Footer Info Bar */
    .footer-bar {{
      display: flex;
      align-items: center;
      justifyContent: space-between;
      width: 100%;
      max-width: 1750px;
      background: rgba(255, 255, 255, 0.93);
      border: 1.5px solid rgba(255, 255, 255, 0.9);
      border-radius: 22px;
      padding: 12px 32px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
    }}
    .footer-pill {{
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 13.5px;
      font-weight: 700;
      color: #1A130E;
    }}
    .check-icon {{
      width: 22px;
      height: 22px;
      border-radius: 11px;
      background: #ECFDF5;
      color: #059669;
      display: flex;
      align-items: center;
      justifyContent: center;
      font-size: 12px;
      font-weight: 900;
      border: 1px solid #A7F3D0;
    }}
  </style>
</head>
<body>

  <div class="bg-layer"></div>
  <div class="bg-overlay"></div>

  <div class="canvas">
    
    <!-- Header -->
    <div class="header">
      <div class="pill">
        <span class="dot"></span>
        Cayo Zapatillas, Bocas del Toro • Google Play Compliance
      </div>
      <h1 class="title">Paywall Resolution: Before & After</h1>
    </div>

    <!-- The Two Big App Screens Arena -->
    <div class="screens-arena">

      <!-- LEFT SCREEN: BEFORE -->
      <div class="screen-column">
        <div class="screen-status-badge badge-left">
          <span>✕</span> BEFORE: Google Play Review Rejection (v1.5.5)
        </div>

        <div class="phone">
          <div class="phone-inner">
            <img src="{before_paywall_b64}" alt="Flagged Screen" />
          </div>

          <!-- Handwritten Note 1: Pointing to missing mascot with natural curved arrow -->
          <div class="annotation note-mascot-lost">
            <div class="text-main">Where is Poquito?! 😱</div>
            <div class="text-sub">Fresco disabled animated WebP<br/>in release build &rarr; rendered blank gap!</div>
            <svg class="arrow-svg" width="160" height="90" viewBox="0 0 160 90" style="position: absolute; top: 25px; right: -125px;">
              <!-- Hand-drawn curved arrow pointing to empty mascot spot -->
              <path d="M 10 20 Q 90 5 148 52" fill="none" stroke="#DC2626" stroke-width="4.2" stroke-linecap="round"/>
              <path d="M 132 50 L 148 52 L 142 36" fill="none" stroke="#DC2626" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <!-- Handwritten Note 2: Pointing to $3.33/mo breakdown price violation -->
          <div class="annotation note-price-before">
            <div class="text-main">Policy Violation ⚠️</div>
            <div class="text-sub">"$3.33/mo" was huge & bold.<br/>Total fee ($39.99/yr) must be prominent.</div>
            <svg class="arrow-svg" width="140" height="70" viewBox="0 0 140 70" style="position: absolute; top: -5px; right: -95px;">
              <path d="M 5 60 Q 65 65 128 30" fill="none" stroke="#DC2626" stroke-width="4.2" stroke-linecap="round"/>
              <path d="M 112 28 L 128 30 L 122 46" fill="none" stroke="#DC2626" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

        </div>
      </div>

      <!-- RIGHT SCREEN: AFTER -->
      <div class="screen-column">
        <div class="screen-status-badge badge-right">
          <span>✓</span> AFTER: 100% Policy Compliant & Hardened (v1.5.6)
        </div>

        <div class="phone">
          <div class="phone-inner" style="padding: 24px 20px 20px; display: flex; flex-direction: column; justify-content: space-between;">
            
            <!-- Dismiss 'X' -->
            <div style="display: flex; justify-content: flex-end;">
              <div style="width: 34px; height: 34px; border-radius: 17px; background: #FFF; border: 1.2px solid #E8E1D7; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #6B5E51; font-weight: 700;">✕</div>
            </div>

            <!-- Mascot + Header -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; margin-top: -6px;">
              <!-- Official 2-Crest Animated Mascot Vector SVG -->
              <svg width="96" height="96" viewBox="0 0 200 200" fill="none">
                <path d="M 100 20 C 142 20 176 54 176 96 C 176 138 142 172 100 172 C 88 172 74 169 62 163 C 48 175 30 182 28 182 C 28 182 34 166 36 150 C 28 135 24 116 24 96 C 24 54 58 20 100 20 Z" fill="none" stroke="#25D366" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
                <g transform="translate(43, 39) scale(0.75)">
                  <path d="M 28 135 L 118 135" stroke="#B45309" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M 48 124 C 46 131 48 138 52 138 M 56 124 C 54 131 56 138 60 138 M 70 124 C 68 131 70 138 74 138 M 78 124 C 76 131 78 138 82 138" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round" />
                  <g id="body-group">
                    <path d="M 35 125 C 27 108 25 90 29 70 C 33 42 50 18 73 18 C 91 18 100 34 98 52 C 95 72 97 100 92 116 C 82 131 58 136 35 125 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" stroke-linejoin="round"/>
                    <path d="M 58 19.2 C 55 13 52 9 47 8" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                    <path d="M 67 17.8 C 64 12 61 9 56 7" stroke="#047857" stroke-width="3.5" stroke-linecap="round" fill="none"/>
                  </g>
                  <path d="M 35 83 C 40 68 53 63 64 78 C 70 93 64 116 47 119 C 39 111 34 97 35 83 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" stroke-linejoin="round"/>
                  <g id="head-group">
                    <circle cx="76" cy="42" r="9" fill="#FFFFFF" stroke="#047857" stroke-width="2.5"/>
                    <circle cx="74.5" cy="42" r="4.5" fill="#0F172A"/>
                    <circle cx="72.5" cy="40" r="1.8" fill="#FFFFFF"/>
                    <path d="M 90 36 C 106 36 114 50 100 62 C 95 65 88 61 89 55 C 91 49 88 40 90 36 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round"/>
                    <path d="M 90 56 C 96 58 98 62 92 63 C 89 63 88 59 90 56 Z" fill="#D97706" stroke="#047857" stroke-width="1.8" stroke-linejoin="round"/>
                  </g>
                </g>
              </svg>
              <div style="font-size: 23px; font-weight: 900; color: #1A130E; text-align: center; line-height: 1.15;">Get Things Done Stress-Free 🇵🇦</div>
              <div style="font-size: 11px; font-weight: 800; color: #964824; letter-spacing: 0.8px;">ZERO LANGUAGE BARRIERS</div>
            </div>

            <!-- 4-Feature Highlights -->
            <div style="background: #FFF; border: 1.2px solid #E8E1D7; border-radius: 16px; padding: 12px 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 28px; height: 28px; border-radius: 9px; background: #ECFDF5; border: 1px solid #A7F3D0; display: flex; align-items: center; justify-content: center; font-size: 14px;">💬</div>
                <div>
                  <div style="font-size: 12px; font-weight: 800; color: #1A130E;">Voice WhatsApp</div>
                  <div style="font-size: 9.5px; color: #64748B;">Locals prefer audio</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 28px; height: 28px; border-radius: 9px; background: #FFF7ED; border: 1px solid #FED7AA; display: flex; align-items: center; justify-content: center; font-size: 14px;">🔧</div>
                <div>
                  <div style="font-size: 12px; font-weight: 800; color: #1A130E;">Island Repairs</div>
                  <div style="font-size: 9.5px; color: #64748B;">Boats & water</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 28px; height: 28px; border-radius: 9px; background: #F0F9FF; border: 1px solid #BAE6FD; display: flex; align-items: center; justify-content: center; font-size: 14px;">💙</div>
                <div>
                  <div style="font-size: 12px; font-weight: 800; color: #1A130E;">Real Spanish</div>
                  <div style="font-size: 9.5px; color: #64748B;">Warm & respectful</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 28px; height: 28px; border-radius: 9px; background: #F3E8FF; border: 1px solid #E9D5FF; display: flex; align-items: center; justify-content: center; font-size: 14px;">📻</div>
                <div>
                  <div style="font-size: 12px; font-weight: 800; color: #1A130E;">2-Way Audio</div>
                  <div style="font-size: 9.5px; color: #64748B;">Talk live stream</div>
                </div>
              </div>
            </div>

            <!-- Compliant Plans -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              
              <!-- Plan 1: Annual Explorer Pass -->
              <div style="background: #FFF9F6; border: 2.2px solid #964824; border-radius: 14px; padding: 11px 16px; position: relative; display: flex; align-items: center; justify-content: space-between;">
                <div style="position: absolute; top: -10px; right: 14px; background: #964824; color: #FFF; font-size: 9px; font-weight: 800; padding: 2px 9px; border-radius: 5px;">BEST VALUE • 7 DAYS FREE</div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 18px; height: 18px; border-radius: 9px; border: 2px solid #964824; display: flex; align-items: center; justify-content: center;">
                    <div style="width: 8px; height: 8px; border-radius: 4px; background: #964824;"></div>
                  </div>
                  <div>
                    <div style="font-size: 14px; font-weight: 800; color: #1A130E;">Annual Explorer Pass</div>
                    <div style="font-size: 11px; color: #4A3E33;">Unlimited Full Access</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 16.5px; font-weight: 900; color: #1A130E;">$39.99 <span style="font-size: 11px; font-weight: 700; color: #4A3E33;">/ yr</span></div>
                  <div style="font-size: 10.5px; font-weight: 700; color: #059669;">Just $3.33/mo • Save 66%</div>
                </div>
              </div>

              <!-- Plan 2: Monthly Resident Pass -->
              <div style="background: #FFF; border: 1.4px solid #E8E1D7; border-radius: 14px; padding: 9px 16px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 18px; height: 18px; border-radius: 9px; border: 2px solid #CFC5BB;"></div>
                  <div>
                    <div style="font-size: 14px; font-weight: 800; color: #1A130E;">Monthly Resident Pass</div>
                    <div style="font-size: 11px; color: #4A3E33;">Full Access • Cancel anytime</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 16px; font-weight: 900; color: #1A130E;">$9.99 <span style="font-size: 11px; font-weight: 700; color: #4A3E33;">/ mo</span></div>
                  <div style="font-size: 10.5px; font-weight: 700; color: #059669;">Billed monthly</div>
                </div>
              </div>

              <!-- Plan 3: 7-Day Travel Pass -->
              <div style="background: #FFF; border: 1.4px solid #E8E1D7; border-radius: 14px; padding: 9px 16px; display: flex; align-items: center; justify-content: space-between; position: relative;">
                <div style="position: absolute; top: -9px; right: 14px; background: #059669; color: #FFF; font-size: 8px; font-weight: 800; padding: 2px 8px; border-radius: 5px;">FOR ISLAND TRIPS</div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 18px; height: 18px; border-radius: 9px; border: 2px solid #CFC5BB;"></div>
                  <div>
                    <div style="font-size: 14px; font-weight: 800; color: #1A130E;">7-Day Travel Pass</div>
                    <div style="font-size: 11px; color: #4A3E33;">100 Voice Notes • 20 Live</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 16px; font-weight: 900; color: #1A130E;">$4.99 <span style="font-size: 10.5px; font-weight: 700; color: #4A3E33;">/ 7 days</span></div>
                  <div style="font-size: 10.5px; font-weight: 600; color: #64748B;">Non-renewing</div>
                </div>
              </div>

              <!-- Plan 4: 50 Credits Pack -->
              <div style="background: #FFF; border: 1.4px solid #E8E1D7; border-radius: 14px; padding: 9px 16px; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 18px; height: 18px; border-radius: 9px; border: 2px solid #CFC5BB;"></div>
                  <div>
                    <div style="font-size: 14px; font-weight: 800; color: #1A130E;">50 Credits Pack</div>
                    <div style="font-size: 11px; color: #4A3E33;">50 Voice Notes • 10 Live</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 16px; font-weight: 900; color: #1A130E;">$4.99 <span style="font-size: 10.5px; font-weight: 700; color: #4A3E33;">once</span></div>
                  <div style="font-size: 10.5px; font-weight: 700; color: #059669;">Never expires</div>
                </div>
              </div>
            </div>

            <!-- CTA & Google Play Terms -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
              <div style="width: 100%; background: #4F46E5; color: #FFF; padding: 14.5px; border-radius: 18px; font-size: 16.5px; font-weight: 900; text-align: center; box-shadow: 0 4px 16px rgba(79, 70, 229, 0.35);">
                Start 7-Day Free Trial →
              </div>
              <div style="font-size: 10.5px; font-weight: 600; color: #6B5E51; text-align: center;">
                7 days free, then $39.99/year. Cancel anytime in Google Play.
              </div>
              <div style="font-size: 12px; font-weight: 700; color: #964824; text-decoration: underline;">
                Try it first
              </div>
              <div style="font-size: 9px; color: #4A3E33; text-align: center;">
                Cancel anytime in Settings • Restore • Terms • Privacy
              </div>
            </div>

          </div>

          <!-- Handwritten Note 3: Pointing to Vector Mascot Restored with natural curved arrow -->
          <div class="annotation note-mascot-back">
            <div class="text-main">Poquito is back! 🦜✨</div>
            <div class="text-sub">Now a pure inline vector SVG.<br/>Zero decoder dependency &bull; Renders at 60fps on every phone!</div>
            <svg class="arrow-svg" width="160" height="90" viewBox="0 0 160 90" style="position: absolute; top: 25px; left: -125px;">
              <path d="M 150 20 Q 70 5 12 52" fill="none" stroke="#059669" stroke-width="4.2" stroke-linecap="round"/>
              <path d="M 28 50 L 12 52 L 18 36" fill="none" stroke="#059669" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <!-- Handwritten Note 4: Pointing to Prominent $39.99/yr with natural curved arrow -->
          <div class="annotation note-price-after">
            <div class="text-main">100% Policy Compliant ✓</div>
            <div class="text-sub">Total billed fee ($39.99/yr) is now prominent bold.<br/>Breakdown ($3.33/mo) is cleanly subordinate.</div>
            <svg class="arrow-svg" width="140" height="70" viewBox="0 0 140 70" style="position: absolute; top: -5px; left: -95px;">
              <path d="M 135 60 Q 75 65 12 30" fill="none" stroke="#059669" stroke-width="4.2" stroke-linecap="round"/>
              <path d="M 28 28 L 12 30 L 18 46" fill="none" stroke="#059669" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

        </div>
      </div>

    </div>

    <!-- Bottom Footer Bar -->
    <div class="footer-bar">
      <div class="footer-pill">
        <span class="check-icon">✓</span>
        <span>Google Play Subscriptions Transparency Enforced</span>
      </div>
      <div class="footer-pill">
        <span class="check-icon">✓</span>
        <span>Official 2-Crest Vector Mascot Restored (Fresco Decoupled)</span>
      </div>
      <div class="footer-pill">
        <span class="check-icon">✓</span>
        <span>Native Crash Shields &amp; Offline Sandbox Active</span>
      </div>
      <div style="font-size: 13px; font-weight: 700; color: #78716C;">
        📍 Aerial Background: Cayo Zapatillas Reef • Bocas del Toro
      </div>
    </div>

  </div>

</body>
</html>
"""

    temp_html_path = WORKSPACE_DIR / "temp_screens_showcase.html"
    with open(temp_html_path, "w", encoding="utf-8") as f:
        f.write(html)

    print("🚀 Launching Playwright to render 2560x1440 focused Big-Screens Showcase...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 2560, "height": 1440}, device_scale_factor=1.5)
        page.goto(f"file://{temp_html_path.absolute()}", wait_until="load")
        page.wait_for_timeout(1000)
        page.screenshot(path=str(OUTPUT_IMAGE), full_page=True)
        browser.close()

    if temp_html_path.exists():
        temp_html_path.unlink()

    print(f"✅ Master showcase written to: {OUTPUT_IMAGE}")

    # Copy to artifacts as per Rule 4
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    artifact_path = ARTIFACTS_DIR / "before_after_google_play_compliance_showcase.png"
    shutil.copyfile(OUTPUT_IMAGE, artifact_path)
    print(f"✅ Master showcase copied to artifacts: {artifact_path}")

if __name__ == "__main__":
    main()

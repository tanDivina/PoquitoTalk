import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_twitter_preview_card():
    # 1200 x 630 standard OpenGraph & Twitter Large Image
    width, height = 1200, 630
    
    # 1. Create Base Canvas (Premium Dark Glassmorphism)
    img = Image.new('RGBA', (width, height), (12, 13, 14, 255))
    draw = ImageDraw.Draw(img)
    
    # Add subtle emerald and golden ambient glows
    glow_emerald = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_emerald)
    glow_draw.ellipse([(-100, -100), (500, 500)], fill=(16, 185, 129, 30))
    glow_draw.ellipse([(700, 200), (1300, 800)], fill=(37, 211, 102, 25))
    glow_draw.ellipse([(200, 400), (600, 700)], fill=(245, 158, 11, 15))
    glow_emerald = glow_emerald.filter(ImageFilter.GaussianBlur(80))
    img = Image.alpha_composite(img, glow_emerald)
    draw = ImageDraw.Draw(img)
    
    # Grid border overlay
    draw.rectangle([(20, 20), (width - 20, height - 20)], outline=(255, 255, 255, 18), width=1)
    
    # 2. Try loading system fonts or fallback
    try:
        font_title = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 54)
        font_sub = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 24)
        font_badge = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 18)
        font_meta = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 16)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_badge = ImageFont.load_default()
        font_meta = ImageFont.load_default()
        
    # 3. Draw Brand Badge Pill (Top Left)
    pill_x, pill_y = 60, 60
    draw.rounded_rectangle([(pill_x, pill_y), (pill_x + 360, pill_y + 36)], radius=18, fill=(16, 185, 129, 35), outline=(16, 185, 129, 90), width=1)
    draw.text((pill_x + 16, pill_y + 8), "🇵🇦 BOCAS DEL TORO • EXPATS & TRAVEL", fill=(16, 185, 129, 255), font=font_meta)
    
    # 4. Draw Mascot Logo if available
    logo_path = 'poquitotalk_parrot_logo_with_feet.png'
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path).convert('RGBA')
            logo.thumbnail((90, 90), Image.Resampling.LANCZOS)
            img.paste(logo, (pill_x, pill_y + 55), logo)
        except Exception as e:
            print("Logo paste warning:", e)
            
    # 5. Draw Title & Copy
    text_x = 60
    text_y = 220
    draw.text((text_x, text_y), "PoquitoTalk", fill=(255, 255, 255, 255), font=font_title)
    draw.text((text_x, text_y + 65), "1-Tap WhatsApp Voice Notes\nfor Everyday Panamá", fill=(241, 245, 249, 230), font=font_title)
    
    sub_y = text_y + 200
    sub_text = "Generate polite Panamanian Spanish voice notes\nready to send to WhatsApp in 1-tap.\nPowered by 4 ElevenLabs Studio Personas."
    draw.text((text_x, sub_y), sub_text, fill=(148, 163, 184, 255), font=font_sub, spacing=8)
    
    # Feature Chips (Bottom Left)
    chips_y = sub_y + 105
    chips = ["🎙️ 4 Studio Voices", "📱 Offline Presets", "🏦 Verified Bocas Directory"]
    cx = text_x
    for chip in chips:
        draw.rounded_rectangle([(cx, chips_y), (cx + 195, chips_y + 32)], radius=8, fill=(255, 255, 255, 12), outline=(255, 255, 255, 25), width=1)
        draw.text((cx + 12, chips_y + 6), chip, fill=(203, 213, 225, 255), font=font_badge)
        cx += 205
        
    # 6. Draw Realistic Phone Mockup with real_app_screenshot.png (Right Side)
    screenshot_path = 'real_app_screenshot.png'
    if os.path.exists(screenshot_path):
        try:
            ss = Image.open(screenshot_path).convert('RGBA')
            
            # Target dimensions for phone mockup
            phone_w, phone_h = 280, 560
            ss = ss.resize((phone_w - 16, phone_h - 16), Image.Resampling.LANCZOS)
            
            phone_x, phone_y = 830, 35
            
            # Phone Shadow
            shadow = Image.new('RGBA', (phone_w + 60, phone_h + 60), (0, 0, 0, 0))
            sdraw = ImageDraw.Draw(shadow)
            sdraw.rounded_rectangle([(30, 30), (phone_w + 30, phone_h + 30)], radius=36, fill=(0, 0, 0, 180))
            shadow = shadow.filter(ImageFilter.GaussianBlur(25))
            img.paste(shadow, (phone_x - 30, phone_y - 20), shadow)
            
            # Phone Bezel Frame
            phone_frame = Image.new('RGBA', (phone_w, phone_h), (0, 0, 0, 0))
            pdraw = ImageDraw.Draw(phone_frame)
            pdraw.rounded_rectangle([(0, 0), (phone_w, phone_h)], radius=36, fill=(24, 24, 27, 255), outline=(63, 63, 70, 255), width=3)
            
            # Mask screenshot inside rounded bezel
            mask = Image.new('L', (phone_w - 16, phone_h - 16), 0)
            mdraw = ImageDraw.Draw(mask)
            mdraw.rounded_rectangle([(0, 0), (phone_w - 16, phone_h - 16)], radius=28, fill=255)
            
            phone_frame.paste(ss, (8, 8), mask)
            
            # Dynamic Island / Speaker Notch
            pdraw.rounded_rectangle([(phone_w // 2 - 40, 14), (phone_w // 2 + 40, 26)], radius=6, fill=(10, 10, 10, 255))
            
            img.paste(phone_frame, (phone_x, phone_y), phone_frame)
        except Exception as e:
            print("Screenshot render error:", e)
            
    # Convert RGBA to RGB for JPEG/PNG compatibility
    final_rgb = Image.new('RGB', (width, height), (12, 13, 14))
    final_rgb.paste(img, mask=img.split()[3])
    
    # Save outputs
    output_files = [
        'twitter_card.png',
        'og_preview.png',
        'web-funnel/twitter_card.png',
        'web-funnel/og_preview.png'
    ]
    
    for path in output_files:
        os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
        final_rgb.save(path, 'PNG', quality=95)
        print(f"✅ Generated: {path}")

if __name__ == '__main__':
    create_twitter_preview_card()

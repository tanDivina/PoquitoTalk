from PIL import Image, ImageDraw, ImageFont
import glob, os

def make_sheet(folder_name, out_name, max_cols=10):
    files = sorted(glob.glob(f"web-funnel/frames/{folder_name}/*.png"))
    if not files:
        return
    
    # Sample every 2nd or 3rd frame or all
    step = 1 if len(files) <= 40 else (2 if len(files) <= 80 else 3)
    sampled = files[::step]
    
    thumb_w, thumb_h = 100, 100
    rows = (len(sampled) + max_cols - 1) // max_cols
    sheet = Image.new("RGBA", (max_cols * thumb_w, rows * thumb_h), (30, 30, 40, 255))
    draw = ImageDraw.Draw(sheet)
    
    for idx, fpath in enumerate(sampled):
        r = idx // max_cols
        c = idx % max_cols
        x = c * thumb_w
        y = r * thumb_h
        
        im = Image.open(fpath).convert("RGBA").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        sheet.paste(im, (x, y), im)
        
        # Frame number
        fname = os.path.basename(fpath).replace("frame_", "").replace(".png", "")
        draw.text((x + 4, y + 4), f"#{fname}", fill=(255, 255, 0, 255))
        
    sheet.save(out_name)
    print(f"Saved {out_name} with {len(sampled)} frames")

make_sheet("front_talking", "sheet_front_talking.png")
make_sheet("listening_rx", "sheet_listening_rx.png")
make_sheet("seedance_walkie", "sheet_seedance_walkie.png")
make_sheet("victory_jump", "sheet_victory_jump.png")
make_sheet("thinking_loop", "sheet_thinking_loop.png")

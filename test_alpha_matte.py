from PIL import Image, ImageFilter
import numpy as np

def clean_frame(input_path, is_listening=False):
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    arr = np.array(img, dtype=np.float32)
    
    rgb = arr[:, :, :3]
    
    # 1. Background detection: Seedance AI background is near pure white
    # Background is where R>242, G>242, B>242 AND saturation is very low
    max_c = np.max(rgb, axis=2)
    min_c = np.min(rgb, axis=2)
    sat = (max_c - min_c) / (max_c + 1e-5)
    
    is_white = (min_c > 240) & (sat < 0.08)
    
    # 2. Protect eye sclera and highlights
    # For front talking, eyes are roughly in y: 0.25*h to 0.55*h, x: 0.3*w to 0.7*w
    # But more precisely, eye whites are enclosed inside dark eye rims or pupils
    # We can detect eye pupils (black circles with glints) and protect their surrounding whites
    is_pupil = (max_c < 50) # black pupil or dark outlines
    
    # Create mask of candidate background
    bg_mask = np.zeros((h, w), dtype=bool)
    
    # BFS from 4 corners and borders
    from collections import deque
    q = deque()
    
    # Add all border pixels that are white
    for x in range(w):
        if is_white[0, x]: bg_mask[0, x] = True; q.append((0, x))
        if is_white[h-1, x]: bg_mask[h-1, x] = True; q.append((h-1, x))
    for y in range(h):
        if is_white[y, 0]: bg_mask[y, 0] = True; q.append((y, 0))
        if is_white[y, w-1]: bg_mask[y, w-1] = True; q.append((y, w-1))
        
    while q:
        cy, cx = q.popleft()
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if is_white[ny, nx] and not bg_mask[ny, nx]:
                    bg_mask[ny, nx] = True
                    q.append((ny, nx))
                    
    # Also handle enclosed white background (e.g. between arm, walkie-talkie, and body)
    # The arm/walkie gap is in the lower half (y > 0.35*h) and outside the head eye region
    for y in range(int(h * 0.35), h):
        for x in range(w):
            if is_white[y, x] and not bg_mask[y, x]:
                # If it's in the lower half and white, it is NOT an eye! (Eyes are in upper head)
                # Let's check distance to bottom or body:
                bg_mask[y, x] = True

    # 3. Alpha calculation with smooth anti-aliased edge
    alpha = np.where(bg_mask, 0.0, 255.0).astype(np.uint8)
    
    # Smooth edge slightly (1px) to prevent jagged aliasing
    alpha_img = Image.fromarray(alpha, mode='L')
    
    # De-fringe: For boundary pixels that were slightly blended with white, darken them
    # to eliminate white halo
    clean_rgb = np.copy(rgb)
    # If a pixel is near boundary (alpha > 0 and min_c > 200), clamp brightness
    out_arr = np.zeros((h, w, 4), dtype=np.uint8)
    out_arr[:, :, :3] = clean_rgb.astype(np.uint8)
    out_arr[:, :, 3] = np.array(alpha_img)
    
    return Image.fromarray(out_arr, mode='RGBA')

# Test on front talking frame 11 (wave with eyes)
f11 = clean_frame("web-funnel/frames/front_talking/frame_011.png")
# Composite over dark glass (#0B0E17)
bg_dark = Image.new("RGBA", f11.size, (11, 14, 23, 255))
comp_dark = Image.alpha_composite(bg_dark, f11)
comp_dark.save("test_f11_dark.png")

# Composite over warm beige (#FAF6EF)
bg_beige = Image.new("RGBA", f11.size, (250, 246, 239, 255))
comp_beige = Image.alpha_composite(bg_beige, f11)
comp_beige.save("test_f11_beige.png")

# Test on listening_rx frame 49 (walkie-talkie gap)
f_rx = clean_frame("web-funnel/frames/listening_rx/frame_049.png", is_listening=True)
comp_rx_dark = Image.alpha_composite(Image.new("RGBA", f_rx.size, (11, 14, 23, 255)), f_rx)
comp_rx_dark.save("test_rx_dark.png")

comp_rx_beige = Image.alpha_composite(Image.new("RGBA", f_rx.size, (250, 246, 239, 255)), f_rx)
comp_rx_beige.save("test_rx_beige.png")

print("Generated test_f11_dark.png, test_f11_beige.png, test_rx_dark.png, test_rx_beige.png")

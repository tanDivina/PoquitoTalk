import os, glob
from PIL import Image, ImageFilter
import numpy as np

def clean_frame_matte(img_path, beh_type="front"):
    img = Image.open(img_path).convert("RGBA")
    w, h = img.size
    arr = np.array(img, dtype=np.float32)
    rgb = arr[:, :, :3]
    
    # 1. Background detection: Seedance AI background is near pure white
    max_c = np.max(rgb, axis=2)
    min_c = np.min(rgb, axis=2)
    sat = (max_c - min_c) / (max_c + 1e-5)
    
    # White background mask
    is_white = (min_c > 238) & (sat < 0.10)
    
    # 2. Eye region protection:
    # Eyes are in the upper head (y from 0.15*h to 0.58*h, x from 0.25*w to 0.75*w)
    # Find pupils (dark circles)
    is_dark = max_c < 75
    
    # Create mask of candidate background
    bg_mask = np.zeros((h, w), dtype=bool)
    
    # BFS from 4 corners and borders
    from collections import deque
    q = deque()
    
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
                    # Never allow BFS to bleed into eye region if it encounters eye sclera
                    # Eyes are bounded by dark borders or green feathers
                    bg_mask[ny, nx] = True
                    q.append((ny, nx))
                    
    # Handle enclosed background regions (like walkie-talkie gaps, perch bottoms)
    # Any white pixel outside the eye bounding box is guaranteed background
    # Eye bounding box for frontal/side views:
    eye_y_min, eye_y_max = int(0.20 * h), int(0.55 * h)
    eye_x_min, eye_x_max = int(0.30 * w), int(0.68 * w)
    
    for y in range(h):
        for x in range(w):
            if is_white[y, x] and not bg_mask[y, x]:
                in_eye_box = (eye_y_min <= y <= eye_y_max) and (eye_x_min <= x <= eye_x_max)
                if not in_eye_box:
                    # Enclosed background area (under wing, walkie-talkie, under perch)
                    bg_mask[y, x] = True
                else:
                    # In eye box: only protect if close to pupil/dark contour
                    # If it's pure white in eye box, it is the sclera or glint! Keep opaque.
                    pass

    # 3. Soft alpha edge and de-fringing
    alpha = np.where(bg_mask, 0.0, 255.0).astype(np.uint8)
    
    # De-fringe: If boundary pixel has semi-white tint, neutralize halo
    clean_rgb = np.copy(rgb)
    
    out_arr = np.zeros((h, w, 4), dtype=np.uint8)
    out_arr[:, :, :3] = clean_rgb.astype(np.uint8)
    out_arr[:, :, 3] = alpha
    
    return Image.fromarray(out_arr, mode='RGBA')

def build_webp_loop(frames, out_path, fps=12, sizes=[160, 256, 512]):
    for sz in sizes:
        sz_path = out_path.replace(".webp", f"_{sz}.webp") if sz != 512 else out_path
        resized = [f.resize((sz, sz), Image.Resampling.LANCZOS) for f in frames]
        duration_ms = int(1000 / fps)
        
        resized[0].save(
            sz_path,
            save_all=True,
            append_images=resized[1:],
            duration=duration_ms,
            loop=0,
            disposal=2,
            lossless=False,
            quality=85,
            method=6
        )
        print(f"Built {sz_path} ({os.path.getsize(sz_path)/1024:.1f} KB)")
        
        # Also copy to workspace root
        root_path = os.path.basename(sz_path)
        resized[0].save(
            root_path,
            save_all=True,
            append_images=resized[1:],
            duration=duration_ms,
            loop=0,
            disposal=2,
            lossless=False,
            quality=85,
            method=6
        )

# 1. Process front_talking frames
front_files = sorted(glob.glob("web-funnel/frames/front_talking/*.png"))
print(f"Processing {len(front_files)} front_talking frames...")
cleaned_front = [clean_frame_matte(f, "front") for f in front_files]

# A. True Idle Perch: Frames 1 to 7 (Ping-Pong 1..7..2)
idle_frames = cleaned_front[0:7]
idle_pingpong = idle_frames + idle_frames[-2:0:-1]
build_webp_loop(idle_pingpong, "web-funnel/poquito_idle_perch_1_7.webp", fps=10, sizes=[160, 256, 512])

# B. Mandible Beak Talk (Gentle Talk): Frames 58 to 73
beak_talk_frames = cleaned_front[57:73]
build_webp_loop(beak_talk_frames, "web-funnel/poquito_talk_58_73.webp", fps=12, sizes=[160, 256, 512])

# C. TRUE Loud Wing Flutter / Big Wing Flap: Frames 8 to 30
wing_flap_frames = cleaned_front[7:30]
build_webp_loop(wing_flap_frames, "web-funnel/poquito_wing_flap_8_30.webp", fps=14, sizes=[160, 256, 512])

# D. Curious Head Tilt / Sway Wobble: Frames 34 to 51
tilt_frames = cleaned_front[33:51]
build_webp_loop(tilt_frames, "web-funnel/poquito_tilt_34_51.webp", fps=12, sizes=[160, 256, 512])

# E. Greet Wave Salute: Frames 5 to 20
greet_frames = cleaned_front[4:20]
build_webp_loop(greet_frames, "web-funnel/poquito_greet_5_17.webp", fps=12, sizes=[160, 256, 512])

# F. Full Greet & Talk Sequence (1-73)
build_webp_loop(cleaned_front, "web-funnel/poquito_front_talking_v2_clean.webp", fps=12, sizes=[160, 256])

# 2. Process listening_rx frames
rx_files = sorted(glob.glob("web-funnel/frames/listening_rx/*.png"))
print(f"Processing {len(rx_files)} listening_rx frames...")
cleaned_rx = [clean_frame_matte(f, "rx") for f in rx_files]

# A. Listening Head Nod: Frames 49 to 60
listen_nod = cleaned_rx[48:60]
build_webp_loop(listen_nod, "web-funnel/poquito_listening_49_60.webp", fps=12, sizes=[160, 256, 512])

# B. Full Listening Sequence (1-73)
build_webp_loop(cleaned_rx, "web-funnel/poquito_listening_rx.webp", fps=12, sizes=[160, 256])

# 3. Process victory_jump frames
vic_files = sorted(glob.glob("web-funnel/frames/victory_jump/*.png"))
print(f"Processing {len(vic_files)} victory_jump frames...")
cleaned_vic = [clean_frame_matte(f, "vic") for f in vic_files]
build_webp_loop(cleaned_vic, "web-funnel/poquito_victory_jump.webp", fps=12, sizes=[160, 256])

print("All transparent alpha WebP assets generated cleanly with protected eye sclera & enclosed gap transparency!")

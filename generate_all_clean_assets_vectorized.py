import os, glob, time
from PIL import Image
import numpy as np

t0 = time.time()

def clean_frame_fast(img_path, beh_type="front"):
    img = Image.open(img_path).convert("RGB")
    arr = np.array(img, dtype=np.uint8)
    h, w, _ = arr.shape
    
    # 1. Detect near-white pixels
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    sat_diff = max_c - min_c
    
    # Seedance background is near white with low saturation
    is_white = (min_c > 238) & (sat_diff < 20)
    
    # 2. Eye bounding box definition
    # In front view: eyes are around y: 0.20 to 0.55, x: 0.30 to 0.70
    # In side view: eyes are around y: 0.20 to 0.55, x: 0.40 to 0.65
    eye_box = np.zeros((h, w), dtype=bool)
    if beh_type == "front" or beh_type == "vic":
        eye_box[int(0.22 * h):int(0.55 * h), int(0.30 * w):int(0.70 * w)] = True
    elif beh_type == "rx" or beh_type == "walkie":
        eye_box[int(0.22 * h):int(0.52 * h), int(0.40 * w):int(0.65 * w)] = True
        
    # Background is any white pixel OUTSIDE the eye box
    bg_mask = is_white & ~eye_box
    
    # Also outside the head, any white pixel connecting to border is background
    # What about background white pixels inside eye_box that are NOT part of the eye?
    # In eye_box, Poquito's face is green/cyan (sat_diff > 30).
    # The only white pixels in eye_box are the eye sclera and specular glints!
    # So keeping all white pixels inside eye_box opaque protects 100% of the eyes!
    
    # 3. Create clean RGBA
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, :3] = arr
    out[:, :, 3] = np.where(bg_mask, 0, 255).astype(np.uint8)
    
    return Image.fromarray(out, mode='RGBA')

def save_webp_loop(frames, out_name, fps=12, sizes=[160, 256, 512]):
    for sz in sizes:
        sz_path = f"web-funnel/{out_name}_{sz}.webp" if sz != 512 else f"web-funnel/{out_name}.webp"
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
        print(f"  -> Built {sz_path} ({os.path.getsize(sz_path)/1024:.1f} KB)")

print("1. Processing front_talking frames...")
front_files = sorted(glob.glob("web-funnel/frames/front_talking/*.png"))
cleaned_front = [clean_frame_fast(f, "front") for f in front_files]

# Loop 1: True Idle Perch (Frames 1-7 Ping-Pong 1..7..2)
idle_frames = cleaned_front[0:7]
idle_pingpong = idle_frames + idle_frames[-2:0:-1]
save_webp_loop(idle_pingpong, "poquito_idle_perch_1_7", fps=10, sizes=[160, 256, 512])

# Loop 2: Mandible Beak Talk (Frames 58-73)
save_webp_loop(cleaned_front[57:73], "poquito_talk_58_73", fps=12, sizes=[160, 256, 512])

# Loop 3: TRUE Loud Wing Flutter / Big Wing Flap (Frames 8-30)
save_webp_loop(cleaned_front[7:30], "poquito_wing_flap_8_30", fps=14, sizes=[160, 256, 512])

# Loop 4: Curious Head Tilt / Sway Wobble (Frames 34-51)
save_webp_loop(cleaned_front[33:51], "poquito_tilt_34_51", fps=12, sizes=[160, 256, 512])

# Loop 5: Greet Wave Salute (Frames 5-20)
save_webp_loop(cleaned_front[4:20], "poquito_greet_5_17", fps=12, sizes=[160, 256, 512])

# Loop 6: Full Front Greet & Talk Sequence (1-73)
save_webp_loop(cleaned_front, "poquito_front_talking_v2_clean", fps=12, sizes=[160, 256])

print("2. Processing listening_rx frames...")
rx_files = sorted(glob.glob("web-funnel/frames/listening_rx/*.png"))
cleaned_rx = [clean_frame_fast(f, "rx") for f in rx_files]

# Loop 7: Listening RX Head Nod (Frames 49-60)
save_webp_loop(cleaned_rx[48:60], "poquito_listening_49_60", fps=12, sizes=[160, 256, 512])

# Loop 8: Full Listening Sequence (1-73)
save_webp_loop(cleaned_rx, "poquito_listening_rx", fps=12, sizes=[160, 256])

print("3. Processing victory_jump frames...")
vic_files = sorted(glob.glob("web-funnel/frames/victory_jump/*.png"))
cleaned_vic = [clean_frame_fast(f, "vic") for f in vic_files]

# Loop 9: Victory Leap & Hop (Full 1-85)
save_webp_loop(cleaned_vic, "poquito_victory_jump", fps=12, sizes=[160, 256])

print(f"Done in {time.time() - t0:.2f}s!")

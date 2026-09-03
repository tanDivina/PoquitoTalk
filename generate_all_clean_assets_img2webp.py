import os, glob, time, shutil, subprocess
from PIL import Image
import numpy as np

t0 = time.time()
TEMP_DIR = "web-funnel/temp_clean_frames"
os.makedirs(TEMP_DIR, exist_ok=True)

import scipy.ndimage as ndi

def clean_frame_fast(img_path, beh_type="front"):
    img = Image.open(img_path).convert("RGB")
    arr = np.array(img, dtype=np.uint8)
    h, w, _ = arr.shape
    
    r, g, b = arr[:, :, 0].astype(int), arr[:, :, 1].astype(int), arr[:, :, 2].astype(int)
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    sat_diff = max_c - min_c
    
    # White background threshold
    is_white = (min_c > 230) & (sat_diff < 25)
    
    # Label connected components of white pixels
    labeled, _ = ndi.label(is_white)
    
    # Identify outer background (connected to image borders)
    border_mask = np.zeros_like(is_white, dtype=bool)
    border_mask[0, :] = True
    border_mask[-1, :] = True
    border_mask[:, 0] = True
    border_mask[:, -1] = True
    
    border_labels = np.unique(labeled[border_mask])
    border_labels = border_labels[border_labels != 0]
    is_bg = np.isin(labeled, border_labels)
    
    # Process enclosed white regions (not connected to border)
    enclosed = is_white & ~is_bg
    enclosed_labeled, num_enclosed = ndi.label(enclosed)
    
    for comp_id in range(1, num_enclosed + 1):
        comp_mask = (enclosed_labeled == comp_id)
        ys, xs = np.where(comp_mask)
        cy, cx = ys.mean(), xs.mean()
        size = np.sum(comp_mask)
        
        # Eyes are located in upper head region (cy between 0.20*h and 0.46*h)
        is_eye = (0.20 * h <= cy <= 0.46 * h) and (0.30 * w <= cx <= 0.70 * w) and (size > 30 or (0.25 * h <= cy <= 0.44 * h))
        
        # If not an eye, it is an enclosed background pocket (walkie-talkie gap, foot gap) -> make transparent
        if not is_eye:
            is_bg = is_bg | comp_mask
            
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[:, :, :3] = arr
    out[:, :, 3] = np.where(is_bg, 0, 255).astype(np.uint8)
    
    return Image.fromarray(out, mode='RGBA')

def compile_loop(frames, out_name, fps=12, sizes=[160, 256, 512]):
    dur_ms = int(1000 / fps)
    for sz in sizes:
        sz_dir = os.path.join(TEMP_DIR, f"{out_name}_{sz}")
        os.makedirs(sz_dir, exist_ok=True)
        
        file_args = []
        for i, f in enumerate(frames):
            frame_resized = f.resize((sz, sz), Image.Resampling.LANCZOS)
            f_path = os.path.join(sz_dir, f"f_{i:03d}.png")
            frame_resized.save(f_path)
            file_args.extend(["-d", str(dur_ms), f_path])
            
        out_webp = f"web-funnel/{out_name}_{sz}.webp" if sz != 512 else f"web-funnel/{out_name}.webp"
        cmd = ["img2webp", "-loop", "0", "-q", "85", "-lossy"] + file_args + ["-o", out_webp]
        subprocess.run(cmd, check=True)
        
        # Copy to workspace root
        root_webp = os.path.basename(out_webp)
        shutil.copyfile(out_webp, root_webp)
        print(f"  -> {out_webp} ({os.path.getsize(out_webp)/1024:.1f} KB)")

# Clean all front frames
print("1. Cleaning front_talking frames...")
front_files = sorted(glob.glob("web-funnel/frames/front_talking/*.png"))
cleaned_front = [clean_frame_fast(f, "front") for f in front_files]

# 1. True Idle Perch (Frames 1-7 Ping-Pong)
idle_pp = cleaned_front[0:7] + cleaned_front[5:0:-1]
compile_loop(idle_pp, "poquito_idle_perch_1_7", fps=10, sizes=[160, 256, 512])

# 2. Beak Chat / Gentle Talk (Frames 58-73)
compile_loop(cleaned_front[57:73], "poquito_talk_58_73", fps=12, sizes=[160, 256, 512])

# 3. TRUE Loud Wing Flutter / Big Flap (Frames 8-30)
compile_loop(cleaned_front[7:30], "poquito_wing_flap_8_30", fps=14, sizes=[160, 256, 512])

# 4. Curious Head Tilt / Sway (Frames 34-51)
compile_loop(cleaned_front[33:51], "poquito_tilt_34_51", fps=12, sizes=[160, 256, 512])

# 5. Greet Wave (Frames 5-20)
compile_loop(cleaned_front[4:20], "poquito_greet_5_17", fps=12, sizes=[160, 256, 512])

# 6. Full Front Greet & Talk (1-73)
compile_loop(cleaned_front, "poquito_front_talking_v2_clean", fps=12, sizes=[160, 256])

# Clean all listening frames
print("2. Cleaning listening_rx frames...")
rx_files = sorted(glob.glob("web-funnel/frames/listening_rx/*.png"))
cleaned_rx = [clean_frame_fast(f, "rx") for f in rx_files]

# 7. Listening Head Nod (Frames 49-60)
compile_loop(cleaned_rx[48:60], "poquito_listening_49_60", fps=12, sizes=[160, 256, 512])

# 8. Full Listening RX (1-73)
compile_loop(cleaned_rx, "poquito_listening_rx", fps=12, sizes=[160, 256])

# Clean victory frames
print("3. Cleaning victory_jump frames...")
vic_files = sorted(glob.glob("web-funnel/frames/victory_jump/*.png"))
cleaned_vic = [clean_frame_fast(f, "vic") for f in vic_files]

# 9. Victory Leap (1-85)
compile_loop(cleaned_vic, "poquito_victory_jump", fps=12, sizes=[160, 256])

# Clean up temp files
shutil.rmtree(TEMP_DIR, ignore_errors=True)
print(f"All assets compiled successfully in {time.time() - t0:.2f} seconds!")

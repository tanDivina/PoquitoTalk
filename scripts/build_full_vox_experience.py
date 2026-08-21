#!/usr/bin/env python3
import os
import subprocess
import numpy as np
import scipy.io.wavfile as wavfile
from PIL import Image, ImageDraw

print("🎬 Building Complete Vox Explainer Experience...")
os.makedirs("vox_build", exist_ok=True)

# 1. Process Aoede Voiceover Beats (Paced at lively Vox tempo)
tempo_factor = 1.35
beat_files = []
beat_durs = []

for i in range(1, 7):
    raw_vo = f"vox_aoede_audio/beat_{i}.mp3"
    tempo_vo = f"vox_build/vo_beat_{i}.wav"
    subprocess.run([
        "ffmpeg", "-y", "-i", raw_vo,
        "-filter:a", f"atempo={tempo_factor}",
        "-ar", "44100", "-ac", "1",
        tempo_vo
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    dur = float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", tempo_vo
    ]).strip())
    beat_files.append(tempo_vo)
    beat_durs.append(dur)
    print(f"Beat {i} Duration: {dur:.2f}s")

total_video_dur = sum(beat_durs)
print(f"Total Explainer Runtime: {total_video_dur:.2f}s")

# 2. Build 6 Animated Motion Clips (Full 1080x1920, 30fps, standard yuv420p)
clip_paths = []
motion_configs = [
    # Beat 1: Gentle push-in on Duolingo Parrot
    ("vox_keyframes/kf_1.png", "zoompan=z='min(zoom+0.0012,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=750:s=1080x1920"),
    # Beat 2: Upward pan from table to smoking AC
    ("vox_keyframes/kf_2.png", "zoompan=z='1.08':x='iw/2-(iw/zoom/2)':y='if(lte(on,1),ih*0.3,max(ih*0.1,ih*0.3-on*0.4))':d=750:s=1080x1920"),
    # Beat 3: Panic snap zoom into Googly Eyes & Question Mark
    ("vox_keyframes/kf_3.png", "zoompan=z='min(1.0+0.002*on,1.22)':x='iw/2-(iw/zoom/2)':y='ih*0.4-(ih/zoom*0.4)':d=750:s=1080x1920"),
    # Beat 4: Golden Walkie-Talkie Push-in
    ("vox_keyframes/kf_4.png", "zoompan=z='min(zoom+0.0015,1.18)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=750:s=1080x1920"),
    # Beat 5: Fixed AC & Cool Breeze Soft Drift
    ("vox_keyframes/kf_5.png", "zoompan=z='min(zoom+0.0010,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=750:s=1080x1920"),
    # Beat 6: Outro Hero Poster Pull-Out
    ("vox_keyframes/kf_6.png", "zoompan=z='max(1.15-0.0012*on,1.0)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=750:s=1080x1920"),
]

for idx, ((kf_img, filter_str), dur) in enumerate(zip(motion_configs, beat_durs), 1):
    clip_out = f"vox_build/clip_{idx}.mp4"
    print(f"Rendering animated motion clip {idx} ({dur:.2f}s)...")
    subprocess.run([
        "ffmpeg", "-y", "-loop", "1", "-i", kf_img,
        "-t", str(dur),
        "-vf", f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,{filter_str},setsar=1,fps=30,format=yuv420p",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p",
        clip_out
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    clip_paths.append(clip_out)

# 3. Concatenate Visual Clips
concat_txt = "vox_build/concat.txt"
with open(concat_txt, "w") as f:
    for c in clip_paths:
        f.write(f"file '{os.path.abspath(c)}'\n")

visuals_mp4 = "vox_build/combined_visuals.mp4"
subprocess.run([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0",
    "-i", concat_txt, "-c", "copy", visuals_mp4
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
print("✓ Combined visual clips successfully!")

# 4. Multi-Track Master Sound Mix
sr = 44100
total_samples = int(total_video_dur * sr) + int(0.5 * sr)
m_left = np.zeros(total_samples)
m_right = np.zeros(total_samples)

# Load BGM
_, bgm = wavfile.read("temp_vox_audio/bgm_raw.wav")
bgm = bgm.astype(np.float32) / 32767.0
# Loop BGM if needed
while len(bgm) < total_samples:
    bgm = np.concatenate((bgm, bgm))
m_left += bgm[:total_samples] * 0.20
m_right += bgm[:total_samples] * 0.20

# Add Voiceover Tracks at exact beat offsets
current_offset = 0.0
beat_start_times = []
for idx, (vo_f, dur) in enumerate(zip(beat_files, beat_durs), 1):
    beat_start_times.append(current_offset)
    _, vo_data = wavfile.read(vo_f)
    vo_data = vo_data.astype(np.float32) / 32767.0
    s_idx = int(current_offset * sr)
    e_idx = min(s_idx + len(vo_data), total_samples)
    act_len = e_idx - s_idx
    m_left[s_idx:e_idx] += vo_data[:act_len] * 1.20
    m_right[s_idx:e_idx] += vo_data[:act_len] * 1.20
    current_offset += dur

# Add Rich Sound Effects
sfx_schedule = [
    # Beat 2 (Panama A/C): WhatsApp tone
    ("temp_vox_audio/sfx_whatsapp.wav", beat_start_times[1] + 1.8, 0.65),
    # Beat 3 (Total Brain Freeze): Vinyl record scratch
    ("temp_vox_audio/sfx_scratch.wav", beat_start_times[2] + 0.1, 0.80),
    # Beat 4 (Walkie-Talkie Breakthrough): Beep & Chime
    ("temp_vox_audio/sfx_walkie_talkie.wav", beat_start_times[3] + 0.2, 0.70),
    ("temp_vox_audio/sfx_chime.wav", beat_start_times[3] + 1.2, 0.55),
    # Beat 5 (Fixed A/C): Cool breeze whoosh
    ("temp_vox_audio/sfx_whoosh.wav", beat_start_times[4] + 0.5, 0.60),
    # Beat 6 (Outro): Final Chime
    ("temp_vox_audio/sfx_chime.wav", beat_start_times[5] + 1.0, 0.65),
]

for sfx_path, offset, vol in sfx_schedule:
    if os.path.exists(sfx_path):
        _, sfx_data = wavfile.read(sfx_path)
        sfx_data = sfx_data.astype(np.float32) / 32767.0
        s_idx = int(offset * sr)
        e_idx = min(s_idx + len(sfx_data), total_samples)
        act_len = e_idx - s_idx
        if act_len > 0:
            m_left[s_idx:e_idx] += sfx_data[:act_len] * vol
            m_right[s_idx:e_idx] += sfx_data[:act_len] * vol

# Master Limiter / Normalization
peak = max(np.max(np.abs(m_left)), np.max(np.abs(m_right)))
if peak > 0.95:
    m_left = m_left / peak * 0.95
    m_right = m_right / peak * 0.95

master_audio_wav = "vox_build/master_soundtrack.wav"
wavfile.write(master_audio_wav, sr, np.column_stack((m_left, m_right)).astype(np.int16))
print("✓ Master soundtrack compiled!")

# 5. Final Assembly of Vox Explainer (Strict QuickTime / Apple / Web Compatibility)
final_explainer = "poquito_vox_explainer_32s.mp4"
subprocess.run([
    "ffmpeg", "-y",
    "-i", visuals_mp4,
    "-i", master_audio_wav,
    "-c:v", "libx264",
    "-profile:v", "high",
    "-level", "4.1",
    "-pix_fmt", "yuv420p",
    "-preset", "medium",
    "-crf", "18",
    "-c:a", "aac",
    "-b:a", "192k",
    "-movflags", "+faststart",
    "-shortest",
    final_explainer
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
print(f"🎉 Complete Vox Explainer Finished: {final_explainer}")

# 6. Build the 7-Second Vox Retention Loop Reel using Real Keyframes & Standard Codecs
print("🎬 Building Updated 7-Second Vox Reel...")
img_top = Image.open("vox_keyframes/kf_1.png").resize((1080, 960), Image.LANCZOS)
img_bot = Image.open("vox_keyframes/kf_2.png").resize((1080, 960), Image.LANCZOS)

comp_7s = Image.new("RGB", (1080, 1920))
comp_7s.paste(img_top, (0, 0))
comp_7s.paste(img_bot, (0, 960))

draw = ImageDraw.Draw(comp_7s)
draw.rectangle([(0, 946), (1080, 974)], fill="#1B1C1A")
comp_7s.save("vox_build/comp_7s.png")

# Render 7s motion video
comp_7s_raw = "vox_build/comp_7s_raw.mp4"
subprocess.run([
    "ffmpeg", "-y", "-loop", "1", "-i", "vox_build/comp_7s.png",
    "-t", "7.0",
    "-vf", "zoompan=z='if(lte(on,90),1.0+0.0006*on,1.06-0.0006*(on-90))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=210:s=1080x1920,setsar=1,fps=30,format=yuv420p",
    "-c:v", "libx264", "-profile:v", "high", "-level", "4.1", "-pix_fmt", "yuv420p",
    comp_7s_raw
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

final_7s = "duolingo_7s_reel.mp4"
subprocess.run([
    "ffmpeg", "-y",
    "-i", comp_7s_raw,
    "-i", "temp_7s_audio/master_7s_audio.wav",
    "-c:v", "libx264",
    "-profile:v", "high",
    "-level", "4.1",
    "-pix_fmt", "yuv420p",
    "-preset", "medium",
    "-crf", "18",
    "-c:a", "aac",
    "-b:a", "192k",
    "-movflags", "+faststart",
    "-shortest",
    final_7s
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
print(f"🎉 7-Second Vox Reel Finished: {final_7s}")

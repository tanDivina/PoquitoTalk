#!/usr/bin/env python3
import os
import subprocess
import numpy as np
import scipy.io.wavfile as wavfile

print("🎬 Compiling 100% Natural 1.0x Speed Vox Explainer (Zero Voice Speedup)...")
os.makedirs("vox_natural_build", exist_ok=True)

# 1. Read Natural VO files (1.0x speed, uncompressed)
vo_files = [f"vox_natural_audio/beat_{i}.wav" for i in range(1, 7)]
vo_durs = [float(subprocess.check_output([
    "ffprobe", "-v", "error", "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1", f
]).strip()) for f in vo_files]

# Scene slot = natural VO duration + 0.4s breathing room
scene_durs = [d + 0.4 for d in vo_durs]
total_video_dur = sum(scene_durs)

for i, (vd, sd) in enumerate(zip(vo_durs, scene_durs), 1):
    print(f"Beat {i}: VO={vd:.2f}s (100% natural 1.0x) -> Scene Slot={sd:.2f}s")
print(f"Total Video Runtime: {total_video_dur:.2f}s")

# 2. Prepare 6 Omni Flash Video Clips stretched/cut to exact scene durations
prep_clips = []
for i, sd in enumerate(scene_durs, 1):
    omni_clip = f"vox_omni_clips/clip_{i}.mp4"
    out_prep = f"vox_natural_build/prep_clip_{i}.mp4"
    
    subprocess.run([
        "ffmpeg", "-y", "-stream_loop", "2", "-i", omni_clip,
        "-t", f"{sd:.3f}",
        "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30",
        "-c:v", "libx264", "-profile:v", "high", "-level", "4.1",
        "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "18",
        "-an",
        out_prep
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    prep_clips.append(out_prep)

# 3. Concatenate Visual Clips
concat_txt = "vox_natural_build/concat.txt"
with open(concat_txt, "w") as f:
    for c in prep_clips:
        f.write(f"file '{os.path.abspath(c)}'\n")

visuals_mp4 = "vox_natural_build/combined_visuals.mp4"
subprocess.run([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0",
    "-i", concat_txt, "-c", "copy", visuals_mp4
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
print("✓ Combined all 6 Omni Flash visual clips successfully!")

# 4. Master Audio Track (Natural Aoede Voiceover + Acoustic BGM + SFX)
sr = 44100
total_samples = int(total_video_dur * sr)
m_left = np.zeros(total_samples, dtype=np.float32)
m_right = np.zeros(total_samples, dtype=np.float32)

# Load BGM
_, bgm = wavfile.read("temp_vox_audio/bgm_raw.wav")
bgm = bgm.astype(np.float32) / 32767.0
while len(bgm) < total_samples:
    bgm = np.concatenate((bgm, bgm))
m_left += bgm[:total_samples] * 0.14
m_right += bgm[:total_samples] * 0.14

# Add Natural 1.0x Voiceover Tracks
current_offset = 0.0
beat_offsets = []
for i, (vo_f, sd) in enumerate(zip(vo_files, scene_durs), 1):
    beat_offsets.append(current_offset)
    _, vo_data = wavfile.read(vo_f)
    vo_data = vo_data.astype(np.float32) / 32767.0
    s_idx = int((current_offset + 0.10) * sr)
    e_idx = min(s_idx + len(vo_data), total_samples)
    act_len = e_idx - s_idx
    
    # Natural, crisp vocal presence
    m_left[s_idx:e_idx] += vo_data[:act_len] * 1.50
    m_right[s_idx:e_idx] += vo_data[:act_len] * 1.50
    current_offset += sd

# Add Rich Sound Design cues
sfx_schedule = [
    ("temp_vox_audio/sfx_whatsapp.wav", beat_offsets[1] + 3.8, 0.70),
    ("temp_vox_audio/sfx_scratch.wav", beat_offsets[2] + 0.1, 0.80),
    ("temp_vox_audio/sfx_walkie_talkie.wav", beat_offsets[3] + 0.2, 0.70),
    ("temp_vox_audio/sfx_chime.wav", beat_offsets[3] + 1.8, 0.60),
    ("temp_vox_audio/sfx_whoosh.wav", beat_offsets[4] + 0.8, 0.70),
    ("temp_vox_audio/sfx_chime.wav", beat_offsets[5] + 1.0, 0.75),
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

# Master Peak Limiting & Proper 16-bit PCM Scaling
peak = max(np.max(np.abs(m_left)), np.max(np.abs(m_right)))
print(f"Pre-normalization peak: {peak:.3f}")
if peak > 0:
    m_left = (m_left / peak) * 0.92
    m_right = (m_right / peak) * 0.92

int16_left = np.clip(m_left * 32767.0, -32768, 32767).astype(np.int16)
int16_right = np.clip(m_right * 32767.0, -32768, 32767).astype(np.int16)

master_audio_wav = "vox_natural_build/master_soundtrack.wav"
wavfile.write(master_audio_wav, sr, np.column_stack((int16_left, int16_right)))

_, check_data = wavfile.read(master_audio_wav)
print(f"✓ Master soundtrack written! Max amplitude: {np.max(np.abs(check_data))}, Non-zero samples: {np.count_nonzero(check_data)} / {check_data.size}")

# 5. Final Assembly of Natural 1.0x Vox Explainer
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
    "-color_range", "tv",
    "-colorspace", "bt709",
    "-color_primaries", "bt709",
    "-color_trc", "bt709",
    "-c:a", "aac",
    "-b:a", "192k",
    "-ar", "44100",
    "-ac", "2",
    "-movflags", "+faststart",
    "-shortest",
    final_explainer
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
print(f"🎉 Complete 100% Natural Vox Explainer Finished: {final_explainer}")

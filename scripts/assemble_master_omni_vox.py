#!/usr/bin/env python3
import os
import subprocess
import numpy as np
import scipy.io.wavfile as wavfile

print("🎬 Compiling Master Omni Flash Vox Explainer & 7s Reel with Verified Audio...")
os.makedirs("vox_v2_build", exist_ok=True)

# Target beat durations (Total = 31.5s)
target_durs = [5.0, 5.5, 5.0, 5.8, 5.2, 5.0]
total_video_dur = sum(target_durs)
print(f"Target Total Explainer Runtime: {total_video_dur:.2f}s")

# 1. Process Voiceover Tracks with exact tempo matching
vo_files = []
for i, target_d in enumerate(target_durs, 1):
    raw_mp3 = f"vox_v2_audio/beat_{i}.mp3"
    raw_dur = float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", raw_mp3
    ]).strip())
    
    # Calculate required tempo speedup so VO comfortably finishes within beat (leaving 0.3s pause at end)
    speech_target = target_d - 0.3
    tempo = max(1.0, min(1.65, raw_dur / speech_target))
    
    out_wav = f"vox_v2_build/vo_beat_{i}.wav"
    subprocess.run([
        "ffmpeg", "-y", "-i", raw_mp3,
        "-filter:a", f"atempo={tempo:.3f},volume=2.2",
        "-ar", "44100", "-ac", "1",
        out_wav
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    
    vo_files.append(out_wav)
    act_dur = float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", out_wav
    ]).strip())
    print(f"Beat {i} VO: raw={raw_dur:.2f}s -> tempo={tempo:.2f}x -> act={act_dur:.2f}s (beat slot={target_d:.1f}s)")

# 2. Prepare 6 Omni Flash Video Clips stretched/looped to exact target durations
prep_clips = []
for i, target_d in enumerate(target_durs, 1):
    omni_clip = f"vox_omni_clips/clip_{i}.mp4"
    out_prep = f"vox_v2_build/prep_clip_{i}.mp4"
    print(f"Preparing Omni Flash clip {i} for slot {target_d:.1f}s...")
    
    subprocess.run([
        "ffmpeg", "-y", "-stream_loop", "3", "-i", omni_clip,
        "-t", f"{target_d:.3f}",
        "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30",
        "-c:v", "libx264", "-profile:v", "high", "-level", "4.1",
        "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "18",
        "-an",
        out_prep
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    prep_clips.append(out_prep)

# 3. Concatenate Visual Clips
concat_txt = "vox_v2_build/concat.txt"
with open(concat_txt, "w") as f:
    for c in prep_clips:
        f.write(f"file '{os.path.abspath(c)}'\n")

visuals_mp4 = "vox_v2_build/combined_visuals.mp4"
subprocess.run([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0",
    "-i", concat_txt, "-c", "copy", visuals_mp4
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
print("✓ Combined all 6 Omni Flash visual clips successfully!")

# 4. Master Audio Track (Crystal Clear Aoede Voiceover + Acoustic BGM + SFX)
sr = 44100
total_samples = int(total_video_dur * sr)
m_left = np.zeros(total_samples, dtype=np.float32)
m_right = np.zeros(total_samples, dtype=np.float32)

# Load BGM
_, bgm = wavfile.read("temp_vox_audio/bgm_raw.wav")
bgm = bgm.astype(np.float32) / 32767.0
while len(bgm) < total_samples:
    bgm = np.concatenate((bgm, bgm))
m_left += bgm[:total_samples] * 0.15
m_right += bgm[:total_samples] * 0.15

# Add Voiceover Tracks with exact beat offsets
current_offset = 0.0
beat_offsets = []
for i, (vo_f, target_d) in enumerate(zip(vo_files, target_durs), 1):
    beat_offsets.append(current_offset)
    _, vo_data = wavfile.read(vo_f)
    vo_data = vo_data.astype(np.float32) / 32767.0
    s_idx = int((current_offset + 0.12) * sr)
    e_idx = min(s_idx + len(vo_data), total_samples)
    act_len = e_idx - s_idx
    # Strong, loud vocal presence
    m_left[s_idx:e_idx] += vo_data[:act_len] * 1.60
    m_right[s_idx:e_idx] += vo_data[:act_len] * 1.60
    current_offset += target_d

# Add Rich Sound Design
sfx_schedule = [
    ("temp_vox_audio/sfx_whatsapp.wav", beat_offsets[1] + 1.6, 0.75),
    ("temp_vox_audio/sfx_scratch.wav", beat_offsets[2] + 0.1, 0.85),
    ("temp_vox_audio/sfx_walkie_talkie.wav", beat_offsets[3] + 0.2, 0.75),
    ("temp_vox_audio/sfx_chime.wav", beat_offsets[3] + 1.2, 0.60),
    ("temp_vox_audio/sfx_whoosh.wav", beat_offsets[4] + 0.5, 0.70),
    ("temp_vox_audio/sfx_chime.wav", beat_offsets[5] + 0.8, 0.75),
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
    # Normalize to 92% of full scale
    m_left = (m_left / peak) * 0.92
    m_right = (m_right / peak) * 0.92

# Multiply by 32767 before int16 conversion!
int16_left = np.clip(m_left * 32767.0, -32768, 32767).astype(np.int16)
int16_right = np.clip(m_right * 32767.0, -32768, 32767).astype(np.int16)

master_audio_wav = "vox_v2_build/master_soundtrack.wav"
wavfile.write(master_audio_wav, sr, np.column_stack((int16_left, int16_right)))

# Verify wavfile output
_, check_data = wavfile.read(master_audio_wav)
print(f"✓ Master soundtrack written! Max amplitude: {np.max(np.abs(check_data))}, Non-zero samples: {np.count_nonzero(check_data)} / {check_data.size}")

# 5. Final Assembly of 32s Vox Explainer
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
print(f"🎉 Complete 32-Second Vox Explainer Finished: {final_explainer}")

# 6. Re-assemble 7-Second Duolingo Retention Reel using Omni Flash animations & verified audio
print("🎬 Building Animated 7-Second Omni Flash Reel...")
# Build 7s audio
vo_7s_wav = "vox_v2_build/vo_beat_1.wav"
_, vo_7s_d = wavfile.read(vo_7s_wav)
vo_7s_d = vo_7s_d.astype(np.float32) / 32767.0

s7_total = int(7.0 * sr)
s7_l = np.zeros(s7_total, dtype=np.float32)
s7_r = np.zeros(s7_total, dtype=np.float32)

# BGM
s7_l += bgm[:s7_total] * 0.15
s7_r += bgm[:s7_total] * 0.15

# VO
s7_l[:min(len(vo_7s_d), s7_total)] += vo_7s_d[:s7_total] * 1.6
s7_r[:min(len(vo_7s_d), s7_total)] += vo_7s_d[:s7_total] * 1.6

# Peak limit & scale
p7 = max(np.max(np.abs(s7_l)), np.max(np.abs(s7_r)))
if p7 > 0:
    s7_l = (s7_l / p7) * 0.92
    s7_r = (s7_r / p7) * 0.92

master_7s_wav = "vox_v2_build/master_7s_soundtrack.wav"
wavfile.write(master_7s_wav, sr, np.column_stack((
    np.clip(s7_l * 32767.0, -32768, 32767).astype(np.int16),
    np.clip(s7_r * 32767.0, -32768, 32767).astype(np.int16)
)))

subprocess.run([
    "ffmpeg", "-y",
    "-stream_loop", "2", "-i", "vox_omni_clips/clip_1.mp4",
    "-stream_loop", "2", "-i", "vox_omni_clips/clip_2.mp4",
    "-i", master_7s_wav,
    "-filter_complex",
    "[0:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960,setsar=1[top];"
    "[1:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960,setsar=1[bot];"
    "[top][bot]vstack=inputs=2[v]",
    "-map", "[v]", "-map", "2:a",
    "-t", "7.0",
    "-c:v", "libx264", "-profile:v", "high", "-level", "4.1",
    "-pix_fmt", "yuv420p", "-preset", "medium", "-crf", "18",
    "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2",
    "-movflags", "+faststart",
    "duolingo_7s_reel.mp4"
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
print("🎉 Animated 7-Second Reel Finished: duolingo_7s_reel.mp4")

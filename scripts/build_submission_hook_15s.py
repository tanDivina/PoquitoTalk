#!/usr/bin/env python3
"""
RevenueCat Shipathon 2026 — master submission video, 0:00–0:15 hook ("Left on Read").

Builds a 1920x1080 / 30fps / stereo AAC hook:
  A  panga at full throttle         "NO ROADS."
  B  aerial water-taxi wake         "JUST BOATS."
  C  dry kitchen tap                "THEN THE WATER STOPS."
  D  UI: formal Spanish text, blue ticks, typing… gone     "Left on Read."
  E  plumber at the rain tank       "OUT HERE, EVERYONE TALKS."   (music drops in)
  F  UI: English in → Panamanian Spanish voice note out → sent to WhatsApp
  G  UI: contractor web HUD, hold-to-talk reply → English playback (male → male, Rule 11)
  H  Lockup: Poquito + "Voice notes that get answered."

No narrator (Rule 16: no robotic VO). The first human voices judges hear are the
voice notes themselves. Dorien's own VO starts at 0:15 in the main cut.

Every played voice note is muxed at its exact frame cue with adelay (Rule 7), and
UI shot lengths are computed from the real clip durations so the screen stays up
for the whole clip.

Usage:
  python3 scripts/build_submission_hook_15s.py              # build everything (cached assets reused)
  python3 scripts/build_submission_hook_15s.py --regen-audio
Output:
  cinematic_promo_build/submission_hook_15s/hook_15s.mp4
  cinematic_promo_build/submission_hook_15s/hook_contact_sheet.jpg
"""
import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "cinematic_promo_build/submission_hook_15s"
AUDIO = OUT / "audio"
FRAMES = OUT / "frames"
CLIPS = OUT / "clips"

FPS = 30
W, H = 1920, 1080
FONT = ROOT / "videos/ugc-proper-series/fonts/Lexend-Bold.ttf"
# scripts/promo_bg_music.aac and soundtrack_recreated_*.aac contain a baked-in English VO
# ("Terrified of sending voice messages…") — never use them as a music bed.
MUSIC_FALLBACK = ROOT / "temp_vox_audio/bgm_raw.wav"
MUSIC_PROMPT = ("Warm upbeat Caribbean island acoustic track: nylon-string acoustic guitar strumming, light hand "
                "percussion and shaker, gentle bass, sunny and human, 100 BPM, strong downbeat at the start, "
                "instrumental only, no vocals")
MASCOT = ROOT / "src/assets/poquito_front_talking_v2_clean_256.webp"

KLING = {
    "panga": ROOT / "cinematic_promo_build/kling_shots/shot10_bocas_panga_boat_16x9.mp4",
    "aerial": ROOT / "cinematic_promo_build/kling_shots/shot01_drone_bocas_16x9.mp4",
    "dry_tap": ROOT / "cinematic_promo_build/dry_jiggle_2s.mp4",
    "plumber": ROOT / "cinematic_promo_build/kling_shots/shot04_bocas_plumber_16x9.mp4",
}
SFX = {
    "whoosh": ROOT / "temp_vox_audio/sfx_whoosh.wav",
    "tick": ROOT / "brag-output/sfx/whatsapp_click.ogg",
    "ping": ROOT / "temp_vox_audio/sfx_whatsapp.wav",
    "chime": ROOT / "brag-output/sfx/waveform_chime.ogg",
    "chirp": ROOT / "brag-output/sfx/walkie_chirp.ogg",
    "beep": ROOT / "assets/audio/walkie_beep.mp3",
    "settle": ROOT / "brag-output/sfx/cta_settle.ogg",
}

# The app's own personas (src/services/elevenLabsVoice.ts ELEVENLABS_PERSONAS):
SOFIA = "cgSgspJ2msm6clMCkdW9"  # Female — the user's chosen outgoing voice
DIEGO = "JBFqnCBsd6RMkjVDRZzb"  # Male — Ricardo is male, so his reply stays male in English too (Rule 11)
LINES = {
    "out_es": ("¡Buenas! Se me fue el agua. ¿Me puede chequear la bomba hoy?", SOFIA),
    "reply_es": ("¡Dale! Paso a las dos.", DIEGO),
    "reply_en": ("Sure! I'll come by at two.", DIEGO),
}
OUT_EN_TEXT = "The water stopped. Can you check the pump today?"
SFX_PROMPTS = {
    "engine": ("Small wooden panga boat with an outboard motor at full throttle, hull slapping over choppy "
               "Caribbean waves, spray and wind, close-up, no music", 3.0),
    "dry_tap": ("Old kitchen faucet handle squeaks open, pipes sputter and cough air, a single drip, "
                "then silence, no water flowing", 1.5),
}

# ---- Timeline (seconds). UI shot lengths are derived from audio durations in plan(). ----
KLING_SHOTS = [  # (key, clip, source in-point, duration, headline, text y)
    ("A", "panga", 0.6, 1.20, "NO ROADS.", H - 250),
    ("B", "aerial", 1.2, 1.00, "JUST BOATS.", H - 250),
    ("C", "dry_tap", 0.2, 1.05, "THEN THE WATER STOPS.", H - 250),
    # D (UI) sits here
    ("E", "plumber", 1.0, 1.00, "OUT HERE, EVERYONE TALKS.", H - 230),
]
D_LEN = 2.00


def run(cmd, **kw):
    print("  $", " ".join(str(c) for c in cmd)[:220])
    subprocess.run([str(c) for c in cmd], check=True, **kw)


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def api_key():
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            if "ELEVENLABS_API_KEY" in line and "=" in line:
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("ELEVENLABS_API_KEY")


# ---------------------------------------------------------------- audio assets
def build_audio(regen):
    AUDIO.mkdir(parents=True, exist_ok=True)
    key = api_key()
    for name, (text, voice) in LINES.items():
        path = AUDIO / f"{name}.mp3"
        if path.exists() and not regen:
            continue
        if not key:
            sys.exit("No ElevenLabs key in .env — cannot generate dialogue lines.")
        r = requests.post(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}",
                          headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
                          json={"text": text, "model_id": "eleven_multilingual_v2",
                                # Same settings the app sends.
                                "voice_settings": {"stability": 0.45, "similarity_boost": 0.85, "style": 0.20,
                                                   "use_speaker_boost": True}},
                          timeout=60)
        r.raise_for_status()
        path.write_bytes(r.content)
        print(f"  generated {path.name}")

    for name, (prompt, secs) in SFX_PROMPTS.items():
        path = AUDIO / f"sfx_{name}.mp3"
        if path.exists() and not regen:
            continue
        ok = False
        if key:
            r = requests.post("https://api.elevenlabs.io/v1/sound-generation",
                              headers={"xi-api-key": key, "Content-Type": "application/json"},
                              json={"text": prompt, "duration_seconds": secs, "prompt_influence": 0.5}, timeout=90)
            if r.status_code == 200:
                path.write_bytes(r.content)
                ok = True
                print(f"  generated {path.name}")
            else:
                print(f"  sound-generation failed ({r.status_code}); synthesizing fallback for {name}")
        if not ok:
            synth_sfx(name, secs, path)

    # Trim leading/trailing silence from dialogue so cues land on the frame.
    for name in LINES:
        src, dst = AUDIO / f"{name}.mp3", AUDIO / f"{name}_trim.wav"
        run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af",
             "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
             "silenceremove=start_periods=1:start_threshold=-45dB,areverse,aresample=44100",
             "-ac", "2", dst])
    return {n: duration(AUDIO / f"{n}_trim.wav") for n in LINES}


def build_music(regen):
    path = AUDIO / "music_bed.mp3"
    if not path.exists() or regen:
        key = api_key()
        r = requests.post("https://api.elevenlabs.io/v1/music",
                          headers={"xi-api-key": key or "", "Content-Type": "application/json"},
                          json={"prompt": MUSIC_PROMPT, "music_length_ms": 12000, "force_instrumental": True},
                          timeout=180)
        if r.status_code != 200:
            print(f"  music generation failed ({r.status_code}); using {MUSIC_FALLBACK.relative_to(ROOT)}")
            return MUSIC_FALLBACK
        path.write_bytes(r.content)
        print(f"  generated {path.name}")
    return path


def assert_no_speech(path, seconds):
    """Refuse a music bed with a voice in it (Whisper logprob > -1.0 means real words, not music hallucination)."""
    if not shutil.which("whisper"):
        print("  whisper not installed — skipping music speech check")
        return
    probe = OUT / "music_probe.wav"
    run(["ffmpeg", "-v", "error", "-y", "-i", path, "-t", seconds, "-ac", 1, "-ar", 16000, probe])
    subprocess.run(["whisper", probe, "--model", "base", "--output_dir", OUT, "--output_format", "json",
                    "--fp16", "False"], capture_output=True, check=True)
    segs = json.loads((OUT / "music_probe.json").read_text())["segments"]
    import re
    labels = {"", "music", "musica", "música", "instrumental", "applause"}  # Whisper's soundtrack captions
    speech = [s for s in segs if s["avg_logprob"] > -1.0 and s["no_speech_prob"] < 0.5
              and re.sub(r"[^a-záéíóúñ ]", "", s["text"].lower()).strip() not in labels]
    if speech:
        sys.exit(f"Music bed {path} contains speech: {speech[0]['text']!r} — pick another bed.")


def synth_sfx(name, secs, path):
    if name == "engine":
        expr = ("anoisesrc=color=brown:amplitude=0.6:d={d}[n];"
                "sine=f=62:d={d}[s];[s]volume=0.5,tremolo=f=11:d=0.6[m];"
                "[n][m]amix=inputs=2,lowpass=f=900,tremolo=f=1.3:d=0.35")
    else:
        expr = "anoisesrc=color=pink:amplitude=0.25:d={d},highpass=f=1800,tremolo=f=9:d=0.9,afade=t=out:st=0.6:d=0.8"
    run(["ffmpeg", "-v", "error", "-y", "-filter_complex", expr.format(d=secs), "-ac", "2", path])


# ---------------------------------------------------------------- UI scenes
def b64(path, mime):
    return f"data:{mime};base64,{base64.b64encode(Path(path).read_bytes()).decode()}"


HTML = r"""<!doctype html><html><head><meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
:root{--sand:#FAF8F5;--ink:#1A1208;--muted:#5C4E3A;--terra:#964824;--emerald:#059669;--green:#10B981;--wa:#25D366;}
*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
body{width:1920px;height:1080px;background:var(--sand);font-family:'Plus Jakarta Sans',sans-serif;color:var(--ink);overflow:hidden;position:relative}
.glow{position:absolute;inset:0;background:radial-gradient(ellipse 900px 700px at 78% 55%,rgba(150,72,36,.07),transparent 70%),radial-gradient(ellipse 700px 500px at 10% 90%,rgba(5,150,105,.06),transparent 70%)}
.scene{position:absolute;inset:0;display:none}
.left{position:absolute;left:130px;top:0;bottom:0;width:760px;display:flex;flex-direction:column;justify-content:center;gap:10px}
.eyebrow{font:800 22px 'Plus Jakarta Sans';letter-spacing:3px;text-transform:uppercase;color:var(--terra);margin-bottom:18px;display:flex;align-items:center;gap:12px}
h1{font:900 92px/1.02 'Lexend';letter-spacing:-3px;color:var(--ink);transition:none}
h1.terra{color:var(--terra)} h1.em{color:var(--emerald)}
.k{opacity:0;transform:translateY(26px)}
.phone{position:absolute;right:150px;top:84px;transform:scale(1.32);transform-origin:top right;width:470px;height:940px;border-radius:64px;background:#2B2118;padding:14px;box-shadow:0 40px 80px rgba(60,30,10,.18),0 8px 24px rgba(0,0,0,.08)}
.screen{width:100%;height:100%;border-radius:52px;background:#FFFFFF;overflow:hidden;position:relative;display:flex;flex-direction:column}
.status{height:54px;display:flex;align-items:center;justify-content:space-between;padding:0 34px;font:700 17px 'Plus Jakarta Sans';color:var(--ink)}
/* chat */
.chat-head{display:flex;align-items:center;gap:14px;padding:12px 22px 16px;border-bottom:1.5px solid #EFEAE2}
.avatar{width:50px;height:50px;border-radius:50%;background:#E6F4EC;color:#047857;display:flex;align-items:center;justify-content:center;font:800 18px 'Lexend'}
.who b{display:block;font:800 19px 'Plus Jakarta Sans'} .who span{font:600 15px 'Plus Jakarta Sans';color:#7C7266}
.chat-body{flex:1;background:#F4F1EA;padding:26px 18px;display:flex;flex-direction:column;gap:14px}
.bubble{max-width:350px;padding:14px 16px 10px;border-radius:20px;font:600 18px/1.4 'Plus Jakarta Sans';box-shadow:0 1px 2px rgba(0,0,0,.06)}
.bubble.out{align-self:flex-end;background:#DCF3E4;border-bottom-right-radius:6px}
.bubble.in{align-self:flex-start;background:#fff;border-bottom-left-radius:6px}
.meta{display:flex;justify-content:flex-end;align-items:center;gap:6px;font:600 13px 'Plus Jakarta Sans';color:#7C7266;margin-top:6px}
.typing{display:flex;gap:6px;padding:16px 18px}
.typing i{width:9px;height:9px;border-radius:50%;background:#A89F92;display:block}
/* app */
.app-head{display:flex;align-items:center;gap:12px;padding:10px 26px 18px}
.app-head b{font:800 23px 'Lexend';letter-spacing:-.5px}
.card{margin:0 20px 16px;background:#fff;border:2px solid rgba(150,72,36,.12);border-radius:24px;padding:18px 20px;box-shadow:0 12px 30px rgba(0,0,0,.07),0 2px 8px rgba(0,0,0,.03)}
.label{font:800 13px 'Plus Jakarta Sans';letter-spacing:1.6px;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:8px;margin-bottom:10px}
.en{font:700 22px/1.35 'Plus Jakarta Sans';color:var(--ink);min-height:60px}
.es{font:700 19px/1.4 'Plus Jakarta Sans';color:var(--terra);margin-top:12px}
.wave{display:flex;align-items:center;gap:4px;height:64px}
.wave i{display:block;width:5px;border-radius:3px;background:#E5DED3}
.row{display:flex;align-items:center;gap:14px}
.play{width:48px;height:48px;border-radius:50%;background:var(--emerald);display:flex;align-items:center;justify-content:center;flex:none}
.send{margin:4px 20px 0;height:66px;border-radius:20px;background:var(--wa);color:#fff;display:flex;align-items:center;justify-content:center;gap:12px;font:800 20px 'Plus Jakarta Sans'}
.chip{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:#ECFDF5;color:#047857;font:800 14px 'Plus Jakarta Sans';border:1.5px solid #A7F3D0}
/* hud */
.hud-title{font:800 26px 'Lexend';text-align:center;letter-spacing:-.5px;margin-top:22px}
.hud-sub{font:600 16px/1.45 'Plus Jakarta Sans';color:#78716C;text-align:center;padding:8px 44px 0}
.mascot-btn{margin:26px auto 0;width:300px;height:300px;border-radius:50%;background:#F0FDF4;border:3px solid #BBF7D0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;position:relative}
.pill{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:999px;background:var(--terra);color:#fff;font:800 15px 'Plus Jakarta Sans';letter-spacing:1px}
.ring{position:absolute;inset:-14px;border-radius:50%;border:4px solid rgba(220,38,38,.35);opacity:0}
.toast{position:absolute;left:130px;bottom:110px;width:640px;z-index:5;background:#fff;border:2px solid rgba(5,150,105,.25);border-radius:26px;padding:20px 24px;box-shadow:0 24px 50px rgba(0,0,0,.12);opacity:0}
.lock{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}
.lock img{width:330px;height:330px}
.wordmark{font:900 124px 'Lexend';letter-spacing:-4px;color:var(--ink)}
.wordmark span{color:var(--terra)}
.tag{font:700 42px 'Plus Jakarta Sans';color:var(--muted)}
</style></head><body><div class="glow"></div>

<!-- D: Left on Read -->
<section class="scene" id="D">
  <div class="left">
    <div class="eyebrow"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>9:14 AM &middot; Isla Carenero</div>
    <h1 class="k" id="d1">You text the plumber.</h1>
    <h1 class="k terra" id="d2">Left on Read.</h1>
  </div>
  <div class="phone"><div class="screen">
    <div class="status"><span>9:14</span><span>
      <svg width="22" height="16" viewBox="0 0 24 18" fill="none" stroke="#1A1208" stroke-width="2.4" stroke-linecap="round"><path d="M3 15h1M8 12v3M13 8v7M18 4v11"/></svg></span></div>
    <div class="chat-head"><div class="avatar">RP</div><div class="who"><b>Ricardo &middot; Plomería</b><span id="dstatus">en línea</span></div></div>
    <div class="chat-body">
      <div class="bubble out k" id="dmsg">Estimado señor: le escribo para informarle que la bomba de agua de mi residencia ha cesado su funcionamiento. ¿Sería tan amable de acudir a mi domicilio a la brevedad posible?
        <div class="meta">9:14 <svg id="ticks" width="22" height="14" viewBox="0 0 26 16" fill="none" stroke="#9A9186" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 8.5l4 4 8-9"/><path d="M10.5 12.5l1 0 8-9"/></svg></div>
      </div>
      <div class="bubble in typing k" id="dtyping"><i></i><i></i><i></i></div>
    </div>
  </div></div>
</section>

<!-- F: PoquitoTalk voice note -->
<section class="scene" id="F">
  <div class="left">
    <div class="eyebrow"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg>PoquitoTalk</div>
    <h1 class="k" id="f1">Speak English.</h1>
    <h1 class="k em" id="f2">They hear Bocas Spanish.</h1>
  </div>
  <div class="phone"><div class="screen" style="background:var(--sand)">
    <div class="status"><span>9:16</span><span></span></div>
    <div class="app-head"><img src="__MASCOT__" width="44" height="44"><b>PoquitoTalk</b></div>
    <div class="card"><div class="label">You said &middot; English</div><div class="en" id="fen"></div></div>
    <div class="card k" id="fcard">
      <div class="label"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>Panamanian Spanish voice note</div>
      <div class="row"><div class="play"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M6 4l14 8-14 8z"/></svg></div><div class="wave" id="fwave"></div></div>
      <div class="es">__OUT_ES__</div>
    </div>
    <div class="send k" id="fsend"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg><span id="fsendt">Send to WhatsApp</span></div>
  </div></div>
</section>

<!-- G: Contractor HUD reply -->
<section class="scene" id="G">
  <div class="left" style="width:820px;justify-content:flex-start;padding-top:210px">
    <div class="eyebrow"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Ricardo, on his phone</div>
    <h1 class="k" id="g1">He replies by voice.</h1>
    <h1 class="k terra" id="g2">No app.<br>No download.</h1>
  </div>
  <div class="phone" style="right:110px"><div class="screen" style="background:#FBF9F5">
    <div class="status"><span>9:17</span><span></span></div>
    <div class="hud-title">Canal Walkie-Talkie</div>
    <div class="hud-sub">Responde con tu voz en español. Se traducirá a inglés claro.</div>
    <div class="mascot-btn" id="gbtn"><div class="ring" id="gring"></div>
      <svg viewBox="0 0 180 180" width="170" height="170" fill="none">
        <path d="M 30 152 Q 80 148 135 152" stroke="#B45309" stroke-width="7" stroke-linecap="round"/>
        <path d="M 52 142 C 50 149 52 156 56 156 M 60 142 C 58 149 60 156 64 156 M 74 142 C 72 149 74 156 78 156 M 82 142 C 80 149 82 156 86 156" stroke="#F59E0B" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M 40 142 C 30 124 28 104 32 82 C 36 54 54 30 78 30 C 98 30 108 48 106 68 C 103 90 104 118 98 134 C 88 150 62 154 40 142 Z" fill="#10B981" stroke="#047857" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M 63 31.4 C 59 24 55 19 49 18" stroke="#047857" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M 73 29.8 C 69 23 65 19 59 17" stroke="#047857" stroke-width="3" stroke-linecap="round"/>
        <circle cx="82" cy="54" r="9" fill="#FFF" stroke="#047857" stroke-width="2.5"/><circle cx="80.5" cy="54" r="4.5" fill="#0F172A"/><circle cx="78.5" cy="52" r="1.8" fill="#FFF"/>
        <path d="M 96 48 C 112 48 120 62 106 74 C 101 77 94 73 95 67 C 97 61 94 52 96 48 Z" fill="#F59E0B" stroke="#047857" stroke-width="3.5" stroke-linejoin="round"/>
        <g transform="translate(-4,0)"><path d="M 129 45 L 129 70" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round"/><circle cx="129" cy="43" r="3.5" fill="#1E293B"/>
          <rect x="116" y="70" width="28" height="46" rx="6" fill="#1E293B" stroke="#047857" stroke-width="2.5"/>
          <circle id="gled" cx="125" cy="78" r="2.8" fill="#25D366"/>
          <g id="gwaves" opacity="0"><path d="M 135 38 A 10 10 0 0 1 145 48" stroke="#DC2626" stroke-width="3" stroke-linecap="round"/><path d="M 139 32 A 16 16 0 0 1 153 46" stroke="#DC2626" stroke-width="3" stroke-linecap="round"/></g></g>
        <path d="M 44 94 C 48 80 60 76 72 84 C 84 92 98 94 112 96 C 116 98 116 103 110 105 C 97 108 82 124 60 126 C 49 120 42 108 44 94 Z" fill="#06B6D4" stroke="#047857" stroke-width="3.5" stroke-linejoin="round"/>
      </svg>
      <div class="pill" id="gpill"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg><span id="gpillt">MANTÉN PARA HABLAR</span></div>
    </div>
    <div class="card" style="margin-top:28px"><div class="label">Tú dijiste</div><div class="es" style="margin-top:0;min-height:30px" id="ges"></div></div>
  </div></div>
  <div class="toast" id="gtoast">
    <div class="label" style="color:#047857"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>Your app &middot; English &middot; Ricardo's voice</div>
    <div class="row"><div class="play"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M6 4l14 8-14 8z"/></svg></div><div class="wave" id="gwave"></div></div>
    <div class="en" style="min-height:0;margin-top:8px">__REPLY_EN__</div>
  </div>
</section>

<!-- H: Lockup -->
<section class="scene" id="Hs">
  <div class="lock"><img src="__MASCOT__" class="k" id="h0"><div class="wordmark k" id="h1">Poquito<span>Talk</span></div><div class="tag k" id="h2">Voice notes that get answered.</div></div>
</section>

<script>
const T = __TIMING__;
const $ = id => document.getElementById(id);
const clamp = (x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease = x => 1-Math.pow(1-clamp(x),3);
function pop(el,t,t0,d=0.22){const p=ease((t-t0)/d);el.style.opacity=p;el.style.transform=`translateY(${(1-p)*26}px)`;}
function hide(el){el.style.opacity=0;}
function seeded(n,seed){let s=seed,a=[];for(let i=0;i<n;i++){s=(s*9301+49297)%233280;a.push(s/233280);}return a;}
function buildWave(id,n,seed){const el=$(id);const r=seeded(n,seed);el.innerHTML=r.map(v=>`<i style="height:${14+v*46}px"></i>`).join('');return r;}
const fw = buildWave('fwave',40,7), gw = buildWave('gwave',44,3);
function paintWave(id,r,progress,t,live){[...$(id).children].forEach((b,i)=>{const on=i/r.length<progress;b.style.background=on?'#059669':'#E5DED3';
  const wob=live&&on?0.75+0.25*Math.sin(t*22+i*1.7):1;b.style.height=`${(14+r[i]*46)*wob}px`;});}
function type(el,text,p){el.textContent=text.slice(0,Math.round(text.length*clamp(p)));}

function render(scene,t){
  document.querySelectorAll('.scene').forEach(s=>s.style.display='none');
  $(scene).style.display='block';
  if(scene==='D'){
    pop($('d1'),t,0.0); pop($('dmsg'),t,0.08,0.25);
    $('ticks').setAttribute('stroke', t>0.55?'#34B7F1':'#9A9186');
    const typing = t>0.85 && t<1.35; $('dtyping').style.opacity=typing?1:0; $('dtyping').style.transform='none';
    [...$('dtyping').children].forEach((d,i)=>d.style.opacity=0.35+0.65*Math.abs(Math.sin(t*9-i*0.8)));
    $('dstatus').textContent = t>1.35 ? 'últ. vez hoy a las 9:14' : (typing ? 'escribiendo…' : 'en línea');
    pop($('d2'),t,1.45,0.18);
  }
  if(scene==='F'){
    pop($('f1'),t,0.0); type($('fen'),__OUT_EN__,t/T.F_type);
    pop($('fcard'),t,T.F_type+0.05,0.2);
    const p=clamp((t-T.F_play)/T.out_dur); paintWave('fwave',fw,p,t,p>0&&p<1);
    pop($('f2'),t,T.F_play+0.1);
    pop($('fsend'),t,T.F_play+0.25,0.2);
    const sent=t>=T.F_send; $('fsend').style.background=sent?'#047857':'#25D366';
    $('fsendt').textContent=sent?'Sent to Ricardo on WhatsApp':'Send to WhatsApp';
    if(t>=T.F_send-0.12&&t<T.F_send){$('fsend').style.transform='scale(.96)';}
  }
  if(scene==='G'){
    pop($('g1'),t,0.0); pop($('g2'),t,T.G_en-0.1);
    const rec=t>=T.G_press&&t<T.G_release;
    $('gbtn').style.transform=rec?'scale(.95)':'scale(1)';
    $('gbtn').style.background=rec?'#FEF2F2':'#F0FDF4'; $('gbtn').style.borderColor=rec?'#FECACA':'#BBF7D0';
    $('gring').style.opacity=rec?0.4+0.6*Math.abs(Math.sin(t*5)):0;
    $('gwaves').setAttribute('opacity',rec?1:0); $('gled').setAttribute('fill',rec?'#EF4444':'#25D366');
    $('gpill').style.background=rec?'#DC2626':(t>=T.G_release?'#16A34A':'#964824');
    $('gpillt').textContent=rec?'GRABANDO…':(t>=T.G_release?'ENVIADO':'MANTÉN PARA HABLAR');
    type($('ges'),__REPLY_ES__,(t-T.G_press)/T.es_dur);
    const tp=ease((t-(T.G_en-0.2))/0.22); $('gtoast').style.opacity=tp; $('gtoast').style.transform=`translateY(${(1-tp)*30}px)`;
    paintWave('gwave',gw,clamp((t-T.G_en)/T.en_dur),t,t>T.G_en&&t<T.G_en+T.en_dur);
  }
  if(scene==='Hs'){pop($('h0'),t,0.0,0.25); pop($('h1'),t,0.08,0.25); pop($('h2'),t,0.25,0.25);}
}
</script></body></html>"""


def render_ui(timing, lens):
    from playwright.sync_api import sync_playwright

    html = (HTML.replace("__MASCOT__", b64(MASCOT, "image/webp"))
            .replace("__OUT_ES__", LINES["out_es"][0])
            .replace("__REPLY_EN__", LINES["reply_en"][0])
            .replace("__OUT_EN__", json.dumps(OUT_EN_TEXT))
            .replace("__REPLY_ES__", json.dumps(LINES["reply_es"][0]))
            .replace("__TIMING__", json.dumps(timing)))
    page_path = OUT / "hook_ui.html"
    page_path.write_text(html)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": W, "height": H})
        page.goto(page_path.as_uri())
        page.wait_for_load_state("networkidle")
        page.evaluate("document.fonts.ready")
        for scene, length in lens.items():
            d = FRAMES / scene
            shutil.rmtree(d, ignore_errors=True)
            d.mkdir(parents=True)
            n = round(length * FPS)
            for i in range(n):
                page.evaluate(f"render('{scene}', {i / FPS})")
                page.screenshot(path=str(d / f"{i:04d}.jpg"), type="jpeg", quality=94)
            print(f"  rendered {scene}: {n} frames")
        browser.close()

    for scene in lens:
        run(["ffmpeg", "-v", "error", "-y", "-framerate", FPS, "-i", FRAMES / scene / "%04d.jpg",
             "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-r", FPS, CLIPS / f"{scene}.mp4"])


# ---------------------------------------------------------------- kling shots
def text_file(name, text):
    path = CLIPS / f"text_{name}.txt"
    path.write_text(text)
    return path


def render_kling():
    for key, clip, ss, dur, text, y in KLING_SHOTS:
        # Slow push-in so every cut has motion even if the Kling clip settles.
        vf = (f"scale=1932:1080:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},"
              f"zoompan=z='1+0.0009*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps={FPS},"
              f"eq=saturation=1.08:contrast=1.03,"
              f"drawtext=fontfile='{FONT}':textfile='{text_file(key, text)}':fontsize=96:fontcolor=white:"
              f"x=120:y={y}:shadowcolor=black@0.85:shadowx=4:shadowy=5:borderw=4:bordercolor=black@0.65:"
              f"alpha='min(1,max(0,(t-0.08)/0.12))'")
        if key == "A":
            vf += (f",drawtext=fontfile='{FONT}':textfile='{text_file('tag', 'BOCAS DEL TORO, PANAMA')}':fontsize=34:fontcolor=white:"
                   f"x=124:y={y - 62}:shadowcolor=black@0.85:shadowx=3:shadowy=3:borderw=2:bordercolor=black@0.5")
        run(["ffmpeg", "-v", "error", "-y", "-ss", ss, "-i", KLING[clip], "-t", dur, "-vf", vf, "-an",
             "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", CLIPS / f"{key}.mp4"])


# ---------------------------------------------------------------- plan + mix
def plan(durs):
    t = {"out_dur": durs["out_es"], "es_dur": durs["reply_es"], "en_dur": durs["reply_en"]}
    t["F_type"] = 0.35
    t["F_play"] = 0.45
    t["F_send"] = t["F_play"] + t["out_dur"] + 0.12
    F_len = t["F_send"] + 0.28
    t["G_press"] = 0.25
    t["G_release"] = t["G_press"] + t["es_dur"] + 0.10
    t["G_en"] = t["G_release"] + 0.22
    G_len = t["G_en"] + t["en_dur"] + 0.22

    starts, cursor = {}, 0.0
    order = [("A", KLING_SHOTS[0][3]), ("B", KLING_SHOTS[1][3]), ("C", KLING_SHOTS[2][3]), ("D", D_LEN),
             ("E", KLING_SHOTS[3][3]), ("F", F_len), ("G", G_len)]
    for k, L in order:
        starts[k] = cursor
        cursor += L
    H_len = max(1.0, 15.0 - cursor)
    starts["Hs"] = cursor
    total = cursor + H_len
    if total > 15.05:
        print(f"  WARNING: hook runs {total:.2f}s (>15s). Shorten LINES or KLING_SHOTS durations.")
    lens = {"D": D_LEN, "F": F_len, "G": G_len, "Hs": H_len}
    return t, starts, lens, total, order + [("Hs", H_len)]


def mix(t, s, total, music):
    cues = [  # (file, absolute start seconds, volume)
        (AUDIO / "sfx_engine.mp3", s["A"], 1.0),
        (AUDIO / "sfx_dry_tap.mp3", s["C"] + 0.10, 1.0),
        (SFX["whoosh"], s["D"] + 0.05, 0.55),
        (SFX["tick"], s["D"] + 0.55, 1.0),
        (SFX["chime"], s["F"] + t["F_type"] + 0.05, 0.8),
        (AUDIO / "out_es_trim.wav", s["F"] + t["F_play"], 1.0),
        (SFX["ping"], s["F"] + t["F_send"], 0.9),
        (SFX["chirp"], s["G"] + t["G_press"] - 0.05, 0.6),
        (AUDIO / "reply_es_trim.wav", s["G"] + t["G_press"] + 0.06, 1.0),
        (SFX["beep"], s["G"] + t["G_release"], 0.7),
        (AUDIO / "reply_en_trim.wav", s["G"] + t["G_en"], 1.0),
        (SFX["settle"], s["Hs"], 0.8),
    ]
    engine_len = s["C"] - s["A"]
    inputs, chains, labels = [], [], []
    for i, (f, start, vol) in enumerate(cues):
        inputs += ["-i", f]
        ms = int(round(start * 1000))
        extra = ""
        if i == 0:  # engine: hard stop on the dry-tap cut, lowpass on the aerial shot
            extra = (f",atrim=0:{engine_len:.3f},volume=volume='if(gte(t,{s['B'] - s['A']:.3f}),0.6,1)':eval=frame,"
                     f"afade=t=out:st={engine_len - 0.04:.3f}:d=0.04")
        elif i == 1:  # dry tap: hard cut before WhatsApp UI whoosh (shot D)
            tap_len = max(0.4, (s["D"] - s["C"]) - 0.15)
            extra = f",atrim=0:{tap_len:.3f},afade=t=out:st={tap_len - 0.08:.3f}:d=0.08"
        chains.append(f"[{i}:a]aresample=44100,aformat=channel_layouts=stereo{extra},volume={vol},adelay={ms}|{ms}[c{i}]")
        labels.append(f"[c{i}]")
    voices = "".join(labels)
    m = len(cues)
    inputs += ["-i", music]
    music_ms = int(round(s["E"] * 1000))
    chains.append(f"{voices}amix=inputs={m}:normalize=0,asplit=2[fx][key]")
    chains.append(f"[{m}:a]aresample=44100,volume=0.32,afade=t=in:st=0:d=0.25,adelay={music_ms}|{music_ms}[mus]")
    chains.append("[mus][key]sidechaincompress=threshold=0.12:ratio=3:attack=30:release=450[duck]")
    chains.append(f"[fx][duck]amix=inputs=2:normalize=0,afade=t=out:st={total - 0.35:.3f}:d=0.35,"
                  f"atrim=0:{total:.3f},loudnorm=I=-14:TP=-1.5:LRA=9[aout]")
    wav = OUT / "hook_mix.wav"
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(chains), "-map", "[aout]",
         "-ar", "48000", wav])
    return wav, cues


def assemble(order, wav, total):
    lst = OUT / "concat.txt"
    lst.write_text("".join(f"file '{CLIPS / (k + '.mp4')}'\n" for k, _ in order))
    raw = OUT / "hook_video_raw.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", 0, "-i", lst, "-c:v", "libx264",
         "-pix_fmt", "yuv420p", "-crf", "17", "-r", FPS, raw])
    final = OUT / "hook_15s.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "256k", "-ac", "2", "-t", f"{total:.3f}", "-movflags", "+faststart", final])
    sheet = OUT / "hook_contact_sheet.jpg"
    run(["ffmpeg", "-v", "error", "-y", "-i", final, "-vf", "fps=1,scale=480:-1,tile=4x4", "-frames:v", 1, sheet])
    return final, sheet


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--regen-audio", action="store_true")
    ap.add_argument("--skip-ui", action="store_true", help="reuse rendered UI clips")
    args = ap.parse_args()
    for d in (OUT, CLIPS, FRAMES):
        d.mkdir(parents=True, exist_ok=True)

    print("1/5 audio assets")
    durs = build_audio(args.regen_audio)
    t, starts, lens, total, order = plan(durs)
    print("  durations:", {k: round(v, 2) for k, v in durs.items()})
    print("  shot starts:", {k: round(v, 2) for k, v in starts.items()}, f"total={total:.2f}s")

    print("2/5 kling shots + kinetic type")
    render_kling()
    print("3/5 UI shots (Playwright)")
    if not args.skip_ui:
        render_ui(t, lens)
    print("4/5 audio mix")
    music = build_music(args.regen_audio)
    assert_no_speech(music, total - starts["E"])
    wav, cues = mix(t, starts, total, music)
    print("5/5 assemble")
    final, sheet = assemble(order, wav, total)

    cue_log = OUT / "cue_sheet.json"
    cue_log.write_text(json.dumps({"shots": starts, "timing": t,
                                   "cues": [{"file": str(Path(f).relative_to(ROOT)), "at_s": round(a, 3),
                                             "frame": round(a * FPS)} for f, a, _ in cues]}, indent=2))
    print(f"\nDone: {final.relative_to(ROOT)} ({duration(final):.2f}s)\n      {sheet.relative_to(ROOT)}\n      {cue_log.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Five expat comedy skits for TikTok / Reels (9:16, 1080x1920, 30fps) — @dorienvibecodes.

Pure comedy, no app on screen (the app only appears in the captions, see comedy_skits_build/CAPTIONS.md).

Pipeline per shot (everything cached under comedy_skits_build/<skit>/, request ids saved so a crash
never pays twice):
  keyframe  fal nano-banana (9:16); shots with the expat use nano-banana/edit + her reference portrait
  motion    fal Kling v2.1 image-to-video (5s)
  line      ElevenLabs TTS (Latin American voices for locals, an American voice for the expat)
  lipsync   fal sync-lipsync/v2 (video + line) for talking shots
  ui        Playwright-rendered phone screens (skit 1)
  meme      funny_injections/0X_*.mp4 reaction cutaways
Assembly: FFmpeg concat, dialogue muxed at each shot's start (adelay), SFX, a quiet ducked music bed,
styled ASS subtitles (Spanish line + English translation), hook text in the top safe zone.

Usage:
  python3 scripts/build_comedy_skits.py                # all skits
  python3 scripts/build_comedy_skits.py --skit ahorita
  python3 scripts/build_comedy_skits.py --keyframes-only
"""
import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "comedy_skits_build"
REF = BUILD / "characters/expat_ref.png"
FONT_DIR = ROOT / "videos/ugc-proper-series/fonts"  # Lexend-Bold.ttf
W, H, FPS = 1080, 1920, 30
MEME = {
    "lady": (ROOT / "funny_injections/01_shocked_interview_lady.mp4", 1.2),
    "pibe": (ROOT / "funny_injections/02_el_pibe_valderrama_baffled.mp4", 0.933),
    "laugh": (ROOT / "funny_injections/03_viral_laughing_man_hysterical.mp4", 2.30),
}
SFX_PING = ROOT / "temp_vox_audio/sfx_whatsapp.wav"
KLING = "fal-ai/kling-video/v2.1/standard/image-to-video"
LIPSYNC = "fal-ai/sync-lipsync/v2"

VOICES = {  # ElevenLabs
    "expat": "FGY2WhTYpPnrIDTdsKH5",     # Laura (American) — stiff classroom Spanish on purpose
    "captain": "dlGxemPxFMTY7iXagmOj",   # Fernando, casual Latin American
    "guard": "l1zE9xgNpUTaQCZzpNJa",     # Alberto, serious Latin American
    "cashier": "CaJslL1xziwefCeTNzHv",   # Cristina, friendly Latin American
    "carmen": "HRi5Prm2B3PevwpDmVLP",    # María Blanco, Colombian, older woman
    "eli": "CwhRBWXzGAHq8TQ4Fs17",       # Roger, laid-back (Eli answers in English)
}
LOOK = ("Photorealistic vertical 9:16 smartphone-style photo, candid and natural, authentic Caribbean island "
        "setting in Bocas del Toro, Panama, natural light, no text, no captions, no logos, no watermarks. ")
EXPAT = ("Same woman as the reference photo (same face, light brown hair in a messy bun, freckles, small silver "
         "hoop earrings, loose white linen shirt). ")
TALK = ("The person speaks naturally to someone just off-camera, small head movements and hand gestures, "
        "mouth moving as if talking, static camera, realistic, no warping")
MOVE = "Subtle natural movement, realistic, gentle handheld camera, no warping, no sudden camera moves"

# shot kinds: gen (image->Kling), talk (gen + line + lipsync), ui, meme
SKITS = {
    "mandame_un_audio": {
        "hook": "POV: a local asks you for a voice note instead of a text",
        "shots": [
            {"id": "s1", "kind": "ui", "ui": "chat", "dur": 2.6, "sfx": [(SFX_PING, 0.35, 0.8)]},
            {"id": "s2", "kind": "talk", "expat": True, "voice": "expat",
             "img": EXPAT + "She stands on the porch of her colorful stilt house, holding her phone close to her "
                    "mouth like a walkie-talkie, eyes wide with nervous concentration, a small notebook with "
                    "notes in her other hand. Palm trees behind her.",
             "line": "Hola. Yo. Soy. Tu. Vecina. La tubería. Está. Triste.",
             "en": "Hello. I. Am. Your. Neighbor. The pipe. Is. Sad.", "top": "Attempt 1 of 14"},
            {"id": "s3", "kind": "ui", "ui": "voicenote", "dur": 3.2, "voice": "captain",
             "line": "¡Oye mi vecina! Tranquila, eso es la llave de paso, dale una movidita pa' la izquierda "
                     "y si no, me avisas que yo paso más tarde, ¿oíste?",
             "sub": "*a 2-minute voice note at 100 mph*"},
            {"id": "s4", "kind": "meme", "meme": "pibe", "sub": "*PROCESSING 100 MPH SPANISH...*"},
            {"id": "s5", "kind": "gen", "expat": True, "dur": 2.2,
             "img": EXPAT + "Close-up: she holds her phone to her ear, squinting in total confusion, frozen "
                    "mid-thought, on her porch.", "top": "Playback speed 0.5x... still no"},
            {"id": "s6", "kind": "gen", "expat": True, "dur": 2.2,
             "img": EXPAT + "She walks through a heavy tropical downpour on a muddy island path between wooden "
                    "houses, clutching a small folded paper note, soaked, determined.",
             "motion": "Heavy rain falling, she walks forward determined, clothes getting wet, realistic",
             "top": "Plan B: deliver it in person"},
            {"id": "s7", "kind": "talk", "voice": "eli",
             "img": "A relaxed Afro-Caribbean man in his fifties stands in the doorway of his blue wooden stilt "
                    "house, reading a small handwritten note, completely deadpan, rain in the background.",
             "line": "Pipe's fine. You just have to wiggle it.", "en": None},
            {"id": "s8", "kind": "meme", "meme": "laugh", "sub": "3 minutes of rain for a wiggle"},
        ],
    },
    "ahorita": {
        "hook": 'Nobody warned me "ahorita" is not a unit of time',
        "shots": [
            {"id": "s1", "kind": "talk", "expat": True, "voice": "expat",
             "img": EXPAT + "She stands on a wooden dock with a small backpack, leaning forward politely to "
                    "talk to a boat captain just off-camera, hopeful smile. Turquoise water, pangas.",
             "line": "¿Sale ahorita para Bastimentos?", "en": "Leaving right now for Bastimentos?"},
            {"id": "s2", "kind": "talk", "voice": "captain",
             "img": "A relaxed Panamanian water taxi captain in his forties sits in his wooden panga boat at a "
                    "dock, cap and sunglasses on his head, not looking up from his phone, totally unbothered.",
             "line": "Sí, ahorita.", "en": "Yes, right now-ish."},
            {"id": "s3", "kind": "gen", "expat": True, "dur": 2.2, "keyframe": "characters/test_edit.png",
             "top": "Duolingo: ahorita = right now"},
            {"id": "s4", "kind": "gen", "dur": 2.3, "ref": "s2",
             "img": "Sunset on a Bocas del Toro dock: the relaxed water taxi captain in a cap eats a patty and "
                    "laughs with three friends sitting on the dock, his panga tied up, golden light.",
             "top": "2 hours later"},
            {"id": "s5", "kind": "talk", "voice": "captain", "ref": "s2",
             "img": "The relaxed Panamanian water taxi captain on the dock at dusk, waving his hand casually "
                    "and smiling, cap on, eating a snack.",
             "line": "¡Ahorita, ahorita!", "en": "Right now-ish, right now-ish!"},
            {"id": "s6", "kind": "meme", "meme": "pibe", "sub": '*AHORITA = ???*'},
            {"id": "s7", "kind": "gen", "expat": True, "dur": 2.6,
             "img": EXPAT + "Dusk: she is asleep sitting against a wooden post on the dock, backpack as a "
                    "pillow, and a brown pelican stands calmly right next to her. Soft blue evening light.",
             "top": "Update: I live here now"},
            {"id": "s8", "kind": "meme", "meme": "laugh"},
        ],
    },
    "yappy": {
        "hook": 'When the cashier asks "¿Yappy?" and you just say yes emotionally',
        "shots": [
            {"id": "s1", "kind": "talk", "voice": "cashier",
             "img": "A young Panamanian woman cashier behind the wooden counter of a small colorful island "
                    "shop, a phone on a stand with a QR code next to her, looking at a customer just "
                    "off-camera, friendly and practical.",
             "line": "¿Efectivo o Yappy?", "en": "Cash or Yappy?"},
            {"id": "s2", "kind": "talk", "expat": True, "voice": "expat",
             "img": EXPAT + "Inside a small island shop, holding one cold soda, she beams with delight and "
                    "claps her hands, overly enthusiastic.",
             "line": "¡Yappy! ¡Muy yappy! ¿Y usted? ¿También yappy?",
             "en": "Yappy! Very yappy! And you? Also yappy?"},
            {"id": "s3", "kind": "meme", "meme": "lady", "sub": "*Yappy is a payment app*"},
            {"id": "s4", "kind": "gen", "dur": 2.2, "ref": "s1",
             "img": "The young Panamanian cashier slowly points at the phone with the QR code on the counter, "
                    "completely deadpan, one eyebrow slightly raised.",
             "motion": "She slowly raises her hand and points at the phone on the counter, deadpan",
             "top": "Yappy = Panama's payment app. Not a mood."},
            {"id": "s5", "kind": "talk", "voice": "cashier", "ref": "s1",
             "img": "The young Panamanian cashier holds up a twenty dollar bill, apologetic half-smile, "
                    "empty cash drawer open in front of her.",
             "line": "Uy... no tengo cambio.", "en": "Oops... I don't have change."},
            {"id": "s6", "kind": "gen", "expat": True, "dur": 2.4,
             "img": EXPAT + "She walks out of the colorful island shop hugging an enormous armful of plantain "
                    "chip bags, awkward proud smile.",
             "top": "Change was paid in plantain chips"},
            {"id": "s7", "kind": "meme", "meme": "laugh"},
        ],
    },
    "friday_atm": {
        "hook": "The island ATM on a Friday night",
        "shots": [
            {"id": "s1", "kind": "gen", "expat": True, "dur": 2.6,
             "img": EXPAT + "Night, a Caribbean town street lit by street lamps: a queue of eight locals waits "
                    "at an outdoor bank ATM set into a wall; she stands last in line, holding her bank card, "
                    "looking determined.",
             "top": "Friday 8pm. Rent due tomorrow."},
            {"id": "s2", "kind": "talk", "voice": "captain",
             "img": "Night, close-up: a local man at the front of the ATM queue turns from the ATM screen "
                    "toward the people behind him with a calm, knowing shrug.",
             "line": "Ya se acabó.", "en": "It's run out."},
            {"id": "s3", "kind": "gen", "expat": True, "dur": 2.6,
             "img": EXPAT + "Night at the outdoor ATM: the whole queue of locals has turned around and walks "
                    "away calmly, while she stands alone at the ATM, bewildered, holding her card.",
             "motion": "The people calmly turn and walk away from the ATM in different directions, she stays "
                       "alone and looks around confused",
             "top": "Everyone knew. Everyone but me."},
            {"id": "s4", "kind": "talk", "expat": True, "voice": "expat",
             "img": EXPAT + "Night, at the empty ATM, she politely asks a uniformed security guard standing "
                    "just off-camera, speaking slowly and carefully.",
             "line": "¿Disculpe... cuándo... vuelve... el dinero?", "en": "Excuse me... when... does the money... come back?"},
            {"id": "s5", "kind": "talk", "voice": "guard",
             "img": "Night, a calm middle-aged Panamanian security guard in uniform stands by an outdoor bank "
                    "ATM, answering someone with serene certainty.",
             "line": "El lunes, si Dios quiere.", "en": "Monday, God willing."},
            {"id": "s6", "kind": "meme", "meme": "pibe", "sub": "*GOD WILLING??*"},
            {"id": "s7", "kind": "gen", "expat": True, "dur": 2.6,
             "img": EXPAT + "In a small open-air island restaurant at night, she hopefully offers a waiter a "
                    "fanned-out handful of coins, a few foreign bank notes and a gift card; the waiter looks "
                    "at it blankly.",
             "top": "Monday feels far"},
            {"id": "s8", "kind": "meme", "meme": "laugh"},
        ],
    },
    "caliente": {
        "hook": 'I told my 70-year-old neighbor I was "caliente"',
        "shots": [
            {"id": "s1", "kind": "talk", "voice": "carmen",
             "img": "Midday sun on a quiet island street: a kind elderly Panamanian woman in her seventies "
                    "with a colorful dress and an umbrella for shade stops and greets a neighbor off-camera "
                    "with a warm smile.",
             "line": "¡Buenas, mija! ¿Cómo está?", "en": "Hi, dear! How are you?"},
            {"id": "s2", "kind": "talk", "expat": True, "voice": "expat",
             "img": EXPAT + "On her porch in blazing midday heat, sweaty, fanning herself with a paper fan, "
                    "big friendly smile, talking to her neighbor off-camera.",
             "line": "¡Ay, Doña Carmen, estoy muy caliente hoy!", "en": "Oh, Doña Carmen, I'm very hot today!"},
            {"id": "s3", "kind": "meme", "meme": "lady", "sub": "*she meant the weather*"},
            {"id": "s4", "kind": "gen", "dur": 2.3, "ref": "s1",
             "img": "The elderly Panamanian woman with the umbrella makes the sign of the cross and slowly walks "
                    "away backwards, keeping her eyes on the neighbor, alarmed.",
             "motion": "She makes the sign of the cross and slowly steps backwards away, eyes wide",
             "top": '"Caliente" ≠ the weather'},
            {"id": "s5", "kind": "talk", "expat": True, "voice": "expat",
             "img": EXPAT + "On her porch, leaning over the railing and calling after someone walking away, "
                    "panicked and apologetic.",
             "line": "¡No, no! ¡Caliente del sol!", "en": "No, no! Hot from the sun!", "top": "Making it worse"},
            {"id": "s6", "kind": "gen", "dur": 2.4,
             "img": "Morning light on the wooden doorstep of a colorful stilt house: a plate of fresh tropical "
                    "fruit and a small glass bottle of holy water with a tiny cross on it, left as a gift.",
             "top": "She forgave me. Sort of."},
            {"id": "s7", "kind": "meme", "meme": "laugh"},
        ],
    },
}
MUSIC_PROMPT = ("Playful light Caribbean comedy underscore, plucky nylon guitar, ukulele, soft hand percussion, "
                "cheeky and upbeat, 110 BPM, instrumental only, no vocals")


def run(cmd):
    subprocess.run([str(c) for c in cmd], check=True)


def duration(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def eleven_key():
    for line in (ROOT / ".env").read_text().splitlines():
        if "ELEVENLABS_API_KEY" in line and "=" in line:
            return line.split("=", 1)[1].strip().strip('"').strip("'")


def fal():
    os.environ.setdefault("FAL_KEY", (Path.home() / ".fal/key").read_text().strip())
    import fal_client
    return fal_client


def dl(url, path):
    path.write_bytes(requests.get(url, timeout=600).content)


# ---------------------------------------------------------------- stages
def keyframe(d, shot):
    img = d / f"{shot['id']}.png"
    if img.exists():
        return img
    if shot.get("keyframe"):
        shutil.copy(BUILD / shot["keyframe"], img)
        return img
    fc = fal()
    if shot.get("ref"):  # keep a local character consistent with their first appearance
        ref = fc.upload_file(str(d / f"{shot['ref']}.png"))
        r = fc.subscribe("fal-ai/nano-banana/edit", arguments={
            "prompt": LOOK + "Same person as the reference photo (same face, hair, clothes and accessories). "
                      + shot["img"], "image_urls": [ref], "num_images": 1, "aspect_ratio": "9:16"})
    elif shot.get("expat"):
        ref = fc.upload_file(str(REF))
        r = fc.subscribe("fal-ai/nano-banana/edit", arguments={
            "prompt": LOOK + shot["img"], "image_urls": [ref], "num_images": 1, "aspect_ratio": "9:16"})
    else:
        r = fc.subscribe("fal-ai/nano-banana", arguments={"prompt": LOOK + shot["img"], "aspect_ratio": "9:16",
                                                          "num_images": 1})
    dl(r["images"][0]["url"], img)
    print(f"  keyframe {d.name}/{shot['id']}", flush=True)
    return img


def kling(d, shot):
    out = d / f"{shot['id']}_kling.mp4"
    if out.exists():
        return out
    fc = fal()
    req = d / f"{shot['id']}.kling_request"
    if req.exists():
        h = fc.SyncRequestHandle.from_request_id(KLING, req.read_text().strip())
    else:
        motion = shot.get("motion") or (TALK if shot["kind"] == "talk" else MOVE)
        h = fc.submit(KLING, arguments={"prompt": motion, "image_url": fc.upload_file(str(d / f"{shot['id']}.png")),
                                        "duration": "5", "negative_prompt": "blur, distort, warp, text, extra limbs"})
        req.write_text(h.request_id)
    dl(h.get()["video"]["url"], out)
    print(f"  kling {d.name}/{shot['id']}", flush=True)
    return out


def voice_line(d, shot):
    wav = d / f"{shot['id']}_line.wav"
    if wav.exists():
        return wav
    mp3 = d / f"{shot['id']}_line.mp3"
    r = requests.post(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICES[shot['voice']]}?output_format=mp3_44100_128",
                      headers={"xi-api-key": eleven_key(), "Content-Type": "application/json"},
                      json={"text": shot["line"], "model_id": "eleven_multilingual_v2",
                            "voice_settings": {"stability": 0.4, "similarity_boost": 0.8, "style": 0.35,
                                               "use_speaker_boost": True}}, timeout=90)
    r.raise_for_status()
    mp3.write_bytes(r.content)
    run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af",
         "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
         "silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.05", "-ar", 44100, "-ac", 2, wav])
    # lip-sync gets exactly the audio the mix uses, so mouth and voice start together
    run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-b:a", "192k", d / f"{shot['id']}_line_trim.mp3"])
    return wav


def lipsync(d, shot):
    out = d / f"{shot['id']}_lipsync.mp4"
    if out.exists():
        return out
    fc = fal()
    req = d / f"{shot['id']}.lipsync_request"
    if req.exists():
        h = fc.SyncRequestHandle.from_request_id(LIPSYNC, req.read_text().strip())
    else:
        h = fc.submit(LIPSYNC, arguments={"video_url": fc.upload_file(str(d / f"{shot['id']}_kling.mp4")),
                                          "audio_url": fc.upload_file(str(d / f"{shot['id']}_line_trim.mp3")),
                                          "sync_mode": "cut_off"})
        req.write_text(h.request_id)
    dl(h.get()["video"]["url"], out)
    print(f"  lipsync {d.name}/{shot['id']}", flush=True)
    return out


def sfx(prompt, path, secs):
    if path.exists():
        return path
    r = requests.post("https://api.elevenlabs.io/v1/sound-generation",
                      headers={"xi-api-key": eleven_key(), "Content-Type": "application/json"},
                      json={"text": prompt, "duration_seconds": secs, "prompt_influence": 0.5}, timeout=120)
    r.raise_for_status()
    path.write_bytes(r.content)
    return path


def music():
    path = BUILD / "music_bed.mp3"
    if not path.exists():
        r = requests.post("https://api.elevenlabs.io/v1/music",
                          headers={"xi-api-key": eleven_key(), "Content-Type": "application/json"},
                          json={"prompt": MUSIC_PROMPT, "music_length_ms": 30000, "force_instrumental": True},
                          timeout=300)
        r.raise_for_status()
        path.write_bytes(r.content)
    return path


# ---------------------------------------------------------------- phone UI (skit 1)
UI_HTML = """<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased}
body{width:1080px;height:1920px;background:#E9E3D8;font-family:'Plus Jakarta Sans',sans-serif;overflow:hidden}
.top{height:560px;background:#F7F4EE;display:flex;align-items:flex-end;padding:0 50px 34px;gap:26px;border-bottom:2px solid #DDD5C8}
.av{width:110px;height:110px;border-radius:50%;background:#CFE7DA;color:#1F6B4A;display:flex;align-items:center;justify-content:center;font:800 44px 'Plus Jakarta Sans'}
.nm b{display:block;font:800 46px 'Plus Jakarta Sans';color:#1A1208}.nm span{font:600 32px 'Plus Jakarta Sans';color:#7C7266}
.body{padding:60px 44px;display:flex;flex-direction:column;gap:26px}
.b{max-width:780px;padding:28px 34px;border-radius:34px;font:600 46px/1.35 'Plus Jakarta Sans';color:#1A1208;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,.08)}
.b.me{align-self:flex-end;background:#D9F2E3}
.t{font:600 26px 'Plus Jakarta Sans';color:#8A8175;text-align:right;margin-top:8px}
.vn{display:flex;align-items:center;gap:24px;width:820px}
.play{width:92px;height:92px;border-radius:50%;background:#1F6B4A;display:flex;align-items:center;justify-content:center;flex:none}
.wave{display:flex;gap:7px;align-items:center;height:110px;flex:1}.wave i{display:block;width:9px;border-radius:5px;background:#CFC6B8}
.dur{font:700 32px 'Plus Jakarta Sans';color:#5C4E3A}
.k{opacity:0}
</style></head><body>
<div class="top"><div class="av">E</div><div class="nm"><b>Eli (vecino)</b><span id="st">en línea</span></div></div>
<div class="body">
  <div class="b me">Hola Eli, mi tubería tiene problema. ¿Puedes ayudar?<div class="t">9:02</div></div>
  <div class="b k" id="m1">Dale, mejor mándame un audio<div class="t">9:03</div></div>
  <div class="b k" id="vn"><div class="vn"><div class="play"><svg width="40" height="40" viewBox="0 0 24 24" fill="#fff"><path d="M7 4l13 8-13 8z"/></svg></div><div class="wave" id="wave"></div><div class="dur" id="dur">2:14</div></div><div class="t">9:41</div></div>
</div>
<script>
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
let s=7,bars=[];for(let i=0;i<34;i++){s=(s*9301+49297)%233280;bars.push(s/233280);}
document.getElementById('wave').innerHTML=bars.map(v=>`<i style="height:${20+v*80}px"></i>`).join('');
function render(mode,t){
  const m1=document.getElementById('m1'),vn=document.getElementById('vn'),st=document.getElementById('st');
  if(mode==='chat'){ st.textContent=t<0.3?'escribiendo…':'en línea'; m1.style.opacity=clamp((t-0.3)/0.2); vn.style.display='none'; }
  else { m1.style.opacity=1; vn.style.opacity=clamp(t/0.2); const p=clamp(t/3.1);
    [...document.querySelectorAll('.wave i')].forEach((b,i)=>{const on=i/bars.length<p;b.style.background=on?'#1F6B4A':'#CFC6B8';
      b.style.height=`${(20+bars[i]*80)*(on&&p<1?0.7+0.3*Math.sin(t*25+i*2):1)}px`;});
    const secs=Math.round(134-p*3); document.getElementById('dur').textContent=`${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`; }
}
</script></body></html>"""


def render_ui(d, shot, browser):
    out = d / f"{shot['id']}_ui.mp4"
    if out.exists():
        return out
    frames = d / f"{shot['id']}_frames"
    shutil.rmtree(frames, ignore_errors=True)
    frames.mkdir()
    p = browser.new_page(viewport={"width": W, "height": H})
    p.set_content(UI_HTML)
    p.evaluate("document.fonts.ready")
    p.wait_for_timeout(200)
    for f in range(round(shot["dur"] * FPS)):
        p.evaluate(f"render('{shot['ui']}', {f / FPS})")
        p.screenshot(path=str(frames / f"{f:04d}.jpg"), type="jpeg", quality=90)
    p.close()
    run(["ffmpeg", "-v", "error", "-y", "-framerate", FPS, "-i", frames / "%04d.jpg", "-c:v", "libx264",
         "-pix_fmt", "yuv420p", "-crf", 18, out])
    shutil.rmtree(frames)
    return out


# ---------------------------------------------------------------- assembly
def ass_time(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def esc(t):
    return t.replace("{", "(").replace("}", ")").replace("\n", "\\N")


def subtitles(skit, timeline, path):
    head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Hook,Lexend,58,&H00FFFFFF,&H000000FF,&H73000000,&H73000000,-1,0,0,0,100,100,0,0,3,16,0,8,80,130,250,1
Style: Top,Lexend,50,&H0024E6FF,&H000000FF,&H73000000,&H73000000,-1,0,0,0,100,100,0,0,3,14,0,8,80,130,450,1
Style: Local,Lexend,64,&H00FFFFFF,&H000000FF,&H00000000,&H99000000,-1,0,0,0,100,100,0,0,1,6,3,2,70,120,470,1
Style: Expat,Lexend,64,&H0024E6FF,&H000000FF,&H00000000,&H99000000,-1,0,0,0,100,100,0,0,1,6,3,2,70,120,470,1
Style: EN,Lexend,42,&H00E6E6E6,&H000000FF,&H00000000,&H99000000,-1,1,0,0,100,100,0,0,1,5,2,2,70,120,400,1
Style: Meme,Lexend,64,&H0000FFFF,&H000000FF,&H00000000,&HB0000000,-1,0,0,0,100,100,0,0,1,7,4,5,70,120,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = [f"Dialogue: 1,{ass_time(0.1)},{ass_time(3.0)},Hook,,0,0,0,,{esc(skit['hook'])}"]
    for shot, t0, t1 in timeline:
        if shot.get("top"):
            ev.append(f"Dialogue: 0,{ass_time(t0 + 0.1)},{ass_time(t1)},Top,,0,0,0,,{esc(shot['top'])}")
        if shot["kind"] == "meme" and shot.get("sub"):
            ev.append(f"Dialogue: 0,{ass_time(t0)},{ass_time(t1)},Meme,,0,0,0,,{esc(shot['sub'])}")
        if shot["kind"] == "ui" and shot.get("sub"):
            ev.append(f"Dialogue: 0,{ass_time(t0 + 0.2)},{ass_time(t1)},Local,,0,0,0,,{esc(shot['sub'])}")
        if shot.get("line") and shot["kind"] == "talk":
            style = "Expat" if shot.get("voice") == "expat" else "Local"
            ev.append(f"Dialogue: 0,{ass_time(t0 + 0.05)},{ass_time(t1)},{style},,0,0,0,,\"{esc(shot['line'])}\"")
            if shot.get("en"):
                ev.append(f"Dialogue: 0,{ass_time(t0 + 0.05)},{ass_time(t1)},EN,,0,0,0,,({esc(shot['en'])})")
    path.write_text(head + "\n".join(ev) + "\n")


def conform(src, out, dur, start=0.0):
    run(["ffmpeg", "-v", "error", "-y", "-ss", start, "-i", src, "-t", dur, "-vf",
         f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},tpad=stop_mode=clone:stop_duration=3",
         "-t", dur, "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", 18, out])


def assemble(name, skit, d):
    timeline, segs, cues, t = [], [], [], 0.0
    for shot in skit["shots"]:
        seg = d / f"seg_{shot['id']}.mp4"
        if shot["kind"] == "meme":
            src, dur = MEME[shot["meme"]]
            conform(src, seg, dur)
            cues.append((src, t, 1.0))
        elif shot["kind"] == "ui":
            dur = shot["dur"]
            conform(d / f"{shot['id']}_ui.mp4", seg, dur)
            if shot.get("line"):
                cues.append((d / f"{shot['id']}_line.wav", t + 0.15, 0.95))
                cues.append((sfx("A rooster crowing loudly nearby, outdoors", d / "sfx_rooster.mp3", 1.5), t + 0.9, 0.35))
        elif shot["kind"] == "talk":
            dur = duration(d / f"{shot['id']}_line.wav") + 0.35
            conform(d / f"{shot['id']}_lipsync.mp4", seg, dur)
            cues.append((d / f"{shot['id']}_line.wav", t, 1.0))
        else:
            dur = shot["dur"]
            conform(d / f"{shot['id']}_kling.mp4", seg, dur, start=0.3)
            if "rain" in shot.get("img", "").lower():
                cues.append((sfx("Heavy tropical rain downpour on tin roofs and mud, close", d / "sfx_rain.mp3", 3.0), t, 0.6))
        for f, off, vol in shot.get("sfx", []):
            cues.append((f, t + off, vol))
        segs.append(seg)
        timeline.append((shot, t, t + dur))
        t += dur
    total = t

    lst = d / "concat.txt"
    lst.write_text("".join(f"file '{s}'\n" for s in segs))
    raw = d / "video_raw.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", 0, "-i", lst, "-c:v", "libx264", "-pix_fmt", "yuv420p",
         "-crf", 18, "-r", FPS, raw])

    inputs, chains, labels = [], [], []
    for n, (f, at, vol) in enumerate(cues):
        ms = int(round(at * 1000))
        inputs += ["-i", f]
        chains.append(f"[{n}:a]aresample=44100,aformat=channel_layouts=stereo,volume={vol},adelay={ms}|{ms}[c{n}]")
        labels.append(f"[c{n}]")
    m = len(cues)
    inputs += ["-stream_loop", -1, "-i", music()]
    chains.append(f"{''.join(labels)}amix=inputs={m}:normalize=0,asplit=2[fx][key]")
    chains.append(f"[{m}:a]aresample=44100,aformat=channel_layouts=stereo,volume=0.22,atrim=0:{total:.3f}[mus]")
    chains.append("[mus][key]sidechaincompress=threshold=0.03:ratio=10:attack=15:release=250[duck]")
    chains.append(f"[fx][duck]amix=inputs=2:normalize=0,atrim=0:{total:.3f},afade=t=out:st={total - 0.5:.3f}:d=0.5,"
                  "loudnorm=I=-14:TP=-1.5:LRA=11[aout]")
    wav = d / "mix.wav"
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(chains), "-map", "[aout]", "-ar", 48000, wav])

    ass = d / "subs.ass"
    subtitles(skit, timeline, ass)
    final = BUILD / f"skit_{name}.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-i", wav, "-vf", f"ass={ass}:fontsdir={FONT_DIR}",
         "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", 18, "-c:a", "aac",
         "-b:a", "192k", "-t", f"{total:.3f}", "-movflags", "+faststart", final])
    (d / "timeline.json").write_text(json.dumps([{"shot": s["id"], "start": round(a, 2), "end": round(b, 2)}
                                                 for s, a, b in timeline], indent=2))
    print(f"  => {final.relative_to(ROOT)} ({total:.1f}s)", flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--skit", choices=list(SKITS))
    ap.add_argument("--keyframes-only", action="store_true")
    args = ap.parse_args()
    skits = {k: v for k, v in SKITS.items() if not args.skit or k == args.skit}

    jobs = []
    for name, skit in skits.items():
        d = BUILD / name
        d.mkdir(parents=True, exist_ok=True)
        for shot in skit["shots"]:
            if shot["kind"] in ("gen", "talk"):
                jobs.append((d, shot))
    print("1. keyframes", flush=True)
    with ThreadPoolExecutor(4) as ex:
        list(ex.map(lambda j: keyframe(*j), jobs))
    if args.keyframes_only:
        return
    print("2. Kling + voice lines", flush=True)
    with ThreadPoolExecutor(8) as ex:
        futs = [ex.submit(kling, d, s) for d, s in jobs]
        for name, skit in skits.items():
            for s in skit["shots"]:
                if s.get("line"):
                    voice_line(BUILD / name, s)
        [f.result() for f in futs]
    print("3. lip-sync", flush=True)
    with ThreadPoolExecutor(6) as ex:
        [f.result() for f in [ex.submit(lipsync, d, s) for d, s in jobs if s["kind"] == "talk"]]
    print("4. phone screens + assembly", flush=True)
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, skit in skits.items():
            for s in skit["shots"]:
                if s["kind"] == "ui":
                    render_ui(BUILD / name, s, browser)
        browser.close()
    for name, skit in skits.items():
        assemble(name, skit, BUILD / name)


if __name__ == "__main__":
    main()

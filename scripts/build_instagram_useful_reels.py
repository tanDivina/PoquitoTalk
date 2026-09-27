#!/usr/bin/env python3
"""
Useful-first Instagram Reels for Bocas del Toro travelers & expats (9:16, 1080x1920, 30fps).

Each reel: hook b-roll → 3 × (b-roll step title → phrase card that plays the app's real preset
audio in full) → soft outro. No narrator (Rule 16); the only voices are the phrases themselves,
muxed at their exact frame (Rule 7). Light sand/white design, monoline SVGs only (Rules 5, 8).

Pipeline (every stage is cached under instagram_reels_build/<reel>/):
  1. fal nano-banana 9:16 keyframes      2. fal Kling v2.1 image-to-video (5s)
  3. ElevenLabs: missing phrase lines (app personas) + instrumental music bed (Whisper speech guard)
  4. Playwright overlays + animated phrase cards      5. FFmpeg assembly + ducked mix

Usage:
  python3 scripts/build_instagram_useful_reels.py                  # all reels
  python3 scripts/build_instagram_useful_reels.py --reel cash_in_bocas
Needs ~/.fal/key (or FAL_KEY) and ELEVENLABS_API_KEY in .env.
"""
import argparse
import base64
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "instagram_reels_build"
PRESETS = ROOT / "assets/audio/presets"
MASCOT = ROOT / "src/assets/poquito_front_talking_v2_clean_256.webp"
SFX_CARD = ROOT / "brag-output/sfx/card_slide.ogg"
SFX_SETTLE = ROOT / "brag-output/sfx/cta_settle.ogg"
W, H, FPS = 1080, 1920, 30

# App personas (src/services/elevenLabsVoice.ts) and the settings the app sends.
VOICES = {"sofia": "cgSgspJ2msm6clMCkdW9", "diego": "JBFqnCBsd6RMkjVDRZzb"}
VOICE_SETTINGS = {"stability": 0.45, "similarity_boost": 0.85, "style": 0.20, "use_speaker_boost": True}

KLING_MODEL = "fal-ai/kling-video/v2.1/standard/image-to-video"
MOTION = ("Subtle handheld documentary camera drift, natural movement, gentle water ripples and palm leaves "
          "moving in the breeze, realistic, no warping, no sudden camera moves")
LOOK = ("Photorealistic vertical documentary photo, Bocas del Toro, Panama, authentic Caribbean details, "
        "natural light, shot on a 35mm lens, no text, no signs, no logos, no watermarks. ")

REELS = [
    {
        "id": "costa_rica_to_bocas",
        "voice": "sofia",
        "hook": ("Crossing into Bocas", "from Costa Rica?", "3 stops. 3 phrases. Save this."),
        "hook_shot": "Backpackers in a small wooden panga water taxi crossing turquoise water toward the colorful "
                     "wooden stilt houses of Bocas Town, bags on their laps, spray, late afternoon sun",
        "steps": [
            {"kicker": "STOP 1", "title": "The border bridge",
             "tip": "Walk across from Sixaola to Guabito. Stamp out of Costa Rica, then into Panama.",
             "shot": "Travelers with backpacks walking on the pedestrian sidewalk of a modern two-lane concrete "
                     "road bridge over the wide brown Sixaola river between Costa Rica and Panama, jungle and "
                     "banana plantations on both banks, overcast",
             # yes/no phrasing: TTS lets '¿Dónde paso...?' fall like a statement
             "line": "¡Buenas! Traigo equipaje personal y algunas compras menores. ¿Paso por aquí para la revisión de Aduanas?",
             "en": "Hi! I have personal luggage and a few small purchases. Do I go through here for the customs check?"},
            {"kicker": "STOP 2", "title": "Guabito to Almirante",
             "tip": "Taxis and shuttles wait on the Panama side. Agree the price before you get in.",
             "shot": "A white shared taxi van with backpacks strapped on the roof rack driving on a two-lane "
                     "road through green banana plantations in Bocas del Toro province, Panama",
             "preset": "border_taxi_to_almirante",
             "en": "Hi! How much to take a taxi from the Guabito border to the boat dock in Almirante?"},
            {"kicker": "STOP 3", "title": "Almirante to Bocas Town",
             "tip": "Water taxis cross during the day. Plan to arrive before dark.",
             "shot": "Backpackers boarding a small blue-and-white wooden water taxi panga tied to a weathered "
                     "wooden dock in Almirante, Panama, overcast tropical light, green water",
             "line": "¡Buenas! ¿Todavía hay lancha para Bocas hoy?",
             "en": "Hi! Is there still a boat to Bocas today?"},
        ],
        "music": "Relaxed warm Caribbean acoustic travel track, fingerpicked nylon guitar, soft shaker and "
                 "bongos, gentle bass, sunny, 95 BPM, instrumental only, no vocals",
    },
    {
        "id": "cash_in_bocas",
        "voice": "diego",
        "hook": ("Cash in Bocas:", "3 things nobody tells you", "Save this before you land."),
        "hook_shot": "Close-up of a hand holding a few folded US dollar bills in front of a colorful wooden "
                     "Caribbean street with bicycles and palm trees in Bocas Town, Panama, shallow depth of field",
        "steps": [
            {"kicker": "TIP 1", "title": "It's US dollars",
             "tip": "Panama uses the US dollar. Many small shops and water taxis are cash only.",
             "shot": "Close-up of a hand paying with a five dollar bill at the wooden counter of a small colorful "
                     "island corner shop, shelves of fruit and snacks behind, shopkeeper's hand reaching for it, "
                     "plain painted walls",
             "line": "¡Buenas! ¿Aceptan tarjeta?",
             "en": "Hi! Do you take card?"},
            {"kicker": "TIP 2", "title": "ATMs can run dry",
             "tip": "On weekends and holidays island ATMs can run out. Ask before you walk over.",
             # Modelled on the real Bocas Town branch (described from a reference photo, not copied; no branding)
             "shot": "A well-kept, attractive bank branch in Bocas Town, Panama, seen from across a manicured "
                     "green lawn with a straight concrete footpath, small pygmy date palms and red-flowering "
                     "ixora shrubs, the lawn edged by a yellow-painted curb. The building has a two-storey "
                     "central section with a dark brown wooden gabled roof and a row of upper windows, "
                     "cream-white walls, a grey stacked-stone base, dark wood-framed glass entrance doors and "
                     "windows, red metal roofs on the lower wings, and a covered portico with dark wooden "
                     "posts and a plain deep navy-blue fascia in front of the entrance, with a flagpole. To the "
                     "right, under a covered walkway, ATM machines are set into the wall with a couple of "
                     "people using them. Overcast tropical sky, grass wet after rain",
             "preset": "banking_atm_banconal",
             "en": "Hi! Does anyone know if the Banco Nacional ATM has cash right now?",
             "note": "Plata = money in Panama."},
            {"kicker": "TIP 3", "title": "Break big bills in town",
             "tip": "$50s and $100s are hard to break on the islands and on boats.",
             "shot": "A traveler handing a small bill to a smiling water taxi captain standing in his wooden "
                     "panga at a dock, turquoise water, bright day",
             "preset": "banking_small_bill_change",
             "en": "Excuse me, could you break a $100 or $50 into 5s, 10s and 20s?"},
        ],
        "music": "Upbeat light island acoustic groove, strummed guitar, marimba accents, hand percussion, "
                 "cheerful and easy, 105 BPM, instrumental only, no vocals",
    },
    {
        "id": "say_buenas_first",
        "voice": "diego",  # Sofia's takes kept flattening the question endings
        "hook": ("Say this first.", "Every time.", "The small habit that makes Bocas warm up to you."),
        "hook_shot": "A friendly Afro-Caribbean shopkeeper woman smiling and waving hello from behind the counter "
                     "of a small colorful wooden island shop in Bocas del Toro, warm daylight",
        "steps": [
            {"kicker": "HABIT 1", "title": "Greet before you ask",
             "tip": "Shop, boat or bus: say hello first. Jumping straight to the question feels rude here.",
             "shot": "Inside a small colorful wooden island grocery shop, a smiling shopkeeper behind the counter "
                     "greets a customer with a backpack who has just walked in, warm daylight",
             "line": "¡Buenas! ¿Todo bien?",
             "en": "Hi there! All good?",
             "note": "Buenas works morning, noon and night."},
            {"kicker": "HABIT 2", "title": "Use usted",
             "tip": "With elders, captains and tradespeople, usted shows respect.",
             "shot": "A foreign resident talking respectfully with an older Panamanian boat captain at a wooden "
                     "dock, both smiling, panga boats and turquoise water behind them",
             "line": "¡Buenas, señor! ¿Usted me puede ayudar?",
             "en": "Good afternoon, sir! Could you help me?"},
            {"kicker": "HABIT 3", "title": "Thank them warmly",
             "tip": "Muy amable lands warmer than a plain gracias.",
             "shot": "Two smiling neighbors chatting over coffee on the wooden porch of a colorful stilt house "
                     "over calm Caribbean water, golden hour",
             "line": "¡Muchas gracias, muy amable!",
             "en": "Thank you so much, that's very kind!"},
        ],
        "music": "Gentle warm island acoustic, soft ukulele and nylon guitar, light shaker, friendly and "
                 "unhurried, 90 BPM, instrumental only, no vocals",
    },
]

HOOK_LEN, STEP_BROLL_LEN, OUTRO_LEN = 3.0, 2.2, 3.4
CARD_LEAD, CARD_TAIL, CARD_MIN = 0.55, 0.9, 4.6


def run(cmd, **kw):
    subprocess.run([str(c) for c in cmd], check=True, **kw)


def duration(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def eleven_key():
    for line in (ROOT / ".env").read_text().splitlines():
        if "ELEVENLABS_API_KEY" in line and "=" in line:
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("ELEVENLABS_API_KEY")


def fal():
    if not os.environ.get("FAL_KEY"):
        os.environ["FAL_KEY"] = (Path.home() / ".fal/key").read_text().strip()
    import fal_client
    return fal_client


def download(url, path):
    path.write_bytes(requests.get(url, timeout=300).content)


# ---------------------------------------------------------------- 1+2. b-roll
def shots_for(reel):
    shots = {"hook": reel["hook_shot"]}
    for i, s in enumerate(reel["steps"], 1):
        shots[f"step{i}"] = s["shot"]
    return shots


def build_broll(reel, d, keyframes_only=False):
    fc = fal()
    shots = shots_for(reel)
    for name, prompt in shots.items():
        img = d / f"{name}.png"
        if not img.exists():
            r = fc.subscribe("fal-ai/nano-banana", arguments={"prompt": LOOK + prompt, "aspect_ratio": "9:16",
                                                               "num_images": 1})
            download(r["images"][0]["url"], img)
            print(f"  keyframe {reel['id']}/{name}")

    pending = {}
    for name in shots:
        req = d / f"{name}.kling_request"
        if not keyframes_only and not (d / f"{name}.mp4").exists() and req.exists():
            pending[name] = fc.SyncRequestHandle.from_request_id(KLING_MODEL, req.read_text().strip())
            print(f"  kling resuming {reel['id']}/{name}")
            continue
        if not keyframes_only and not (d / f"{name}.mp4").exists():
            url = fc.upload_file(str(d / f"{name}.png"))
            h = fc.submit(KLING_MODEL, arguments={"prompt": MOTION, "image_url": url, "duration": "5",
                                                  "negative_prompt": "blur, distort, warp, text, extra limbs"})
            pending[name] = h
            (d / f"{name}.kling_request").write_text(h.request_id)
            print(f"  kling submitted {reel['id']}/{name} ({h.request_id})")
    return pending


def collect_broll(pending_all):
    fc = fal()
    for (reel_dir, name), h in pending_all.items():
        r = h.get()  # blocks until done
        download(r["video"]["url"], reel_dir / f"{name}.mp4")
        print(f"  kling done {reel_dir.name}/{name}")


# ---------------------------------------------------------------- 3. audio
TAKES = 10         # max candidates per sentence; stops early once a take clearly passes
MIN_Q_RISE = 3.0   # a question must rise at the end AND finish this many st above the median
SENTENCE_GAP = 0.16


def split_sentences(text):
    """'¡Buenas! Traigo equipaje. ¿Dónde paso?' -> ['¡Buenas!', 'Traigo equipaje.', '¿Dónde paso?']"""
    import re
    return [m.strip() for m in re.findall(r"[¡¿]?[^.!?]+[.!?]+", text)]


def tts(key, voice, text, prev_text, next_text, seed, out):
    if out.with_suffix(".wav").exists() and out.with_suffix(".txt").exists() \
            and out.with_suffix(".txt").read_text() == text:
        return out.with_suffix(".wav")  # already paid for this exact take
    r = requests.post(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICES[voice]}?output_format=mp3_44100_128",
                      headers={"xi-api-key": key, "Content-Type": "application/json"},
                      json={"text": text, "model_id": "eleven_multilingual_v2", "voice_settings": VOICE_SETTINGS,
                            "previous_text": prev_text or None, "next_text": next_text or None, "seed": seed},
                      timeout=60)
    r.raise_for_status()
    out.write_bytes(r.content)
    run(["ffmpeg", "-v", "error", "-y", "-i", out, "-af",
         "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
         "silenceremove=start_periods=1:start_threshold=-45dB,areverse", "-ar", 44100, "-ac", 2,
         out.with_suffix(".wav")])
    out.with_suffix(".txt").write_text(text)
    return out.with_suffix(".wav")


def build_lines(reel, d):
    """Sentence-by-sentence TTS with contour selection for questions (they must end rising).
    Greetings and statements keep their first, natural take — a rising '¡Buenas!' is how people in
    Bocas actually call out when they walk up, so it is not steered."""
    sys.path.insert(0, str(ROOT / "scripts"))
    from intonation_check import analyze, question_tune

    key = eleven_key()
    takes_dir = d / "takes"
    takes_dir.mkdir(exist_ok=True)
    for i, s in enumerate(reel["steps"], 1):
        report_path = d / f"step{i}_intonation.json"
        if report_path.exists() and (d / f"step{i}_voice.wav").exists():
            continue
        text = s.get("line") or preset_text(s["preset"])
        sentences = split_sentences(text)
        chosen, report = [], []
        for j, sent in enumerate(sentences):
            is_q = sent.endswith("?")
            prev_text = " ".join(sentences[:j])
            next_text = " ".join(sentences[j + 1:])
            scored = []
            for seed in range(1, TAKES + 1):
                wav = tts(key, reel["voice"], sent, prev_text, next_text, seed,
                          takes_dir / f"step{i}_s{j}_t{seed}.mp3")
                m = analyze(wav)
                rise = m["end_contour_st"] if m["end_contour_st"] is not None else 0.0
                scored.append((rise if is_q else -rise, rise, wav))
                if is_q and rise >= MIN_Q_RISE + 1.5:
                    break  # clearly rising — no need to spend more takes
                if not is_q:
                    break  # statements/greetings: first natural take
            best = max(scored, key=lambda x: x[0])
            wav, rise, lifted = best[2], best[1], 0.0
            if is_q and rise < MIN_Q_RISE:
                # Spanish wh-questions naturally fall; TTS follows that, but for learners the line must
                # audibly sound like a question -> reshape into a rising question tune.
                fixed = wav.with_name(wav.stem + "_tune.wav")
                lifted = question_tune(wav, fixed)
                stereo = fixed.with_name(fixed.stem + "_st.wav")
                run(["ffmpeg", "-v", "error", "-y", "-i", fixed, "-ar", 44100, "-ac", 2, stereo])
                wav = stereo
                rise = analyze(wav)["end_contour_st"] or 0.0
            best = (None, rise, wav)
            chosen.append(wav)
            report.append({"sentence": sent, "question": is_q, "final_rise_st": round(rise, 2),
                           "takes_tried": len(scored), "pitch_lift_st": round(lifted, 2)})
            flag = "" if (not is_q or best[1] >= MIN_Q_RISE) else "  <-- CHECK BY EAR"
            note = f" (question tune, tail +{lifted:.1f} st)" if lifted else ""
            print(f"  {reel['id']}/step{i} {'Q' if is_q else 'S'} {best[1]:+.1f} st  {sent}{note}{flag}")

        inputs, parts = [], []
        for n, w in enumerate(chosen):
            inputs += ["-i", w]
            parts.append(f"[{n}:a]")
            if n < len(chosen) - 1:
                parts.append(f"[g{n}]")
        gaps = ";".join(f"aevalsrc=0|0:d={SENTENCE_GAP}:s=44100[g{n}]" for n in range(len(chosen) - 1))
        fc = (gaps + ";" if gaps else "") + "".join(parts) + f"concat=n={len(parts)}:v=0:a=1[out]"
        run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[out]", "-ar", 44100,
             "-ac", 2, d / f"step{i}_voice.wav"])
        report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))


def build_music(reel, d, seconds):
    path = d / "music.mp3"
    if not path.exists():
        r = requests.post("https://api.elevenlabs.io/v1/music",
                          headers={"xi-api-key": eleven_key(), "Content-Type": "application/json"},
                          json={"prompt": reel["music"], "music_length_ms": int((seconds + 2) * 1000),
                                "force_instrumental": True}, timeout=300)
        r.raise_for_status()
        path.write_bytes(r.content)
        print(f"  music {reel['id']}")
    assert_no_speech(path, d)
    return path


def assert_no_speech(path, d):
    """Refuse a music bed with a voice in it (logprob > -1.0 = real words, not music hallucination)."""
    if not shutil.which("whisper"):
        return
    probe = d / "music_probe.wav"
    run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ac", 1, "-ar", 16000, probe])
    subprocess.run(["whisper", probe, "--model", "base", "--output_dir", d, "--output_format", "json",
                    "--fp16", "False"], capture_output=True, check=True)
    segs = json.loads((d / "music_probe.json").read_text())["segments"]
    import re
    labels = {"", "music", "musica", "música", "instrumental", "applause"}  # Whisper's soundtrack captions
    speech = [s for s in segs if s["avg_logprob"] > -1.0 and s["no_speech_prob"] < 0.5
              and re.sub(r"[^a-záéíóúñ ]", "", s["text"].lower()).strip() not in labels]
    if speech:
        sys.exit(f"Music bed {path} contains speech: {speech[0]['text']!r}")


# ---------------------------------------------------------------- 4. Playwright
ICON = {
    "speaker": '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
    "pin": '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/>',
    "bookmark": '<path d="M6 3h12v18l-6-4-6 4z"/>',
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.5v.5"/>',
}


def svg(name, size=34, color="currentColor", sw=2.3):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{ICON[name]}</svg>')


def b64(path, mime):
    return f"data:{mime};base64,{base64.b64encode(Path(path).read_bytes()).decode()}"


CSS = """
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
body{width:1080px;height:1920px;overflow:hidden;font-family:'Plus Jakarta Sans',sans-serif;color:#1A1208;background:transparent;position:relative}
.k{opacity:0}
/* overlays on video: safe zone x 70..960, y 240..1480 */
.ov{position:absolute;left:70px;right:120px;bottom:470px}
.ov .pill{display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:999px;background:#FAF8F5;color:#964824;font:800 26px 'Plus Jakarta Sans';letter-spacing:2px;border:2px solid rgba(150,72,36,.22)}
.ov h1{font:900 104px/1.02 'Lexend';letter-spacing:-3px;color:#fff;margin-top:22px;text-shadow:0 4px 18px rgba(0,0,0,.55),0 2px 4px rgba(0,0,0,.5)}
.ov p{font:700 42px/1.3 'Plus Jakarta Sans';color:#fff;margin-top:22px;text-shadow:0 3px 12px rgba(0,0,0,.6)}
.shade{position:absolute;left:0;right:0;bottom:0;height:1300px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.18) 40%,rgba(0,0,0,.52))}
/* phrase card scene */
.bg{position:absolute;inset:-40px;background-size:cover;background-position:center;filter:blur(26px) saturate(1.05)}
.scrim{position:absolute;inset:0;background:rgba(250,248,245,.86)}
.wrap{position:absolute;left:70px;right:120px;top:250px}
.kick{display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:999px;background:#fff;color:#964824;font:800 26px 'Plus Jakarta Sans';letter-spacing:2px;border:2px solid rgba(150,72,36,.22)}
h2{font:900 82px/1.04 'Lexend';letter-spacing:-2.4px;margin-top:26px}
.tip{font:700 38px/1.36 'Plus Jakarta Sans';color:#5C4E3A;margin-top:22px}
.card{margin-top:46px;background:#fff;border:2px solid rgba(150,72,36,.12);border-radius:40px;padding:40px 40px 36px;box-shadow:0 22px 50px rgba(0,0,0,.08),0 3px 10px rgba(0,0,0,.04)}
.label{display:flex;align-items:center;gap:12px;font:800 24px 'Plus Jakarta Sans';letter-spacing:2px;color:#047857;text-transform:uppercase}
.es{font:800 54px/1.24 'Lexend';letter-spacing:-1px;margin-top:22px;color:#D6CCBE}
.es .on{color:#1A1208}
.en{font:600 34px/1.38 'Plus Jakarta Sans';color:#5C4E3A;margin-top:20px}
.row{display:flex;align-items:center;gap:20px;margin-top:30px}
.play{width:78px;height:78px;border-radius:50%;background:#059669;display:flex;align-items:center;justify-content:center;flex:none}
.wave{display:flex;align-items:center;gap:6px;height:80px;flex:1}
.wave i{display:block;width:8px;border-radius:4px;background:#E5DED3}
.note{display:inline-flex;align-items:center;gap:12px;margin-top:34px;padding:16px 24px;border-radius:22px;background:#FFF7ED;border:2px solid #FED7AA;color:#9A3412;font:700 32px 'Plus Jakarta Sans'}
/* outro */
.out{position:absolute;inset:0;background:#FAF8F5;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 120px 360px 70px;text-align:center}
.out img{width:300px;height:300px}
.out h3{font:900 66px/1.1 'Lexend';letter-spacing:-2px;margin-top:26px}
.out h3 span{color:#964824}
.out p{font:700 36px/1.4 'Plus Jakarta Sans';color:#5C4E3A;margin-top:24px}
.out .save{display:inline-flex;align-items:center;gap:12px;margin-top:40px;padding:18px 30px;border-radius:999px;border:2.5px solid #047857;color:#047857;font:800 32px 'Plus Jakarta Sans'}
"""

JS = """
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)); const ease=x=>1-Math.pow(1-clamp(x),3);
function pop(el,t,t0,d=.28){if(!el)return;const p=ease((t-t0)/d);el.style.opacity=p;el.style.transform=`translateY(${(1-p)*30}px)`;}
function seeded(n,s){let a=[];for(let i=0;i<n;i++){s=(s*9301+49297)%233280;a.push(s/233280);}return a;}
const bars=seeded(46,11);
function initWave(){const w=document.getElementById('wave');if(w)w.innerHTML=bars.map(v=>`<i style="height:${18+v*58}px"></i>`).join('');}
function wave(p,t){[...document.getElementById('wave').children].forEach((b,i)=>{const on=i/bars.length<p;
 b.style.background=on?'#059669':'#E5DED3';const w=on&&p<1?0.72+0.28*Math.sin(t*20+i*1.9):1;b.style.height=`${(18+bars[i]*58)*w}px`;});}
function words(p){const ws=[...document.querySelectorAll('.es span')];const n=Math.ceil(ws.length*p);ws.forEach((w,i)=>w.className=i<n?'on':'');}
"""


def page(body, extra_js=""):
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{body}<script>{JS}{extra_js}</script></body></html>"


def render_overlays(reel, d, browser):
    """Transparent PNGs laid over the b-roll clips."""
    hook = reel["hook"]
    items = {"hook": f"""<div class="shade"></div><div class="ov"><span class="pill">{svg('pin', 26, '#964824')}BOCAS DEL TORO</span>
                <h1>{hook[0]}<br>{hook[1]}</h1><p>{hook[2]}</p></div>"""}
    for i, s in enumerate(reel["steps"], 1):
        items[f"step{i}"] = f"""<div class="shade"></div><div class="ov"><span class="pill">{s['kicker']}</span>
                <h1>{s['title']}</h1></div>"""
    p = browser.new_page(viewport={"width": W, "height": H})
    for name, body in items.items():
        p.set_content(page(body))
        p.evaluate("document.fonts.ready")
        p.wait_for_timeout(150)
        p.screenshot(path=str(d / f"ov_{name}.png"), omit_background=True)
    p.close()


def render_card(reel, d, browser, i, step, voice_len, card_len):
    still = d / f"step{i}_still.jpg"
    run(["ffmpeg", "-v", "error", "-y", "-sseof", "-0.3", "-i", d / f"step{i}.mp4", "-frames:v", 1, still])
    spanish = step.get("line") or preset_text(step["preset"])
    es_spans = " ".join(f"<span>{w}</span>" for w in spanish.split())
    note = f'<div class="note k" id="note">{svg("info", 30, "#9A3412")}{step["note"]}</div>' if step.get("note") else ""
    body = f"""<div class="bg" style="background-image:url('{b64(still, 'image/jpeg')}')"></div><div class="scrim"></div>
    <div class="wrap"><span class="kick k" id="kick">{step['kicker']}</span><h2 class="k" id="h2">{step['title']}</h2>
      <div class="tip k" id="tip">{step['tip']}</div>
      <div class="card k" id="card"><div class="label">{svg('speaker', 30, '#047857')}Say it like a local</div>
        <div class="es">{es_spans}</div><div class="en k" id="en">{step['en']}</div>
        <div class="row"><div class="play"><svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M7 4l13 8-13 8z"/></svg></div><div class="wave" id="wave"></div></div>
      </div>{note}</div>"""
    js = f"""initWave();
    function render(t){{pop(kick,t,0);pop(h2,t,.06);pop(tip,t,.14);pop(card,t,.24,.32);
      const p=clamp((t-{CARD_LEAD})/{voice_len});wave(p,t);words(p);pop(en,t,{CARD_LEAD}+{voice_len}*.35);
      pop(document.getElementById('note'),t,{CARD_LEAD}+{voice_len}+.1);}}"""
    frames = d / f"card{i}_frames"
    shutil.rmtree(frames, ignore_errors=True)
    frames.mkdir()
    p = browser.new_page(viewport={"width": W, "height": H})
    p.set_content(page(body, js))
    p.evaluate("document.fonts.ready")
    p.wait_for_timeout(200)
    for f in range(round(card_len * FPS)):
        p.evaluate(f"render({f / FPS})")
        p.screenshot(path=str(frames / f"{f:04d}.jpg"), type="jpeg", quality=92)
    p.close()
    run(["ffmpeg", "-v", "error", "-y", "-framerate", FPS, "-i", frames / "%04d.jpg", "-c:v", "libx264",
         "-pix_fmt", "yuv420p", "-crf", 17, d / f"seg_card{i}.mp4"])
    shutil.rmtree(frames)  # ~200 MB of JPEGs per card; the encoded segment is all we keep


def render_outro(reel, d, browser):
    body = f"""<div class="out"><img class="k" id="m" src="{b64(MASCOT, 'image/webp')}">
      <h3 class="k" id="a">Every phrase here lives in <span>PoquitoTalk</span>.</h3>
      <p class="k" id="b">Tap one and it plays out loud, in a real Panamanian voice. Or speak English and send it as a WhatsApp voice note.</p>
      <div class="save k" id="c">{svg('bookmark', 30, '#047857')}Save this for your trip</div></div>"""
    js = "function render(t){pop(m,t,0);pop(a,t,.15);pop(b,t,.45);pop(c,t,.8);}"
    frames = d / "outro_frames"
    shutil.rmtree(frames, ignore_errors=True)
    frames.mkdir()
    p = browser.new_page(viewport={"width": W, "height": H})
    p.set_content(page(body, js))
    p.evaluate("document.fonts.ready")
    p.wait_for_timeout(200)
    for f in range(round(OUTRO_LEN * FPS)):
        p.evaluate(f"render({f / FPS})")
        p.screenshot(path=str(frames / f"{f:04d}.jpg"), type="jpeg", quality=92)
    p.close()
    run(["ffmpeg", "-v", "error", "-y", "-framerate", FPS, "-i", frames / "%04d.jpg", "-c:v", "libx264",
         "-pix_fmt", "yuv420p", "-crf", 17, d / "seg_outro.mp4"])
    shutil.rmtree(frames)


_PRESET_TEXT = None


def preset_text(preset_id):
    global _PRESET_TEXT
    if _PRESET_TEXT is None:
        import re
        src = (ROOT / "scripts/generate_elevenlabs_presets.py").read_text()
        _PRESET_TEXT = dict(re.findall(r"'id': '([^']+)'.*?'spanish': '([^']+)'", src))
    return _PRESET_TEXT[preset_id]


# ---------------------------------------------------------------- 5. assembly
def broll_segment(d, name, length, out):
    vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},"
          f"eq=saturation=1.06:contrast=1.03[v];[1:v]format=rgba,fade=t=in:st=0.12:d=0.3:alpha=1[o];"
          f"[v][o]overlay=0:0")
    run(["ffmpeg", "-v", "error", "-y", "-i", d / f"{name}.mp4", "-loop", 1, "-t", length, "-i",
         d / f"ov_{name}.png", "-filter_complex", f"[0:v]{vf}", "-t", length, "-an", "-c:v", "libx264",
         "-pix_fmt", "yuv420p", "-crf", 17, "-r", FPS, out])


def assemble(reel, d, browser):
    voice_lens = [duration(d / f"step{i}_voice.wav") for i in range(1, 4)]
    card_lens = [max(CARD_MIN, CARD_LEAD + v + CARD_TAIL) for v in voice_lens]
    total = HOOK_LEN + sum(STEP_BROLL_LEN + c for c in card_lens) + OUTRO_LEN

    render_overlays(reel, d, browser)
    for i, s in enumerate(reel["steps"], 1):
        render_card(reel, d, browser, i, s, voice_lens[i - 1], card_lens[i - 1])
    render_outro(reel, d, browser)

    segs, cues, t = [], [], 0.0
    broll_segment(d, "hook", HOOK_LEN, d / "seg_hook.mp4")
    segs.append(d / "seg_hook.mp4")
    t += HOOK_LEN
    for i in range(1, 4):
        broll_segment(d, f"step{i}", STEP_BROLL_LEN, d / f"seg_step{i}.mp4")
        segs += [d / f"seg_step{i}.mp4", d / f"seg_card{i}.mp4"]
        t += STEP_BROLL_LEN
        cues.append((SFX_CARD, t + 0.2, 0.35))
        cues.append((d / f"step{i}_voice.wav", t + CARD_LEAD, 1.0))
        t += card_lens[i - 1]
    segs.append(d / "seg_outro.mp4")
    cues.append((SFX_SETTLE, t, 0.7))

    lst = d / "concat.txt"
    lst.write_text("".join(f"file '{s}'\n" for s in segs))
    raw = d / "video_raw.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", 0, "-i", lst, "-c:v", "libx264", "-pix_fmt",
         "yuv420p", "-crf", 18, "-r", FPS, raw])

    music = build_music(reel, d, total)
    inputs, chains, labels = [], [], []
    for n, (f, at, vol) in enumerate(cues):
        ms = int(round(at * 1000))
        inputs += ["-i", f]
        chains.append(f"[{n}:a]aresample=44100,aformat=channel_layouts=stereo,volume={vol},adelay={ms}|{ms}[c{n}]")
        labels.append(f"[c{n}]")
    m = len(cues)
    inputs += ["-i", music]
    chains.append(f"{''.join(labels)}amix=inputs={m}:normalize=0,asplit=2[fx][key]")
    chains.append(f"[{m}:a]aresample=44100,aformat=channel_layouts=stereo,volume=0.5,afade=t=in:d=0.4[mus]")
    chains.append("[mus][key]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=300[duck]")
    chains.append(f"[fx][duck]amix=inputs=2:normalize=0,atrim=0:{total:.3f},afade=t=out:st={total - 0.8:.3f}:d=0.8,"
                  "loudnorm=I=-14:TP=-1.5:LRA=9[aout]")
    wav = d / "mix.wav"
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(chains), "-map", "[aout]",
         "-ar", 48000, wav])

    final = BUILD / f"reel_{reel['id']}.mp4"
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "256k", "-t", f"{total:.3f}", "-movflags", "+faststart", final])
    run(["ffmpeg", "-v", "error", "-y", "-ss", 1.0, "-i", final, "-frames:v", 1, "-q:v", 2,
         BUILD / f"reel_{reel['id']}_cover.jpg"])
    (d / "cue_sheet.json").write_text(json.dumps(
        [{"file": str(Path(f).name), "at_s": round(a, 3), "frame": round(a * FPS)} for f, a, _ in cues], indent=2))
    print(f"  => {final.relative_to(ROOT)} ({total:.1f}s)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--reel", choices=[r["id"] for r in REELS])
    ap.add_argument("--keyframes-only", action="store_true", help="stop after keyframes to review them")
    args = ap.parse_args()
    reels = [r for r in REELS if not args.reel or r["id"] == args.reel]

    print("1-2/5 keyframes + Kling (parallel)")
    pending = {}
    for reel in reels:
        d = BUILD / reel["id"]
        d.mkdir(parents=True, exist_ok=True)
        for name, h in build_broll(reel, d, args.keyframes_only).items():
            pending[(d, name)] = h
    if args.keyframes_only:
        return
    print("3/5 voice lines")
    for reel in reels:
        build_lines(reel, BUILD / reel["id"])
    collect_broll(pending)

    print("4-5/5 render + assemble")
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for reel in reels:
            assemble(reel, BUILD / reel["id"], browser)
        browser.close()


if __name__ == "__main__":
    main()

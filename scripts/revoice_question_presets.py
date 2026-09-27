#!/usr/bin/env python3
"""
Re-voice every preset whose Spanish text ends in a question, so the question audibly rises.

Method (same as the Instagram reels, see scripts/intonation_check.py):
  - the line is voiced sentence by sentence, each with its neighbours as context (previous_text/next_text)
  - greetings and statements keep their first, natural take (a rising "¡Buenas!" is how people talk)
  - each question gets up to TAKES takes; the one that ends highest wins (must rise AND end above
    the sentence's median pitch); if none reaches MIN_Q_RISE, the best take gets a PSOLA question tune
  - sentences are joined with a short natural pause

Reads the app's text from src/services/presets.ts (the source of truth) and writes
assets/audio/presets/{diego,sofia}_{file_id}.mp3. Old clips are backed up first.
Afterwards run scripts/build_offline_presets.py to re-bundle.

Usage: python3 scripts/revoice_question_presets.py [--only id1,id2] [--persona diego|sofia]
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from intonation_check import analyze, question_tune  # noqa: E402

PRESETS = ROOT / "assets/audio/presets"
BACKUP = ROOT / "assets/audio/presets_backup_pre_intonation"
WORK = ROOT / "build_revoice"  # takes + report; not shipped
VOICES = {"diego": "JBFqnCBsd6RMkjVDRZzb", "sofia": "cgSgspJ2msm6clMCkdW9"}  # src/services/elevenLabsVoice.ts
VOICE_SETTINGS = {"stability": 0.45, "similarity_boost": 0.85, "style": 0.20, "use_speaker_boost": True}
TAKES = 8
MIN_Q_RISE = 3.0
GAP = 0.16


def run(cmd):
    subprocess.run([str(c) for c in cmd], check=True)


def api_key():
    for line in (ROOT / ".env").read_text().splitlines():
        if "ELEVENLABS_API_KEY" in line and "=" in line:
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("No ELEVENLABS_API_KEY in .env")


def question_presets():
    src = (ROOT / "src/services/presets.ts").read_text()
    phrases = re.findall(r"\{\s*id: '([a-z0-9_]+)',\s*subCategory.*?output: '((?:[^'\\]|\\.)*)'", src, re.S)
    alias_block = (ROOT / "src/services/presetAudio.ts").read_text().split("PRESET_AUDIO_ALIASES")[1].split("};")[0]
    aliases = dict(re.findall(r"(\w+): '(\w+)'", alias_block))
    out = {}
    for pid, text in phrases:
        text = text.replace("\\'", "'")
        if not text.strip().endswith("?"):
            continue
        file_id = aliases.get(pid, pid)
        if file_id in out and out[file_id] != text:
            print(f"  note: {file_id} is shared by several phrases; using the first text")
            continue
        out[file_id] = text
    return out


def split_sentences(text):
    return [m.strip() for m in re.findall(r"[¡¿]?[^.!?]+[.!?]+", text)]


def tts(key, persona, text, prev_text, next_text, seed, mp3):
    txt = mp3.with_suffix(".txt")
    wav = mp3.with_suffix(".wav")
    if wav.exists() and txt.exists() and txt.read_text() == text:
        return wav  # already paid for this exact take
    for attempt in range(4):  # the API occasionally drops connections
        try:
            r = requests.post(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICES[persona]}?output_format=mp3_44100_128",
                              headers={"xi-api-key": key, "Content-Type": "application/json"},
                              json={"text": text, "model_id": "eleven_multilingual_v2", "voice_settings": VOICE_SETTINGS,
                                    "previous_text": prev_text or None, "next_text": next_text or None, "seed": seed},
                              timeout=60)
            r.raise_for_status()
            break
        except (requests.ConnectionError, requests.Timeout):
            if attempt == 3:
                raise
            time.sleep(5 * (attempt + 1))
    mp3.write_bytes(r.content)
    run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af",
         "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
         "silenceremove=start_periods=1:start_threshold=-45dB,areverse", "-ar", 44100, "-ac", 1, wav])
    txt.write_text(text)
    return wav


def score(wav):
    v = analyze(wav)["end_contour_st"]
    return v if v is not None else -99.0


def revoice(key, persona, file_id, text):
    d = WORK / persona / file_id
    d.mkdir(parents=True, exist_ok=True)
    sentences = split_sentences(text)
    parts, report = [], []
    for j, sent in enumerate(sentences):
        is_q = sent.endswith("?")
        prev_text, next_text = " ".join(sentences[:j]), " ".join(sentences[j + 1:])
        best = None
        for seed in range(1, (TAKES if is_q else 1) + 1):
            wav = tts(key, persona, sent, prev_text, next_text, seed, d / f"s{j}_t{seed}.mp3")
            sc = score(wav) if is_q else 0.0
            if best is None or sc > best[0]:
                best = (sc, wav, seed)
            if is_q and sc >= MIN_Q_RISE + 1.0:
                break
        sc, wav, seed = best
        tuned = False
        if is_q and sc < MIN_Q_RISE:
            fixed = d / f"s{j}_tune.wav"
            question_tune(wav, fixed)
            if score(fixed) > sc:
                wav, sc, tuned = fixed, score(fixed), True
        parts.append(wav)
        report.append({"sentence": sent, "question": is_q, "take": seed, "end_contour_st": round(sc, 2),
                       "question_tune": tuned, "flag": bool(is_q and sc < MIN_Q_RISE)})

    inputs, labels, gaps = [], [], []
    for n, w in enumerate(parts):
        inputs += ["-i", w]
        labels.append(f"[{n}:a]")
        if n < len(parts) - 1:
            gaps.append(f"aevalsrc=0:d={GAP}:s=44100[g{n}]")
            labels.append(f"[g{n}]")
    fc = ";".join(gaps + ["".join(labels) + f"concat=n={len(labels)}:v=0:a=1[out]"])
    out = PRESETS / f"{persona}_{file_id}.mp3"
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[out]",
         "-ar", 44100, "-ac", 1, "-b:a", "128k", out])
    return report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="comma-separated file ids")
    ap.add_argument("--persona", choices=list(VOICES))
    args = ap.parse_args()
    key = api_key()
    presets = question_presets()
    if args.only:
        presets = {k: v for k, v in presets.items() if k in args.only.split(",")}
    personas = [args.persona] if args.persona else list(VOICES)

    BACKUP.mkdir(exist_ok=True)
    WORK.mkdir(exist_ok=True)
    full = {}
    for persona in personas:
        for i, (file_id, text) in enumerate(sorted(presets.items()), 1):
            src = PRESETS / f"{persona}_{file_id}.mp3"
            if src.exists() and not (BACKUP / src.name).exists():
                shutil.copy2(src, BACKUP / src.name)  # keep the original once
            rep = revoice(key, persona, file_id, text)
            full[f"{persona}_{file_id}"] = rep
            flags = [r["sentence"] for r in rep if r["flag"]]
            q = [r for r in rep if r["question"]]
            print(f"[{persona} {i}/{len(presets)}] {file_id}: " +
                  ", ".join(f"{r['end_contour_st']:+.1f}st{' (tuned)' if r['question_tune'] else ''}" for r in q) +
                  (f"  <-- CHECK BY EAR: {flags}" if flags else ""), flush=True)
            (WORK / "report.json").write_text(json.dumps(full, indent=2, ensure_ascii=False))

    flagged = [k for k, rep in full.items() if any(r["flag"] for r in rep)]
    tuned = [k for k, rep in full.items() if any(r["question_tune"] for r in rep)]
    print(f"\nDone: {len(full)} clips. Pitch-tuned: {len(tuned)}. Still below target (check by ear): {len(flagged)}")
    for k in flagged:
        print("  ", k)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Pitch-contour check for Spanish voice lines (Praat via parselmouth).

  final_rise_st : pitch of the last 300 ms of voicing vs the 600 ms before it, in semitones.
                  A yes/no question should end rising (> +1.5 st); a statement/greeting falling.
  Also reports the opening word's ending contour if the clip starts with a separate chunk
  (e.g. "¡Buenas!" followed by a pause), so a greeting that sounds like "¿Buenas?" is caught.

Usage: python3 scripts/intonation_check.py file1.mp3 [file2.wav ...]
"""
import math
import sys

import numpy as np
import parselmouth


def contour(path):
    snd = parselmouth.Sound(str(path))
    pitch = snd.to_pitch_ac(time_step=0.01, pitch_floor=65, pitch_ceiling=450)
    t = pitch.xs()
    f0 = pitch.selected_array["frequency"]
    v = f0 > 0
    if v.sum() > 10:  # drop octave jumps (> 10 st from the speaker's median)
        med = np.median(f0[v])
        f0[v & (np.abs(12 * np.log2(np.where(v, f0, med) / med)) > 10)] = 0
    return t, f0


def st(a, b):
    return 12 * math.log2(a / b)


def final_rise(t, f0, tail=0.30, before=0.60):
    voiced = f0 > 0
    if voiced.sum() < 10:
        return None
    end = t[voiced][-1]
    last = f0[voiced & (t > end - tail)]
    prev = f0[voiced & (t <= end - tail) & (t > end - tail - before)]
    if len(last) < 3 or len(prev) < 3:
        return None
    return st(np.median(last), np.median(prev))


def first_chunk_rise(t, f0, gap=0.12):
    """Contour at the end of the first voiced chunk (the opening greeting), if separated by a pause."""
    idx = np.where(f0 > 0)[0]
    if len(idx) < 10:
        return None
    breaks = np.where(np.diff(t[idx]) > gap)[0]
    if not len(breaks):
        return None
    chunk = idx[: breaks[0] + 1]
    if t[chunk[-1]] - t[chunk[0]] > 1.2:  # not a short greeting
        return None
    ct, cf = t[chunk], f0[chunk]
    half = ct[0] + (ct[-1] - ct[0]) / 2
    a, b = cf[ct > half], cf[ct <= half]
    return st(np.median(a), np.median(b)) if len(a) > 2 and len(b) > 2 else None


def shape_rise(t, f0):
    """Last third vs first third of voicing — for clips too short for final_rise (e.g. '¡Buenas!')."""
    v = f0[f0 > 0]
    if len(v) < 9:
        return None
    k = len(v) // 3
    return st(np.median(v[-k:]), np.median(v[:k]))


def final_height(t, f0, tail=0.25):
    """Pitch of the last `tail` s of voicing vs the whole line's median. A question must END HIGH —
    a small uptick after a long fall (e.g. '...para Bocas TOWN') still sounds like a statement."""
    v = f0 > 0
    if v.sum() < 10:
        return None
    end = t[v][-1]
    last = f0[v & (t > end - tail)]
    return st(np.median(last), np.median(f0[v])) if len(last) >= 3 else None


def analyze(path):
    t, f0 = contour(path)
    voiced_s = float((f0 > 0).sum()) * 0.01
    fr = final_rise(t, f0)
    local = fr if (fr is not None and voiced_s >= 1.0) else shape_rise(t, f0)
    height = final_height(t, f0)
    return {"final_rise_st": fr, "opening_rise_st": first_chunk_rise(t, f0), "voiced_s": voiced_s,
            "final_height_st": height,
            # one number to judge a contour by: it must both rise locally and end above the median
            "end_contour_st": local if height is None or local is None else min(local, height)}


def lift_tail(src, dst, lift_st, window=0.45):
    """Raise the pitch over the last `window` s of voicing, ramping 0 -> lift_st (PSOLA resynthesis).
    Duration and timbre are untouched; used when no TTS take ends with a question rise."""
    from parselmouth.praat import call
    snd = parselmouth.Sound(str(src)).convert_to_mono()
    t, f0 = contour(src)
    end = t[f0 > 0][-1]
    t0 = max(0.0, end - window)
    manip = call(snd, "To Manipulation", 0.01, 65, 450)
    tier = call(manip, "Extract pitch tier")
    call(tier, "Formula", f"if x > {t0} then self * 2^(min(1, (x - {t0}) / {end - t0}) * {lift_st} / 12) else self fi")
    call([manip, tier], "Replace pitch tier")
    call(manip, "Get resynthesis (overlap-add)").save(str(dst), "WAV")


def question_tune(src, dst, target_height=4.0, compress=0.6, window=0.6):
    """Reshape a line into an audible rising question (PSOLA resynthesis, timing and timbre untouched):
    the body's pitch excursions are compressed toward the median (so an early peak on '¿A qué HORA'
    no longer dominates), then the last `window` s ramps up to `target_height` st above the median."""
    from parselmouth.praat import call
    t, f0 = contour(src)
    v = f0 > 0
    med = float(np.median(f0[v]))
    end = float(t[v][-1])
    t0 = max(0.0, end - window)
    h = final_height(t, f0) or 0.0
    lift = float(np.clip(target_height - compress * h, 0.0, 7.0))
    snd = parselmouth.Sound(str(src)).convert_to_mono()
    manip = call(snd, "To Manipulation", 0.01, 65, 450)
    tier = call(manip, "Extract pitch tier")
    body = f"{med} * (self / {med}) ^ {compress}"
    call(tier, "Formula", f"if x > {t0} then {body} * 2^(min(1, (x - {t0}) / {end - t0}) * {lift} / 12) else {body} fi")
    call([manip, tier], "Replace pitch tier")
    call(manip, "Get resynthesis (overlap-add)").save(str(dst), "WAV")
    return lift


if __name__ == "__main__":
    for p in sys.argv[1:]:
        r = analyze(p)
        fmt = lambda v: "   n/a" if v is None else f"{v:+6.1f}"
        print(f"end {fmt(r['end_contour_st'])} st (rise {fmt(r['final_rise_st'])}, height {fmt(r['final_height_st'])}) "
              f"| opening {fmt(r['opening_rise_st'])} st | {p}")

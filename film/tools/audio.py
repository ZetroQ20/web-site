#!/usr/bin/env python3
"""Build the soundtrack: song + one downloaded SFX per event, then -14 LUFS.

    python3 -I film/tools/audio.py [--music-offset SECONDS]

- Song: assets/audio.mp3 (120 BPM). --music-offset is where its first downbeat sits
  in the file; the film's t=0 is placed there. Edit the track beforehand so the drop
  lands at 8.0 s, the breakdown runs 22.0–26.0 s and the beat returns at 26.0 s.
- SFX: assets/sfx/<name>.wav|mp3, names from the cue list in index.html. Each file is
  placed by its measured peak (loudest 5 ms window), or by its end for align:"end".
  Missing files are skipped and listed. Nothing is synthesized.
"""
import json
import os
import re
import subprocess
import sys

import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SR, DUR = 48000, 27.0


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def peak_index(x):
    env = np.abs(x).max(axis=1)
    win = int(SR * 0.005)
    sm = np.convolve(env, np.ones(win) / win, mode="same")
    return int(np.argmax(sm))


def main():
    off = 0.0
    if "--music-offset" in sys.argv:
        off = float(sys.argv[sys.argv.index("--music-offset") + 1])
    html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    cues = json.loads(re.search(r'<script type="application/json" id="cues">(.*?)</script>', html, re.S).group(1))
    n = int(SR * DUR)
    mix = np.zeros((n, 2), np.float32)

    song = os.path.join(ROOT, "assets", "audio.mp3")
    if os.path.exists(song):
        s = decode(song)[int(off * SR):][:n]
        fade = int(SR * 0.012)                               # click-free loop point
        s[-fade:] *= np.linspace(1, 0, fade)[:, None]
        mix[:len(s)] += s

    missing, cache = set(), {}
    for c in cues:
        name = c["sfx"]
        if name not in cache:
            p = next((os.path.join(ROOT, "assets", "sfx", f"{name}.{e}") for e in ("wav", "mp3")
                      if os.path.exists(os.path.join(ROOT, "assets", "sfx", f"{name}.{e}"))), None)
            cache[name] = decode(p) if p else None
        x = cache[name]
        if x is None:
            missing.add(name)
            continue
        if c.get("align") == "end":
            start = int(c["end"] * SR) - len(x)
        else:
            start = int(c["t"] * SR) - peak_index(x)
        a, b = max(0, start), min(n, start + len(x))
        if b > a:
            mix[a:b] += x[a - start:b - start] * float(c.get("gain", 0.55))

    tmp = os.path.join(ROOT, "out", "mix.raw.wav")
    os.makedirs(os.path.dirname(tmp), exist_ok=True)
    pcm = (np.clip(mix, -1, 1) * 32767).astype("<i2")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", tmp],
                   input=pcm.tobytes(), check=True)
    # two-pass loudnorm to -14 LUFS integrated, -1 dBTP
    m = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    af = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
          f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", af, "-ar", str(SR), os.path.join(ROOT, "out", "mix.wav")], check=True)
    os.remove(tmp)
    if missing:
        print("missing SFX (skipped):", ", ".join(sorted(missing)))
    print("→ out/mix.wav (-14 LUFS)")


if __name__ == "__main__":
    main()

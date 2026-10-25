#!/usr/bin/env python3
"""QA for a rendered film.

    python3 -I film/tools/qa.py film/out/film.mp4

1. Pops: mean absolute frame difference per frame (grey, 360 px). A frame whose
   difference is > 3x both neighbours' (and above a noise floor) is flagged as a
   single-frame pop.
2. Loop seam: the last→first difference must look like any other frame step.
3. Beat grid: one frame per beat is written to out/qa/beat-NN.png for review.
"""
import json
import os
import subprocess
import sys

import numpy as np

FPS, BPM, BEATS, SIZE = 60, 120, 54, 360


def frames(path):
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={SIZE}:{SIZE},format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, SIZE, SIZE).astype(np.float32)


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "out", "film.mp4")
    out = os.path.join(os.path.dirname(os.path.abspath(path)), "qa")
    os.makedirs(out, exist_ok=True)
    f = frames(path)
    n = len(f)
    d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))          # d[i] = |f[i+1] - f[i]|
    seam = float(np.abs(f[0] - f[-1]).mean())
    floor = max(0.6, float(np.median(d)) * 2)
    pops = []
    for i in range(1, len(d) - 1):
        nb = max(d[i - 1], d[i + 1])
        if d[i] > floor and d[i] > 3 * nb:
            pops.append({"frame": i + 1, "t": round((i + 1) / FPS, 3), "diff": round(float(d[i]), 2), "neighbours": round(float(nb), 2)})
    # seam treated like any other step: compare with the steps around it
    seam_nb = max(d[-1], d[0])
    seam_ok = seam <= max(floor, 3 * seam_nb)
    spb = 60 / BPM
    for b in range(BEATS):
        idx = min(n - 1, round(b * spb * FPS))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vf", f"select=eq(n\\,{idx})", "-frames:v", "1",
                        os.path.join(out, f"beat-{b + 1:02d}.png")], check=True)
    report = {"frames": n, "duration": n / FPS, "median_diff": round(float(np.median(d)), 3), "pop_floor": round(floor, 3),
              "pops": pops, "seam_diff": round(seam, 3), "seam_neighbours": round(float(seam_nb), 3), "seam_ok": bool(seam_ok),
              "largest_steps": [{"frame": int(i + 1), "t": round((i + 1) / FPS, 3), "diff": round(float(d[i]), 2)} for i in np.argsort(d)[-8:][::-1]]}
    with open(os.path.join(out, "report.json"), "w") as fh:
        json.dump(report, fh, indent=2)
    print(json.dumps(report, indent=2))
    sys.exit(1 if pops or not seam_ok else 0)


if __name__ == "__main__":
    main()

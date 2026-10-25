#!/usr/bin/env python3
"""Generate stand-in assets so the film renders before the real ones arrive.

Never overwrites an existing file: drop your real assets into film/assets/
under the same names and they win. No human figures anywhere.

    python3 film/tools/placeholders.py
"""
import math
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
os.makedirs(ROOT, exist_ok=True)

INK = (11, 11, 11)
PAPER = (244, 242, 238)


def out(name):
    path = os.path.join(ROOT, name)
    if os.path.exists(path):
        print(f"keep   {name}")
        return None
    print(f"create {name}")
    return path


def vgrad(size, top, bottom):
    w, h = size
    img = Image.new("RGB", size)
    d = ImageDraw.Draw(img)
    for y in range(h):
        u = y / (h - 1)
        d.line([(0, y), (w, y)], fill=tuple(int(a + (b - a) * u) for a, b in zip(top, bottom)))
    return img


def villa(golden):
    """Minimalist villa render. Day and golden hour share every vertex."""
    S = 2048
    sky = ((250, 214, 160), (238, 160, 98)) if golden else ((206, 222, 236), (240, 243, 246))
    img = vgrad((S, S), *sky)
    d = ImageDraw.Draw(img, "RGBA")
    horizon = int(S * 0.62)
    ground = (196, 150, 104) if golden else (214, 208, 196)
    d.rectangle([0, horizon, S, S], fill=ground)
    # sun
    if golden:
        d.ellipse([S * 0.14, S * 0.46, S * 0.26, S * 0.58], fill=(255, 226, 170))
    else:
        d.ellipse([S * 0.78, S * 0.08, S * 0.86, S * 0.16], fill=(255, 255, 252))
    wall = (236, 214, 186) if golden else (250, 250, 248)
    wall_side = (186, 140, 104) if golden else (222, 222, 220)
    glass = (70, 46, 30) if golden else (40, 52, 62)
    glow = (255, 196, 120) if golden else (64, 80, 92)
    # lower volume
    d.rectangle([S * 0.18, S * 0.44, S * 0.70, horizon], fill=wall)
    d.polygon([(S * 0.70, S * 0.44), (S * 0.82, S * 0.48), (S * 0.82, horizon + S * 0.03), (S * 0.70, horizon)], fill=wall_side)
    # cantilevered upper volume
    d.rectangle([S * 0.36, S * 0.30, S * 0.92, S * 0.44], fill=wall)
    d.polygon([(S * 0.92, S * 0.30), (S * 0.98, S * 0.33), (S * 0.98, S * 0.46), (S * 0.92, S * 0.44)], fill=wall_side)
    # glazing
    d.rectangle([S * 0.24, S * 0.48, S * 0.64, horizon - S * 0.02], fill=glass)
    d.rectangle([S * 0.42, S * 0.33, S * 0.88, S * 0.41], fill=glass)
    for x in (0.34, 0.44, 0.54):
        d.rectangle([S * x, S * 0.48, S * x + 6, horizon - S * 0.02], fill=wall)
    if golden:  # interior lit warm
        d.rectangle([S * 0.26, S * 0.52, S * 0.40, horizon - S * 0.04], fill=glow + (150,))
        d.rectangle([S * 0.60, S * 0.35, S * 0.80, S * 0.40], fill=glow + (120,))
    # pool
    pool = (226, 150, 92) if golden else (120, 186, 206)
    d.polygon([(S * 0.06, S * 0.80), (S * 0.66, S * 0.80), (S * 0.74, S * 0.92), (S * 0.0, S * 0.92)], fill=pool)
    # shadows: harsh short at noon, long at golden hour
    sh = (0, 0, 0, 70) if not golden else (60, 20, 0, 90)
    if golden:
        d.polygon([(S * 0.70, horizon), (S * 0.82, horizon + S * 0.03), (S * 1.0, S * 0.78), (S * 0.86, S * 0.78)], fill=sh)
    else:
        d.polygon([(S * 0.18, horizon), (S * 0.70, horizon), (S * 0.72, horizon + S * 0.04), (S * 0.2, horizon + S * 0.04)], fill=sh)
    return img.filter(ImageFilter.GaussianBlur(0.6))


def ui_shot(seed, w=2400, h=1800):
    """Abstract UI screenshot: cards, bars, type blocks."""
    tints = [(232, 226, 216), (20, 20, 20), (226, 222, 214), (236, 232, 226), (24, 22, 20), (240, 236, 230)]
    bg = tints[seed % len(tints)]
    dark = sum(bg) < 200
    fg = PAPER if dark else INK
    mid = (90, 88, 84) if dark else (170, 164, 156)
    img = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([80, 70, w - 80, 170], 50, fill=fg)
    d.rounded_rectangle([120, 260, w * 0.55, 420], 18, fill=fg)
    d.rounded_rectangle([120, 450, w * 0.42, 520], 14, fill=mid)
    cols = 3 + seed % 2
    cw = (w - 240 - (cols - 1) * 40) / cols
    for i in range(cols):
        x = 120 + i * (cw + 40)
        y = 640 + (i % 2) * 80
        d.rounded_rectangle([x, y, x + cw, h - 120], 36, fill=mid)
        d.ellipse([x + 40, y + 40, x + 130, y + 130], fill=fg)
        d.rounded_rectangle([x + 40, h - 300, x + cw * 0.7, h - 250], 12, fill=fg)
    r = 180 + seed * 20
    d.ellipse([w * 0.7, 220, w * 0.7 + r * 2, 220 + r * 2], outline=fg, width=18)
    return img


def beauty_mobile():
    w, h = 1170, 2532
    img = vgrad((w, h), (238, 228, 214), (214, 196, 176))
    d = ImageDraw.Draw(img)
    # arched alcove with vessels, no figures
    d.rounded_rectangle([160, 260, w - 160, 1500], 500, fill=(226, 210, 190))
    d.rectangle([160, 760, w - 160, 1500], fill=(226, 210, 190))
    d.rectangle([120, 1500, w - 120, 1560], fill=(160, 128, 100))
    for i, (x, hh) in enumerate([(330, 360), (520, 520), (720, 300)]):
        d.rounded_rectangle([x, 1500 - hh, x + 130, 1500], 60, fill=(250, 246, 240) if i != 1 else (40, 32, 28))
    d.ellipse([w / 2 - 120, 420, w / 2 + 120, 660], fill=(246, 236, 222))
    return img


def dashboard():
    img = Image.new("RGB", (2400, 1500), (10, 10, 10))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 2400, 110], fill=(18, 18, 18))
    for i in range(6):
        y = 200 + i * 200
        d.rounded_rectangle([80, y, 2320, y + 160], 24, fill=(22, 22, 22))
        d.ellipse([120, y + 60, 160, y + 100], fill=(236, 236, 236))
        d.rounded_rectangle([200, y + 50, 700, y + 80], 10, fill=(230, 230, 230))
        d.rounded_rectangle([200, y + 100, 1100, y + 120], 8, fill=(90, 90, 90))
    return img


def monitor_clip():
    """Locked-off desk shot, 1920x1080, blank ultra-wide monitor.
    Screen quad must match SCREEN_SRC in index.html: (550,325)-(1370,675)."""
    path = out("monitor.mp4")
    if not path:
        return
    w, h = 1920, 1080
    img = vgrad((w, h), (232, 228, 222), (214, 208, 200))
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle([0, 860, w, h], fill=(196, 168, 132))            # oak desk
    d.rectangle([0, 860, w, 872], fill=(176, 148, 112))
    d.polygon([(930, 700), (990, 700), (1010, 850), (910, 850)], fill=(40, 40, 42))  # stand
    d.rounded_rectangle([860, 846, 1060, 866], 8, fill=(36, 36, 38))
    d.rounded_rectangle([536, 311, 1384, 689], 14, fill=(30, 30, 32))  # bezel
    d.rectangle([550, 325, 1370, 675], fill=(6, 6, 7))                 # blank screen
    d.rounded_rectangle([1440, 800, 1700, 862], 10, fill=(236, 234, 230))  # keyboard-free tray
    d.ellipse([300, 780, 420, 866], fill=(244, 240, 234))              # ceramic cup
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    tmp = path + ".png"
    img.save(tmp)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-i", tmp, "-t", "8", "-r", "30",
                    "-vf", "noise=alls=3:allf=t", "-c:v", "libx264", "-pix_fmt", "yuv420p", path], check=True)
    os.remove(tmp)


def save(name, img, q=92):
    path = out(name)
    if path:
        img.save(path, quality=q)


save("villa-day.jpg", villa(False))
save("villa-night.jpg", villa(True))
save("beauty-mobile.jpg", beauty_mobile())
save("dashboard.jpg", dashboard())
for i in range(1, 7):
    save(f"ui-{i}.jpg", ui_shot(i))
monitor_clip()
print("assets ready in", os.path.abspath(ROOT))

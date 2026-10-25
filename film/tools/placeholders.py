#!/usr/bin/env python3
"""Generate flat stand-in assets so the film renders before the real ones arrive.

Never overwrites an existing file: drop your real images into film/assets/
under the same names and they win. No human figures anywhere.

    python3 film/tools/placeholders.py
"""
import os

from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
os.makedirs(ROOT, exist_ok=True)


def vgrad(size, top, bottom):
    w, h = size
    img = Image.new("RGB", size)
    d = ImageDraw.Draw(img)
    for y in range(h):
        u = y / (h - 1)
        d.line([(0, y), (w, y)], fill=tuple(int(a + (b - a) * u) for a, b in zip(top, bottom)))
    return img


def arch(golden, s=1440):
    img = vgrad((s, s), (246, 150, 96) if golden else (120, 170, 230), (250, 214, 160) if golden else (236, 240, 246))
    d = ImageDraw.Draw(img)
    d.ellipse([-200, s * .62, s + 200, s * 1.5], fill=(150, 120, 60) if golden else (92, 128, 70))
    d.rounded_rectangle([s * .38, s * .3, s * .62, s * .66], 160, fill=(120, 110, 96))
    d.rounded_rectangle([s * .44, s * .38, s * .56, s * .66], 90, fill=(250, 200, 140) if golden else (170, 200, 236))
    return img


def crescent(size):
    w, h = size
    img = vgrad(size, (168, 190, 130), (120, 150, 100))
    d = ImageDraw.Draw(img)
    d.polygon([(0, h * .7), (w * .45, h * .45), (w, h * .8), (w, h), (0, h)], fill=(96, 122, 82))
    r = min(w, h) * .2
    d.ellipse([w * .5 - r, h * .3 - r, w * .5 + r, h * .3 + r], fill=(255, 248, 210))
    d.ellipse([w * .5 - r * 1.2, h * .3 - r * 1.1, w * .5 + r * .8, h * .3 + r * .9], fill=(168, 190, 130))
    return img.filter(ImageFilter.GaussianBlur(1.2))


def wall():
    img = Image.new("RGB", (1440, 1440), (236, 234, 230))
    d = ImageDraw.Draw(img)
    d.rectangle([420, 300, 1020, 1080], fill=(20, 20, 20))     # frame — matches WALL in index.html
    d.rectangle([452, 332, 988, 1050], fill=(250, 248, 244))   # mat
    return img


def save(name, make):
    path = os.path.join(ROOT, name)
    if os.path.exists(path):
        print(f"keep   {name}")
        return
    make().save(path, quality=92)
    print(f"create {name}")


save("door.jpg", lambda: vgrad((1440, 1440), (24, 10, 8), (60, 20, 14)))
save("arch-day.jpg", lambda: arch(False))
save("arch-golden.jpg", lambda: arch(True))
save("crescent.jpg", lambda: crescent((1440, 1440)))
save("print.jpg", lambda: crescent((680, 1000)))
save("wall.jpg", wall)
tints = [(236, 170, 100), (20, 40, 110), (168, 190, 130), (246, 150, 96), (40, 14, 10), (120, 170, 230), (60, 40, 120), (230, 220, 200), (220, 218, 214)]
for i, c in enumerate(tints, 1):
    save(f"grid-{i}.jpg", lambda c=c: vgrad((600, 600), c, tuple(min(255, v + 50) for v in c)))
print("assets ready in", os.path.abspath(ROOT))

#!/usr/bin/env python3
"""Build WORKING assets from the reference film (1440x1440, 60 fps).

    python3 -I film/tools/from_reference.py /path/to/reference.mp4

These are stand-ins for layout and timing only. They come from someone else's
film, so replace them with your own images before anything is published.
No people: figures are removed by cropping or inpainting, and frames that
show a person are not used at all.

Writes film/assets/: door.jpg, arch-day.jpg, arch-golden.jpg (graded from
arch-day, so the pair is pixel-aligned), crescent.jpg, print.jpg, wall.jpg,
grid-1..9.jpg. Files from this script are git-ignored.
"""
import os
import subprocess
import sys

import cv2
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")


def frame(video, t):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", video, "-frames:v", "1", "-f", "rawvideo",
                          "-pix_fmt", "bgr24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(1440, 1440, 3).copy()


def save(name, img, q=94):
    cv2.imwrite(os.path.join(ROOT, name), img, [cv2.IMWRITE_JPEG_QUALITY, q])
    print("wrote", name, img.shape[1], "x", img.shape[0])


def up(img, size):
    out = cv2.resize(img, size, interpolation=cv2.INTER_LANCZOS4)
    blur = cv2.GaussianBlur(out, (0, 0), 1.2)
    return cv2.addWeighted(out, 1.35, blur, -0.35, 0)      # gentle unsharp after upscaling


def remove_cursor(img, region):
    """Inpaint the screen-recording cursor (black arrow, white outline) inside region."""
    x0, y0, x1, y1 = region
    sub = img[y0:y1, x0:x1]
    g = cv2.cvtColor(sub, cv2.COLOR_BGR2GRAY)
    black = (g < 40).astype(np.uint8)
    white = (g > 235).astype(np.uint8)
    near = cv2.dilate(black, np.ones((5, 5), np.uint8)) & cv2.dilate(white, np.ones((5, 5), np.uint8))
    if near.sum() == 0:
        return img
    ys, xs = np.where(near > 0)
    m = np.zeros(img.shape[:2], np.uint8)
    cv2.rectangle(m, (x0 + xs.min() - 6, y0 + ys.min() - 6), (x0 + xs.max() + 6, y0 + ys.max() + 6), 255, -1)
    return cv2.inpaint(img, m, 7, cv2.INPAINT_TELEA)


def golden_grade(day):
    """Relight a daylight frame to golden hour. Same pixels, new light → perfect alignment."""
    f = day.astype(np.float32) / 255
    b, g, r = cv2.split(f)
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    blueness = np.clip((b - (r + g) / 2) * 4, 0, 1)
    h = f.shape[0]
    yy = np.linspace(0, 1, h)[:, None]
    sky = np.clip(blueness * (1.15 - yy * 1.4), 0, 1)
    sky = cv2.GaussianBlur(sky, (0, 0), 6)
    # golden-hour sky gradient (BGR)
    top = np.array([0.42, 0.55, 0.96]); bottom = np.array([0.55, 0.80, 1.0])
    grad = top[None, None, :] * (1 - yy[..., None]) + bottom[None, None, :] * yy[..., None]
    skyc = grad * (0.55 + 0.6 * lum[..., None])
    out = f * (1 - sky[..., None]) + skyc * sky[..., None]
    # warm curves on everything else, deeper shadows, amber highlights
    out[..., 2] = np.clip(out[..., 2] * 1.12 + 0.03, 0, 1)
    out[..., 1] = np.clip(out[..., 1] * 0.96, 0, 1)
    out[..., 0] = np.clip(out[..., 0] * 0.74, 0, 1)
    out = np.clip((out - 0.5) * 1.12 + 0.5 - 0.02, 0, 1)
    # low sun from the left: warm falloff
    xx = np.linspace(0, 1, f.shape[1])[None, :]
    warm = np.clip(1.15 - xx, 0, 1)[..., None] * np.array([0.0, 0.05, 0.12])[None, None, :]
    out = np.clip(out + warm * (1 - sky[..., None]) * 0.6, 0, 1)
    return (out * 255).astype(np.uint8)


def remove_thin_vertical(img, x0, x1, y0, y1):
    sub = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2GRAY).astype(np.int16)
    med = np.median(sub, axis=1, keepdims=True)
    m = np.zeros(img.shape[:2], np.uint8)
    m[y0:y1, x0:x1] = ((med - sub) > 10).astype(np.uint8) * 255
    m = cv2.dilate(m, np.ones((5, 5), np.uint8))
    return cv2.inpaint(img, m, 6, cv2.INPAINT_TELEA)


def remove_dark_figures(img, max_area=6000, thresh=70):
    """Inpaint small dark blobs that don't touch the border (a tiny silhouette)."""
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    m = (g < thresh).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    mask = np.zeros_like(m)
    h, w = m.shape
    for i in range(1, n):
        x, y, bw, bh, a = st[i]
        if a < max_area and x > 2 and y > 2 and x + bw < w - 2 and y + bh < h - 2 and bh > bw:
            mask[lab == i] = 255
    mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
    return cv2.inpaint(img, mask, 9, cv2.INPAINT_TELEA)


def main():
    video = sys.argv[1]
    os.makedirs(ROOT, exist_ok=True)

    # door: rounded square at t=3.3 spans (199,199)-(1241,1241); crop inside the corners
    d = frame(video, 3.3)[229:1211, 229:1211]
    m = np.zeros(d.shape[:2], np.uint8)
    cv2.rectangle(m, (386, 670), (452, 806), 255, -1)               # walking silhouette
    cv2.rectangle(m, (896, 860), (980, 970), 255, -1)               # cursor sparkle
    d = cv2.inpaint(d, m, 11, cv2.INPAINT_TELEA)
    save("door.jpg", up(d, (1440, 1440)))

    # arch, daylight, full frame at t=6.0 (cursor removed); golden hour graded from it
    a = remove_cursor(frame(video, 6.0), (900, 600, 1200, 900))
    save("arch-day.jpg", a)
    save("arch-golden.jpg", golden_grade(a))

    # crescent landscape at t=11.25: crop above the figure, remove the antenna tip
    c = frame(video, 11.25)
    c = remove_thin_vertical(c, 465, 505, 560, 712)
    save("crescent.jpg", up(c[0:700, 370:1070], (1440, 1440)))
    p = c[0:706, 410:890]
    save("print.jpg", up(p, (680, 1000)))

    # wall: t=23.0, frame picture window (528,408)-(910,970); paste our print in
    w = frame(video, 23.0)
    pw, ph = 910 - 528, 970 - 408
    w[408:970, 528:910] = cv2.resize(p, (pw, ph), interpolation=cv2.INTER_AREA)
    save("wall.jpg", w)

    # grid tiles at t=4.75: 300 px tiles at x/y ∈ {256, 570, 884}; people-tiles replaced
    gsrc = frame(video, 4.75)
    tiles = {}
    for r, y in enumerate((256, 570, 884)):
        for col, x in enumerate((256, 570, 884)):
            tiles[r * 3 + col] = gsrc[y + 12:y + 288, x + 12:x + 288]
    # tile 8 (green crater) has a figure in it: use the wall's leaf shadow instead
    tiles[8] = w[960:1400, 1000:1440]
    small = lambda name: cv2.resize(cv2.imread(os.path.join(ROOT, name)), (600, 600), interpolation=cv2.INTER_AREA)
    order = [up(tiles[0], (600, 600)), up(tiles[1], (600, 600)), small("crescent.jpg"),
             small("arch-golden.jpg"), small("door.jpg"), small("arch-day.jpg"),
             up(tiles[6], (600, 600)), up(tiles[7], (600, 600)), cv2.resize(tiles[8], (600, 600))]
    for i, t in enumerate(order):
        save(f"grid-{i + 1}.jpg", t)


if __name__ == "__main__":
    main()

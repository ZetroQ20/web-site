"""Rounds the jawline: fills out the straight chin-to-jaw diagonal into a soft curve
and lifts the chin tip, so the lower face loses its V/pointed look.
Usage: python3 soften-jaw.py portrait-original.jpg portrait.jpg"""
import sys, numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = a.shape
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
sx, sy = xx.copy(), yy.copy()

# (x, y, radius, dx, dy): content near (x, y) is moved by (dx, dy) with a smooth falloff.
moves = [
    (628, 690, 70, 9, 8),     # fill out the middle of the jaw diagonal (convex curve)
    (595, 725, 60, 7, 7),
    (655, 650, 55, 5, 4),
    (520, 768, 60, 0, -9),    # lift and broaden the chin tip
    (555, 752, 50, 3, -4),
]
for px, py, r, dx, dy in moves:
    w = np.exp(-((xx - px) ** 2 + (yy - py) ** 2) / (2 * (r / 1.5) ** 2))
    sx -= dx * w
    sy -= dy * w

def sample(img, x, y):
    x = np.clip(x, 0, W - 1.001); y = np.clip(y, 0, H - 1.001)
    x0 = x.astype(int); y0 = y.astype(int)
    fx = (x - x0)[..., None]; fy = (y - y0)[..., None]
    return (img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x0 + 1] * fx * (1 - fy)
            + img[y0 + 1, x0] * (1 - fx) * fy + img[y0 + 1, x0 + 1] * fx * fy)

Image.fromarray(np.clip(sample(a, sx, sy), 0, 255).astype(np.uint8)).save(dst, quality=95)

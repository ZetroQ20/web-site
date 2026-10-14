import sys, numpy as np
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = a.shape
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
sx, sy = xx.copy(), yy.copy()
center = np.array([520., 600.])
# (x, y, radius, strength px): points along the jaw angle / chin to pull inward
pts = [(615, 722, 60, 11), (650, 690, 55, 8), (575, 752, 55, 7), (520, 772, 50, 4), (680, 640, 50, 4)]
for px, py, r, s in pts:
    d = np.array([px, py]) - center; d /= np.linalg.norm(d)
    w = np.exp(-((xx - px)**2 + (yy - py)**2) / (2 * (r/1.6)**2))
    sx += d[0] * s * w; sy += d[1] * s * w
def sample(img, x, y):
    x0 = np.clip(np.floor(x).astype(int), 0, W-2); y0 = np.clip(np.floor(y).astype(int), 0, H-2)
    fx = (x - x0)[..., None]; fy = (y - y0)[..., None]
    return (img[y0, x0]*(1-fx)*(1-fy) + img[y0, x0+1]*fx*(1-fy) + img[y0+1, x0]*(1-fx)*fy + img[y0+1, x0+1]*fx*fy)
out = sample(a, sx, sy)
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(dst, quality=95)

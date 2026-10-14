"""Crops the softened portrait for the poster and cuts a hair layer from the top of
the head, so the title letters can sit behind her hair.
Usage: python3 make-layers.py portrait.jpg  ->  portrait-crop.jpg, portrait-hair.png"""
import sys, numpy as np
from PIL import Image, ImageFilter

CROP = (250, 37, 950, 1254)  # opening + a sliver of both curtains
im = Image.open(sys.argv[1]).convert('RGB').crop(CROP)
im.save('portrait-crop.jpg', quality=95)

a = np.asarray(im).astype(np.float32)
lum = a @ np.array([0.299, 0.587, 0.114])
h, w = lum.shape
yy, xx = np.mgrid[0:h, 0:w]
hair = (lum < 70) & (yy < 300) & (xx > 230) & (xx < 620)  # top of head, behind "R" and "A" only
alpha = Image.fromarray((hair * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.5))
rgba = im.copy(); rgba.putalpha(alpha)
rgba.save('portrait-hair.png')

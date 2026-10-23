#!/usr/bin/env python3
"""Turn `FIG:` placeholder lines in the notes into cropped slide images.

Placeholder syntax (one line, blank line before and after):
    FIG:p34,p35|3.3|**English caption (slide 53).**|Türkçe açıklama (slayt 53).
  pNN       PDF page(s) whose content images go on this row, left→right, top→bottom
  pNN@x0,y0,x1,y1   a region of page NN in PDF points (960×540 for 16:9 slides) — use it for
            vector charts/diagrams, which are not embedded images
  3.3       max image height in cm (shrunk automatically so the row fits 16.5 cm)

Usage:
    figures.py crop   <slides.pdf> <notes.md>          # crop images into img/ next to notes, write img/_sheet.png
    figures.py expand <notes.md> [--skip p32_2,p46_1]   # replace FIG lines with Markdown image rows
Look at img/_sheet.png after `crop` and pass the decorative crops (arrows, title bars) to --skip.
"""
import glob
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image

BOX = r"\d+(?:\.\d+)?(?:,\d+(?:\.\d+)?){3}"
FIG = re.compile(r"^FIG:([^|]+)\|([\d.]+)\|(.+?)\|(.+)$", re.M)
SCALE = 200 / 72


def crop(pdf, notes):
    import pdfplumber

    out = notes.parent / "img"
    out.mkdir(exist_ok=True)
    specs = [spec[0] for spec in FIG.findall(notes.read_text())]
    regions = {(int(pg), box) for spec in specs for pg, box in re.findall(r"p(\d+)@(" + BOX + ")", spec)}
    pages = sorted({int(p) for spec in specs for p in re.findall(r"p(\d+)(?!\d|@)", spec)})
    with pdfplumber.open(pdf) as doc:
        for pg in pages:
            page = doc.pages[pg - 1]
            # skip logos/header strips (top 7 %), title bars and arrows (< 80 pt on a side)
            ims = [im for im in page.images
                   if im["bottom"] - im["top"] >= 80 and im["x1"] - im["x0"] >= 80 and im["top"] > page.height * 0.07]
            ims.sort(key=lambda im: (round(im["top"] / 80), im["x0"]))
            base = out / f"_page{pg:02d}"
            subprocess.run(["pdftoppm", "-r", "200", "-png", "-singlefile", "-f", str(pg), "-l", str(pg), str(pdf), str(base)],
                           check=True)
            render = Image.open(f"{base}.png")
            for j, im in enumerate(ims, 1):
                box = (max(0, int(im["x0"] * SCALE)), max(0, int(im["top"] * SCALE)),
                       min(render.width, int(im["x1"] * SCALE)), min(render.height, int(im["bottom"] * SCALE)))
                c = render.crop(box).convert("RGB")
                c.thumbnail((1100, 1100))
                c.save(out / f"p{pg:02d}_{j}.jpg", quality=88)
            Path(f"{base}.png").unlink()
    for pg, box in regions:
        base = out / f"_page{pg:02d}"
        subprocess.run(["pdftoppm", "-r", "200", "-png", "-singlefile", "-f", str(pg), "-l", str(pg), str(pdf), str(base)],
                       check=True)
        x0, y0, x1, y1 = (float(v) * SCALE for v in box.split(","))
        c = Image.open(f"{base}.png").crop((int(x0), int(y0), int(x1), int(y1))).convert("RGB")
        c.thumbnail((1400, 1400))
        c.save(out / f"r{pg:02d}_{box.replace(',', '-')}.jpg", quality=90)
        Path(f"{base}.png").unlink()
    files = sorted(glob.glob(str(out / "[pr]*.jpg")))
    subprocess.run(["montage", "-label", "%t", *files, "-tile", "9x", "-geometry", "150x120+3+3", "-pointsize", "10",
                    str(out / "_sheet.png")], check=True)
    print(f"{len(files)} crops -> {out}/_sheet.png")


def expand(notes, skip):
    text = notes.read_text()

    def row(m):
        files = []
        for pg, box in re.findall(r"p(\d+)(?:@(" + BOX + "))?", m.group(1)):
            if box:
                files.append(str(notes.parent / f"img/r{int(pg):02d}_{box.replace(',', '-')}.jpg"))
            else:
                files += sorted(f for f in glob.glob(str(notes.parent / f"img/p{int(pg):02d}_*.jpg"))
                                if Path(f).stem not in skip)
        if not files:
            sys.exit(f"no images for {m.group(0)}")
        ratios = [Image.open(f).width / Image.open(f).height for f in files]
        h = min(float(m.group(2)), 16.5 / sum(ratios))
        imgs = " ".join(f"![](img/{Path(f).name}){{height={h:.2f}cm}}" for f in files)
        return f"\n{imgs}\n\n*{m.group(3)}* {m.group(4)}\n"

    text = re.sub(r"\n{3,}", "\n\n", FIG.sub(row, text))
    notes.write_text(text)
    print(f"{text.count('![](')} images placed")


if __name__ == "__main__":
    if len(sys.argv) >= 4 and sys.argv[1] == "crop":
        crop(Path(sys.argv[2]), Path(sys.argv[3]))
    elif len(sys.argv) >= 3 and sys.argv[1] == "expand":
        skip = set(sys.argv[sys.argv.index("--skip") + 1].split(",")) if "--skip" in sys.argv else set()
        expand(Path(sys.argv[2]), skip)
    else:
        sys.exit(__doc__)

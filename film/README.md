# abdullah üçdağ — launch film

A 27-second, 1440×1440 film at 120 BPM (54 beats) that plays as one continuous take and loops seamlessly. It is a single HTML file: every style is computed from time inside `seek(t)`. Playwright renders it.

```bash
python3 tools/placeholders.py          # flat stand-ins (never overwrites real files)
node render.cjs --stills               # one frame per beat + contact sheet → out/beats/
node render.cjs                        # full film → out/film.mp4 (60 fps, 4 subframes, tmix)
python3 -I tools/qa.py out/film.mp4    # pop scan + loop-seam check + beat frames → out/qa/
```

Other options: `--at 8,11.25` (stills at given times), `--from 7 --to 9` (one section), `--sub 1 --fps 30` (quick preview). To scrub the film in a browser, open `index.html?play` from any static server.

## Assets (`film/assets/`, not committed)

| File | Used for |
|---|---|
| `door.jpg` (1:1) | Opens inside the iris, then becomes the centre tile of the grid |
| `grid-1.jpg` … `grid-9.jpg` (1:1) | The 3×3 grid. **grid-5 = door, grid-6 = the arch tile that zooms to full frame.** |
| `arch-day.jpg`, `arch-golden.jpg` (1:1) | Full-frame arch; the "Golden hour" slider maps one over the other. **Same camera, pixel-aligned.** |
| `crescent.jpg` (1:1) | Opens inside the glass orb → lock-screen wallpaper → phone → the card dragged into the browser |
| `print.jpg` (about 2:3) | The art print on the product page and in the frame on the wall |
| `wall.jpg` (1:1) | Wall with a black frame. The frame geometry is `WALL` in `index.html` (frame, mat and picture window in px). |
| `audio.mp3` | 120 BPM track: drop at **8.0 s**, breakdown **22.0–26.0 s**, beat return **26.0 s** |
| `sfx/<name>.wav` | One Mixkit SFX per event (names are in the `#cues` list in `index.html`), placed by measured peak |

`tools/from_reference.py <reference.mp4>` builds **working** versions of these from the reference film, with people removed by cropping and inpainting. Its golden-hour arch is graded from the daylight frame, so the pair is pixel-aligned. **These images belong to someone else's film: use them only for layout and timing, and replace them with your own before publishing.**

## Beat map (t = (beat − 1) × 0.5 s)

| Beats | Section | Moments |
|---|---|---|
| 1–8 | Open | squeeze into the period (2) · dot (3) · pill (4) · `>` (5) · `develop` typed (6) · click: pill → circle, iris shuts (7) · iris opens on the door, which grows (8) |
| 9–16 | Grid | door → centre tile, tiles pop out (9–10) · hover (11–12) · reflow, arch takes 2×2 (13) · "relight" chip (14) · click → arch zooms (15–16) |
| 17–24 | Relight | **drop: arch fills the frame (17)** · glass toolbar (18) · adjust → "Golden hour" slider (19) · knob → lens, drag (20–21) · lens lifts into an orb (22) · crescent opens inside it (23) · orb floods (24) |
| 25–27 | Lock screen | date + 9:41 in liquid glass (25) · music widget (26) · play → pause (27) |
| 28–35 | Desktop | pull back into a phone on a wave desktop (28) · island stretches (29) · pinches off and grows into a window (30) · blind opens on the start page (31) · long-press + drag the wallpaper (32) · drop (33) · "from screen to wall." site (34) · click → push (35) |
| 36–44 | Product | the print (36) · black frame (37) · 70×100 (38) · Order print (39–40) · Ordered (41) · Printing % (42) · On the way (43) · ✓ circle (44) |
| 45–54 | Wall | flood (45) · black contracts into the frame on the wall (46) · iris opens on the print (47) · push in (48–50) · iris shuts (51) · black → pill → dot (52) · letters spring back on the beat return (53) · settles = frame 1 (54) |

## How it's built

- **Springs** are closed-form damped step responses. Any value with several targets is `v0 + Σ Δᵢ·respᵢ(t − tᵢ)` (`Track`), so it stays a pure function of time. CustomEase paths are evaluated as cubic-Bézier math (`customEase`).
- **Camera:** screen-studio zooms are tracks too. When the frame is fully black, the camera re-anchors (a "rebase") and the cursor is re-anchored with it so it never jumps on screen.
- **Liquid glass:** each glass element (toolbar, lens/orb, 9:41 numerals, music widget) holds a clone of the scene behind it. The clone is filtered through an `feImage` rounded-rect distance field (a base64 PNG, computed at ≤ 512 px) and three `feDisplacementMap`s at ×1, ×1.06 and ×1.12 for the R/G/B channels, then gets a rim light. The numerals are glass masked by the text.
- **Goo:** blur + alpha threshold, with the source composited atop it (Dynamic Island pinch).
- **Iris:** six blades. Each is two hexagon vertices, both edge extensions out to the housing circle, and the short arc between them. It is used three times: inside the pill circle, inside the wall frame, and full frame.
- **Wordmark squeeze:** every letter moves toward the period by the same factor `k`. Its drawn width follows: the `wdth` axis narrows (125→62) and `scaleX` covers the rest, so the letters stay touching.
- **Floods** overscale past the corners and take 0.3 s. Labels that swap inside a morphing shape slide within its mask.

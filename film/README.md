# abdullah üçdağ — launch film

A 27-second, 1440×1440 film at 120 BPM (54 beats) that plays as one continuous take and loops seamlessly. It is a single HTML file: every style is computed from time inside `seek(t)`. Playwright renders it.

```bash
python3 tools/placeholders.py          # stand-in assets (never overwrites yours)
node render.cjs --stills               # one frame per beat + contact sheet → out/beats/
node render.cjs                        # full film → out/film.mp4 (60 fps, 4 subframes, tmix)
python3 -I tools/qa.py out/film.mp4    # pop scan + loop-seam check + beat frames → out/qa/
```

Other options: `--at 8,11.25` (stills at given times), `--from 7 --to 9` (one section), `--sub 1 --fps 30` (quick preview). To scrub the film in a browser, open `index.html?play` from any static server.

## Assets (`film/assets/`)

Replace each placeholder with a real file of the same name:

| File | Used for |
|---|---|
| `villa-day.jpg`, `villa-night.jpg` | Hero tile → full-frame villa tour; the slider relights day → golden hour. **Both must be the same camera and resolution, pixel-aligned.** Square works best. |
| `beauty-mobile.jpg` | Hero image of the atelier mobile UI (portrait, about 1170×2532) |
| `ui-1.jpg` … `ui-6.jpg` | Bento tiles (1–3) and the live site on the monitor (4–6) |
| `dashboard.jpg` | Live-site bento tile |
| `monitor.mp4` | Pexels workspace clip. `render.cjs` re-encodes it all-intra to `monitor.intra.webm` (VP9 `-g 1`, because Playwright's Chromium has no H.264). |
| `audio.mp3` | The 120 BPM track. Edit it so beat 1 is a downbeat, the drop lands at **8.0 s**, the breakdown runs **22.0–26.0 s** and the beat returns at **26.0 s**. If the first downbeat isn't at 0, pass `--music-offset`. |
| `sfx/<name>.wav` | One downloaded Mixkit SFX per event. The names are in the `#cues` list in `index.html`. Each file is placed by its measured peak, and missing ones are skipped. |

**After swapping in the real footage**, update `SCREEN_SRC` in `index.html`. It holds the monitor's four screen corners in source-video pixels (TL, TR, BR, BL). `FOOT` sets zoom and pan if the square crop needs framing. The live site is mapped onto that quad with a homography, so a slightly angled screen works. The camera must be locked off.

## Beat map (t = (beat − 1) × 0.5 s)

| Beats | Section | Moments |
|---|---|---|
| 1–16 | Open | squeeze into the period (2) · dot (3) · pill (4) · `>` (5) · typing (6) · iris shut (7) · open on the skeleton (8) · chips become nav/hero/bento (9–11) · icons pop (12) · images (13) · hover (14) · click + zoom (15–16) |
| 17–30 | Scroll & Glass | drop lands in the villa (17) · Lenis scroll (18) · rooms (19) · glass toolbar (20) · icon → slider (21) · knob → lens (22) · relight in three drags (23–25) · lens lifts into the orb (26) · atelier opens in a circle (27) · orb → phone (28) · glass header + fluid type (29) · sticky CTA (30) |
| 31–40 | Stage | pull back to the desktop (31) · island stretches (32) · pinches off and flies (33) · grows into the dashboard (34) · blind (35) · long-press the hash (36) · drag + page push (37) · drop → hub (38) · scroll → Lighthouse (39) · rings (40) |
| 41–44 | Deploy | Pushing code ✓ · Building ▲ · Generating static pages · Live ✓ |
| 45–54 | Wall | flood (45) · black (46) · contract onto the monitor (47) · scroll (48) · click (49) · iris onto the screen (50) · iris shut (51) · black contracts into pill → dot (52) · letters spring back on the beat return (53) · settles = frame 1 (54) |

## How it's built

- **Springs** are closed-form damped step responses. Any value with several targets is `v0 + Σ Δᵢ·respᵢ(t − tᵢ)` (`Track`), so it stays a pure function of time. CustomEase paths are evaluated as cubic-Bézier math (`customEase`).
- **Camera:** screen-studio zooms are tracks too. When the frame is fully black, the camera re-anchors (a "rebase") and the cursor is re-anchored with it so it never jumps on screen.
- **Liquid glass:** each glass element holds a clone of the scene behind it. The clone is filtered through an `feImage` rounded-rect distance field (a base64 PNG) and three `feDisplacementMap`s at ×1, ×1.06 and ×1.12 for the R/G/B channels, then gets a rim light. `backdrop-filter: url()` is avoided on purpose.
- **Goo:** blur + alpha threshold, with the source composited atop it (Dynamic Island pinch).
- **Iris:** six blades. Each is two hexagon vertices, both edge extensions out to the housing circle, and the short arc between them.
- **Wordmark squeeze:** every letter moves toward the period by the same factor `k`. Its drawn width follows: the `wdth` axis narrows (125→62) and `scaleX` covers the rest, so the letters stay touching.
- **Floods** overscale past the corners and take 0.3 s. Text that swaps inside a morphing shape slides within its own mask.
- **Text snapping:** scroll offsets are rounded to whole device pixels at the current on-screen scale, so slow Lenis glides don't shimmer.

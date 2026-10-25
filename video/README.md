# PHOSPHENE — motion reel

A 10-second, 1920×1080, 60 fps shader reel rendered with
[Remotion](https://www.remotion.dev) and Three.js. It recreates the
"PHOSPHENE · MOTION REEL" reference shot for shot, as a clean digital render:
an eye opens out of a horizontal line, and the camera dives through it into a
run of psychedelic chapters. It is silent, like the reference.

| Time | Shot | HUD | What happens |
| --- | --- | --- | --- |
| 0.00 s | SIGNAL | — | Two dim dashes on a near-black maroon screen |
| 1.45 s | IRIS | 01 IRIS | The dashes ignite into a line; fine contours spring out and the lid snaps open on a feathered peach/teal/lavender iris that glances around; the pupil dilates to show chains of tiny eyes |
| 4.55 s | PUPIL | 01 IRIS | The camera dives in: the iris bands cycle colour and the chains swell into magenta pods |
| 5.25 s | ECHO | 02 FUNNEL | A funnel of eyes around a glowing ring and a misty sphere |
| 7.40 s | VORTEX | 02 FUNNEL | The funnel becomes a checkerboard that keeps tearing into rays |
| 9.15 s | RETURN | 01 IRIS | A white-out, and the eye from the start opens again and glances around |

The HUD counts to "/ 07" because the reel it comes from has seven chapters;
this cut loops back to the first. The eye and the funnel are matched by
measurement against clean stills of the reference.

## Commands

```bash
npm install
npm run dev          # Remotion Studio preview
npm run render       # out/phosphene.mp4, using the GPU (--gl=angle)
npm run render:cpu   # same render on machines without a GPU (--gl=swangle)
npm run shader       # rebuild the shader after editing phosphene.glsl
```

On a cloud box without a GPU and without Remotion's own Chrome download, point
the render at an installed Chromium, for example
`npm run render:cpu -- --browser-executable=/path/to/chrome-headless-shell`.

## How it is built

- **`src/shaders/phosphene.glsl`**: every picture in the reel. It is one
  Shadertoy-style fragment shader (`mainImage`, `iTime`, `iResolution`,
  `iFrame`) that writes linear HDR colour. It calls functions from the
  `shader-art-coding` skill's GLSL library (`sdVesica`, `fbm`, `oklchToLinearSrgb`,
  `smin`, …) by name.
- **`scripts/build-shader.mjs`**: prepends the chapter start times from
  `src/timeline.json`, bundles the library functions the shader uses, and
  compile-checks the result with `glslangValidator`. It writes the generated
  `src/shaders/phosphene.frag.ts`. Run it after every shader edit.
- **`src/ShaderPlane.tsx`**: draws the shader on a full-screen quad inside
  `<ThreeCanvas>`. Its uniforms come from `useCurrentFrame()`, so every frame
  is deterministic.
- **`src/PostFx.tsx`**: the post chain: a soft bloom, a radial zoom blur
  (`src/ZoomBlurEffect.ts`, keyed in `timeline.json`) for the dive and the
  funnel, chromatic aberration that spikes at every cut, and a light
  vignette. There is no tonemap pass:
  the colours are display sRGB values sampled from the reference. A faint film grain
  lives in the shader too, because postprocessing's Noise effect runs on
  wall-clock time.
- **`src/Hud.tsx`**: the HTML overlay: title, chapter counter with a scramble
  on each cut, tagline, running timecode, next-chapter label and progress bar.
  It boots with a CRT flicker once the eye has opened.
- **`src/timeline.json`**: the single source of chapter timing for both the
  shader and the HUD. Edit it, then run `npm run shader`.

## Tuning

The art controls are constants at the top of `phosphene.glsl`:
`EYE_HALF_WIDTH` / `EYE_HALF_HEIGHT` (eye shape), `IRIS_RADIUS`,
`PUPIL_RATIO`, `CONTOURS` (number of neon lines), `EXPOSURE`, `GRAIN` and
`FLASH`. To check the chapter boundaries, set `#define DEBUG_MODE 1`, which
paints each chapter a flat colour. Bloom strength and threshold are set in
`PostFx.tsx`.

The JetBrains Mono font is bundled in `public/fonts` under the SIL Open Font
License (see `public/fonts/JetBrainsMono-OFL.txt`).

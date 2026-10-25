@AGENTS.md

## Project skills — use them without being asked

This repo ships skills in `.claude/skills/`. Load the matching skill yourself
before starting the work; the user should not have to name it.

- **ui-ux-pro-max** — any task that changes how the site looks, feels, moves
  or is interacted with: new sections or pages, component work, layout,
  responsive fixes, colour, typography, accessibility, UI reviews. Run its
  search script from the repo root, e.g.
  `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack nextjs`.
- **motion-framer** — animation and interaction work: hover/tap effects,
  page or section transitions, scroll-driven effects, drag, layout animations.
  The site currently animates with GSAP (`@gsap/react`) and Lenis; `motion`
  is not installed. Apply the skill's patterns and timing/accessibility
  guidance, and add the `motion` package (import from `motion/react`) only
  when a change genuinely needs it.

- **shader-art-coding** — any GLSL fragment shader work: SDF raymarching,
  kaleidoscope/polar repetition, noise, procedural or generative visuals. Use
  its tested library instead of re-deriving functions; from its directory run
  `python3 scripts/glsl_tools.py search <words>`, then `bundle` and `check`
  (`glslangValidator` compiles the result when installed).
- **threejs-*** (`threejs-fundamentals`, `threejs-shaders`,
  `threejs-postprocessing`, `threejs-react-three-fiber`, `threejs-animation`,
  `threejs-performance`) — any Three.js / React Three Fiber scene, custom
  `ShaderMaterial`, or bloom / chromatic aberration / grain passes. When the
  scene renders inside Remotion (`@remotion/three`), drive every animation from
  `useCurrentFrame()`, never R3F's `useFrame`.

When a task touches both design and animation, use both skills. Shader-based
video or WebGL scenes combine `shader-art-coding`, the `threejs-*` skills and
`motion-framer` (plus the Remotion plugin skills when rendering to video).

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

- **bilingual-lecture-notes** — the user sends lecture slides (PDF/PPTX/images)
  and wants compact notes: each English sentence bold, followed by its
  Turkish translation in normal weight, tables kept as tables, delivered as
  .docx (and PDF on request). Not part of the website; don't commit the notes.

When a task touches both design and animation, use both skills.

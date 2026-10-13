"use client";

import { gsap } from "@/lib/gsap";
import type { ServiceEffect } from "@/lib/content";

/**
 * Bespoke scenes for the VIP service cards. Each builder sets the scene's
 * initial state and returns a paused timeline whose duration is measured in
 * "screens" of scroll — the deck nests it into its scrubbed master timeline,
 * so every scene moves exactly with the visitor's scroll (and reverses).
 * Builders must run inside a gsap.context / useGSAP scope.
 */

export type BuiltScene = { tl: gsap.core.Timeline; cleanup?: () => void };
type Scene = (card: HTMLElement) => BuiltScene;

const $ = <T extends Element = HTMLElement>(root: Element, sel: string) => root.querySelector<T>(sel)!;

/* ---------------------------------------------------------------- 01 · WAVE */
// Silk-like reveal: a sine-shaped edge flows down the frame while an SVG
// displacement filter ripples the photo and settles to perfectly still.
const wave: Scene = (card) => {
  const media = $(card, ".fx-wave-media");
  const img = $(card, ".fx-wave-img");
  const displace = $<SVGFEDisplacementMapElement>(card, "feDisplacementMap");
  const turbulence = $<SVGFETurbulenceElement>(card, "feTurbulence");
  const POINTS = 24;

  const state = { p: 0 };
  const draw = () => {
    const amp = 9 * (1 - state.p) + 1.5; // waves calm down as the reveal completes
    const edge = -12 + state.p * 126; // % from top
    const phase = state.p * Math.PI * 3;
    const pts = ["0% 0%", "100% 0%"];
    for (let i = POINTS; i >= 0; i--) {
      const x = (i / POINTS) * 100;
      const y = edge + Math.sin((x / 100) * Math.PI * 2.4 + phase) * amp;
      pts.push(`${x}% ${Math.max(0, y)}%`);
    }
    media.style.clipPath = `polygon(${pts.join(",")})`;
  };
  draw();
  gsap.set(img, { scale: 1.18, skewY: 4, yPercent: -6, filter: "url(#fx-liquid) saturate(0.6)" });
  gsap.set(displace, { attr: { scale: 120 } });
  gsap.set(turbulence, { attr: { baseFrequency: "0.004 0.03" } });

  const tl = gsap
    .timeline({ paused: true })
    .to(state, { p: 1, duration: 1, ease: "power2.inOut", onUpdate: draw }, 0)
    .to(displace, { attr: { scale: 0 }, duration: 1.1, ease: "power2.out" }, 0)
    .to(turbulence, { attr: { baseFrequency: "0.012 0.06" }, duration: 1.1, ease: "sine.inOut" }, 0)
    .to(img, { scale: 1, skewY: 0, yPercent: 0, filter: "url(#fx-liquid) saturate(1)", duration: 1.1, ease: "power3.out" }, 0)
    // Still water: drop the costly filter (restored automatically when scrubbing back).
    .set(img, { filter: "none" }, 1.1);
  return { tl };
};

/* --------------------------------------------------------------- 02 · LASER */
// The photo sits under frosted glass. A glowing gold laser descends with the
// scroll and everything it has passed becomes crisp.
const laser: Scene = (card) => {
  const frost = $(card, ".fx-laser-frost");
  const line = $(card, ".fx-laser-line");
  const readout = $(card, ".fx-laser-readout");
  const state = { y: 0 };
  const render = () => {
    frost.style.clipPath = `inset(${state.y}% 0% 0% 0%)`;
    line.style.top = `${state.y}%`;
    readout.textContent = `${String(Math.round(state.y)).padStart(3, "0")}%`;
  };
  render();
  gsap.set(line, { autoAlpha: 0 });

  const tl = gsap
    .timeline({ paused: true })
    .to(line, { autoAlpha: 1, duration: 0.08, ease: "none" }, 0)
    .to(state, { y: 100, duration: 1.2, ease: "sine.inOut", onUpdate: render }, 0)
    .to(line, { autoAlpha: 0, duration: 0.1, ease: "none" }, 1.12);
  return { tl };
};

/* -------------------------------------------------------------- 03 · GOLDEN */
// Golden-ratio and symmetry guides are drawn with surgical precision, then
// fade back while the portrait's colour comes alive.
const golden: Scene = (card) => {
  const strokes = card.querySelectorAll(".fx-golden-stroke");
  const labels = card.querySelectorAll(".fx-golden-label");
  const guides = $(card, ".fx-golden-guides");
  const img = $(card, ".fx-golden-img");

  gsap.set(strokes, { strokeDashoffset: 1 });
  gsap.set(labels, { autoAlpha: 0, y: 6 });
  gsap.set(img, { filter: "grayscale(1) brightness(0.62) contrast(1.05) saturate(1)" });

  const tl = gsap
    .timeline({ paused: true })
    .to(strokes, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut", stagger: 0.08 }, 0)
    .to(labels, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.05 }, 0.45)
    .to(img, { filter: "grayscale(0) brightness(1) contrast(1.05) saturate(1.15)", duration: 0.6, ease: "power2.inOut" }, 0.8)
    .to(guides, { autoAlpha: 0.12, duration: 0.6, ease: "power2.inOut" }, 0.85);
  return { tl };
};

/* --------------------------------------------------------------- 04 · GLOSS */
// Once the frame has settled, a sharp specular highlight races diagonally
// from top-left to bottom-right — wet, glossy, freshly lacquered.
const gloss: Scene = (card) => {
  const wide = $(card, ".fx-gloss-wide");
  const sharp = $(card, ".fx-gloss-sharp");
  const spark = $(card, ".fx-gloss-spark");
  const img = $(card, ".fx-gloss-img");

  const sweep = (tl: gsap.core.Timeline) =>
    tl
      .fromTo(wide, { backgroundPosition: "100% 100%", autoAlpha: 1 }, { backgroundPosition: "0% 0%", duration: 1, ease: "power2.inOut", immediateRender: false }, 0)
      .fromTo(sharp, { backgroundPosition: "100% 100%", autoAlpha: 1 }, { backgroundPosition: "0% 0%", duration: 0.75, ease: "power2.inOut", immediateRender: false }, 0.1)
      .fromTo(spark, { scale: 0, rotate: -45, autoAlpha: 0 }, { scale: 1, rotate: 45, autoAlpha: 1, duration: 0.25, ease: "back.out(3)", immediateRender: false }, 0.65)
      .to(spark, { scale: 0, autoAlpha: 0, duration: 0.25, ease: "power2.in" }, 0.95)
      // the bands rest at a frame corner — hide them so no glow lingers there
      .set([wide, sharp], { autoAlpha: 0 }, 1.2);

  gsap.set(img, { filter: "contrast(1) saturate(1) brightness(0.92)" });
  const tl = sweep(gsap.timeline({ paused: true })).to(
    img,
    { filter: "contrast(1.12) saturate(1.18) brightness(1.04)", duration: 0.6, ease: "power2.out" },
    0.3
  );

  // The highlight also catches the light again on hover (real-time, not scrubbed).
  const frame = $(card, ".fx-gloss-frame");
  let hover: gsap.core.Timeline | null = null;
  const replay = () => {
    if (tl.progress() < 1) return; // let the scroll-driven sweep finish first
    hover?.kill();
    hover = sweep(gsap.timeline()).timeScale(0.9);
  };
  frame.addEventListener("pointerenter", replay);
  return {
    tl,
    cleanup: () => {
      frame.removeEventListener("pointerenter", replay);
      hover?.kill();
    },
  };
};

export const SCENES: Record<ServiceEffect, Scene> = { wave, laser, golden, gloss };

/** Final, motionless state used when the visitor prefers reduced motion. */
export function settle(card: HTMLElement) {
  card.querySelectorAll<HTMLElement>(".fx-wave-media").forEach((el) => (el.style.clipPath = "none"));
  card.querySelectorAll<HTMLElement>(".fx-laser-frost").forEach((el) => (el.style.clipPath = "inset(100% 0 0 0)"));
  card.querySelectorAll<HTMLElement>(".fx-laser-line, .fx-golden-guides").forEach((el) => (el.style.opacity = "0"));
}

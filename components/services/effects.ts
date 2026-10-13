"use client";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { ServiceEffect } from "@/lib/content";

/**
 * Bespoke entrance scenes for the VIP service cards. Every function receives the
 * card element, builds its own ScrollTriggers and must be called inside a
 * gsap.context / useGSAP scope so everything is reverted on unmount.
 */

/** Builds a scene; may return a cleanup for listeners GSAP can't revert. */
type Scene = (card: HTMLElement) => void | (() => void);

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

  const state = { p: 0, phase: 0 };
  const draw = () => {
    const amp = 9 * (1 - state.p) + 1.5; // waves calm down as the reveal completes
    const edge = -12 + state.p * 126; // % from top
    const pts = ["0% 0%", "100% 0%"];
    for (let i = POINTS; i >= 0; i--) {
      const x = (i / POINTS) * 100;
      const y = edge + Math.sin((x / 100) * Math.PI * 2.4 + state.phase) * amp;
      pts.push(`${x}% ${Math.max(0, y)}%`);
    }
    media.style.clipPath = `polygon(${pts.join(",")})`;
  };
  draw();
  gsap.set(img, { scale: 1.18, skewY: 4, yPercent: -6, filter: "url(#fx-liquid) saturate(0.6)" });

  gsap
    .timeline({
      scrollTrigger: { trigger: card, start: "top 55%", toggleActions: "play none none reverse" },
      onComplete: () => gsap.set(img, { filter: "none" }), // drop the costly filter once still
      onReverseComplete: () => gsap.set(img, { filter: "url(#fx-liquid) saturate(0.6)" }),
    })
    .to(state, { p: 1, phase: Math.PI * 3, duration: 2.4, ease: "power2.inOut", onUpdate: draw }, 0)
    .fromTo(displace, { attr: { scale: 120 } }, { attr: { scale: 0 }, duration: 2.8, ease: "power3.out" }, 0)
    .fromTo(turbulence, { attr: { baseFrequency: "0.004 0.03" } }, { attr: { baseFrequency: "0.012 0.06" }, duration: 2.8, ease: "sine.inOut" }, 0)
    .to(img, { scale: 1, skewY: 0, yPercent: 0, filter: "url(#fx-liquid) saturate(1)", duration: 2.8, ease: "expo.out" }, 0.1);
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

  gsap
    .timeline({
      scrollTrigger: { trigger: card, start: "top 35%", end: "top -55%", scrub: 0.6 },
    })
    .fromTo(line, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06, ease: "none" }, 0)
    .to(state, { y: 100, duration: 1, ease: "none", onUpdate: render }, 0)
    .to(line, { autoAlpha: 0, duration: 0.08, ease: "none" }, 0.94);
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

  gsap
    .timeline({ scrollTrigger: { trigger: card, start: "top 45%", toggleActions: "play none none reverse" } })
    .to(strokes, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.12 }, 0)
    .to(labels, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.9)
    .to(img, { filter: "grayscale(0) brightness(1) contrast(1.05) saturate(1.15)", duration: 2, ease: "power2.inOut" }, 1.9)
    .to(guides, { autoAlpha: 0.12, duration: 1.8, ease: "power2.inOut" }, 2.1);
};

/* --------------------------------------------------------------- 04 · GLOSS */
// Once the frame has settled, a sharp specular highlight races diagonally
// from top-left to bottom-right — wet, glossy, freshly lacquered.
const gloss: Scene = (card) => {
  const wide = $(card, ".fx-gloss-wide");
  const sharp = $(card, ".fx-gloss-sharp");
  const spark = $(card, ".fx-gloss-spark");
  const img = $(card, ".fx-gloss-img");

  const sweep = () =>
    gsap
      .timeline()
      .fromTo(wide, { backgroundPosition: "100% 100%", autoAlpha: 1 }, { backgroundPosition: "0% 0%", duration: 1.6, ease: "power2.inOut" }, 0)
      .fromTo(sharp, { backgroundPosition: "100% 100%", autoAlpha: 1 }, { backgroundPosition: "0% 0%", duration: 1.2, ease: "power3.inOut" }, 0.15)
      .fromTo(img, { filter: "contrast(1) saturate(1) brightness(0.92)" }, { filter: "contrast(1.12) saturate(1.18) brightness(1.04)", duration: 1, ease: "power2.out" }, 0.4)
      .fromTo(spark, { scale: 0, rotate: -45, autoAlpha: 0 }, { scale: 1, rotate: 45, autoAlpha: 1, duration: 0.45, ease: "back.out(3)" }, 0.95)
      .to(spark, { scale: 0, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 1.45)
      // the bands rest at a frame corner — hide them so no glow lingers there
      .set([wide, sharp], { autoAlpha: 0 });

  let tl: gsap.core.Timeline | null = null;
  const play = () => {
    tl?.kill();
    tl = sweep();
  };

  ScrollTrigger.create({ trigger: card, start: "top 8%", onEnter: play, onEnterBack: play });

  // The highlight also catches the light again on hover.
  const frame = $(card, ".fx-gloss-frame");
  frame.addEventListener("pointerenter", play);
  return () => {
    frame.removeEventListener("pointerenter", play);
    tl?.kill();
  };
};

export const SCENES: Record<ServiceEffect, Scene> = { wave, laser, golden, gloss };

/** Final, motionless state used when the visitor prefers reduced motion. */
export function settle(card: HTMLElement) {
  card.querySelectorAll<HTMLElement>(".fx-wave-media").forEach((el) => (el.style.clipPath = "none"));
  card.querySelectorAll<HTMLElement>(".fx-laser-frost").forEach((el) => (el.style.clipPath = "inset(100% 0 0 0)"));
  card.querySelectorAll<HTMLElement>(".fx-laser-line, .fx-golden-guides").forEach((el) => (el.style.opacity = "0"));
}

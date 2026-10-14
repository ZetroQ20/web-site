"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import SplitText from "./SplitText";
import { SITE_CONFIG } from "@/lib/content";

type Props = { onReveal: () => void };

const windowLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === "complete") return resolve();
    window.addEventListener("load", () => resolve(), { once: true });
    setTimeout(resolve, 4500); // never hold the visitor hostage to a slow asset
  });

export default function Preloader({ onReveal }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    (_ctx, contextSafe) => {
      const q = gsap.utils.selector(root);
      const counter = q(".pl-count")[0] as HTMLElement;
      const progress = { v: 0 };
      let alive = true;
      const render = () => {
        counter.textContent = String(Math.round(progress.v)).padStart(3, "0");
        gsap.set(q(".pl-bar"), { scaleX: progress.v / 100 });
      };

      if (prefersReducedMotion()) {
        const tl = gsap.timeline({ onComplete: () => setGone(true) });
        tl.to(root.current, { autoAlpha: 0, duration: 0.6, delay: 0.4, onStart: onReveal });
        return;
      }

      gsap.set(q(".pl-char"), { yPercent: 115 });
      gsap.set(q(".pl-sub"), { yPercent: 120 });

      // Intro: letters rise from behind their gold-edged masks.
      const intro = gsap.timeline({ delay: 0.25 });
      intro
        .to(q(".pl-line"), { scaleX: 1, duration: 1.4, ease: "expo.inOut" })
        .to(q(".pl-char"), { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.06 }, "-=0.9")
        .to(q(".pl-sub"), { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.025 }, "-=0.8")
        .to(q(".pl-shine"), { autoAlpha: 1, duration: 1.2, ease: "sine.inOut" }, "-=0.4");

      // Counter fills to ~86% while assets load, then completes.
      const fill = gsap.to(progress, { v: 86, duration: 2.6, ease: "power2.inOut", onUpdate: render });

      Promise.all([windowLoaded(), document.fonts?.ready, new Promise((r) => setTimeout(r, 2700))]).then(
        contextSafe!(() => {
        if (!alive) return;
        fill.kill();
        const out = gsap.timeline({ onComplete: () => setGone(true) });
        out
          .to(progress, { v: 100, duration: 0.7, ease: "power3.inOut", onUpdate: render })
          .to(q(".pl-content"), { yPercent: -18, autoAlpha: 0, duration: 0.9, ease: "power3.in" }, "+=0.15")
          .to(q(".pl-meta"), { autoAlpha: 0, duration: 0.4 }, "<")
          .to(q(".pl-seam"), { scaleY: 1, duration: 0.6, ease: "expo.inOut" }, "-=0.4")
          .add(onReveal, "-=0.05")
          // Asymmetric door: two diagonal panels part like a curtain.
          .to(q(".pl-left"), { xPercent: -105, duration: 1.5, ease: "expo.inOut" }, "<")
          .to(q(".pl-right"), { xPercent: 105, duration: 1.5, ease: "expo.inOut" }, "<0.08")
          .to(q(".pl-seam"), { autoAlpha: 0, duration: 0.5 }, "<0.3");
        })
      );

      return () => {
        alive = false;
      };
    },
    { scope: root }
  );

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[150]" aria-busy="true" aria-label="Yükleniyor">
      {/* Door panels */}
      <div
        className="pl-left absolute inset-0 bg-noir"
        style={{ clipPath: "polygon(0 0, 61% 0, 43% 100%, 0 100%)" }}
      >
        <div className="glow left-[10%] top-[20%] h-[60vh] w-[60vh] opacity-40" />
      </div>
      <div
        className="pl-right absolute inset-0 bg-anthracite"
        style={{ clipPath: "polygon(61% 0, 100% 0, 100% 100%, 43% 100%)" }}
      >
        <div className="glow glow--soft right-[5%] bottom-[10%] h-[50vh] w-[50vh]" />
      </div>
      {/* Gold seam that glows right before the doors part */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
        <line
          className="pl-seam origin-top"
          x1="61" y1="0" x2="43" y2="100"
          stroke="#E4CFA6" strokeWidth="0.15" vectorEffect="non-scaling-stroke"
          style={{ transform: "scaleY(0)", filter: "drop-shadow(0 0 6px #C5A880)" }}
        />
      </svg>

      {/* Center lockup */}
      <div className="pl-content absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <div className="relative">
          <SplitText
            text={SITE_CONFIG.name}
            className="block font-display text-[clamp(2.8rem,10vw,8.5rem)] font-medium leading-none tracking-[0.12em] text-gold"
            innerClassName="pl-char"
          />
          {/* Shimmering copy fades in over the split letters */}
          <span
            aria-hidden
            className="pl-shine invisible absolute inset-0 block font-display text-[clamp(2.8rem,10vw,8.5rem)] font-medium leading-none tracking-[0.12em] text-gold-gradient shimmer opacity-0"
          >
            {SITE_CONFIG.name}
          </span>
        </div>
        <div className="pl-line mt-6 h-px w-[min(70vw,520px)] origin-center scale-x-0 bg-gradient-to-r from-transparent via-gold-light to-transparent shadow-[0_0_12px_rgba(197,168,128,0.8)]" />
        <SplitText
          text={SITE_CONFIG.founder}
          className="mt-6 block font-sans text-[clamp(0.7rem,1.6vw,0.95rem)] tracking-[0.7em] text-sand/80"
          innerClassName="pl-sub"
        />
      </div>

      {/* Meta: counter + progress */}
      <div className="pl-meta absolute inset-x-6 bottom-6 flex items-end justify-between md:inset-x-12 md:bottom-10">
        <p className="max-w-[12rem] text-[10px] uppercase leading-relaxed tracking-[0.35em] text-sand/50">
          Hair · Beauty
          <br />
          Denizli
        </p>
        <div className="flex flex-col items-end gap-3">
          <span className="pl-count font-display text-5xl tabular-nums text-gold md:text-7xl">000</span>
          <span className="block h-px w-40 overflow-hidden bg-bone/10">
            <span className="pl-bar block h-full w-full origin-left scale-x-0 bg-gold" />
          </span>
        </div>
      </div>
    </div>
  );
}

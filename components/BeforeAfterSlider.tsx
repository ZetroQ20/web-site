"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { BEFORE_AFTER, SERVICES, type BeforeAfterPair } from "@/lib/content";
import { usePreviewMode } from "@/lib/preview";
import Photo from "./Photo";

/* ------------------------------------------------------------ Compare slider */

type SliderProps = {
  before: string;
  after: string;
  alt: string;
  /** Preview only: a CSS filter that fakes the "before" look on a sample photo. */
  beforeFilter?: string;
};

/**
 * Drag (mouse), swipe (touch) or use arrow keys to compare two photos. The position lives
 * in a CSS variable, so dragging never re-renders React — smooth on any phone.
 */
export function CompareSlider({ before, after, alt, beforeFilter }: SliderProps) {
  const box = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const pos = useRef(50);
  const dragging = useRef(false);

  const apply = useCallback((p: number) => {
    pos.current = Math.min(100, Math.max(0, p));
    box.current?.style.setProperty("--pos", `${pos.current}%`);
    handle.current?.setAttribute("aria-valuenow", String(Math.round(pos.current)));
  }, []);

  const fromClientX = (x: number) => {
    const r = box.current!.getBoundingClientRect();
    apply(((x - r.left) / r.width) * 100);
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    box.current!.setPointerCapture(e.pointerId);
    fromClientX(e.clientX);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) fromClientX(e.clientX);
  };
  const onUp = () => (dragging.current = false);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? 10 : 4;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") apply(pos.current - step);
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") apply(pos.current + step);
    else if (e.key === "Home") apply(0);
    else if (e.key === "End") apply(100);
    else return;
    e.preventDefault();
  };

  // Reset to the middle whenever the pair changes (tab switch).
  useEffect(() => apply(50), [before, after, apply]);

  return (
    <div
      ref={box}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      data-cursor="KAYDIR"
      className="ba-box relative aspect-[4/5] w-full select-none overflow-hidden bg-graphite [--pos:50%] [touch-action:pan-y] sm:aspect-[5/4] lg:aspect-[16/10]"
    >
      {/* After (full) */}
      <Photo src={after} alt={`Sonrası — ${alt}`} sizes="(min-width: 1024px) 60vw, 100vw" className="absolute inset-0 h-full w-full object-cover object-[50%_35%]" />
      {/* Before (clipped to the left of the divider) */}
      <div className="absolute inset-0 [clip-path:inset(0_calc(100%_-_var(--pos))_0_0)]">
        <Photo
          src={before}
          alt={`Öncesi — ${alt}`}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
        />
        {beforeFilter && <div aria-hidden className="absolute inset-0" style={{ backdropFilter: beforeFilter, WebkitBackdropFilter: beforeFilter }} />}
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir/40 via-transparent to-noir/30" />

      {/* Labels */}
      <span className="pointer-events-none absolute left-3 top-3 border border-white/15 bg-noir/45 px-3 py-1.5 text-[9px] uppercase tracking-[0.3em] text-bone backdrop-blur-md md:left-5 md:top-5">
        Öncesi <span className="text-bone/50">(Before)</span>
      </span>
      <span className="pointer-events-none absolute right-3 top-3 border border-white/15 bg-noir/45 px-3 py-1.5 text-[9px] uppercase tracking-[0.3em] text-gold-light backdrop-blur-md md:right-5 md:top-5">
        Sonrası <span className="text-gold-light/60">(After)</span>
      </span>

      {/* Divider + handle */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[var(--pos)] w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,#efe8dc_15%,#c5a880_50%,#efe8dc_85%,transparent)] shadow-[0_0_12px_rgba(228,207,166,0.6)]" />
      <button
        ref={handle}
        type="button"
        role="slider"
        aria-label="Öncesi ve sonrası karşılaştırma"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={50}
        onKeyDown={onKey}
        className="absolute left-[var(--pos)] top-1/2 flex h-12 w-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1.5 rounded-full border border-gold-light/60 bg-noir/80 text-gold-light shadow-[0_8px_30px_rgba(0,0,0,0.5)] outline-none focus-visible:ring-2 focus-visible:ring-gold/60 md:bg-noir/60 md:backdrop-blur-md"
      >
        <svg viewBox="0 0 8 12" className="h-2.5 w-2" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden><path d="M6.5 1 1.5 6l5 5" /></svg>
        <span className="font-display text-[11px] tracking-[0.12em]">TG</span>
        <svg viewBox="0 0 8 12" className="h-2.5 w-2" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden><path d="M1.5 1l5 5-5 5" /></svg>
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- The section */

// Preview-only samples (?onizleme): service photos with a faked "before" look, clearly labelled.
const sample = (id: string, no: string, label: string, caption: string): BeforeAfterPair => {
  const img = SERVICES.find((s) => s.no === no)!.image;
  return { id, label, caption, before: img, after: img };
};
const PREVIEW_PAIRS = [
  sample("mikro-kaynak", "01", "Mikro Kaynak", BEFORE_AFTER[0].caption),
  sample("balayage", "01", "Balayage / Ombre", BEFORE_AFTER[1].caption),
  sample("microblading", "04", "Microblading", BEFORE_AFTER[2].caption),
];

export default function BeforeAfterSlider() {
  const preview = usePreviewMode();
  const real = BEFORE_AFTER.filter((p): p is BeforeAfterPair & { before: string; after: string } => !!p.before && !!p.after);
  const pairs = real.length ? real : preview ? (PREVIEW_PAIRS as (BeforeAfterPair & { before: string; after: string })[]) : [];
  const isSample = !real.length;

  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const pair = pairs[Math.min(active, pairs.length - 1)];

  // A section that appears after mount changes the page height: re-measure every trigger.
  useEffect(() => {
    if (pairs.length) requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [pairs.length]);

  useGSAP(
    () => {
      if (!pairs.length || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.from(q(".ba-line"), { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: root.current, start: "top 75%" } });
      gsap.from(q(".ba-stage"), { y: 40, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 65%" } });
      // Nudge the divider once so visitors see it can be dragged.
      const box = q(".ba-box")[0] as HTMLElement | undefined;
      if (box) {
        const p = { v: 50 };
        gsap.timeline({ scrollTrigger: { trigger: box, start: "top 70%" }, delay: 0.6 })
          .to(p, { v: 32, duration: 0.9, ease: "power2.inOut", onUpdate: () => box.style.setProperty("--pos", `${p.v}%`) })
          .to(p, { v: 50, duration: 0.9, ease: "power2.inOut", onUpdate: () => box.style.setProperty("--pos", `${p.v}%`) });
      }
    },
    { scope: root, dependencies: [pairs.length] }
  );

  if (!pairs.length) return null;

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : -1) + pairs.length) % pairs.length;
    setActive(next);
    (e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next])?.focus();
  };

  return (
    <section ref={root} id="donusum" className="relative overflow-hidden bg-anthracite py-24 md:py-36" aria-labelledby="ba-title">
      <div className="glow -right-[10vw] top-[15%] h-[60vh] w-[60vh] opacity-25" aria-hidden />
      <div className="relative mx-auto max-w-[1300px] px-5 md:px-12">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-5 flex items-center gap-4 text-[10px] uppercase tracking-[0.5em] text-gold/80">
              <span className="h-px w-12 bg-gold/60" /> Dönüşüm
            </p>
            <h2 id="ba-title" className="font-display text-[clamp(2.2rem,5.5vw,5rem)] font-medium leading-[0.95] text-bone">
              <span className="mask block"><span className="ba-line block">ÖNCESİ</span></span>
              <span className="mask block pl-[0.8em]"><span className="ba-line block font-serif italic text-gold-gradient shimmer">&amp; sonrası</span></span>
            </h2>
          </div>

          {/* Tabs */}
          <div role="tablist" aria-label="Dönüşüm türü" onKeyDown={onTabKey} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
            {pairs.map((p, i) => (
              <button
                key={p.id}
                role="tab"
                id={`ba-tab-${p.id}`}
                aria-selected={i === active}
                aria-controls="ba-panel"
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                className={`shrink-0 border px-4 py-3 text-[10px] uppercase tracking-[0.3em] transition-colors duration-300 ${
                  i === active ? "border-gold bg-gold/10 text-gold-light" : "border-white/10 text-bone/60 hover:border-gold/40 hover:text-bone"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div id="ba-panel" role="tabpanel" aria-labelledby={`ba-tab-${pair.id}`} className="ba-stage">
          <CompareSlider
            key={pair.id}
            before={pair.before}
            after={pair.after}
            alt={pair.label}
            beforeFilter={isSample ? "saturate(0.25) brightness(0.7) contrast(0.85) blur(1.5px)" : undefined}
          />
          <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="font-serif text-lg italic text-bone/80">{pair.caption}</p>
            {isSample ? (
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#e0a39a]">Önizleme — örnek görsel, gerçek sonuç değildir</p>
            ) : (
              <p className="text-[10px] uppercase tracking-[0.3em] text-bone/40">THE GRACE · Gerçek müşteri sonucu</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

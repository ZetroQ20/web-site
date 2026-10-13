"use client";

import { Fragment, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { SERVICES } from "@/lib/content";
import { scrollToTarget, useLenis } from "./providers/SmoothScroll";
import Magnetic from "./Magnetic";
import ServiceMedia from "./services/ServiceMedia";
import { SCENES, settle } from "./services/effects";
import { ArrowUpRight } from "./icons";

// Each card gets its own lighting so the deck reads as separate layers.
const TONES = [
  "radial-gradient(90% 70% at 85% 20%, rgba(197,168,128,0.16), transparent 60%), #0b0b0b",
  "radial-gradient(80% 80% at 15% 30%, rgba(228,207,166,0.12), transparent 60%), #090909",
  "radial-gradient(90% 70% at 80% 80%, rgba(197,168,128,0.14), transparent 60%), #0c0b0a",
  "radial-gradient(70% 70% at 25% 75%, rgba(243,227,195,0.12), transparent 60%), #0a0a0a",
];

/**
 * VIP services — a vertical, sticky card deck. Scroll stays native: each
 * full-screen card pins in place while the next one glides over it like a
 * playing card, and every card plays a bespoke scene for its service.
 */
export default function Services() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const cards = q(".vip-card") as HTMLElement[];
      const last = cards[cards.length - 1];

      if (prefersReducedMotion()) {
        cards.forEach(settle);
        return;
      }

      gsap.from(q(".vip-intro"), {
        yPercent: 110,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: q(".vip-head")[0], start: "top 75%" },
      });

      const cleanups: (() => void)[] = [];

      cards.forEach((card, i) => {
        const inner = card.querySelector(".vip-inner");

        // Deck: hold each card until the final card has landed on top of it.
        if (card !== last) {
          ScrollTrigger.create({ trigger: card, start: "top top", endTrigger: last, end: "top top", pin: true, pinSpacing: false });
        } else {
          // The final card keeps the stage a little longer for its scene.
          ScrollTrigger.create({ trigger: card, start: "top top", end: "+=55%", pin: true });
        }

        // As the next card slides over, this one recedes into the deck.
        const next = cards[i + 1];
        if (next) {
          gsap.to(inner, {
            scale: 0.9,
            yPercent: -3,
            filter: "brightness(0.35)",
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true },
          });
        }

        // Copy rises line by line as the card arrives.
        gsap.from(card.querySelectorAll(".vip-reveal"), {
          yPercent: 110,
          autoAlpha: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: card, start: "top 45%", toggleActions: "play none none reverse" },
        });

        const cleanup = SCENES[SERVICES[i].effect](card);
        if (cleanup) cleanups.push(cleanup);
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root }
  );

  return (
    <section ref={root} id="hizmetler" className="relative bg-noir" aria-label="VIP hizmetler">
      {/* Intro */}
      <div className="vip-head relative mx-auto flex max-w-[1600px] flex-col gap-10 px-5 pb-24 pt-32 md:flex-row md:items-end md:justify-between md:px-12 md:pb-32 md:pt-44">
        <div className="glow left-[10vw] top-[10%] h-[60vh] w-[60vh] opacity-30" />
        <div className="relative">
          <p className="mb-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.5em] text-gold/80">
            <span className="h-px w-12 bg-gold/60" /> VIP Hizmetler
          </p>
          <h2 className="font-display text-[clamp(2.8rem,7vw,7.5rem)] font-medium leading-[0.95] text-bone">
            <span className="mask block"><span className="vip-intro block">PRESTİJ</span></span>
            <span className="mask block pl-[0.8em]"><span className="vip-intro block font-serif italic text-gold-gradient shimmer">ritüeller</span></span>
          </h2>
        </div>
        <p className="relative max-w-sm text-[15px] leading-relaxed text-bone/60 md:text-right">
          Dört imza alanı, dört ayrı sahne. Her uygulama, size özel kurgulanan bir dönüşüm ritüeli.
        </p>
      </div>

      {/* Deck */}
      <div className="relative">
        {SERVICES.map((s, i) => (
          <Fragment key={s.no}>
            {/* Dwell: the pinned card stays on stage while this gap scrolls by */}
            {i > 0 && <div aria-hidden className="h-[60svh]" />}
            <article className="vip-card relative h-[100svh] overflow-hidden" style={{ zIndex: i + 1 }} aria-labelledby={`vip-${s.no}`}>
              <div
                className="vip-inner relative flex h-full w-full origin-top items-center border-t border-gold/15 shadow-[0_-30px_80px_rgba(0,0,0,0.75)] will-change-transform"
                style={{ background: TONES[i] }}
              >
                {/* Giant outline number */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 select-none font-display text-[42vh] leading-none text-transparent [-webkit-text-stroke:1px_rgba(197,168,128,0.08)] ${
                    i % 2 ? "left-[2vw]" : "right-[2vw]"
                  }`}
                >
                  {s.no}
                </span>

                <div
                  className={`relative mx-auto flex w-full max-w-[1500px] flex-col items-center gap-8 px-5 pt-16 md:gap-12 md:px-12 md:pt-0 lg:flex-row lg:justify-center lg:gap-[9vw] ${
                    i % 2 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  <div className="shrink-0">
                    <ServiceMedia service={s} />
                  </div>

                  <div className="w-full max-w-xl">
                    <div className="overflow-hidden">
                      <p className="vip-reveal flex items-center gap-4 text-[10px] uppercase tracking-[0.45em] text-gold/80">
                        <span className="font-display text-base tracking-[0.2em] text-gold">{s.no}</span>
                        <span className="h-px w-10 bg-gold/50" />
                        {s.subtitle}
                      </p>
                    </div>
                    <div className="overflow-hidden">
                      <h3 id={`vip-${s.no}`} className="vip-reveal mt-4 font-display text-[clamp(1.7rem,4vw,4.2rem)] font-normal leading-[1.02] tracking-[0.03em] text-gold-light">
                        {s.title}
                      </h3>
                    </div>
                    <div className="overflow-hidden">
                      <p className="vip-reveal mt-6 max-w-md text-sm leading-relaxed text-bone/65 max-md:hidden md:text-[15px]">{s.description}</p>
                    </div>
                    <ul className="mt-5 border-t border-gold/15 md:mt-8">
                      {s.items.map((it) => (
                        <li key={it.name} className="overflow-hidden border-b border-gold/15">
                          <div className="vip-reveal flex items-baseline justify-between gap-6 py-2.5 text-sm md:py-3.5 md:text-[15px]">
                            <span className="text-bone/85">{it.name}</span>
                            <span className="font-serif italic text-gold">{it.price}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 hidden md:block">
                      <Magnetic>
                        <button type="button" onClick={() => scrollToTarget(lenis, "#iletisim")} className="btn-aura" data-cursor="RANDEVU">
                          Randevu Planla <ArrowUpRight className="h-4 w-4 text-gold" />
                        </button>
                      </Magnetic>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </Fragment>
        ))}
      </div>
    </section>
  );
}

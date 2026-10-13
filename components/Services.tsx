"use client";

import { useRef } from "react";
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
  "radial-gradient(80% 70% at 75% 25%, rgba(228,207,166,0.13), transparent 60%), #0b0a09",
];

/**
 * Deck pacing, in screens of scroll (1 = one viewport height).
 * Every card holds the stage for HOLD screens, then the next card takes COVER
 * screens to glide over it — 1.5 screens per service. Each scene starts while
 * its card is still sliding in, so motion flows from one into the next.
 */
const HOLD = 0.8;
const COVER = 0.7;
/** Seconds the scrub trails the scroll — smooth, yet still precise. */
const SCRUB = 1;
/** Scene window: from half-way through the incoming cover to most of the hold. */
const SCENE_LEAD = COVER * 0.5;
const SCENE_SPAN = SCENE_LEAD + HOLD * 0.8;

/**
 * VIP services — a vertical card deck. The stage pins once and a single
 * scrubbed timeline drives everything: each full-screen card holds while its
 * bespoke scene plays, then the next card slides over it like a playing card
 * while the covered one recedes into the deck. Scroll stays native throughout.
 */
export default function Services() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const stage = q(".vip-stage")[0] as HTMLElement;
      const cards = q(".vip-card") as HTMLElement[];

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

      // Stack the cards on one stage (the static fallback is a plain column).
      stage.setAttribute("data-deck", "");
      gsap.set(cards.slice(1), { yPercent: 100 });

      const scenes = cards.map((card, i) => SCENES[SERVICES[i].effect](card));
      const reveals = cards.map((card) => gsap.utils.toArray<HTMLElement>(".vip-reveal", card));
      gsap.set(reveals.slice(1).flat(), { yPercent: 110, autoAlpha: 0 });

      // The first card rises into view before the pin: reveal it on the way in.
      const intro = gsap
        .timeline()
        .from(reveals[0], { yPercent: 110, autoAlpha: 0, duration: 0.5, ease: "power3.out", stagger: 0.05 }, 0.2)
        .add(scenes[0].tl.paused(false), 0);
      ScrollTrigger.create({ animation: intro, trigger: stage, start: "top 85%", end: "top top", scrub: SCRUB });

      const master = gsap.timeline({ defaults: { ease: "none" } });
      cards.forEach((card, i) => {
        const holdStart = i * (HOLD + COVER);
        const frame = card.querySelector(".vip-frame");

        // Hold: the frame breathes ever so slightly.
        master.fromTo(frame, { scale: 1 }, { scale: 1.03, duration: HOLD, ease: "sine.inOut" }, holdStart);
        if (i > 0) master.add(scenes[i].tl.paused(false).duration(SCENE_SPAN), holdStart - SCENE_LEAD);

        // Cover: the next card glides over while this one sinks back into the
        // deck. Only transform + opacity are animated so it stays on the GPU.
        const next = cards[i + 1];
        if (!next) return;
        const at = holdStart + HOLD;
        master
          .to(card.querySelector(".vip-inner"), { scale: 0.9, yPercent: -4, duration: COVER, ease: "power2.inOut" }, at)
          .to(card.querySelector(".vip-shade"), { opacity: 0.78, duration: COVER, ease: "power1.in" }, at)
          .to(next, { yPercent: 0, duration: COVER, ease: "power2.inOut" }, at)
          .fromTo(next.querySelector(".vip-content"), { yPercent: 12 }, { yPercent: 0, duration: COVER, ease: "power2.out" }, at)
          .to(reveals[i + 1], { yPercent: 0, autoAlpha: 1, duration: COVER * 0.5, ease: "power3.out", stagger: COVER * 0.04 }, at + COVER * 0.45);
      });

      ScrollTrigger.create({
        animation: master,
        trigger: stage,
        start: "top top",
        end: () => "+=" + master.duration() * window.innerHeight,
        pin: true,
        scrub: SCRUB,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      return () => {
        stage.removeAttribute("data-deck");
        scenes.forEach((s) => s.cleanup?.());
      };
    },
    { scope: root }
  );

  return (
    <section ref={root} id="hizmetler" className="relative bg-noir" aria-label="VIP hizmetler">
      {/* Intro */}
      <div className="vip-head relative mx-auto flex overflow-hidden max-w-[1600px] flex-col gap-10 px-5 pb-24 pt-32 md:flex-row md:items-end md:justify-between md:px-12 md:pb-32 md:pt-44">
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
          Beş imza alanı, beş ayrı sahne. Her uygulama, size özel kurgulanan bir dönüşüm ritüeli.
        </p>
      </div>

      {/* Deck stage */}
      <div className="vip-stage relative">
        {SERVICES.map((s, i) => (
          <article key={s.no} className="vip-card relative h-[100svh] overflow-hidden" style={{ zIndex: i + 1 }} aria-labelledby={`vip-${s.no}`}>
            <div
              className="vip-inner relative flex h-full w-full origin-top items-start overflow-hidden lg:items-center border-t border-gold/15 shadow-[0_-30px_80px_rgba(0,0,0,0.75)]"
              style={{ background: TONES[i] }}
            >
              {/* Darkens the card as the next one covers it (cheaper than a filter) */}
              <div aria-hidden className="vip-shade pointer-events-none absolute inset-0 z-20 bg-noir opacity-0" />
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
                className={`vip-content relative mx-auto flex w-full max-w-[1500px] flex-col items-center gap-5 px-5 pt-[4.75rem] md:gap-8 md:px-12 md:pt-28 lg:flex-row lg:justify-center lg:gap-[9vw] lg:pt-0 ${
                  i % 2 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="shrink-0">
                  <ServiceMedia service={s} />
                </div>

                <div className="w-full max-w-[30rem] lg:max-w-xl">
                  <div className="overflow-hidden">
                    <p className="vip-reveal flex items-center gap-3 overflow-hidden whitespace-nowrap text-[9px] uppercase tracking-[0.3em] text-gold/80 lg:gap-4 lg:text-[10px] lg:tracking-[0.45em]">
                      <span className="font-display text-sm tracking-[0.2em] text-gold lg:text-base">{s.no}</span>
                      <span className="h-px w-6 bg-gold/50 lg:w-10" />
                      {s.subtitle}
                    </p>
                  </div>
                  <div className="overflow-hidden">
                    <h3 id={`vip-${s.no}`} className="vip-reveal mt-2 font-display text-[1.45rem] font-normal leading-[1.05] tracking-[0.03em] text-gold-light md:text-[2.1rem] lg:mt-4 lg:text-[clamp(1.7rem,4vw,4.2rem)] lg:leading-[1.02]">
                      {s.title}
                    </h3>
                  </div>
                  <div className="overflow-hidden">
                    <p className="vip-reveal mt-4 max-w-md text-sm leading-relaxed text-bone/65 max-md:hidden lg:mt-6 lg:text-[15px]">{s.description}</p>
                  </div>
                  <ul className="mt-3 border-t border-gold/15 md:mt-5 lg:mt-8">
                    {s.items.map((it) => (
                      <li key={it.name} className="overflow-hidden border-b border-gold/15">
                        <div className="vip-reveal flex items-baseline justify-between gap-6 py-1.5 text-[13px] md:py-2.5 md:text-sm lg:py-3.5 lg:text-[15px]">
                          <span className="text-bone/85">{it.name}</span>
                          <span className="font-serif italic text-gold">{it.price}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 hidden md:block lg:mt-8">
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
        ))}
      </div>
    </section>
  );
}

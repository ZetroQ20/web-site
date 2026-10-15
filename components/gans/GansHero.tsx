"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { scrollToTarget, useLenis } from "../providers/SmoothScroll";
import Magnetic from "../Magnetic";
import SplitText from "../SplitText";
import Botanical from "./Botanical";
import TiltProduct from "./TiltProduct";
import { GANS } from "@/lib/gans";

export default function GansHero() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (prefersReducedMotion()) return;

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(q(".gans-frame"), { clipPath: "inset(100% 0% 0% 0% round 999px 999px 0 0)", duration: 2, ease: "expo.inOut" }, 0)
        .from(q(".gans-img"), { scale: 1.3, duration: 2.6 }, 0.2)
        .from(q(".hero-char"), { yPercent: 115, duration: 1.6, stagger: 0.07 }, 0.5)
        .from(q(".bot-stroke"), { strokeDashoffset: 1, duration: 2.8, ease: "power2.inOut", stagger: 0.06 }, 0.6)
        .from(q(".bot-berry"), { scale: 0, transformOrigin: "center", duration: 0.8, stagger: 0.1 }, 2)
        .from(q(".hero-fade"), { autoAlpha: 0, y: 24, duration: 1.3, stagger: 0.1 }, 1.1)
        .from(q(".hero-rule"), { scaleX: 0, duration: 1.6, ease: "expo.inOut" }, 1);

      // Leaving the hero: the giant wordmark drifts up while the bottle sinks — depth.
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } })
        .to(q(".hero-mark"), { yPercent: -35, autoAlpha: 0.1, ease: "none" }, 0)
        .to(q(".hero-visual"), { yPercent: 12, ease: "none" }, 0)
        .to(q(".hero-sprig"), { yPercent: -40, rotate: -8, ease: "none" }, 0);
    },
    { scope: root }
  );

  return (
    <section ref={root} id="top" className="relative isolate min-h-[100svh] overflow-hidden pt-28 pb-20 md:pt-32">
      <div aria-hidden className="glow left-[-10%] top-[10%] h-[55vw] w-[55vw] opacity-60" />
      <div aria-hidden className="glow glow--soft right-[-15%] bottom-[-10%] h-[60vw] w-[60vw]" />

      {/* giant foil wordmark behind everything */}
      <div aria-hidden className="hero-mark pointer-events-none absolute inset-x-0 top-[12vh] -z-10 select-none text-center font-display text-[34vw] leading-none outline-text md:top-[8vh]">
        GANS
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:gap-10 lg:px-10">
        <div className="relative z-10 order-2 md:order-1">
          <p className="hero-fade flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.42em] text-gold">
            <span className="h-px w-8 bg-gold/60" />
            <span className="hidden sm:inline">Édition Numérotée ·</span> Nº {GANS.edition.number} / {GANS.edition.of}
          </p>

          <h1 className="mt-6 font-display text-[clamp(4.2rem,13vw,10rem)] font-medium leading-[0.86] tracking-[0.06em]">
            <SplitText text={GANS.brand} innerClassName="hero-char text-gold-gradient shimmer" />
            <span className="sr-only"> — </span>
            <span className="mt-3 block font-serif text-[clamp(1.9rem,4.4vw,3.4rem)] font-normal italic tracking-normal text-bone">
              <SplitText text={GANS.name} by="words" innerClassName="hero-char" />
            </span>
          </h1>

          <div className="hero-rule mt-8 h-px w-full max-w-md origin-left bg-gradient-to-r from-gold/70 via-gold/25 to-transparent" />

          <p className="hero-fade mt-8 max-w-md font-serif text-xl italic leading-relaxed text-sand">“{GANS.tagline}”</p>
          <p className="hero-fade mt-4 max-w-md text-[0.95rem] leading-7 text-bone/70">{GANS.intro}</p>

          <div className="hero-fade mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a
                href="#rezerve"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget(lenis, "#rezerve");
                }}
                className="btn-aura btn-aura--solid"
              >
                Şişenizi Rezerve Edin
              </a>
            </Magnetic>
            <a
              href="#notalar"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget(lenis, "#notalar");
              }}
              className="btn-aura"
            >
              Kokuyu Keşfet
            </a>
          </div>

          <dl className="hero-fade mt-12 grid max-w-md grid-cols-3 border-t border-bone/10 pt-6 text-center">
            {[
              ["100", "ml"],
              ["12", "hafta"],
              ["1/1000", "seri"],
            ].map(([v, k]) => (
              <div key={k} className="border-r border-bone/10 last:border-r-0">
                <dt className="sr-only">{k}</dt>
                <dd className="font-display text-xl text-gold-light">{v}</dd>
                <dd className="mt-1 text-[0.65rem] uppercase tracking-[0.32em] text-bone/50">{k}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hero-visual relative order-1 mx-auto w-full max-w-[min(30rem,82vw)] md:order-2">
          <Botanical className="hero-sprig absolute -left-14 -top-10 z-20 h-48 w-24 text-gold md:-left-20 md:h-64 md:w-32" />
          <TiltProduct />
          <p className="hero-fade mt-8 text-center text-[0.65rem] uppercase tracking-[0.5em] text-bone/45">
            {GANS.type} · {GANS.volume}
          </p>
        </div>
      </div>
    </section>
  );
}

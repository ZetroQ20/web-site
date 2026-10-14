"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { FOUNDER } from "@/lib/content";
import Photo from "./Photo";

/**
 * "The Art Director — Cansu Üçdağ": an asymmetric, editorial founder & manifesto spread
 * between the VIP services and the gallery.
 */
export default function FounderVision() {
  const root = useRef<HTMLElement>(null);
  const words = FOUNDER.headline.split(" ");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const trigger = { trigger: root.current, start: "top 70%" };

      gsap
        .timeline({ scrollTrigger: trigger, defaults: { ease: "expo.out" } })
        .fromTo(q(".fv-frame"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" }, 0)
        .fromTo(q(".fv-portrait"), { scale: 1.25 }, { scale: 1, duration: 2.2 }, 0.2)
        .from(q(".fv-badge"), { y: 24, autoAlpha: 0, duration: 1 }, 1)
        .from(q(".fv-eyebrow"), { y: 16, autoAlpha: 0, duration: 1 }, 0.3)
        .from(q(".fv-word"), { yPercent: 110, duration: 1.3, stagger: 0.045 }, 0.35)
        .from(q(".fv-copy"), { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.12 }, 0.8)
        // the signature "writes" itself from left to right
        .fromTo(q(".fv-signature"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 2, ease: "power2.inOut" }, 1.2)
        .from(q(".fv-value"), { y: 20, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 1.5);

      // Gentle depth on larger screens: the portrait drifts slower than the copy.
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        gsap.to(q(".fv-media"), { yPercent: -8, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="vizyon" className="relative overflow-hidden bg-noir py-28 md:py-40" aria-labelledby="fv-title">
      <div className="glow -left-[15vw] top-[20%] h-[70vh] w-[70vh] opacity-25" aria-hidden />

      <div className="relative mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-16 px-5 md:px-12 lg:grid-cols-12 lg:gap-10">
        {/* Portrait */}
        <div className="fv-media relative mx-auto w-full max-w-[26rem] lg:col-span-5 lg:max-w-none">
          <div aria-hidden className="pointer-events-none absolute -left-3 -top-3 bottom-8 right-8 border border-gold/20 md:-left-6 md:-top-6" />
          <div className="fv-frame gold-glaze relative aspect-[4/5] w-full overflow-hidden bg-graphite">
            {FOUNDER.portrait ? (
              <Photo
                src={FOUNDER.portrait}
                alt={`${FOUNDER.name} — ${FOUNDER.role}`}
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="fv-portrait absolute inset-0 h-full w-full object-cover object-[50%_30%] contrast-[1.05] saturate-[0.85] sepia-[10%]"
              />
            ) : (
              // Until the real portrait is added: an editorial monogram composition (never a stock face).
              <div className="fv-portrait absolute inset-0 flex items-center justify-center bg-[radial-gradient(90%_70%_at_60%_30%,#3a3024_0%,#141414_55%,#050505_100%)]">
                <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
                  <circle cx="200" cy="230" r="150" stroke="#C5A880" strokeOpacity="0.25" strokeWidth="0.8" />
                  <circle cx="200" cy="230" r="118" stroke="#E4CFA6" strokeOpacity="0.12" strokeWidth="0.6" />
                  <path d="M40 470 L200 40 L360 470" stroke="#C5A880" strokeOpacity="0.14" strokeWidth="0.6" />
                </svg>
                <span className="relative font-display text-[clamp(6rem,22vw,11rem)] leading-none tracking-[0.06em] text-transparent [-webkit-text-stroke:1px_rgba(228,207,166,0.6)]">
                  CÜ
                </span>
              </div>
            )}
          </div>

          {/* Badge */}
          <div className="fv-badge absolute -bottom-6 left-4 border-l border-gold/60 bg-noir/90 px-5 py-4 md:left-8 md:bg-noir/70 md:backdrop-blur-md">
            <p className="text-[9px] uppercase tracking-[0.45em] text-gold/80">Signature Vision</p>
            <p className="mt-1 font-serif text-lg italic text-bone">{FOUNDER.name}</p>
          </div>
        </div>

        {/* Manifesto */}
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="fv-eyebrow mb-7 flex items-center gap-4 text-[10px] uppercase tracking-[0.5em] text-gold/80">
            <span className="h-px w-12 bg-gold/60" />
            The Art Director
          </p>

          <h2 id="fv-title" className="font-serif text-[clamp(2rem,4.4vw,4rem)] italic leading-[1.12] text-bone">
            {words.map((w, i) => (
              // The space must sit outside the inline-block mask, or browsers collapse it.
              <Fragment key={i}>
                <span className="mask">
                  <span className={`fv-word ${/ritüel/i.test(w) ? "text-gold-gradient shimmer" : ""}`}>{w}</span>
                </span>
                {i < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h2>

          <div className="mt-10 max-w-xl space-y-5 text-[15px] leading-[1.8] text-bone/65">
            {FOUNDER.manifesto.map((p, i) => (
              <p key={i} className="fv-copy">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-end gap-x-8 gap-y-3">
            <p className="fv-signature font-script text-[clamp(2.8rem,6vw,4.4rem)] leading-none text-gold-light" aria-label={`İmza: ${FOUNDER.name}`}>
              {FOUNDER.name}
            </p>
            <p className="fv-copy pb-2 text-[10px] uppercase tracking-[0.4em] text-bone/45">{FOUNDER.role}</p>
          </div>

          <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FOUNDER.values.map((v) => (
              <li key={v} className="fv-value flex items-center gap-3 border border-white/10 px-4 py-4 text-[10px] uppercase leading-relaxed tracking-[0.25em] text-bone/75">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
                {v}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

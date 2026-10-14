"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { REVIEWS, type Review } from "@/lib/content";
import { usePreviewMode } from "@/lib/preview";

// Preview-only (?onizleme) placeholders — clearly marked, never shown to regular visitors.
const SAMPLE: { rating: number; count: number; items: Review[] } = {
  rating: 4.9,
  count: 0,
  items: [
    { name: "Örnek Müşteri", service: "Mikro Kaynak & Balayage", text: "Gerçek bir müşteri yorumu burada yer alacak. Hizmet deneyimi, sonuç ve salonun atmosferi hakkında birkaç cümle." },
    { name: "Örnek Müşteri", service: "Hydra Glow Bakım", text: "Gerçek bir müşteri yorumu burada yer alacak. Hizmet deneyimi, sonuç ve salonun atmosferi hakkında birkaç cümle." },
    { name: "Örnek Müşteri", service: "Microblading", text: "Gerçek bir müşteri yorumu burada yer alacak. Hizmet deneyimi, sonuç ve salonun atmosferi hakkında birkaç cümle." },
  ],
};

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-1 text-gold" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill={value >= i + 0.75 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1">
          <path d="M10 1.8l2.5 5.3 5.7.7-4.2 3.9 1.1 5.7L10 14.6l-5.1 2.8 1.1-5.7L1.8 7.8l5.7-.7L10 1.8Z" />
        </svg>
      ))}
    </span>
  );
}

/** Minimal editorial testimonials strip — rendered only from real reviews (see lib/content.ts). */
export default function Testimonials() {
  const preview = usePreviewMode();
  const root = useRef<HTMLElement>(null);
  const hasReal = REVIEWS.items.length > 0;
  const isSample = !hasReal && preview;
  const items = hasReal ? REVIEWS.items : isSample ? SAMPLE.items : [];
  const rating = hasReal ? REVIEWS.rating : isSample ? SAMPLE.rating : null;
  const count = hasReal ? REVIEWS.count : null;

  useEffect(() => {
    if (items.length) requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [items.length]);

  useGSAP(
    () => {
      if (!items.length || prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.from(q(".tm-in"), { y: 30, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: root.current, start: "top 75%" } });
    },
    { scope: root, dependencies: [items.length] }
  );

  if (!items.length) return null;

  return (
    <section ref={root} id="yorumlar" className="relative bg-noir py-20 md:py-28" aria-labelledby="tm-title">
      <div className="mx-auto max-w-[1500px] px-5 md:px-12">
        <div className="tm-in mb-12 flex flex-col items-start gap-5 border-y border-white/10 py-6 md:flex-row md:items-center md:justify-between">
          <h2 id="tm-title" className="text-[10px] uppercase tracking-[0.5em] text-gold/80">
            Müşteri Deneyimleri
          </h2>
          {rating && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="font-serif text-2xl italic text-gold-light">
                {rating.toLocaleString("tr-TR", { minimumFractionDigits: 1 })} <span className="text-base text-bone/50">/ 5.0</span>
              </span>
              <Stars value={rating} />
              <span className="text-[10px] uppercase tracking-[0.3em] text-bone/50">
                {isSample ? "Örnek puan" : count ? `${count} ${REVIEWS.source} yorumu` : `${REVIEWS.source} puanı`}
              </span>
            </div>
          )}
        </div>

        <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-0 overflow-x-auto overscroll-x-contain px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
          {items.map((r, i) => (
            <li
              key={i}
              className="tm-in flex w-[85vw] max-w-[24rem] shrink-0 snap-start flex-col justify-between border-l border-white/10 px-6 py-2 first:border-l-0 first:pl-0 md:w-auto md:max-w-none md:px-10 md:first:pl-0"
            >
              <figure>
                <span aria-hidden className="font-serif text-5xl leading-none text-gold/40">“</span>
                <blockquote className="-mt-2 font-serif text-[1.05rem] italic leading-[1.7] text-bone/80 md:text-lg">{r.text}</blockquote>
                <figcaption className="mt-8 flex flex-wrap items-center gap-3">
                  <span className="text-[13px] text-bone">{r.name}</span>
                  <span className="border border-gold/25 px-2.5 py-1 text-[9px] uppercase tracking-[0.25em] text-gold/80">{r.service}</span>
                  {isSample && <span className="text-[9px] uppercase tracking-[0.25em] text-[#e0a39a]">Örnek</span>}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

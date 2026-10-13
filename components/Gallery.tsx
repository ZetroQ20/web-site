"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { GALLERY, MARQUEE } from "@/lib/content";
import Photo from "./Photo";

export default function Gallery() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      gsap.from(q(".gal-title"), {
        yPercent: 110,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: q(".gal-head")[0], start: "top 80%" },
      });

      const mm = gsap.matchMedia();
      q(".gal-item").forEach((item, i) => {
        const frame = item.querySelector(".gal-reveal");
        const img = item.querySelector(".gal-img");
        const speed = Number((item as HTMLElement).dataset.speed ?? 0);

        // Exhibition reveal: grows, straightens and un-masks as it enters.
        gsap.fromTo(
          frame,
          { clipPath: "inset(18% 12% 18% 12%)", scale: 0.86, rotate: i % 2 ? 4 : -4, autoAlpha: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            rotate: 0,
            autoAlpha: 1,
            duration: 1.8,
            ease: "expo.out",
            scrollTrigger: { trigger: item, start: "top 88%", toggleActions: "play none none reverse" },
          }
        );
        gsap.fromTo(img, { scale: 1.35 }, { scale: 1.05, duration: 2.2, ease: "expo.out", scrollTrigger: { trigger: item, start: "top 88%", toggleActions: "play none none reverse" } });

        // Each tile travels at its own speed for the mosaic parallax (desktop only).
        mm.add("(min-width: 768px)", () => {
          gsap.to(item, {
            yPercent: speed,
            ease: "none",
            scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="galeri" className="relative overflow-hidden bg-noir pb-24 pt-32 md:pb-40 md:pt-44" aria-label="Galeri">
      <div className="glow -right-[20vw] top-[30%] h-[90vh] w-[90vh] opacity-30" />
      <div className="glow glow--soft -left-[10vw] bottom-[10%] h-[70vh] w-[70vh]" />

      <div className="gal-head relative mx-auto mb-20 flex max-w-[1600px] flex-col gap-8 px-5 md:mb-32 md:flex-row md:items-end md:justify-between md:px-12">
        <h2 className="font-display text-[clamp(2.6rem,7vw,7.5rem)] font-medium leading-[0.92] text-bone">
          <span className="mask block"><span className="gal-title block">THE</span></span>
          <span className="mask block pl-[1em]"><span className="gal-title block font-serif italic text-gold-gradient shimmer">Gallery</span></span>
        </h2>
        <p className="max-w-sm text-[15px] leading-relaxed text-bone/55 md:text-right">
          Bir sergi salonunda dolaşır gibi… Her kare, salonumuzda hayat bulan bir dönüşüm hikâyesi.
        </p>
      </div>

      <div className="relative mx-auto grid max-w-[1600px] grid-cols-2 gap-4 px-5 md:grid-cols-12 md:gap-8 md:px-12">
        {GALLERY.map((g, i) => (
          <figure key={g.src} data-speed={g.speed} className={`gal-item group relative ${g.className} ${i === 0 || i === GALLERY.length - 1 ? "col-span-2" : ""}`}>
            <div className="gal-reveal gold-glaze relative h-full w-full overflow-hidden" data-cursor="BAK">
              <Photo
                src={g.src}
                alt={g.alt}
                sizes={i === 0 || i === GALLERY.length - 1 ? "(min-width: 768px) 42vw, 100vw" : "(min-width: 768px) 34vw, 50vw"}
                className="gal-img h-full w-full object-cover grayscale contrast-[1.1] brightness-[0.8] transition-[filter] duration-[1.2s] ease-silk group-hover:grayscale-0 group-hover:brightness-100 group-hover:sepia-[12%]"
              />
              <span className="pointer-events-none absolute inset-3 z-[2] border border-gold/0 transition-colors duration-700 group-hover:border-gold/40" />
            </div>
            <figcaption className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.4em] text-bone/40">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span className="text-gold/70">{g.alt}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Marquee */}
      <div className="relative mt-32 overflow-hidden border-y border-gold/10 py-8 md:mt-48" aria-hidden>
        <div className="animate-marquee flex w-max gap-12 whitespace-nowrap">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 gap-12">
              {MARQUEE.concat(MARQUEE).map((w, i) => (
                <span key={i} className="flex items-center gap-12 font-display text-[clamp(2rem,6vw,5.5rem)] leading-none">
                  <span className={i % 2 ? "outline-text-strong" : "text-bone/90"}>{w}</span>
                  <span className="text-xl text-gold">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

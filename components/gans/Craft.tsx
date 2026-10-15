"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { CRAFT, GANS_IMAGE } from "@/lib/gans";

function Crop({ focus, zoom, className = "" }: { focus: string; zoom: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- crops of one local asset, scaled by CSS
    <img
      src={GANS_IMAGE}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      style={{ objectPosition: focus, transformOrigin: focus, transform: `scale(${zoom})` }}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

/**
 * Scroll story: a sticky jewel-case frame on the left cross-fades between close-ups
 * while the chapters scroll past on the right. Phones get each close-up inline.
 */
export default function Craft() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const layers = q(".craft-layer");
      const chapters = q(".craft-chapter");
      const reduce = prefersReducedMotion();

      const show = (i: number) => {
        layers.forEach((el, j) =>
          gsap.to(el, { autoAlpha: j === i ? 1 : 0, scale: j === i ? 1 : 1.06, duration: reduce ? 0 : 1.1, ease: "expo.out", overwrite: true })
        );
        q(".craft-index").forEach((el, j) => el.classList.toggle("is-active", j === i));
      };
      gsap.set(layers, { autoAlpha: 0 });
      gsap.set(layers[0], { autoAlpha: 1 });

      chapters.forEach((ch, i) => {
        ScrollTrigger.create({
          trigger: ch,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => self.isActive && show(i),
        });
        if (!reduce) {
          gsap.from(ch.querySelectorAll(".craft-in"), {
            autoAlpha: 0,
            y: 40,
            duration: 1.2,
            stagger: 0.1,
            ease: "expo.out",
            scrollTrigger: { trigger: ch, start: "top 80%" },
          });
        }
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="zanaat" className="relative border-y border-gold/10 bg-[linear-gradient(180deg,#070a05,#121a0d_50%,#070a05)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:px-6 md:grid-cols-2 md:gap-20 md:py-32 lg:px-10">
        <div className="hidden md:block">
          <div className="sticky top-[12vh] h-[76vh]">
            <div className="relative h-full overflow-hidden rounded-[2px] border border-gold/25 bg-[#e9e0d2] shadow-[0_40px_100px_-30px_rgb(0_0_0/0.85)]">
              {CRAFT.map((c) => (
                <div key={c.no} className="craft-layer absolute inset-0 overflow-hidden">
                  <Crop focus={c.focus} zoom={c.zoom} />
                </div>
              ))}
              <div aria-hidden className="pointer-events-none absolute inset-3 border border-bone/25" />
              <div className="absolute bottom-6 left-6 flex gap-3">
                {CRAFT.map((c) => (
                  <span
                    key={c.no}
                    className="craft-index grid h-9 w-9 place-items-center rounded-full border border-noir/30 bg-bone/70 font-display text-xs text-noir/70 backdrop-blur transition-all duration-500 [&.is-active]:border-gold [&.is-active]:bg-noir [&.is-active]:text-gold-light"
                  >
                    {c.no}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.42em] text-gold">Zanaat</p>
          <h2 className="mt-5 font-serif text-[clamp(2.2rem,5vw,3.8rem)] leading-tight">
            Yavaş yapılan <em className="text-gold-gradient">her şey</em> güzeldir.
          </h2>

          {CRAFT.map((c) => (
            <article key={c.no} className="craft-chapter flex min-h-[70vh] flex-col justify-center py-14 md:min-h-[80vh]">
              <div className="craft-in relative mb-8 aspect-[4/3] overflow-hidden rounded-[2px] border border-gold/25 bg-[#e9e0d2] md:hidden">
                <Crop focus={c.focus} zoom={c.zoom} />
              </div>
              <span className="craft-in font-display text-6xl text-gold/30 md:text-7xl">{c.no}</span>
              <h3 className="craft-in mt-4 font-serif text-3xl text-bone md:text-4xl">{c.title}</h3>
              <div className="craft-in mt-6 h-px w-16 bg-gold/50" />
              <p className="craft-in mt-6 max-w-md text-[1.02rem] leading-8 text-bone/70">{c.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

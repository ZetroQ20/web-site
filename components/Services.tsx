"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { SERVICES } from "@/lib/content";
import { scrollToTarget, useLenis } from "./providers/SmoothScroll";
import Photo from "./Photo";
import Magnetic from "./Magnetic";
import { ArrowUpRight } from "./icons";

// Alternating asymmetric silhouettes + vertical offsets for each card.
const SHAPES = [
  { clip: "polygon(0 0, 100% 4%, 96% 100%, 0 94%)", offset: "lg:-translate-y-[4vh]" },
  { clip: "polygon(4% 3%, 100% 0, 100% 96%, 0 100%)", offset: "lg:translate-y-[5vh]" },
  { clip: "polygon(0 5%, 94% 0, 100% 100%, 5% 96%)", offset: "lg:-translate-y-[2vh]" },
  { clip: "polygon(0 0, 100% 0, 95% 95%, 3% 100%)", offset: "lg:translate-y-[4vh]" },
];

export default function Services() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const section = root.current!;
      const rail = track.current!;
      const q = gsap.utils.selector(section);
      const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth);

      if (prefersReducedMotion()) {
        // No scroll-jacking: let the rail be swiped/scrolled natively.
        section.style.overflowX = "auto";
        section.setAttribute("data-lenis-prevent", "");
        return;
      }

      // Vertical scroll is pinned and converted into a horizontal journey.
      const horizontal = gsap.to(rail, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Progress hairline.
      gsap.to(q(".svc-progress"), {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: () => "+=" + distance(), scrub: true, invalidateOnRefresh: true },
      });

      // Giant backdrop word drifts slower than the cards.
      gsap.to(q(".svc-backdrop"), { xPercent: -30, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: () => "+=" + distance(), scrub: true, invalidateOnRefresh: true } });

      // Inside each card the photo drifts against the travel direction.
      q(".svc-card").forEach((card) => {
        const media = card.querySelector(".svc-media");
        const meta = card.querySelectorAll(".svc-reveal");
        gsap.fromTo(
          media,
          { xPercent: -9 },
          {
            xPercent: 9,
            ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: horizontal, start: "left right", end: "right left", scrub: true },
          }
        );
        gsap.from(meta, {
          yPercent: 100,
          autoAlpha: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: card, containerAnimation: horizontal, start: "left 75%", toggleActions: "play none none reverse" },
        });
      });

      gsap.from(q(".svc-intro-word"), {
        yPercent: 110,
        duration: 1.4,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: "top 70%" },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="hizmetler" className="relative h-[100svh] overflow-hidden bg-anthracite" aria-label="Prestij hizmetler">
      <div className="glow left-[30vw] top-[10vh] h-[80vh] w-[80vh] opacity-30" />
      <span
        aria-hidden
        className="svc-backdrop outline-text pointer-events-none absolute bottom-[-4vh] left-0 whitespace-nowrap font-display text-[32vh] leading-none tracking-[0.05em]"
      >
        PRESTIGE SERVICES · PRESTIGE SERVICES
      </span>

      <div ref={track} className="relative flex h-full w-max items-center gap-[6vw] pl-5 pr-[10vw] md:pl-12 lg:gap-[5vw]">
        {/* Intro panel */}
        <div className="flex w-[85vw] shrink-0 flex-col justify-center md:w-[48vw] lg:w-[38vw]">
          <p className="mb-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.5em] text-gold/80">
            <span className="h-px w-12 bg-gold/60" /> Hizmetlerimiz
          </p>
          <h2 className="font-display text-[clamp(2.6rem,6vw,6.5rem)] font-medium leading-[0.95] text-bone">
            <span className="mask block"><span className="svc-intro-word block">PRESTİJ</span></span>
            <span className="mask block"><span className="svc-intro-word block font-serif italic text-gold-gradient shimmer">ritüeller</span></span>
          </h2>
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-bone/60">
            Her uygulama, size özel bir kurgu. Dört imza alanımızda zanaatı, teknolojiyi ve estetiği tek bir deneyimde buluşturuyoruz.
          </p>
          <div className="mt-10 flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-bone/40">
            Kaydırmaya devam et
            <span className="h-px w-16 bg-gradient-to-r from-gold to-transparent" />
          </div>
        </div>

        {SERVICES.map((s, i) => (
          <article
            key={s.no}
            data-cursor="KEŞFET"
            className={`svc-card service-card group relative h-[72svh] w-[85vw] shrink-0 md:h-[78svh] md:w-[62vw] lg:w-[52vw] ${SHAPES[i].offset}`}
          >
            <div className="absolute inset-0 overflow-hidden bg-graphite" style={{ clipPath: SHAPES[i].clip }}>
              <div className="svc-media absolute -inset-x-[12%] inset-y-0">
                <Photo
                  src={s.image}
                  alt={`${s.title} — ${s.subtitle}`}
                  className="h-full w-full scale-[1.02] object-cover grayscale-[45%] sepia-[15%] transition-[transform,filter] duration-[1.6s] ease-silk group-hover:scale-[1.1] group-hover:grayscale-0"
                />
              </div>
              {/* Gold glaze + grain-friendly darkening */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(197,168,128,0.28),transparent_40%)] mix-blend-screen opacity-70 transition-opacity duration-700 group-hover:opacity-100" />
            </div>

            {/* Fine asymmetric frame */}
            <div className="pointer-events-none absolute inset-3 border border-gold/20 transition-colors duration-700 group-hover:border-gold/50 md:inset-5" style={{ clipPath: SHAPES[i].clip }} />

            <div className="relative flex h-full flex-col justify-between p-7 md:p-12">
              <div className="flex items-start justify-between">
                <span className="font-display text-[clamp(4rem,9vw,9rem)] leading-none text-transparent [-webkit-text-stroke:1px_rgba(197,168,128,0.7)]">
                  {s.no}
                </span>
                <span className="mt-3 text-[10px] uppercase tracking-[0.45em] text-gold/80">{String(i + 1).padStart(2, "0")} / 04</span>
              </div>

              <div>
                <div className="overflow-hidden">
                  <p className="svc-reveal text-[11px] uppercase tracking-[0.4em] text-sand/80">{s.subtitle}</p>
                </div>
                <div className="overflow-hidden">
                  <h3 className="svc-reveal mt-3 font-display text-[clamp(1.6rem,3.4vw,3.4rem)] font-normal leading-[1.02] tracking-[0.04em] text-gold-light">
                    {s.title}
                  </h3>
                </div>

                {/* Details slide up on hover */}
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-silk group-hover:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <div className="service-details translate-y-8 pt-4 opacity-0 md:pt-6 transition-all duration-700 ease-silk group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="max-w-lg text-sm leading-relaxed text-bone/70 max-md:hidden">{s.description}</p>
                      <ul className="mt-2 divide-y md:mt-6 divide-gold/15 border-y border-gold/15">
                        {s.items.map((it) => (
                          <li key={it.name} className="flex items-baseline justify-between gap-6 py-3 text-sm">
                            <span className="text-bone/85">{it.name}</span>
                            <span className="font-serif italic text-gold">{it.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}

        {/* Outro panel */}
        <div className="flex w-[80vw] shrink-0 flex-col items-start justify-center md:w-[40vw] lg:w-[30vw]">
          <p className="font-serif text-[clamp(1.8rem,3.4vw,3.2rem)] italic leading-tight text-bone">
            Size özel bir <span className="text-gold-gradient shimmer">ritüel</span> tasarlayalım.
          </p>
          <div className="mt-10">
            <Magnetic>
              <button type="button" onClick={() => scrollToTarget(lenis, "#iletisim")} className="btn-aura" data-cursor="RANDEVU">
                Randevu Planla <ArrowUpRight className="h-4 w-4 text-gold" />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="absolute inset-x-5 bottom-6 flex items-center gap-4 md:inset-x-12 md:bottom-10">
        <span className="text-[10px] tracking-[0.4em] text-gold/70">01</span>
        <span className="relative h-px flex-1 bg-bone/10">
          <span className="svc-progress absolute inset-0 origin-left scale-x-0 bg-gold" />
        </span>
        <span className="text-[10px] tracking-[0.4em] text-gold/70">04</span>
      </div>
    </section>
  );
}

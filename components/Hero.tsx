"use client";

import { useRef } from "react";
import { gsap, useGSAP, isFinePointer, prefersReducedMotion } from "@/lib/gsap";
import { scrollToTarget, useLenis } from "./providers/SmoothScroll";
import Magnetic from "./Magnetic";
import Photo from "./Photo";
import { ArrowUpRight } from "./icons";
import { HERO_IMAGE, SALON } from "@/lib/content";

const HEADLINE = ["KENDİNİ", "YENİDEN", "KEŞFET"];
const RING_TEXT = "• PRESTIGE • BEAUTY • LUXURY • PRESTIGE • BEAUTY • LUXURY ";

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  // Initial state + scroll-driven depth (independent of the intro).
  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".hero-word"), { yPercent: 110, rotate: 4 });
      gsap.set(q(".hero-fade"), { autoAlpha: 0, y: 30 });
      gsap.set(q(".hero-frame"), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(q(".hero-img"), { scale: 1.35 });
      gsap.set(q(".hero-stroke"), { strokeDashoffset: 1 });
      gsap.set(q(".hero-ring"), { autoAlpha: 0, scale: 0.6 });

      if (prefersReducedMotion()) return;

      // Leaving the hero: copy drifts up, portrait sinks slower — real depth.
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } })
        .to(q(".hero-copy"), { yPercent: -18, autoAlpha: 0.2, ease: "none" }, 0)
        .to(q(".hero-visual"), { yPercent: 14, ease: "none" }, 0)
        .to(q(".hero-img"), { scale: 1.12, ease: "none" }, 0)
        .to(q(".hero-lines"), { yPercent: -10, rotate: -4, ease: "none" }, 0);
    },
    { scope: root }
  );

  // Cinematic intro once the preloader doors open.
  useGSAP(
    () => {
      if (!ready) return;
      const q = gsap.utils.selector(root);
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .to(q(".hero-frame"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.inOut" }, 0)
        .to(q(".hero-img"), { scale: 1, duration: 2.4, ease: "expo.out" }, 0.3)
        .to(q(".hero-word"), { yPercent: 0, rotate: 0, duration: 1.6, stagger: 0.12 }, 0.35)
        .to(q(".hero-stroke"), { strokeDashoffset: 0, duration: 2.6, ease: "power2.inOut", stagger: 0.15 }, 0.4)
        .to(q(".hero-ring"), { autoAlpha: 1, scale: 1, duration: 1.6 }, 0.9)
        .to(q(".hero-fade"), { autoAlpha: 1, y: 0, duration: 1.3, stagger: 0.1 }, 1);
    },
    { scope: root, dependencies: [ready] }
  );

  // Mouse parallax: layers drift in opposite directions by depth.
  useGSAP(
    () => {
      if (!isFinePointer() || prefersReducedMotion()) return;
      const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", root.current);
      const movers = layers.map((el) => {
        const depth = Number(el.dataset.depth);
        return {
          depth,
          x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
        };
      });
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        movers.forEach((m) => {
          m.x(nx * m.depth * 60);
          m.y(ny * m.depth * 60);
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root }
  );

  return (
    <section ref={root} id="top" className="relative min-h-[100svh] overflow-hidden bg-noir pt-32">
      {/* Atmosphere */}
      <div className="glow -left-[15vw] top-[10vh] h-[70vh] w-[70vh] opacity-50" />
      <div className="glow glow--soft right-[5vw] bottom-[-20vh] h-[80vh] w-[80vh]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_40%,#030303_85%)]" />

      <div className="relative mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-14 px-5 pb-20 md:px-12 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-12 lg:gap-6">
        {/* Copy */}
        <div className="hero-copy relative z-10 lg:col-span-7">
          <p className="hero-fade mb-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.5em] text-gold/80 md:text-[11px]">
            <span className="h-px w-12 bg-gold/60" />
            Hair · Beauty · Denizli
          </p>

          <h1 className="font-display font-medium leading-[0.92] tracking-[0.02em] text-bone">
            {HEADLINE.map((w, i) => (
              <span key={w} className="mask block">
                <span
                  className={`hero-word block text-[clamp(3.2rem,9.4vw,10rem)] ${
                    i === 1 ? "pl-[0.6em] font-serif text-gold-gradient shimmer italic" : ""
                  } ${i === 2 ? "outline-text-strong" : ""}`}
                >
                  {w}
                </span>
              </span>
            ))}
          </h1>

          <div className="mask mt-6 block">
            <span className="hero-word block font-serif text-[clamp(1.1rem,2.2vw,1.9rem)] italic tracking-[0.18em] text-sand">
              — The Grace Experience
            </span>
          </div>

          <div className="mt-10 flex flex-col gap-10 md:flex-row md:items-end md:gap-14">
            <p className="hero-fade max-w-sm text-[15px] leading-relaxed text-bone/65">
              <span className="text-gold-light">Cansu Üçdağ</span>’ın vizyonuyla, Denizli’nin en prestijli dönüşüm noktası.
            </p>
            <div className="hero-fade">
              <Magnetic strength={0.4}>
                <button
                  type="button"
                  onClick={() => scrollToTarget(lenis, "#hizmetler")}
                  className="btn-aura btn-aura--solid !py-5 !pl-8 !pr-6"
                  data-cursor="KEŞFET"
                >
                  Deneyimi Başlat
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-noir/90 text-gold">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </button>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* Layered visual */}
        <div className="hero-visual relative mx-auto aspect-[4/5] w-full max-w-[520px] lg:col-span-5 lg:max-w-none">
          {/* Back: asymmetric gold lines */}
          <div data-depth="-0.5" className="absolute -inset-[12%]">
            <svg viewBox="0 0 400 500" fill="none" className="hero-lines h-full w-full" aria-hidden>
              <path className="hero-stroke" pathLength={1} strokeDasharray="1" d="M20 470 L120 40 L380 90" stroke="#C5A880" strokeWidth="0.6" opacity="0.7" />
              <path className="hero-stroke" pathLength={1} strokeDasharray="1" d="M60 20 C 300 60, 420 260, 300 480" stroke="#E4CFA6" strokeWidth="0.5" opacity="0.5" />
              <path className="hero-stroke" pathLength={1} strokeDasharray="1" d="M0 300 L250 300 L330 490" stroke="#8F7550" strokeWidth="0.6" opacity="0.8" />
              <circle className="hero-stroke" pathLength={1} strokeDasharray="1" cx="300" cy="110" r="70" stroke="#C5A880" strokeWidth="0.5" opacity="0.4" />
            </svg>
          </div>

          {/* Offset gold frame */}
          <div data-depth="-0.25" className="absolute inset-0">
            <div className="hero-fade h-full w-full">
              <div className="h-full w-full translate-x-5 translate-y-5 border border-gold/30 [clip-path:polygon(0_6%,88%_0,100%_100%,8%_96%)] md:translate-x-8 md:translate-y-8" />
            </div>
          </div>

          {/* Front: portrait */}
          <div data-depth="0.45" className="absolute inset-0">
            <div className="hero-frame gold-glaze relative h-full w-full overflow-hidden [clip-path:polygon(0_6%,88%_0,100%_100%,8%_96%)]">
              <Photo src={HERO_IMAGE} alt="THE GRACE — sinematik güzellik portresi" priority sizes="(min-width: 1024px) 40vw, 92vw" className="hero-img h-full w-full object-cover grayscale-[35%] contrast-[1.08] sepia-[18%]" />
            </div>
          </div>

          {/* Rotating badge */}
          <div data-depth="0.9" className="absolute -left-6 top-[8%] z-20 md:-left-16">
            <div className="hero-ring relative h-32 w-32 md:h-44 md:w-44" data-cursor="PRESTİJ">
              <svg viewBox="0 0 200 200" className="animate-spin-slow h-full w-full" aria-hidden>
                <defs>
                  <path id="ring-path" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                </defs>
                <circle cx="100" cy="100" r="96" fill="rgba(3,3,3,0.55)" stroke="rgba(197,168,128,0.35)" strokeWidth="0.6" />
                <text fill="#C5A880" fontSize="13.5" letterSpacing="5" fontFamily="var(--font-manrope), sans-serif">
                  <textPath href="#ring-path">{RING_TEXT}</textPath>
                </text>
              </svg>
              <span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 font-display text-sm text-gold">
                TG
              </span>
            </div>
          </div>

          {/* Caption */}
          <div data-depth="0.7" className="absolute -bottom-6 right-0 z-20 md:-right-6">
            <div className="hero-fade border-l border-gold/60 bg-noir/85 px-5 py-4 md:bg-noir/70 md:backdrop-blur-md">
              <p className="text-[9px] uppercase tracking-[0.45em] text-gold/80">Signature Salon · {SALON.name}</p>
              <p className="mt-1 font-serif text-lg italic text-bone">Cansu Üçdağ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="hero-fade absolute bottom-8 right-5 hidden flex-col items-center gap-3 md:right-12 lg:flex xl:right-auto xl:left-1/2 xl:-translate-x-1/2">
        <span className="text-[9px] uppercase tracking-[0.5em] text-bone/40">Kaydır</span>
        <span className="relative h-14 w-px overflow-hidden bg-bone/10">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_var(--ease-luxe)_infinite] bg-gold" />
        </span>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { gsap, useGSAP, isFinePointer, prefersReducedMotion } from "@/lib/gsap";
import { scrollToTarget, useLenis } from "../providers/SmoothScroll";
import Magnetic from "../Magnetic";
import Ingredient from "./Ingredients";
import { Fog, GoldDust } from "./Atmosphere";
import { GANS, GANS_BOTTLE, GANS_BOX, GANS_OPTIONS, formatTry } from "@/lib/gans";
import type { IngredientKind } from "@/lib/gans";

/** Floating notes framing the product. Bigger + blurred = closer to the lens (depth of field). */
const FLOATERS: { kind: IngredientKind; cls: string; depth: number; blur?: boolean; r0: string; r1: string; dur: string }[] = [
  { kind: "leaf", cls: "left-[-6%] top-[8%] w-[34vmin] md:left-[2%] md:top-[6%] md:w-[26vmin]", depth: 1.4, blur: true, r0: "-28deg", r1: "-20deg", dur: "9s" },
  { kind: "bergamot", cls: "right-[-8%] top-[22%] w-[30vmin] md:right-[6%] md:top-[18%] md:w-[20vmin]", depth: 1, r0: "12deg", r1: "22deg", dur: "8s" },
  { kind: "jasmine", cls: "left-[10%] bottom-[30%] w-[16vmin] md:left-[20%] md:bottom-[26%] md:w-[11vmin]", depth: 0.6, r0: "0deg", r1: "18deg", dur: "7s" },
  { kind: "mandarin", cls: "right-[4%] bottom-[16%] w-[22vmin] md:right-[18%] md:bottom-[12%] md:w-[14vmin]", depth: 0.8, r0: "-8deg", r1: "6deg", dur: "10s" },
  { kind: "tea", cls: "right-[-4%] top-[-4%] w-[26vmin] md:right-[26%] md:top-[2%] md:w-[13vmin]", depth: 0.4, blur: true, r0: "150deg", r1: "160deg", dur: "11s" },
];

export default function GansHero() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (prefersReducedMotion()) {
        gsap.set(q(".hero-curtain"), { autoAlpha: 0 });
        return;
      }

      // Opening shot: darkness → a shaft of light → the bottle surfaces → the name lands.
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .to(q(".hero-curtain"), { autoAlpha: 0, duration: 2.2, ease: "power2.inOut" }, 0.1)
        .from(q(".hero-beam"), { autoAlpha: 0, duration: 2.4, ease: "power1.inOut" }, 0)
        .from(q(".hero-bottle"), { yPercent: 18, filter: "brightness(0)", duration: 2.6 }, 0.3)
        .from(q(".hero-box"), { xPercent: 40, autoAlpha: 0, filter: "brightness(0)", duration: 2.4 }, 0.7)
        .from(q(".hero-plinth"), { scaleX: 0.4, autoAlpha: 0, duration: 2 }, 0.4)
        .from(q(".hero-letter"), { yPercent: 60, autoAlpha: 0, filter: "blur(18px)", duration: 2.2, stagger: 0.09 }, 0.9)
        .from(q(".hero-floater-in"), { scale: 0.3, autoAlpha: 0, rotate: -40, duration: 2.2, stagger: 0.12 }, 1.1)
        .from(q(".hero-fade"), { autoAlpha: 0, y: 24, duration: 1.4, stagger: 0.1 }, 1.6);

      // Scrolling away: the camera pushes in — notes fly past the lens, the name rises.
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } })
        .to(q(".hero-wordmark"), { yPercent: -40, autoAlpha: 0, ease: "none" }, 0)
        .to(q(".hero-product"), { scale: 1.12, yPercent: 8, ease: "none" }, 0)
        .to(q(".hero-floater"), { scale: 1.8, autoAlpha: 0, ease: "none", stagger: 0.02 }, 0)
        .to(q(".hero-out"), { autoAlpha: 0, y: -30, ease: "none" }, 0);

      // Pointer parallax by depth.
      if (!isFinePointer()) return;
      const movers = gsap.utils.toArray<HTMLElement>("[data-depth]", root.current).map((el) => ({
        d: Number(el.dataset.depth),
        x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 1.4, ease: "power3.out" }),
      }));
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        movers.forEach((m) => {
          m.x(nx * m.d * 50);
          m.y(ny * m.d * 50);
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="top"
      aria-label={`${GANS.brand} ${GANS.name}`}
      className="relative isolate h-[100svh] min-h-[640px] overflow-hidden bg-[radial-gradient(120%_85%_at_50%_0%,#22331a_0%,#0e150a_50%,#050704_100%)]"
    >
      <div className="hero-beam absolute inset-0">
        <Fog />
      </div>
      <GoldDust className="z-[1]" />

      {/* Wordmark behind the product */}
      <h1 className="hero-wordmark pointer-events-none absolute inset-x-0 top-[17%] z-[2] select-none text-center font-display text-[30vw] font-medium leading-none tracking-[0.06em] md:top-[9%] md:text-[23vw]">
        <span className="sr-only">
          {GANS.brand} {GANS.name}
        </span>
        <span aria-hidden className="inline-flex">
          {Array.from(GANS.brand).map((ch, i) => (
            <span key={i} className="hero-letter text-gold-gradient inline-block opacity-90">
              {ch}
            </span>
          ))}
        </span>
      </h1>

      {/* Floating notes */}
      {FLOATERS.map((f, i) => (
        <div key={i} data-depth={f.depth} className={`hero-floater absolute z-[4] ${f.cls}`}>
          <div className="hero-floater-in">
          <div
            className="float-y"
            style={{ "--r0": f.r0, "--r1": f.r1, "--dur": f.dur } as React.CSSProperties}
          >
            <Ingredient
              kind={f.kind}
              className={`h-auto w-full drop-shadow-[0_20px_30px_rgb(0_0_0/0.6)] ${f.blur ? "blur-[3px]" : ""}`}
            />
          </div>
          </div>
        </div>
      ))}

      {/* Product on a black stone plinth */}
      <div data-depth="0.25" className="absolute inset-x-0 bottom-[25%] z-[3] flex justify-center md:bottom-[15%]">
        <div className="hero-product relative w-[min(84vw,calc(46svh*1.08))] md:h-[58svh] md:max-h-[600px] md:w-auto" style={{ aspectRatio: "1.08 / 1" }}>
          {/* warm halo behind the bottle */}
          <div aria-hidden className="absolute left-[8%] top-[18%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgb(214_180_110/0.35),transparent)] blur-2xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GANS_BOX.src}
            width={GANS_BOX.w}
            height={GANS_BOX.h}
            alt=""
            className="hero-box product-glow absolute bottom-[3%] right-0 h-[90%] w-auto brightness-[0.82]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GANS_BOTTLE.src}
            width={GANS_BOTTLE.w}
            height={GANS_BOTTLE.h}
            alt={`${GANS.brand} ${GANS.name} çubuklu oda kokusu şişesi ve kutusu`}
            fetchPriority="high"
            className="hero-bottle product-glow absolute bottom-0 left-[6%] h-full w-auto"
          />
          {/* reflection on the polished stone */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GANS_BOTTLE.src}
            alt=""
            aria-hidden
            className="product-reflection absolute left-[6%] top-full h-full w-auto"
          />
          <div
            aria-hidden
            className="hero-plinth absolute -bottom-[7%] left-1/2 -z-10 h-[16%] w-[150%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,#2a2f24,#10130d_70%,transparent)] shadow-[inset_0_2px_0_rgb(197_168_128/0.25)]"
          />
        </div>
      </div>

      {/* Ground fog in front of the plinth */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[24%] bg-gradient-to-t from-[#050704] via-[#050704]/80 md:h-[18%] to-transparent" />

      {/* Copy */}
      <div className="hero-out absolute inset-x-0 bottom-0 z-[6] mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-8 sm:px-6 md:flex-row md:items-end md:justify-between md:pb-12 lg:px-10">
        <div className="hero-fade max-w-sm">
          <p className="font-serif text-3xl italic text-bone md:text-4xl">{GANS.name}</p>
          <p className="mt-2 text-sm text-sand/80">{GANS.tagline}</p>
          <p className="mt-2 text-[0.65rem] uppercase tracking-[0.42em] text-gold/80">
            {GANS.type} · {GANS.volume}
          </p>
        </div>
        <div className="hero-fade flex items-center gap-5">
          <p className="hidden text-right sm:block">
            <span className="block text-[0.6rem] uppercase tracking-[0.4em] text-bone/50">Nº {GANS.edition.number} / {GANS.edition.of}</span>
            <span className="mt-1 block font-display text-lg text-gold-light">{formatTry(GANS_OPTIONS[0].price)}</span>
          </p>
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
        </div>
      </div>


      {/* Opening curtain */}
      <div aria-hidden className="hero-curtain pointer-events-none absolute inset-0 z-[20] bg-black" />
    </section>
  );
}

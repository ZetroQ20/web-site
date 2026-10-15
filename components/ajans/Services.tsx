"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, isFinePointer, prefersReducedMotion } from "@/lib/gsap";
import { SERVICES } from "@/lib/ajans-content";
import RevealText from "./RevealText";

/**
 * Editorial index instead of boxes: one hairline row per discipline. On a fine pointer,
 * a floating preview follows the cursor and wipes open with the hovered row's image.
 */
export default function Services() {
  const section = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const el = preview.current;
    const root = section.current;
    if (!el || !root || !isFinePointer() || prefersReducedMotion()) return;
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" });
    const rTo = gsap.quickTo(el, "rotation", { duration: 0.9, ease: "power3.out" });
    let lastX = 0;
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
      rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
      lastX = e.clientX;
    };
    root.addEventListener("pointermove", onMove, { passive: true });
    return () => root.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const el = preview.current;
    if (!el) return;
    gsap.to(el, {
      clipPath: active >= 0 ? "inset(0% 0% 0% 0%)" : "inset(50% 50% 50% 50%)",
      opacity: active >= 0 ? 1 : 0,
      duration: 0.7,
      ease: "expo.out",
    });
  }, [active]);

  return (
    <section ref={section} id="hizmetler" aria-labelledby="hizmetler-baslik" className="relative px-5 py-40 sm:px-10 md:py-56">
      <div aria-hidden className="leak leak--cool right-[-15%] top-[20%] h-[560px] w-[560px]" />
      <div className="relative mx-auto max-w-[1500px]">
        <div className="mb-20 grid gap-10 md:mb-32 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p data-reveal className="mb-10 text-[11px] uppercase tracking-[0.3em] text-ash">
              (02) — Hizmetlerimiz
            </p>
            <RevealText
              id="hizmetler-baslik"
              text={"Fikirden etkiye,\n*tek stüdyo.*"}
              className="font-serif text-[clamp(3.2rem,8vw,8.5rem)] leading-[0.9] tracking-[-0.025em]"
              accentClassName="italic text-champagne"
            />
          </div>
          <p data-reveal className="max-w-sm text-[15px] leading-relaxed text-ash md:col-span-4 md:justify-self-end">
            Stratejiyi, tasarımı ve teknolojiyi aynı masada buluşturuyoruz. Markanız her temas noktasında aynı dili konuşur.
          </p>
        </div>

        <ul onPointerLeave={() => setActive(-1)}>
          {SERVICES.map((s, i) => (
            <li key={s.no} data-reveal>
              <div className="hairline" />
              <article
                onPointerEnter={() => setActive(i)}
                className="group grid gap-6 py-10 md:grid-cols-12 md:items-center md:py-14"
              >
                <span className="text-[11px] tracking-[0.3em] text-ash md:col-span-1">{s.no}</span>
                <h3 className="font-serif text-[clamp(2.4rem,5.6vw,5.6rem)] leading-[0.95] tracking-[-0.02em] text-ivory/55 transition-[color,transform] duration-700 ease-expo group-hover:translate-x-6 group-hover:text-ivory md:col-span-7">
                  {s.title} <span className="italic text-champagne/70 transition-colors duration-700 group-hover:text-champagne">{s.accent}</span>
                </h3>
                <div className="md:col-span-4">
                  <p className="text-[15px] leading-relaxed text-ash transition-colors duration-500 group-hover:text-ivory/85">{s.body}</p>
                  <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-ash/80">{s.tags.join(" · ")}</p>
                </div>
              </article>
            </li>
          ))}
          <li aria-hidden className="hairline" />
        </ul>
      </div>

      {/* Floating preview (fine pointers only; decorative) */}
      <div
        ref={preview}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-20 hidden h-[340px] w-[260px] overflow-hidden rounded-sm opacity-0 [clip-path:inset(50%_50%_50%_50%)] [@media(hover:hover)_and_(pointer:fine)]:block"
      >
        {SERVICES.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.no}
            src={s.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-expo"
            style={{ opacity: active === i ? 1 : 0, transform: active === i ? "scale(1)" : "scale(1.15)" }}
          />
        ))}
        <div className="absolute inset-0 bg-void/15" />
      </div>
    </section>
  );
}

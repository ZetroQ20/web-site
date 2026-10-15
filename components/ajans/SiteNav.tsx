"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import Magnetic from "@/components/Magnetic";
import { NAV, STUDIO } from "@/lib/ajans-content";

/**
 * Minimal bar in `mix-blend-difference`, so it reads over any section. It slides away
 * while scrolling down and returns on the way up. Full-screen menu on phones.
 */
export default function SiteNav({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(() => {
    if (!ready) return;
    gsap.fromTo(ref.current, { yPercent: -100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: "expo.out", delay: 0.6 });
    const hide = gsap.to(ref.current, { yPercent: -110, duration: 0.5, ease: "power3.out", paused: true });
    ScrollTrigger.create({
      start: 200,
      end: "max",
      onUpdate: (self) => (self.direction === 1 ? hide.play() : hide.reverse()),
      onLeaveBack: () => hide.reverse(),
    });
  }, [ready]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header ref={ref} className="fixed inset-x-0 top-0 z-[100] text-white opacity-0 mix-blend-difference">
        <nav aria-label="Ana menü" className="flex items-center justify-between px-5 py-6 sm:px-10 sm:py-8">
          <a href="#top" className="font-serif text-2xl tracking-tight" aria-label={`${STUDIO.name} — başa dön`}>
            {STUDIO.mark}
          </a>
          <span className="hidden text-[11px] uppercase tracking-[0.3em] text-white/60 lg:block">
            {STUDIO.city} · 37.78° N
          </span>
          <ul className="hidden items-center gap-2 md:flex">
            {NAV.map((l) => (
              <li key={l.href}>
                <Magnetic strength={0.4}>
                  <a href={l.href} className="block px-4 py-3 text-[12px] uppercase tracking-[0.22em] text-white/80 transition-colors duration-300 hover:text-white">
                    {l.label}
                  </a>
                </Magnetic>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobil-menu"
            className="min-h-11 px-2 text-[12px] uppercase tracking-[0.22em] md:hidden"
          >
            Menü
          </button>
        </nav>
      </header>

      <div
        id="mobil-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        hidden={!open}
        className="fixed inset-0 z-[150] flex flex-col bg-void px-6 pb-10 pt-6 md:hidden"
      >
        <div className="flex items-center justify-between">
          <span className="font-serif text-2xl">{STUDIO.mark}</span>
          <button type="button" onClick={() => setOpen(false)} className="min-h-11 px-2 text-[12px] uppercase tracking-[0.22em]">
            Kapat
          </button>
        </div>
        <ul className="mt-auto">
          {NAV.map((l, i) => (
            <li key={l.href} className="border-t border-ivory/10">
              <a href={l.href} onClick={() => setOpen(false)} className="flex items-baseline justify-between py-4 font-serif text-5xl">
                {l.label}
                <span className="font-sans text-xs text-ash">0{i + 1}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

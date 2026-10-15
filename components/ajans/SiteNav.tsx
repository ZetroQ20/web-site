"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { NAV, STUDIO } from "@/lib/ajans-content";
import { cn } from "@/lib/utils";

/** Fixed bar: clear over the hero, frosted glass once the page scrolls. Full-screen menu on phones. */
export default function SiteNav() {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useGSAP(() => {
    ScrollTrigger.create({ start: 80, end: "max", onToggle: (self) => setScrolled(self.isActive) });
    if (!prefersReducedMotion()) {
      gsap.from(ref.current, { yPercent: -120, opacity: 0, duration: 1.1, ease: "expo.out", delay: 0.2 });
    }
  });

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
      <header ref={ref} className="fixed inset-x-0 top-0 z-[100] px-4 pt-4 sm:px-6">
        <nav
          aria-label="Ana menü"
          className={cn(
            "mx-auto flex max-w-[1400px] items-center justify-between gap-6 rounded-full px-5 py-2.5 transition-[background-color,border-color,box-shadow] duration-500 ease-expo sm:px-6",
            scrolled ? "glass shadow-[0_10px_40px_-12px_rgba(0,0,0,0.7)]" : "border border-transparent"
          )}
        >
          <a href="#top" className="font-display text-lg font-medium tracking-wide" aria-label={`${STUDIO.name} — başa dön`}>
            {STUDIO.mark}
          </a>
          <ul className="hidden items-center gap-8 md:flex">
            {NAV.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="link-draw py-1 text-sm text-ink/75 transition-colors duration-200 hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a href="#iletisim" className="btn-fill btn-fill--solid hidden !min-h-10 whitespace-nowrap !px-5 text-sm sm:inline-flex">
              Projeye Başla <ArrowUpRight size={16} aria-hidden />
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Menüyü aç"
              aria-expanded={open}
              aria-controls="mobil-menu"
              className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 md:hidden"
            >
              <Menu size={20} aria-hidden />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobil-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        hidden={!open}
        className="fixed inset-0 z-[150] flex flex-col bg-paper/95 px-6 pb-10 pt-6 backdrop-blur-xl md:hidden"
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-medium">{STUDIO.mark}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Menüyü kapat"
            className="grid h-11 w-11 place-items-center rounded-full border border-ink/20"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        <ul className="mt-auto space-y-2">
          {NAV.map((l, i) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 py-2 font-display text-5xl font-medium tracking-[-0.04em]"
              >
                <span className="text-sm font-normal text-mist">0{i + 1}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href="#iletisim" onClick={() => setOpen(false)} className="btn-fill btn-fill--solid mt-10 w-full">
          Projeye Başla <ArrowUpRight size={18} aria-hidden />
        </a>
      </div>
    </>
  );
}

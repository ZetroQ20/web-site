"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollToTarget, useLenis } from "./providers/SmoothScroll";
import Magnetic from "./Magnetic";
import { Monogram } from "./icons";

const LINKS = [
  { href: "#hizmetler", label: "Hizmetler" },
  { href: "#galeri", label: "Galeri" },
  { href: "#iletisim", label: "İletişim" },
];

export default function Navbar({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const bar = root.current!;
      // Glass + compact state once the visitor leaves the hero top.
      const st = ScrollTrigger.create({
        start: 80,
        end: "max",
        onEnter: () => bar.setAttribute("data-scrolled", ""),
        onLeaveBack: () => bar.removeAttribute("data-scrolled"),
      });
      // Hide on fast downward scroll, return on upward scroll.
      const hide = ScrollTrigger.create({
        start: 600,
        end: "max",
        onUpdate: (self) =>
          gsap.to(bar, { yPercent: self.direction === 1 && self.getVelocity() > 900 ? -120 : 0, duration: 0.6, ease: "power3.out", overwrite: "auto" }),
        onLeaveBack: () => gsap.to(bar, { yPercent: 0, duration: 0.6, overwrite: "auto" }),
      });
      return () => {
        st.kill();
        hide.kill();
      };
    },
    { scope: root }
  );

  useGSAP(
    () => {
      if (!ready) return;
      gsap.fromTo(
        gsap.utils.selector(root)(".nav-item"),
        { yPercent: -140, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 1.2, ease: "expo.out", stagger: 0.08, delay: 0.6 }
      );
    },
    { scope: root, dependencies: [ready] }
  );

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollToTarget(lenis, href);
  };

  return (
    <header
      ref={root}
      className="group/nav fixed inset-x-0 top-0 z-[100] px-4 pt-4 transition-[padding] duration-700 ease-silk data-[scrolled]:pt-3 md:px-8 md:pt-6"
    >
      <nav
        className="mx-auto flex max-w-[1600px] items-center justify-between rounded-full border border-transparent px-4 py-3 transition-all duration-700 ease-silk group-data-[scrolled]/nav:max-w-[1200px] group-data-[scrolled]/nav:border-gold/15 group-data-[scrolled]/nav:bg-noir/45 group-data-[scrolled]/nav:py-2 group-data-[scrolled]/nav:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] group-data-[scrolled]/nav:backdrop-blur-xl md:px-6"
        aria-label="Ana menü"
      >
        <a href="#top" onClick={(e) => go(e, "#top")} className="nav-item invisible flex items-center gap-3" aria-label="THE GRACE — başa dön">
          <Monogram className="h-8 w-8 text-gold md:h-9 md:w-9 transition-transform duration-700 ease-silk group-data-[scrolled]/nav:h-7 group-data-[scrolled]/nav:w-7" />
          <span className="flex flex-col leading-none">
            <span className="whitespace-nowrap font-display text-sm tracking-[0.22em] text-bone transition-all duration-700 group-data-[scrolled]/nav:text-sm md:text-lg md:tracking-[0.28em] md:group-data-[scrolled]/nav:text-base">THE GRACE</span>
            <span className="mt-1 text-[8px] tracking-[0.5em] text-gold/80">HAIR | BEAUTY</span>
          </span>
        </a>

        <ul className="hidden items-center gap-10 md:flex">
          {LINKS.map((l) => (
            <li key={l.href} className="nav-item invisible">
              <a
                href={l.href}
                onClick={(e) => go(e, l.href)}
                className="group relative text-[11px] uppercase tracking-[0.32em] text-bone/70 transition-colors duration-500 hover:text-gold-light"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-right scale-x-0 bg-gold transition-transform duration-500 ease-silk group-hover:origin-left group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-item invisible">
          <Magnetic strength={0.3}>
            <a href="#iletisim" onClick={(e) => go(e, "#iletisim")} className="btn-aura !px-5 !py-3 md:!px-7" data-cursor="RANDEVU">
              <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_#C5A880]" />
              Randevu Al
            </a>
          </Magnetic>
        </div>
      </nav>
    </header>
  );
}

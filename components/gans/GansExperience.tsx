"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import SmoothScroll from "../providers/SmoothScroll";
import Cursor from "../Cursor";
import GansHero from "./GansHero";
import NotesFilm from "./NotesFilm";
import Manifesto from "./Manifesto";
import Craft from "./Craft";
import Reserve from "./Reserve";
import { ArrowUpRight } from "../icons";
import { GANS, GANS_OPTIONS, NOTE_ACTS, formatTry, whatsappHref } from "@/lib/gans";

const MARQUEE = NOTE_ACTS.flatMap((t) => t.notes.map((n) => n.name));

function Marquee() {
  const row = [...MARQUEE, ...MARQUEE];
  return (
    <div className="relative overflow-hidden border-y border-gold/10 py-7" aria-hidden>
      <div className="animate-marquee flex w-max gap-12 whitespace-nowrap font-serif text-3xl italic text-bone/25 md:text-5xl">
        {row.map((n, i) => (
          <span key={i} className="flex items-center gap-12">
            {n}
            <span className="h-1.5 w-1.5 rotate-45 bg-gold/50" />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Thin gold progress line + a reserve bar that slides up once the hero is behind. */
function ScrollChrome() {
  const reduce = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [visible, setVisible] = useState(false);

  // Show once the hero is behind; step aside while the full reserve card is on screen.
  useMotionValueEvent(scrollY, "change", (y) => {
    const reserve = document.getElementById("rezerve")?.getBoundingClientRect();
    const atReserve = !!reserve && reserve.top < window.innerHeight * 0.75;
    setVisible(y > window.innerHeight * 0.7 && !atReserve);
  });
  const from = GANS_OPTIONS[0];

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-gradient-to-r from-gold-deep via-gold-light to-gold"
      />
      <motion.div
        initial={false}
        animate={visible ? { y: 0, opacity: 1 } : { y: 120, opacity: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={!visible}
        inert={!visible}
        className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-xl items-center justify-between gap-4 rounded-full border border-gold/25 bg-[#0d110a]/80 py-2 pl-6 pr-2 backdrop-blur-xl md:bottom-6"
      >
        <div className="min-w-0">
          <p className="truncate font-display text-sm tracking-[0.2em] text-gold-light">
            {GANS.brand} <span className="font-serif italic tracking-normal text-bone/80">{GANS.name}</span>
          </p>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-bone/50">{formatTry(from.price)}&apos;den</p>
        </div>
        <a
          href={whatsappHref(from.label)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-aura btn-aura--solid !px-5 !py-3 !text-[0.62rem]"
        >
          Rezerve Et
        </a>
      </motion.div>
    </>
  );
}

export default function GansExperience() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  // Shared scroll reveal for everything marked `.reveal`.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.set(".reveal", { autoAlpha: 0 });
      ScrollTrigger.batch(".reveal", {
        start: "top 88%",
        once: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08, ease: "expo.out" }),
      });
    },
    { scope: root }
  );

  return (
    <SmoothScroll>
      <div ref={root} className="gans-page min-h-screen bg-[#070a05] text-bone">
        <Cursor />
        <div className="grain" aria-hidden />
        <ScrollChrome />

        <header className="fixed inset-x-0 top-0 z-40 border-b border-gold/10 bg-[#070a05]/60 backdrop-blur-md">
          <nav className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 py-4 sm:px-6 lg:px-10">
            <a href="#notalar" className="flex min-h-11 items-center text-[0.62rem] uppercase tracking-[0.36em] text-bone/60 transition-colors hover:text-gold-light">
              Notalar
            </a>
            <a href="#top" className="justify-self-center font-display text-xl tracking-[0.5em] text-gold-light" aria-label={`${GANS.brand} — başa dön`}>
              {GANS.brand}
            </a>
            <a href="#rezerve" className="flex min-h-11 items-center gap-1 justify-self-end text-[0.62rem] uppercase tracking-[0.36em] text-gold transition-colors hover:text-gold-light">
              Rezerve
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </nav>
        </header>

        <main className="overflow-x-clip">
          <GansHero />
          <Marquee />
          <NotesFilm />
          <Manifesto />
          <Craft />
          <Reserve />
        </main>

        <footer className="border-t border-gold/10 px-4 pb-32 pt-14 text-center">
          <p className="font-display text-2xl tracking-[0.5em] text-gold-light">{GANS.brand}</p>
          <p className="mt-3 text-[0.6rem] uppercase tracking-[0.4em] text-bone/40">
            {GANS.name} · {GANS.type} · © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </SmoothScroll>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { NOTE_TIERS } from "@/lib/gans";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Olfactory pyramid: a tablist whose active pill glides between tiers (shared layoutId). */
export default function ScentNotes() {
  const [active, setActive] = useState(NOTE_TIERS[0].id);
  const reduce = useReducedMotion();
  const tier = NOTE_TIERS.find((t) => t.id === active)!;

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = NOTE_TIERS[(i + dir + NOTE_TIERS.length) % NOTE_TIERS.length];
    setActive(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <section id="notalar" className="reveal-section relative mx-auto max-w-6xl px-4 py-28 sm:px-6 md:py-40 lg:px-10">
      <header className="mx-auto max-w-2xl text-center">
        <p className="reveal text-[0.7rem] uppercase tracking-[0.42em] text-gold">Koku Piramidi</p>
        <h2 className="reveal mt-5 font-serif text-[clamp(2.2rem,5vw,3.8rem)] leading-tight">
          Üç perdede <em className="text-gold-gradient">bir bahçe</em>
        </h2>
        <p className="reveal mx-auto mt-5 max-w-lg text-bone/65">
          Parfümörün kompozisyonu zamanla açılır: önce serin yapraklar, ardından beyaz çiçekler, en sonunda sıcak ahşap.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Koku notaları"
        className="reveal relative mx-auto mt-14 flex w-fit max-w-full gap-1 rounded-full border border-gold/20 bg-graphite/60 p-1.5 backdrop-blur"
      >
        {NOTE_TIERS.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls="note-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`relative min-h-11 rounded-full px-3 text-[0.6rem] uppercase tracking-[0.14em] transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-gold sm:px-6 sm:text-[0.68rem] sm:tracking-[0.24em] ${
                selected ? "text-noir" : "text-bone/65 hover:text-gold-light"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="note-pill"
                  className="absolute inset-0 -z-0 rounded-full bg-[linear-gradient(120deg,#a88a5e,#e4cfa6_55%,#c5a880)]"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 whitespace-nowrap">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div id="note-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="relative mt-14 min-h-[22rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tier.id}
            initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? undefined : { opacity: 0, y: -12, filter: "blur(4px)", transition: { duration: 0.25 } }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="text-center font-serif text-lg italic text-sand">
              <span className="mr-3 not-italic text-[0.65rem] uppercase tracking-[0.4em] text-gold">{tier.time}</span>
              {tier.mood}
            </p>
            <motion.ul
              className="mt-12 grid gap-5 sm:grid-cols-3"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.1 } } }}
            >
              {tier.notes.map((n, i) => (
                <motion.li
                  key={n.name}
                  variants={{
                    hidden: reduce ? {} : { opacity: 0, y: 26 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
                  }}
                  whileHover={reduce ? undefined : { y: -6 }}
                  className="group relative overflow-hidden rounded-[2px] border border-gold/15 bg-[linear-gradient(160deg,rgb(79_93_52/0.35),rgb(13_17_10/0.6))] px-7 py-10 text-center"
                >
                  <span aria-hidden className="absolute right-4 top-3 font-display text-xs text-gold/40">
                    0{i + 1}
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 -bottom-1/2 h-full bg-[radial-gradient(50%_50%_at_50%_100%,rgb(197_168_128/0.3),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <h3 className="relative font-serif text-2xl text-bone">{n.name}</h3>
                  {n.detail && (
                    <p className="relative mt-3 text-[0.65rem] uppercase tracking-[0.36em] text-gold/80">{n.detail}</p>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

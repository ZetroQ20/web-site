"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Magnetic from "../Magnetic";
import Botanical from "./Botanical";
import { WhatsApp } from "../icons";
import { GANS, GANS_OPTIONS, GANS_SPECS, RITUAL, formatTry } from "@/lib/gans";
import { SITE_CONFIG } from "@/lib/content";

export const whatsappHref = (optionLabel: string) =>
  `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(
    `Merhaba, ${GANS.brand} ${GANS.name} (${optionLabel}) için bir şişe rezerve etmek istiyorum.`
  )}`;

export default function Reserve() {
  const [optionId, setOptionId] = useState(GANS_OPTIONS[0].id);
  const reduce = useReducedMotion();
  const option = GANS_OPTIONS.find((o) => o.id === optionId)!;

  return (
    <section id="rezerve" className="reveal-section relative overflow-hidden py-28 md:py-40">
      <div aria-hidden className="glow left-1/2 top-1/3 h-[50vw] w-[50vw] -translate-x-1/2 opacity-50" />

      {/* Ritual */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <p className="reveal text-center text-[0.7rem] uppercase tracking-[0.42em] text-gold">Ritüel</p>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-[2px] border border-gold/15 bg-gold/15 md:grid-cols-3">
          {RITUAL.map((r) => (
            <li key={r.step} className="reveal bg-[#0d110a] px-8 py-10">
              <span className="font-display text-sm text-gold">{r.step}</span>
              <h3 className="mt-4 font-serif text-2xl">{r.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-7 text-bone/65">{r.text}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Purchase card */}
      <div className="relative mx-auto mt-28 max-w-3xl px-4 sm:px-6">
        <div className="reveal relative overflow-hidden rounded-[2px] border border-gold/30 bg-[linear-gradient(160deg,#3d4a2a,#232c18_55%,#151c0f)] px-6 py-14 text-center shadow-[0_50px_120px_-40px_rgb(0_0_0/0.9)] sm:px-14">
          <div aria-hidden className="pointer-events-none absolute inset-3 border border-gold/20" />
          <Botanical className="bot-static mx-auto h-24 w-12 text-gold/80" strokeClassName="" />

          <p className="mt-6 text-[0.65rem] uppercase tracking-[0.5em] text-gold/80">Nº {GANS.edition.number} / {GANS.edition.of}</p>
          <h2 className="mt-4 font-display text-5xl tracking-[0.12em] text-gold-gradient md:text-6xl">{GANS.brand}</h2>
          <p className="mt-2 font-serif text-2xl italic text-bone">{GANS.name}</p>

          <fieldset className="mt-10">
            <legend className="sr-only">Seçenek</legend>
            <div className="grid gap-3 text-left sm:grid-cols-2">
              {GANS_OPTIONS.map((o) => {
                const selected = o.id === optionId;
                return (
                  <label
                    key={o.id}
                    className={`relative block min-h-11 cursor-pointer rounded-[2px] border px-5 py-4 transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${
                      selected ? "border-gold/0" : "border-bone/15 hover:border-gold/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gans-option"
                      value={o.id}
                      checked={selected}
                      onChange={() => setOptionId(o.id)}
                      className="sr-only"
                    />
                    {selected && (
                      <motion.span
                        layoutId="option-ring"
                        aria-hidden
                        className="absolute inset-0 rounded-[2px] border border-gold bg-gold/[0.07] shadow-[0_0_30px_-8px_rgb(197_168_128/0.6)]"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative flex items-baseline justify-between gap-3">
                      <span className="font-serif text-lg text-bone">{o.label}</span>
                      <span className="font-display text-sm text-gold-light">{formatTry(o.price)}</span>
                    </span>
                    <span className="relative mt-1 block text-xs leading-5 text-bone/55">{o.detail}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-10 flex items-center justify-center gap-3" aria-live="polite">
            <span className="text-[0.65rem] uppercase tracking-[0.4em] text-bone/50">Toplam</span>
            <span className="relative inline-flex h-12 min-w-[8ch] items-center justify-center overflow-hidden font-display text-4xl text-gold-light">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={option.price}
                  initial={reduce ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {formatTry(option.price)}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>

          <div className="mt-10">
            <Magnetic>
              <motion.a
                href={whatsappHref(option.label)}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={reduce ? undefined : { scale: 0.97 }}
                className="btn-aura btn-aura--solid"
                data-cursor="REZERVE"
              >
                <WhatsApp className="h-4 w-4" />
                WhatsApp ile Rezerve Et
              </motion.a>
            </Magnetic>
            <p className="mt-5 text-xs text-bone/50">{GANS.delivery}</p>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-y-6 border-t border-gold/15 pt-8 sm:grid-cols-4">
            {GANS_SPECS.map((s) => (
              <div key={s.k}>
                <dt className="text-[0.6rem] uppercase tracking-[0.36em] text-gold/70">{s.k}</dt>
                <dd className="mt-2 text-sm text-bone/85">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

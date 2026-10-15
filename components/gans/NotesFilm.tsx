"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import Ingredient from "./Ingredients";
import { GoldDust } from "./Atmosphere";
import { GANS_BOTTLE, NOTE_ACTS, type NoteAct } from "@/lib/gans";

/** Where each act's three notes float around the bottle. */
const SLOTS = [
  "right-[4%] top-[16%] w-[26vmin] md:right-[14%] md:top-[12%] md:w-[22vmin]",
  "right-[10%] top-[50%] w-[20vmin] md:right-[22%] md:top-auto md:bottom-[12%] md:w-[18vmin]",
  "left-[4%] top-[14%] w-[22vmin] md:left-[16%] md:top-[14%] md:w-[17vmin]",
];
const ENTRY = [
  { x: 260, y: -140, rotate: 50 },
  { x: 320, y: 160, rotate: -40 },
  { x: -280, y: -120, rotate: -60 },
];

function NoteFigure({ note, slot, i }: { note: NoteAct["notes"][number]; slot: string; i: number }) {
  return (
    <figure className={`film-note absolute ${slot}`} data-i={i}>
      <Ingredient kind={note.kind} className="h-auto w-full drop-shadow-[0_25px_35px_rgb(0_0_0/0.55)]" />
      <figcaption className="mt-3 text-center">
        <span className="block font-serif text-sm text-bone md:text-lg">{note.name}</span>
        {note.origin && <span className="block text-[0.55rem] uppercase tracking-[0.36em] text-gold/80">{note.origin}</span>}
      </figcaption>
    </figure>
  );
}

/** Reduced motion: the same story as a calm, readable stack. */
function StaticNotes() {
  return (
    <section id="notalar" aria-label="Koku notaları" className="mx-auto max-w-6xl space-y-24 px-4 py-24 sm:px-6 lg:px-10">
      {NOTE_ACTS.map((a) => (
        <div key={a.id}>
          <p className="text-[0.65rem] uppercase tracking-[0.42em] text-gold">
            Perde {a.act} · {a.label}
          </p>
          <h3 className="mt-3 font-serif text-4xl">{a.title}</h3>
          <p className="mt-3 max-w-md text-bone/70">{a.mood}</p>
          <ul className="mt-10 grid grid-cols-3 gap-6">
            {a.notes.map((n) => (
              <li key={n.name} className="text-center">
                <Ingredient kind={n.kind} className="mx-auto h-auto w-full max-w-[9rem]" />
                <p className="mt-3 font-serif">{n.name}</p>
                {n.origin && <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold/80">{n.origin}</p>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/**
 * The commercial: the bottle holds centre stage while the scroll plays three acts.
 * Each act washes the scene in its own light and flies its notes in — then past the lens.
 */
function Film() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const acts = q(".film-act");
      const texts = q(".film-text");
      const dots = q(".film-dot");

      gsap.set(acts, { autoAlpha: 1 });
      gsap.set(texts, { autoAlpha: 0, y: 40 });
      gsap.set(q(".film-note"), { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 3.2}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.from(q(".film-bottle"), { scale: 0.85, yPercent: 10, filter: "brightness(0.2)", duration: 1 }, 0);

      NOTE_ACTS.forEach((act, ai) => {
        const at = 0.6 + ai * 3;
        const notes = acts[ai].querySelectorAll<HTMLElement>(".film-note");

        tl.to(q(".film-light"), { backgroundColor: act.light, duration: 1 }, at)
          .to(dots, { opacity: (i) => (i === ai ? 1 : 0.3), scale: (i) => (i === ai ? 1 : 0.7), duration: 0.4 }, at)
          .to(texts[ai], { autoAlpha: 1, y: 0, duration: 1 }, at + 0.2);

        notes.forEach((n, i) => {
          tl.fromTo(
            n,
            { autoAlpha: 0, x: ENTRY[i].x, y: ENTRY[i].y, rotate: ENTRY[i].rotate, scale: 0.4, filter: "blur(12px)" },
            { autoAlpha: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: "blur(0px)", duration: 1.3, ease: "expo.out" },
            at + 0.1 + i * 0.25
          );
        });

        // Hold, then everything flies past the camera.
        if (ai < NOTE_ACTS.length - 1) {
          tl.to(notes, { scale: 2.2, autoAlpha: 0, filter: "blur(16px)", duration: 1, ease: "power2.in", stagger: 0.08 }, at + 2.2)
            .to(texts[ai], { autoAlpha: 0, y: -40, duration: 0.8, ease: "power2.in" }, at + 2.2);
        }
      });

      tl.to(q(".film-bottle"), { scale: 1.06, duration: tl.duration() }, 0);
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="notalar"
      aria-label="Koku notaları"
      className="relative h-[100svh] overflow-hidden bg-[radial-gradient(100%_80%_at_50%_100%,#141c0f_0%,#070a05_70%)]"
    >
      <div aria-hidden className="film-light absolute left-1/2 top-1/2 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(150_190_110/0.2)] opacity-60 blur-[90px] max-md:blur-[50px]" />
      <GoldDust density={45} />

      <p className="absolute inset-x-0 top-20 z-10 text-center text-[0.65rem] uppercase tracking-[0.42em] text-gold md:top-24">Koku Piramidi</p>

      {/* Bottle */}
      <div className="absolute inset-0 z-[2] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={GANS_BOTTLE.src}
          width={GANS_BOTTLE.w}
          height={GANS_BOTTLE.h}
          alt=""
          loading="lazy"
          className="film-bottle product-glow h-[58svh] w-auto max-md:h-[46svh]"
        />
      </div>

      {/* Acts */}
      {NOTE_ACTS.map((act) => (
        <div key={act.id} className="film-act invisible absolute inset-0 z-[3]">
          {act.notes.map((n, i) => (
            <NoteFigure key={n.name} note={n} slot={SLOTS[i]} i={i} />
          ))}
        </div>
      ))}

      {/* Act copy */}
      <div className="absolute inset-x-0 bottom-0 z-[4] mx-auto max-w-7xl px-4 pb-10 sm:px-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:pb-0 lg:px-10">
        <div className="relative max-w-sm max-md:mx-auto max-md:text-center">
          {NOTE_ACTS.map((act, i) => (
            <div key={act.id} className={`film-text ${i === 0 ? "relative" : "absolute inset-x-0 top-0"}`}>
              <p className="text-[0.65rem] uppercase tracking-[0.42em] text-gold">
                Perde {act.act} · {act.label}
              </p>
              <h2 className="mt-3 font-serif text-5xl text-bone md:text-7xl">{act.title}</h2>
              <p className="mt-4 text-[0.95rem] leading-7 text-bone/70">{act.mood}</p>
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden className="absolute right-4 top-1/2 z-[4] flex -translate-y-1/2 flex-col gap-3 md:right-10">
        {NOTE_ACTS.map((a) => (
          <span key={a.id} className="film-dot grid h-8 w-8 place-items-center rounded-full border border-gold/60 font-display text-[0.6rem] text-gold-light opacity-30">
            {a.act}
          </span>
        ))}
      </div>
    </section>
  );
}

export default function NotesFilm() {
  const reduce = useReducedMotion();
  return reduce ? <StaticNotes /> : <Film />;
}

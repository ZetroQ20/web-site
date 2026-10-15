"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { STUDIO } from "@/lib/ajans-content";

/**
 * Opening curtain: the studio mark rises letter by letter while a counter runs to 100,
 * then the whole panel lifts away. Calls `onDone` as the curtain starts to lift so the
 * hero can begin its own entrance underneath.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        setGone(true);
        onDone();
        return;
      }
      const counter = { v: 0 };
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".pl-char", { yPercent: 115, duration: 1.1, stagger: 0.055 })
        .from(".pl-line", { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "power3.inOut" }, 0)
        .to(counter, {
          v: 100,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            if (countRef.current) countRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        }, 0)
        .to(".pl-char", { yPercent: -115, duration: 0.7, stagger: 0.03, ease: "power3.in" }, "+=0.1")
        .add(onDone, "-=0.1")
        .to(ref.current, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "-=0.15")
        .add(() => setGone(true));
    },
    { scope: ref }
  );

  if (gone) return null;

  return (
    <div ref={ref} className="fixed inset-0 z-[300] flex flex-col justify-between bg-void px-6 py-8 sm:px-10" aria-hidden>
      <span className="text-[11px] uppercase tracking-[0.3em] text-ash">{STUDIO.tagline}</span>
      <div>
        <div className="flex font-serif text-[clamp(64px,16vw,220px)] leading-[0.85] tracking-[-0.02em] text-ivory">
          {Array.from(STUDIO.name).map((c, i) => (
            <span key={i} className="mask">
              <span className="pl-char">{c}</span>
            </span>
          ))}
        </div>
        <div className="pl-line mt-8 h-px w-full bg-ivory/25" />
      </div>
      <div className="flex items-end justify-between text-[11px] uppercase tracking-[0.3em] text-ash">
        <span>{STUDIO.city} — TR</span>
        <span ref={countRef} className="font-serif text-5xl normal-case tracking-normal text-ivory tabular-nums">
          000
        </span>
      </div>
    </div>
  );
}

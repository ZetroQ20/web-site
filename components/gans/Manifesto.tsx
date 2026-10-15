"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { MANIFESTO } from "@/lib/gans";

/** One sentence, lit word by word as it scrolls through — the brand's voice between two scenes. */
export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        gsap.utils.toArray(".mf-word", root.current),
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 45%", scrub: true },
        }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative mx-auto max-w-5xl px-4 py-32 text-center sm:px-6 md:py-48 lg:px-10">
      <span aria-hidden className="mx-auto mb-10 block h-16 w-px bg-gradient-to-b from-transparent to-gold/60" />
      <p className="font-serif text-[clamp(2rem,5.2vw,4.4rem)] leading-[1.15] text-bone">
        {MANIFESTO.split(" ").map((w, i) => (
          <span key={i} className="mf-word">
            {w}{" "}
          </span>
        ))}
      </p>
      <p className="mt-10 font-display text-sm tracking-[0.6em] text-gold">GANS</p>
    </section>
  );
}

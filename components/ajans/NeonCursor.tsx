"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, isFinePointer } from "@/lib/gsap";

/**
 * Neon ring + dot cursor. Links and buttons grow the ring; anything with
 * `data-cursor="LABEL"` turns it into a filled acid disc carrying the label.
 */
export default function NeonCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isFinePointer()) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");
    return () => document.documentElement.classList.remove("has-cursor");
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const ring = ringRef.current!;
    const dot = dotRef.current!;

    gsap.set([ring, dot], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power2.out" });

    let state: "idle" | "link" | "label" = "idle";
    const apply = (next: typeof state, text = "") => {
      if (next === state && next !== "label") return;
      state = next;
      setLabel(text);
      const size = next === "label" ? 104 : next === "link" ? 62 : 36;
      gsap.to(ring, {
        width: size,
        height: size,
        backgroundColor: next === "label" ? "rgba(198,255,61,0.95)" : next === "link" ? "rgba(198,255,61,0.08)" : "rgba(198,255,61,0)",
        borderColor: next === "idle" ? "rgba(237,239,234,0.45)" : "rgba(198,255,61,0.9)",
        duration: 0.45,
        ease: "expo.out",
      });
      gsap.to(dot, { scale: next === "idle" ? 1 : 0, duration: 0.25 });
    };

    const onMove = (e: PointerEvent) => {
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };
    const onOver = (e: Event) => {
      const t = e.target as HTMLElement | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      if (labelled) return apply("label", labelled.dataset.cursor ?? "");
      if (t?.closest("a, button, select, label, input, textarea, [role='button']")) return apply("link");
      apply("idle");
    };
    const hide = () => gsap.to([ring, dot], { opacity: 0, duration: 0.25 });
    const show = () => gsap.to([ring, dot], { opacity: 1, duration: 0.25 });
    const onDown = () => gsap.to(ring, { scale: 0.82, duration: 0.18 });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.5, ease: "elastic.out(1,0.5)" });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    document.documentElement.addEventListener("pointerenter", show);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", hide);
      document.documentElement.removeEventListener("pointerenter", show);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[200] flex h-9 w-9 items-center justify-center rounded-full border border-ink/45"
      >
        <span
          className={`select-none font-display text-[11px] font-bold uppercase tracking-[0.18em] text-void transition-opacity duration-200 ${
            label ? "opacity-100" : "opacity-0"
          }`}
        >
          {label}
        </span>
      </div>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[201] h-1.5 w-1.5 rounded-full bg-acid shadow-[0_0_12px_2px_rgba(198,255,61,0.7)]"
      />
    </>
  );
}

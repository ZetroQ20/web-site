"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, isFinePointer } from "@/lib/gsap";

/**
 * Circular cursor. Any element with `data-cursor="LABEL"` expands it with a label;
 * plain links/buttons get a softer hover state.
 */
export default function Cursor() {
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
    const ringX = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3.out" });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });

    let state: "idle" | "link" | "label" = "idle";

    const apply = (next: typeof state, text = "") => {
      if (next === state && next !== "label") return;
      state = next;
      setLabel(text);
      gsap.to(ring, {
        width: next === "label" ? 96 : next === "link" ? 56 : 34,
        height: next === "label" ? 96 : next === "link" ? 56 : 34,
        backgroundColor: next === "label" ? "rgba(197,168,128,0.92)" : "rgba(197,168,128,0)",
        borderColor: next === "idle" ? "rgba(197,168,128,0.55)" : "rgba(228,207,166,0.9)",
        duration: 0.5,
        ease: "expo.out",
      });
      gsap.to(dot, { scale: next === "idle" ? 1 : 0, duration: 0.3 });
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
      if (t?.closest("a, button, select, label, [role='button']")) return apply("link");
      apply("idle");
    };

    const onLeaveWindow = () => gsap.to([ring, dot], { opacity: 0, duration: 0.3 });
    const onEnterWindow = () => gsap.to([ring, dot], { opacity: 1, duration: 0.3 });
    const onDown = () => gsap.to(ring, { scale: 0.85, duration: 0.2 });
    const onUp = () => gsap.to(ring, { scale: 1, duration: 0.4, ease: "elastic.out(1,0.5)" });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    document.documentElement.addEventListener("pointerenter", onEnterWindow);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      document.documentElement.removeEventListener("pointerenter", onEnterWindow);
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
        className="pointer-events-none fixed left-0 top-0 z-[200] flex h-[34px] w-[34px] items-center justify-center rounded-full border border-gold/55 mix-blend-normal backdrop-blur-[1px]"
      >
        <span
          className={`select-none font-sans text-[10px] font-semibold tracking-[0.28em] text-noir transition-opacity duration-300 ${
            label ? "opacity-100" : "opacity-0"
          }`}
        >
          {label}
        </span>
      </div>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[201] h-[5px] w-[5px] rounded-full bg-gold-light"
      />
    </>
  );
}

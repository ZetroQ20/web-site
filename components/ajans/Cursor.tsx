"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, isFinePointer } from "@/lib/gsap";

/**
 * Difference cursor: a white disc with `mix-blend-mode: difference`, so it always
 * shows as the inverse of whatever is under it. Links and buttons grow it; elements
 * with `data-cursor="LABEL"` turn it into a large disc carrying the label.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
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
    const el = ref.current!;
    gsap.set(el, { xPercent: -50, yPercent: -50, x: -200, y: -200 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });

    let state = "idle";
    const apply = (next: "idle" | "link" | "label", text = "") => {
      if (next === state && next !== "label") return;
      state = next;
      setLabel(text);
      gsap.to(el, { scale: next === "label" ? 7 : next === "link" ? 4 : 1, duration: 0.55, ease: "expo.out" });
    };
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const onOver = (e: Event) => {
      const t = e.target as HTMLElement | null;
      const labelled = t?.closest<HTMLElement>("[data-cursor]");
      if (labelled) return apply("label", labelled.dataset.cursor ?? "");
      if (t?.closest("a, button, [role='button'], canvas, input, textarea")) return apply("link");
      apply("idle");
    };
    const hide = () => gsap.to(el, { opacity: 0, duration: 0.3 });
    const show = () => gsap.to(el, { opacity: 1, duration: 0.3 });
    const onDown = () => gsap.to(el, { scale: "*=0.8", duration: 0.2 });
    const onUp = () => gsap.to(el, { scale: state === "label" ? 7 : state === "link" ? 4 : 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });

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
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[400] grid h-4 w-4 place-items-center rounded-full bg-white mix-blend-difference"
    >
      {/* scaled ×7 with the disc, so it is set tiny */}
      <span
        className={`select-none whitespace-nowrap font-sans text-[2px] font-semibold uppercase tracking-[0.2em] text-black transition-opacity duration-200 ${
          label ? "opacity-100" : "opacity-0"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

/**
 * Gold dust drifting upward through the light, drawn on one canvas.
 * Pauses when off-screen or the tab is hidden; a single still frame under reduced motion.
 */
export function GoldDust({ density = 70, className = "" }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const small = window.matchMedia("(max-width: 767px)").matches;
    const count = Math.round(density * (small ? 0.5 : 1));
    let w = 0;
    let h = 0;

    type Mote = { x: number; y: number; r: number; vy: number; vx: number; tw: number; ph: number };
    let motes: Mote[] = [];
    const seed = () => {
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.8,
        vy: 0.08 + Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.15,
        tw: 0.5 + Math.random() * 1.5,
        ph: Math.random() * Math.PI * 2,
      }));
    };
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * 0.001 * m.tw + m.ph));
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 4);
        g.addColorStop(0, `rgba(243,227,195,${a})`);
        g.addColorStop(0.4, `rgba(197,168,128,${a * 0.45})`);
        g.addColorStop(1, "rgba(197,168,128,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    resize();
    if (prefersReducedMotion()) {
      draw(0);
      return;
    }

    let raf = 0;
    let visible = true;
    const loop = (t: number) => {
      for (const m of motes) {
        m.y -= m.vy;
        m.x += m.vx + Math.sin(t * 0.0004 + m.ph) * 0.12;
        if (m.y < -10) {
          m.y = h + 10;
          m.x = Math.random() * w;
        }
      }
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", start);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    start();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}

/** Layered fog banks + a slow-breathing light shaft. Pure CSS, see `.fog` / `.beam` in globals.css. */
export function Fog({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="beam" />
      <div className="beam beam--soft" />
      <div className="fog fog--a" />
      <div className="fog fog--b" />
      <div className="fog fog--c" />
    </div>
  );
}

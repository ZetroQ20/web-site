"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { GANS_IMAGE } from "@/lib/gans";

const SPRING = { stiffness: 140, damping: 18, mass: 0.6 };

/**
 * The product in an arched gallery frame that tilts toward the pointer in 3D,
 * with a light sheen that follows the cursor like a reflection on glass.
 */
export default function TiltProduct({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);

  const rotateY = useTransform(sx, [0, 1], [-9, 9]);
  const rotateX = useTransform(sy, [0, 1], [7, -7]);
  const imgX = useTransform(sx, [0, 1], [10, -10]);
  const imgY = useTransform(sy, [0, 1], [8, -8]);
  const glareX = useTransform(sx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(sy, [0, 1], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(60% 50% at ${glareX} ${glareY}, rgb(255 244 220 / 0.28), transparent 70%)`;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = ref.current!.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div className={`[perspective:1400px] ${className}`}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative aspect-[4/5] w-full"
        data-cursor="KEŞFET"
      >
        {/* outer hairline arch */}
        <div className="pointer-events-none absolute -inset-3 rounded-t-[999px] border border-gold/25 md:-inset-5" />
        <div className="gans-frame relative h-full w-full overflow-hidden rounded-t-[999px] bg-[#e9e0d2] shadow-[0_60px_120px_-40px_rgb(0_0_0/0.9),0_0_0_1px_rgb(197_168_128/0.45)]">
          <motion.img
            src={GANS_IMAGE}
            alt="GANS Garden Whisper çubuklu oda kokusu ve zeytin yeşili varak baskılı kutusu"
            width={916}
            height={898}
            fetchPriority="high"
            decoding="async"
            draggable={false}
            style={reduce ? undefined : { x: imgX, y: imgY }}
            className="gans-img absolute inset-[-4%] h-[108%] w-[108%] max-w-none object-cover object-[42%_50%]"
          />
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ backgroundImage: glare }} />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgb(13_17_10/0.45))]" />
        </div>
      </motion.div>
    </div>
  );
}

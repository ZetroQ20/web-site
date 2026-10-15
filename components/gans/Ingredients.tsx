import { useId } from "react";
import type { IngredientKind } from "@/lib/gans";

type P = { className?: string };

/** Citrus cross-section: rind, pith and translucent segments — the "sliced fruit" of a fragrance ad. */
function Citrus({ className, rind, flesh, half = false }: P & { rind: [string, string]; flesh: [string, string]; half?: boolean }) {
  const id = useId();
  const segs = 11;
  return (
    <svg viewBox={half ? "0 0 200 106" : "0 0 200 200"} className={className} aria-hidden>
      <defs>
        <radialGradient id={`${id}r`} cx="40%" cy="35%">
          <stop offset="0" stopColor={rind[0]} />
          <stop offset="1" stopColor={rind[1]} />
        </radialGradient>
        <radialGradient id={`${id}f`} cx="50%" cy="50%">
          <stop offset="0" stopColor={flesh[0]} />
          <stop offset="1" stopColor={flesh[1]} />
        </radialGradient>
        {half && (
          <clipPath id={`${id}c`}>
            <rect x="0" y="0" width="200" height="104" />
          </clipPath>
        )}
      </defs>
      <g clipPath={half ? `url(#${id}c)` : undefined}>
        <circle cx="100" cy="100" r="92" fill={`url(#${id}r)`} />
        <circle cx="100" cy="100" r="84" fill="#f3ecd0" />
        {Array.from({ length: segs }).map((_, i) => {
          const a0 = (i / segs) * Math.PI * 2 + 0.04;
          const a1 = ((i + 1) / segs) * Math.PI * 2 - 0.04;
          const r = 78;
          const p = (a: number, rr: number) => `${100 + Math.cos(a) * rr} ${100 + Math.sin(a) * rr}`;
          return (
            <path
              key={i}
              d={`M${p((a0 + a1) / 2, 7)} L${p(a0, r)} A${r} ${r} 0 0 1 ${p(a1, r)} Z`}
              fill={`url(#${id}f)`}
              opacity="0.88"
            />
          );
        })}
        <circle cx="100" cy="100" r="6" fill="#f6efd8" />
        <ellipse cx="72" cy="66" rx="30" ry="12" fill="#fff" opacity="0.18" transform="rotate(-35 72 66)" />
      </g>
    </svg>
  );
}

function FigLeaf({ className }: P) {
  const id = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7d9a4c" />
          <stop offset="0.6" stopColor="#3f5a26" />
          <stop offset="1" stopColor="#1f3013" />
        </linearGradient>
      </defs>
      <path
        d="M100 190 C 96 170 92 160 80 150 C 50 160 18 140 22 110 C 40 118 52 112 54 102 C 30 92 18 64 34 44 C 48 60 64 64 72 58 C 66 36 78 14 100 8 C 122 14 134 36 128 58 C 136 64 152 60 166 44 C 182 64 170 92 146 102 C 148 112 160 118 178 110 C 182 140 150 160 120 150 C 108 160 104 170 100 190 Z"
        fill={`url(#${id})`}
      />
      <g stroke="#d9c38f" strokeWidth="1.1" fill="none" opacity="0.7" strokeLinecap="round">
        <path d="M100 186 L100 22" />
        <path d="M100 120 L44 70 M100 130 L156 70 M100 140 L40 118 M100 148 L160 118 M100 96 L78 50 M100 96 L122 50" />
      </g>
    </svg>
  );
}

function Leaves({ className, colors, count = 3, slim = false }: P & { colors: [string, string]; count?: number; slim?: boolean }) {
  const id = useId();
  const w = slim ? 13 : 20;
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <path d="M100 190 C 100 150 100 110 102 30" stroke="#8a7a52" strokeWidth="2" fill="none" />
      {Array.from({ length: count }).map((_, i) => {
        const y = 150 - i * (110 / count);
        const side = i % 2 ? 1 : -1;
        return (
          <g key={i} transform={`translate(101 ${y}) rotate(${side * (48 - i * 6)})`}>
            <path d={`M0 0 C ${w} -20, ${w} -56, 0 -78 C ${-w} -56, ${-w} -20, 0 0 Z`} fill={`url(#${id})`} />
            <path d="M0 -4 L0 -70" stroke="#e8dcb8" strokeWidth="0.8" opacity="0.5" />
          </g>
        );
      })}
      <g transform="translate(102 34)">
        <path d={`M0 0 C ${w} -16, ${w * 0.8} -40, 0 -30 C ${-w * 0.8} -40, ${-w} -16, 0 0 Z`} fill={`url(#${id})`} />
      </g>
    </svg>
  );
}

function Jasmine({ className }: P) {
  const id = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <defs>
        <radialGradient id={id} cx="50%" cy="80%">
          <stop offset="0" stopColor="#fffdf5" />
          <stop offset="1" stopColor="#e9e1cb" />
        </radialGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor="#fff8e0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff8e0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill={`url(#${id}g)`} />
      {Array.from({ length: 5 }).map((_, i) => (
        <path
          key={i}
          transform={`rotate(${i * 72} 100 100)`}
          d="M100 100 C 120 82, 122 40, 100 22 C 78 40, 80 82, 100 100 Z"
          fill={`url(#${id})`}
          stroke="#d8ccae"
          strokeWidth="0.8"
        />
      ))}
      <circle cx="100" cy="100" r="9" fill="#e7c766" />
      <circle cx="100" cy="100" r="4" fill="#b8902e" />
    </svg>
  );
}

function Vetiver({ className }: P) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <g fill="none" strokeLinecap="round">
        {Array.from({ length: 16 }).map((_, i) => {
          const x = 70 + i * 4;
          const sway = (i % 2 ? 1 : -1) * (14 + (i % 5) * 6);
          return (
            <path
              key={i}
              d={`M${x} 18 C ${x + sway} 70, ${x - sway} 130, ${x + sway / 2} 188`}
              stroke={i % 3 ? "#a67a42" : "#d2a868"}
              strokeWidth={1.4 + (i % 3) * 0.6}
              opacity={0.75 + (i % 4) * 0.06}
            />
          );
        })}
      </g>
      <rect x="64" y="86" width="72" height="12" rx="3" fill="#c5a880" opacity="0.9" />
      <rect x="64" y="90" width="72" height="2" fill="#8f7550" />
    </svg>
  );
}

function Cedar({ className }: P) {
  const id = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#e8b878" />
          <stop offset="0.7" stopColor="#b77a3e" />
          <stop offset="1" stopColor="#8a5527" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="100" rx="92" ry="88" fill="#4a2e18" />
      <ellipse cx="100" cy="100" rx="82" ry="78" fill={`url(#${id})`} />
      {[14, 24, 34, 44, 54, 64, 73].map((r, i) => (
        <ellipse key={r} cx={98 + i * 0.6} cy={102 - i * 0.4} rx={r} ry={r * 0.95} fill="none" stroke="#7a4a22" strokeWidth={i % 2 ? 0.8 : 1.4} opacity="0.55" />
      ))}
      <path d="M100 100 L176 70" stroke="#3a2210" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

function Musk({ className }: P) {
  const id = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#f3ead6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f3ead6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="86" cy="104" r="70" fill={`url(#${id})`} />
      <circle cx="124" cy="92" r="56" fill={`url(#${id})`} />
      <path d="M150 46 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 z" fill="#f3e3c3" />
      <path d="M50 150 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" fill="#f3e3c3" opacity="0.8" />
    </svg>
  );
}

export default function Ingredient({ kind, className = "" }: { kind: IngredientKind; className?: string }) {
  switch (kind) {
    case "bergamot":
      return <Citrus className={className} rind={["#cbd35e", "#5d7a24"]} flesh={["#fff7c8", "#e3cf5c"]} />;
    case "mandarin":
      return <Citrus className={className} rind={["#b7c95a", "#5f8a2a"]} flesh={["#ffd28a", "#f09a3a"]} half />;
    case "leaf":
      return <FigLeaf className={className} />;
    case "tea":
      return <Leaves className={className} colors={["#b9cf8a", "#5d7a35"]} count={4} />;
    case "sage":
      return <Leaves className={className} colors={["#c3cdb6", "#6f7f62"]} count={5} slim />;
    case "jasmine":
      return <Jasmine className={className} />;
    case "vetiver":
      return <Vetiver className={className} />;
    case "cedar":
      return <Cedar className={className} />;
    case "musk":
      return <Musk className={className} />;
  }
}

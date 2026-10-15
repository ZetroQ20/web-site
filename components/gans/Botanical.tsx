type Props = { className?: string; strokeClassName?: string };

/**
 * Gold-foil sprig echoing the emblem on the GANS box. Every path uses pathLength=1
 * so GSAP can draw it in by animating stroke-dashoffset from 1 → 0.
 */
export default function Botanical({ className = "", strokeClassName = "bot-stroke" }: Props) {
  const leaves = [
    // [x, y, rotation, scale] along the stem
    [60, 52, -38, 1.0],
    [60, 52, 38, 1.0],
    [60, 86, -42, 1.15],
    [60, 86, 42, 1.15],
    [60, 122, -46, 1.25],
    [60, 122, 46, 1.25],
    [60, 158, -50, 1.3],
    [60, 158, 50, 1.3],
    [60, 30, 0, 0.9],
  ] as const;

  return (
    <svg viewBox="0 0 120 220" fill="none" className={className} aria-hidden>
      <path
        className={strokeClassName}
        pathLength={1}
        d="M60 214 C 58 170, 62 120, 60 70 S 60 30, 60 18"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeDasharray="1"
      />
      {leaves.map(([x, y, r, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
          <path
            className={strokeClassName}
            pathLength={1}
            d="M0 0 C 6 -6, 7 -18, 0 -28 C -7 -18, -6 -6, 0 0 Z M0 -2 L0 -24"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeLinejoin="round"
            strokeDasharray="1"
          />
        </g>
      ))}
      {[
        [48, 104],
        [73, 140],
        [46, 176],
        [75, 68],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.6" fill="currentColor" className="bot-berry" />
      ))}
    </svg>
  );
}

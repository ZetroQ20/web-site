import type { Service } from "@/lib/content";
import Photo from "../Photo";

// Phones & tablets: the frame takes all the height the text leaves (clamped) and is as
// wide as the screen allows — but never wider than it is tall (portrait on most phones, at
// most square on short ones), so portrait salon photos never get a letterbox crop.
// Desktop (lg+): the golden rectangle (1 : 1.618). Widths are always set explicitly —
// Safari/iOS gives a height-only aspect-ratio box whose children are all absolutely
// positioned an intrinsic width of 0, which once hid every service photo on iPhone.
const FRAME =
  "relative h-[clamp(11rem,calc(100svh-24rem),60svh)] w-[min(calc(100vw-2.5rem),30rem,clamp(11rem,calc(100svh-24rem),60svh))] overflow-hidden bg-graphite md:h-[clamp(16rem,calc(100svh-37rem),56svh)] md:w-[min(calc(100vw-6rem),30rem,clamp(16rem,calc(100svh-37rem),56svh))] lg:h-[74svh] lg:w-[calc(74svh*0.618)] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]";

/** Rendered width: almost the full screen on phones/tablets, ~46% of the height on desktop. */
const SIZES = "(min-width: 1024px) 30vw, (min-width: 768px) 30rem, 92vw";

/** Golden-rectangle frame whose inner layers depend on the service's scene. */
export default function ServiceMedia({ service }: { service: Service }) {
  const alt = `${service.title} — ${service.subtitle}`;
  // Crop slightly above centre so faces and hair stay in frame.
  const img = "absolute inset-0 h-full w-full object-cover object-[50%_35%]";

  return (
    <div className="vip-frame relative" data-cursor="KEŞFET">
      {/* Offset hairline frame for the asymmetric luxury feel */}
      <div className="pointer-events-none absolute -right-2 -top-2 bottom-4 left-4 border border-gold/25 lg:-right-6 lg:-top-6 lg:bottom-6 lg:left-6" />

      {service.effect === "wave" && (
        <div className={FRAME}>
          <svg className="absolute h-0 w-0" aria-hidden>
            <filter id="fx-liquid" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.004 0.03" numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="120" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
          <div className="fx-wave-media absolute inset-0">
            <Photo sizes={SIZES} src={service.image} alt={alt} className={`fx-wave-img ${img} sepia-[12%]`} />
          </div>
          <Glaze />
        </div>
      )}

      {service.effect === "glow" && (
        <div className={FRAME}>
          {/* One photo only — the matte/dewy contrast is pure CSS layered on top of it */}
          <Photo sizes={SIZES} src={service.image} alt={alt} className={`${img} brightness-[1.04] saturate-[1.1]`} />
          {/* Matte veil (backdrop-filter) with a circular hole that blooms from the centre */}
          <div className="fx-glow-veil absolute inset-0 [--r:0%] [backdrop-filter:saturate(0.35)_brightness(0.62)_contrast(0.9)] [-webkit-backdrop-filter:saturate(0.35)_brightness(0.62)_contrast(0.9)] [mask-image:radial-gradient(circle_at_50%_40%,transparent_var(--r),#000_calc(var(--r)_+_1%))] [-webkit-mask-image:radial-gradient(circle_at_50%_40%,transparent_var(--r),#000_calc(var(--r)_+_1%))]" />
          {/* Dewy sheen that warms up as the skin "wakes" */}
          <div className="fx-glow-sheen pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_40%,rgba(255,244,225,0.22),transparent_70%)] opacity-0 mix-blend-screen" />
          {/* Positioned wrapper keeps Tailwind's translate apart from GSAP's scale */}
          <div className="pointer-events-none absolute left-1/2 top-[40%] z-10 aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2">
            <div className="fx-glow-halo h-full w-full rounded-full border border-gold-light/50 opacity-0 shadow-[0_0_40px_8px_rgba(228,207,166,0.35),inset_0_0_40px_8px_rgba(228,207,166,0.25)]" />
          </div>
          <Glaze />
        </div>
      )}

      {service.effect === "laser" && (
        <div className={FRAME}>
          <Photo sizes={SIZES} src={service.image} alt={alt} className={img} />
          {/* Frosted glass (backdrop-filter over the single photo) — clipped away above the laser */}
          <div className="fx-laser-frost absolute inset-0 bg-[linear-gradient(180deg,rgba(239,232,220,0.08),rgba(197,168,128,0.12))] [backdrop-filter:blur(22px)_brightness(0.78)_saturate(0.55)] [-webkit-backdrop-filter:blur(22px)_brightness(0.78)_saturate(0.55)]" />
          {/* Full-height track: translating it by y% moves the beam on the compositor */}
          <div className="fx-laser-line pointer-events-none absolute inset-0 z-10 opacity-0 will-change-transform">
            <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-gold/25" />
            <div className="h-[2px] bg-[linear-gradient(90deg,transparent,#c5a880_12%,#fff6e3_50%,#c5a880_88%,transparent)] shadow-[0_0_8px_2px_rgba(243,227,195,0.9),0_0_28px_6px_rgba(197,168,128,0.7),0_0_60px_14px_rgba(197,168,128,0.35)]" />
          </div>
          <Glaze />
        </div>
      )}

      {service.effect === "golden" && (
        <div className={FRAME}>
          <Photo sizes={SIZES} src={service.image} alt={alt} className={`fx-golden-img ${img}`} />
          <Glaze />
          <svg viewBox="0 0 1000 1618" preserveAspectRatio="xMidYMid slice" className="fx-golden-guides pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden>
            <g fill="none" stroke="#E4CFA6" strokeWidth="1" vectorEffect="non-scaling-stroke">
              {/* Golden spiral */}
              <path className="fx-golden-stroke" pathLength={1} strokeDasharray="1" strokeWidth="1.4" d="M0,0 A1000,1000 0 0 1 1000,1000 A618,618 0 0 1 382,1618 A382,382 0 0 1 0,1236 A236,236 0 0 1 236,1000 A146,146 0 0 1 382,1146 A90,90 0 0 1 292,1236" />
              {/* Golden rectangle subdivisions */}
              <path className="fx-golden-stroke" pathLength={1} strokeDasharray="1" opacity="0.7" d="M0,1000 H1000 M382,1000 V1618 M0,1236 H382 M236,1000 V1236 M236,1146 H382 M292,1146 V1236" />
              {/* Symmetry axis + facial thirds */}
              <path className="fx-golden-stroke" pathLength={1} strokeDasharray="1" opacity="0.55" d="M500,0 V1618 M0,539 H1000 M0,1079 H1000" />
              <circle className="fx-golden-stroke" pathLength={1} strokeDasharray="1" opacity="0.6" cx="500" cy="618" r="309" />
            </g>
            <g fill="#E4CFA6" fontFamily="var(--font-manrope), sans-serif" fontSize="26" letterSpacing="6">
              <text className="fx-golden-label" x="30" y="985">1 : 1.618</text>
              <text className="fx-golden-label" x="520" y="40">φ AXIS</text>
              <text className="fx-golden-label" x="30" y="1062">1/3</text>
            </g>
          </svg>
        </div>
      )}

      {service.effect === "gloss" && (
        <div className={`fx-gloss-frame ${FRAME}`}>
          <Photo sizes={SIZES} src={service.image} alt={alt} className={`fx-gloss-img ${img}`} />
          <Glaze />
          <div className="fx-gloss-wide pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(135deg,transparent_38%,rgba(255,248,235,0.08)_44%,rgba(255,248,235,0.42)_50%,rgba(255,248,235,0.08)_56%,transparent_62%)] bg-[length:200%_200%] bg-[position:100%_100%] opacity-0 mix-blend-screen" />
          <div className="fx-gloss-sharp pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(135deg,transparent_48.6%,rgba(255,255,255,0.95)_50%,transparent_51.4%)] bg-[length:200%_200%] bg-[position:100%_100%] opacity-0 mix-blend-screen" />
          <svg viewBox="0 0 40 40" className="fx-gloss-spark pointer-events-none absolute bottom-[14%] right-[14%] z-20 h-10 w-10 opacity-0" aria-hidden>
            <path d="M20 0 L22.5 17.5 L40 20 L22.5 22.5 L20 40 L17.5 22.5 L0 20 L17.5 17.5 Z" fill="#fff8eb" />
          </svg>
        </div>
      )}
    </div>
  );
}

function Glaze() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(150deg,rgba(197,168,128,0.22),transparent_40%)] mix-blend-screen" />
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  /** Rendered width hint for the responsive srcset, e.g. "(min-width: 768px) 30vw, 60vw". */
  sizes?: string;
};

const WIDTHS = [480, 720, 960, 1280, 1600];

/** Unsplash serves any width on demand — offer a ladder so phones fetch small files. */
function srcSetFor(src: string) {
  if (!src.includes("images.unsplash.com")) return undefined;
  const max = Number(new URL(src).searchParams.get("w")) || 1600;
  return WIDTHS.filter((w) => w <= max)
    .map((w) => `${src.replace(/([?&])w=\d+/, `$1w=${w}`)} ${w}w`)
    .join(", ");
}

/**
 * Remote photo with a graceful noir/gold fallback if the image can't load,
 * so a missing asset never leaves a broken frame in the composition.
 */
export default function Photo({ src, alt, className = "", priority = false, sizes = "100vw" }: Props) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // A request can fail before hydration attaches onError. `complete && naturalWidth === 0`
  // alone is not proof: WebKit reports exactly that for lazy images it hasn't fetched yet,
  // which would wrongly blank every photo on iOS. Confirm with a real probe request instead.
  useEffect(() => {
    const img = ref.current;
    if (!img || !img.complete || img.naturalWidth !== 0) return;
    let alive = true;
    const probe = new Image();
    probe.onerror = () => alive && setFailed(true);
    // Same srcset/sizes as the real image → same small file, shared via the HTTP cache.
    probe.sizes = img.sizes;
    probe.srcset = img.srcset;
    probe.src = src;
    return () => {
      alive = false;
      probe.onerror = null;
    };
  }, [src]);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} bg-[radial-gradient(120%_90%_at_70%_20%,#3a3024_0%,#141414_45%,#030303_100%)]`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- transforms/scale are animated by GSAP
    <img
      ref={ref}
      src={src}
      srcSet={srcSetFor(src)}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

/**
 * Remote photo with a graceful noir/gold fallback if the image can't load,
 * so a missing asset never leaves a broken frame in the composition.
 */
export default function Photo({ src, alt, className = "", priority = false }: Props) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // The request may fail before hydration attaches onError — check once mounted.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

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

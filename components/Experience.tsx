"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import SmoothScroll, { useLenis } from "./providers/SmoothScroll";
import Preloader from "./Preloader";
import Cursor from "./Cursor";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Services from "./Services";
import Gallery from "./Gallery";
import FounderVision from "./FounderVision";
import Testimonials from "./Testimonials";
import BeforeAfterSlider from "./BeforeAfterSlider";
import Booking from "./Booking";
import { RitualProvider } from "./RitualBuilderModal";

/** Holds scroll still until the curtain opens, then recalculates every trigger. */
function ScrollGate({ ready }: { ready: boolean }) {
  const lenis = useLenis();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = ready ? "" : "hidden";
    if (lenis) (ready ? lenis.start() : lenis.stop());
    if (ready) requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [ready, lenis]);

  // Fonts settling can shift layout; keep pin distances exact.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return null;
}

export default function Experience() {
  const [ready, setReady] = useState(false);

  return (
    <SmoothScroll>
      {/* Ritual Builder: opened from the navbar, service cards and booking section */}
      <RitualProvider>
        <ScrollGate ready={ready} />
        <Preloader onReveal={() => setReady(true)} />
        <Cursor />
        <div className="grain" aria-hidden />
        <Navbar ready={ready} />
        <main className="overflow-x-clip">
          <Hero ready={ready} />
          <Services />
          <FounderVision />
          <Gallery />
          <Testimonials />
          <BeforeAfterSlider />
          <Booking />
        </main>
      </RitualProvider>
    </SmoothScroll>
  );
}

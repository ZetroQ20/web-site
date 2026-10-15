"use client";

import { useEffect, useRef, useState } from "react";
import SculptureHero from "@/components/ui/liquid-sculpture-hero";
import SmoothScroll, { scrollToTarget, useLenis } from "@/components/providers/SmoothScroll";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { HERO, NAV, STUDIO } from "@/lib/ajans-content";
import Preloader from "./Preloader";
import Cursor from "./Cursor";
import SiteNav from "./SiteNav";
import Marquee from "./Marquee";
import Manifesto from "./Manifesto";
import Services from "./Services";
import Work from "./Work";
import Rhythm from "./Rhythm";
import Finale from "./Finale";

/** Routes every in-page `#anchor` click through Lenis; holds scroll still until the curtain lifts. */
function ScrollControl({ ready }: { ready: boolean }) {
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

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = a?.getAttribute("href");
      if (!hash || hash === "#") return;
      e.preventDefault();
      if (hash === "#top") {
        if (lenis) lenis.scrollTo(0, { duration: 2 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      } else scrollToTarget(lenis, hash);
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);

  return null;
}

export default function AgencySite() {
  const scope = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Scroll-driven choreography (runs once on mount; reveals wait for the curtain)
  useGSAP(
    () => {
      if (prefersReducedMotion()) return; // everything renders in its final state

      // Hero copy is hidden until the curtain lifts
      gsap.set(".ajans-hero .sh-line", { yPercent: 105, clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(".ajans-hero .sh-eyebrow, .ajans-hero .sh-aside", { opacity: 0, y: 40 });

      // Headings: each word rises out of its own mask
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        gsap.from(el.querySelectorAll(".mask > span"), {
          yPercent: 110,
          rotate: 4,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      // Supporting copy fades up
      gsap.set("[data-reveal]", { opacity: 0, y: 50 });
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 90%",
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.4, ease: "expo.out", stagger: 0.1, overwrite: true }),
      });

      // Project frames: clip open, drift at their own pace, images parallax inside
      gsap.utils.toArray<HTMLElement>("[data-clip]").forEach((el) => {
        gsap.from(el, {
          clipPath: "inset(18% 10% 18% 10%)",
          duration: 1.6,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-float]").forEach((el) => {
        const f = Number(el.dataset.float) || 0;
        gsap.fromTo(el, { y: f * 18 }, { y: -f * 18, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        const s = Number(el.dataset.speed) || 0;
        gsap.fromTo(el, { yPercent: -s }, { yPercent: s, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });

      // Manifesto: words brighten from shadow to ivory with the scroll
      const words = gsap.utils.toArray<HTMLElement>("[data-words] .word");
      if (words.length) {
        gsap.fromTo(
          words,
          { opacity: 0.12 },
          { opacity: 1, ease: "none", stagger: 0.06, scrollTrigger: { trigger: "[data-words]", start: "top 75%", end: "bottom 40%", scrub: 0.8 } }
        );
      }

      // Marquee leans with scroll velocity
      const skew = gsap.quickTo("[data-skew]", "skewX", { duration: 0.6, ease: "power3.out" });
      ScrollTrigger.create({
        onUpdate: (self) => skew(gsap.utils.clamp(-10, 10, self.getVelocity() / -260)),
      });

      // Hero sinks and dims as it scrolls away
      gsap.to(".ajans-hero .sh-content", {
        yPercent: -22,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: ".ajans-hero", start: "top top", end: "bottom top", scrub: true },
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope }
  );

  // Hero entrance once the curtain lifts
  useGSAP(
    () => {
      if (!ready || prefersReducedMotion()) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.to(".ajans-hero .sh-line", { yPercent: 0, clipPath: "inset(0% 0% -10% 0%)", duration: 1.6, stagger: 0.12 }, 0.15)
        .to(".ajans-hero .sh-eyebrow", { opacity: 1, y: 0, duration: 1.2 }, 0.1)
        .to(".ajans-hero .sh-aside", { opacity: 1, y: 0, duration: 1.4 }, 0.5);
    },
    { scope, dependencies: [ready] }
  );

  return (
    <SmoothScroll>
      <ScrollControl ready={ready} />
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      <div className="grain" aria-hidden />
      <a
        href="#icerik"
        className="sr-only z-[300] bg-ivory px-4 py-2 text-void focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        İçeriğe geç
      </a>
      <SiteNav ready={ready} />
      <div ref={scope} id="top">
        <main className="overflow-x-clip">
          <SculptureHero
            className="ajans-hero"
            theme="dark"
            themeToggle={false}
            // Equal to the sculpture image's own backdrop, so the material renders at full brightness
            darkBackground="#111110"
            textColor="#E0E0E0"
            headingFont="'Instrument Serif', 'Playfair Display', serif"
            accentFont="'Instrument Serif', 'Playfair Display', serif"
            bodyFont="'Manrope Variable', 'Manrope', sans-serif"
            loadFonts={false}
            brand={STUDIO.mark}
            navLinks={NAV}
            navCta={{ label: "İletişim", href: "#iletisim" }}
            eyebrow={HERO.eyebrow}
            headline={HERO.headline}
            headlineAccent={HERO.accent}
            body={HERO.body}
            primaryCta={{ label: "Projelerimiz", href: "#isler" }}
            secondaryCta={{ label: "Bizimle İletişime Geçin", href: "#iletisim" }}
            hint="Formun üzerinde gezinin"
            hintTouch="Forma dokunun"
            imageAlt="Parçacıklardan oluşan, imleçle sıvılaşan soyut metalik heykel"
            backdropText="üçdağ"
            ambient
            ambientIntensity={0.9}
            liquid={1.3}
            intro
          />
          <div id="icerik" />
          <Marquee />
          <Manifesto />
          <Services />
          <Work />
          <Rhythm />
          <Finale />
        </main>
      </div>
    </SmoothScroll>
  );
}

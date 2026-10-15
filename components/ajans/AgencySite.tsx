"use client";

import { useEffect, useRef } from "react";
import SculptureHero from "@/components/ui/liquid-sculpture-hero";
import SmoothScroll, { scrollToTarget, useLenis } from "@/components/providers/SmoothScroll";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { NAV, STUDIO } from "@/lib/ajans-content";
import NeonCursor from "./NeonCursor";
import SiteNav from "./SiteNav";
import Marquee from "./Marquee";
import Services from "./Services";
import Work from "./Work";
import Philosophy from "./Philosophy";
import Contact from "./Contact";

/** Routes every in-page `#anchor` click through Lenis for one consistent smooth scroll. */
function AnchorScroll() {
  const lenis = useLenis();
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = a?.getAttribute("href");
      if (!hash || hash === "#") return;
      e.preventDefault();
      if (hash === "#top") {
        if (lenis) lenis.scrollTo(0, { duration: 1.6 });
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

  useGSAP(
    () => {
      if (prefersReducedMotion()) return; // everything renders in its final state

      // Load-in: hero copy rises line by line
      gsap.from(".sh-eyebrow, .sh-h1 .sh-line, .sh-aside", {
        yPercent: 40,
        y: 30,
        opacity: 0,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.09,
        delay: 0.35,
      });

      // Scroll reveals (fade + slide-up), batched so siblings stagger together
      gsap.set("[data-reveal]", { opacity: 0, y: 48 });
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, overwrite: true }),
      });

      // Parallax: each project image drifts at its own `data-speed` (in %)
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        const speed = Number(el.dataset.speed) || 0;
        gsap.fromTo(
          el,
          { yPercent: -speed },
          { yPercent: speed, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } }
        );
      });

      // Manifesto words brighten as the paragraph passes through the viewport
      const words = gsap.utils.toArray<HTMLElement>("[data-words] .word");
      if (words.length) {
        gsap.fromTo(
          words,
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.05,
            scrollTrigger: { trigger: "[data-words]", start: "top 80%", end: "bottom 45%", scrub: 0.6 },
          }
        );
      }

      // Hero drifts back and dims as it scrolls away
      gsap.to(".ajans-hero .sh-content", {
        yPercent: -18,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: ".ajans-hero", start: "top top", end: "bottom top", scrub: true },
      });

      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope }
  );

  return (
    <SmoothScroll>
      <AnchorScroll />
      <NeonCursor />
      <div className="grain" aria-hidden />
      <a
        href="#icerik"
        className="sr-only z-[300] rounded-full bg-acid px-4 py-2 text-void focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        İçeriğe geç
      </a>
      <SiteNav />
      <div ref={scope} id="top">
        <main className="overflow-x-clip">
          <SculptureHero
            className="ajans-hero"
            theme="dark"
            themeToggle={false}
            darkBackground="#060708"
            textColor="#EDEFEA"
            accentColor="#C6FF3D"
            headingFont="'Syne Variable', 'Syne', system-ui, sans-serif"
            accentFont="'Instrument Serif', 'Times New Roman', serif"
            bodyFont="'Inter Variable', 'Inter', system-ui, sans-serif"
            loadFonts={false}
            brand={STUDIO.mark}
            navLinks={NAV}
            navCta={{ label: "Projeye Başla", href: "#iletisim" }}
            eyebrow={`${STUDIO.city} — ${STUDIO.tagline}`}
            headline={"Markanızı\ngeleceğe taşıyoruz."}
            headlineAccent="geleceğe"
            body="Web tasarım, reklam, grafik ve yapay zekâ destekli görsel içerikte global kalite. Cesur fikirleri ölçülebilir sonuçlara dönüştürüyoruz."
            primaryCta={{ label: "Projelerimiz", href: "#isler" }}
            secondaryCta={{ label: "Bizimle İletişime Geçin", href: "#iletisim" }}
            hint="Formun üzerinde gezinin"
            hintTouch="Forma dokunun"
            imageAlt="Parçacıklardan oluşan, imleçle sıvılaşan soyut metalik heykel"
            backdropText="üçdağ"
            ambient
            ambientIntensity={0.8}
            intro
          />
          <div id="icerik" />
          <Marquee />
          <Services />
          <Work />
          <Philosophy />
          <Contact />
        </main>
      </div>
    </SmoothScroll>
  );
}

import { ArrowUpRight } from "lucide-react";
import Magnetic from "@/components/Magnetic";
import { SOCIALS, STUDIO } from "@/lib/ajans-content";
import RevealText from "./RevealText";

/** Screen-filling "Let's Talk." with a giant magnetic orb, then a whisper-thin footer. */
export default function Finale() {
  return (
    <section id="iletisim" aria-labelledby="iletisim-baslik" className="relative flex min-h-[100svh] flex-col overflow-hidden px-5 pt-40 sm:px-10">
      <div aria-hidden className="leak left-[-10%] bottom-[-20%] h-[800px] w-[800px]" />
      <div aria-hidden className="leak leak--cool right-[-10%] top-[0%] h-[600px] w-[600px]" />

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-center">
        <p data-reveal className="mb-10 text-[11px] uppercase tracking-[0.3em] text-ash">
          (05) — Bir sonraki proje sizinki olabilir
        </p>
        <RevealText
          id="iletisim-baslik"
          text={"Let's *Talk.*"}
          className="font-serif text-[clamp(5rem,21vw,24rem)] leading-[0.8] tracking-[-0.04em]"
          accentClassName="italic text-champagne"
        />

        <div className="mt-16 flex flex-col items-start gap-12 md:mt-20 md:flex-row md:items-center md:justify-between">
          <a href={`mailto:${STUDIO.email}`} className="link-draw font-serif text-[clamp(1.6rem,3.4vw,3rem)] italic text-ivory/90">
            {STUDIO.email}
          </a>
          <Magnetic strength={0.35}>
            <a href={`mailto:${STUDIO.email}?subject=${encodeURIComponent("Yeni proje")}`} className="orb w-[clamp(150px,16vw,220px)]" data-cursor="Yaz">
              <span className="flex flex-col items-center gap-2">
                <ArrowUpRight size={22} strokeWidth={1.4} aria-hidden />
                Projeye Başla
              </span>
            </a>
          </Magnetic>
        </div>
      </div>

      <footer className="relative mx-auto mt-24 w-full max-w-[1600px] pb-8">
        <div className="hairline mb-6" />
        <div className="flex flex-col gap-5 text-[11px] uppercase tracking-[0.24em] text-ash md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} {STUDIO.name} — {STUDIO.city}</span>
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-draw py-2 text-ivory/80 hover:text-ivory">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#top" className="link-draw self-start py-2 text-ivory/80 md:self-auto">
            Başa dön ↑
          </a>
        </div>
      </footer>
    </section>
  );
}

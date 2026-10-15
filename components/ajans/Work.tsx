import Photo from "@/components/Photo";
import { PROJECTS, type Project } from "@/lib/ajans-content";
import { cn } from "@/lib/utils";
import RevealText from "./RevealText";

/**
 * Overlapping editorial gallery — no grid of equal boxes. Each slot sets a width,
 * horizontal offset and a negative top margin (desktop) so frames tuck under and
 * over each other; the frame drifts (`data-float`) and its image parallaxes inside
 * it (`data-speed`), both driven from AgencySite.
 */
const SLOTS: Record<Project["slot"], { box: string; ratio: string; float: number; z: string }> = {
  0: { box: "md:w-[58%]", ratio: "aspect-[4/3]", float: 4, z: "z-10" },
  1: { box: "md:ml-[54%] md:w-[38%] md:-mt-[24vw]", ratio: "aspect-[3/4]", float: -6, z: "z-20" },
  2: { box: "md:ml-[6%] md:w-[34%] md:-mt-[14vw]", ratio: "aspect-square", float: 7, z: "z-20" },
  3: { box: "md:ml-[36%] md:w-[44%] md:-mt-[8vw]", ratio: "aspect-[4/5]", float: -4, z: "z-10" },
  4: { box: "md:ml-[10%] md:w-[64%] md:-mt-[10vw]", ratio: "aspect-[16/10]", float: 5, z: "z-30" },
};
// phones: a staggered single column
const MOBILE = ["w-full", "ml-[12%] w-[88%]", "w-[86%]", "ml-[10%] w-[90%]", "w-full"];

export default function Work() {
  return (
    <section id="isler" aria-labelledby="isler-baslik" className="relative px-5 py-40 sm:px-10 md:py-56">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-24 flex flex-wrap items-end justify-between gap-10 md:mb-40">
          <div>
            <p data-reveal className="mb-10 text-[11px] uppercase tracking-[0.3em] text-ash">
              (03) — Seçilmiş İşler
            </p>
            <RevealText
              id="isler-baslik"
              text={"İz bırakan\n*projeler*"}
              className="font-serif text-[clamp(3.2rem,9vw,10rem)] leading-[0.88] tracking-[-0.025em]"
              accentClassName="italic text-champagne"
            />
          </div>
          <p data-reveal className="max-w-xs text-[15px] leading-relaxed text-ash">
            Her proje bir markanın en iyi hâline duyduğumuz merak. Bir seçki — tamamı talep üzerine.
          </p>
        </div>

        <ul className="relative">
          {PROJECTS.map((p, i) => {
            const slot = SLOTS[p.slot];
            return (
              <li key={p.name} className={cn("relative mb-20 md:mb-0", MOBILE[i], "md:ml-0", slot.box, slot.z)}>
                <div data-float={slot.float}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="İncele"
                    aria-label={`${p.name} — ${p.category} (yeni sekmede açılır)`}
                    className="group block"
                  >
                    <div className={cn("relative overflow-hidden bg-coal", slot.ratio)} data-clip>
                      <div data-speed={p.speed} className="absolute -inset-y-[14%] inset-x-0">
                        <Photo
                          src={p.image}
                          alt={`${p.name} proje görseli`}
                          sizes="(min-width: 768px) 50vw, 92vw"
                          className="h-full w-full scale-[1.02] object-cover grayscale-[35%] transition-[transform,filter] duration-[1.4s] ease-expo group-hover:scale-[1.09] group-hover:grayscale-0"
                        />
                      </div>
                      <div className="absolute inset-0 bg-void/10 transition-colors duration-700 group-hover:bg-void/45" />
                    </div>
                    <div className="mt-5 flex items-baseline justify-between gap-6">
                      <h3 className="font-serif text-3xl tracking-[-0.01em] transition-transform duration-700 ease-expo group-hover:translate-x-2 md:text-4xl">
                        {p.name}
                      </h3>
                      <span className="text-[11px] tracking-[0.3em] text-ash">{p.year}</span>
                    </div>
                    <p className="mt-1 text-[12px] uppercase tracking-[0.2em] text-ash">
                      {p.category} <span className="text-ash/60">— {p.tech.join(" · ")}</span>
                    </p>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

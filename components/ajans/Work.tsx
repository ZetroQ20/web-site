import { ArrowUpRight } from "lucide-react";
import Photo from "@/components/Photo";
import { PROJECTS, type Project } from "@/lib/ajans-content";
import { cn } from "@/lib/utils";

const SPAN: Record<Project["layout"], string> = {
  wide: "md:col-span-7 aspect-[4/3] md:aspect-[16/11]",
  tall: "md:col-span-5 aspect-[4/5] md:aspect-[4/5.4]",
  square: "md:col-span-5 aspect-square",
};

// Desktop offsets give the gallery its staggered, editorial rhythm
const OFFSET = ["", "md:mt-40", "md:-mt-10", "md:mt-24", "md:-mt-6"];

export default function Work() {
  return (
    <section id="isler" aria-labelledby="isler-baslik" className="relative px-5 py-28 sm:px-8 md:py-40">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p data-reveal className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-mist">
              <span className="h-px w-8 bg-ink/50" /> Seçilmiş İşler
            </p>
            <h2 id="isler-baslik" data-reveal className="font-display text-[clamp(2.6rem,7vw,6.5rem)] font-medium leading-[0.92] tracking-[-0.04em]">
              İz bırakan <br />
              <span className="text-stroke">projeler</span>
            </h2>
          </div>
          <a data-reveal href="https://www.behance.net/" target="_blank" rel="noopener noreferrer" className="btn-fill">
            Tüm Portfolyo <ArrowUpRight size={18} aria-hidden />
          </a>
        </div>

        <ul className="mt-16 grid gap-6 md:mt-24 md:grid-cols-12 md:gap-x-8 md:gap-y-10">
          {PROJECTS.map((p, i) => (
            <li key={p.name} className={cn(SPAN[p.layout].split(" ")[0], OFFSET[i] ?? "")} data-reveal>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="İNCELE"
                aria-label={`${p.name} — ${p.category} projesini incele (yeni sekme)`}
                className="group block"
              >
                <div className={cn("relative overflow-hidden rounded-[24px] bg-stone", SPAN[p.layout].split(" ").slice(1).join(" "))}>
                  {/* the inner layer drifts at its own speed for parallax depth */}
                  <div data-speed={p.speed} className="absolute -inset-y-[12%] inset-x-0">
                    <Photo
                      src={p.image}
                      alt={`${p.name} proje görseli`}
                      sizes="(min-width: 768px) 55vw, 92vw"
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-expo group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  {/* Hover / focus panel: name + technologies */}
                  <div className="absolute inset-x-4 bottom-4 translate-y-2 rounded-2xl glass p-5 opacity-0 transition-all duration-500 ease-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 max-md:translate-y-0 max-md:opacity-100">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-2xl font-medium tracking-[-0.04em]">{p.name}</h3>
                        <p className="mt-1 text-sm text-mist">{p.category}</p>
                      </div>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-paper">
                        <ArrowUpRight size={18} aria-hidden />
                      </span>
                    </div>
                    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Kullanılan teknolojiler">
                      {p.tech.map((t) => (
                        <li key={t} className="rounded-full border border-ink/15 px-2.5 py-1 text-[11px] uppercase tracking-wider text-ink/85">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <span className="absolute left-5 top-5 rounded-full bg-paper/75 px-3 py-1 text-xs text-ink backdrop-blur">{p.year}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

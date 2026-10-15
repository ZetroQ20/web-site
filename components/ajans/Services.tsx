"use client";

import type { PointerEvent } from "react";
import { MonitorSmartphone, Megaphone, PenTool, Sparkles, type LucideIcon } from "lucide-react";
import { SERVICES, type Service } from "@/lib/ajans-content";

const ICONS: Record<Service["icon"], LucideIcon> = {
  web: MonitorSmartphone,
  ads: Megaphone,
  graphic: PenTool,
  ai: Sparkles,
};

/** Feed the pointer position to the card's CSS spotlight. */
function track(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

export default function Services() {
  return (
    <section id="hizmetler" aria-labelledby="hizmetler-baslik" className="relative overflow-hidden px-5 py-28 sm:px-8 md:py-40">
      <div aria-hidden className="neon-blob -left-40 top-24 h-[420px] w-[420px] bg-volt/40" />
      <div aria-hidden className="neon-blob -right-32 bottom-10 h-[380px] w-[380px] bg-acid/25 [animation-delay:-8s]" />

      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p data-reveal className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-mist">
              <span className="h-px w-8 bg-acid" /> Hizmetlerimiz
            </p>
            <h2 id="hizmetler-baslik" data-reveal className="font-display text-[clamp(2.6rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
              Fikirden etkiye, <span className="font-serif font-normal italic text-acid">tek stüdyo.</span>
            </h2>
          </div>
          <p data-reveal className="max-w-md text-lg leading-relaxed text-mist md:col-span-4 md:col-start-9">
            Stratejiyi, tasarımı ve teknolojiyi aynı ekipte buluşturuyoruz. Böylece markanız her temas noktasında aynı dili konuşur.
          </p>
        </div>

        {/* Asymmetric grid: the second column is offset so the cards step down the page */}
        <ul className="mt-16 grid gap-5 md:mt-24 md:grid-cols-2 md:gap-6">
          {SERVICES.map((s, i) => {
            const Icon = ICONS[s.icon];
            return (
              <li key={s.no} data-reveal className={i % 2 === 1 ? "md:translate-y-20" : ""}>
                <article
                  onPointerMove={track}
                  className="glass spotlight group flex h-full min-h-[340px] flex-col rounded-[28px] p-7 transition-transform duration-500 ease-expo hover:-translate-y-1 sm:p-9"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl border border-ink/10 bg-ink/[0.04] text-acid transition-colors duration-300 group-hover:bg-acid group-hover:text-void">
                      <Icon size={24} strokeWidth={1.6} aria-hidden />
                    </span>
                    <span className="font-display text-sm text-mist">{s.no}</span>
                  </div>
                  <h3 className="mt-auto pt-14 font-display text-[clamp(1.6rem,2.6vw,2.3rem)] font-bold leading-tight tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-3 max-w-md leading-relaxed text-mist">{s.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${s.title} uzmanlıkları`}>
                    {s.tags.map((t) => (
                      <li key={t} className="rounded-full border border-ink/12 px-3 py-1 text-xs text-ink/80">
                        {t}
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

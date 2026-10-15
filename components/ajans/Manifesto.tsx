import { MANIFESTO, PILLARS, STUDIO } from "@/lib/ajans-content";

/** Words brighten from shadow to ivory as the paragraph scrolls through (see AgencySite). */
export default function Manifesto() {
  return (
    <section id="manifesto" aria-labelledby="manifesto-baslik" className="relative overflow-hidden px-5 py-40 sm:px-10 md:py-64">
      <div aria-hidden className="leak left-[-10%] top-[10%] h-[620px] w-[620px]" />
      <div className="relative mx-auto max-w-[1500px]">
        <p data-reveal className="mb-16 text-[11px] uppercase tracking-[0.3em] text-ash md:mb-24">
          (01) — Manifesto
        </p>
        <h2 id="manifesto-baslik" className="sr-only">
          Manifesto
        </h2>
        <p data-words className="mx-auto max-w-[19ch] text-center font-serif text-[clamp(2.4rem,6.4vw,6.8rem)] leading-[1.02] tracking-[-0.02em]">
          {MANIFESTO.split(" ").map((w, i) => (
            <span key={i}>
              <span className="word inline-block">{w}</span>{" "}
            </span>
          ))}
        </p>

        <div className="mt-32 grid gap-16 md:mt-48 md:grid-cols-12">
          <div data-reveal className="md:col-span-4">
            <p className="font-serif text-3xl italic text-champagne">{STUDIO.founder}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-ash">{STUDIO.founderRole}</p>
          </div>
          <ol className="grid gap-12 sm:grid-cols-3 md:col-span-7 md:col-start-6">
            {PILLARS.map((p, i) => (
              <li key={p.title} data-reveal>
                <div className="hairline mb-6" />
                <span className="text-[11px] tracking-[0.3em] text-ash">0{i + 1}</span>
                <h3 className="mt-4 font-serif text-3xl">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ash">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

import { PHILOSOPHY, STUDIO } from "@/lib/ajans-content";

export default function Philosophy() {
  const words = PHILOSOPHY.statement.split(" ");
  return (
    <section id="felsefe" aria-labelledby="felsefe-baslik" className="relative overflow-hidden px-5 py-28 sm:px-8 md:py-44">
      <div aria-hidden className="neon-blob left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 bg-volt/25" />
      <div className="relative mx-auto max-w-[1400px]">
        <p data-reveal className="mb-10 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-mist">
          <span className="h-px w-8 bg-acid" /> Hakkımızda / Felsefemiz
        </p>
        <h2 id="felsefe-baslik" className="sr-only">
          Felsefemiz
        </h2>
        {/* Words light up one by one as the paragraph scrolls through (see AgencySite) */}
        <p data-words className="max-w-[22ch] font-display text-[clamp(2rem,5.2vw,4.8rem)] font-bold leading-[1.05] tracking-tight md:max-w-[24ch]">
          {words.map((w, i) => (
            <span key={i}>
              <span className="word inline-block">{w}</span>{" "}
            </span>
          ))}
        </p>

        <div className="mt-20 grid gap-12 md:mt-28 md:grid-cols-12">
          <figure data-reveal className="md:col-span-4">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-acid to-volt font-display text-xl font-bold text-void"
              >
                AÜ
              </span>
              <figcaption>
                <span className="block font-display text-xl font-bold">{STUDIO.founder}</span>
                <span className="text-sm text-mist">{STUDIO.founderRole}</span>
              </figcaption>
            </div>
            <blockquote className="mt-6 font-serif text-2xl italic leading-snug text-ink/90">
              “İyi tasarım görülür; harika tasarım hissedilir.”
            </blockquote>
          </figure>
          <ol className="grid gap-8 sm:grid-cols-3 md:col-span-7 md:col-start-6">
            {PHILOSOPHY.pillars.map((p, i) => (
              <li key={p.title} data-reveal className="border-t border-ink/15 pt-6">
                <span className="font-display text-sm text-acid">0{i + 1}</span>
                <h3 className="mt-3 font-display text-xl font-bold">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-mist">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

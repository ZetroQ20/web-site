const ITEMS = ["Web Tasarım", "Reklam Kampanyaları", "Grafik Tasarım", "Yapay Zeka Kreatif", "Marka Stratejisi", "Motion"];

export default function Marquee() {
  // Rendered twice so the -50% loop is seamless; the copy is hidden from assistive tech.
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {ITEMS.map((t, i) => (
        <li key={t} className="flex items-center gap-8 px-4 font-display text-[clamp(2rem,5vw,4.5rem)] font-medium tracking-[-0.04em]">
          <span className={i % 2 ? "text-stroke" : "text-ink"}>{t}</span>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-ink/60" aria-hidden />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="relative overflow-hidden border-y border-ink/10 py-8">
      <div className="marquee">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

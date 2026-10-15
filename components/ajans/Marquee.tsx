import { Sparkles } from "lucide-react";

const ITEMS = ["Web Tasarım", "Reklam Kampanyaları", "Grafik Tasarım", "Yapay Zeka Kreatif", "Marka Stratejisi", "Motion"];

export default function Marquee() {
  // Rendered twice so the -50% loop is seamless; the copy is hidden from assistive tech.
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {ITEMS.map((t, i) => (
        <li key={t} className="flex items-center gap-8 px-4 font-display text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-tight">
          <span className={i % 2 ? "text-stroke" : "text-ink"}>{t}</span>
          <Sparkles className="text-acid" size={28} aria-hidden />
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

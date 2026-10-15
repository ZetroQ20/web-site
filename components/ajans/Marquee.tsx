import { MARQUEE } from "@/lib/ajans-content";

/** Endless ribbon; AgencySite skews it with scroll velocity. */
export default function Marquee() {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {MARQUEE.map((t, i) => (
        <li key={t} className="flex items-center gap-10 px-5 font-serif text-[clamp(3rem,8vw,7.5rem)] leading-none tracking-[-0.02em]">
          <span className={i % 2 ? "italic text-champagne" : "text-ivory"}>{t}</span>
          <span className="h-2 w-2 shrink-0 rounded-full bg-ivory/40" aria-hidden />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="relative overflow-hidden py-14 md:py-20" aria-label="Uzmanlık alanlarımız">
      <div data-skew className="will-change-transform">
        <div className="marquee">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}

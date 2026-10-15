"use client";

import ContributionSkyline, { type SkylineLabels } from "@/components/ui/contribution-skyline";
import { ACTIVITY } from "@/lib/ajans-content";
import RevealText from "./RevealText";

// Champagne → ivory, so the skyline lives in the page's own light.
const PALETTE = {
  light: ["#e9dcc4", "#cdb68d", "#9c835c", "#5c4a31"],
  dark: ["#2a2620", "#5a4d3b", "#a8936f", "#f1e6d0"],
};

const TR: Partial<SkylineLabels> = {
  inLastYear: "— son bir yıl",
  yearTotal: "Yıllık toplam",
  busiestDay: "En yoğun gün",
  longestStreak: "En uzun seri",
  currentStreak: "Güncel seri",
  day: "gün",
  days: "gün",
  none: (plural) => "Hiç " + plural + " yok",
  on: "·",
  between: "·",
  less: "Az",
  more: "Çok",
  levels: ["Hafif", "Orta", "Yoğun", "Çok yoğun"],
  highlight: (level) => level + " günleri vurgula",
  hintFlat: "Bir günün üzerine gelin · ok tuşlarıyla gezinin",
  hintOrbit: "Sürükleyerek döndürün · çift tıkla sıfırlayın",
  viewGroup: "Grafik görünümü",
  flatView: "Isı haritası",
  skylineView: "3B silüet",
  shownAs: (view) => " — " + view + ".",
  keyboardHint: " Günleri tek tek okumak için ok tuşlarını kullanın.",
};

export default function Rhythm() {
  return (
    <section id="ritim" aria-labelledby="ritim-baslik" className="relative overflow-hidden px-5 py-40 sm:px-10 md:py-56">
      <div aria-hidden className="leak left-[30%] top-[30%] h-[700px] w-[700px]" />
      <div className="relative mx-auto max-w-[1500px]">
        <div className="mb-16 grid gap-10 md:mb-24 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p data-reveal className="mb-10 text-[11px] uppercase tracking-[0.3em] text-ash">
              (04) — Stüdyonun Ritmi
            </p>
            <RevealText
              id="ritim-baslik"
              text={"Bir yıl,\n*kesintisiz üretim.*"}
              className="font-serif text-[clamp(3.2rem,8vw,8.5rem)] leading-[0.9] tracking-[-0.025em]"
              accentClassName="italic text-champagne"
            />
          </div>
          <p data-reveal className="max-w-sm text-[15px] leading-relaxed text-ash md:col-span-4 md:justify-self-end">
            Her kutu bir gün, her yükselti o günün teslimatları. Düz harita silüete dönüşür — sürükleyip döndürebilirsiniz.
          </p>
        </div>

        <div data-reveal className="[&_section]:rounded-none">
          <ContributionSkyline
            data={ACTIVITY.data}
            palette={PALETTE}
            unit={ACTIVITY.unit}
            unitPlural={ACTIVITY.unit}
            locale="tr-TR"
            weekStart={1}
            labels={TR}
            heightScale={1.1}
            duration={1700}
          />
        </div>
        {ACTIVITY.sample && <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-ash/70">Örnek veri</p>}
      </div>
    </section>
  );
}

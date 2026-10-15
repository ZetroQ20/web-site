/**
 * Üçdağ Studio — all copy, projects and contact details for the /ajans page.
 * Replace the placeholder links, e-mail and images here; components read only from this file.
 */

import type { ContributionDay } from "@/components/ui/contribution-skyline";

export const STUDIO = {
  name: "ÜÇDAĞ",
  mark: "ÜÇDAĞ®",
  tagline: "Kreatif & Dijital Ajans",
  city: "Denizli",
  founder: "Abdullah Üçdağ",
  founderRole: "Kurucu & Kreatif Direktör",
  // TODO: replace with the studio's real address / channels
  email: "merhaba@ucdag.studio",
};

export const HERO = {
  eyebrow: "Denizli — Kreatif & Dijital Ajans",
  headline: "Kreatif vizyonun\nsınırında.",
  accent: "sınırında.",
  body: "Markalar için web, reklam, kimlik ve yapay zekâ destekli görsel dünyalar tasarlıyoruz — dikkatle bakıldığında daha da güzelleşen işler.",
};

export const NAV = [
  { label: "Manifesto", href: "#manifesto" },
  { label: "Hizmetler", href: "#hizmetler" },
  { label: "İşler", href: "#isler" },
  { label: "İletişim", href: "#iletisim" },
];

export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "Behance", href: "https://www.behance.net/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Dribbble", href: "https://dribbble.com/" },
];

const u = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export type Service = { no: string; title: string; accent: string; body: string; tags: string[]; image: string };

/** `accent` is the part of the title set in italic serif. */
export const SERVICES: Service[] = [
  {
    no: "01",
    title: "Web Tasarım",
    accent: "& Geliştirme",
    body: "Hızlı, erişilebilir ve akılda kalan web deneyimleri. Strateji, arayüz ve kod tek masada.",
    tags: ["UI/UX", "Next.js", "WebGL"],
    image: u("1498050108023-c5249f4df085", 900),
  },
  {
    no: "02",
    title: "Reklam",
    accent: "Kampanyaları",
    body: "Veriye dayalı, kreatifi güçlü kampanyalar. Meta, Google ve TikTok'ta ölçülebilir büyüme.",
    tags: ["Performans", "Sosyal Medya", "Strateji"],
    image: u("1557804506-669a67965ba0", 900),
  },
  {
    no: "03",
    title: "Grafik Tasarım",
    accent: "& Marka",
    body: "Logodan ambalaja, kurumsal kimlikten kampanya görsellerine kadar tutarlı bir görsel dil.",
    tags: ["Kimlik", "Ambalaj", "Art Direction"],
    image: u("1561070791-2526d30994b5", 900),
  },
  {
    no: "04",
    title: "Yapay Zekâ",
    accent: "ile Kreatif",
    body: "AI destekli görsel üretim, ürün çekimi ve video. Daha hızlı iterasyon, sınırsız varyasyon.",
    tags: ["Generative AI", "Ürün Görseli", "Motion"],
    image: u("1677442136019-21780ecad995", 900),
  },
];

export type Project = {
  name: string;
  category: string;
  year: string;
  tech: string[];
  image: string;
  href: string;
  /** Position in the overlapping gallery (see Work.tsx) */
  slot: 0 | 1 | 2 | 3 | 4;
  /** Parallax travel inside the frame, in % */
  speed: number;
};

// Placeholder brand concepts — swap the images and hrefs for real case studies.
export const PROJECTS: Project[] = [
  { name: "Lal Shoes", category: "Marka Kimliği · E-ticaret", year: "2026", tech: ["Shopify", "Art Direction", "AI Ürün Görseli"], image: u("1542291026-7eec264c27ff"), href: "https://www.behance.net/", slot: 0, speed: 10 },
  { name: "Runline", category: "Kampanya · Sosyal Medya", year: "2026", tech: ["Meta Ads", "Motion", "UGC"], image: u("1476480862126-209bfaa8edc8"), href: "https://www.behance.net/", slot: 1, speed: 14 },
  { name: "Nebula AI", category: "Generative Görsel Seri", year: "2025", tech: ["Midjourney", "Runway", "Compositing"], image: u("1618005182384-a83a8bd57fbe"), href: "https://www.behance.net/", slot: 2, speed: 8 },
  { name: "Atlas Mimarlık", category: "Web Sitesi · Kurumsal", year: "2025", tech: ["Next.js", "GSAP", "Headless CMS"], image: u("1600585154340-be6161a56a0c"), href: "https://www.behance.net/", slot: 3, speed: 12 },
  { name: "Chrono Atelier", category: "Ürün Lansmanı", year: "2024", tech: ["3D Render", "Landing Page", "Google Ads"], image: u("1523275335684-37898b6baf30"), href: "https://www.behance.net/", slot: 4, speed: 9 },
];

export const MANIFESTO =
  "Trendleri takip etmiyoruz. Markanızın yarın nasıl hissettireceğini bugünden tasarlıyoruz — strateji, estetik ve teknolojinin aynı cümlede buluştuğu yerde.";

export const PILLARS = [
  { title: "Önce strateji", body: "Her piksel bir karara dayanır. Hedefi anlamadan çizmeye başlamayız." },
  { title: "Cesur estetik", body: "Minimal ama sessiz değil. Akılda kalan, kopyalanamayan bir görsel dil." },
  { title: "Akıllı üretim", body: "Yapay zekâyı kısayol değil, yaratıcılığın çarpanı olarak kullanırız." },
];

/**
 * Studio rhythm (ContributionSkyline). `data: undefined` renders the component's
 * generated sample year — replace it with real daily counts (e.g. delivered tasks,
 * commits or published pieces) before going live: `[{ date: "2026-03-14", count: 6 }, …]`.
 */
export const ACTIVITY: { data?: ContributionDay[]; unit: string; sample: boolean } = {
  data: undefined,
  unit: "teslimat",
  sample: true,
};

export const MARQUEE = ["Web Tasarım", "Reklam Kampanyaları", "Grafik Tasarım", "Yapay Zekâ Kreatif", "Marka Stratejisi", "Motion"];

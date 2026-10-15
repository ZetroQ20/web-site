/**
 * Üçdağ Studio — all copy, projects and contact details for the /ajans page.
 * Replace the placeholder links, e-mail and images here; components read only from this file.
 */

export const STUDIO = {
  name: "ÜÇDAĞ",
  mark: "ÜÇDAĞ®",
  tagline: "Kreatif & Dijital Ajans",
  city: "Denizli",
  founder: "Abdullah Üçdağ",
  founderRole: "Kurucu & Kreatif Direktör",
  // TODO: replace with the studio's real address / channels
  email: "merhaba@ucdag.studio",
  phoneDisplay: "+90 (258) 000 00 00",
  phoneHref: "tel:+902580000000",
};

export const NAV = [
  { label: "Hizmetler", href: "#hizmetler" },
  { label: "İşler", href: "#isler" },
  { label: "Felsefe", href: "#felsefe" },
  { label: "İletişim", href: "#iletisim" },
];

export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/" },
  { label: "Behance", href: "https://www.behance.net/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Dribbble", href: "https://dribbble.com/" },
];

export type Service = {
  no: string;
  title: string;
  body: string;
  tags: string[];
  icon: "web" | "ads" | "graphic" | "ai";
};

export const SERVICES: Service[] = [
  {
    no: "01",
    title: "Web Tasarım & Geliştirme",
    body: "Hızlı, erişilebilir ve akılda kalan web deneyimleri. Strateji, arayüz ve kod tek masada.",
    tags: ["UI/UX", "Next.js", "E-ticaret", "WebGL"],
    icon: "web",
  },
  {
    no: "02",
    title: "Reklam Kampanyaları",
    body: "Veriye dayalı, kreatifi güçlü kampanyalar. Meta, Google ve TikTok'ta ölçülebilir büyüme.",
    tags: ["Performans", "Sosyal Medya", "Kreatif Strateji"],
    icon: "ads",
  },
  {
    no: "03",
    title: "Grafik Tasarım & Marka",
    body: "Logodan ambalaja, kurumsal kimlikten kampanya görsellerine kadar tutarlı bir görsel dil.",
    tags: ["Kimlik", "Ambalaj", "Art Direction"],
    icon: "graphic",
  },
  {
    no: "04",
    title: "Yapay Zeka ile Kreatif",
    body: "AI destekli görsel üretim, ürün çekimi ve video. Daha hızlı iterasyon, sınırsız varyasyon.",
    tags: ["Generative AI", "Ürün Görseli", "Motion"],
    icon: "ai",
  },
];

export type Project = {
  name: string;
  category: string;
  year: string;
  tech: string[];
  image: string;
  href: string;
  /** Grid footprint in the asymmetric gallery */
  layout: "wide" | "tall" | "square";
  /** Parallax speed: negative drifts up faster than the page */
  speed: number;
};

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

// Placeholder brand concepts — swap the images and hrefs for real case studies.
export const PROJECTS: Project[] = [
  {
    name: "Lal Shoes",
    category: "Marka Kimliği · E-ticaret",
    year: "2026",
    tech: ["Shopify", "Art Direction", "AI Ürün Görseli"],
    image: u("1542291026-7eec264c27ff"),
    href: "https://www.behance.net/",
    layout: "wide",
    speed: -8,
  },
  {
    name: "Runline",
    category: "Kampanya · Sosyal Medya",
    year: "2026",
    tech: ["Meta Ads", "Motion", "UGC"],
    image: u("1476480862126-209bfaa8edc8"),
    href: "https://www.behance.net/",
    layout: "tall",
    speed: 6,
  },
  {
    name: "Nebula AI",
    category: "Generative Görsel Seri",
    year: "2025",
    tech: ["Midjourney", "Runway", "Compositing"],
    image: u("1618005182384-a83a8bd57fbe"),
    href: "https://www.behance.net/",
    layout: "square",
    speed: -4,
  },
  {
    name: "Atlas Mimarlık",
    category: "Web Sitesi · Kurumsal",
    year: "2025",
    tech: ["Next.js", "GSAP", "Headless CMS"],
    image: u("1600585154340-be6161a56a0c"),
    href: "https://www.behance.net/",
    layout: "tall",
    speed: 8,
  },
  {
    name: "Chrono Atelier",
    category: "Ürün Lansmanı",
    year: "2024",
    tech: ["3D Render", "Landing Page", "Google Ads"],
    image: u("1523275335684-37898b6baf30"),
    href: "https://www.behance.net/",
    layout: "wide",
    speed: -6,
  },
];

export const PHILOSOPHY = {
  statement:
    "Biz trend takip etmeyiz; markanızın yarın nasıl hissettireceğini bugün tasarlarız. Strateji, estetik ve teknoloji aynı cümlenin parçalarıdır.",
  pillars: [
    { title: "Önce Strateji", body: "Her piksel bir karara dayanır. Hedefi anlamadan çizmeye başlamayız." },
    { title: "Cesur Estetik", body: "Minimal ama sessiz değil. Akılda kalan, kopyalanamayan bir görsel dil." },
    { title: "Akıllı Üretim", body: "Yapay zekâyı bir kısayol değil, yaratıcılığın çarpanı olarak kullanırız." },
  ],
};

export const BUDGETS = ["< 50K ₺", "50–150K ₺", "150–300K ₺", "300K ₺ +"];
export const INTERESTS = ["Web Tasarım", "Reklam", "Grafik & Marka", "AI Kreatif"];

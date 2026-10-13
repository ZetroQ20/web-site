// Single source of truth for all salon content — edit copy, prices and images here.

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const SALON = {
  name: "THE GRACE",
  full: "THE GRACE HAIR | BEAUTY",
  founder: "CANSU ÜÇDAĞ",
  phoneDisplay: "+90 552 369 36 99",
  phoneHref: "tel:+905523693699",
  whatsapp: "905523693699",
  address: "Kınıklı Mah. Mevlana Cad. No:30 Kat:1, Denizli",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("THE GRACE HAIR BEAUTY Kınıklı Mah. Mevlana Cad. No:30 Denizli"),
  hours: "09.30 - 20.30",
  // TODO: salonun gerçek Instagram hesabı ile değiştirin.
  instagram: "https://www.instagram.com/",
};

export const HERO_IMAGE = u("photo-1534528741775-53994a69daeb", 1400);

/** Bespoke entrance effect that matches the spirit of each service. */
export type ServiceEffect = "wave" | "glow" | "laser" | "golden" | "gloss";

export type Service = {
  no: string;
  effect: ServiceEffect;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  items: { name: string; price: string }[];
};

// Fiyatlar örnek amaçlıdır; salonun güncel fiyat listesiyle güncelleyin.
export const SERVICES: Service[] = [
  {
    no: "01",
    effect: "wave",
    title: "HAIR DESIGN & EXTENSIONS",
    subtitle: "Saç Tasarımı ve Kaynak",
    description:
      "Yüz hatlarınıza göre kurgulanan kesimler, ışığı yakalayan renk geçişleri ve doğallığından ayırt edilemeyen premium kaynak uygulamaları.",
    image: u("photo-1560066984-138dadb4c035"),
    items: [
      { name: "Signature Kesim & Fön", price: "₺1.500'den" },
      { name: "Balayage / Ombre", price: "₺4.500'den" },
      { name: "Mikro Kaynak", price: "₺9.000'den" },
    ],
  },
  {
    no: "02",
    effect: "glow",
    title: "SKINCARE",
    subtitle: "Kişiye Özel Cilt Bakımı",
    description:
      "Cildinizin ihtiyacına göre kişiselleştirilen bakım protokolleriyle içten gelen, nemli ve ışıltılı bir görünüm.",
    image: u("photo-1570172619644-dfd03ed5d881"),
    items: [
      { name: "Hydra Glow Bakım", price: "₺2.000'den" },
      { name: "Leke & Gözenek Protokolü", price: "₺2.500'den" },
      { name: "Derin Nem Bakımı", price: "₺1.800'den" },
    ],
  },
  {
    no: "03",
    effect: "laser",
    title: "LASER",
    subtitle: "Yeni Nesil Lazer Epilasyon",
    description:
      "Konforlu, yeni nesil lazer teknolojisiyle her cilt tipine uygun, kalıcı pürüzsüzlük.",
    image: u("photo-1616394584738-fc6e612e71b9"),
    items: [
      { name: "Yeni Nesil Lazer (Seans)", price: "₺1.200'den" },
      { name: "Bölgesel Lazer", price: "₺600'den" },
      { name: "Tüm Vücut Paketi", price: "₺4.500'den" },
    ],
  },
  {
    no: "04",
    effect: "golden",
    title: "AESTHETICS & FACE",
    subtitle: "Microblading · İpek Kirpik · Dolgu Tozu",
    description:
      "Bakışınızı ve ifadenizi kusursuzca çerçeveleyen, milimetrik ölçümlerle tasarlanan kalıcı güzellik uygulamaları.",
    image: u("photo-1487412947147-5cebf100ffc2"),
    items: [
      { name: "Microblading", price: "₺5.000'den" },
      { name: "İpek Kirpik", price: "₺2.000'den" },
      { name: "Dolgu Tozu Kaş", price: "₺4.500'den" },
    ],
  },
  {
    no: "05",
    effect: "gloss",
    title: "NAIL ART",
    subtitle: "Protez Tırnak & Nail Art",
    description:
      "Zarif formlar, dayanıklı protez uygulamaları ve her biri küçük bir sanat eseri olan el yapımı nail art detayları.",
    image: u("photo-1604654894610-df63bc536371"),
    items: [
      { name: "Protez Tırnak", price: "₺1.800'den" },
      { name: "Kalıcı Oje", price: "₺800'den" },
      { name: "Nail Art Tasarım", price: "₺400'den" },
    ],
  },
];

export type GalleryItem = {
  src: string;
  alt: string;
  // Tailwind grid placement for the asymmetric mosaic (desktop).
  className: string;
  // Parallax speed: negative = moves up faster than scroll.
  speed: number;
};

export const GALLERY: GalleryItem[] = [
  { src: u("photo-1522337360788-8b13dee7a37e", 1000), alt: "Saç tasarımı", className: "md:col-span-5 md:row-span-2 aspect-[4/5]", speed: -8 },
  { src: u("photo-1516975080664-ed2fc6a32937", 1000), alt: "Saç bakımı", className: "md:col-span-4 md:col-start-7 aspect-[4/3] md:mt-24", speed: -22 },
  { src: u("photo-1595476108010-b4d1f102b1b1", 800), alt: "Salon detayı", className: "md:col-span-2 aspect-[3/4] md:mt-56", speed: -34 },
  { src: u("photo-1580618672591-eb180b1a973f", 1000), alt: "Renk uygulaması", className: "md:col-span-3 md:col-start-2 aspect-square md:mt-20", speed: -28 },
  { src: u("photo-1562322140-8baeececf3df", 1000), alt: "Stil çalışması", className: "md:col-span-4 md:col-start-6 aspect-[3/4] md:-mt-32", speed: -12 },
  { src: u("photo-1600948836101-f9ffda59d250", 1000), alt: "Güzellik ritüeli", className: "md:col-span-3 aspect-[4/5] md:mt-10", speed: -30 },
];

export const MARQUEE = ["PRESTIGE", "BEAUTY", "LUXURY", "DENİZLİ", "THE GRACE"];

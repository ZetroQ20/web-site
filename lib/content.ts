// Single source of truth for all salon content — edit copy, prices and images here.

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const SITE_CONFIG = {
  name: "THE GRACE",
  full: "THE GRACE HAIR | BEAUTY",
  founder: "CANSU ÜÇDAĞ",
  founderName: "Cansu Üçdağ",
  /** Public URL of the site (used for SEO / structured data). Update when a custom domain is added. */
  siteUrl: "https://web-site-two-chi.vercel.app",
  phoneDisplay: "+90 552 369 36 99",
  phoneE164: "+905523693699",
  phoneHref: "tel:+905523693699",
  whatsapp: "905523693699",
  address: "Kınıklı Mah. Mevlana Cad. No:30 Kat:1, Denizli",
  addressParts: {
    streetAddress: "Kınıklı Mah. Mevlana Cad. No:30 Kat:1",
    addressLocality: "Pamukkale",
    addressRegion: "Denizli",
    addressCountry: "TR",
  },
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("THE GRACE HAIR BEAUTY Kınıklı Mah. Mevlana Cad. No:30 Denizli"),
  hours: "09.30 - 20.30",
  opens: "09:30",
  closes: "20:30",
  // TODO: salonun açık olduğu günleri doğrulayın (structured data / Google için kullanılır).
  openDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  // TODO: salonun gerçek Instagram profil adresiyle değiştirin.
  instagramUrl: "https://www.instagram.com/",
};

/** Formats a starting price the way the menu shows it, e.g. 4500 → "₺4.500'den". */
export const formatPrice = (n: number) => `₺${n.toLocaleString("tr-TR")}'den`;

/** 150 → "2 sa 30 dk", 45 → "45 dk". */
export const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h ? `${h} sa` : "", m ? `${m} dk` : ""].filter(Boolean).join(" ") || "0 dk";
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
  /** price = starting price in TRY, minutes = average session length. */
  items: { name: string; price: number; minutes: number }[];
};

// Fiyatlar ve süreler örnek amaçlıdır; salonun güncel fiyat listesiyle güncelleyin.
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
      { name: "Signature Kesim & Fön", price: 1500, minutes: 60 },
      { name: "Balayage / Ombre", price: 4500, minutes: 180 },
      { name: "Mikro Kaynak", price: 9000, minutes: 240 },
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
      { name: "Hydra Glow Bakım", price: 2000, minutes: 60 },
      { name: "Leke & Gözenek Protokolü", price: 2500, minutes: 75 },
      { name: "Derin Nem Bakımı", price: 1800, minutes: 60 },
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
      { name: "Yeni Nesil Lazer (Seans)", price: 1200, minutes: 30 },
      { name: "Bölgesel Lazer", price: 600, minutes: 20 },
      { name: "Tüm Vücut Paketi", price: 4500, minutes: 90 },
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
      { name: "Microblading", price: 5000, minutes: 120 },
      { name: "İpek Kirpik", price: 2000, minutes: 90 },
      { name: "Dolgu Tozu Kaş", price: 4500, minutes: 120 },
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
      { name: "Protez Tırnak", price: 1800, minutes: 120 },
      { name: "Kalıcı Oje", price: 800, minutes: 45 },
      { name: "Nail Art Tasarım", price: 400, minutes: 30 },
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

/* ---------------------------------------------------------------- Founder */

export const FOUNDER = {
  name: "Cansu Üçdağ",
  role: "Art Director & Kurucu",
  // TODO: Cansu Üçdağ'ın gerçek portresini /public/images/founder.jpg olarak ekleyip yolu buraya yazın.
  // Boş bırakıldığında bölüm, portre yerine editorial bir monogram çerçevesi gösterir.
  portrait: null as string | null,
  headline: "Güzellik bir kalıp değil, kişiye özel kurgulanan bir ritüeldir.",
  // TODO: Metni Cansu Hanım'ın kendi sözleriyle güncelleyin.
  manifesto: [
    "Her randevu, sizi dinlediğimiz bir analizle başlar: yüz hatlarınız, ten alt tonunuz, saçınızın dokusu ve yaşam ritminiz. Uygulamayı ancak bu tablo netleştiğinde kurgularız.",
    "Çalıştığımız ürünleri ve teknikleri sonuç kadar sağlığınızı da gözeterek seçer, her işlemde tek kullanımlık sarf malzemesi ve sterilizasyon protokolüyle çalışırız.",
    "Amacımız sizi bir başkasına dönüştürmek değil; en iyi hâlinizi ortaya çıkaran, günlük hayatınızda da kolayca taşıyabileceğiniz bir dönüşüm sunmak.",
  ],
  values: ["%100 Kişiye Özel Protokol", "Premium Ürün & Hijyen Standardı", "Uzman Dokunuşu"],
};

/* ----------------------------------------------------------- Before / After */

export type BeforeAfterPair = {
  id: string;
  label: string;
  caption: string;
  /** Leave null until you have the salon's own photos: the section stays hidden until then. */
  before: string | null;
  after: string | null;
};

// TODO: Salonun kendi öncesi/sonrası fotoğraflarını /public/before-after/ altına ekleyip
// yolları buraya yazın (örn. "/before-after/mikro-kaynak-once.jpg"). Stok fotoğraf kullanmayın:
// başka birinin sonucunu salonun işi gibi göstermek yanıltıcı olur.
export const BEFORE_AFTER: BeforeAfterPair[] = [
  { id: "mikro-kaynak", label: "Mikro Kaynak", caption: "Hacim ve uzunluk, doğallığından ödün vermeden.", before: null, after: null },
  { id: "balayage", label: "Balayage / Ombre", caption: "Işığı yakalayan, el yapımı renk geçişleri.", before: null, after: null },
  { id: "microblading", label: "Microblading", caption: "Yüz oranlarına göre ölçülen, kıl tekniği kaşlar.", before: null, after: null },
];

/* ------------------------------------------------------------------ Reviews */

export type Review = { name: string; service: string; text: string };

// TODO: Yalnızca gerçek müşteri yorumlarını ekleyin (örn. Google İşletme Profili'nden, izin
// alarak). Liste boşken yorum bölümü görünmez. Puan da gerçek bir kaynaktan gelmeli —
// uydurma yorum ve puan yanıltıcıdır ve Google kurallarına aykırıdır.
export const REVIEWS: {
  rating: number | null;
  count: number | null;
  source: string;
  items: Review[];
} = {
  rating: null,
  count: null,
  source: "Google",
  items: [],
};

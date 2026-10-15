// GANS · Garden Whisper — single source of truth for the product page copy, notes and prices.

export const GANS_IMAGE = "/products/gans-garden-whisper.webp";

export const GANS = {
  brand: "GANS",
  name: "Garden Whisper",
  type: "Çubuklu Oda Kokusu",
  volume: "100 ml",
  // TODO: numaralı seri adedini ve fiyatları gerçek değerlerle güncelleyin.
  edition: { number: "0127", of: "1000" },
  // TODO: teslimat koşullarını gerçek hizmetle doğrulayın.
  delivery: "Kişisel teslimat · Denizli içi aynı gün · Türkiye geneli sigortalı kargo",
  tagline: "Bir bahçenin sabaha karşı fısıldadığı koku.",
  intro:
    "Çiyle ıslanmış yapraklar, ılık bir taş duvar, uzaklardan gelen beyaz çiçek. Garden Whisper, odanıza bir bahçenin en sessiz anını taşır.",
};

export type Note = { name: string; detail: string };
export type NoteTier = { id: string; label: string; time: string; mood: string; notes: Note[] };

// TODO: koku notalarını ürünün gerçek formülüyle doğrulayın.
export const NOTE_TIERS: NoteTier[] = [
  {
    id: "top",
    label: "Üst Notalar",
    time: "İlk an",
    mood: "Parlak, serin ve yeşil — kapı açıldığında karşılayan ilk nefes.",
    notes: [
      { name: "Bergamot", detail: "Calabria" },
      { name: "İncir Yaprağı", detail: "Ege" },
      { name: "Yeşil Mandalina", detail: "Sicilya" },
    ],
  },
  {
    id: "heart",
    label: "Kalp Notaları",
    time: "Saatler boyu",
    mood: "Yumuşak ve çiçeksi — odanın karakterini belirleyen zarif kalp.",
    notes: [
      { name: "Beyaz Çay", detail: "Darjeeling" },
      { name: "Yasemin Sambac", detail: "Hindistan" },
      { name: "Adaçayı", detail: "Toros" },
    ],
  },
  {
    id: "base",
    label: "Dip Notalar",
    time: "Haftalarca",
    mood: "Sıcak ve topraksı — kumaşa, ahşaba ve hafızaya sinen iz.",
    notes: [
      { name: "Vetiver", detail: "Haiti" },
      { name: "Atlas Sediri", detail: "Fas" },
      { name: "Beyaz Misk", detail: "" },
    ],
  },
];

export const CRAFT = [
  {
    no: "I",
    title: "El yapımı kristal cam",
    text: "Kalın tabanlı, ağır ve berrak. Işığı yakalayıp odaya geri veren, her biri tek tek kontrol edilen bir şişe.",
    // object-position of the crop shown for this chapter
    focus: "33% 82%",
    zoom: 1.9,
  },
  {
    no: "II",
    title: "Altın kaplama başlık",
    text: "Fırçalanmış altın tonlu yaka; şişeyi bir mücevher gibi tamamlayan tek detay.",
    focus: "33% 54%",
    zoom: 2.4,
  },
  {
    no: "III",
    title: "Varak baskılı kutu",
    text: "Kadife dokulu zeytin yeşili kutu, sıcak altın varakla işlenmiş botanik bir imza taşır.",
    focus: "63% 50%",
    zoom: 1.9,
  },
] as const;

export const RITUAL = [
  { step: "01", title: "Aç", text: "Şişenin ağzını açın; altın başlığı yerine oturtun." },
  { step: "02", title: "Yerleştir", text: "Siyah çubukları şişeye yerleştirip birkaç dakika emmelerini bekleyin." },
  { step: "03", title: "Çevir", text: "Kokuyu tazelemek istediğinizde çubukları ters çevirin — haftada bir yeterlidir." },
];

export type GansOption = { id: string; label: string; detail: string; price: number };

// TODO: fiyatları gerçek satış fiyatlarıyla değiştirin.
export const GANS_OPTIONS: GansOption[] = [
  { id: "signature", label: "Signature", detail: "100 ml şişe · 8 siyah çubuk · varak kutu", price: 4200 },
  {
    id: "coffret",
    label: "Coffret Privé",
    detail: "Signature + el yazısı not kartı + mühürlü hediye sarımı",
    price: 4900,
  },
];

export const formatTry = (n: number) => `₺${n.toLocaleString("tr-TR")}`;

export const GANS_SPECS = [
  { k: "Hacim", v: "100 ml" },
  { k: "Çubuk", v: "8 adet · siyah rattan" },
  { k: "Süre", v: "≈ 10–12 hafta" },
  { k: "Alan", v: "20–30 m²" },
];

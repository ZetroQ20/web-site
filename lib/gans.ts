// GANS · Garden Whisper — single source of truth for the product page copy, notes and prices.

/** Original studio shot (cream background) — used for the close-up crops. */
export const GANS_IMAGE = "/products/gans-garden-whisper.webp";
/** Background-free cut-outs, composited into the night-garden scenes. */
export const GANS_BOTTLE = { src: "/products/gans-bottle.webp", w: 289, h: 793 };
export const GANS_BOX = { src: "/products/gans-box.webp", w: 293, h: 787 };

export const GANS = {
  brand: "GANS",
  name: "Garden Whisper",
  type: "Çubuklu Oda Kokusu",
  volume: "100 ml",
  // TODO: GANS'ın kendi WhatsApp hattını yazın (ülke kodu ile, + ve boşluk olmadan).
  whatsapp: "905523693699",
  // TODO: numaralı seri adedini gerçek değerle güncelleyin.
  edition: { number: "0127", of: "1000" },
  // TODO: teslimat koşullarını gerçek hizmetle doğrulayın.
  delivery: "Kişiye özel teslimat · Türkiye geneli sigortalı kargo",
  tagline: "Bir bahçenin gece fısıldadığı koku.",
  intro:
    "Çiyle ıslanmış yapraklar, ılık bir taş duvar, uzaklardan gelen beyaz çiçek. Garden Whisper, odanıza bir bahçenin en sessiz anını taşır.",
};

export type IngredientKind = "bergamot" | "leaf" | "mandarin" | "tea" | "jasmine" | "sage" | "vetiver" | "cedar" | "musk";
export type Note = { name: string; origin: string; kind: IngredientKind };
export type NoteAct = {
  id: string;
  act: string;
  label: string;
  title: string;
  mood: string;
  /** Light colour washing over the scene during this act. */
  light: string;
  notes: Note[];
};

// TODO: koku notalarını ürünün gerçek formülüyle doğrulayın.
export const NOTE_ACTS: NoteAct[] = [
  {
    id: "top",
    act: "I",
    label: "Üst Notalar",
    title: "Şafak",
    mood: "Serin, parlak ve yeşil. Kapı açıldığında karşılayan ilk nefes.",
    light: "rgb(150 190 110 / 0.55)",
    notes: [
      { name: "Bergamot", origin: "Calabria", kind: "bergamot" },
      { name: "İncir Yaprağı", origin: "Ege", kind: "leaf" },
      { name: "Yeşil Mandalina", origin: "Sicilya", kind: "mandarin" },
    ],
  },
  {
    id: "heart",
    act: "II",
    label: "Kalp Notaları",
    title: "Ay ışığı",
    mood: "Yumuşak ve çiçeksi. Odanın karakterini belirleyen zarif kalp.",
    light: "rgb(235 230 210 / 0.45)",
    notes: [
      { name: "Beyaz Çay", origin: "Darjeeling", kind: "tea" },
      { name: "Yasemin Sambac", origin: "Hindistan", kind: "jasmine" },
      { name: "Adaçayı", origin: "Toros", kind: "sage" },
    ],
  },
  {
    id: "base",
    act: "III",
    label: "Dip Notalar",
    title: "Toprak",
    mood: "Sıcak ve derin. Kumaşa, ahşaba ve hafızaya sinen iz.",
    light: "rgb(214 150 70 / 0.55)",
    notes: [
      { name: "Vetiver", origin: "Haiti", kind: "vetiver" },
      { name: "Atlas Sediri", origin: "Fas", kind: "cedar" },
      { name: "Beyaz Misk", origin: "", kind: "musk" },
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

export const MANIFESTO = "Gerçek lüks bağırmaz. Bir odaya girdiğinizde sessizce kendini hissettirir.";

export const RITUAL = [
  { step: "01", title: "Aç", text: "Şişenin ağzını açın; altın başlığı yerine oturtun." },
  { step: "02", title: "Yerleştir", text: "Siyah çubukları şişeye yerleştirip birkaç dakika emmelerini bekleyin." },
  { step: "03", title: "Çevir", text: "Kokuyu tazelemek istediğinizde çubukları ters çevirin — haftada bir yeterlidir." },
];

export type GansOption = { id: string; label: string; detail: string; price: number };

// TODO: fiyatları gerçek satış fiyatlarıyla değiştirin.
export const GANS_OPTIONS: GansOption[] = [
  { id: "signature", label: "Signature", detail: "100 ml şişe · siyah çubuklar · varak kutu", price: 4200 },
  {
    id: "coffret",
    label: "Coffret Privé",
    detail: "Signature + el yazısı not kartı + mühürlü hediye sarımı",
    price: 4900,
  },
];

export const formatTry = (n: number) => `₺${n.toLocaleString("tr-TR")}`;

export const whatsappHref = (optionLabel: string) =>
  `https://wa.me/${GANS.whatsapp}?text=${encodeURIComponent(
    `Merhaba, ${GANS.brand} ${GANS.name} (${optionLabel}) için bir şişe rezerve etmek istiyorum.`
  )}`;

// TODO: teknik bilgileri doğrulayın.
export const GANS_SPECS = [
  { k: "Hacim", v: "100 ml" },
  { k: "Çubuk", v: "Siyah rattan" },
  { k: "Süre", v: "≈ 10–12 hafta" },
  { k: "Alan", v: "20–30 m²" },
];

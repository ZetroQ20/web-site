import { HERO_IMAGE, REVIEWS, SERVICES, SITE_CONFIG } from "@/lib/content";

/**
 * Local-SEO structured data (schema.org) for Google: a HairSalon + BeautySalon with address,
 * phone, opening hours, price range, founder and the full service catalogue with prices.
 * Rendered server-side into the HTML so crawlers read it without running JavaScript.
 */
export default function JsonLd() {
  const prices = SERVICES.flatMap((s) => s.items.map((i) => i.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const fmt = (n: number) => `₺${n.toLocaleString("tr-TR")}`;
  const id = `${SITE_CONFIG.siteUrl}/#salon`;
  const instagramIsReal = /instagram\.com\/[^/?#]+/.test(SITE_CONFIG.instagramUrl);

  const salon: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["HairSalon", "BeautySalon"],
    "@id": id,
    name: "THE GRACE Hair | Beauty",
    alternateName: ["THE GRACE Hair & Beauty", "The Grace Denizli", "THE GRACE — Cansu Üçdağ"],
    description:
      "Denizli Kınıklı'da saç tasarımı ve mikro kaynak, balayage/ombre, kişiye özel cilt bakımı, yeni nesil lazer epilasyon, microblading, ipek kirpik ve protez tırnak hizmetleri sunan güzellik salonu.",
    url: SITE_CONFIG.siteUrl,
    image: HERO_IMAGE,
    telephone: SITE_CONFIG.phoneE164,
    priceRange: `${fmt(min)} – ${fmt(max)}`,
    currenciesAccepted: "TRY",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.addressParts.streetAddress,
      addressLocality: SITE_CONFIG.addressParts.addressLocality,
      addressRegion: SITE_CONFIG.addressParts.addressRegion,
      addressCountry: SITE_CONFIG.addressParts.addressCountry,
    },
    hasMap: SITE_CONFIG.mapsHref,
    areaServed: [
      { "@type": "City", name: "Denizli" },
      { "@type": "Place", name: "Kınıklı, Pamukkale, Denizli" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SITE_CONFIG.openDays,
        opens: SITE_CONFIG.opens,
        closes: SITE_CONFIG.closes,
      },
    ],
    founder: { "@type": "Person", name: SITE_CONFIG.founderName, jobTitle: "Art Director & Kurucu" },
    knowsAbout: [
      "Saç tasarımı",
      "Mikro kaynak",
      "Balayage",
      "Ombre",
      "Cilt bakımı",
      "Lazer epilasyon",
      "Microblading",
      "İpek kirpik",
      "Dolgu tozu kaş",
      "Protez tırnak",
      "Nail art",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "THE GRACE Hizmetleri",
      itemListElement: SERVICES.map((s) => ({
        "@type": "OfferCatalog",
        name: `${s.title} — ${s.subtitle}`,
        itemListElement: s.items.map((it) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: it.name, serviceType: s.subtitle, provider: { "@id": id } },
          priceSpecification: { "@type": "PriceSpecification", minPrice: it.price, priceCurrency: "TRY" },
          availability: "https://schema.org/InStock",
          areaServed: "Denizli",
        })),
      })),
    },
    potentialAction: {
      "@type": "ReserveAction",
      name: "WhatsApp ile randevu talebi",
      target: { "@type": "EntryPoint", urlTemplate: `https://wa.me/${SITE_CONFIG.whatsapp}`, inLanguage: "tr" },
    },
  };

  if (instagramIsReal) salon.sameAs = [SITE_CONFIG.instagramUrl];

  // Only ever publish a rating that comes from real reviews (see REVIEWS in lib/content.ts).
  if (REVIEWS.rating && REVIEWS.count) {
    salon.aggregateRating = { "@type": "AggregateRating", ratingValue: REVIEWS.rating, reviewCount: REVIEWS.count, bestRating: 5 };
  }

  return (
    <script
      type="application/ld+json"
      // `<` is escaped so the JSON can never close the script tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(salon).replace(/</g, "\\u003c") }}
    />
  );
}

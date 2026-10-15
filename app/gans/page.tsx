import type { Metadata, Viewport } from "next";
import GansExperience from "@/components/gans/GansExperience";
import { GANS, GANS_IMAGE, GANS_OPTIONS } from "@/lib/gans";

const title = `${GANS.brand} ${GANS.name} — ${GANS.type}`;

export const metadata: Metadata = {
  title: { absolute: title },
  description: `${GANS.intro} El yapımı kristal şişe, altın başlık ve varak baskılı kutuda ${GANS.volume}.`,
  keywords: [GANS.brand, `${GANS.brand} ${GANS.name}`, "çubuklu oda kokusu", "lüks oda kokusu", "ev kokusu", "reed diffuser"],
  alternates: { canonical: "/gans" },
  openGraph: {
    title: `${GANS.brand} · ${GANS.name}`,
    description: GANS.tagline,
    url: "/gans",
    siteName: GANS.brand,
    type: "website",
    locale: "tr_TR",
    images: [{ url: GANS_IMAGE, width: 916, height: 898, alt: `${GANS.brand} ${GANS.name}` }],
  },
};

export const viewport: Viewport = {
  themeColor: "#070a05",
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: `${GANS.brand} ${GANS.name}`,
  brand: { "@type": "Brand", name: GANS.brand },
  category: GANS.type,
  description: GANS.intro,
  image: GANS_IMAGE,
  offers: GANS_OPTIONS.map((o) => ({
    "@type": "Offer",
    name: o.label,
    price: o.price,
    priceCurrency: "TRY",
    availability: "https://schema.org/LimitedAvailability",
  })),
};

export default function GansPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }} />
      <GansExperience />
    </>
  );
}

import type { Metadata, Viewport } from "next";
import GansExperience from "@/components/gans/GansExperience";
import { GANS, GANS_IMAGE } from "@/lib/gans";

export const metadata: Metadata = {
  title: `${GANS.brand} ${GANS.name} — ${GANS.type} · Numaralı Seri`,
  description: `${GANS.intro} El yapımı kristal şişe, altın başlık ve varak baskılı kutuda ${GANS.volume}.`,
  alternates: { canonical: "/gans" },
  openGraph: {
    title: `${GANS.brand} · ${GANS.name}`,
    description: GANS.tagline,
    url: "/gans",
    type: "website",
    locale: "tr_TR",
    images: [{ url: GANS_IMAGE, width: 916, height: 898, alt: `${GANS.brand} ${GANS.name}` }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d110a",
};

export default function GansPage() {
  return <GansExperience />;
}

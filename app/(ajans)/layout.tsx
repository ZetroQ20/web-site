import type { Metadata, Viewport } from "next";
// Bundled from npm (Fontsource) so builds never depend on fonts.googleapis.com;
// latin-ext subsets cover Ü, Ç, Ğ, Ş, İ.
import "@fontsource-variable/manrope";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-ext-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource/instrument-serif/latin-ext-400-italic.css";
import "./ajans.css";
import { STUDIO } from "@/lib/ajans-content";

export const metadata: Metadata = {
  title: `${STUDIO.name} — ${STUDIO.tagline} · ${STUDIO.city}`,
  description:
    "Denizli merkezli kreatif ajans: web tasarım, reklam kampanyaları, grafik tasarım ve yapay zeka destekli görsel içerik. Kurucu & Kreatif Direktör Abdullah Üçdağ.",
  keywords: [
    "Denizli reklam ajansı",
    "Denizli web tasarım",
    "Denizli grafik tasarım",
    "yapay zeka görsel içerik",
    "dijital pazarlama Denizli",
    "Abdullah Üçdağ",
  ],
  alternates: { canonical: "/ajans" },
  openGraph: {
    title: `${STUDIO.name} — Kreatif vizyonun sınırında`,
    description: "Denizli'den global kalitede web, reklam, grafik ve AI kreatif.",
    locale: "tr_TR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function AjansLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}

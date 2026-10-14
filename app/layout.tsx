import type { Metadata, Viewport } from "next";
// Fonts are bundled from npm (Fontsource) rather than fetched from Google at build time,
// so deployments never depend on fonts.googleapis.com. Each file carries its own
// unicode-range, so browsers only download the latin / latin-ext subsets they need.
import "@fontsource-variable/cinzel";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/playfair-display/wght-italic.css";
import "@fontsource-variable/manrope";
// Signature script (founder section) — latin + latin-ext only, for Ü / ç / ğ.
import "@fontsource/great-vibes/latin-400.css";
import "@fontsource/great-vibes/latin-ext-400.css";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import { HERO_IMAGE, SITE_CONFIG } from "@/lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.siteUrl),
  title: "THE GRACE Hair | Beauty — Denizli Güzellik Salonu · Cansu Üçdağ",
  description:
    "Denizli Kınıklı'da saç tasarımı ve mikro kaynak, balayage, kişiye özel cilt bakımı, yeni nesil lazer epilasyon, microblading, ipek kirpik ve protez tırnak. Cansu Üçdağ'ın vizyonuyla THE GRACE.",
  keywords: [
    "Denizli güzellik salonu",
    "Denizli kuaför",
    "Denizli mikro kaynak",
    "Denizli saç kaynak",
    "Kınıklı kuaför",
    "Kınıklı cilt bakımı",
    "Denizli lazer epilasyon",
    "Denizli microblading",
    "Denizli ipek kirpik",
    "Denizli protez tırnak",
    "THE GRACE",
    "Cansu Üçdağ",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "THE GRACE Hair | Beauty — Denizli",
    description: "Kendini yeniden keşfet — Cansu Üçdağ'ın vizyonuyla Denizli Kınıklı'da kişiye özel güzellik ritüelleri.",
    url: SITE_CONFIG.siteUrl,
    siteName: "THE GRACE Hair | Beauty",
    locale: "tr_TR",
    type: "website",
    images: [{ url: HERO_IMAGE, alt: "THE GRACE Hair | Beauty" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#030303",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <JsonLd />
        {children}
      </body>
    </html>
  );
}

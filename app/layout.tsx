import type { Metadata, Viewport } from "next";
// Fonts are bundled from npm (Fontsource) rather than fetched from Google at build time,
// so deployments never depend on fonts.googleapis.com. Each file carries its own
// unicode-range, so browsers only download the latin / latin-ext subsets they need.
import "@fontsource-variable/cinzel";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/playfair-display/wght-italic.css";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE GRACE HAIR | BEAUTY — Cansu Üçdağ · Denizli",
  description:
    "Cansu Üçdağ’ın vizyonuyla Denizli’nin en prestijli dönüşüm noktası. Saç tasarımı & kaynak, cilt bakımı & lazer, microblading, ipek kirpik ve nail art.",
  keywords: ["Denizli kuaför", "Denizli güzellik salonu", "saç kaynak Denizli", "microblading Denizli", "ipek kirpik", "protez tırnak", "THE GRACE", "Cansu Üçdağ"],
  openGraph: {
    title: "THE GRACE HAIR | BEAUTY",
    description: "Kendini yeniden keşfet — The Grace Experience, Denizli.",
    locale: "tr_TR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#030303",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}

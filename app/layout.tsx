import type { Metadata, Viewport } from "next";
import { Cinzel, Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-cinzel", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "500", "600"], variable: "--font-manrope", display: "swap" });

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
    <html lang="tr" className={`${cinzel.variable} ${playfair.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}

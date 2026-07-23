import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/cart/CartProvider";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tropa-joaomanginis-projects.vercel.app"),
  title: {
    default: "Tropa — Compra y venta de ganado en Paraguay",
    template: "%s · Tropa",
  },
  description:
    "Marketplace de ganado en Paraguay. Publicá tu lote o encontrá animales por raza, departamento y precio, y hablá directo por WhatsApp.",
  openGraph: {
    type: "website",
    siteName: "Tropa",
    locale: "es_PY",
    title: "Tropa — Compra y venta de ganado en Paraguay",
    description:
      "Comprá y vendé ganado en Paraguay. Publicá tu lote o encontrá animales por raza, departamento y precio.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable} font-sans`}>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

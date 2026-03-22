import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// 👉 NUEVO: Esto pinta la barra de estado/URL del celular de color oscuro
export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 👉 NUEVO: bg-[#09090b] al html y data-scroll-behavior="smooth"
    <html 
      lang="es" 
      className={`${geistSans.variable} ${geistMono.variable} scroll-smooth bg-[#09090b]`} 
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="bg-[#09090b] text-gray-400 antialiased selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}
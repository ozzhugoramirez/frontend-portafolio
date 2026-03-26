import type { Viewport,Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  icons: {
    icon: '/header.png', 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
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
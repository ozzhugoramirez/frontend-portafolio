import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Sebastian Villalba | Software Engineer",
  icons: {
    icon: '/header.png', 
  },
  description: "Especialista en Cloud, Backend y Ciberseguridad.",
  openGraph: {
    title: "Sebastian Villalba | Software Engineer",
    description: "Casos de estudio y soluciones robustas en software.",
    type: "website",
    siteName: "Sebastian Villalba Portfolio",
  },
};



export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
  
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      <Navbar />
      
      <main className="flex-1">{children}</main>
      
      <footer className="w-full py-8 border-t border-gray-800/50 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-gray-600 bg-[#09090b]">
        © {new Date().getFullYear()} Sebastian Villalba
      </footer>

      
    </div>
  );
}
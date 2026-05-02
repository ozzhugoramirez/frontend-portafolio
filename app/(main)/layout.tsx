import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CaptchaWrapper from "./CaptchaWrapper";

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
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <CaptchaWrapper>
          {children}
        </CaptchaWrapper>
      </main>

      <footer className="w-full py-12 border-t border-slate-300 text-center bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-4">
            © {new Date().getFullYear()} Sebastian Villalba
          </p>

          <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed max-w-md mx-auto">
            Este sitio está protegido por reCAPTCHA. Se aplican la
            <a href="https://policies.google.com/privacy" target="_blank" className="text-slate-600 hover:text-slate-900 mx-1 underline underline-offset-4 transition-colors">Privacidad</a>
            y los
            <a href="https://policies.google.com/terms" target="_blank" className="text-slate-600 hover:text-slate-900 mx-1 underline underline-offset-4 transition-colors">Términos</a>
            de Google.
          </p>
        </div>
      </footer>
    </div>
  );
}
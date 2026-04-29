import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CaptchaWrapper from './CaptchaWrapper';

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

      <main className="flex-1">
        <CaptchaWrapper>
          {children}
        </CaptchaWrapper>
      </main>

      <footer className="w-full py-12 border-t border-gray-800/50 text-center bg-[#09090b]">
        <div className="max-w-[1200px] mx-auto px-4">

          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 mb-4">
            © {new Date().getFullYear()} Sebastian Villalba
          </p>


          <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest leading-relaxed max-w-md mx-auto">
            Este sitio está protegido por reCAPTCHA. Se aplican la
            <a href="https://policies.google.com/privacy" target="_blank" className="text-indigo-500 hover:text-indigo-400 mx-1 underline underline-offset-4">Privacidad</a>
            y los
            <a href="https://policies.google.com/terms" target="_blank" className="text-indigo-500 hover:text-indigo-400 mx-1 underline underline-offset-4">Términos</a>
            de Google.
          </p>
        </div>
      </footer>

    </div>
  );
}
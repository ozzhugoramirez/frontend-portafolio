"use client";

import { useState, useEffect } from "react";
import { Menu, X, Plus, Download, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getProfile, trackEvent } from "@/lib/api";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const mainTabs = [
  { label: "Bio & Edu", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Timeline", href: "/lab" },
];

const panelTabs = [
  { label: "Home", href: "/" },
  { label: "Bio & Edu", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Timeline", href: "/lab" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  useEffect(() => {
    getProfile()
      .then((data) => {
        if (data.cv_file) {
          const fullUrl = data.cv_file.startsWith("http")
            ? data.cv_file
            : `${BACKEND_URL}${data.cv_file}`;
          setCvUrl(fullUrl);
        }
      })
      .catch(() => { });
  }, []);

  const handleCvDownload = () => {
    if (cvUrl) trackEvent("download", "cv");
  };

  return (
    <>
      {/* ESPACIADOR INVISIBLE: flex-none asegura que no colapse al scrollear */}
      <div className="h-16 w-full flex-none shrink-0 bg-[#f4f4f0]" />

      {/* NAVBAR FIJO: transform-gpu evita que los elementos salten en celulares al hacer scroll */}
      <nav className="fixed top-0 left-0 w-full h-16 z-[100] border-b-4 border-black bg-[#f4f4f0] flex items-center justify-between px-2 md:px-6 shadow-[0px_4px_0px_0px_rgba(0,0,0,0.05)] transform-gpu">

        {/* Tabs Principales (h-full obliga a que no salten al recalcular el centro) */}
        <div className="h-full flex flex-1 items-center justify-start gap-1.5 md:gap-3 mr-4">
          {mainTabs.map((item) => {
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  /* ==================================================================== */
                  /* 👇 ACÁ PODÉS AJUSTAR EL TAMAÑO DE LOS 3 TABS EN MÓVIL 👇              */
                  /* Cambiá el "text-[10px]" por "text-[11px]" o "text-[12px]"            */
                  /* si querés que sean un poco más grandes. "md:text-sm" es para PC.   */
                  /* ==================================================================== */
                  text-[10px] sm:text-[11px] md:text-sm
                  
                  flex-none flex items-center justify-center gap-1 px-1.5 py-1.5 md:px-3 border-2 font-mono font-bold uppercase transition-all whitespace-nowrap
                  ${active
                    ? "bg-black text-white border-black shadow-none translate-x-[2px] translate-y-[2px]"
                    : "bg-white text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-pink-300 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  }
                `}
              >
                {item.label}
                {/* Ocultamos el + en móviles para que los botones entren perfectos */}
                {active ? <span className="hidden md:inline-block">−</span> : <Plus className="hidden md:block" size={14} strokeWidth={3} />}
              </Link>
            );
          })}
        </div>

        {/* Acciones Derecha (Menú y Botón CV PC) */}
        <div className="h-full flex items-center gap-2 md:gap-4 shrink-0">

          {/* Botón CV - SOLO PC */}
          <a
            href={cvUrl || "#"}
            onClick={handleCvDownload}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 px-4 py-1.5 border-2 border-black bg-yellow-300 text-black font-mono text-sm font-bold uppercase hover:bg-cyan-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
          >
            <Download size={16} strokeWidth={3} />
            CV
          </a>

          {/* Botón de Menú Hamburguesa */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="p-2 border-2 border-black bg-white hover:bg-cyan-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center"
          >
            {open ? (
              <X size={20} className="text-black md:w-6 md:h-6" strokeWidth={3} />
            ) : (
              <Menu size={20} className="text-black md:w-6 md:h-6" strokeWidth={3} />
            )}
          </button>
        </div>
      </nav>

      {/* PANEL GIGANTE DEL MENÚ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[999] bg-[#f4f4f0] flex flex-col md:flex-row overflow-hidden selection:bg-cyan-300 selection:text-black"
          >
            {/* Patrón de fondo del panel */}
            <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* HEADER DEL PANEL */}
            <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4 md:px-6 border-b-4 border-black z-20 bg-white">
              <span className="font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2 bg-yellow-300 px-2 border-2 border-black">
                <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
                SYSTEM_NAV.EXE
              </span>

              <button
                onClick={() => setOpen(false)}
                className="p-1 border-2 border-black bg-red-500 hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
              >
                <X size={20} className="text-white" strokeWidth={3} />
              </button>
            </div>

            {/* IZQUIERDA: Navegación */}
            <div className="relative z-10 flex flex-col justify-center md:h-full md:w-1/2 w-full px-6 md:px-12 lg:px-16 pt-24 md:pt-16 pb-20 overflow-y-auto bg-[#f4f4f0]">

              <div className="w-full max-w-lg mx-auto">
                <h1 className="text-xs md:text-sm font-mono font-bold uppercase mb-6 border-l-4 border-black pl-3 text-black">
                  Dir: /root/navigation
                </h1>

                <div className="flex flex-col gap-3 md:gap-4">
                  {panelTabs.map((item, i) => {
                    const active =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);

                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`group flex items-center text-[2.2rem] md:text-5xl lg:text-6xl font-black uppercase tracking-tighter transition-all duration-300 py-1 ${active
                            ? "text-black translate-x-2 md:translate-x-4"
                            : "text-transparent [-webkit-text-stroke:2px_black] hover:text-black hover:translate-x-2 md:hover:translate-x-4"
                            }`}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* ACCIONES MÓVIL (Botón CV para celular) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 flex flex-col gap-4 w-full md:hidden"
                >
                  <a
                    href={cvUrl || "#"}
                    onClick={() => {
                      handleCvDownload();
                      setOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 h-14 bg-black text-white font-bold uppercase tracking-wider border-4 border-black active:bg-cyan-300 active:text-black transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Download size={20} /> Download CV
                  </a>
                </motion.div>
              </div>
            </div>

            {/* DERECHA DECORATIVA: ID Card Brutalista */}
            <div className="hidden md:flex flex-col md:w-1/2 items-center justify-center relative bg-cyan-300 p-8 lg:p-12 h-full border-l-4 border-black">

              <div className="w-full max-w-sm bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] lg:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rotate-3 hover:rotate-0 transition-transform duration-500 p-4 lg:p-6 relative mt-10">

                {/* Pinza superior de la credencial */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-8 bg-gray-300 border-4 border-black rounded-t-xl z-[-1]"></div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-2 bg-black rounded-full"></div>

                {/* Header ID */}
                <div className="border-b-4 border-black pb-3 mb-5 flex justify-between items-start">
                  <h3 className="font-black text-3xl lg:text-4xl uppercase tracking-tighter leading-none text-black">
                    Sys <br /> Pass
                  </h3>
                  <Fingerprint size={40} className="text-black" strokeWidth={1} />
                </div>

                {/* Cuerpo de la ID */}
                <div className="flex gap-4 mb-5">
                  <div className="w-20 h-28 lg:w-24 lg:h-32 bg-gray-200 border-4 border-black overflow-hidden relative shrink-0">
                    <img src="/perfil.jpg" alt="ID Profile" className="w-full h-full object-cover grayscale" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>

                  <div className="font-mono text-[10px] lg:text-xs font-bold uppercase flex flex-col justify-end space-y-1.5 text-black">
                    <p><span className="text-gray-500 block text-[9px] lg:text-[10px]">NAME</span>S. Villalba</p>
                    <p><span className="text-gray-500 block text-[9px] lg:text-[10px]">ROLE</span>systems engineering</p>
                    <p><span className="text-gray-500 block text-[9px] lg:text-[10px]">ACCESS</span>Level_Root</p>
                  </div>
                </div>

                {/* Footer ID (Código de barras simulado) */}
                <div className="flex flex-col gap-2">
                  <div className="w-full h-8 lg:h-10 flex gap-0.5 items-end justify-between px-1">
                    {[1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1].map((w, i) => (
                      <div key={i} className="bg-black h-full" style={{ width: `${w * 2}px` }}></div>
                    ))}
                  </div>
                  <div className="flex justify-between font-mono text-[9px] lg:text-[10px] font-bold">
                    <span>AUTH_001</span>
                    <span className="bg-black text-white px-1">VERIFIED</span>
                  </div>
                </div>
              </div>

            </div>

            {/* FOOTER DEL PANEL */}
            <div className="absolute bottom-0 left-0 w-full p-3 lg:p-4 border-t-4 border-black text-[10px] lg:text-xs font-mono font-bold uppercase flex justify-between bg-white z-20 text-black">
              <span>sebastianvillalba.dev</span>
              <span>v2.0.26</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
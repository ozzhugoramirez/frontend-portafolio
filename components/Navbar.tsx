"use client";

import { useState, useEffect } from "react";
import { Menu, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getProfile, trackEvent } from "@/lib/api";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const mainTabs = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Lab", href: "/lab" },
];

const panelTabs = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Lab", href: "/lab" },
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
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full h-14 border-b border-slate-300 bg-slate-50 flex items-center justify-between px-4">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="p-2 rounded-md border border-slate-300 bg-white shadow-sm"
        >
          {open ? (
            <X size={22} className="text-slate-800" />
          ) : (
            <Menu size={22} className="text-slate-800" />
          )}
        </button>

        <div className="flex items-center gap-2">
          {mainTabs.map((item) => {
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`
                  flex items-center gap-1 px-3 py-1 border text-sm
                  transition-all
                  ${active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "border-slate-400 text-slate-800 bg-white"
                  }
                `}
              >
                {item.label}
                {active ? "−" : <Plus size={14} />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* PANEL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[999] bg-slate-50 flex flex-col md:flex-row overflow-hidden"
          >
            {/* HEADER */}
            <div className="absolute top-0 left-0 w-full flex justify-between items-center p-4 border-b border-slate-300 z-10 bg-slate-50">
              <span className="text-xs tracking-widest text-slate-500">
                MENU
              </span>

              <button onClick={() => setOpen(false)}>
                <X size={24} className="text-slate-800" />
              </button>
            </div>

            {/* IZQUIERDA */}
            <div className="flex flex-col justify-center md:w-1/2 w-full px-6 md:px-16 pt-24">
              <h1 className="text-4xl md:text-6xl font-serif font-semibold mb-12 text-slate-900 leading-tight">
                Sebastian <br /> Villalba
              </h1>

              <div className="flex flex-col gap-6">
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
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`group relative text-3xl md:text-4xl font-serif tracking-tight transition-all duration-300 ${active
                            ? "text-slate-900"
                            : "text-slate-400 hover:text-slate-900"
                          }`}
                      >
                        {item.label}

                        {/* underline animado */}
                        <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-slate-900 transition-all duration-300 group-hover:w-full"></span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* ACCIONES */}
              <div className="mt-12 flex flex-col gap-4">
                <a
                  href={cvUrl || "#"}
                  onClick={() => {
                    handleCvDownload();
                    setOpen(false);
                  }}
                  className="text-slate-500 hover:text-slate-900 transition"
                >
                  Download CV
                </a>
              </div>
            </div>

            {/* DERECHA DECORATIVA */}
            <div className="hidden md:flex md:w-1/2 items-center justify-center relative overflow-hidden">

              {/* patrón */}
              <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,_#000_1px,_transparent_0)] [background-size:40px_40px]" />

              {/* SVG */}
              <svg
                className="absolute max-w-full max-h-full w-[80%] h-[80%] text-slate-900 opacity-10"
                viewBox="0 0 500 500"
                fill="none"
              >
                <path
                  d="M50 250 C150 50, 350 450, 450 250"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M100 300 C200 100, 300 400, 400 200"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>

              {/* marca */}
              <div className="absolute text-[120px] font-serif text-slate-900 opacity-[0.03] select-none">
                SV
              </div>
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-300 text-xs text-slate-500 bg-slate-50">
              sebastianvillalba.dev
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
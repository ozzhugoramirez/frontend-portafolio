"use client";

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Terminal, ChevronRight, ChevronLeft, CalendarDays,
  ArrowRight, FileText, Activity
} from 'lucide-react';
import { trackEvent } from '@/lib/api';

// --- DATOS MOCK DE TU LÍNEA DE TIEMPO ---
const timelineData = [
  {
    slug: "inicio-autodidacta",
    date: "2018 / 05",
    title: "SYSTEM_INIT: Autodidacta",
    summary: "El instinto analítico me llevó a sumergirme en el mundo IT por mi cuenta. Primer contacto real con la programación y la deconstrucción de sistemas.",
    color: "bg-pink-300",
    category: "ORIGIN"
  },
  {
    slug: "enfermeria-pandemia",
    date: "2020 / 03",
    title: "Presión Crítica: Pandemia",
    summary: "Experiencia clínica en Enfermería durante el COVID-19. Forjó mi capacidad para tomar decisiones críticas y trabajar bajo presión extrema sin margen de error.",
    color: "bg-yellow-300",
    category: "SKILL_BUILD"
  },
  {
    slug: "ingenieria-mecatronica",
    date: "2022 / 04",
    title: "Hardware & Lógica Dura",
    summary: "Cursado de Ingeniería Mecatrónica en la UNLZ. Una base fundamental en lógica dura, matemática y física antes de pivotar al 100% al software puro.",
    color: "bg-cyan-300",
    category: "ACADEMIC"
  },
  {
    slug: "vexa-linux",
    date: "2025 / 11",
    title: "Kernel & OS: Vexa Linux",
    summary: "Desarrollo de mi propia distribución Linux basada en Debian (Trixie). Customización de entornos gráficos y arquitectura desde el núcleo.",
    color: "bg-green-400",
    category: "PROJECT"
  },
  {
    slug: "silo-backend",
    date: "2026 / 02",
    title: "Arquitectura Backend: Silo",
    summary: "Desarrollo avanzado de Silo (Velix), un ecosistema transaccional con Django y Next.js. Foco en bases de datos relacionales y rendimiento.",
    color: "bg-white",
    category: "BUILD"
  },
  {
    slug: "data-engineering-utn",
    date: "2026 / 04",
    title: "Flujos Masivos: Data Eng",
    summary: "Especialización intensiva en Data Engineering en la UTN. Integrando mi perfil Backend con el procesamiento y diseño de arquitecturas de datos.",
    color: "bg-purple-300",
    category: "CERT"
  },
  {
    slug: "utn-sistemas-2027",
    date: "2027 / 03",
    title: "TARGET: Ing. en Sistemas",
    summary: "Objetivo académico fijado. Ingreso a la carrera de Ingeniería en Sistemas en la UTN, buscando expandir y certificar mis capacidades de arquitectura.",
    color: "bg-black text-white",
    category: "FUTURE_LOG"
  }
];

export default function TimelinePage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 420 : 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    trackEvent('view', 'timeline_horizontal_v2');
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#f4f4f0] text-black selection:bg-cyan-300 selection:text-black font-sans pb-24 pt-20 md:pt-28 px-4 md:px-6">

      {/* Fondo Retro */}
      <div className="fixed inset-0 opacity-[0.15] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <main className="relative z-10 max-w-[1400px] mx-auto">

        {/* --- CONTENEDOR PRINCIPAL TIPO "VENTANA DE PROGRAMA" --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-4 border-black bg-[#f4f4f0] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
        >

          {/* CABECERA FUNCIONAL DEL PROGRAMA */}
          <div className="bg-black text-white border-b-4 border-black p-3 md:p-4 flex flex-col md:flex-row justify-between items-center gap-4">

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Activity size={20} className="text-pink-500" />
              <span className="font-mono text-xs md:text-sm font-bold uppercase tracking-widest">
                root/system/timeline_tracker.exe
              </span>
            </div>

            {/* Controles integrados en la barra (ocultos en móvil porque ahí se scrollea con el dedo) */}
            <div className="hidden md:flex items-center gap-2">
              <span className="font-mono text-[10px] text-gray-400 mr-2 uppercase">Nav_Controls</span>
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 bg-[#222] border-2 border-gray-600 flex items-center justify-center hover:bg-white hover:text-black hover:border-black transition-colors"
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 bg-[#222] border-2 border-gray-600 flex items-center justify-center hover:bg-white hover:text-black hover:border-black transition-colors"
              >
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* LA CINTA DE LA LÍNEA DE TIEMPO (SCROLLABLE) */}
          <div className="bg-white relative">

            {/* Línea decorativa superior que simula el "riel" */}
            <div className="absolute top-0 left-0 w-full h-8 bg-gray-200 border-b-4 border-black z-0 flex items-center px-4">
              <div className="w-full h-1 bg-gray-400"></div>
            </div>

            <div
              ref={scrollRef}
              className="flex gap-6 md:gap-8 overflow-x-auto px-6 md:px-10 pb-10 pt-16 snap-x snap-mandatory custom-scrollbar relative z-10"
              style={{ scrollbarWidth: 'none' }}
            >
              {timelineData.map((item, index) => (
                <div
                  key={item.slug}
                  className="relative shrink-0 snap-center w-[85vw] sm:w-[320px] md:w-[380px] flex flex-col"
                >
                  {/* Conector al riel superior */}
                  <div className="absolute -top-16 left-8 w-2 h-16 bg-black z-0"></div>
                  <div className={`absolute -top-16 left-6 w-6 h-6 border-4 border-black rounded-full z-10 ${item.color}`}></div>

                  {/* Tarjeta de Log */}
                  <div className="border-4 border-black bg-[#f4f4f0] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col h-full group">

                    {/* Header de la tarjeta con Fecha y Categoría */}
                    <div className="flex items-stretch border-b-4 border-black">
                      <div className={`px-4 py-2 border-r-4 border-black font-mono text-xs md:text-sm font-bold uppercase flex items-center gap-2 ${item.color}`}>
                        <CalendarDays size={16} /> {item.date}
                      </div>
                      <div className="flex-1 bg-black text-white px-3 py-2 font-mono text-[10px] md:text-xs font-bold uppercase flex items-center justify-end">
                        {item.category}
                      </div>
                    </div>

                    {/* Cuerpo de la Tarjeta */}
                    <div className="p-5 md:p-6 flex-1 flex flex-col bg-white">
                      <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-3 leading-tight group-hover:text-pink-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed flex-1 border-l-4 border-black pl-3">
                        {item.summary}
                      </p>
                    </div>

                    {/* Botón de Acción Integrado */}
                    <div className="p-4 bg-gray-100 border-t-4 border-black">
                      <Link
                        href={`/timeline/${item.slug}`}
                        onClick={() => trackEvent('click', `view_timeline_${item.slug}`)}
                        className="w-full flex items-center justify-between px-4 py-2 border-4 border-black bg-white hover:bg-yellow-300 font-black uppercase text-xs md:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all group-hover:bg-cyan-300"
                      >
                        <span className="flex items-center gap-2"><FileText size={16} /> Detalles Log</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                  </div>
                </div>
              ))}

              {/* Espacio final */}
              <div className="shrink-0 w-4 md:w-12"></div>
            </div>
          </div>

          {/* Pie de la ventana */}
          <div className="bg-gray-200 border-t-4 border-black p-2 px-4 flex justify-between font-mono text-[10px] uppercase font-bold text-gray-600">
            <span>Registros: {timelineData.length}</span>
            <span>Status: Online</span>
          </div>

        </motion.div>
      </main>

      {/* ESTILOS GLOBALES PARA OCULTAR LA BARRA DE SCROLL FEA EN PC */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
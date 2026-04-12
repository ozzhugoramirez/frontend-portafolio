"use client";

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Radio, ArrowRight, Fingerprint } from 'lucide-react';

export default function PortalPage() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Buenos días' : currentHour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      
      {/* Fondo sutil Apple-style (un destello muy suave) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>

      <div className="w-full max-w-5xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Cabecera limpia y minimalista */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-white shadow-sm border border-gray-200/60 rounded-[20px] flex items-center justify-center mx-auto mb-6">
            <Fingerprint size={32} className="text-blue-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-3">
            {greeting}, Seba.
          </h1>
          <p className="text-gray-500 text-sm md:text-base font-medium">
            Seleccioná el entorno de trabajo al que deseás acceder hoy.
          </p>
        </div>

        {/* Grilla de tarjetas (Glassmorphism Claro) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tarjeta: Dashboard */}
          <Link href="/dashboard" className="group relative bg-white/70 backdrop-blur-xl border border-gray-200/50 hover:border-blue-200 rounded-[24px] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-[16px] flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
              <LayoutDashboard size={24} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight">Control Panel</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Métricas de tu portafolio, gestión de proyectos, visitas y configuración web.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              Ingresar <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>

          {/* Tarjeta: Study */}
          <Link href="/study" className="group relative bg-white/70 backdrop-blur-xl border border-gray-200/50 hover:border-emerald-200 rounded-[24px] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-[16px] flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
              <BookOpen size={24} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight">Study Center</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Organización de la carrera, ciberseguridad, apuntes y roadmap de aprendizaje.
            </p>
            <div className="flex items-center text-emerald-600 text-sm font-medium">
              Ingresar <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>

          {/* Tarjeta: Live */}
          <Link href="/live" className="group relative bg-white/70 backdrop-blur-xl border border-gray-200/50 hover:border-purple-200 rounded-[24px] p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
            <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-[16px] flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Radio size={24} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight">Live Hub</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Entorno en tiempo real, streaming, monitoreo activo y eventos en directo.
            </p>
            <div className="flex items-center text-purple-600 text-sm font-medium">
              Ingresar <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
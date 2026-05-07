"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTimelineEvents } from '@/lib/api';
import { ArrowRight, Terminal } from 'lucide-react';

export default function TimelinePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTimelineEvents()
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando timeline:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f0] flex flex-col items-center justify-center font-mono">
        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <span className="font-black uppercase tracking-tighter">Accediendo a la base de datos...</span>
        </div>
      </div>
    );
  }

  // Agrupamos eventos por año para mostrar los encabezados
  let currentYear = "";

  return (
    <div className="relative w-full min-h-screen bg-[#f4f4f0] text-black selection:bg-cyan-300 font-sans pb-24">
      {/* Grilla de fondo */}
      <div className="fixed inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 relative z-10 pt-12 md:pt-20">

        {/* Encabezado */}
        <div className="mb-20">
          <span className="bg-black text-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest mb-4 inline-block">
            Timeline.log
          </span>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
            History
          </h1>
        </div>

        <div className="relative">
          {/* Línea vertical negra gruesa */}
          <div className="absolute left-[20px] md:left-[40px] top-0 bottom-0 w-2 bg-black"></div>

          <div className="space-y-12">
            {events.map((event, index) => {
              const dateObj = new Date(event.event_date);
              const eventYear = dateObj.getFullYear().toString();
              const showYear = eventYear !== currentYear;

              if (showYear) currentYear = eventYear;

              // Formato de fecha para el interior
              const dayMonth = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

              return (
                <div key={event.id} className="relative">

                  {/* BLOQUE DE AÑO: Aparece solo cuando cambia el año */}
                  {showYear && (
                    <div className="relative z-20 mb-12 ml-[-10px] md:ml-[-20px]">
                      <div className="inline-block bg-white border-4 border-black px-6 py-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-4xl md:text-7xl font-black uppercase tracking-tighter">
                          {eventYear}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* EVENTO INDIVIDUAL */}
                  <div className="relative pl-14 md:pl-28 group pb-8">
                    {/* Punto de conexión en la línea */}
                    <div className="absolute left-[15px] md:left-[35px] top-4 w-[18px] h-[18px] bg-black border-4 border-[#f4f4f0] rounded-full z-10 transition-transform group-hover:scale-150"></div>

                    <div className="flex flex-col gap-1 mb-4">
                      <span className="font-mono text-sm font-black uppercase text-blue-600 bg-white border-2 border-black w-fit px-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        {dayMonth}
                      </span>
                    </div>

                    <Link href={`/timeline/${event.slug}`} className="block">
                      <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-3 leading-tight">
                          {event.title}
                        </h2>
                        <p className="text-base md:text-lg font-medium leading-snug text-gray-700 line-clamp-3">
                          {event.brief_description}
                        </p>
                        <div className="mt-6 flex items-center gap-2 font-mono text-xs font-black uppercase group-hover:text-blue-600">
                          Leer registro completo <ArrowRight size={16} />
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
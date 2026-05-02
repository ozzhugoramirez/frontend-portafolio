"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Terminal, Search, ArrowRight, FolderOpen, AlertTriangle,
  Code2, ExternalLink, Activity
} from "lucide-react";
import { getProjects, trackEvent } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getProjects()
      .then((data) => {
        const projArray = data.results ? data.results : data;
        setProjects(projArray);
        setLoading(false);
        trackEvent('view', 'projects_list');
      })
      .catch((error) => {
        console.error("Error cargando proyectos:", error);
        setLoading(false);
      });
  }, []);

  // Función para filtrar proyectos en tiempo real
  const filteredProjects = projects.filter((proj) => {
    const query = searchQuery.toLowerCase();
    const titleMatch = proj.title?.toLowerCase().includes(query);
    const descMatch = proj.short_description?.toLowerCase().includes(query);
    return titleMatch || descMatch;
  });

  // Pantalla de carga Brutalista
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f4f4f0] flex flex-col items-center justify-center font-mono text-black">
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 flex flex-col items-center gap-4">
          <FolderOpen size={48} className="animate-bounce" />
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-center">
            Escaneando <br /> Directorio...
          </h2>
          <div className="w-full bg-gray-200 h-4 border-2 border-black overflow-hidden mt-4 min-w-[200px] max-w-[300px]">
            <div className="bg-black h-full w-2/3 animate-[pulse_1s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#f4f4f0] text-black selection:bg-yellow-300 selection:text-black font-sans pb-24 pt-20 md:pt-28 px-4 md:px-6">

      {/* Patrón de grilla retro */}
      <div className="fixed inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <main className="relative z-10 max-w-[1000px] mx-auto">

        {/* =========================================
            PANEL DE CONTROL (Buscador y Stats)
            ========================================= */}
        <div className="mb-8 md:mb-12 sticky top-20 z-30">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            {/* Header de la consola */}
            <div className="bg-black text-white p-3 md:w-48 flex items-center justify-between md:justify-center border-b-4 md:border-b-0 md:border-r-4 border-black shrink-0">
              <span className="font-mono text-xs font-bold uppercase flex items-center gap-2">
                <Terminal size={14} className="text-cyan-400" /> /projects
              </span>
              <span className="bg-white text-black font-mono text-[10px] px-1.5 font-bold">
                {filteredProjects.length} RES
              </span>
            </div>

            {/* Input de Búsqueda */}
            <div className="flex-1 flex items-center relative bg-white overflow-hidden">
              <div className="pl-4 text-gray-400">
                <Search size={20} strokeWidth={3} />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o tecnología..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 bg-transparent outline-none font-bold text-sm md:text-base uppercase placeholder:text-gray-400"
              />
            </div>
          </motion.div>
        </div>

        {/* =========================================
            LISTADO DE PROYECTOS (Layout Expediente)
            ========================================= */}
        <div className="flex flex-col gap-8 md:gap-10">
          <AnimatePresence>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((proj, index) => {
                const imageUrl = proj.image_main
                  ? (proj.image_main.startsWith('http') ? proj.image_main : `${BACKEND_URL}${proj.image_main}`)
                  : "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop";

                // Si tu API trae un array de tecnologías, lo usamos. Si no, mostramos un fallback.
                const techs = proj.technologies || ["Backend", "Cloud", "System"];

                return (
                  <motion.div
                    key={proj.slug || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex flex-col md:flex-row border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
                  >
                    {/* Lado Izquierdo: IMAGEN */}
                    <Link
                      href={`/projects/${proj.slug}`}
                      className="w-full md:w-2/5 aspect-video md:aspect-auto border-b-4 md:border-b-0 md:border-r-4 border-black relative overflow-hidden bg-gray-200 shrink-0 cursor-pointer"
                    >
                      <img
                        src={imageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                      {/* Badge decorativo */}
                      <div className="absolute top-3 left-3 bg-yellow-300 border-2 border-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                        <Activity size={12} /> {proj.status || "DEPLOYED"}
                      </div>
                    </Link>

                    {/* Lado Derecho: CONTENIDO */}
                    <div className="p-4 md:p-6 lg:p-8 flex flex-col justify-between flex-1 bg-[#f4f4f0]">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight line-clamp-2 group-hover:text-pink-600 transition-colors">
                            {proj.title}
                          </h2>
                          <Link
                            href={`/projects/${proj.slug}`}
                            onClick={() => trackEvent('click', `view_project_icon_${proj.slug}`)}
                            className="w-10 h-10 shrink-0 border-4 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                          >
                            <ArrowRight size={20} strokeWidth={3} />
                          </Link>
                        </div>

                        <p className="text-sm md:text-base font-medium text-gray-700 leading-relaxed mb-6 line-clamp-3">
                          {proj.short_description || "Información del módulo no disponible. Acceda al detalle para más especificaciones."}
                        </p>

                        {/* Tecnologías */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {techs.map((tech: string, i: number) => (
                            <span
                              key={i}
                              className="bg-black text-white font-mono text-[9px] md:text-[10px] uppercase font-bold px-2 py-1"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link
                          href={`/projects/${proj.slug}`}
                          onClick={() => trackEvent('click', `view_project_btn_${proj.slug}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-4 border-black bg-cyan-300 text-black font-black uppercase tracking-widest text-xs md:text-sm hover:bg-yellow-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                        >
                          <Code2 size={16} strokeWidth={3} /> Inspeccionar
                        </Link>

                        {/* Botón opcional para repo externo (si la API lo trae) */}
                        {proj.repository_url && (
                          <a
                            href={proj.repository_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 flex items-center justify-center border-4 border-black bg-white hover:bg-gray-200 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                          >
                            <ExternalLink size={18} strokeWidth={3} />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              /* =========================================
                 ESTADO VACÍO (Búsqueda sin resultados)
                 ========================================= */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full border-4 border-dashed border-gray-400 bg-white/50 p-10 md:p-16 flex flex-col items-center justify-center text-center"
              >
                <AlertTriangle size={48} className="text-red-500 mb-4" />
                <h3 className="text-xl md:text-2xl font-black uppercase mb-2">0 Resultados</h3>
                <p className="font-mono text-xs md:text-sm text-gray-600 max-w-sm">
                  No hay coincidencias para "<span className="text-black font-bold">{searchQuery}</span>". Intentá con otro término técnico.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-6 border-2 border-black bg-white px-4 py-2 font-mono text-xs font-bold uppercase hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  Limpiar Búsqueda
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
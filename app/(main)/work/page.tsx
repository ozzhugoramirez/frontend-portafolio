"use client";

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Briefcase, Calendar, MapPin, ChevronDown, ChevronUp, 
  CheckCircle2, Code2, Terminal, ExternalLink, ChevronLeft, ChevronRight 
} from 'lucide-react';

// --- ANIMACIÓN DE ENTRADA ---
function FadeInSection({ children }: { children: React.ReactNode }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = domRef.current;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (currentRef) observer.unobserve(currentRef);
        }
      });
    }, { threshold: 0.1 });
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  return (
    <div ref={domRef} className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      {children}
    </div>
  );
}

// --- DATA DE EXPERIENCIA ---
const WORK_EXPERIENCE = [
  {
    id: 1,
    company: "Proyectos Freelance",
    role: "Software Engineer Full-stack",
    period: "2024 - Presente",
    location: "Buenos Aires, Argentina (Remoto)",
    type: "Freelance",
    desc: "Desarrollo de soluciones a medida enfocadas en escalabilidad y performance. Especializado en la transición de arquitecturas monolíticas a microservicios y sistemas Headless.",
    achievements: [
      "Optimización de tiempos de carga en un 40% mediante la implementación de Next.js y SSR.",
      "Diseño de arquitecturas API REST robustas con Django REST Framework.",
      "Despliegue y configuración de servicios en AWS (S3, EC2, RDS)."
    ],
    stack: ["Next.js", "Python", "AWS", "PostgreSQL", "Docker"],
    isCurrent: true
  },
  {
    id: 2,
    company: "Desarrollo Independiente",
    role: "Backend Developer & Architect",
    period: "2023 - 2024",
    location: "Buenos Aires, Argentina",
    type: "Independiente",
    desc: "Enfoque en el desarrollo de lógica de negocio compleja y diseño de bases de datos relacionales.",
    achievements: [
      "Creación de sistemas de gestión de inventarios con Python/Django.",
      "Modelado de datos avanzado para e-commerce con alta concurrencia.",
      "Automatización de procesos mediante scripts en Bash y Python."
    ],
    stack: ["Django", "Python", "Bash", "SQLite/Postgres", "Linux"],
    isCurrent: false
  },
  {
    id: 3,
    company: "Salud & Operaciones",
    role: "Atención Especializada & Logística",
    period: "Pre-2023",
    location: "Paraguay / Argentina",
    type: "Otros",
    desc: "Experiencia previa en rubros de alta responsabilidad y gestión de crisis, lo que aportó habilidades blandas de resolución de problemas bajo presión.",
    achievements: [
      "Gestión de protocolos de emergencia y atención crítica.",
      "Coordinación de logística de insumos y optimización de inventarios físicos.",
      "Liderazgo de equipos pequeños en entornos de alta exigencia."
    ],
    stack: ["Gestión de Crisis", "Logística", "Protocolos de Seguridad"],
    isCurrent: false
  }
];

const CATEGORIES = ["Todos", "Freelance", "Independiente", "Otros"];

export default function WorkPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [expandedId, setExpandedId] = useState<number | null>(1); // El primero empieza abierto
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const filteredWork = activeFilter === "Todos" 
    ? WORK_EXPERIENCE 
    : WORK_EXPERIENCE.filter(w => w.type === activeFilter);

  const totalPages = Math.ceil(filteredWork.length / itemsPerPage);
  const paginatedWork = filteredWork.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-400 font-sans selection:bg-indigo-900 selection:text-white pb-32">
      <Navbar />

      <main className="pt-32 px-4 md:px-8 lg:px-12 max-w-[1000px] mx-auto">
        
        {/* --- HEADER --- */}
        <header className="mb-16 border-b border-gray-800/50 pb-12">
          <FadeInSection>
            <div className="flex items-center gap-3 mb-4 text-indigo-400">
              <Briefcase size={20} />
              <span className="text-xs font-mono uppercase tracking-widest">/ Career Path</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-mono text-white tracking-tighter mb-6">
              Experiencia
            </h1>
            <p className="max-w-xl text-sm md:text-base leading-relaxed text-gray-500">
              Mi trayectoria profesional combinando <span className="text-white">desarrollo de software</span>, arquitectura de sistemas y habilidades de gestión operativa.
            </p>
          </FadeInSection>

          {/* Filtros */}
          <FadeInSection>
            <div className="flex flex-wrap gap-3 mt-10">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-5 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all duration-300 border ${
                    activeFilter === cat 
                      ? 'bg-white text-black border-white' 
                      : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-500 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </FadeInSection>
        </header>

        {/* --- TIMELINE DE EXPERIENCIA --- */}
        <section className="space-y-6">
          {paginatedWork.map((job) => (
            <FadeInSection key={job.id}>
              <div 
                className={`group border transition-all duration-500 rounded-3xl overflow-hidden ${
                  expandedId === job.id ? 'border-indigo-500/50 bg-[#121214]' : 'border-gray-800 bg-[#0d0d0f] hover:border-gray-700'
                }`}
              >
                {/* Cabecera de la Tarjeta (Clickable) */}
                <button 
                  onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
                  className="w-full flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 text-left"
                >
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className={`p-3 rounded-2xl transition-colors ${job.isCurrent ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
                      {job.isCurrent ? <Terminal size={24} /> : <Briefcase size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-medium text-white group-hover:text-indigo-400 transition-colors">
                        {job.role}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
                        <span className="text-indigo-400 font-bold">{job.company}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {job.period}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 ml-14 md:ml-0">
                    {expandedId === job.id ? <ChevronUp size={20} className="text-indigo-400" /> : <ChevronDown size={20} className="text-gray-600" />}
                  </div>
                </button>

                {/* Contenido Expandible */}
                {expandedId === job.id && (
                  <div className="px-6 md:px-8 pb-8 ml-0 md:ml-20 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">Descripción del rol</h4>
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-2xl">
                        {job.desc}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Logros */}
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-indigo-400" /> Logros Clave
                        </h4>
                        <ul className="space-y-3">
                          {job.achievements.map((achievement, i) => (
                            <li key={i} className="text-xs md:text-sm text-gray-400 flex items-start gap-3">
                              <span className="w-1 h-1 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Stack Utilizado */}
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                          <Code2 size={14} className="text-indigo-400" /> Stack Tecnológico
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {job.stack.map(tech => (
                            <span key={tech} className="text-[10px] md:text-xs font-mono bg-[#1a1a1c] border border-gray-800 text-gray-300 px-3 py-1.5 rounded-lg">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FadeInSection>
          ))}
        </section>

        {/* --- PAGINACIÓN --- */}
        {totalPages > 1 && (
          <FadeInSection>
            <div className="mt-16 flex items-center justify-between border-t border-gray-800 pt-8">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors disabled:opacity-20"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Página {currentPage} de {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors disabled:opacity-20"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </FadeInSection>
        )}

        {/* --- FOOTER CTA --- */}
        <FadeInSection>
          <div className="mt-32 p-10 rounded-[2.5rem] bg-gradient-to-br from-[#121214] to-[#09090b] border border-gray-800 text-center">
            <h3 className="text-2xl md:text-3xl font-mono text-white mb-6">¿Buscás un perfil técnico para tu próximo desafío?</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:tu-email@ejemplo.com" className="bg-white text-black px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                Contactame
              </a>
              <a href="/cv-sebastian-villalba.pdf" download className="border border-gray-700 text-white px-8 py-3 rounded-full text-sm font-medium hover:border-white transition-colors flex items-center gap-2">
                Descargar CV completo <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </FadeInSection>

      </main>
    </div>
  );
}
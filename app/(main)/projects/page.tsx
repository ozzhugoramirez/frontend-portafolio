"use client";

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
// 👉 NUEVO: Importamos trackEvent
import { getProjects, trackEvent } from '@/lib/api'; 
import { 
  Github, ExternalLink, Server, LayoutTemplate, 
  ShieldCheck, ArrowRight, ChevronLeft, ChevronRight,
  Code2, Terminal, Smartphone, Database, Globe
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const ICON_MAP: Record<string, React.ReactNode> = {
  server: <Server size={20} />,
  layout: <LayoutTemplate size={20} />,
  shield: <ShieldCheck size={20} />,
  code: <Code2 size={20} />,
  terminal: <Terminal size={20} />,
  mobile: <Smartphone size={20} />,
  database: <Database size={20} />,
  globe: <Globe size={20} />,
  default: <Code2 size={20} />
};

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
    }, { threshold: 0.15 });

    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  return (
    <div ref={domRef} className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
      {children}
    </div>
  );
}

const getDynamicCategories = (projects: any[]) => {
  const cats = new Set(projects.map(p => p.category));
  return ["Todos", ...Array.from(cats)];
};

export default function ProjectsPage() {
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    getProjects()
      .then(data => {
        const results = data.results ? data.results : data;
        setProjectsData(results);
        setLoading(false);
        
        // 👉 NUEVO: Registramos que alguien entró a la página principal de proyectos
        trackEvent('view', 'projects_page');
      })
      .catch(error => {
        console.error("Error al cargar proyectos:", error);
        setLoading(false);
      });
  }, []);

  const CATEGORIES = getDynamicCategories(projectsData);

  const filteredProjects = activeFilter === "Todos" 
    ? projectsData 
    : projectsData.filter(p => p.category === activeFilter);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // 👉 NUEVO: Función auxiliar para no repetir código en cada enlace
  const handleProjectClick = (slug: string) => {
    trackEvent('view', `project-${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-mono text-gray-500 text-xs tracking-widest uppercase">
        Sincronizando repositorios...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-400 font-sans selection:bg-gray-700 selection:text-white pb-32 overflow-x-hidden">
      <Navbar />

      <header className="pt-32 pb-12 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
        <FadeInSection>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-800/50 pb-12">
            <div>
              <h1 className="text-5xl md:text-7xl font-mono text-white tracking-tighter mb-4">
                /projects
              </h1>
              <p className="max-w-xl text-sm md:text-base leading-relaxed text-gray-500">
                Casos de estudio y proyectos destacados. Un recorrido por mis soluciones en <span className="text-gray-300">desarrollo web, arquitectura cloud y ciberseguridad</span>.
              </p>
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-gray-600 hidden md:block text-right">
              Mostrando {filteredProjects.length} <br /> proyectos
            </div>
          </div>
        </FadeInSection>

        <FadeInSection>
          <div className="flex flex-wrap gap-3 mt-8">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-[10px] md:text-xs font-mono uppercase tracking-widest transition-all duration-300 border ${
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

      <main className="px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto mt-12 space-y-32">
        {paginatedProjects.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-mono text-sm">
            No hay proyectos en esta categoría por ahora.
          </div>
        ) : (
          paginatedProjects.map((project, index) => {
            const isEven = index % 2 === 0;
            const projectIcon = ICON_MAP[project.icon_name] || ICON_MAP['default'];

            return (
              <FadeInSection key={project.slug}>
                <article className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}>
                  
                  {/* IMAGEN DEL PROYECTO (Con rastreo) */}
                  <Link 
                    href={`/projects/${project.slug}`} 
                    onClick={() => handleProjectClick(project.slug)} 
                    className="w-full lg:w-1/2 relative group block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl rounded-full"></div>
                    <div className={`w-full aspect-video md:aspect-[4/3] rounded-[2rem] border border-gray-800 bg-gradient-to-br ${project.gradient_class || 'from-zinc-800 to-black'} shadow-2xl relative overflow-hidden transition-transform duration-700 group-hover:scale-[1.02]`}>
                      {project.image_main ? (
                         <img 
                           src={project.image_main.startsWith('http') ? project.image_main : `${BACKEND_URL}${project.image_main}`} 
                           alt={project.title} 
                           className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                         />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-mono text-sm opacity-50">
                          [ Imagen de {project.title} ]
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="w-full lg:w-1/2 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-[#121214] border border-gray-800 rounded-xl text-white">
                        {projectIcon}
                      </div>
                      <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">
                        {project.type}
                      </span>
                    </div>

                    {/* TÍTULO DEL PROYECTO (Con rastreo) */}
                    <Link 
                      href={`/projects/${project.slug}`}
                      onClick={() => handleProjectClick(project.slug)}
                    >
                      <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight hover:text-indigo-400 transition-colors">
                        {project.title}
                      </h2>
                    </Link>
                    
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-8">
                      {project.short_description}
                    </p>

                    <div className="grid grid-cols-2 gap-y-4 mb-8 border-y border-gray-800/50 py-6">
                      <div>
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-3">Stack Principal</h4>
                        <ul className="flex flex-wrap gap-2">
                          {project.tech_stack && project.tech_stack.map((t: string) => (
                            <li key={t} className="text-xs text-gray-300 bg-[#121214] border border-gray-800 px-3 py-1 rounded-full">
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-3">Puntos Clave</h4>
                        <ul className="space-y-2">
                          {project.highlights && project.highlights.map((h: string) => (
                            <li key={h} className="text-xs text-gray-300 flex items-center gap-2">
                              <span className="w-1 h-1 bg-indigo-500 rounded-full"></span> {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* BOTÓN VER DETALLES (Con rastreo) */}
                      <Link 
                        href={`/projects/${project.slug}`} 
                        onClick={() => handleProjectClick(project.slug)}
                        className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                      >
                        Ver Detalles <ArrowRight size={14} />
                      </Link>
                      
                      {/* ENLACES EXTERNOS (Con rastreo individual) */}
                      {project.links?.github && project.links.github !== "#" && (
                        <a 
                          href={project.links.github} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={() => trackEvent('click', `github-${project.slug}`)}
                          className="flex items-center gap-2 bg-[#121214] border border-gray-800 text-white px-6 py-3 rounded-full text-xs font-medium hover:border-gray-500 transition-colors"
                        >
                          Código <Github size={14} />
                        </a>
                      )}
                      {project.links?.live && project.links.live !== "#" && (
                        <a 
                          href={project.links.live} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          onClick={() => trackEvent('click', `live-${project.slug}`)}
                          className="flex items-center gap-2 bg-[#121214] border border-gray-800 text-gray-400 px-4 py-3 rounded-full hover:text-white transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>

                </article>
              </FadeInSection>
            );
          })
        )}

        {/* --- CONTROLES DE PAGINACIÓN --- */}
        {totalPages > 1 && (
          <FadeInSection>
            <div className="mt-20 pt-8 border-t border-gray-800 flex items-center justify-between">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-gray-500"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              
              <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                Página {currentPage} de {totalPages}
              </span>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-gray-500"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </FadeInSection>
        )}
      </main>

      <FadeInSection>
        <div className="max-w-[1400px] mx-auto px-4 mt-32 text-center">
          <h3 className="text-2xl font-mono text-white mb-6">¿Buscás explorar código más específico?</h3>
          <Link href="/lab" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border-b border-gray-700 hover:border-white pb-1">
            Visitá mi Laboratorio de Snippets <ArrowRight size={16} />
          </Link>
        </div>
      </FadeInSection>

    </div>
  );
}
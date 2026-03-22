"use client";

import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
// 1. Importamos la función desde nuestro archivo de servicios centralizado
import { getProfile } from '@/lib/api'; 
import { 
  User, Code2, ShieldCheck, Zap, HeartPulse, 
  MapPin, GraduationCap, Terminal, Languages, ArrowRight 
} from 'lucide-react';

// --- CONFIGURACIÓN ---
// Obtenemos la URL base desde las variables de entorno para las imágenes
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// --- DICCIONARIO DE ÍCONOS ---
// Traduce el string que viene de Django al ícono de Lucide
const ICON_MAP: Record<string, React.ReactNode> = {
  shield: <ShieldCheck size={24} />,
  zap: <Zap size={24} />,
  heart: <HeartPulse size={24} />,
  default: <Code2 size={24} />
};

// --- ANIMACIÓN DE ENTRADA ---
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = domRef.current;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          if (currentRef) observer.unobserve(currentRef);
        }
      });
    }, { threshold: 0.1 });
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, [delay]);

  return (
    <div ref={domRef} className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      {children}
    </div>
  );
}

export default function AboutPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- OBTENER DATOS DE DJANGO MEDIANTE EL SERVICIO ---
  useEffect(() => {
    getProfile()
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error cargando el perfil:", error);
        setLoading(false);
      });
  }, []);

  // Pantalla de carga simple manteniendo tu fondo oscuro
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-mono text-gray-500 text-xs tracking-widest uppercase">
        Iniciando conexión segura...
      </div>
    );
  }

  // Si por algún motivo la API falla, mostramos un error elegante
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-mono text-red-500/50 text-xs tracking-widest uppercase">
        Error al cargar los datos del servidor.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-400 font-sans selection:bg-indigo-900 selection:text-white pb-32">
      <Navbar />

      <main className="pt-32 px-4 md:px-8 lg:px-12 max-w-[1200px] mx-auto">
        
        {/* --- HERO / INTRO --- */}
        <section className="mb-24">
          <FadeInSection>
            <div className="flex items-center gap-3 mb-6 text-indigo-400">
              <User size={20} />
              <span className="text-xs font-mono uppercase tracking-widest">/ About me</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-mono text-white tracking-tighter mb-8 leading-[0.85]">
              {profile.hero_title || "Ingeniería con propósito."}
            </h1>
          </FadeInSection>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16">
            <div className="lg:col-span-7">
              <FadeInSection delay={200}>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
                  {profile.bio_p1 || "Sin biografía disponible."}
                </p>
                <p className="text-base text-gray-400 leading-relaxed mb-8">
                  {profile.bio_p2 || ""}
                </p>
                
                {/* Datos rápidos dinámicos */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 border-t border-gray-800 pt-8">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-gray-600">Ubicación</span>
                    <p className="text-sm text-white flex items-center gap-1.5"><MapPin size={14} className="text-indigo-400"/> {profile.location}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-gray-600">Origen</span>
                    <p className="text-sm text-white">{profile.origin}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-gray-600">Idiomas</span>
                    <p className="text-sm text-white flex items-center gap-1.5"><Languages size={14} className="text-indigo-400"/> {profile.languages}</p>
                  </div>
                </div>
              </FadeInSection>
            </div>

            {/* Foto Dinámica */}
            <div className="lg:col-span-5">
              <FadeInSection delay={400}>
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-transparent blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="aspect-[4/5] bg-gray-800 rounded-[2.5rem] overflow-hidden border border-gray-700 grayscale hover:grayscale-0 transition-all duration-700 relative">
                    {profile.profile_photo ? (
                      <img 
                        src={profile.profile_photo.startsWith('http') ? profile.profile_photo : `${BACKEND_URL}${profile.profile_photo}`} 
                        alt={profile.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs font-mono">
                        [ Tu foto acá ]
                      </div>
                    )}
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* --- MIS PRINCIPIOS --- */}
        <section className="mb-32">
          <FadeInSection>
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-12 border-b border-gray-800 pb-4">Filosofía de Trabajo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {profile.work_philosophy && profile.work_philosophy.map((item: any, index: number) => (
                <PrincipleCard 
                  key={index}
                  icon={ICON_MAP[item.icon] || ICON_MAP['default']}
                  title={item.title}
                  desc={item.desc}
                />
              ))}
            </div>
          </FadeInSection>
        </section>

        {/* --- EDUCACIÓN & BACKGROUND --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <FadeInSection>
            <h2 className="text-2xl font-mono text-white mb-8 flex items-center gap-3">
              <GraduationCap className="text-indigo-400" /> Formación Académica
            </h2>
            <div className="space-y-8">
              {profile.education && profile.education.map((edu: any, index: number) => (
                <EduItem 
                  key={index}
                  title={edu.title}
                  institution={edu.institution}
                  date={edu.date}
                  desc={edu.desc}
                />
              ))}
            </div>
          </FadeInSection>

          <FadeInSection delay={200}>
            <h2 className="text-2xl font-mono text-white mb-8 flex items-center gap-3">
              <Terminal className="text-indigo-400" /> Mi Arsenal
            </h2>
            <div className="bg-[#121214] border border-gray-800 rounded-3xl p-8">
              <div className="space-y-6">
                {profile.arsenal && profile.arsenal.map((group: any, index: number) => (
                  <SkillGroup 
                    key={index} 
                    title={group.category} 
                    skills={group.skills} 
                  />
                ))}
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* --- CTA FINAL --- */}
        <FadeInSection>
          <div className="mt-40 text-center">
            <h3 className="text-3xl md:text-5xl font-mono text-white mb-8 tracking-tighter">¿Hablamos del próximo proyecto?</h3>
            <a href="mailto:tu-email@ejemplo.com" className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-full text-sm font-medium hover:bg-gray-200 transition-all hover:gap-5">
              Enviar un mensaje <ArrowRight size={18} />
            </a>
          </div>
        </FadeInSection>

      </main>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function PrincipleCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 border border-gray-800 rounded-3xl hover:border-indigo-500/50 transition-colors bg-[#0d0d0f]">
      <div className="text-indigo-400 mb-6">{icon}</div>
      <h3 className="text-white font-medium mb-3">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function EduItem({ title, institution, date, desc }: { title: string, institution: string, date: string, desc: string }) {
  return (
    <div className="relative pl-8 border-l border-gray-800">
      <div className="absolute w-2.5 h-2.5 bg-gray-800 rounded-full -left-[5.5px] top-1.5 border border-[#09090b]"></div>
      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{date}</span>
      <h4 className="text-lg text-white font-medium mt-1">{title}</h4>
      <p className="text-xs text-indigo-400 font-mono mb-3">{institution}</p>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function SkillGroup({ title, skills }: { title: string, skills: string[] }) {
  return (
    <div>
      <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill: string) => (
          <span key={skill} className="px-3 py-1 bg-black border border-gray-800 rounded-md text-xs text-gray-300 font-mono italic">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
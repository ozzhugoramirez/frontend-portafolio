"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Github, Linkedin, Mail, ArrowRight, ArrowLeft, ChevronDown, ExternalLink, ShieldCheck, Youtube } from 'lucide-react';
import Navbar from '@/components/Navbar'; 
import { getProfile, getProjects, trackEvent } from '@/lib/api'; 
import Link from 'next/link';


export const DiscordIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);


function FadeInSection({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
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
    <div ref={domRef} className={`transition-all duration-[1200ms] ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}>
      {children}
    </div>
  );
}

export default function Portfolio() {
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(0);

  
  useEffect(() => {
    Promise.all([getProfile(), getProjects()])
      .then(([profileData, projectsData]) => {
        setProfile(profileData);
        const projArray = projectsData.results ? projectsData.results : projectsData;
        setProjects(projArray);
        setLoading(false);

        
        trackEvent('view', 'home');
      })
      .catch(err => {
        console.error("Error cargando el Home:", err);
        setLoading(false);
      });
  }, []);

 
  useEffect(() => {
    if (projects.length <= 1) return;
    const interval = setInterval(() => {
      setActiveProject((prev) => (prev + 1) % projects.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [projects]);

  if (loading) {
    return <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center font-mono text-gray-500 text-xs tracking-widest uppercase animate-pulse">Inicializando sistema...</div>;
  }

  const nextProject = () => setActiveProject((prev) => (prev + 1) % projects.length);
  const prevProject = () => setActiveProject((prev) => (prev === 0 ? projects.length - 1 : prev - 1));

  return (
    <div className="bg-[#0e0e0e] text-gray-400 font-sans selection:bg-gray-700 selection:text-white pb-20 overflow-x-hidden">
      <Navbar />

      {/* =========================================
          SECCIÓN 1: PANTALLA COMPLETA ESTRICTA
          ========================================= */}
      <section className="relative w-full h-[100dvh] min-h-[600px] flex flex-col justify-between pt-24 pb-6 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] border border-gray-800 rounded-full -translate-y-1/2 translate-x-1/3 opacity-30 pointer-events-none"></div>

        {/* --- TÍTULO Y REDES --- */}
        <div className="flex-1 flex flex-col justify-center z-10 w-full">
          <FadeInSection>
            
            <h1 className="text-5xl sm:text-6xl md:text-[6.5vw] font-mono text-white tracking-tighter mb-4 w-full">
              <div className="flex flex-wrap items-center gap-4 md:gap-6 leading-[0.95]">
                <span>Software</span>
                <Link
                  href="/projects" 
                  className="flex-shrink-0 flex items-center gap-2 text-xs md:text-sm font-sans font-medium bg-white text-black px-5 py-2.5 rounded-full hover:bg-gray-200 transition cursor-pointer tracking-normal leading-normal shadow-xl z-20"
                >
                  Projects <ArrowRight size={16} />
                </Link>
              </div>
              <span className="w-full text-left md:text-right block mt-2 md:mt-4 leading-[0.95]">Engineer</span>
            </h1>

            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mt-6 md:mt-8">
              <p className="text-xs md:text-sm max-w-sm leading-relaxed">
                {profile?.hero_title || "Ingeniería con propósito."}
              </p>
             
              <div className="flex flex-wrap gap-2 md:gap-3 justify-start lg:justify-end">
                {profile?.social_links?.github && <SocialButton link={profile.social_links.github} icon={<Github size={14} />} label="Github" />}
                {profile?.social_links?.linkedin && <SocialButton link={profile.social_links.linkedin} icon={<Linkedin size={14} />} label="LinkedIn" />}
                {profile?.social_links?.youtube && <SocialButton link={profile.social_links.youtube} icon={<Youtube size={14} />} label="YouTube" />}
                {profile?.social_links?.tiktok && <SocialButton link={profile.social_links.tiktok} icon={<TikTokIcon size={14} />} label="TikTok" />}
                {profile?.social_links?.email && <SocialButton link={profile.social_links.email} icon={<DiscordIcon size={14} />} label="Discord" />}

              </div>
            </div>
          </FadeInSection>
        </div>

        {/* --- CARRUSEL FLUIDO --- */}
        <div className="flex-shrink-0 z-10 w-full mt-6" id="projects">
          <FadeInSection delay={300}>
            {projects.length > 0 ? (
              <div className="flex items-center justify-center relative w-full h-40 md:h-52 overflow-hidden">
                
                <button onClick={prevProject} className="hidden md:flex absolute left-0 z-30 p-3 border border-gray-700 rounded-full hover:bg-gray-800 hover:text-white transition bg-[#0e0e0e] shadow-lg">
                  <ArrowLeft size={16} />
                </button>

                {projects.map((proj, index) => {
                  let position = 2; 
                  if (index === activeProject) position = 0; 
                  else if (index === (activeProject + 1) % projects.length) position = 1; 
                  else if (index === (activeProject - 1 + projects.length) % projects.length) position = -1; 

                  let transformClass = "opacity-0 scale-75 translate-x-0 z-0 pointer-events-none"; 
                  if (position === 0) {
                    transformClass = "opacity-100 scale-100 z-20 translate-x-0";
                  } else if (position === -1) {
                    transformClass = "opacity-30 scale-90 z-10 -translate-x-[105%] lg:-translate-x-[60%] pointer-events-none hidden md:block";
                  } else if (position === 1) {
                    transformClass = "opacity-30 scale-90 z-10 translate-x-[105%] lg:translate-x-[60%] pointer-events-none hidden md:block";
                  }

                  return (
                    <div key={proj.slug || index} className={`absolute w-full lg:w-1/2 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${transformClass}`}>
                      <ProjectCard project={proj} isMain={position === 0} />
                    </div>
                  );
                })}

                <button onClick={nextProject} className="hidden md:flex absolute right-0 z-30 p-3 border border-gray-700 rounded-full hover:bg-gray-800 hover:text-white transition bg-[#0e0e0e] shadow-lg">
                  <ArrowRight size={16} />
                </button>

              </div>
            ) : (
              <div className="flex items-center justify-center h-40 border border-dashed border-gray-800 rounded-3xl text-xs font-mono text-gray-600">
                Aún no hay proyectos desplegados.
              </div>
            )}
          </FadeInSection>
        </div>
      </section>

      {/* =========================================
          SECCIONES CON SCROLL
          ========================================= */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-20 space-y-40">
        
        {/* --- ABOUT --- */}
        <section id="about" className="relative z-10">
          <FadeInSection>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
              <span className="text-xs uppercase tracking-widest text-gray-500">... /About me ...</span>
              <p className="text-left md:text-right text-sm md:text-base max-w-sm text-gray-300">
                {profile?.bio_p1 || "Soy un ingeniero de software creando soluciones robustas."}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
               <div className="space-y-4">
                {profile?.arsenal && profile.arsenal.length > 0 ? (
                  profile.arsenal.map((item: any, idx: number) => (
                    <SkillBlock 
                      key={idx} 
                      title={item.category} 
                      skills={item.skills.join(' / ')} 
                      bgColor={idx === 0 ? "bg-white" : "bg-transparent"} 
                      textColor={idx === 0 ? "text-black" : "text-gray-400"} 
                    />
                  ))
                ) : (
                  <div className="text-xs text-gray-600 font-mono italic border border-white/5 p-6 rounded-3xl">Datos de arsenal no encontrados.</div>
                )}
              </div>
              
              <div className="h-full min-h-[400px] rounded-[2rem] bg-gray-800 relative grayscale hover:grayscale-0 transition-all duration-500 flex items-center justify-center overflow-hidden border border-white/5">
                 {profile?.profile_photo ? (
                    <img 
                      src={profile.profile_photo.startsWith('http') ? profile.profile_photo : `${process.env.NEXT_PUBLIC_BACKEND_URL}${profile.profile_photo}`} 
                      alt="Sebastian Villalba" 
                      className="w-full h-full object-cover"
                    />
                 ) : (
                   <span className="text-xs font-mono text-gray-500">[ Avatar_Module_Offline ]</span>
                 )}
              </div>
            </div>
          </FadeInSection>
        </section>

        {/* --- CERTIFICADOS --- */}
        <section id="certificates" className="relative z-10">
          <FadeInSection>
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-800 pb-8">
               <div>
                  <h2 className="text-4xl md:text-5xl font-mono text-white mb-2">Certifications</h2>
               </div>
               <span className="text-xs uppercase tracking-widest text-gray-500 hidden md:block">... /Credentials ...</span>
            </div>

            <div className="flex flex-col gap-4">
              {profile?.certifications && profile.certifications.length > 0 ? (
                profile.certifications.map((cert: any, idx: number) => (
                  <CredentialRow 
                    key={idx}
                    title={cert.title} 
                    issuer={cert.issuer} 
                    date={cert.date} 
                    link={cert.link} 
                  />
                ))
              ) : (
                <div className="text-xs text-gray-600 font-mono italic"></div>
              )}
            </div>
          </FadeInSection>
        </section>

      </div>
    </div>
  );
}

// =========================================
// SUBCOMPONENTES
// =========================================

function SocialButton({ icon, label, link }: { icon: React.ReactNode, label: string, link: string }) {
  if (!link || link === "#") return null;


  const handleClick = () => {
    trackEvent('click', label.toLowerCase());
  };

  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer" 
      onClick={handleClick} 
      className="flex items-center gap-2 border border-gray-800 bg-[#151515] px-4 py-2 rounded-full text-xs hover:text-white hover:border-gray-500 transition cursor-pointer"
    >
      {icon} {label}
    </a>
  );
}

function ProjectCard({ project, isMain = false }: { project: any, isMain?: boolean }) {
  if (!project) return null;
  const imageUrl = project.image_main 
    ? (project.image_main.startsWith('http') ? project.image_main : `${process.env.NEXT_PUBLIC_BACKEND_URL}${project.image_main}`) 
    : null;

 
  const handleProjectClick = () => {
    trackEvent('view', `project-${project.slug}`);
  };

  return (
    <div className={`w-full h-40 md:h-52 p-4 md:p-5 rounded-[2rem] border transition-colors duration-500 ${isMain ? 'border-gray-600 bg-[#121214] shadow-2xl' : 'border-gray-800 bg-[#0e0e0e]'} flex flex-row gap-4 overflow-hidden`}>
      <div className={`hidden sm:block w-1/3 md:w-2/5 h-full rounded-2xl bg-gradient-to-br ${project.gradient_class || 'from-gray-800 to-black'} border border-gray-700 overflow-hidden relative flex-shrink-0`}>
        {imageUrl && <img src={imageUrl} alt={project.title} className="w-full h-full object-cover opacity-60" />}
      </div>
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <h3 className={`font-mono text-white mb-2 truncate ${isMain ? 'text-lg md:text-xl' : 'text-base'}`}>{project.title}</h3>
        <p className={`text-[11px] md:text-xs text-gray-400 leading-relaxed line-clamp-2 md:line-clamp-3 ${isMain ? 'mb-4' : ''}`}>{project.short_description}</p>
        
        {isMain && (
          <a 
            href={`/projects/${project.slug}`} 
            onClick={handleProjectClick}
            className="flex items-center justify-center gap-2 text-[10px] md:text-xs bg-white text-black w-max px-5 py-2 rounded-full font-medium hover:bg-gray-200 transition mt-auto cursor-pointer"
          >
            Read more <ArrowRight size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

function SkillBlock({ title, skills, bgColor = "bg-transparent", textColor = "text-gray-400" }: { title: string, skills: string, bgColor?: string, textColor?: string }) {
  return (
    <div className={`border border-gray-800 rounded-3xl p-6 ${bgColor} ${textColor}`}>
      <h4 className={`text-sm mb-3 ${bgColor === 'bg-white' ? 'text-black font-bold' : 'text-white'}`}>{title}</h4>
      <p className="text-[11px] leading-loose font-mono uppercase tracking-wider opacity-80">{skills}</p>
    </div>
  );
}

function CredentialRow({ title, issuer, date, link }: { title: string, issuer: string, date: string, link: string }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border border-gray-800 rounded-2xl hover:border-gray-600 bg-[#121212] transition-colors group">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div className="p-3 bg-gray-800/50 rounded-xl text-white group-hover:bg-white group-hover:text-black transition-colors">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h4 className="text-white font-medium text-base mb-1">{title}</h4>
          <div className="flex items-center gap-3 text-xs font-mono opacity-70">
            <span>{issuer}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span>{date}</span>
          </div>
        </div>
      </div>
      
      {link && link !== "#" && (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={() => trackEvent('click', `credential-${title.toLowerCase().replace(/\s+/g, '-')}`)} // 👉 NUEVO: Registra clicks en certificados
          className="flex items-center gap-2 text-xs border border-gray-700 px-4 py-2 rounded-full hover:text-white hover:border-white transition-colors w-full md:w-auto justify-center md:justify-start"
        >
          Validar Credencial <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}

function TikTokIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 448 512" fill="currentColor">
      <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z"/>
    </svg>
  );
}
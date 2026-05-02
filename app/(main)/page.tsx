"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Play, X, Terminal, Code2, Database,
  FolderCode, Disc, Cpu, Server, Github, Linkedin, Youtube, Mail
} from "lucide-react";
import { getProfile, getProjects, trackEvent } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// --- ÍCONOS CUSTOM ---
const DiscordIcon = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

function TikTokIcon({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 448 512" fill="currentColor" className={className}>
      <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z" />
    </svg>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function Home() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Textos para la marquesina infinita
  const tickerText = " SOFTWARE ENGINEER • BACKEND ARCHITECTURE • CLOUD SYSTEMS • DATA ENGINEERING • DEBIAN ENTHUSIAST • ";

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

  // Resolución de la foto
  const imageUrl = profile?.profile_photo
    ? (profile.profile_photo.startsWith('http') ? profile.profile_photo : `${BACKEND_URL}${profile.profile_photo}`)
    : "/perfil.jpg";

  // Pantalla de carga Brutalista
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f4f4f0] flex flex-col items-center justify-center font-mono text-black">
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col items-center gap-4">
          <Terminal size={48} className="animate-pulse" />
          <h2 className="text-xl font-bold uppercase tracking-widest">Iniciando Sistema...</h2>
          <div className="w-full bg-gray-200 h-4 border-2 border-black overflow-hidden mt-2 min-w-[200px]">
            <div className="bg-black h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#f4f4f0] text-black selection:bg-cyan-300 selection:text-black overflow-x-hidden font-sans">

      {/* Patrón de grilla retro en todo el fondo */}
      <div className="fixed inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* =========================================
          SECCIÓN 1: INTRODUCCIÓN Y TÍTULOS GIGANTES
          ========================================= */}
      <section className="relative w-full max-w-[1200px] mx-auto px-4 md:px-6 py-10 md:py-20 z-10 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

        {/* Izquierda: Títulos y texto */}
        <div className="flex-1 w-full">
          <p className="font-mono text-xs md:text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 border-2 border-black inline-block animate-pulse" />
            <span className="bg-white px-2 border-2 border-black">HOLA / HI</span>
            <span className="hidden sm:inline-block font-normal text-gray-500">
              // {profile?.location?.toUpperCase() || "BUENOS AIRES, AR"}
            </span>
          </p>

          <h1 className="text-[3.5rem] leading-[0.85] sm:text-7xl lg:text-[8rem] font-black tracking-tighter uppercase mb-6 md:mb-8 break-words">
            Welcome <br />
            <span className="font-serif italic font-normal tracking-normal lowercase text-[2.5rem] sm:text-6xl lg:text-8xl">to my</span> <br />
            Portfolio
          </h1>

          <div className="max-w-lg font-medium text-base md:text-lg leading-relaxed space-y-4 md:space-y-6 mb-8">
            {profile?.hero_title && (
              <p className="bg-yellow-300 px-3 py-1 border-2 border-black font-bold uppercase inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                {profile.hero_title}
              </p>
            )}

            <p className="border-l-4 border-black pl-4 bg-white/50 p-2">
              {profile?.bio_p1 || "Soy un Software Engineer enfocado en sistemas backend, arquitectura cloud y rendimiento."}
            </p>

            <p className="bg-white px-4 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {profile?.bio_p2 || "Conecto mi base técnica con herramientas de datos para crear sistemas escalables, listos para producción."}
            </p>
          </div>

          {/* REDES SOCIALES DINÁMICAS */}
          <div className="flex flex-wrap gap-3 mb-10">
            {profile?.social_links?.github && <SocialBtn link={profile.social_links.github} icon={<Github size={18} />} label="github" />}
            {profile?.social_links?.linkedin && <SocialBtn link={profile.social_links.linkedin} icon={<Linkedin size={18} />} label="linkedin" />}
            {profile?.social_links?.youtube && <SocialBtn link={profile.social_links.youtube} icon={<Youtube size={18} />} label="youtube" />}
            {profile?.social_links?.tiktok && <SocialBtn link={profile.social_links.tiktok} icon={<TikTokIcon size={18} />} label="tiktok" />}
            {profile?.social_links?.email && <SocialBtn link={profile.social_links.email} icon={<Mail size={18} />} label="email" />}
            {profile?.social_links?.discord && <SocialBtn link={profile.social_links.discord} icon={<DiscordIcon size={18} />} label="discord" />}
          </div>

          {/* Relleno de espacio con Proyectos Activos (Llamados de la API) */}
          <div className="w-full max-w-sm bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="border-b-4 border-black bg-cyan-300 px-2 py-1 font-mono text-xs font-bold uppercase flex items-center gap-2">
              <FolderCode size={14} /> workspace_status.log
            </div>
            <div className="p-3 md:p-4 font-mono text-xs md:text-sm space-y-3">

              {projects.length > 0 ? (
                projects.slice(0, 2).map((proj, idx) => (
                  <div key={proj.slug || idx} className={`flex justify-between items-start ${idx === 0 ? 'border-b border-gray-200 pb-3' : ''}`}>
                    <div className="pr-2">
                      <span className="font-bold text-blue-600 truncate block max-w-[160px]">{proj.title}</span>
                      <p className="text-gray-600 text-[10px] md:text-xs uppercase line-clamp-1">{proj.short_description || "En desarrollo"}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-1 border border-green-700 animate-pulse shrink-0">ACTIVO</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">No hay proyectos listados aún.</div>
              )}

            </div>
          </div>
        </div>

        {/* Derecha: Foto Dinámica */}
        <div className="w-full max-w-[320px] md:max-w-[400px] mx-auto lg:sticky lg:top-24 order-first lg:order-last mb-8 lg:mb-0">
          <div className="w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] lg:rotate-2 hover:rotate-0 transition-transform duration-300">
            <div className="h-8 border-b-4 border-black bg-gray-200 flex items-center px-2 justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 border-2 border-black bg-white rounded-full" />
                <div className="w-3 h-3 border-2 border-black bg-white rounded-full" />
                <div className="w-3 h-3 border-2 border-black bg-white rounded-full" />
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest">profile.exe</span>
              <div className="w-10" />
            </div>
            <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
              <img
                src={imageUrl}
                alt={profile?.name || "Seba Villalba"}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-black -z-10 bg-[linear-gradient(45deg,#e5e5e5_25%,transparent_25%,transparent_75%,#e5e5e5_75%,#e5e5e5),linear-gradient(45deg,#e5e5e5_25%,transparent_25%,transparent_75%,#e5e5e5_75%,#e5e5e5)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]">
                <span className="font-mono text-sm bg-white border-2 border-black px-2">perfil.jpg</span>
              </div>
            </div>
            <div className="p-2 md:p-3 border-t-4 border-black bg-[#f4f4f0] font-mono text-[10px] md:text-xs font-bold uppercase text-center flex justify-between items-center">
              <span>{profile?.languages ? profile.languages.split(',')[0] : "SYS_ADMIN"}</span>
              <span className="bg-black text-white px-1">UID: 0</span>
            </div>
          </div>
        </div>

      </section>

      {/* =========================================
          MARQUESINA INFINITA
          ========================================= */}
      <div className="w-full border-y-4 border-black bg-cyan-300 overflow-hidden py-3 md:py-4 relative z-20 flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
          className="flex whitespace-nowrap font-black uppercase text-xl md:text-3xl tracking-widest"
        >
          <span>{tickerText}</span>
          <span>{tickerText}</span>
        </motion.div>
      </div>

      {/* =========================================
          SECCIÓN 2: MANIFIESTO 
          ========================================= */}
      <section className="relative w-full border-b-4 border-black bg-white z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:16px_16px]" />

        <div className="hidden lg:block absolute top-20 left-10 opacity-30 animate-spin-slow"><Disc size={64} /></div>
        <div className="hidden lg:block absolute bottom-20 right-10 opacity-30"><Cpu size={64} /></div>

        <div className="max-w-[900px] mx-auto px-4 md:px-6 py-16 md:py-24 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 md:mb-8 leading-[0.9]">
            Sistemas <br className="md:hidden" />
            <span className="font-serif italic font-normal text-5xl sm:text-6xl md:text-8xl">a prueba de todo</span>
          </h2>

          <div className="font-mono text-sm md:text-base max-w-2xl mx-auto space-y-4 text-left border-l-4 border-black pl-4 md:pl-6 bg-white/80 p-2">
            <p className="uppercase font-bold text-blue-600">{'/* Mi enfoque técnico */'}</p>
            <p>Desde el primer commit, mi objetivo es claro: armar arquitecturas que no se caigan. Ya sea diseñando APIs robustas, integrando bases de datos complejas o configurando infraestructuras en la nube.</p>
            <p className="bg-yellow-200 inline-block px-1">Me gusta entender cómo interactúa el sistema completo desde el Kernel hasta el Frontend.</p>
            <p>Por eso mi entorno natural es la terminal, los servidores y el diseño de datos.</p>
          </div>

          <div className="mt-12 md:mt-16 mx-auto w-full max-w-xl bg-[#f4f4f0] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col">
            <div className="border-b-4 border-black bg-black text-white px-3 py-1 font-mono text-[10px] md:text-xs uppercase flex justify-between">
              <span>root@localhost:~</span>
              <span>_ [] X</span>
            </div>
            <div className="p-4 md:p-6 font-mono text-xs md:text-sm overflow-x-hidden">
              <span className="text-green-600 font-bold">seba@vexa:~$</span> ./execute_vision.sh <br />
              <br />
              <span className="text-gray-800">
                &quot;NO HAY UNA ÚNICA RESPUESTA CORRECTA EN INGENIERÍA, PERO SIEMPRE HAY UNA MÁS EFICIENTE.&quot;
              </span> <br />
              <span className="animate-pulse block mt-2 font-black text-lg">_</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECCIÓN 3: SKILLS Y ACCIONES
          ========================================= */}
      <section className="relative w-full max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-24 z-10">

        <div className="flex flex-col justify-start mb-8 md:mb-12 border-b-4 border-black pb-4 md:pb-6">
          <h2 className="text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none flex items-center flex-wrap gap-2 md:gap-4">
            Skills <span className="hidden sm:inline-block hover:translate-x-2 hover:-translate-y-2 transition-transform cursor-pointer">↗</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-start">

          {/* Stack Técnico Dinámico basado en tu API */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {profile?.arsenal && profile.arsenal.length > 0
              ? profile.arsenal.slice(0, 6).map((group: any, i: number) => (
                <div
                  key={i}
                  className={`flex flex-col items-start justify-start gap-3 p-4 md:p-5 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${i % 2 === 0 ? 'bg-white' : 'bg-pink-100'}`}
                >
                  <div className="flex items-center gap-2 font-black uppercase text-xs md:text-sm border-b-4 border-black pb-2 w-full text-left">
                    <Terminal size={18} className="shrink-0" />
                    <span className="truncate">{group.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 w-full">
                    {group.skills.map((skill: string, j: number) => (
                      <span
                        key={j}
                        className="bg-black text-white text-[9px] md:text-[10px] font-mono px-2 py-1 uppercase font-bold tracking-wider"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))
              : (
                // Fallback si la API tarda o no carga
                <div className="col-span-full text-xs font-mono font-bold uppercase p-4 border-4 border-black bg-yellow-300">
                  Cargando módulos de sistema...
                </div>
              )
            }
          </div>

          <div className="flex flex-col gap-4 md:gap-6 mt-4 lg:mt-0">
            <Link
              href="/projects"
              className="group w-full flex items-center justify-between h-16 md:h-20 px-4 md:px-8 bg-black text-white text-xl md:text-2xl font-black uppercase tracking-wider border-4 border-black hover:bg-cyan-300 hover:text-black transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <span>Ver Proyectos</span>
              <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
            </Link>

            {/* Video CV adaptado para que use el link de YouTube de tu perfil si existe */}
            <button
              onClick={() => setIsVideoOpen(true)}
              className="group w-full flex items-center justify-between h-16 md:h-20 px-4 md:px-8 bg-white text-black text-xl md:text-2xl font-black uppercase tracking-wider border-4 border-black hover:bg-yellow-300 transition-colors shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <Play size={24} className="fill-black" />
                <span>Video CV</span>
              </div>
            </button>
          </div>

        </div>
      </section>

      {/* =========================================
          MODAL DE VIDEO
          ========================================= */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#f4f4f0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col"
            >
              <div className="h-8 md:h-10 border-b-4 border-black bg-blue-600 flex items-center justify-between px-2">
                <span className="font-mono text-white text-xs md:text-sm font-bold flex items-center gap-2 truncate pr-2">
                  <Play size={14} className="fill-white shrink-0" /> video_cv_play.exe
                </span>
                <button
                  onClick={() => setIsVideoOpen(false)}
                  className="h-6 w-6 shrink-0 bg-gray-200 border-2 border-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
              <div className="p-2 md:p-3 bg-gray-200">
                <div className="w-full aspect-video bg-black border-2 md:border-4 border-black relative">
                  {/* Usa el link de YouTube de tu API, o un placeholder si no hay */}
                  <iframe
                    width="100%" height="100%"
                    src={profile?.social_links?.youtube
                      ? profile.social_links.youtube.replace("watch?v=", "embed/")
                      : "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    }
                    title="Video CV" frameBorder="0" allow="autoplay; fullscreen" className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- SUBCOMPONENTE BOTÓN SOCIAL BRUTALISTA ---
function SocialBtn({ icon, link, label }: { icon: React.ReactNode, link: string, label: string }) {
  if (!link || link === "#") return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('click', label)}
      className="p-3 border-2 border-black bg-white text-black hover:bg-yellow-300 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
    >
      {icon}
    </a>
  );
}
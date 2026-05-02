"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Terminal,
  ExternalLink,
  MapPin,
  Languages,
  Award,
  Clock,
  Activity,
  Briefcase,
  Database,
  Cpu
} from "lucide-react";
import { getProfile, trackEvent } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Array de colores Brutalistas para iterar en la educación que viene de la API
const STATUS_COLORS = [
  "bg-green-300",
  "bg-yellow-300",
  "bg-pink-300",
  "bg-cyan-300",
  "bg-purple-300"
];

const ICONS = [
  <Terminal size={20} key="term" />,
  <Database size={20} key="db" />,
  <Cpu size={20} key="cpu" />,
  <Activity size={20} key="act" />
];

export default function BioEduPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        setLoading(false);
        trackEvent('view', 'bio_edu');
      })
      .catch((error) => {
        console.error("Error cargando el perfil:", error);
        setLoading(false);
      });
  }, []);

  // Pantalla de carga Brutalista
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f4f4f0] flex flex-col items-center justify-center font-mono text-black">
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col items-center gap-4">
          <Terminal size={48} className="animate-pulse" />
          <h2 className="text-xl font-bold uppercase tracking-widest">Cargando Expediente...</h2>
          <div className="w-full bg-gray-200 h-4 border-2 border-black overflow-hidden mt-2 min-w-[200px]">
            <div className="bg-black h-full w-1/2 animate-[pulse_1s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Ahora solo tomamos la información real que viene de tu API
  const timelineData = profile?.education || [];

  return (
    <div className="relative min-h-screen w-full bg-[#f4f4f0] text-black selection:bg-cyan-300 selection:text-black overflow-x-hidden font-sans pb-24">

      {/* Patrón de grilla retro */}
      <div className="fixed inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <main className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-6 pt-6 md:pt-12">

        {/* --- HEADER DEL EXPEDIENTE --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 md:mb-16 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          {/* Barra superior estilo ventana */}
          <div className="h-10 border-b-4 border-black bg-yellow-300 flex items-center justify-between px-2 md:px-4">
            <span className="font-mono text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2 truncate">
              <span className="w-3 h-3 bg-red-500 border-2 border-black rounded-full shrink-0" />
              <span className="truncate">system_profile.bio</span>
            </span>
            <span className="font-mono text-[10px] md:text-xs font-bold uppercase shrink-0">
              ID: DEV-{new Date().getFullYear().toString().slice(-2)}
            </span>
          </div>

          {/* lg:items-start asegura que si el texto es largo, los widgets de la derecha queden arriba y no floten en el medio */}
          <div className="p-5 md:p-10 lg:p-12 flex flex-col lg:flex-row gap-8 lg:gap-16 items-start lg:items-start">

            {/* Título y Bio conectada a la API */}
            <div className="flex-1 w-full">
              <h1 className="text-[3.5rem] leading-[0.85] sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-4 md:mb-6 break-words">
                Bio & <br />
                <span className="font-serif italic font-normal text-cyan-500">Edu</span>
              </h1>

              {/* Cambiamos text-xl por text-sm/base para que un párrafo largo se lea bien y no rompa todo */}
              <div className="text-sm md:text-base font-medium border-l-4 border-black pl-3 md:pl-4 max-w-2xl text-gray-800 leading-relaxed space-y-4">
                <p>
                  {profile?.bio_p1 || "Buscando biografía en el servidor..."}
                </p>
                {profile?.bio_p2 && (
                  <p className="bg-pink-200 p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                    {profile.bio_p2}
                  </p>
                )}
              </div>
            </div>

            {/* Datos rápidos (Widgets conectados a la API) */}
            <div className="w-full lg:w-auto flex flex-col gap-3 md:gap-4 shrink-0 lg:w-[300px]">
              <div className="flex items-center gap-3 p-3 border-4 border-black bg-[#f4f4f0] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                <MapPin size={20} className="md:w-6 md:h-6 shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono text-[9px] md:text-[10px] text-gray-500 uppercase truncate">Base de Operaciones</p>
                  <p className="font-bold text-xs md:text-sm uppercase truncate">{profile?.location || "CABA, Buenos Aires"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border-4 border-black bg-[#f4f4f0] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                <Languages size={20} className="md:w-6 md:h-6 shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono text-[9px] md:text-[10px] text-gray-500 uppercase truncate">Comunicación / Idiomas</p>
                  <p className="font-bold text-xs md:text-sm uppercase truncate">{profile?.languages || "ES / EN (B2) / Guaraní"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border-4 border-black bg-[#f4f4f0] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
                <Briefcase size={20} className="md:w-6 md:h-6 shrink-0" />
                <div className="min-w-0">
                  <p className="font-mono text-[9px] md:text-[10px] text-gray-500 uppercase truncate">Sector de Origen</p>
                  <p className="font-bold text-xs md:text-sm uppercase truncate">{profile?.origin || "Sector Comercio / Tech"}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- GRID DIVISORIO --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 md:gap-12">

          {/* COLUMNA IZQUIERDA: LÍNEA DE TIEMPO ACADÉMICA (Ocupa 7 columnas) */}
          <div className="xl:col-span-7">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 border-b-4 border-black pb-3 md:pb-4">
              <GraduationCap size={32} className="bg-cyan-300 border-2 border-black p-1 md:w-10 md:h-10" />
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Timeline</h2>
            </div>

            <div className="flex flex-col gap-6 md:gap-8 relative">
              {timelineData.length > 0 ? (
                <>
                  {/* Línea vertical de la timeline */}
                  <div className="absolute top-0 bottom-0 left-[24px] md:left-[28px] w-2 bg-black z-0"></div>

                  {timelineData.map((item: any, index: number) => {
                    const statusColor = STATUS_COLORS[index % STATUS_COLORS.length];
                    const icon = ICONS[index % ICONS.length];

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: index * 0.1 }}
                        className="relative z-10 flex gap-3 md:gap-6 w-full"
                      >
                        {/* Punto de la timeline */}
                        <div className="shrink-0 mt-3 md:mt-4">
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            {icon}
                          </div>
                        </div>

                        {/* Tarjeta del hito */}
                        <div className="flex-1 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 md:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col overflow-hidden min-w-0">
                          <div className="border-b-4 border-black p-2 md:p-3 bg-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className={`font-mono text-[9px] md:text-xs font-bold uppercase px-2 py-1 border-2 border-black inline-block w-max ${statusColor}`}>
                              REGISTRO ACADÉMICO
                            </span>
                            <span className="font-mono text-[10px] md:text-xs font-bold bg-black text-white px-2 py-1 w-max">
                              {item.date}
                            </span>
                          </div>
                          <div className="p-3 md:p-6">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight mb-1 leading-none break-words">
                              {item.title}
                            </h3>
                            <p className="font-mono text-[10px] md:text-sm text-cyan-600 font-bold uppercase mb-3 md:mb-4">
                              {item.institution}
                            </p>
                            <p className="text-xs sm:text-sm md:text-base font-medium text-gray-700 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </>
              ) : (
                <div className="border-4 border-dashed border-gray-400 p-8 flex flex-col items-center justify-center text-center bg-white/50">
                  <Terminal size={32} className="text-gray-400 mb-2" />
                  <p className="font-mono text-xs font-bold uppercase text-gray-500">Sin registros en la base de datos.</p>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA: CERTIFICADOS (Ocupa 5 columnas) */}
          <div className="xl:col-span-5 mt-4 md:mt-0">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 border-b-4 border-black pb-3 md:pb-4 xl:sticky xl:top-24 bg-[#f4f4f0] z-20">
              <Award size={32} className="bg-yellow-300 border-2 border-black p-1 md:w-10 md:h-10" />
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Credentials</h2>
            </div>

            <div className="flex flex-col gap-6 md:gap-8">
              {profile?.certifications && profile.certifications.length > 0 ? (
                profile.certifications.map((cert: any, idx: number) => {
                  const hasImage = cert.image && cert.image !== "";

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: idx * 0.15 }}
                      className="w-full border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group hover:-translate-y-1 md:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col"
                    >
                      {/* PREVIEW DEL CERTIFICADO */}
                      <div className="w-full aspect-video bg-gray-200 border-b-4 border-black relative overflow-hidden p-1 md:p-2">
                        <div className="absolute inset-0 bg-[radial-gradient(#ccc_2px,transparent_2px)] [background-size:16px_16px] opacity-30" />

                        <div className="w-full h-full border-2 border-dashed border-gray-400 flex items-center justify-center relative z-10 overflow-hidden bg-white/50 backdrop-blur-sm">
                          {hasImage ? (
                            <img
                              src={cert.image.startsWith('http') ? cert.image : `${BACKEND_URL}${cert.image}`}
                              alt={`Certificado ${cert.title}`}
                              className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center opacity-40">
                              <Award size={48} className="mb-2" />
                              <span className="font-mono text-xs font-bold uppercase">Diploma_File.pdf</span>
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-0.5 font-mono text-[9px] md:text-[10px] uppercase font-bold">
                            VERIFIED.IMG
                          </div>
                        </div>
                      </div>

                      {/* INFO Y BOTÓN DE VALIDACIÓN */}
                      <div className="p-3 md:p-5 flex flex-col justify-between grow">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="text-base sm:text-lg md:text-xl font-black uppercase leading-tight">{cert.title}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-1 md:gap-2 font-mono text-[9px] md:text-xs uppercase font-bold text-gray-500 mb-4 md:mb-6">
                            <span className="bg-gray-200 text-black px-1 border border-black">{cert.issuer}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{cert.date}</span>
                          </div>
                        </div>

                        {cert.link && cert.link !== "#" ? (
                          <a
                            href={cert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent('click', `credential-${cert.title.toLowerCase().replace(/\s+/g, '-')}`)}
                            className="w-full h-10 md:h-12 border-4 border-black bg-pink-300 hover:bg-cyan-300 text-black font-black text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            Validar Credencial <ExternalLink size={16} strokeWidth={3} />
                          </a>
                        ) : (
                          <div className="w-full h-10 md:h-12 border-4 border-black bg-gray-200 text-gray-500 font-black text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-2">
                            Credencial Interna <Award size={16} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="border-4 border-dashed border-gray-400 p-4 md:p-6 flex flex-col items-center justify-center text-center bg-white/50 min-h-[200px]">
                  <Clock size={32} className="text-gray-400 mb-2" />
                  <p className="font-mono text-xs font-bold uppercase text-gray-500">Buscando certificaciones en la base de datos...</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
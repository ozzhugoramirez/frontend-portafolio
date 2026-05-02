"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getProjectBySlug, trackEvent } from '@/lib/api';
import {
  ArrowLeft, Github, Terminal, Cpu, ShieldAlert, FolderOpen,
  FileCode2, Activity, Database, Download, Image as ImageIcon,
  Clock, GitBranch, Copy, Check, ExternalLink, Youtube, Code2, Zap
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// --- HELPER PARA EXTRAER EL ID DE YOUTUBE SEGURO ---
const getYoutubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
};

export default function ProjectDetailTechnical() {
  const params = useParams();
  const projectSlug = params.slug as string || params.id as string; // Soporta si el archivo es [slug] o [id]

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!projectSlug) return;
    setLoading(true);
    getProjectBySlug(projectSlug)
      .then(data => {
        setProject(data);
        setLoading(false);
        trackEvent('view', `project_detail_${projectSlug}`);
      })
      .catch(err => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [projectSlug]);

  const handleCopy = (text: string, type: 'clone' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'clone') {
      setCopiedClone(true);
      setTimeout(() => setCopiedClone(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // --- PANTALLAS DE CARGA Y ERROR BRUTALISTAS ---
  if (loading) return (
    <div className="min-h-screen bg-[#f4f4f0] flex flex-col items-center justify-center font-mono text-black">
      <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 flex flex-col items-center gap-4">
        <Terminal size={48} className="animate-pulse" />
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-center">Desencriptando <br /> Archivos...</h2>
        <div className="w-full bg-gray-200 h-4 border-2 border-black overflow-hidden mt-4 min-w-[200px]">
          <div className="bg-black h-full w-3/4 animate-[pulse_1s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );

  if (error || !project) return (
    <div className="min-h-screen bg-[#f4f4f0] flex flex-col items-center justify-center font-mono text-black">
      <div className="border-4 border-black bg-red-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 flex flex-col items-center gap-4">
        <ShieldAlert size={48} />
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-center">Error 404 <br /> Repositorio no encontrado</h2>
        <Link href="/projects" className="mt-4 bg-white border-4 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors uppercase font-bold text-xs">
          Regresar a Base
        </Link>
      </div>
    </div>
  );

  const youtubeEmbedUrl = project.youtube_url ? getYoutubeEmbedUrl(project.youtube_url) : null;

  return (
    <div className="relative min-h-screen w-full bg-[#f4f4f0] text-black selection:bg-cyan-300 selection:text-black overflow-x-hidden font-sans pb-32 pt-24 px-4 md:px-6">

      {/* Fondo Retro */}
      <div className="fixed inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <main className="relative z-10 max-w-[1200px] mx-auto">

        {/* BOTÓN VOLVER */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 border-4 border-black bg-white hover:bg-yellow-300 font-mono text-xs md:text-sm font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all mb-8 md:mb-12"
        >
          <ArrowLeft size={16} strokeWidth={3} /> Volver al Directorio
        </Link>

        {/* --- 1. CABECERA PRINCIPAL BRUTALISTA --- */}
        <header className="mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          >
            {/* Falsa ventana superior */}
            <div className="bg-pink-300 border-b-4 border-black p-2 md:p-3 flex items-center justify-between">
              <span className="font-mono text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Terminal size={16} /> /projects/{project.slug}
              </span>
              <div className="flex gap-2">
                <span className="w-3 h-3 md:w-4 md:h-4 bg-white border-2 border-black rounded-full" />
                <span className="w-3 h-3 md:w-4 md:h-4 bg-black border-2 border-black rounded-full" />
              </div>
            </div>

            <div className="p-6 md:p-10 lg:p-12">
              <div className="flex flex-col lg:flex-row gap-6 justify-between items-start mb-6 border-b-4 border-black pb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">{project.title}</h1>
                    {project.version && (
                      <span className="bg-cyan-300 px-2 border-2 border-black font-mono text-xs md:text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-3">
                        v{project.version}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs md:text-sm uppercase font-bold text-gray-500 block mt-2">
                    [{project.type || "SYS_MODULE"}] // {project.category || "GENERAL"}
                  </span>
                </div>

                {/* Botones de Acción Rápidos */}
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                  {project.links?.github && project.links.github !== "#" && (
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="flex-1 lg:flex-none flex items-center justify-center gap-2 border-4 border-black bg-white px-4 py-3 font-black uppercase hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all text-xs md:text-sm">
                      <Github size={18} /> Repo
                    </a>
                  )}
                  {project.links?.live && project.links.live !== "#" && (
                    <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="flex-1 lg:flex-none flex items-center justify-center gap-2 border-4 border-black bg-black text-white px-4 py-3 font-black uppercase hover:bg-cyan-300 hover:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all text-xs md:text-sm">
                      <ExternalLink size={18} /> Deploy
                    </a>
                  )}
                </div>
              </div>

              <p className="text-base md:text-xl font-medium leading-relaxed max-w-4xl mb-8 border-l-4 border-black pl-4">
                {project.short_description}
              </p>

              {/* TECH STACK BADGES */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tech_stack.map((tech: string, i: number) => (
                    <span key={i} className="text-[10px] md:text-xs font-mono font-bold uppercase px-3 py-1 bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* CLONE COMMAND */}
              {project.clone_cmd && (
                <div className="flex items-stretch border-4 border-black bg-gray-200 max-w-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="bg-black text-green-400 px-4 py-3 text-xs md:text-sm font-mono flex-1 overflow-x-auto whitespace-nowrap">
                    <span className="text-pink-500 font-bold mr-2">$</span> {project.clone_cmd}
                  </div>
                  <button
                    onClick={() => handleCopy(project.clone_cmd, 'clone')}
                    className="px-4 bg-white border-l-4 border-black hover:bg-yellow-300 flex items-center justify-center transition-colors shrink-0 active:bg-cyan-300"
                  >
                    {copiedClone ? <Check size={20} strokeWidth={3} /> : <Copy size={20} strokeWidth={3} />}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </header>

        {/* --- 2. MÉTRICAS --- */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 md:mb-20">
            {project.metrics.map((m: any, i: number) => (
              <div key={i} className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 md:p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex justify-between items-start mb-4 border-b-4 border-black pb-4">
                  <Activity size={24} strokeWidth={3} className="text-black" />
                  {m.trend && <span className="font-mono text-[10px] font-bold uppercase bg-cyan-300 px-2 py-1 border-2 border-black">{m.trend}</span>}
                </div>
                <h4 className="font-mono text-xs md:text-sm font-bold uppercase text-gray-600 mb-1">{m.label}</h4>
                <span className="text-3xl md:text-4xl font-black">{m.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* --- 3. VIDEO YOUTUBE --- */}
        {youtubeEmbedUrl && (
          <section className="mb-16 md:mb-20">
            <h3 className="text-2xl md:text-3xl font-black uppercase mb-6 flex items-center gap-3 bg-red-400 text-black w-max px-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Youtube size={28} /> Demo_Video
            </h3>
            <div className="w-full aspect-video border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-black overflow-hidden relative">
              <iframe
                src={youtubeEmbedUrl}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                title={`Demostración de ${project.title}`}
              ></iframe>
            </div>
          </section>
        )}

        {/* --- 4. GALERÍA ADAPTATIVA --- */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="mb-16 md:mb-20">
            <h3 className="text-2xl md:text-3xl font-black uppercase mb-6 flex items-center gap-3 bg-yellow-300 text-black w-max px-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ImageIcon size={28} /> Gallery
            </h3>
            <div className={`grid gap-6 md:gap-8 ${project.gallery.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {project.gallery.map((img: any) => (
                <div key={img.id} className="group border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                  <div className="w-full aspect-video border-b-4 border-black bg-gray-200 overflow-hidden relative cursor-pointer">
                    <img
                      src={img.image.startsWith('http') ? img.image : `${BACKEND_URL}${img.image}`}
                      alt={img.caption || `Captura de ${project.title}`}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  {(img.caption || img.description) && (
                    <div className="p-4 bg-[#f4f4f0] flex-1">
                      {img.caption && <h4 className="text-sm font-black uppercase mb-1">{img.caption}</h4>}
                      {img.description && <p className="text-xs font-medium text-gray-700">{img.description}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- 5. GRILLA TÉCNICA (Split Screen) --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-16">

          {/* COLUMNA IZQUIERDA (Info técnica, requisitos, logs) */}
          <div className="xl:col-span-4 space-y-10">

            {/* Highlights */}
            {project.highlights && project.highlights.length > 0 && (
              <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5">
                <h3 className="text-base font-black uppercase mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
                  <Zap size={20} className="text-yellow-500 fill-yellow-500" /> Puntos Clave
                </h3>
                <ul className="space-y-3 font-medium text-sm">
                  {project.highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-black shrink-0 mt-1.5" /> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerrequisitos */}
            {project.prerequisites && project.prerequisites.length > 0 && (
              <div className="border-4 border-black bg-pink-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5">
                <h3 className="text-base font-black uppercase mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
                  <Cpu size={20} /> Req_Sistema
                </h3>
                <ul className="space-y-3 font-mono text-xs font-bold uppercase">
                  {project.prerequisites.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="bg-black text-white px-1 mt-0.5">REQ</span> {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Estructura Core */}
            {project.structure && project.structure.length > 0 && (
              <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-cyan-300 border-b-4 border-black p-3 font-black uppercase flex items-center gap-2">
                  <Database size={20} /> Arbol de Directorios
                </div>
                <div className="p-4 bg-gray-100 font-mono text-xs font-bold space-y-3">
                  {project.structure.map((item: any, i: number) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 text-black">
                        {item.type === 'folder' ? <FolderOpen size={16} className="fill-yellow-400" /> : <FileCode2 size={16} />}
                        <span>{item.name}</span>
                      </div>
                      <div className="pl-6 pt-1 text-gray-500 text-[10px]">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Changelog (Historial) */}
            {project.changelog && project.changelog.length > 0 && (
              <div className="border-4 border-black bg-[#f4f4f0] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5">
                <h3 className="text-base font-black uppercase mb-6 flex items-center gap-2 border-b-4 border-black pb-2">
                  <GitBranch size={20} /> Changelog
                </h3>
                <div className="space-y-6 relative border-l-4 border-black ml-2">
                  {project.changelog.map((log: any, i: number) => (
                    <div key={i} className="relative pl-6">
                      {/* Círculo en la línea */}
                      <div className="absolute w-4 h-4 bg-white border-4 border-black rounded-full -left-[10px] top-0"></div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2 py-0.5">
                          {log.version}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-gray-600 flex items-center gap-1">
                          <Clock size={12} /> {log.date}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {log.updates && log.updates.map((update: string, j: number) => (
                          <li key={j} className="text-[11px] font-medium text-gray-800 flex items-start gap-1">
                            <span className="font-bold text-pink-500">{'>_'}</span> {update}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA (Análisis, Instalación, Código) */}
          <div className="xl:col-span-8 space-y-12">

            {/* Análisis y Seguridad */}
            {project.analysis_text && (
              <section className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="bg-yellow-300 border-b-4 border-black p-3 md:p-4">
                  <h3 className="text-lg md:text-xl font-black uppercase flex items-center gap-2">
                    <ShieldAlert size={24} strokeWidth={3} /> Análisis de Arquitectura
                  </h3>
                </div>
                <div className="p-5 md:p-8">
                  <p className="text-sm md:text-base font-medium text-gray-800 leading-relaxed whitespace-pre-line">
                    {project.analysis_text}
                  </p>
                </div>
              </section>
            )}

            {/* Secuencia de Instalación */}
            {project.install_steps && project.install_steps.length > 0 && (
              <section className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="bg-cyan-300 border-b-4 border-black p-3 md:p-4">
                  <h3 className="text-lg md:text-xl font-black uppercase flex items-center gap-2">
                    <Download size={24} strokeWidth={3} /> Pasos de Instalación
                  </h3>
                </div>
                <div className="bg-[#f4f4f0] flex flex-col">
                  {project.install_steps.map((step: any, i: number) => (
                    <div key={i} className={`p-4 md:p-6 ${i !== project.install_steps.length - 1 ? 'border-b-4 border-black' : ''}`}>
                      <div className="text-[10px] md:text-xs font-mono font-bold bg-black text-white px-2 py-1 uppercase inline-block mb-3">
                        Paso 0{i + 1} // {step.step}
                      </div>
                      <div className="bg-black text-green-400 p-4 font-mono text-xs md:text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] overflow-x-auto whitespace-nowrap">
                        <span className="text-pink-500 font-bold mr-2">$</span>{step.code}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Código Destacado */}
            {project.core_code && (
              <section className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                {/* Cabecera de consola hacker/brutalista */}
                <div className="bg-black border-b-4 border-black p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 bg-white border-2 border-white rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-400 border-2 border-gray-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-600 border-2 border-gray-600 rounded-full"></div>
                    </div>
                    <span className="font-mono text-xs font-bold uppercase text-white tracking-widest hidden sm:block">
                      Core_Snippet.tsx
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(project.core_code, 'code')}
                    className="bg-white text-black px-2 py-1 font-mono text-[10px] font-bold uppercase border-2 border-white hover:bg-yellow-300 transition-colors flex items-center gap-1"
                  >
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCode ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                {/* Cuerpo del código */}
                <div className="p-4 md:p-6 bg-[#1a1a1a] overflow-x-auto max-h-[500px]">
                  <pre className="text-[11px] md:text-xs font-mono leading-relaxed text-gray-300">
                    <code>{project.core_code}</code>
                  </pre>
                </div>
              </section>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
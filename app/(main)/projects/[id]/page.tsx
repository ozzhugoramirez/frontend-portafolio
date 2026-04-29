"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { getProjectBySlug } from '@/lib/api';
import {
  ArrowLeft, Github, TerminalSquare, Cpu, ShieldAlert, Folder,
  FileCode2, Activity, Database, CheckCircle2, Download, Image as ImageIcon,
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
  return null; // Fallback por si la URL es inválida
};

export default function ProjectDetailTechnical() {
  const params = useParams();
  const projectSlug = params.id as string;

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

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-mono text-gray-500 text-xs tracking-widest uppercase animate-pulse">Desencriptando archivos...</div>;
  if (error || !project) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-mono text-red-500 text-xs tracking-widest uppercase">Error 404: Repositorio no encontrado.</div>;

  const youtubeEmbedUrl = project.youtube_url ? getYoutubeEmbedUrl(project.youtube_url) : null;

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-400 font-sans selection:bg-indigo-900 selection:text-white pb-32">


      <main className="pt-32 px-4 md:px-8 lg:px-12 max-w-[1200px] mx-auto">
        <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Volver a Proyectos
        </Link>

        {/* --- 1. CABECERA PRINCIPAL --- */}
        <header className="mb-16 border-b border-white/5 pb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-900/20 border border-indigo-900/50 rounded-xl text-indigo-400 shadow-lg shadow-indigo-900/10">
              <TerminalSquare size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-mono text-white tracking-tight">{project.title}</h1>
                {project.version && <span className="text-[10px] md:text-xs font-mono px-2 py-1 bg-white/5 border border-white/10 rounded-md text-emerald-400">{project.version}</span>}
              </div>
              <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-gray-500 mt-2 block">
                {project.type} <span className="mx-2 opacity-50">|</span> <span className="text-indigo-400/70">{project.category}</span>
              </span>
            </div>
          </div>

          <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-4xl mb-6">
            {project.short_description}
          </p>

          {/* TECH STACK BADGES */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {project.tech_stack.map((tech: string, i: number) => (
                <span key={i} className="text-[10px] font-mono px-3 py-1 bg-[#121214] border border-gray-800 text-gray-400 rounded-md hover:border-indigo-500/50 hover:text-indigo-300 transition-colors cursor-default">
                  {tech}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            {project.links?.github && project.links.github !== "#" && (
              <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl text-xs font-mono font-medium hover:bg-gray-200 transition-colors">
                <Github size={16} /> GitHub Repo
              </a>
            )}
            {project.links?.live && project.links.live !== "#" && (
              <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-xl text-xs font-mono hover:bg-white/10 transition-colors">
                <ExternalLink size={16} /> Live Demo
              </a>
            )}
            {project.clone_cmd && (
              <div className="flex items-center bg-black border border-white/10 rounded-xl overflow-hidden shadow-inner">
                <div className="px-4 py-2.5 text-[10px] md:text-xs font-mono text-gray-300 border-r border-white/10">
                  <span className="text-indigo-500">$</span> {project.clone_cmd}
                </div>
                <button onClick={() => handleCopy(project.clone_cmd, 'clone')} className="px-4 py-2.5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                  {copiedClone ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>
        </header>

        {/* --- 2. MÉTRICAS --- */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-20">
            {project.metrics.map((m: any, i: number) => (
              <div key={i} className="bg-[#0c0c0d] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <Activity size={18} className="text-indigo-500/50" />
                  {m.trend && <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{m.trend}</span>}
                </div>
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">{m.label}</h4>
                <span className="text-2xl md:text-3xl font-mono text-white">{m.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* --- 3. VIDEO YOUTUBE (TAMAÑO CONTROLADO) --- */}
        {youtubeEmbedUrl && (
          <section className="mb-20">
            <h3 className="text-lg font-mono text-white mb-6 flex items-center gap-3">
              <Youtube size={20} className="text-red-500" /> Video Demostración
            </h3>
            {/* max-w-4xl centra el video y evita que ocupe todo el ancho de la pantalla */}
            <div className="max-w-4xl mx-auto">
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-red-900/5 bg-black">
                <iframe
                  src={youtubeEmbedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={`Demostración de ${project.title}`}
                ></iframe>
              </div>
            </div>
          </section>
        )}

        {/* --- 4. GALERÍA ADAPTATIVA --- */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="mb-20">
            <h3 className="text-lg font-mono text-white mb-6 flex items-center gap-3">
              <ImageIcon size={20} className="text-indigo-400" /> Galería del Proyecto
            </h3>
            {/* Si hay 1 foto, la centra grande. Si hay más, usa una grilla responsiva */}
            <div className={`grid gap-6 ${project.gallery.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {project.gallery.map((img: any) => (
                <div key={img.id} className="group cursor-pointer">
                  <div className="w-full aspect-video rounded-xl border border-white/5 bg-[#0c0c0d] mb-4 overflow-hidden relative shadow-lg">
                    <img
                      src={img.image.startsWith('http') ? img.image : `${BACKEND_URL}${img.image}`}
                      alt={img.caption || `Captura de ${project.title}`}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  {img.caption && <h4 className="text-sm font-medium text-gray-300">{img.caption}</h4>}
                  {img.description && <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">{img.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- 5. GRILLA TÉCNICA (IZQUIERDA: Listas | DERECHA: Textos/Código) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-4 space-y-12">

            {/* Highlights (Nuevo) */}
            {project.highlights && project.highlights.length > 0 && (
              <div>
                <h3 className="text-sm font-mono text-white mb-5 flex items-center gap-2 border-b border-white/5 pb-3"><Zap size={16} className="text-amber-500" /> Puntos Clave</h3>
                <ul className="space-y-3">
                  {project.highlights.map((h: string, i: number) => (
                    <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500/50 rounded-full mt-1.5 flex-shrink-0"></span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerrequisitos */}
            {project.prerequisites && project.prerequisites.length > 0 && (
              <div>
                <h3 className="text-sm font-mono text-white mb-5 flex items-center gap-2 border-b border-white/5 pb-3"><Cpu size={16} className="text-indigo-400" /> Prerrequisitos</h3>
                <ul className="space-y-3">
                  {project.prerequisites.map((req: string, i: number) => (
                    <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-gray-600 flex-shrink-0" /> {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Estructura */}
            {project.structure && project.structure.length > 0 && (
              <div>
                <h3 className="text-sm font-mono text-white mb-5 flex items-center gap-2 border-b border-white/5 pb-3"><Database size={16} className="text-emerald-400" /> Estructura del Core</h3>
                <div className="space-y-4 font-mono text-xs bg-[#0c0c0d] p-5 rounded-xl border border-white/5">
                  {project.structure.map((item: any, i: number) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 text-gray-300">
                        {item.type === 'folder' ? <Folder size={14} className="text-indigo-400/80" /> : <FileCode2 size={14} className="text-gray-500" />}
                        <span>{item.name}</span>
                      </div>
                      <div className="pl-6 pt-1 text-gray-500 text-[10px]">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Changelog */}
            {project.changelog && project.changelog.length > 0 && (
              <div>
                <h3 className="text-sm font-mono text-white mb-5 flex items-center gap-2 border-b border-white/5 pb-3"><GitBranch size={16} className="text-gray-400" /> Historial de Versiones</h3>
                <div className="space-y-6">
                  {project.changelog.map((log: any, i: number) => (
                    <div key={i} className="relative pl-5 border-l border-white/10">
                      <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[4.5px] top-1.5 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-mono text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">{log.version}</span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1"><Clock size={10} /> {log.date}</span>
                      </div>
                      <ul className="space-y-2">
                        {log.updates && log.updates.map((update: string, j: number) => (
                          <li key={j} className="text-[11px] text-gray-400 before:content-['>_'] before:mr-2 before:text-gray-600 before:font-mono">{update}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-8 space-y-16">

            {/* Análisis y Seguridad */}
            {project.analysis_text && (
              <section>
                <h3 className="text-lg font-mono text-white mb-5 flex items-center gap-2"><ShieldAlert size={18} className="text-emerald-500" /> Análisis del Sistema</h3>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed bg-gradient-to-b from-[#0c0c0d] to-transparent p-6 md:p-8 rounded-2xl border border-white/5 whitespace-pre-line shadow-inner">
                  {project.analysis_text}
                </p>
              </section>
            )}

            {/* Guía de Instalación Rápida */}
            {project.install_steps && project.install_steps.length > 0 && (
              <section>
                <h3 className="text-lg font-mono text-white mb-5 flex items-center gap-2"><Download size={18} className="text-indigo-400" /> Secuencia de Instalación</h3>
                <div className="bg-[#0c0c0d] rounded-2xl border border-white/5 overflow-hidden">
                  {project.install_steps.map((step: any, i: number) => (
                    <div key={i} className={`p-5 ${i !== project.install_steps.length - 1 ? 'border-b border-white/5' : ''}`}>
                      <div className="text-[10px] font-mono text-gray-500 mb-2 uppercase tracking-widest">{step.step}</div>
                      <div className="bg-black px-4 py-3 rounded-lg font-mono text-xs text-gray-300 border border-white/5 flex justify-between items-center group overflow-x-auto custom-scrollbar">
                        <span className="whitespace-nowrap"><span className="text-emerald-500 select-none mr-2">$</span>{step.code}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Código Destacado */}
            {project.core_code && (
              <section>
                <h3 className="text-lg font-mono text-white mb-5 flex items-center gap-2"><Code2 size={18} className="text-gray-400" /> Core Snippet</h3>
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#050506]">
                  {/* Falsa cabecera de ventana Mac/Linux */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#0c0c0d] border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 ml-2">root@forge:~#</span>
                    </div>
                    <button onClick={() => handleCopy(project.core_code, 'code')} className="text-gray-500 hover:text-white transition-colors" title="Copiar código">
                      {copiedCode ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="p-6 overflow-x-auto custom-scrollbar max-h-[500px]">
                    <pre className="text-[11px] md:text-sm font-mono leading-relaxed text-gray-300">
                      <code>{project.core_code}</code>
                    </pre>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
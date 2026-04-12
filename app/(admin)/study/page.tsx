"use client";

import React from 'react';
import { Book, Search, BrainCircuit, PenTool, Layout, Layers, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';

export default function StudyPage() {
  return (
    <div className="h-full flex overflow-hidden">
      
      {/* Sidebar de Materias (Compacto) */}
      <aside className="w-64 bg-white/50 border-r border-gray-200/50 p-6 hidden lg:flex flex-col">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">Asignaturas</h3>
        <nav className="space-y-1">
          <StudySubjectItem icon={<Layers size={16} />} label="Traumatología" active />
          <StudySubjectItem icon={<ShieldCheck size={16} />} label="Ciberseguridad" />
          <StudySubjectItem icon={<Book size={16} />} label="Anatomía Humana" />
          <StudySubjectItem icon={<BrainCircuit size={16} />} label="Machine Learning" />
        </nav>
      </aside>

      {/* Área Central: Cuaderno de Notas */}
      <main className="flex-1 bg-white p-8 md:p-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <header className="mb-10">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <PenTool size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Notas de Sesión</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Efectos del Trauma en Tejido Óseo</h1>
            <p className="text-gray-500 mt-2">Ultima edición: Hoy, 14:20</p>
          </header>

          <article className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-6">
            <p className="text-lg">
              El proceso de consolidación ósea tras una fractura involucra cuatro etapas críticas: formación del hematoma, formación del callo fibrocartilaginoso, formación del callo óseo y remodelación...
            </p>
            <div className="h-px bg-gray-100 my-8" />
            <div className="bg-blue-50/50 border-l-4 border-blue-400 p-6 rounded-r-2xl">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Sparkles size={16} /> Resumen de IA
              </h4>
              <p className="text-sm text-blue-800/80 italic">
                Seba, recuerda que la fase de remodelación puede durar varios meses y es donde la ingeniería de materiales aplicada a la traumatología tiene mayor impacto.
              </p>
            </div>
          </article>
        </div>
      </main>

      {/* Panel Lateral: IA Tutor */}
      <aside className="w-80 bg-[#f8f9fb] border-l border-gray-200/50 p-6 hidden xl:flex flex-col shadow-inner">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <BrainCircuit size={20} />
            </div>
            <span className="font-semibold text-sm text-gray-900">IA Tutor</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Selecciona un texto para que lo analice o hazme una pregunta sobre la materia.
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Acciones Rápidas</h4>
          <ActionButton label="Explicar concepto complejo" />
          <ActionButton label="Generar cuestionario de examen" />
          <ActionButton label="Buscar papers relacionados" />
        </div>
      </aside>
    </div>
  );
}

function StudySubjectItem({ icon, label, active = false }: any) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'text-gray-500 hover:bg-white hover:text-gray-900'}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ActionButton({ label }: any) {
  return (
    <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all group">
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
    </button>
  );
}
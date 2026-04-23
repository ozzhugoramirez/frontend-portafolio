"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createChatSession, sendSessionMessage, getWorkspaceData, createNotebook, createStudyProject, getStudyPrompts } from '@/lib/api';
import { ChatInput } from '@/components/study/ChatInput';
import { Sparkles, BookOpen, FolderKanban, FileText, Clock, Code, Image as ImageIcon, Plus, MoreHorizontal, X } from 'lucide-react';

export default function StudyLanding() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [localModel, setLocalModel] = useState('gemini-2.5-flash');
  
  const [workspaceData, setWorkspaceData] = useState({ notebooks: [] as any[], projects: [] as any[], ai_limit: 40 });
  const [prompts, setPrompts] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // --- ESTADOS DEL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'notebook' | 'project'>('notebook');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchWorkspace();
    fetchPrompts();
  }, []);

  const fetchWorkspace = async () => {
    try {
      const data = await getWorkspaceData();
      setWorkspaceData(data);
    } catch (error) {
      console.error("Error al cargar el workspace:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchPrompts = async () => {
    try {
      const data = await getStudyPrompts();
      setPrompts(data);
    } catch (error) {
      console.error("Error cargando prompts:", error);
    }
  };

  const handleStartChat = async (message: string) => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const newChat = await createChatSession();
      await sendSessionMessage(newChat.id, message, localModel); 
      router.push(`/study/${newChat.id}`);
    } catch (e) {
      console.error("Error al iniciar el chat:", e);
      setIsLoading(false);
    }
  };

  // Abre el modal configurado
  const openModal = (type: 'notebook' | 'project') => {
    setModalType(type);
    setNewItemTitle('');
    setSelectedPrompt('');
    setIsModalOpen(true);
  };

  // Ejecuta la creación en el backend
  const handleCreateItem = async () => {
    if (!newItemTitle.trim()) return;
    setIsCreating(true);

    try {
      if (modalType === 'notebook') {
        const colors = ['border-blue-400', 'border-red-400', 'border-emerald-400', 'border-purple-400', 'border-orange-400'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        await createNotebook(newItemTitle, randomColor, selectedPrompt || undefined);
      } else {
        await createStudyProject(newItemTitle, selectedPrompt || undefined);
      }
      
      await fetchWorkspace();
      setIsModalOpen(false);
    } catch (error) {
      console.error(`Error creando ${modalType}:`, error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
           <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
           <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
           <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative bg-white">
      
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar pt-20 md:pt-24 pb-48">
        <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-16">
          
          {/* HEADER PRINCIPAL */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold tracking-wide">
                <Sparkles size={14} /> olo Workspace
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight leading-tight">
                Buen día, Seba.
              </h1>
              <p className="text-gray-500 text-lg font-medium">Límite de memoria IA: <span className="font-bold text-gray-700">{workspaceData.ai_limit} msjs</span></p>
            </div>
          </div>

          {/* MIS CUADERNOS */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                <BookOpen size={20} className="text-gray-400" /> Mis Cuadernos
              </h2>
            </div>
            
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 snap-x">
              <button onClick={() => openModal('notebook')} className="flex-shrink-0 w-[240px] flex flex-col items-center justify-center gap-3 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all snap-start min-h-[120px] group">
                <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Plus size={20} />
                </div>
                <span className="font-semibold text-sm">Nuevo Cuaderno</span>
              </button>

              {workspaceData.notebooks.map(cuaderno => (
                <button 
                  key={cuaderno.id} 
                  onClick={() => router.push(`/study/notebook/${cuaderno.id}`)}
                  className={`flex-shrink-0 w-[240px] text-left bg-white border border-gray-200 border-l-[6px] ${cuaderno.color} rounded-2xl p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 transition-all snap-start flex flex-col justify-between min-h-[120px]`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-gray-900 text-[16px] leading-snug line-clamp-2">{cuaderno.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium mt-4">
                    <span>{cuaderno.pages} chats guardados</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* MIS PROYECTOS */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 tracking-tight">
                <FolderKanban size={20} className="text-gray-400" /> Proyectos
              </h2>
            </div>
            
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4 snap-x">
              <button onClick={() => openModal('project')} className="flex-shrink-0 w-[300px] flex items-center justify-center gap-2 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all snap-start min-h-[140px] group">
                <Plus size={18} className="group-hover:scale-125 transition-transform" />
                <span className="font-semibold text-[15px]">Nuevo Proyecto</span>
              </button>

              {workspaceData.projects.map(proyecto => (
                <div key={proyecto.id} className="flex-shrink-0 w-[300px] bg-white border border-gray-200 p-5 rounded-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all snap-start cursor-pointer flex flex-col justify-between min-h-[140px]">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900 text-[16px]">{proyecto.title}</h3>
                    <span className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wide">{proyecto.status}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                        <span>Progreso</span>
                        <span className="text-gray-700">{proyecto.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${proyecto.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      <footer className="absolute bottom-4 md:bottom-8 left-0 w-full px-4 md:px-0 z-20 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
            <ChatInput onSendMessage={handleStartChat} isLoading={isLoading} model={localModel} onModelChange={setLocalModel} />
        </div>
      </footer>

      {/* MODAL DE CREACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Crear {modalType === 'notebook' ? 'Cuaderno' : 'Proyecto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre</label>
                <input 
                  type="text" 
                  autoFocus
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder={`Ej: ${modalType === 'notebook' ? 'Física II' : 'Silo E-commerce'}`}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contexto IA (Opcional)</label>
                <select 
                  value={selectedPrompt}
                  onChange={(e) => setSelectedPrompt(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none"
                >
                  <option value="">Sin contexto específico (General)</option>
                  {prompts.map(prompt => (
                    <option key={prompt.id} value={prompt.id}>{prompt.title}</option>
                  ))}
                </select>
                <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                  Asigna una personalidad o base de conocimiento previa para que olo responda de forma experta en este espacio.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateItem}
                disabled={!newItemTitle.trim() || isCreating}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                {isCreating ? 'Creando...' : 'Crear espacio'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
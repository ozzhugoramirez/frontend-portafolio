"use client";
import React, { useEffect, useState } from 'react';
import { getChatSessions, createChatSession } from '@/lib/api';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/study/Sidebar';

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<{id: string, title: string}[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [globalModel, setGlobalModel] = useState('gemini-2.5-flash'); 
  const router = useRouter();

  useEffect(() => {
    loadSessions();
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getChatSessions();
      setSessions(data);
    } catch (e) { console.error("Error cargando sesiones", e); }
  };

  const handleNewChat = async () => {
    try {
        const newChat = await createChatSession();
        setSessions(prev => [newChat, ...prev]);
        router.push(`/study/${newChat.id}`);
    } catch (e) {
        console.error("Error creando chat nuevo", e);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-white overflow-hidden font-sans relative">
      
      {/* Overlay Móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* WRAPPER DEL SIDEBAR */}
      <div className={`
        fixed inset-y-0 left-0 z-40 md:relative md:flex-shrink-0
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 ml-0 shadow-2xl md:shadow-none' : '-translate-x-full md:translate-x-0 md:-ml-[280px]'}
      `}>
         <Sidebar 
            sessions={sessions} 
            onNewChat={handleNewChat} 
            onClose={() => { if(window.innerWidth < 768) setIsSidebarOpen(false) }} 
            model={globalModel}
            onModelChange={setGlobalModel}
         />
      </div>

      {/* CONTENIDO PRINCIPAL (Pantalla Completa) */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* BOTÓN HAMBURGUESA FLOTANTE (Liquid Glass Effect) */}
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="absolute top-4 left-4 md:top-6 md:left-6 z-50 p-3 rounded-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-gray-700 hover:bg-white/60 hover:scale-105 active:scale-95 transition-all"
        >
            <Menu size={22} strokeWidth={2.5} />
        </button>

        {/* ÁREA DE CONTENIDO */}
        <div className="flex-1 relative overflow-hidden">
            {children}
        </div>
      </main>
    </div>
  );
}
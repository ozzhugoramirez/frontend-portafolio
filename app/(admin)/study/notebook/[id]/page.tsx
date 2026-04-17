"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getChatSessions, createChatSession, sendSessionMessage } from '@/lib/api';
import { ChatInput } from '@/components/study/ChatInput';
import { BookOpen, ArrowLeft, MessageSquarePlus, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function NotebookViewPage() {
  const { id } = useParams(); // Este es el ID del cuaderno
  const router = useRouter();
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localModel, setLocalModel] = useState('gemini-2.5-flash');

  useEffect(() => {
    if (id) loadNotebookSessions();
  }, [id]);

  const loadNotebookSessions = async () => {
    try {
      // Usamos la API que actualizamos: le pasamos el notebook_id para filtrar
      const data = await getChatSessions(id as string, undefined);
      setSessions(data);
    } catch (error) {
      console.error("Error cargando sesiones del cuaderno:", error);
    }
  };

  const handleStartChatInNotebook = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // 1. Creamos la sesión y le decimos que pertenece a este cuaderno
      const newChat = await createChatSession(id as string, undefined);
      
      // 2. Mandamos el primer mensaje
      await sendSessionMessage(newChat.id, message, localModel); 
      
      // 3. Vamos a la vista del chat!
      router.push(`/study/${newChat.id}`);
    } catch (e) {
      console.error("Error al iniciar el chat:", e);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-white">
      
      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar pt-12 md:pt-16 pb-48">
        <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-8">
          
          {/* HEADER: Botón volver y Título */}
          <div className="flex flex-col gap-4">
            <Link href="/study" className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors w-fit font-medium text-sm">
              <ArrowLeft size={16} /> Volver al Workspace
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <BookOpen size={28} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Contenido del Cuaderno
              </h1>
            </div>
            <p className="text-gray-500">Tus sesiones de estudio guardadas en este cuaderno.</p>
          </div>

          <hr className="border-gray-100" />

          {/* LISTA DE SESIONES DE CHAT */}
          <div className="space-y-3">
            {sessions.length === 0 ? (
               <div className="text-center py-16 px-4 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                  <MessageSquarePlus size={32} className="mx-auto text-gray-300 mb-3" />
                  <h3 className="text-gray-700 font-semibold mb-1">Este cuaderno está vacío</h3>
                  <p className="text-gray-400 text-sm">Escribe algo abajo para crear tu primera nota de estudio acá.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {sessions.map(session => (
                  <Link 
                    key={session.id} 
                    href={`/study/${session.id}`}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-sm hover:bg-blue-50/20 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-50 text-gray-400 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <MessageCircle size={18} />
                      </div>
                      <span className="font-medium text-gray-800 text-[15px]">{session.title}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      Abrir
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* INPUT AVANZADO INFERIOR FLOTANTE */}
      <footer className="absolute bottom-4 md:bottom-8 left-0 w-full px-4 md:px-0 z-20 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
            <ChatInput 
                onSendMessage={handleStartChatInNotebook} 
                isLoading={isLoading} 
                model={localModel}
                onModelChange={setLocalModel}
            />
        </div>
      </footer>
    </div>
  );
}
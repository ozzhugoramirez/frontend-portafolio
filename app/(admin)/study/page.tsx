"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createChatSession, sendSessionMessage } from '@/lib/api';
import { ChatInput } from '@/components/study/ChatInput';
import { BotMessageSquare, Sparkles } from 'lucide-react';

export default function StudyLanding() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Este modelo local se usará solo para el primer mensaje, luego se sincronizará con el global
  const [localModel, setLocalModel] = useState('gemini-2.5-flash');

  const handleStartChat = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const newChat = await createChatSession();
      // Mandamos el primer mensaje (el backend lo procesa y guarda)
      await sendSessionMessage(newChat.id, message, localModel); 
      // Saltamos a la vista dinámica
      router.push(`/study/${newChat.id}`);
    } catch (e) {
      console.error("Error al iniciar el chat:", e);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                <Sparkles size={32} className="text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-800 tracking-tight leading-tight">Hola, Seba</h1>
            <p className="text-2xl md:text-3xl text-gray-400 font-medium leading-normal">Your AI Assistant <span className="text-blue-600">olo</span>. <br /> How can I help you today?</p>
        </div>
        
        {/* INPUT AVANZADO CENTRAL (Basado en Imagen 1) */}
        <div className="mt-12">
            <ChatInput 
                onSendMessage={handleStartChat} 
                isLoading={isLoading} 
                model={localModel}
                onModelChange={setLocalModel}
            />
        </div>

        {/* TAGS SUGERIDOS (Imagen 0) */}
        <div className="flex flex-wrap justify-center gap-3 mt-12 pt-6 border-t border-gray-100">
          {[
            { tag: 'Repasar C++', description: 'Review C++ fundamentals' },
            { tag: 'Arquitectura de Halo', description: 'Analyze Halo series narrative' },
            { tag: 'Final de Enfermería', description: 'Study nursing exam topics' }
          ].map(tagObj => (
            <button 
              key={tagObj.tag}
              onClick={() => handleStartChat(tagObj.description)}
              disabled={isLoading}
              className="px-5 py-3 bg-white border border-gray-100 rounded-full text-[15px] text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-50"
            >
              <span className="font-medium text-blue-700">{tagObj.tag}</span>: {tagObj.description}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
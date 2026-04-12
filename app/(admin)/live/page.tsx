"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap, User, Sparkles } from 'lucide-react';
import { getChatHistory, sendChatMessage } from '@/lib/api';

const TypewriterText = ({ text, isTyping }: { text: string, isTyping?: boolean }) => {
  const [displayedText, setDisplayedText] = useState(isTyping ? '' : text);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 15);

    return () => clearInterval(interval);
  }, [text, isTyping]);

  return <span>{displayedText}</span>;
};

interface ChatMessage {
  id?: number;
  role: 'user' | 'model';
  content: string;
  created_at?: string;
  isNew?: boolean;
}

export default function LiveChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getChatHistory();
        setMessages(history);
      } catch (error) {
        console.error("Error al cargar el historial:", error);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userText = message;
    setMessage(''); 
    
    const newUserMsg: ChatMessage = { role: 'user', content: userText };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userText);
      setMessages(prev => [...prev, { role: 'model', content: response.content, isNew: true }]);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: '⚠️ Error de conexión con los sistemas centrales. Reintentá en unos segundos.',
        isNew: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col relative bg-[#f5f5f7] overflow-hidden">
      
      {/* Header */}
      <header className="absolute top-0 left-0 w-full pt-4 pb-2 px-4 flex justify-center z-20 bg-gradient-to-b from-[#f5f5f7] to-transparent pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-full px-5 py-2 flex items-center gap-2 shadow-sm pointer-events-auto">
          <Zap size={16} className="text-blue-500" />
          <span className="text-sm font-semibold text-gray-800 tracking-wide">Entity</span>
        </div>
      </header>

      {/* Contenedor de scroll estricto */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full px-4 md:px-8 pt-24 pb-32 custom-scrollbar">
        
        <div className="max-w-3xl mx-auto space-y-6">
          
          {messages.length === 0 && !isLoading && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center opacity-40">
              <Sparkles size={32} className="text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-500">Los sistemas están listos.<br/>¿En qué te ayudo, Seba?</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            
            return (
              <div 
                key={index} 
                className={`flex items-end gap-2 md:gap-3 max-w-[95%] md:max-w-[85%] animate-in fade-in slide-in-from-bottom-2 ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar (flex-shrink-0 asegura que no se aplaste) */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mb-1 ${
                  isUser ? 'bg-blue-600 shadow-md shadow-blue-500/20' : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  {isUser ? <User size={14} className="text-white" /> : <Zap size={14} className="text-blue-500" />}
                </div>
                
                {/* ⚠️ ACÁ ESTÁ LA SOLUCIÓN: min-w-0 y overflow-hidden para que el texto respete la burbuja */}
                <div className={`px-4 md:px-5 py-3 shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap break-words min-w-0 overflow-hidden ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-[24px] rounded-br-sm'
                    : 'bg-white border border-gray-200/60 text-gray-800 rounded-[24px] rounded-bl-sm'
                }`}>
                  <TypewriterText text={msg.content} isTyping={msg.role === 'model' && msg.isNew} />
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-end gap-2 md:gap-3 max-w-[85%] mr-auto animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex-shrink-0 flex items-center justify-center mb-1">
                <Zap size={14} className="text-blue-500" />
              </div>
              <div className="bg-white border border-gray-200/60 rounded-[24px] rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 w-full p-4 md:p-8 bg-gradient-to-t from-[#f5f5f7] via-[#f5f5f7]/95 to-transparent pointer-events-none">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-[28px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-2 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400 transition-all pointer-events-auto"
        >
          <div className="pl-4 hidden md:flex items-center justify-center">
            <Sparkles size={20} className="text-blue-400" strokeWidth={1.5} />
          </div>
          <input 
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isLoading}
            placeholder="Escribí un comando para Entity..."
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] text-gray-900 placeholder:text-gray-400 px-3 py-2 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!message.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:shadow-none shadow-md shadow-blue-500/20"
          >
            <Send size={18} className={`-ml-0.5 ${isLoading ? "opacity-0" : "opacity-100"}`} strokeWidth={2} />
            {isLoading && <span className="absolute w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
          </button>
        </form>
      </footer>
    </div>
  );
}
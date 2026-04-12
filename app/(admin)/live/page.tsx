"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap, User, Sparkles, Plus, SlidersHorizontal, Mic, ChevronDown } from 'lucide-react';
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
    <div className="h-[100dvh] w-full flex flex-col bg-[#f0f4f9] overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="flex-none pt-4 pb-2 px-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:bg-gray-200/50 rounded-full transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="text-[17px] font-medium text-gray-700 tracking-tight">Entity</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <User size={16} />
        </div>
      </header>

      {/* CUERPO DEL CHAT */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full px-4 md:px-8 py-4 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {messages.length === 0 && !isLoading && (
            <div className="mt-10 flex flex-col">
              <h1 className="text-3xl md:text-4xl font-normal text-gray-800 mb-2">Hola, Seba</h1>
              <h2 className="text-3xl md:text-4xl font-semibold text-gray-400 mb-8 tracking-tight">¿Por dónde empezamos?</h2>
            </div>
          )}

          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            
            return (
              <div 
                key={index} 
                className={`flex items-start gap-2 max-w-[95%] md:max-w-[85%] animate-in fade-in slide-in-from-bottom-2 ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mt-1">
                    <Sparkles size={14} className="text-blue-600" />
                  </div>
                )}
                
                <div className={`px-4 py-3 text-[15px] leading-relaxed whitespace-pre-wrap break-words min-w-0 overflow-hidden ${
                  isUser
                    ? 'bg-[#e3e3e3] dark:bg-[#303030] text-gray-900 rounded-[20px] rounded-tr-sm'
                    : 'text-gray-800'
                }`}>
                  <TypewriterText text={msg.content} isTyping={msg.role === 'model' && msg.isNew} />
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 max-w-[85%] mr-auto animate-in fade-in mt-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                <Sparkles size={14} className="text-blue-600" />
              </div>
              <div className="flex items-center gap-1.5 px-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* FOOTER INPUT: Redujimos el padding en móvil (px-2 pb-2) y lo dejamos normal en PC (md:px-4 md:pb-6) */}
      <footer className="flex-none w-full px-2 md:px-4 pb-2 md:pb-6 pt-2">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto bg-white rounded-[28px] md:rounded-[32px] p-2.5 md:p-3 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col gap-2 focus-within:shadow-[0_4px_25px_rgb(0,0,0,0.08)] transition-all"
        >
          {/* Fila superior: Input de texto */}
          <div className="px-2 pt-1">
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              placeholder="Pregunta a Entity"
              className="w-full min-w-0 bg-transparent border-none outline-none text-[16px] text-gray-900 placeholder:text-gray-500 disabled:opacity-50"
            />
          </div>

          {/* Fila inferior: Controles */}
          <div className="flex items-center justify-between">
            {/* Botones izquierdos */}
            <div className="flex items-center gap-1">
              <button type="button" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Plus size={20} strokeWidth={2} />
              </button>
              <button type="button" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                <SlidersHorizontal size={18} strokeWidth={2} />
              </button>
              
              {/* Selector de modelo */}
              <div className="hidden sm:flex items-center gap-1 ml-1 px-3 py-1.5 hover:bg-gray-100 rounded-full cursor-pointer transition-colors text-sm font-medium text-gray-600">
                Core <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>

            {/* Botones derechos */}
            <div>
              {message.trim().length === 0 && !isLoading ? (
                <button type="button" className="p-2.5 bg-gray-100 text-gray-700 rounded-full transition-colors">
                  <Mic size={18} />
                </button>
              ) : (
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center relative"
                >
                  <Send size={18} className={isLoading ? "opacity-0" : "opacity-100"} strokeWidth={2} />
                  {isLoading && <span className="absolute w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
                </button>
              )}
            </div>
          </div>
        </form>
      </footer>
      
    </div>
  );
}
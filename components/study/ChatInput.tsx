"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Film, Mic, Send, Zap, BookOpen, Code, FileText, Languages } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  model: string;
  onModelChange: (model: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, model, onModelChange }) => {
  const [message, setMessage] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const slashCommands = [
    { id: 'explain', icon: '💡', title: 'Explicar', prompt: 'Explícame paso a paso: ' },
    { id: 'summary', icon: '📝', title: 'Resumir', prompt: 'Haz un resumen detallado de esto: ' },
    { id: 'code', icon: '💻', title: 'Código', prompt: 'Revisa y optimiza este código: ' },
    { id: 'translate', icon: '🌍', title: 'Traducir', prompt: 'Traduce al inglés: ' },
  ];

  // 1. Auto-expandir el textarea con animación
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // 2. MAGIA: Detectar tipeo global para hacer auto-focus
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está usando atajos de teclado (Ctrl, Alt, CMD)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Ignorar si el foco ya está en algún input o textarea
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) {
        return;
      }

      // Si presionó una tecla normal (letras, números, símbolos - su length es 1)
      if (e.key.length === 1) {
        textareaRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessage(val);

    if (val.endsWith('/') || val.endsWith(' /')) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleCommandSelect = (prompt: string) => {
    const newMessage = message.replace(/\/$/, '') + prompt;
    setMessage(newMessage);
    setShowSlashMenu(false);
    textareaRef.current?.focus();
  };

  const handleSend = () => {
    if (!message.trim() || isLoading) return;
    onSendMessage(message);
    setMessage('');
    setShowSlashMenu(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  return (
    <div className="relative">
      
      {/* MENÚ FLOTANTE SLASH (/) */}
      {showSlashMenu && (
        <div className="absolute bottom-full left-4 mb-2 w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in">
          <div className="px-3 py-2 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Comandos rápidos
          </div>
          <div className="p-1">
            {slashCommands.map(cmd => (
              <button
                key={cmd.id}
                onClick={() => handleCommandSelect(cmd.prompt)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-xl transition-colors text-left group"
              >
                <span className="text-lg">{cmd.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{cmd.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT PRINCIPAL */}
      <div className="bg-white rounded-[28px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-200 flex flex-col gap-1 transition-all">
        
        {/* CABECERA: HERRAMIENTAS */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-50">
          <Zap size={15} className="text-blue-500 fill-blue-500" />
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-4 text-gray-400">
            <BookOpen size={16} className="hover:text-gray-700 cursor-pointer transition-colors" />
            <Code size={16} className="hover:text-gray-700 cursor-pointer transition-colors" />
            <FileText size={16} className="hover:text-gray-700 cursor-pointer transition-colors" />
            <Languages size={16} className="hover:text-gray-700 cursor-pointer transition-colors" />
          </div>
        </div>

        {/* TEXTAREA EXPANDIBLE */}
        <div className="px-3 pt-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            disabled={isLoading}
            placeholder="Escribe a olo... (Usa / para comandos)"
            className="w-full bg-transparent border-none outline-none text-[15px] text-gray-900 placeholder:text-gray-400 disabled:opacity-50 resize-none custom-scrollbar transition-[height] duration-200 ease-out"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* CONTROLES INFERIORES */}
        <div className="flex items-center justify-between p-1 mt-1">
          <div className="flex items-center gap-1 p-1.5 bg-[#2b2b2b] text-gray-300 rounded-[20px]">
            {[Plus, Film, Mic].map((Icon, i) => (
              <button key={i} type="button" className="p-1.5 hover:bg-white/20 hover:text-white rounded-full transition-colors">
                <Icon size={16} />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select 
              value={model} 
              onChange={(e) => onModelChange(e.target.value)}
              className="hidden md:block text-xs border-none bg-transparent font-medium text-gray-500 hover:text-blue-600 focus:ring-0 cursor-pointer outline-none"
            >
              <option value="gemini-2.5-flash">Gemini 2.5</option>
              <option value="gemini-1.5-flash">Gemini 1.5</option>
              <option value="gemini-1.5-pro">Gemini Pro</option>
            </select>

            <button 
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center active:scale-95"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
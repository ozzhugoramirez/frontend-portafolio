"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Film, Mic, Send, Zap, BookOpen, Code, FileText, Languages } from 'lucide-react';
import { getStudyPrompts } from '@/lib/api'; // IMPORTANTE: Traemos la función de la API

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  model: string;
  onModelChange: (model: string) => void;
  notebookName?: string;
  activePrompt?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  model, 
  onModelChange, 
  notebookName, 
  activePrompt 
}) => {
  const [message, setMessage] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- NUEVOS ESTADOS PARA PROMPTS DINÁMICOS ---
  const [dbPrompts, setDbPrompts] = useState<any[]>([]);
  const [selectedInlinePrompt, setSelectedInlinePrompt] = useState<any | null>(null);

  // Cargar los prompts desde la base de datos al montar el input
  useEffect(() => {
    getStudyPrompts().then(setDbPrompts).catch(console.error);
  }, []);

  // 1. Auto-expandir
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message, selectedInlinePrompt]); // Agregamos la etiqueta como dependencia

  // 2. Tipeo global
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) return;
      if (e.key.length === 1) textareaRef.current?.focus();
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessage(val);
    
    // Solo mostramos el menú si hay prompts cargados y el usuario tipea /
    if ((val.endsWith('/') || val.endsWith(' /')) && dbPrompts.length > 0) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  // --- NUEVA LÓGICA DE SELECCIÓN ---
  const handleCommandSelect = (prompt: any) => {
    setSelectedInlinePrompt(prompt); // Guardamos el prompt seleccionado (ej: Quimica)
    const newMessage = message.replace(/\/$/, '').trim(); // Borramos la barrita '/'
    setMessage(newMessage + (newMessage ? ' ' : ''));
    setShowSlashMenu(false);
    textareaRef.current?.focus();
  };

  // --- NUEVA LÓGICA DE ENVÍO ---
  const handleSend = () => {
    if (!message.trim() && !selectedInlinePrompt || isLoading) return;
    
    let finalMessage = message;

    // Si seleccionó un prompt con /, le inyectamos la instrucción al IA de forma invisible
    if (selectedInlinePrompt) {
      finalMessage = `[INSTRUCCIÓN PARA ESTE MENSAJE: ${selectedInlinePrompt.prompt_text}]\n\n${message}`;
    }

    onSendMessage(finalMessage);
    
    // Limpiamos todo después de enviar
    setMessage('');
    setSelectedInlinePrompt(null);
    setShowSlashMenu(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  return (
    <div className="relative w-full">
      
      {/* MENÚ FLOTANTE SLASH (/) - DINÁMICO DESDE DB */}
      {showSlashMenu && (
        <div className="absolute bottom-full left-4 mb-3 w-72 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgb(0,0,0,0.15)] border border-gray-200 overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in">
          <div className="px-4 py-2.5 bg-gray-50/50 border-b border-gray-100/50 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tus Contextos</span>
            <span className="text-[10px] font-mono bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">ESC para salir</span>
          </div>
          <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto custom-scrollbar">
            {dbPrompts.map(prompt => (
              <button
                key={prompt.id}
                onClick={() => handleCommandSelect(prompt)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100/80 rounded-xl transition-all text-left group"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-lg shadow-sm border border-blue-100/50 group-hover:scale-105 transition-transform">
                  <Zap size={14} className="text-blue-500 fill-blue-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-gray-800 group-hover:text-blue-600 transition-colors leading-none mb-1">{prompt.title}</span>
                  <span className="text-[11px] font-medium text-gray-400 leading-none truncate w-48">Usar este conocimiento</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT PRINCIPAL */}
      <div className="bg-[#f4f4f5] rounded-[28px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200/80 flex flex-col gap-1 transition-all">
        
        {/* CABECERA: HERRAMIENTAS Y CONTEXTO (Se mantiene igual) */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <Zap size={15} className="text-blue-500 fill-blue-500" />
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-4 text-gray-400">
              <BookOpen size={16} className="hover:text-gray-700 cursor-pointer transition-colors" />
              <Code size={16} className="hover:text-gray-700 cursor-pointer transition-colors" />
              <FileText size={16} className="hover:text-gray-700 cursor-pointer transition-colors" />
              <Languages size={16} className="hover:text-gray-700 cursor-pointer transition-colors" />
            </div>
          </div>

          {(notebookName || activePrompt) && (
            <div className="flex items-center gap-2">
              {notebookName && (
                <span className="bg-white px-2.5 py-1 rounded-md border border-gray-200/80 shadow-sm text-[11px] font-semibold text-gray-600 tracking-tight flex items-center gap-1.5">
                  <BookOpen size={10} className="text-gray-400" /> {notebookName}
                </span>
              )}
              {activePrompt && (
                <span className="bg-blue-50/80 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100 shadow-sm text-[11px] font-semibold tracking-tight flex items-center gap-1.5">
                  <Zap size={10} className="fill-blue-600" /> {activePrompt}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ÁREA DE TEXTO CON ETIQUETA INLINE CELESTE */}
        <div className="px-3 pt-2 flex items-start gap-1.5">
          
          {/* La etiqueta (Pill) del Prompt seleccionado */}
          {selectedInlinePrompt && (
            <div className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[13px] font-bold tracking-tight whitespace-nowrap flex items-center mt-0.5 select-none shadow-sm">
              @{selectedInlinePrompt.title.toLowerCase()}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            disabled={isLoading}
            placeholder={selectedInlinePrompt ? "Escribe tu instrucción..." : "Escribe a olo... (Usa / para contextos)"}
            className="w-full flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-gray-800 placeholder:text-gray-400 disabled:opacity-50 resize-none custom-scrollbar transition-[height] duration-200 ease-out min-h-[24px]"
            rows={1}
            onKeyDown={(e) => {
              // Si presiona borrar y el input está vacío, eliminamos la etiqueta
              if (e.key === 'Backspace' && message === '' && selectedInlinePrompt) {
                setSelectedInlinePrompt(null);
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>

        {/* CONTROLES INFERIORES (Se mantienen igual) */}
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
              className="hidden md:block text-xs border-none bg-transparent font-semibold text-gray-500 hover:text-blue-600 focus:ring-0 cursor-pointer outline-none"
            >
              <option value="gemini-2.5-flash">Gemini 2.5</option>
              <option value="gemini-1.5-flash">Gemini 1.5</option>
              <option value="gemini-1.5-pro">Gemini Pro</option>
            </select>

            <button 
              onClick={handleSend}
              disabled={isLoading || (!message.trim() && !selectedInlinePrompt)}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:bg-gray-300 disabled:text-gray-500 transition-all flex items-center justify-center active:scale-95 shadow-sm"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Send size={18} />}
            </button> 
          </div>
        </div>
      </div>
    </div>
  );
};
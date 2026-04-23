"use client";
import React from 'react';
import Link from 'next/link'; 
import { usePathname } from 'next/navigation';
import { Plus, HelpCircle, Settings2, BotMessageSquare, Home, BrainCircuit, Sparkles } from 'lucide-react';

interface SidebarProps {
  sessions: {id: string, title: string}[];
  onNewChat: () => void;
  onClose: () => void;
  model: string;
  onModelChange: (model: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sessions, onNewChat, onClose, model, onModelChange }) => {
  const pathname = usePathname();
  const currentChatId = pathname.split('/study/')[1];

  const handleNewChatClick = () => {
    onNewChat();
    onClose(); 
  };

  return (
    <aside className="w-[280px] h-full bg-[#f8fafd] border-r border-gray-200 p-4 flex flex-col custom-scrollbar overflow-y-auto">
      {/* HEADER SIDEBAR */}
      <div className="flex-none flex items-center justify-between mb-6 mt-2">
        <div className="flex items-center gap-2.5">
          <BotMessageSquare size={22} className="text-blue-600" />
          <Link href="/study" onClick={onClose}> 
            <span className="text-[18px] font-bold text-gray-900 tracking-tight">olo workspace</span>
          </Link>
        </div>
        <button 
          onClick={handleNewChatClick}
          className="flex items-center justify-center p-2 bg-[#e1eaf1] hover:bg-[#d2e3fc] text-[#041e49] rounded-xl transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* AI MODULE (Móvil) */}
      <div className="mb-6 md:hidden">
          <div className="relative group p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
              <select 
                  value={model} 
                  onChange={(e) => onModelChange(e.target.value)}
                  className="w-full text-xs border-none bg-transparent font-medium text-gray-700 focus:ring-0 outline-none pr-8 cursor-pointer"
              >
                  <option value="gemini-2.5-flash">✨ Gemini 2.5 Flash</option>
                  <option value="gemini-1.5-flash">✨ Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">🧠 Gemini Pro</option>
              </select>
          </div>
      </div>

      <div className="flex-1 space-y-8">
        
        {/* SECCIÓN: MENÚ PRINCIPAL */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Menú</h3>
          <div className="space-y-1">
            <Link 
              href="/study"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${pathname === '/study' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Home size={16} className={pathname === '/study' ? 'text-blue-600' : 'text-gray-400'} />
              <span>Inicio (Workspace)</span>
            </Link>
            
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <Sparkles size={16} className="text-gray-400" />
              <span className="text-left flex-1">Mis Contextos IA</span>
            </button>
            
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <BrainCircuit size={16} className="text-gray-400" />
              <span className="text-left flex-1">Memoria Global</span>
            </button>
          </div>
        </div>

        {/* SECCIÓN: HISTORIAL DE CHATS */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Recientes</h3>
          <div className="space-y-1">
            {sessions.map(s => {
              const isActive = currentChatId === s.id;
              return (
                <Link 
                  key={s.id} 
                  href={`/study/${s.id}`}
                  onClick={onClose} 
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg truncate transition-colors group ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <HelpCircle size={15} className={`flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className="truncate flex-1">{s.title}</span>
                </Link> 
              );
            })}
            {sessions.length === 0 && (
              <div className="text-center py-4 text-gray-400 text-xs italic bg-white rounded-lg border border-dashed border-gray-200">
                  No hay chats recientes...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER SIDEBAR */}
      <div className="flex-none mt-auto pt-6 border-t border-gray-100 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <Settings2 size={16} className="text-gray-400" />
            <span>Configuración</span>
          </button>
      </div>
    </aside>
  );
};
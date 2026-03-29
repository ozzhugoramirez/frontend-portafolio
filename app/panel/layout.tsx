"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FolderKanban, Beaker, Lock, 
  Settings, LogOut, ShieldCheck, Globe, Key, 
  Zap, ChevronRight, UserCircle, Menu, X
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

 
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);


  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    router.push('/login');
  };

  if (!isAuthorized) {
    return (
      <div className="h-screen w-full bg-[#050506] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest animate-pulse">Verificando credenciales...</p>
      </div>
    );
  }

  return (
    
    <div className="h-screen w-full bg-[#050506] text-gray-400 font-sans flex flex-col md:flex-row overflow-hidden relative">
      
      
      <div className="md:hidden flex items-center justify-between p-4 bg-[#080809] border-b border-white/5 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/10">
            <ShieldCheck size={16} />
          </div>
          <span className="text-white text-xs font-mono font-bold tracking-tight uppercase">Seba_Admin</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

     
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR IZQUIERDO --- */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-[#080809] border-r border-white/5 flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Botón de cerrar en versión móvil */}
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="md:hidden absolute top-5 right-4 p-2 text-gray-500 hover:text-white bg-[#121214] rounded-lg border border-white/5"
        >
          <X size={18} />
        </button>

        {/* Identidad de Sesión */}
        <div className="p-6 border-b border-white/5 bg-[#0c0c0d]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/10">
              <ShieldCheck size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-mono font-bold tracking-tight uppercase">Seba_Admin</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] text-gray-600 font-mono tracking-widest uppercase">Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grupos de Navegación */}
        <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto custom-scrollbar">
          
          <div>
            <p className="px-4 text-[9px] font-mono uppercase tracking-[0.3em] text-gray-600 mb-4">Core</p>
            <div className="space-y-1">
              <AdminNavTab href="/panel" icon={<LayoutDashboard size={16} />} label="Dashboard" active={pathname === '/panel'} />
              <AdminNavTab href="/panel/profile" icon={<UserCircle size={16} />} label="Identity Manager" active={pathname === '/panel/profile'} />
              <AdminNavTab href="/" icon={<Globe size={16} />} label="Live Site" active={false} external />
            </div>
          </div>

          <div>
            <p className="px-4 text-[9px] font-mono uppercase tracking-[0.3em] text-gray-600 mb-4">Web Content</p>
            <div className="space-y-1">
              <AdminNavTab href="/panel/projects" icon={<FolderKanban size={16} />} label="Projects" active={pathname === '/panel/projects'} />
              <AdminNavTab href="/panel/lab" icon={<Beaker size={16} />} label="Lab Snippets" active={pathname === '/panel/lab'} />
            </div>
          </div>

          <div>
            <p className="px-4 text-[9px] font-mono uppercase tracking-[0.3em] text-indigo-500/50 mb-4 flex items-center gap-2">
              <Lock size={10} /> The Forge (Private)
            </p>
            <div className="space-y-1">
              <AdminNavTab href="/panel/forge" icon={<Zap size={16} />} label="Internal Repos" active={pathname === '/panel/forge'} />
              <AdminNavTab href="/panel/security" icon={<Key size={16} />} label="Privacy Keys" active={pathname === '/panel/security'} />
            </div>
          </div>

          <div>
            <p className="px-4 text-[9px] font-mono uppercase tracking-[0.3em] text-gray-600 mb-4">System</p>
            <AdminNavTab href="/panel/settings" icon={<Settings size={16} />} label="Configuración" active={pathname === '/panel/settings'} />
          </div>

        </nav>

        
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-mono text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
          >
            <span className="flex items-center gap-3">
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Logout
            </span>
            <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </aside>

      {/* --- CONTENIDO --- */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-[#050506]">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>

    </div>
  );
}

function AdminNavTab({ href, icon, label, active, external = false }: any) {
  return (
    <Link 
      href={href} 
      target={external ? "_blank" : "_self"}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] transition-all duration-300 group
        ${active 
          ? 'bg-white/5 text-white border border-white/5 shadow-sm' 
          : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02] border border-transparent'
        }
      `}
    >
      <span className={`${active ? 'text-indigo-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
        {icon}
      </span>
      <span className="flex-1 tracking-tight">{label}</span>
      {active && <div className="w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />}
    </Link>
  );
}
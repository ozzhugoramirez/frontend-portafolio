"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FolderKanban, Beaker, Lock, 
  Settings, LogOut, ShieldCheck, Globe, Key, 
  Zap, ChevronRight, UserCircle
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

 
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
    <div className="h-screen w-full bg-[#050506] text-gray-400 font-sans flex overflow-hidden">
      
      {/* --- SIDEBAR IZQUIERDO --- */}
      <aside className="w-72 border-r border-white/5 bg-[#080809] flex flex-col flex-shrink-0">
        
        {/* Identidad de Sesión */}
        <div className="p-6 border-b border-white/5 bg-[#0c0c0d]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/10">
              <ShieldCheck size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-mono font-bold tracking-tight uppercase">Seba_Admin</span>
              <div className="flex items-center gap-1.5">
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
              <AdminNavTab href="/panel" icon={<LayoutDashboard size={16} />} label="Dashboard" active={pathname === '/admin'} />
              <AdminNavTab href="/panel/profile" icon={<UserCircle size={16} />} label="Identity Manager" active={pathname === '/admin/profile'} />
              <AdminNavTab href="/" icon={<Globe size={16} />} label="Live Site" active={false} external />
            </div>
          </div>

          <div>
            <p className="px-4 text-[9px] font-mono uppercase tracking-[0.3em] text-gray-600 mb-4">Web Content</p>
            <div className="space-y-1">
              <AdminNavTab href="/panel/projects" icon={<FolderKanban size={16} />} label="Projects" active={pathname === '/admin/projects'} />
              <AdminNavTab href="/panel/lab" icon={<Beaker size={16} />} label="Lab Snippets" active={pathname === '/admin/lab'} />
            </div>
          </div>

          <div>
            <p className="px-4 text-[9px] font-mono uppercase tracking-[0.3em] text-indigo-500/50 mb-4 flex items-center gap-2">
              <Lock size={10} /> The Forge (Private)
            </p>
            <div className="space-y-1">
              <AdminNavTab href="/panel/forge" icon={<Zap size={16} />} label="Internal Repos" active={pathname === '/admin/forge'} />
              <AdminNavTab href="/panel/security" icon={<Key size={16} />} label="Privacy Keys" active={pathname === '/admin/security'} />
            </div>
          </div>

          <div>
            <p className="px-4 text-[9px] font-mono uppercase tracking-[0.3em] text-gray-600 mb-4">System</p>
            <AdminNavTab href="/panel/settings" icon={<Settings size={16} />} label="Configuración" active={pathname === '/admin/settings'} />
          </div>

        </nav>

        {/* 🚪 BOTÓN DE LOGOUT ACTIVADO */}
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
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {children}
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
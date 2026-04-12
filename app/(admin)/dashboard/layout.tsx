"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FolderKanban, Beaker, Lock, 
  Settings, LogOut, ShieldCheck, Globe, Key, 
  Zap, ChevronRight, UserCircle, Menu, X
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  // Cerramos el menú en móvil cuando cambia la ruta
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  };

  return (
    <div className="h-screen w-full bg-[#050506] text-gray-400 font-sans flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Header Móvil */}
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

      {/* Overlay Móvil */}
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
        <button 
          onClick={() => setIsSidebarOpen(false)} 
          className="md:hidden absolute top-5 right-4 p-2 text-gray-500 hover:text-white bg-[#121214] rounded-lg border border-white/5"
        >
          <X size={18} />
        </button>

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

        <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <p className="px-4 text-[9px] font-mono uppercase tracking-[0.3em] text-gray-600 mb-4">Core</p>
            <div className="space-y-1">
              <AdminNavTab href="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" active={pathname === '/dashboard'} />
              <AdminNavTab href="/dashboard/profile" icon={<UserCircle size={16} />} label="Identity Manager" active={pathname === '/dashboard/profile'} />
              <AdminNavTab href="/" icon={<Globe size={16} />} label="Live Site" active={false} external />
            </div>
          </div>

          <div>
            <p className="px-4 text-[9px] font-mono uppercase tracking-[0.3em] text-gray-600 mb-4">Web Content</p>
            <div className="space-y-1">
              <AdminNavTab href="/dashboard/projects" icon={<FolderKanban size={16} />} label="Projects" active={pathname === '/dashboard/projects'} />
              <AdminNavTab href="/dashboard/lab" icon={<Beaker size={16} />} label="Lab Snippets" active={pathname === '/dashboard/lab'} />
            </div>
          </div>

          <div>
            <p className="px-4 text-[9px] font-mono uppercase tracking-[0.3em] text-indigo-500/50 mb-4 flex items-center gap-2">
              <Lock size={10} /> The Forge
            </p>
            <div className="space-y-1">
              <AdminNavTab href="/dashboard/forge" icon={<Zap size={16} />} label="Internal Repos" active={pathname === '/dashboard/forge'} />
              <AdminNavTab href="/dashboard/security" icon={<Key size={16} />} label="Privacy Keys" active={pathname === '/dashboard/security'} />
            </div>
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

      {/* --- CONTENIDO DEL DASHBOARD --- */}
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
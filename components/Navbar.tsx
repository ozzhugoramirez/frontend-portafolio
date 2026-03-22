"use client";

import React, { useState, useEffect } from 'react';
import { Download, Beaker, Home, Menu, X, Mail } from 'lucide-react'; 
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getProfile, trackEvent } from '@/lib/api'; 

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); 
  const pathname = usePathname();
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then(data => {
        if (data.cv_file) {
          const fullUrl = data.cv_file.startsWith('http') ? data.cv_file : `${BACKEND_URL}${data.cv_file}`;
          setCvUrl(fullUrl);
        }
      })
      .catch(error => console.error("Error silencioso cargando CV:", error));
  }, []);

  const handleCvDownload = () => {
    if (cvUrl) {
      trackEvent('download', 'cv');
    }
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 lg:px-12 py-4 bg-[#0e0e0e] border-b border-gray-800">
      
      {/* --- LOGO Y ESTADO --- */}
      <div className="flex items-center gap-4 z-[60]">
        <Link href="/" className="text-white text-sm md:text-base leading-tight font-medium hover:opacity-80 transition-opacity">
          Sebastian <br /> Villalba
        </Link>
        
        {/* 👉 NUEVO: Indicador de estado (Tech vibe) */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest">Available</span>
        </div>
      </div>

      {/* --- TABS DESKTOP --- */}
      <nav className="hidden lg:flex items-center bg-[#121212] border border-gray-800 rounded-full px-2 py-1 gap-1">
        <NavTab href="/" label="Home" active={pathname === '/'} icon={<Home size={12} />} />
        <NavTab href="/about" label="About" active={pathname === '/about'} />
        <NavTab href="/projects" label="Projects" active={pathname.startsWith('/projects')} />
        <NavTab href="/lab" label="Lab" active={pathname === '/lab'} isSpecial />
      </nav>

      {/* --- ACCIONES --- */}
      <div className="flex items-center gap-3 md:gap-6 z-[60]">
        
        {/* BOTÓN CV DESKTOP */}
        <a 
          href={cvUrl || "#"} 
          target={cvUrl ? "_blank" : "_self"} 
          rel="noopener noreferrer"
          onClick={handleCvDownload}
          className={`hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-mono border px-5 py-2 rounded-full transition-all duration-300 font-medium
            ${cvUrl ? 'border-gray-700 text-gray-300 hover:bg-white hover:text-black' : 'border-gray-800 text-gray-600 opacity-50 cursor-not-allowed'}
          `}
        >
          <Download size={14} /> {cvUrl ? 'CV' : 'N/A'}
        </a>

        {/* BOTÓN CONTACTO DESKTOP */}
        <Link 
          href="/contact"
          className="hidden md:flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full text-[10px] md:text-xs font-mono font-bold hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        >
          <Mail size={14} /> Contacto
        </Link>

        {/* 👉 NUEVO: ACCESO RÁPIDO A CONTACTO EN MÓVIL */}
        <Link 
          href="/contact"
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
        >
          <Mail size={20} />
        </Link>

        {/* BOTÓN HAMBURGUESA */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      <div className={`fixed inset-0 bg-[#0e0e0e] z-[55] flex flex-col p-8 pt-32 transition-transform duration-500 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <nav className="flex flex-col gap-6 flex-1">
          <MobileLink href="/" label="Home" active={pathname === '/'} onClick={closeMenu} />
          <MobileLink href="/about" label="About" active={pathname === '/about'} onClick={closeMenu} />
          <MobileLink href="/projects" label="Projects" active={pathname.startsWith('/projects')} onClick={closeMenu} />
          <MobileLink href="/lab" label="Lab Snippets" active={pathname === '/lab'} onClick={closeMenu} isSpecial />
          
          <div className="mt-auto space-y-4 pb-8">
            <Link 
              href="/contact"
              onClick={closeMenu}
              className="flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-mono text-sm uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Mail size={18} /> Iniciar Contacto
            </Link>

            <a 
              href={cvUrl || "#"} 
              onClick={() => { handleCvDownload(); closeMenu(); }}
              className="flex items-center justify-center gap-3 bg-[#121212] border border-gray-800 text-gray-300 py-4 rounded-2xl font-mono text-sm uppercase tracking-widest font-bold hover:text-white transition-colors"
            >
              <Download size={18} /> Descargar CV
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

// --- SUBCOMPONENTES ---

function NavTab({ href, label, active, isSpecial = false, icon }: any) {
  return (
    <Link href={href} className={`relative px-5 py-2 rounded-full text-[11px] uppercase tracking-widest font-medium transition-all duration-300 flex items-center gap-2 ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1f1f1f]'}`}>
      {icon} {isSpecial && <Beaker size={12} className={active ? 'text-indigo-400' : ''} />} {label}
      {active && <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-white rounded-full blur-[1px]" />}
    </Link>
  );
}

function MobileLink({ href, label, active, onClick, isSpecial = false }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`text-3xl font-mono tracking-tighter transition-all ${active ? 'text-white' : 'text-gray-400 hover:text-white'} flex items-center gap-4`}
    >
      {label} {isSpecial && <Beaker size={24} className="text-indigo-500" />}
      {active && <ArrowRight size={24} className="text-indigo-500" />}
    </Link>
  );
}

function ArrowRight({ size, className }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}
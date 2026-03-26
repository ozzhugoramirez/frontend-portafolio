"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getLabSnippets } from '@/lib/api';
import { Search, Terminal, Shield, Cloud, Sparkles, Copy, Check, ChevronRight, ChevronLeft, Hash, Clock } from 'lucide-react';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'; 

const ICON_MAP: Record<string, React.ReactNode> = {
  shield: <Shield size={16} />,
  cloud: <Cloud size={16} />,
  terminal: <Terminal size={16} />,
  sparkles: <Sparkles size={16} />,
  default: <Terminal size={16} />
};

// --- HELPERS ---
const formatDate = (isoString: string) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getReadTime = (code: string) => {
  if (!code) return "1 min read";
  const lines = code.split('\n').length;
  const mins = Math.max(1, Math.ceil(lines / 15));
  return `${mins} min read`;
};

const normalizeLanguage = (lang: string) => {
  const normalized = lang.toLowerCase().trim();
  if (normalized === 'c++') return 'cpp';
  if (normalized === 'js') return 'javascript';
  if (normalized === 'ts') return 'typescript';
  return normalized;
};

export default function LabPage() {
  const [snippets, setSnippets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);
  
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    getLabSnippets()
      .then(data => {
        const results = data.results ? data.results : data;
        setSnippets(results);
        
        const counts: Record<string, number> = {};
        results.forEach((s: any) => {
          counts[s.category] = (counts[s.category] || 0) + 1;
        });
        
        const catArray = Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
        setCategories([{ name: "Todos", count: results.length }, ...catArray]);
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar Lab:", err);
        setLoading(false);
      });
  }, []);

  const filteredItems = snippets.filter(item => {
    const matchCategory = activeFilter === "Todos" || item.category === activeFilter;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  useEffect(() => { setCurrentPage(1); }, [activeFilter, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-mono text-gray-500 text-xs tracking-widest uppercase animate-pulse">Sincronizando base de conocimiento...</div>;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-400 font-sans selection:bg-indigo-500/30 selection:text-white pb-24">
      <Navbar />

      {/* --- HEADER --- */}
      <header className="pt-32 pb-12 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto border-b border-white/5">
        <h1 className="text-4xl md:text-5xl font-mono text-white tracking-tighter mb-4">/lab</h1>
        <p className="max-w-xl text-sm leading-relaxed text-gray-500">
          Repository of critical configurations, C++ snippets, and <span className="text-indigo-400">automation</span> scripts.
        </p>
      </header>

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <main className="px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto mt-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* SIDEBAR */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-8 lg:sticky lg:top-28">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar comando..." 
                className="w-full bg-[#121214] border border-white/5 rounded-xl py-2.5 pl-10 pr-12 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
              />
            </div>

            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-4 px-2">Categorías</h3>
              <ul className="space-y-1">
                {categories.map(cat => (
                  <li key={cat.name}>
                    <button
                      onClick={() => setActiveFilter(cat.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                        activeFilter === cat.name 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                          : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-md border font-mono ${activeFilter === cat.name ? 'bg-white/20 border-white/10' : 'bg-[#09090b] border-white/5'}`}>
                        {cat.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* COLUMNA DERECHA: LISTA + PAGINACIÓN */}
          <div className="flex-1 w-full">
            
            <div className="space-y-16">
              {paginatedItems.length === 0 ? (
                <div className="text-center py-20 text-gray-500 font-mono text-sm border border-dashed border-gray-800 rounded-2xl">
                  No se encontraron fragmentos de código.
                </div>
              ) : (
                paginatedItems.map(item => (
                  <article key={item.id} id={`snippet-${item.id}`} className="group scroll-mt-32">
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-indigo-400 bg-indigo-400/10 px-2.5 py-1 rounded-md border border-indigo-400/20">
                            {ICON_MAP[item.icon_name] || ICON_MAP['default']} {item.category}
                          </span>
                          
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400/80 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                            <Clock size={10} /> {getReadTime(item.code)}
                          </span>
                          
                          <span className="text-[10px] text-gray-600 font-mono">{formatDate(item.created_at)}</span>
                        </div>

                        <button 
                          onClick={() => window.location.hash = `snippet-${item.id}`}
                          className="text-gray-700 hover:text-indigo-400 transition-colors p-1 bg-white/5 rounded-md opacity-0 group-hover:opacity-100"
                          title="Copiar link directo"
                        >
                          <Hash size={14} />
                        </button>
                      </div>
                      
                      <h2 className="text-2xl font-medium text-white mb-3 tracking-tight group-hover:text-indigo-300 transition-colors">{item.title}</h2>
                      <p className="text-sm text-gray-400 leading-relaxed max-w-3xl mb-4">{item.description}</p>

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag: string) => (
                            <span key={tag} className="text-[10px] text-gray-500 font-mono before:content-['#'] hover:text-white hover:bg-white/5 px-1.5 py-0.5 rounded transition-colors cursor-default">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#282a36] shadow-2xl mt-6 relative">
                      <div className="flex items-center justify-between px-5 py-3 bg-[#1e1f29] border-b border-black/20">
                        <div className="flex gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5555]/80"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#f1fa8c]/80"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#50fa7b]/80"></div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{item.language}</span>
                          <button 
                            onClick={() => handleCopy(item.id, item.code)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-all border shadow-sm ${
                              copiedId === item.id 
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                                : 'bg-black/20 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {copiedId === item.id ? <><Check size={12}/> Copiado</> : <><Copy size={12}/> Copy</>}
                          </button>
                        </div>
                      </div>

                      <div className="text-[13px] md:text-sm custom-scrollbar">
                        <SyntaxHighlighter
                          language={normalizeLanguage(item.language)}
                          style={dracula}
                          customStyle={{
                            margin: 0,
                            padding: '1.5rem',
                            background: 'transparent',
                            lineHeight: '1.6',
                            maxHeight: '400px'
                          }}
                          codeTagProps={{ style: { fontFamily: 'inherit' } }}
                        >
                          {item.code}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* CONTROLES DE PAGINACIÓN ADENTRO DE LA COLUMNA */}
            {totalPages > 1 && (
              <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between w-full">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1} 
                  className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white disabled:opacity-20 transition-all"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages} 
                  className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white disabled:opacity-20 transition-all"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
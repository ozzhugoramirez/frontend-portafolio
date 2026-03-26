"use client";

import React, { useState, useEffect } from 'react';
import { getLabSnippets, createLabSnippet, updateLabSnippet, deleteLabSnippet } from '@/lib/api';
import { 
  Plus, Edit3, Trash2, ArrowLeft, Save, CheckCircle, 
  FlaskConical, Eye, EyeOff, FileText, Code2, X, AlertTriangle
} from 'lucide-react';

export default function AdminLabPage() {
  const [snippets, setSnippets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<'list' | 'form'>('list');
  const [activeTab, setActiveTab] = useState<'general' | 'code'>('general');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: number, title: string}>({isOpen: false, id: 0, title: ''});

  const fetchSnippets = () => {
    setLoading(true);
    getLabSnippets(true).then(data => {
      setSnippets(data.results ? data.results : data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => { fetchSnippets(); }, []);

  const safeArray = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try { return JSON.parse(data); } catch { return []; }
  };

  const handleOpenForm = (snippet: any = null) => {
    if (snippet) {
      setEditingId(snippet.id);
      setFormData({
        ...snippet,
        tags: safeArray(snippet.tags)
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '', category: 'Scripts', description: '', code: '',
        language: 'bash', icon_name: 'terminal', tags: [], is_public: true
      });
    }
    setView('form');
    setActiveTab('general');
  };

  const handleChange = (e: any) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  // Handlers para los Tags
  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
  };
  const addTag = () => setFormData({ ...formData, tags: [...formData.tags, ''] });
  const removeTag = (index: number) => {
    setFormData({ ...formData, tags: formData.tags.filter((_: any, i: number) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');

    try {
      // Como no hay archivos, mandamos el JSON directo (Axios lo maneja perfecto)
      if (editingId) {
        await updateLabSnippet(editingId, formData);
      } else {
        await createLabSnippet(formData);
      }
      
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setView('list');
        fetchSnippets();
      }, 1500);
    } catch (error) {
      console.error(error);
      alert("Error al guardar el snippet. Verificá los campos.");
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: number, title: string) => {
    setDeleteModal({ isOpen: true, id, title });
  };

  const confirmDelete = async () => {
    try {
      await deleteLabSnippet(deleteModal.id);
      setDeleteModal({ isOpen: false, id: 0, title: '' });
      fetchSnippets();
    } catch (error) {
      alert("Error al eliminar el snippet.");
    }
  };

  if (loading && view === 'list') return <div className="p-12 font-mono text-xs text-gray-500 uppercase tracking-widest animate-pulse">Sincronizando Lab...</div>;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#050506] relative">
      
      {/* MODAL DE ELIMINACIÓN */}
      {deleteModal.isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0c0c0d] border border-red-900/50 p-8 rounded-3xl shadow-2xl shadow-red-900/20 max-w-sm w-full mx-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Eliminar Snippet</h3>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Estás por eliminar <span className="text-red-400 font-mono">"{deleteModal.title}"</span>. Esta acción es irreversible.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModal({isOpen: false, id: 0, title: ''})} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-300 text-xs font-mono hover:bg-white/5 transition-colors">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"><Trash2 size={14} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <header className="p-8 border-b border-white/5 flex justify-between items-center bg-[#080809]">
        <div>
          <h1 className="text-white text-xl font-mono tracking-tighter uppercase italic flex items-center gap-3">
            <FlaskConical size={20} className="text-indigo-500" /> Lab_Control
          </h1>
        </div>
        
        {view === 'list' ? (
          <button onClick={() => handleOpenForm()} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-mono hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
            <Plus size={14} /> Nuevo Snippet
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="text-xs font-mono text-gray-500 hover:text-white transition-colors flex items-center gap-2"><ArrowLeft size={14} /> Cancelar</button>
            <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-mono hover:bg-emerald-500 transition-all disabled:opacity-50">
              {saving ? 'Guardando...' : status === 'success' ? <><CheckCircle size={14}/> OK</> : <><Save size={14}/> Guardar</>}
            </button>
          </div>
        )}
      </header>

      {/* VISTA 1: LISTA */}
      {view === 'list' && (
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#0d0d0f]/50">
            <table className="w-full text-left text-[11px] font-mono">
              <thead className="bg-[#080809] text-gray-500 uppercase tracking-widest border-b border-white/5">
                <tr><th className="px-6 py-4 font-medium">Título</th><th className="px-6 py-4 font-medium">Categoría</th><th className="px-6 py-4 font-medium">Lenguaje</th><th className="px-6 py-4 font-medium text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {snippets.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium flex items-center gap-2">
                        {s.title} 
                        {!s.is_public && <span title="Oculto"><EyeOff size={12} className="text-gray-600" /></span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-indigo-400">{s.category}</td>
                    <td className="px-6 py-4 text-emerald-500/80">{s.language}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenForm(s)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Edit3 size={14}/></button>
                        <button onClick={() => handleDeleteClick(s.id, s.title)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {snippets.length === 0 && <div className="p-8 text-center text-gray-600 font-mono text-xs">El laboratorio está vacío.</div>}
          </div>
        </main>
      )}

      {/* VISTA 2: FORMULARIO */}
      {view === 'form' && (
        <>
          <nav className="px-8 pt-4 flex gap-6 border-b border-white/5 bg-[#080809]">
            <SubTab active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={<FileText size={14}/>} label="Info & Tags" />
            <SubTab active={activeTab === 'code'} onClick={() => setActiveTab('code')} icon={<Code2 size={14}/>} label="Editor de Código" />
          </nav>

          <form className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-32">
            
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in">
                <div className="space-y-4">
                  <InputGroup label="Título del Snippet" name="title" value={formData.title} onChange={handleChange} placeholder="Ej: Fix para UFW" />
                  <InputGroup label="Categoría (Para el Sidebar)" name="category" value={formData.category} onChange={handleChange} placeholder="Ej: Ciberseguridad" />
                  <InputGroup label="Ícono Lucide (shield, cloud, terminal, sparkles)" name="icon_name" value={formData.icon_name} onChange={handleChange} />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest px-2">Descripción (Para qué sirve)</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full bg-[#0c0c0d] border border-white/5 rounded-xl p-4 text-sm text-white outline-none focus:border-indigo-500/50 resize-y" />
                  </div>

                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between mt-4">
                    <span className="text-xs font-mono text-gray-300">Visible en el Lab Público</span>
                    <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} className="w-4 h-4 accent-emerald-500" />
                  </div>
                </div>

                {/* CONSTRUCTOR DE TAGS */}
                <div>
                  <div className="bg-[#0c0c0d] border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Etiquetas (Tags)</h4>
                      <button type="button" onClick={addTag} className="bg-white/5 hover:bg-white/10 p-1.5 rounded-md text-white transition-colors"><Plus size={14}/></button>
                    </div>
                    <div className="space-y-3">
                      {formData.tags.map((tag: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-[10px] text-gray-600 font-mono">#</span>
                          <input type="text" value={tag} onChange={(e) => handleTagChange(idx, e.target.value)} placeholder="Ej: linux" className="flex-1 bg-white/5 text-sm p-2 rounded-lg outline-none border border-transparent focus:border-indigo-500/50 text-white" />
                          <button type="button" onClick={() => removeTag(idx)} className="text-gray-600 hover:text-red-500 transition-colors p-2"><X size={14}/></button>
                        </div>
                      ))}
                      {formData.tags.length === 0 && <div className="text-[10px] text-gray-600 font-mono italic">Sin etiquetas.</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-6 animate-in fade-in h-full flex flex-col">
                <div className="w-full md:w-1/3">
                  <InputGroup label="Lenguaje de Sintaxis (bash, json, python, cpp, etc)" name="language" value={formData.language} onChange={handleChange} placeholder="Ej: bash" />
                </div>
                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest px-2">Código Crudo</label>
                  <textarea 
                    name="code" 
                    value={formData.code} 
                    onChange={handleChange} 
                    spellCheck="false" 
                    className="w-full flex-1 min-h-[400px] bg-[#0a0a0c] border border-white/5 rounded-xl p-6 text-[13px] font-mono text-gray-300 outline-none focus:border-emerald-500/50 resize-y custom-scrollbar leading-relaxed" 
                    placeholder="# Escribe tu código aquí..."
                  />
                </div>
              </div>
            )}
            
          </form>
        </>
      )}
    </div>
  );
}

function InputGroup({ label, name, value, onChange, type = "text", placeholder="" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest px-2">{label}</label>
      <input type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} className="w-full bg-[#0c0c0d] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all" />
    </div>
  );
}

function SubTab({ active, onClick, icon, label }: any) {
  return (
    <button type="button" onClick={onClick} className={`pb-4 px-2 flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest transition-all ${active ? 'text-white border-b-2 border-indigo-500' : 'text-gray-600 hover:text-gray-400'}`}>
      {icon} {label}
    </button>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '@/lib/api';
import { 
  Plus, Edit3, Trash2, ArrowLeft, Save, CheckCircle, 
  FolderKanban, Eye, EyeOff, LayoutTemplate, Terminal, 
  ListPlus, Youtube, Image as ImageIcon, X, AlertTriangle
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<'list' | 'form'>('list');
  const [activeTab, setActiveTab] = useState<'general' | 'content' | 'data'>('general');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  // --- ARCHIVOS ---
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // --- MODAL DE ELIMINACIÓN ---
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, slug: string}>({isOpen: false, slug: ''});

  const fetchProjects = () => {
    setLoading(true);
    getProjects(true).then(data => {
      setProjects(data.results ? data.results : data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => { fetchProjects(); }, []);

  const safeArray = (data: any, defaultVal: any[] = []) => {
    if (!data) return defaultVal;
    if (Array.isArray(data)) return data;
    try { return JSON.parse(data); } catch { return defaultVal; }
  };

  const handleOpenForm = (project: any = null) => {
    if (project) {
      setEditingSlug(project.slug);
      setFormData({
        ...project,
        tech_stack: safeArray(project.tech_stack),
        highlights: safeArray(project.highlights),
        prerequisites: safeArray(project.prerequisites),
        metrics: safeArray(project.metrics),
        structure: safeArray(project.structure),
        install_steps: safeArray(project.install_steps),
        changelog: typeof project.changelog === 'string' ? project.changelog : JSON.stringify(safeArray(project.changelog), null, 2),
        links: typeof project.links === 'object' && project.links !== null ? project.links : { github: '', live: '' }
      });
    } else {
      setEditingSlug(null);
      setFormData({
        title: '', slug: '', version: '', category: 'Full-stack', type: '',
        short_description: '', icon_name: 'server', gradient_class: 'from-zinc-800 to-black',
        is_public: true, clone_cmd: '', analysis_text: '', core_code: '', order: 0,
        youtube_url: '',
        links: { github: '', live: '' },
        tech_stack: [], highlights: [], prerequisites: [], metrics: [],
        structure: [], install_steps: [], 
        changelog: '[]'
      });
    }
    setImageFile(null);
    setGalleryFiles([]);
    setView('form');
    setActiveTab('general');
  };

  const handleChange = (e: any) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleStringArrayChange = (name: string, index: number, value: string) => {
    const newArray = [...formData[name]];
    newArray[index] = value;
    setFormData({ ...formData, [name]: newArray });
  };
  const addStringItem = (name: string) => setFormData({ ...formData, [name]: [...formData[name], ''] });
  const removeStringItem = (name: string, index: number) => {
    setFormData({ ...formData, [name]: formData[name].filter((_: any, i: number) => i !== index) });
  };

  const handleObjectArrayChange = (name: string, index: number, field: string, value: string) => {
    const newArray = [...formData[name]];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData({ ...formData, [name]: newArray });
  };
  const addObjectItem = (name: string, emptyObj: any) => setFormData({ ...formData, [name]: [...formData[name], emptyObj] });
  const removeObjectItem = (name: string, index: number) => {
    setFormData({ ...formData, [name]: formData[name].filter((_: any, i: number) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');

    const dataToSend = new FormData();
    
    const textFields = ['title', 'slug', 'version', 'category', 'type', 'short_description', 'icon_name', 'gradient_class', 'clone_cmd', 'analysis_text', 'core_code', 'order', 'youtube_url'];
    textFields.forEach(field => {
      if (formData[field] !== null && formData[field] !== undefined) dataToSend.append(field, formData[field]);
    });
    dataToSend.append('is_public', formData.is_public ? 'True' : 'False');

    const buildFields = ['tech_stack', 'highlights', 'prerequisites', 'metrics', 'structure', 'install_steps', 'links'];
    buildFields.forEach(field => {
      dataToSend.append(field, JSON.stringify(formData[field]));
    });

    try {
      const parsedChangelog = JSON.parse(formData.changelog);
      dataToSend.append('changelog', JSON.stringify(parsedChangelog));
    } catch (err) {
      alert("Error en el formato JSON del Changelog. Revisá la sintaxis.");
      setSaving(false); return;
    }

    if (imageFile) dataToSend.append('image_main', imageFile);
    galleryFiles.forEach(file => {
      dataToSend.append('gallery_images', file);
    });

    try {
      if (editingSlug) await updateProject(editingSlug, dataToSend);
      else await createProject(dataToSend);
      
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setView('list');
        fetchProjects();
      }, 1500);
    } catch (error) {
      alert("Error al guardar. Verificá que el SLUG no se repita y que todos los datos sean válidos.");
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  // --- LÓGICA DEL MODAL DE ELIMINACIÓN ---
  const handleDeleteClick = (slug: string) => {
    setDeleteModal({ isOpen: true, slug });
  };

  const confirmDelete = async () => {
    try {
      await deleteProject(deleteModal.slug);
      setDeleteModal({ isOpen: false, slug: '' });
      fetchProjects();
    } catch (error) {
      alert("Error al eliminar el proyecto.");
    }
  };

  if (loading && view === 'list') return <div className="p-12 font-mono text-xs text-gray-500 uppercase tracking-widest animate-pulse">Sincronizando The Forge...</div>;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#050506] relative">
      
      {/* MODAL DE ELIMINACIÓN MODERNIZADO */}
      {deleteModal.isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0c0c0d] border border-red-900/50 p-8 rounded-3xl shadow-2xl shadow-red-900/20 max-w-sm w-full mx-4 transform transition-all scale-100">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Eliminar Proyecto</h3>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Estás por destruir el repositorio <span className="text-red-400 font-mono">/{deleteModal.slug}</span> de forma permanente. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteModal({isOpen: false, slug: ''})}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-300 text-xs font-mono hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Destruir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <header className="p-8 border-b border-white/5 flex justify-between items-center bg-[#080809]">
        <div>
          <h1 className="text-white text-xl font-mono tracking-tighter uppercase italic flex items-center gap-3">
            <FolderKanban size={20} className="text-indigo-500" /> Project_Forge
          </h1>
        </div>
        
        {view === 'list' ? (
          <button onClick={() => handleOpenForm()} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-mono hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
            <Plus size={14} /> Nuevo Proyecto
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
                <tr><th className="px-6 py-4 font-medium">Proyecto (Slug)</th><th className="px-6 py-4 font-medium">Categoría</th><th className="px-6 py-4 font-medium">Estado</th><th className="px-6 py-4 font-medium text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.map((p) => (
                  <tr key={p.slug} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4"><div className="text-white font-medium">{p.title}</div><div className="text-gray-600 text-[9px] mt-1">/{p.slug}</div></td>
                    <td className="px-6 py-4 text-gray-500">{p.category}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 w-fit px-2 py-1 rounded-md border ${p.is_public ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-gray-500 bg-gray-500/10 border-gray-500/20'}`}>
                        {p.is_public ? <Eye size={10}/> : <EyeOff size={10}/>} {p.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenForm(p)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"><Edit3 size={14}/></button>
                        <button onClick={() => handleDeleteClick(p.slug)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-all"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {projects.length === 0 && <div className="p-8 text-center text-gray-600 font-mono text-xs">No hay proyectos. Creá el primero.</div>}
          </div>
        </main>
      )}

      {/* VISTA 2: FORMULARIO */}
      {view === 'form' && (
        <>
          <nav className="px-8 pt-4 flex gap-6 border-b border-white/5 bg-[#080809]">
            <SubTab active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={<LayoutTemplate size={14}/>} label="Básico & Media" />
            <SubTab active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon={<Terminal size={14}/>} label="Análisis & Código" />
            <SubTab active={activeTab === 'data'} onClick={() => setActiveTab('data')} icon={<ListPlus size={14}/>} label="Constructores de Datos" />
          </nav>

          <form className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-32">
            
            {/* TABS: GENERAL */}
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                <div className="space-y-4">
                  <InputGroup label="Título" name="title" value={formData.title} onChange={handleChange} />
                  <InputGroup label="Slug (URL)" name="slug" value={formData.slug} onChange={handleChange} disabled={!!editingSlug} />
                  <InputGroup label="Versión" name="version" value={formData.version} onChange={handleChange} />
                  <InputGroup label="Categoría" name="category" value={formData.category} onChange={handleChange} />
                  <InputGroup label="Tipo" name="type" value={formData.type} onChange={handleChange} />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest px-2">Descripción Corta</label>
                    <textarea name="short_description" value={formData.short_description} onChange={handleChange} rows={3} className="w-full bg-[#0c0c0d] border border-white/5 rounded-xl p-4 text-sm text-white outline-none focus:border-indigo-500/50 resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="GitHub URL" name="github" value={formData.links?.github} onChange={(e:any) => setFormData({...formData, links: {...formData.links, github: e.target.value}})} />
                    <InputGroup label="Live URL" name="live" value={formData.links?.live} onChange={(e:any) => setFormData({...formData, links: {...formData.links, live: e.target.value}})} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-300">Proyecto Público</span>
                    <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} className="w-4 h-4 accent-emerald-500" />
                  </div>

                  {/* YOUTUBE */}
                  <div className="p-6 bg-[#0c0c0d] border border-red-900/30 rounded-2xl space-y-4">
                    <h3 className="text-xs font-mono text-red-500 flex items-center gap-2"><Youtube size={16}/> Integración YouTube</h3>
                    <InputGroup label="URL del Video" name="youtube_url" value={formData.youtube_url} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." />
                  </div>

                  {/* IMÁGENES PREVIEWS */}
                  <div className="p-6 bg-[#0c0c0d] border border-white/5 rounded-2xl space-y-6">
                    <h3 className="text-xs font-mono text-emerald-500 flex items-center gap-2"><ImageIcon size={16}/> Media del Proyecto</h3>
                    
                    {/* IMAGEN PRINCIPAL (COVER) */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-mono text-gray-500 uppercase flex items-center justify-between">
                        Imagen Principal (Cover)
                        {(imageFile || formData.image_main) && <span className="text-emerald-500/70">Preview Activa</span>}
                      </label>
                      
                      {(imageFile || formData.image_main) && (
                        <div className="w-full max-w-[200px] aspect-video rounded-xl overflow-hidden border border-white/10 bg-black relative group">
                          <img 
                            src={imageFile ? URL.createObjectURL(imageFile) : (formData.image_main?.startsWith('http') ? formData.image_main : `${BACKEND_URL}${formData.image_main}`)} 
                            alt="Cover Preview" 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all"
                          />
                        </div>
                      )}

                      <input type="file" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer" />
                    </div>

                    {/* IMÁGENES DE GALERÍA (MÚLTIPLES) */}
                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <label className="text-[10px] font-mono text-gray-500 uppercase block">Imágenes para Galería (Múltiples)</label>

                      {formData.gallery && formData.gallery.length > 0 && (
                        <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-white/5">
                          <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">En el servidor ({formData.gallery.length}):</span>
                          <div className="flex flex-wrap gap-3">
                            {formData.gallery.map((img: any, idx: number) => (
                              <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-black relative group" title={img.caption || `Imagen ${idx+1}`}>
                                <img 
                                  src={img.image.startsWith('http') ? img.image : `${BACKEND_URL}${img.image}`} 
                                  alt="Gallery Server" 
                                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {galleryFiles.length > 0 && (
                        <div className="space-y-2 bg-indigo-900/10 p-3 rounded-xl border border-indigo-500/20">
                          <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-widest">Nuevas a subir ({galleryFiles.length}):</span>
                          <div className="flex flex-wrap gap-3">
                            {galleryFiles.map((file, idx) => (
                              <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-indigo-500/50 bg-black shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt={`New Gallery ${idx}`} 
                                  className="w-full h-full object-cover opacity-80"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <input type="file" multiple accept="image/*" onChange={(e) => {
                        if (e.target.files) setGalleryFiles(Array.from(e.target.files));
                      }} className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 transition-all cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TABS: CONTENIDO */}
            {activeTab === 'content' && (
              <div className="space-y-6 animate-in fade-in">
                <InputGroup label="Comando Clone (Git)" name="clone_cmd" value={formData.clone_cmd} onChange={handleChange} />
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-emerald-500/50 uppercase px-2">Análisis / Enfoque</label>
                  <textarea name="analysis_text" value={formData.analysis_text} onChange={handleChange} rows={6} className="w-full bg-[#0c0c0d] border border-white/5 rounded-xl p-4 text-sm text-gray-300 outline-none focus:border-emerald-500/50 resize-y" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-indigo-500/50 uppercase px-2">Código Core</label>
                  <textarea name="core_code" value={formData.core_code} onChange={handleChange} rows={10} spellCheck="false" className="w-full bg-[#0a0a0c] border border-white/5 rounded-xl p-4 text-[11px] font-mono text-gray-400 outline-none focus:border-indigo-500/50 resize-y" />
                </div>
              </div>
            )}

            {/* TABS: CONSTRUCTORES DE DATOS */}
            {activeTab === 'data' && (
              <div className="space-y-12 animate-in fade-in">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <BuilderListString title="Tech Stack" name="tech_stack" data={formData.tech_stack} onAdd={() => addStringItem('tech_stack')} onChange={(idx: number, val: string) => handleStringArrayChange('tech_stack', idx, val)} onRemove={(idx: number) => removeStringItem('tech_stack', idx)} placeholder="Ej: Python" />
                    <BuilderListString title="Highlights" name="highlights" data={formData.highlights} onAdd={() => addStringItem('highlights')} onChange={(idx: number, val: string) => handleStringArrayChange('highlights', idx, val)} onRemove={(idx: number) => removeStringItem('highlights', idx)} placeholder="Ej: UI Futurista" />
                    <BuilderListString title="Prerrequisitos" name="prerequisites" data={formData.prerequisites} onAdd={() => addStringItem('prerequisites')} onChange={(idx: number, val: string) => handleStringArrayChange('prerequisites', idx, val)} onRemove={(idx: number) => removeStringItem('prerequisites', idx)} placeholder="Ej: 512MB RAM" />
                  </div>

                  <div className="space-y-8">
                    <BuilderListObject title="Métricas de Rendimiento" data={formData.metrics} onAdd={() => addObjectItem('metrics', {label: '', value: '', trend: ''})} onRemove={(idx: number) => removeObjectItem('metrics', idx)}
                      renderItem={(item: any, idx: number) => (
                        <div className="grid grid-cols-3 gap-2">
                          <input type="text" placeholder="Label" value={item.label} onChange={(e) => handleObjectArrayChange('metrics', idx, 'label', e.target.value)} className="bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-indigo-500 text-white" />
                          <input type="text" placeholder="Value" value={item.value} onChange={(e) => handleObjectArrayChange('metrics', idx, 'value', e.target.value)} className="bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-indigo-500 text-white" />
                          <input type="text" placeholder="Trend" value={item.trend} onChange={(e) => handleObjectArrayChange('metrics', idx, 'trend', e.target.value)} className="bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-indigo-500 text-white" />
                        </div>
                      )}
                    />

                    <BuilderListObject title="Estructura de Carpetas" data={formData.structure} onAdd={() => addObjectItem('structure', {type: 'folder', name: '', desc: ''})} onRemove={(idx: number) => removeObjectItem('structure', idx)}
                      renderItem={(item: any, idx: number) => (
                        <div className="grid grid-cols-12 gap-2">
                          <select value={item.type} onChange={(e) => handleObjectArrayChange('structure', idx, 'type', e.target.value)} className="col-span-4 bg-[#0c0c0d] text-xs p-2 rounded outline-none border border-white/10 focus:border-indigo-500 text-gray-300">
                            <option value="folder">Folder</option>
                            <option value="file">File</option>
                          </select>
                          <input type="text" placeholder="/ruta" value={item.name} onChange={(e) => handleObjectArrayChange('structure', idx, 'name', e.target.value)} className="col-span-8 bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-indigo-500 text-white" />
                          <input type="text" placeholder="Descripción corta" value={item.desc} onChange={(e) => handleObjectArrayChange('structure', idx, 'desc', e.target.value)} className="col-span-12 bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-indigo-500 text-white mt-2" />
                        </div>
                      )}
                    />

                    <BuilderListObject title="Pasos de Instalación" data={formData.install_steps} onAdd={() => addObjectItem('install_steps', {step: '', code: ''})} onRemove={(idx: number) => removeObjectItem('install_steps', idx)}
                      renderItem={(item: any, idx: number) => (
                        <div className="space-y-2">
                          <input type="text" placeholder="Paso (Ej: 1. Compilar)" value={item.step} onChange={(e) => handleObjectArrayChange('install_steps', idx, 'step', e.target.value)} className="w-full bg-white/5 text-xs p-2 rounded outline-none border border-transparent focus:border-indigo-500 text-white" />
                          <input type="text" placeholder="Comando (Ej: make build)" value={item.code} onChange={(e) => handleObjectArrayChange('install_steps', idx, 'code', e.target.value)} className="w-full bg-[#0a0a0c] text-emerald-500 font-mono text-xs p-2 rounded border border-gray-800 outline-none" />
                        </div>
                      )}
                    />
                  </div>
                </div>

                <JSONArea label="Changelog (Historial - Formato JSON)" name="changelog" value={formData.changelog} onChange={handleChange} rows={6} />
              </div>
            )}
            
          </form>
        </>
      )}
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function InputGroup({ label, name, value, onChange, disabled = false, type = "text", placeholder="" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest px-2">{label}</label>
      <input type={type} name={name} value={value || ''} onChange={onChange} disabled={disabled} placeholder={placeholder} className="w-full bg-[#0c0c0d] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all disabled:opacity-50" />
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

function JSONArea({ label, name, value, onChange, rows = 8 }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest px-2">{label}</label>
      <textarea name={name} value={value} onChange={onChange} rows={rows} spellCheck="false" className="w-full bg-[#09090b] border border-white/5 rounded-xl p-4 text-[10px] md:text-[11px] font-mono text-gray-400 outline-none focus:border-emerald-500/30 transition-all resize-y custom-scrollbar" />
    </div>
  );
}

function BuilderListString({ title, data, onAdd, onChange, onRemove, placeholder }: any) {
  const safeData = Array.isArray(data) ? data : []; 
  return (
    <div className="bg-[#0c0c0d] border border-white/5 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest">{title}</h4>
        <button type="button" onClick={onAdd} className="bg-white/5 hover:bg-white/10 p-1.5 rounded-md text-white transition-colors"><Plus size={14}/></button>
      </div>
      <div className="space-y-3">
        {safeData.map((item: string, idx: number) => (
          <div key={idx} className="flex gap-2 items-center">
            <span className="text-[10px] text-gray-600 font-mono">{idx + 1}.</span>
            <input type="text" value={item} onChange={(e) => onChange(idx, e.target.value)} placeholder={placeholder} className="flex-1 bg-white/5 text-sm p-2 rounded-lg outline-none border border-transparent focus:border-indigo-500/50 text-white" />
            <button type="button" onClick={() => onRemove(idx)} className="text-gray-600 hover:text-red-500 transition-colors p-2"><X size={14}/></button>
          </div>
        ))}
        {safeData.length === 0 && <div className="text-[10px] text-gray-600 font-mono italic">No hay elementos cargados.</div>}
      </div>
    </div>
  );
}

function BuilderListObject({ title, data, onAdd, onRemove, renderItem }: any) {
  const safeData = Array.isArray(data) ? data : [];
  return (
    <div className="bg-[#0c0c0d] border border-white/5 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-widest">{title}</h4>
        <button type="button" onClick={onAdd} className="bg-white/5 hover:bg-white/10 p-1.5 rounded-md text-white transition-colors"><Plus size={14}/></button>
      </div>
      <div className="space-y-4">
        {safeData.map((item: any, idx: number) => (
          <div key={idx} className="flex gap-3 items-start bg-black/20 p-3 rounded-xl border border-white/5">
            <div className="flex-1">
              {renderItem(item, idx)} 
            </div>
            <button type="button" onClick={() => onRemove(idx)} className="text-gray-600 hover:text-red-500 transition-colors mt-1"><X size={14}/></button>
          </div>
        ))}
        {safeData.length === 0 && <div className="text-[10px] text-gray-600 font-mono italic">No hay elementos cargados.</div>}
      </div>
    </div>
  );
}
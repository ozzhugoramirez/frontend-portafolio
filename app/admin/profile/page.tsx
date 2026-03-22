"use client";

import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '@/lib/api'; 
import { Save, Upload, Info, BookOpen, Cpu, FileText, CheckCircle, Image as ImageIcon, FileCheck, UserCircle, ExternalLink, Link2, Award } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// --- PLANTILLAS JSON POR DEFECTO ---
const DEFAULT_PHILOSOPHY = [
  { "icon": "shield", "title": "Ejemplo Título", "desc": "Descripción de tu filosofía..." }
];
const DEFAULT_EDUCATION = [
  { "date": "2024 - Presente", "title": "Título", "institution": "Institución", "desc": "Descripción..." }
];
const DEFAULT_ARSENAL = [
  { "category": "Backend", "skills": ["Python", "Django"] }
];
const DEFAULT_SOCIAL = {
  "github": "https://github.com/",
  "linkedin": "https://linkedin.com/",
  "youtube": "https://youtube.com/",
  "tiktok": "https://tiktok.com/",
  "email": "mailto:correo@ejemplo.com"
};
const DEFAULT_CERTIFICATIONS = [
  { "title": "Certificado AWS", "issuer": "Amazon", "date": "2026", "link": "https://..." }
];

export default function AdminProfilePage() {
  const [originalData, setOriginalData] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Agregué una pestaña nueva 'links' para las redes y certificados
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'bio' | 'links' | 'json'>('general');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    getProfile().then(data => {
      // Formateamos todos los arrays/objetos a String con indentación (2) para que se vean lindos en los textareas
      const formattedData = {
        ...data,
        work_philosophy: data.work_philosophy?.length ? JSON.stringify(data.work_philosophy, null, 2) : JSON.stringify(DEFAULT_PHILOSOPHY, null, 2),
        education: data.education?.length ? JSON.stringify(data.education, null, 2) : JSON.stringify(DEFAULT_EDUCATION, null, 2),
        arsenal: data.arsenal?.length ? JSON.stringify(data.arsenal, null, 2) : JSON.stringify(DEFAULT_ARSENAL, null, 2),
        social_links: data.social_links ? JSON.stringify(data.social_links, null, 2) : JSON.stringify(DEFAULT_SOCIAL, null, 2),
        certifications: data.certifications?.length ? JSON.stringify(data.certifications, null, 2) : JSON.stringify(DEFAULT_CERTIFICATIONS, null, 2),
      };
      setFormData(formattedData);
      setOriginalData(formattedData);
      
      if (data.profile_photo) {
        setPhotoPreview(data.profile_photo.startsWith('http') ? data.profile_photo : `${BACKEND_URL}${data.profile_photo}`);
      }
      setLoading(false);
    });
  }, []);

  const isModified = () => {
    if (!formData || !originalData) return false;
    const dataChanged = JSON.stringify(formData) !== JSON.stringify(originalData);
    const filesAdded = photoFile !== null || cvFile !== null;
    return dataChanged || filesAdded;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setCvFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isModified()) return;

    setSaving(true);
    setStatus('idle');

    const dataToSend = new FormData();
    dataToSend.append('hero_title', formData.hero_title || '');
    dataToSend.append('bio_p1', formData.bio_p1 || '');
    dataToSend.append('bio_p2', formData.bio_p2 || '');
    dataToSend.append('location', formData.location || '');
    dataToSend.append('origin', formData.origin || '');
    dataToSend.append('languages', formData.languages || '');

    // Parseamos los JSON de vuelta a objetos reales antes de enviarlos a Django
    try {
      dataToSend.append('work_philosophy', JSON.stringify(JSON.parse(formData.work_philosophy)));
      dataToSend.append('education', JSON.stringify(JSON.parse(formData.education)));
      dataToSend.append('arsenal', JSON.stringify(JSON.parse(formData.arsenal)));
      dataToSend.append('social_links', JSON.stringify(JSON.parse(formData.social_links)));
      dataToSend.append('certifications', JSON.stringify(JSON.parse(formData.certifications)));
    } catch (err) {
      alert("Error crítico de sintaxis JSON. Revisá que las llaves {} y corchetes [] estén cerrados, y usá siempre comillas dobles para las claves y valores.");
      setSaving(false);
      return;
    }

    if (photoFile) dataToSend.append('profile_photo', photoFile);
    if (cvFile) dataToSend.append('cv_file', cvFile);

    try {
      await updateProfile(dataToSend);
      setOriginalData(formData);
      setPhotoFile(null);
      setCvFile(null);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      alert("Error de conexión al guardar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 font-mono text-xs animate-pulse text-gray-500 uppercase tracking-widest">Iniciando módulos de identidad...</div>;

  const canSave = isModified();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <header className="p-8 border-b border-white/5 flex justify-between items-center bg-[#080809]">
        <div>
          <h1 className="text-white text-xl font-mono tracking-tighter uppercase italic">Identity_Manager</h1>
          <p className="text-[10px] text-gray-600 font-mono tracking-widest mt-1">Configuración del perfil público y archivos críticos</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={!canSave || saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-mono transition-all ${canSave ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'}`}
        >
          {saving ? 'Syncing...' : status === 'success' ? <><CheckCircle size={14}/> Updated</> : <><Save size={14}/> Save Changes</>}
        </button>
      </header>

      {/* TABS DE NAVEGACIÓN */}
      <nav className="px-8 pt-4 flex gap-6 border-b border-white/5 bg-[#080809]">
        <SubTab active={activeSubTab === 'general'} onClick={() => setActiveSubTab('general')} icon={<Info size={14}/>} label="General" />
        <SubTab active={activeSubTab === 'bio'} onClick={() => setActiveSubTab('bio')} icon={<FileText size={14}/>} label="Biografía" />
        <SubTab active={activeSubTab === 'links'} onClick={() => setActiveSubTab('links')} icon={<Link2 size={14}/>} label="Redes & Certs" />
        <SubTab active={activeSubTab === 'json'} onClick={() => setActiveSubTab('json')} icon={<Cpu size={14}/>} label="Data Arrays" />
      </nav>

      <form className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        
        {/* PESTAÑA: GENERAL (Queda igual, fotos, cv y hero) */}
        {activeSubTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <div className="space-y-4">
              <InputGroup label="Hero Title" name="hero_title" value={formData.hero_title} onChange={handleChange} />
              <InputGroup label="Location" name="location" value={formData.location} onChange={handleChange} />
              <InputGroup label="Languages" name="languages" value={formData.languages} onChange={handleChange} />
              <InputGroup label="Origin" name="origin" value={formData.origin} onChange={handleChange} />
            </div>

            <div className="space-y-6">
              {/* Photo Upload */}
              <div className="p-6 bg-[#0c0c0d] border border-white/5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><ImageIcon size={64} /></div>
                <label className="text-[10px] font-mono text-indigo-400 uppercase block mb-6 relative z-10">Avatar / Profile Photo</label>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-20 h-20 rounded-full bg-black border-2 border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <UserCircle size={32} className="text-gray-600" />}
                  </div>
                  <div>
                    <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    <label htmlFor="photo-upload" className="cursor-pointer inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white px-4 py-2 rounded-lg text-xs font-mono transition-all">
                      <Upload size={14} /> {photoFile ? 'Cambiar Selección' : 'Subir Nueva Foto'}
                    </label>
                  </div>
                </div>
              </div>

              {/* CV Upload */}
              <div className="p-6 bg-[#0c0c0d] border border-white/5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><BookOpen size={64} /></div>
                <label className="text-[10px] font-mono text-indigo-400 uppercase block mb-6 relative z-10">Curriculum Vitae (PDF)</label>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5">
                    {cvFile || formData.cv_file ? <FileCheck size={20} className="text-emerald-500" /> : <FileText size={20} className="text-gray-500" />}
                  </div>
                  <div className="flex-1 flex flex-col items-start gap-2">
                    <input type="file" id="cv-upload" className="hidden" accept=".pdf" onChange={handleCvChange} />
                    <label htmlFor="cv-upload" className="cursor-pointer inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white px-4 py-2 rounded-lg text-xs font-mono transition-all">
                      <Upload size={14} /> {cvFile ? 'Cambiar PDF' : 'Upload PDF'}
                    </label>
                    
                    {cvFile ? (
                      <p className="text-[9px] font-mono text-emerald-500 mt-1">Listo para guardar: {cvFile.name}</p>
                    ) : formData.cv_file ? (
                      <a href={formData.cv_file.startsWith('http') ? formData.cv_file : `${BACKEND_URL}${formData.cv_file}`} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 transition-colors">
                        <ExternalLink size={10} /> Ver CV actual en nueva pestaña
                      </a>
                    ) : (
                      <p className="text-[9px] font-mono text-gray-500 mt-1">No hay CV cargado</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: BIO (Queda igual) */}
        {activeSubTab === 'bio' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest px-2">Bio Párrafo 1 (Visible en Home)</label>
              <textarea name="bio_p1" value={formData.bio_p1} onChange={handleChange} rows={4} className="w-full bg-[#0c0c0d] border border-white/5 rounded-2xl p-4 text-sm text-gray-300 outline-none focus:border-indigo-500/50 transition-all resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest px-2">Bio Párrafo 2 (Expandido)</label>
              <textarea name="bio_p2" value={formData.bio_p2} onChange={handleChange} rows={4} className="w-full bg-[#0c0c0d] border border-white/5 rounded-2xl p-4 text-sm text-gray-300 outline-none focus:border-indigo-500/50 transition-all resize-none" />
            </div>
          </div>
        )}

        {/* ⚠️ PESTAÑA NUEVA: REDES SOCIALES Y CERTIFICADOS (Edición JSON rápida) */}
        {activeSubTab === 'links' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3">
              <Award size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-mono text-emerald-200/70">
                Asegurate de que las URLs comiencen con <code>https://</code>. Si dejás el campo de una red social vacío o con un <code>#</code>, el botón se ocultará automáticamente en tu Home.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* REDES SOCIALES (Es un Objeto JSON {}) */}
              <JSONArea 
                label="Social Links (Objeto JSON)" 
                name="social_links" 
                value={formData.social_links} 
                onChange={handleChange} 
                colorClass="text-indigo-400"
              />
              
              {/* CERTIFICADOS (Es un Array JSON []) */}
              <JSONArea 
                label="Certifications (Array JSON)" 
                name="certifications" 
                value={formData.certifications} 
                onChange={handleChange} 
                colorClass="text-emerald-500/80"
              />
            </div>
          </div>
        )}

        {/* PESTAÑA: DATA ARRAYS ORIGINALES */}
        {activeSubTab === 'json' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3">
              <Info size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-mono text-indigo-200/70">
                Respetá las comillas dobles y la estructura de corchetes <code>[ ]</code>. Si rompés el formato, el sistema evitará que lo guardes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <JSONArea label="Education Array" name="education" value={formData.education} onChange={handleChange} colorClass="text-yellow-500/80" />
              <JSONArea label="Arsenal Array" name="arsenal" value={formData.arsenal} onChange={handleChange} colorClass="text-cyan-500/80" />
            </div>
            <JSONArea label="Filosofía de Trabajo" name="work_philosophy" value={formData.work_philosophy} onChange={handleChange} colorClass="text-rose-500/80" />
          </div>
        )}
      </form>
    </div>
  );
}

// --- SUBCOMPONENTES AUXILIARES ---

function InputGroup({ label, name, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono text-gray-600 uppercase tracking-widest px-2">{label}</label>
      <input type="text" name={name} value={value} onChange={onChange} className="w-full bg-[#0c0c0d] border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all" />
    </div>
  );
}

// Actualicé JSONArea para aceptar un "colorClass" y que cada bloque de código tenga un tono distinto
function JSONArea({ label, name, value, onChange, colorClass = "text-emerald-500/80" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest px-2">{label}</label>
      <textarea 
        name={name} 
        value={value} 
        onChange={onChange} 
        rows={12} 
        spellCheck="false" 
        className={`w-full bg-[#09090b] border border-white/5 rounded-2xl p-4 text-[11px] font-mono outline-none focus:border-white/20 transition-all resize-none ${colorClass}`} 
      />
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
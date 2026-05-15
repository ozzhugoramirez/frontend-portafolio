"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Clock, Activity, Tag, FolderGit2, X, Edit3, Settings2, Trash2, Calendar, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { getWorkProjectById, createWorkModule, createWorkLog, updateWorkProject, deleteWorkProject } from '@/lib/api';

const statusColors: any = {
    active: 'bg-[#e5f0ff] text-[#0071e3]',
    paused: 'bg-[#fff5e5] text-[#ff9500]',
    completed: 'bg-[#e5f5ea] text-[#34c759]',
    cancelled: 'bg-[#ffe5e5] text-[#ff3b30]',
    todo: 'bg-[#f5f5f7] text-[#515154]',
    in_progress: 'bg-[#e5f0ff] text-[#0071e3]',
    testing: 'bg-[#fff5e5] text-[#ff9500]',
    done: 'bg-[#e5f5ea] text-[#34c759]'
};

const logTypeConfig: any = {
    feature: { label: 'Nueva Función', color: 'text-[#34c759]' },
    bugfix: { label: 'Corrección', color: 'text-[#ff3b30]' },
    note: { label: 'Nota', color: 'text-[#86868b]' },
    refactor: { label: 'Mejora', color: 'text-[#0071e3]' }
};


const LogItem = ({ log }: { log: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongText = log.content.length > 150;

    return (
        <div className="relative flex items-start gap-5">
            <div className="relative z-10 w-6 h-6 rounded-full bg-white border-[3px] border-[#e5e5ea] flex items-center justify-center mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
            </div>
            <div className="flex-1 bg-white border border-[#f5f5f7] rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`text-[13px] font-semibold flex items-center gap-1.5 ${logTypeConfig[log.log_type]?.color || 'text-[#86868b]'}`}>
                        <Activity size={14} /> {logTypeConfig[log.log_type]?.label || log.log_type}
                    </span>
                    {log.version_tag && (
                        <span className="text-[11px] bg-[#f5f5f7] px-2 py-0.5 rounded text-[#515154] flex items-center gap-1 font-medium">
                            <Tag size={12} /> {log.version_tag}
                        </span>
                    )}
                    <span className="text-[12px] text-[#86868b] ml-auto flex items-center gap-1">
                        <Clock size={14} /> {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                </div>
                <p className={`text-[15px] text-[#1d1d1f] whitespace-pre-wrap leading-relaxed transition-all duration-300 ${!isExpanded && isLongText ? 'line-clamp-3' : ''}`}>
                    {log.content}
                </p>
                {isLongText && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#0071e3] hover:text-[#0077ED] text-[13px] font-medium mt-3 transition-colors">
                        {isExpanded ? 'Mostrar menos' : 'Leer completo'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = Number(params.id);

    const [project, setProject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeModuleId, setActiveModuleId] = useState<number | null>(null);

    // Modales de Proyecto
    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editData, setEditData] = useState({ title: '', description: '', status: 'active', repository_url: '', target_date: '' });

    // Modales de Módulo y Logs
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [moduleTitle, setModuleTitle] = useState('');
    const [moduleDesc, setModuleDesc] = useState('');
    const [isWritingLog, setIsWritingLog] = useState(false);
    const [logContent, setLogContent] = useState('');
    const [logType, setLogType] = useState('note');
    const [logVersion, setLogVersion] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetchProjectData();
    }, [projectId]);

    const fetchProjectData = async () => {
        try {
            const data = await getWorkProjectById(projectId);
            setProject(data);
            if (data.modules && data.modules.length > 0 && !activeModuleId) {
                setActiveModuleId(data.modules[0].id);
            }
        } catch (error) {
            router.push('/dashboard/planner');
        } finally {
            setIsLoading(false);
        }
    };

    // --- ACCIONES DE PROYECTO ---
    const openEditModal = () => {
        setEditData({
            title: project.title,
            description: project.description || '',
            status: project.status || 'active',
            repository_url: project.repository_url || '',
            target_date: project.target_date || ''
        });
        setIsEditProjectModalOpen(true);
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {

            const payload = {
                ...editData,
                target_date: editData.target_date === '' ? null : editData.target_date,
                repository_url: editData.repository_url === '' ? null : editData.repository_url,
            };

            await updateWorkProject(projectId, payload);

            setIsEditProjectModalOpen(false);
            fetchProjectData();
        } catch (error: any) {

            console.error("Error actualizando proyecto:", error.response?.data || error);
        }
    };

    const handleDeleteProject = async () => {
        try {
            await deleteWorkProject(projectId);
            router.push('/dashboard/planner');
        } catch (error) {
            console.error("Error eliminando proyecto:", error);
        }
    };

    // --- ACCIONES DE MÓDULOS Y LOGS ---
    const handleCreateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createWorkModule({ project: projectId, title: moduleTitle, description: moduleDesc });
            setModuleTitle('');
            setModuleDesc('');
            setIsModuleModalOpen(false);
            fetchProjectData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeModuleId || !logContent.trim()) return;
        try {
            await createWorkLog({ module: activeModuleId, content: logContent, log_type: logType, version_tag: logVersion });
            setLogContent('');
            setLogVersion('');
            setIsWritingLog(false);
            fetchProjectData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLogContent(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white">
                <div className="w-6 h-6 border-2 border-[#f5f5f7] border-t-[#0071e3] rounded-full animate-spin mb-4"></div>
                <p className="text-[#86868b] text-[13px] font-medium tracking-wide">Cargando espacio de trabajo...</p>
            </div>
        );
    }
    if (!project) return null;

    const activeModule = project.modules?.find((m: any) => m.id === activeModuleId);

    return (
        <div className="p-6 md:p-8 w-full min-h-screen bg-white flex flex-col relative">


            <div className="mb-8 border-b border-[#f5f5f7] pb-6 shrink-0">
                <Link href="/dashboard/planner" className="inline-flex items-center gap-1 text-[13px] font-medium text-[#86868b] hover:text-[#0071e3] mb-4 transition-colors">
                    <ChevronLeft size={16} /> Volver
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">{project.title}</h1>
                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${statusColors[project.status] || 'bg-gray-100'}`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-[#86868b] text-[15px] mt-2 max-w-2xl">{project.description}</p>


                        <div className="flex items-center gap-4 mt-4">
                            {project.repository_url && (
                                <a href={project.repository_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13px] text-[#0071e3] hover:underline font-medium">
                                    <LinkIcon size={14} /> Repositorio
                                </a>
                            )}
                            {project.target_date && (
                                <div className="flex items-center gap-1.5 text-[13px] text-[#515154] font-medium bg-[#f5f5f7] px-2 py-1 rounded-md">
                                    <Calendar size={14} className="text-[#86868b]" /> Límite: {new Date(project.target_date).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={openEditModal} className="flex items-center justify-center w-10 h-10 bg-[#f5f5f7] text-[#515154] rounded-xl hover:bg-[#e5e5ea] hover:text-[#1d1d1f] transition-colors" title="Editar Proyecto">
                            <Settings2 size={18} />
                        </button>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center justify-center w-10 h-10 bg-[#fff5f5] text-[#ff3b30] rounded-xl hover:bg-[#ffe5e5] transition-colors" title="Eliminar Proyecto">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 flex-1 items-start">

                <aside className="w-full md:w-[320px] shrink-0 flex flex-col gap-4 md:sticky md:top-6 md:h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-[14px] font-semibold text-[#86868b] uppercase tracking-wider">Módulos</h2>
                        <button onClick={() => setIsModuleModalOpen(true)} className="text-[#0071e3] hover:text-[#0077ED] p-1 bg-[#0071e3]/10 rounded-md">
                            <Plus size={16} />
                        </button>
                    </div>
                    {project.modules?.map((module: any) => (
                        <div key={module.id} onClick={() => setActiveModuleId(module.id)} className={`p-4 rounded-xl cursor-pointer transition-all border ${activeModuleId === module.id ? 'bg-[#fbfbfd] border-[#0071e3] shadow-sm' : 'bg-white border-[#d2d2d7] hover:border-[#86868b]'}`}>
                            <h3 className={`text-[15px] font-medium ${activeModuleId === module.id ? 'text-[#0071e3]' : 'text-[#1d1d1f]'}`}>{module.title}</h3>
                            <span className={`inline-block px-2 py-0.5 mt-2 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[module.status] || statusColors.todo}`}>
                                {module.status.replace('_', ' ')}
                            </span>
                        </div>
                    ))}
                </aside>


                <main className="flex-1 min-w-0 bg-white pb-20">
                    {activeModule && (
                        <div className="flex flex-col h-full">
                            <div className="mb-6 flex justify-between items-start">
                                <div>
                                    <h2 className="text-[22px] font-semibold text-[#1d1d1f] flex items-center gap-2"><FolderGit2 size={22} className="text-[#86868b]" /> {activeModule.title}</h2>
                                    {activeModule.description && <p className="text-[#86868b] text-[14px] mt-2">{activeModule.description}</p>}
                                </div>
                                {!isWritingLog && (
                                    <button onClick={() => setIsWritingLog(true)} className="flex items-center gap-2 bg-[#0071e3] text-white px-4 py-2 rounded-xl text-[14px] font-medium hover:bg-[#0077ED] transition-colors">
                                        <Edit3 size={16} /> Crear Registro
                                    </button>
                                )}
                            </div>

                            {isWritingLog && (
                                <div className="bg-[#fbfbfd] border border-[#0071e3] ring-4 ring-[#0071e3]/10 rounded-2xl p-5 mb-8 transition-all animate-in fade-in slide-in-from-top-4">
                                    <form onSubmit={handleCreateLog} className="flex flex-col gap-4">
                                        <textarea ref={textareaRef} required value={logContent} onChange={handleTextareaChange} placeholder="Escribí acá tus avances..." className="w-full bg-transparent resize-none outline-none text-[15px] text-[#1d1d1f] placeholder-[#86868b] min-h-[60px] overflow-hidden" />
                                        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-[#d2d2d7] gap-4">
                                            <div className="flex items-center gap-3">
                                                <select value={logType} onChange={(e) => setLogType(e.target.value)} className="bg-white border border-[#d2d2d7] text-[13px] rounded-lg px-3 py-1.5 outline-none">
                                                    <option value="note">📝 Nota / Idea</option>
                                                    <option value="feature">✨ Nueva Función</option>
                                                    <option value="bugfix">🐛 Corrección</option>
                                                    <option value="refactor">♻️ Mejora/Refactor</option>
                                                </select>
                                                <input type="text" value={logVersion} onChange={(e) => setLogVersion(e.target.value)} placeholder="Ej: v1.0" className="bg-white border border-[#d2d2d7] text-[13px] rounded-lg px-3 py-1.5 outline-none w-24" />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button type="button" onClick={() => setIsWritingLog(false)} className="text-[#86868b] hover:text-[#1d1d1f] text-[14px] font-medium">Cancelar</button>
                                                <button type="submit" disabled={!logContent.trim()} className="bg-[#0071e3] text-white px-5 py-2 rounded-xl text-[14px] font-medium hover:bg-[#0077ED] disabled:opacity-50">Publicar</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div>
                                <h3 className="text-[14px] font-semibold text-[#86868b] uppercase tracking-wider mb-6">Historial</h3>
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-px before:bg-[#e5e5ea]">
                                    {activeModule.logs?.map((log: any) => <LogItem key={log.id} log={log} />)}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* --- MODAL EDITAR PROYECTO --- */}
            {isEditProjectModalOpen && (
                <div className="fixed inset-0 bg-[#1d1d1f]/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-[500px] p-8 relative shadow-2xl">
                        <button onClick={() => setIsEditProjectModalOpen(false)} className="absolute top-6 right-6 p-2 bg-[#f5f5f7] rounded-full hover:bg-[#e5e5ea]"><X size={16} /></button>
                        <h2 className="text-[22px] font-semibold text-[#1d1d1f] mb-6">Configuración del Proyecto</h2>

                        <form onSubmit={handleUpdateProject} className="space-y-4">
                            <div>
                                <label className="block text-[13px] font-medium text-[#515154] mb-1.5">Título</label>
                                <input required value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#fbfbfd] text-[14px] outline-none focus:border-[#0071e3]" />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[13px] font-medium text-[#515154] mb-1.5">Estado</label>
                                    <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#fbfbfd] text-[14px] outline-none">
                                        <option value="active">Activo</option>
                                        <option value="paused">Pausado</option>
                                        <option value="completed">Completado</option>
                                        <option value="cancelled">Cancelado</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[13px] font-medium text-[#515154] mb-1.5">Fecha Límite</label>
                                    <input type="date" value={editData.target_date} onChange={(e) => setEditData({ ...editData, target_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#fbfbfd] text-[14px] outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-[#515154] mb-1.5">Repositorio (URL)</label>
                                <input type="url" value={editData.repository_url} onChange={(e) => setEditData({ ...editData, repository_url: e.target.value })} placeholder="https://github.com/..." className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#fbfbfd] text-[14px] outline-none focus:border-[#0071e3]" />
                            </div>

                            <div>
                                <label className="block text-[13px] font-medium text-[#515154] mb-1.5">Descripción</label>
                                <textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] bg-[#fbfbfd] text-[14px] outline-none resize-none focus:border-[#0071e3]" />
                            </div>

                            <button type="submit" className="w-full bg-[#1d1d1f] text-white py-3 rounded-xl text-[15px] font-medium hover:bg-black transition-colors mt-2">Guardar Cambios</button>
                        </form>
                    </div>
                </div>
            )}


            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-[#1d1d1f]/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-[400px] p-8 text-center shadow-2xl relative">
                        <div className="w-14 h-14 bg-[#ffe5e5] text-[#ff3b30] rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={28} />
                        </div>
                        <h2 className="text-[20px] font-semibold text-[#1d1d1f] mb-2">¿Eliminar Proyecto?</h2>
                        <p className="text-[#86868b] text-[14px] mb-8 leading-relaxed">
                            Esta acción borrará el proyecto "{project.title}", todos sus módulos y el historial completo. No se puede deshacer.
                        </p>

                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-[#f5f5f7] text-[#1d1d1f] py-3 rounded-xl text-[14px] font-medium hover:bg-[#e5e5ea] transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleDeleteProject} className="flex-1 bg-[#ff3b30] text-white py-3 rounded-xl text-[14px] font-medium hover:bg-[#d70015] transition-colors">
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {isModuleModalOpen && (
                <div className="fixed inset-0 bg-[#1d1d1f]/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-[420px] p-8 relative">
                        <button onClick={() => setIsModuleModalOpen(false)} className="absolute top-6 right-6 p-2 bg-[#f5f5f7] rounded-full"><X size={16} /></button>
                        <h2 className="text-[22px] font-semibold mb-6">Nuevo Módulo</h2>
                        <form onSubmit={handleCreateModule} className="space-y-5">
                            <input required value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="Nombre del Módulo" className="w-full px-4 py-3 rounded-xl border border-[#d2d2d7] bg-[#fbfbfd] text-[14px] outline-none" />
                            <button type="submit" className="w-full bg-[#1d1d1f] text-white py-3.5 rounded-xl text-[15px] font-medium mt-2">Guardar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FolderGit2, X, Calendar } from 'lucide-react';
import { getWorkProjects, createWorkProject } from '@/lib/api';


const statusConfig: Record<string, { label: string, badgeClasses: string }> = {
    active: { label: 'Activo', badgeClasses: 'bg-[#e5f0ff] text-[#0071e3]' },
    paused: { label: 'Pausado', badgeClasses: 'bg-[#fff5e5] text-[#ff9500]' },
    completed: { label: 'Completado', badgeClasses: 'bg-[#e5f5ea] text-[#34c759]' },
    cancelled: { label: 'Cancelado', badgeClasses: 'bg-[#ffe5e5] text-[#ff3b30]' },
};

export default function PlannerPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const data = await getWorkProjects();

            const projectList = data.results ? data.results : (Array.isArray(data) ? data : []);
            setProjects(projectList);
        } catch (error) {
            console.error("Error al cargar proyectos:", error);
            setProjects([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createWorkProject({ title, description });
            setTitle('');
            setDescription('');
            setIsModalOpen(false);
            fetchProjects();
        } catch (error) {
            console.error("Error al crear:", error);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full min-h-screen bg-white">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">
                        Proyectos
                    </h1>
                    <p className="text-[#86868b] mt-1 text-[15px]">
                        Tu espacio central para gestionar tareas y desarrollos.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#0071e3] text-white px-4 py-2 rounded-full text-[14px] font-medium hover:bg-[#0077ED] transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    Nuevo Proyecto
                </button>
            </div>


            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <span className="text-[#86868b] text-[14px]">Cargando tu espacio...</span>
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-[#d2d2d7] rounded-2xl bg-[#fbfbfd]">
                    <p className="text-[#86868b] text-[15px]">Aún no tenés proyectos creados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link href={`/dashboard/planner/${project.id}`} key={project.id}>
                            <div className="bg-white border border-[#d2d2d7] rounded-2xl p-6 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:border-transparent transition-all duration-300 group h-full flex flex-col cursor-pointer">

                                <div className="flex justify-between items-start mb-5">
                                    <div className="p-2.5 bg-[#f5f5f7] rounded-xl text-[#1d1d1f] group-hover:bg-[#0071e3] group-hover:text-white transition-colors duration-300">
                                        <FolderGit2 size={20} strokeWidth={1.5} />
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide ${statusConfig[project.status]?.badgeClasses || 'bg-gray-100 text-gray-600'}`}>
                                        {statusConfig[project.status]?.label || project.status}
                                    </span>
                                </div>

                                <h3 className="text-[19px] font-semibold text-[#1d1d1f] tracking-tight mb-2">
                                    {project.title}
                                </h3>
                                <p className="text-[14px] text-[#86868b] line-clamp-2 mb-6 flex-1 leading-relaxed">
                                    {project.description || 'Sin descripción detallada.'}
                                </p>

                                <div className="pt-4 border-t border-[#f5f5f7] flex items-center text-[12px] text-[#86868b] gap-2">
                                    <Calendar size={14} strokeWidth={1.5} />
                                    <span>Modificado: {new Date(project.updated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}


            {isModalOpen && (
                <div className="fixed inset-0 bg-[#1d1d1f]/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-[420px] p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 text-[#86868b] hover:text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e5e5ea] p-2 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <h2 className="text-[22px] font-semibold text-[#1d1d1f] mb-6 tracking-tight">Crear Proyecto</h2>

                        <form onSubmit={handleCreateProject} className="space-y-5">
                            <div>
                                <label className="block text-[13px] font-medium text-[#515154] mb-2">Título</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#d2d2d7] bg-[#fbfbfd] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 focus:border-[#0071e3] transition-all text-[#1d1d1f] text-[15px]"
                                    placeholder="Ej: Silo App"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-[#515154] mb-2">Descripción (Opcional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-[#d2d2d7] bg-[#fbfbfd] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 focus:border-[#0071e3] transition-all text-[#1d1d1f] text-[15px] resize-none"
                                    placeholder="Detalles sobre el proyecto..."
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-[#0071e3] text-white py-3.5 rounded-xl text-[15px] font-medium hover:bg-[#0077ED] transition-colors"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
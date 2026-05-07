"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus, Pencil, Trash2, Calendar, FileText,
    Image as ImageIcon, X, Loader2, Clock, ArrowLeft, AlertTriangle
} from 'lucide-react';
import {
    getTimelineEvents, createTimelineEvent,
    updateTimelineEvent, deleteTimelineEvent,
    deleteTimelineMedia
} from '@/lib/api';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

type ViewState = 'list' | 'form';

// Interface para que TypeScript entienda los datos
interface TimelineEvent {
    id: number;
    title: string;
    slug: string;
    event_date: string;
    brief_description: string;
    content: string;
    media?: any[];
}

// Interface para las vistas previas de archivos nuevos
interface FilePreview {
    file: File;
    url: string;
    isImage: boolean;
}

export default function AdminTimeline() {
    const [view, setView] = useState<ViewState>('list');
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para Modales de Eliminación
    const [eventToDelete, setEventToDelete] = useState<TimelineEvent | null>(null);
    const [mediaToDelete, setMediaToDelete] = useState<any | null>(null); // Nuevo estado para archivos

    // Estados del Formulario
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSlug, setEditingSlug] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '', event_date: '', brief_description: '', content: ''
    });

    const [existingMedia, setExistingMedia] = useState<any[]>([]);

    // Estados para archivos nuevos
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);

    // 1. CARGAR EVENTOS
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await getTimelineEvents();
            setEvents(data);
        } catch (error) {
            console.error("Error al cargar timeline", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Limpiar URLs de preview para no gastar memoria
    useEffect(() => {
        return () => {
            filePreviews.forEach(p => { if (p.url) URL.revokeObjectURL(p.url); });
        };
    }, [filePreviews]);

    // 2. MANEJO DE VISTAS
    const handleOpenForm = (event: TimelineEvent | null = null) => {
        if (event) {
            setFormData({
                title: event.title,
                event_date: event.event_date,
                brief_description: event.brief_description,
                content: event.content
            });
            setEditingSlug(event.slug);
            setExistingMedia(event.media || []);
        } else {
            setFormData({ title: '', event_date: '', brief_description: '', content: '' });
            setEditingSlug(null);
            setExistingMedia([]);
        }
        setFiles([]);
        setFilePreviews([]);
        setView('form');
    };

    const handleCloseForm = () => {
        setView('list');
    };

    // 3. MANEJO DE ARCHIVOS NUEVOS (PREVIEWS)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(selectedFiles);

            const previews = selectedFiles.map(file => {
                const isImage = file.type.startsWith('image/');
                return {
                    file,
                    url: isImage ? URL.createObjectURL(file) : '',
                    isImage
                };
            });
            setFilePreviews(previews);
        }
    };

    // 4. GUARDAR FORMULARIO
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('event_date', formData.event_date);
        data.append('brief_description', formData.brief_description);
        data.append('content', formData.content);

        files.forEach((file) => data.append('files', file));

        try {
            if (editingSlug) {
                await updateTimelineEvent(editingSlug, data);
            } else {
                await createTimelineEvent(data);
            }
            await fetchEvents();
            handleCloseForm();
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un error al guardar el evento.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. ELIMINAR EVENTO COMPLETO
    const confirmDeleteEvent = async () => {
        if (!eventToDelete) return;
        try {
            await deleteTimelineEvent(eventToDelete.slug);
            await fetchEvents();
            setEventToDelete(null);
        } catch (error) {
            console.error("Error al eliminar", error);
        }
    };

    // 6. ELIMINAR UNA FOTO/ARCHIVO INDIVIDUAL
    const confirmDeleteMedia = async () => {
        if (!mediaToDelete) return;
        try {
            await deleteTimelineMedia(mediaToDelete.id);
            setExistingMedia(prev => prev.filter(m => m.id !== mediaToDelete.id));
            setMediaToDelete(null);
        } catch (error) {
            console.error("Error al eliminar media", error);
            alert("No se pudo eliminar el archivo.");
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans pb-20">

            {/* =========================================================
          VISTA 1: LISTADO DE EVENTOS
          ========================================================= */}
            {view === 'list' && (
                <div className="p-6 md:p-10 max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                        <div>
                            <h1 className="text-[28px] font-semibold tracking-tight">Timeline Logs</h1>
                            <p className="text-[15px] text-[#86868b] mt-1">
                                Gestioná tu historial y experiencias.
                            </p>
                        </div>
                        <button
                            onClick={() => handleOpenForm()}
                            className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 py-2.5 rounded-full text-[15px] font-medium transition-colors flex items-center gap-2 w-fit shadow-sm"
                        >
                            <Plus size={18} /> Nuevo Registro
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-[#0071e3]" />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="bg-white border border-[#d2d2d7] rounded-2xl p-16 text-center flex flex-col items-center shadow-sm">
                            <Calendar size={48} className="text-[#86868b] mb-4" />
                            <h3 className="text-lg font-medium mb-2">No hay registros</h3>
                            <p className="text-[#86868b]">Empezá a documentar tu historia creando el primer evento.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div key={event.id} className="bg-white border border-[#d2d2d7] rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-start justify-between gap-6">

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="bg-[#f5f5f7] text-[#1d1d1f] text-xs px-3 py-1.5 rounded-md font-medium border border-[#d2d2d7]">
                                                {event.event_date}
                                            </span>
                                            {event.media && event.media.length > 0 && (
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-[#0071e3]">
                                                    <ImageIcon size={14} /> {event.media.length} adjuntos
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-[20px] font-semibold tracking-tight mb-2">{event.title}</h3>
                                        <p className="text-[15px] text-[#515154] line-clamp-2">{event.brief_description}</p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 border-t border-[#f5f5f7] md:border-t-0 pt-4 md:pt-0">
                                        <button
                                            onClick={() => handleOpenForm(event)}
                                            className="p-2.5 text-[#86868b] hover:text-[#0071e3] hover:bg-[#0071e3]/10 rounded-full transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => setEventToDelete(event)}
                                            className="p-2.5 text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 rounded-full transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* =========================================================
          VISTA 2: FORMULARIO (PANTALLA COMPLETA)
          ========================================================= */}
            {view === 'form' && (
                <div className="max-w-4xl mx-auto p-6 md:p-10">

                    <button
                        onClick={handleCloseForm}
                        className="flex items-center gap-2 text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-8 text-[15px] font-medium"
                    >
                        <ArrowLeft size={18} /> Volver a la lista
                    </button>

                    <h1 className="text-[32px] font-semibold tracking-tight mb-8">
                        {editingSlug ? 'Editar Registro' : 'Nuevo Registro'}
                    </h1>

                    <form onSubmit={handleSubmit} className="bg-white border border-[#d2d2d7] rounded-3xl p-6 md:p-10 shadow-sm space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide">Título del evento</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
                                    placeholder="Ej: Completé el curso de AWS"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide">Fecha de lo sucedido</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.event_date}
                                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide">Breve Resumen</label>
                            <input
                                type="text"
                                required
                                value={formData.brief_description}
                                onChange={(e) => setFormData({ ...formData, brief_description: e.target.value })}
                                className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
                                placeholder="Un subtítulo gancho de una línea..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide flex items-center gap-2">
                                <FileText size={16} /> Redacción completa
                            </label>
                            <textarea
                                required
                                rows={12}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-4 py-4 text-[15px] leading-relaxed focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all resize-y"
                                placeholder="Escribí toda la historia acá. Los saltos de línea se van a respetar en la web pública..."
                            />
                        </div>

                        {/* ZONA DE ARCHIVOS ADJUNTOS */}
                        <div className="space-y-4 pt-4 border-t border-[#d2d2d7]">
                            <label className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide flex items-center gap-2">
                                <ImageIcon size={16} /> Gestión de Archivos (Fotos o PDFs)
                            </label>

                            {/* 1. MOSTRAR ARCHIVOS QUE YA EXISTEN EN LA DB */}
                            {existingMedia.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-[13px] font-medium text-[#1d1d1f] mb-3">Archivos ya publicados:</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {existingMedia.map((media) => {
                                            const fileUrl = media.file.startsWith('http') ? media.file : `${BACKEND_URL}${media.file}`;

                                            // Lógica de limpieza de URL para no fallar con parámetros extras
                                            const cleanUrl = fileUrl.split('?')[0];
                                            const fileExtension = cleanUrl.split('.').pop()?.toLowerCase();
                                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(fileExtension || '');

                                            return (
                                                <div key={media.id} className="relative group border border-[#d2d2d7] rounded-xl overflow-hidden bg-[#f5f5f7] aspect-square flex items-center justify-center">
                                                    {isImage ? (
                                                        <img src={fileUrl} alt="Adjunto" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-center p-2 text-[#86868b]">
                                                            <FileText size={32} className="mx-auto mb-1" />
                                                            <span className="text-[10px] uppercase font-semibold">Documento</span>
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setMediaToDelete(media)}
                                                        className="absolute top-2 right-2 bg-white text-[#ff3b30] p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                                        title="Eliminar archivo"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 2. SUBIR ARCHIVOS NUEVOS CON PREVIEW */}
                            <div>
                                <h4 className="text-[13px] font-medium text-[#1d1d1f] mb-3">Agregar nuevos archivos:</h4>
                                <div className="bg-[#f5f5f7] border border-[#d2d2d7] border-dashed rounded-xl p-6 text-center">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="w-full text-sm text-[#515154] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[13px] file:font-semibold file:bg-white file:text-[#1d1d1f] hover:file:bg-gray-100 file:shadow-sm transition-all file:cursor-pointer"
                                    />
                                </div>

                                {/* Grid de Previews de los archivos que estás por subir */}
                                {filePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                        {filePreviews.map((preview, idx) => (
                                            <div key={idx} className="relative border border-[#0071e3]/30 rounded-xl overflow-hidden bg-[#0071e3]/5 aspect-square flex items-center justify-center">
                                                <span className="absolute top-1 left-2 text-[10px] font-bold text-[#0071e3] bg-white px-1.5 rounded-sm z-10 shadow-sm">NUEVO</span>
                                                {preview.isImage ? (
                                                    <img src={preview.url} alt="Preview" className="w-full h-full object-cover opacity-80" />
                                                ) : (
                                                    <div className="text-center p-2 text-[#0071e3]">
                                                        <FileText size={32} className="mx-auto mb-1" />
                                                        <span className="text-[10px] uppercase font-semibold">
                                                            {preview.file.name.split('.').pop()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BOTONERA GUARDAR */}
                        <div className="pt-8 border-t border-[#d2d2d7] flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={handleCloseForm}
                                className="px-6 py-3 text-[15px] font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] rounded-full transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#1d1d1f] hover:bg-black disabled:bg-gray-400 text-white px-8 py-3 rounded-full text-[15px] font-medium transition-all shadow-md flex items-center gap-2"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Guardar Publicación'}
                            </button>
                        </div>

                    </form>
                </div>
            )}

            {/* =========================================================
          MODAL: ELIMINAR EVENTO COMPLETO
          ========================================================= */}
            {eventToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEventToDelete(null)} />

                    <div className="relative bg-white border border-[#d2d2d7] rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center transform animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-[#ff3b30]/10 text-[#ff3b30] rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>

                        <h3 className="text-2xl font-semibold mb-2 text-[#1d1d1f]">¿Eliminar registro?</h3>
                        <p className="text-[15px] text-[#515154] mb-8 leading-relaxed">
                            Estás por borrar <strong>"{eventToDelete.title}"</strong>. Esta acción no se puede deshacer y borrará todos los archivos adjuntos.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDeleteEvent}
                                className="w-full bg-[#ff3b30] hover:bg-[#eb362c] text-white py-3.5 rounded-full text-[15px] font-medium transition-colors shadow-sm"
                            >
                                Sí, eliminar
                            </button>
                            <button
                                onClick={() => setEventToDelete(null)}
                                className="w-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] py-3.5 rounded-full text-[15px] font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
          MODAL: ELIMINAR UN ARCHIVO INDIVIDUAL
          ========================================================= */}
            {mediaToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMediaToDelete(null)} />

                    <div className="relative bg-white border border-[#d2d2d7] rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center transform animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-[#ff3b30]/10 text-[#ff3b30] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>

                        <h3 className="text-xl font-semibold mb-2 text-[#1d1d1f]">¿Borrar este archivo?</h3>
                        <p className="text-[15px] text-[#515154] mb-8 leading-relaxed">
                            El archivo se eliminará de forma permanente de tu servidor. Esta acción no afecta el texto de la publicación.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDeleteMedia}
                                className="w-full bg-[#ff3b30] hover:bg-[#eb362c] text-white py-3.5 rounded-full text-[15px] font-medium transition-colors shadow-sm"
                            >
                                Sí, borrar archivo
                            </button>
                            <button
                                onClick={() => setMediaToDelete(null)}
                                className="w-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] py-3.5 rounded-full text-[15px] font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
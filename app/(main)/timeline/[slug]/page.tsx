"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTimelineEventBySlug } from '@/lib/api';
import { ArrowLeft, ArrowDownToLine, FileText, Image as ImageIcon } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export default function TimelineDetailView() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTimelineEventBySlug(slug)
            .then((data) => {
                setEvent(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [slug]);

    if (loading) return <div className="min-h-screen bg-[#f4f4f0] p-12 font-mono uppercase font-black text-2xl">Buscando archivo...</div>;
    if (!event) return <div className="min-h-screen bg-[#f4f4f0] p-12 font-mono uppercase font-black text-2xl text-red-600">Error: Archivo no encontrado.</div>;

    const dateObj = new Date(event.event_date);
    const fullDate = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div className="relative w-full min-h-screen bg-[#f4f4f0] text-black selection:bg-yellow-300 font-sans pb-32">

            {/* Grilla de fondo sutil */}
            <div className="fixed inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Contenedor principal usando todo el ancho con márgenes */}
            <div className="w-full px-4 md:px-12 lg:px-24 relative z-10 pt-10 md:pt-16 mx-auto max-w-[1600px]">

                {/* Botón Volver Crudo */}
                <button
                    onClick={() => router.push('/timeline')}
                    className="inline-flex items-center gap-2 font-mono text-sm font-black uppercase hover:text-blue-600 transition-colors mb-12 md:mb-20"
                >
                    <ArrowLeft size={18} strokeWidth={3} /> Volver a los registros
                </button>

                {/* CABECERA PERIODÍSTICA */}
                <header className="mb-16 md:mb-24">
                    <div className="border-y-4 border-black py-3 mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono uppercase font-black tracking-widest text-sm md:text-base">
                        <span>REPORTE DEL SISTEMA</span>
                        <span className="bg-black text-white px-3 py-1">FECHA: {fullDate}</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl lg:text-[8rem] font-black uppercase tracking-tighter leading-[0.85] break-words hyphens-auto">
                        {event.title}
                    </h1>
                </header>

                {/* CONTENIDO: Subtítulo y Texto Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

                    {/* Columna Izquierda: Subtítulo (Brief) */}
                    <div className="lg:col-span-5">
                        <p className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight uppercase tracking-tight">
                            {event.brief_description}
                        </p>
                    </div>

                    {/* Columna Derecha: El contenido crudo sin cajas */}
                    <div className="lg:col-span-7">
                        {/* Texto principal con salto de línea respetado */}
                        <div className="font-medium text-lg md:text-2xl leading-relaxed md:leading-[1.8] whitespace-pre-wrap text-gray-900">
                            {event.content}
                        </div>
                    </div>
                </div>

                {/* SECCIÓN DE EVIDENCIA (ARCHIVOS / IMÁGENES / PDF) */}
                {event.media && event.media.length > 0 && (
                    <div className="mt-24 md:mt-40 border-t-8 border-black pt-12">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12">
                            Evidencia Adjunta
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                            {event.media.map((item: any, idx: number) => {
                                const fileUrl = item.file.startsWith('http') ? item.file : `${BACKEND_URL}${item.file}`;

                                // Limpiamos la URL de parámetros raros (?v=123) para no romper la detección
                                const cleanUrl = fileUrl.split('?')[0];
                                const fileExtension = cleanUrl.split('.').pop()?.toLowerCase();

                                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'].includes(fileExtension || '');
                                const isPdf = fileExtension === 'pdf';

                                return (
                                    <div key={item.id} className="flex flex-col group">
                                        {isImage ? (
                                            // IMAGEN: Se muestra y al tocarla se abre a pantalla completa
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full border-4 border-black overflow-hidden bg-gray-200 cursor-pointer block relative"
                                                title="Ver imagen en tamaño completo"
                                            >
                                                <div className="absolute top-2 right-2 bg-black text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                    <ImageIcon size={20} />
                                                </div>
                                                <img
                                                    src={fileUrl}
                                                    alt={item.caption || `Evidencia ${idx + 1}`}
                                                    className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-[1.02]"
                                                />
                                            </a>
                                        ) : (
                                            // PDF u OTRO: Cuadro de descarga brutalista
                                            <div className="w-full border-4 border-black bg-white p-8 md:p-12 hover:bg-yellow-300 transition-colors flex flex-col items-center justify-center text-center gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                                <FileText size={64} strokeWidth={1.5} />
                                                <h3 className="text-xl font-black uppercase">
                                                    {isPdf ? "Documento PDF" : "Archivo Adjunto"}
                                                </h3>
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 bg-black text-white font-mono uppercase text-sm font-bold px-6 py-3 hover:-translate-y-1 transition-transform"
                                                >
                                                    <ArrowDownToLine size={18} /> {isPdf ? "Leer PDF" : "Abrir Archivo"}
                                                </a>
                                            </div>
                                        )}

                                        {/* Epígrafe de la foto/archivo */}
                                        {item.caption && (
                                            <p className="mt-4 font-mono text-sm font-bold uppercase text-gray-600 border-l-4 border-black pl-3">
                                                {item.caption}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
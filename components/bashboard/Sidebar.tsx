"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    LayoutDashboard, FolderKanban, Beaker,
    LogOut, Globe, ChevronLeft, ChevronRight,
    UserCircle, Menu, X, Clock,
    Target
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Para Móvil
    const [isCollapsed, setIsCollapsed] = useState(false);     // Para PC

    // Cerramos el menú en móvil cuando cambia la ruta
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <>
            {/* --- HEADER MÓVIL (Súper limpio, solo el botón) --- */}
            <div className="md:hidden flex items-center justify-end p-4 bg-white border-b border-[#d2d2d7] z-30 shrink-0">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-[#86868b] hover:text-[#1d1d1f] bg-[#f5f5f7] rounded-xl transition-colors"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* --- OVERLAY MÓVIL --- */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- SIDEBAR IZQUIERDO --- */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 bg-white border-r border-[#d2d2d7] flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out
                    md:relative md:translate-x-0
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${isCollapsed ? 'md:w-20' : 'md:w-[260px]'}
                    w-[260px]
                `}
            >
                {/* Botón Cerrar en Móvil */}
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="md:hidden absolute top-5 right-4 p-2 text-[#86868b] hover:text-[#1d1d1f] bg-[#f5f5f7] rounded-xl transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Botón Colapsar en PC */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3.5 top-8 bg-white border border-[#d2d2d7] rounded-full p-1.5 shadow-sm text-[#86868b] hover:text-[#1d1d1f] hover:shadow-md transition-all z-50"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* --- NAVEGACIÓN --- */}
                {/* Usamos justify-center para que se distribuya bien sin necesidad de scroll */}
                <nav className="flex-1 px-4 py-8 flex flex-col gap-8 mt-4">

                    <div>
                        {!isCollapsed && (
                            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[#86868b] mb-3 transition-opacity duration-300">
                                Core
                            </p>
                        )}
                        <div className="space-y-1">
                            <AdminNavTab href="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" active={pathname === '/dashboard'} isCollapsed={isCollapsed} />
                            <AdminNavTab href="/dashboard/profile" icon={<UserCircle size={18} />} label="Identity" active={pathname === '/dashboard/profile'} isCollapsed={isCollapsed} />
                            <AdminNavTab href="/" icon={<Globe size={18} />} label="Live Site" active={false} external isCollapsed={isCollapsed} />
                        </div>
                    </div>

                    <div>
                        {!isCollapsed && (
                            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[#86868b] mb-3 transition-opacity duration-300">
                                Contenido
                            </p>
                        )}
                        <div className="space-y-1">
                            <AdminNavTab href="/dashboard/projects" icon={<FolderKanban size={18} />} label="Proyectos" active={pathname === '/dashboard/projects'} isCollapsed={isCollapsed} />
                            <AdminNavTab href="/dashboard/lab" icon={<Beaker size={18} />} label="Laboratorio" active={pathname === '/dashboard/lab'} isCollapsed={isCollapsed} />
                            <AdminNavTab href="/dashboard/timeline" icon={<Clock size={18} />} label="Línea de Tiempo" active={pathname === '/dashboard/timeline'} isCollapsed={isCollapsed} />
                        </div>
                    </div>
                    <div>
                        {!isCollapsed && (
                            <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-[#86868b] mb-3 transition-opacity duration-300">
                                Gestión Interna
                            </p>
                        )}
                        <div className="space-y-1">
                            <AdminNavTab
                                href="/dashboard/planner"
                                icon={<Target size={18} />}
                                label="Planner"
                                active={pathname.includes('/dashboard/planner')}
                                isCollapsed={isCollapsed}
                            />
                            <AdminNavTab
                                href="/study"
                                icon={<Target size={18} />}
                                label="Chat"
                            />
                            <AdminNavTab
                                href="/bazar"
                                icon={<Target size={18} />}
                                label="bazar"
                            />
                        </div>
                    </div>

                </nav>

                {/* --- FOOTER (LOGOUT) --- */}
                <div className="p-4 border-t border-[#d2d2d7] bg-[#f5f5f7]/50">
                    <button
                        onClick={handleLogout}
                        title="Cerrar sesión"
                        className={`
                            flex items-center w-full px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#515154] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-all group
                            ${isCollapsed ? 'justify-center' : 'justify-between'}
                        `}
                    >
                        <span className="flex items-center gap-3">
                            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                            {!isCollapsed && <span>Salir</span>}
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}

// Subcomponente encapsulado y adaptado al nuevo diseño claro y colapsable
function AdminNavTab({ href, icon, label, active, external = false, isCollapsed }: any) {
    return (
        <Link
            href={href}
            target={external ? "_blank" : "_self"}
            title={isCollapsed ? label : ""}
            className={`
                flex items-center gap-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-300 group
                ${isCollapsed ? 'justify-center px-0' : 'px-3'}
                ${active
                    ? 'bg-[#0071e3]/10 text-[#0071e3]'
                    : 'text-[#515154] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]'
                }
            `}
        >
            <span className={`shrink-0 ${active ? 'text-[#0071e3]' : 'text-[#86868b] group-hover:text-[#1d1d1f]'}`}>
                {icon}
            </span>

            {!isCollapsed && (
                <span className="flex-1 tracking-tight truncate transition-opacity duration-300">
                    {label}
                </span>
            )}
        </Link>
    );
}
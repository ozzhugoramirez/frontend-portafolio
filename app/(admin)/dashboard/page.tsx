"use client";

import React, { useEffect, useState } from 'react';
import { getDashboardStats, getAdminMessages, markMessageAsRead, clearTelemetry } from '@/lib/api';
import { 
  Eye, MousePointerClick, Download, BarChart2, Globe, Mail, 
  Inbox, Calendar, CheckCircle2, MoreHorizontal, ArrowUpRight, 
  Filter, Trash2, DownloadCloud, Clock, Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'inbox'>('telemetry');
  const [stats, setStats] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([getDashboardStats(), getAdminMessages()])
      .then(([statsData, messagesData]) => {
        setStats(statsData);
        setMessages(messagesData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error sincronizando el panel:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markMessageAsRead(id);
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, is_read: true } : msg));
    } catch (error) {
      console.error("Error al marcar como leído:", error);
    }
  };

 
  const handleClearTelemetry = async () => {
    const confirmDelete = window.confirm(
      "¿Estás completamente seguro de querer borrar todo el historial de visitas e interacciones? Esta acción NO se puede deshacer."
    );
    
    if (confirmDelete) {
      setIsMenuOpen(false); // Cerramos el menú
      try {
        await clearTelemetry();
        alert("El historial de telemetría ha sido borrado exitosamente.");
        fetchDashboardData(); 
      } catch (error) {
        alert("Hubo un error al intentar borrar los datos.");
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#000000]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Sincronizando métricas...</p>
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter(msg => !msg.is_read).length;
 
  const interaccionesTotales = (stats?.social_clicks?.reduce((acc: any, curr: any) => acc + curr.total, 0) || 0) + (stats?.project_views?.reduce((acc: any, curr: any) => acc + curr.total, 0) || 0);

  return (
    <div className="h-full flex flex-col bg-[#000000] text-gray-200 selection:bg-blue-500/30">
      
      {/* HEADER PRINCIPAL Y TABS */}
      <header className="px-6 py-8 md:px-10 border-b border-white/5 bg-[#000000]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight mb-1">Visión General</h1>
            <p className="text-sm text-gray-500">Métricas de rendimiento y comunicaciones.</p>
          </div>
          
          <div className="flex items-center bg-[#1c1c1e] p-1 rounded-xl self-start md:self-auto border border-white/5">
            <button 
              onClick={() => setActiveTab('telemetry')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'telemetry' ? 'bg-[#2c2c2e] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <BarChart2 size={16} /> Rendimiento
            </button>
            <button 
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'inbox' ? 'bg-[#2c2c2e] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <Inbox size={16} /> Mensajes 
              {unreadCount > 0 && <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1 font-bold">{unreadCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
        
       
        {activeTab === 'telemetry' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
            
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <StatCard 
                title="Visitas al Portafolio" 
                value={stats?.overview?.total_views || 0} 
                icon={<Eye size={20} />} 
                color="text-blue-500" 
                trend="Semana Actual" 
                trendLabel={`Desde el ${stats?.overview?.current_week_start || 'Lunes'}`} 
              />
              <StatCard 
                title="Interacciones Totales" 
                value={interaccionesTotales} 
                icon={<MousePointerClick size={20} />} 
                color="text-indigo-500" 
                trend="Semana Actual" 
                trendLabel="Vistas + Clicks" 
              />
              <StatCard 
                title="Descargas de CV" 
                value={stats?.overview?.cv_downloads || 0} 
                icon={<Download size={20} />} 
                color="text-emerald-500" 
                trend="Semana Actual" 
                trendLabel={`Desde el ${stats?.overview?.current_week_start || 'Lunes'}`} 
              />
            </div>

            {/* DETALLE DE MÉTRICAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              
              {/* Widget 1: Proyectos */}
              <div className="bg-[#1c1c1e] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-lg font-medium text-white tracking-tight">Tráfico por Proyecto</h2>
                    <p className="text-xs text-gray-500 mt-1">Vistas detalladas de tu trabajo (Esta semana).</p>
                  </div>
                  
                  
                  <div className="relative">
                    <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    
                    {/* Dropdown Menú */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[#2c2c2e] border border-white/10 rounded-xl shadow-xl z-20 p-1 animate-in zoom-in-95 duration-100">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                          <DownloadCloud size={14}/> Exportar CSV
                        </button>
                        <div className="h-px bg-white/10 my-1"></div>
                        <button 
                          onClick={handleClearTelemetry}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
                        >
                          <Trash2 size={14}/> Borrar Historial Total
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-5 flex-1">
                  {stats?.project_views?.length > 0 ? (
                    stats.project_views.map((item: any, idx: number) => (
                      <ProgressBar key={idx} label={item.target} count={item.total} max={stats.project_views[0].total} colorClass="bg-blue-500" />
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-sm text-gray-500 bg-[#0a0a0b] rounded-2xl border border-dashed border-white/10 p-8">Sin interacciones esta semana.</div>
                  )}
                </div>
              </div>

              {/* Widget 2: Redes */}
              <div className="bg-[#1c1c1e] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-lg font-medium text-white tracking-tight">Impacto en Redes</h2>
                    <p className="text-xs text-gray-500 mt-1">Clicks en perfiles y links de contacto.</p>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors border border-white/5">
                    <Filter size={14} /> Semana Actual
                  </button>
                </div>

                <div className="space-y-5 flex-1">
                  {stats?.social_clicks?.length > 0 ? (
                    stats.social_clicks.map((item: any, idx: number) => (
                      <ProgressBar key={idx} label={item.target} count={item.total} max={stats.social_clicks[0].total} colorClass="bg-indigo-500" />
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-sm text-gray-500 bg-[#0a0a0b] rounded-2xl border border-dashed border-white/10 p-8">Sin clicks registrados esta semana.</div>
                  )}
                </div>
              </div>

             
              <div className="bg-[#1c1c1e] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col lg:col-span-2">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-lg font-medium text-white tracking-tight flex items-center gap-2">
                      <Activity size={18} className="text-emerald-500" /> 
                      Historial de Tráfico a Largo Plazo
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Vistas totales al portafolio agrupadas por semana.</p>
                  </div>
                </div>

                <div className="flex-1">
                  {stats?.weekly_history?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 items-end h-48 pt-4">
                      {stats.weekly_history.map((week: any, idx: number) => {
                        
                        const maxViews = Math.max(...stats.weekly_history.map((w:any) => w.total));
                        const heightPercentage = Math.max(10, (week.total / maxViews) * 100);
                        
                        return (
                          <div key={idx} className="flex flex-col items-center gap-3 group">
                            {/* Número flotante */}
                            <span className="text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded-md border border-white/10">
                              {week.total}
                            </span>
                            {/* Barra */}
                            <div className="w-full h-full flex items-end justify-center">
                              <div 
                                className="w-8 md:w-10 bg-emerald-500/20 border border-emerald-500/30 rounded-t-md group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all duration-300" 
                                style={{ height: `${heightPercentage}%` }}
                              ></div>
                            </div>
                            {/* Etiqueta de fecha */}
                            <span className="text-[10px] text-gray-500 font-mono text-center">
                              {new Date(week.semana).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-sm text-gray-500 bg-[#0a0a0b] rounded-2xl border border-dashed border-white/10 p-12">
                      El historial se empezará a construir con las primeras visitas.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        
        {activeTab === 'inbox' && (
          <div className="space-y-4 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
            {messages.length === 0 ? (
              <div className="text-center py-24 bg-[#1c1c1e] border border-white/5 rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">Bandeja Vacía</h3>
                <p className="text-sm text-gray-500">No hay mensajes nuevos por el momento.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-[#1c1c1e] border border-white/5 hover:border-white/10 transition-colors rounded-2xl p-5 md:p-6 flex flex-col gap-4">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-base font-medium text-white flex items-center gap-2 mb-1">
                        {!msg.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>}
                        {msg.subject} 
                      </h3>
                      <div className="text-sm text-gray-500 flex flex-wrap items-center gap-x-2">
                        <span className="font-medium text-gray-300">{msg.name}</span> 
                        <span className="text-xs text-gray-600">&bull;</span>
                        <a href={`mailto:${msg.email}`} className="text-blue-400 hover:underline">{msg.email}</a>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 bg-[#2c2c2e] px-3 py-1.5 rounded-lg w-fit">
                      <Calendar size={14} />
                      {new Date(msg.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="text-[15px] text-gray-300 leading-relaxed whitespace-pre-wrap py-2">
                    {msg.message}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
                    {!msg.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(msg.id)}
                        className="text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Marcar como leído
                      </button>
                    )}
                    <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="text-sm font-medium bg-white text-black px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
                      Responder
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  );
}


function StatCard({ title, value, icon, color, trend, trendLabel }: any) {
  return (
    <div className="bg-[#1c1c1e] border border-white/5 rounded-3xl p-6 relative group hover:bg-[#222224] transition-colors">
      
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${color} shadow-inner`}>
          {icon}
        </div>
      </div>
      
      <div>
        <h3 className="text-3xl font-semibold text-white tracking-tight mb-1">{value}</h3>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <span className="flex items-center text-xs font-semibold text-gray-300 bg-white/5 px-2 py-1 rounded-md border border-white/5">
           {trend}
        </span>
        <span className="text-xs text-gray-600 font-medium">{trendLabel}</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, count, max, colorClass }: any) {
  const percentage = Math.max(2, (count / max) * 100); 
  return (
    <div className="group">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-300 font-medium capitalize truncate pr-4">{label}</span>
        <span className="text-white font-semibold">{count}</span>
      </div>
      <div className="h-2 w-full bg-[#0a0a0b] rounded-full overflow-hidden border border-white/5 relative">
        <div 
          className={`absolute top-0 left-0 h-full ${colorClass} rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
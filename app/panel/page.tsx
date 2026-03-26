"use client";

import React, { useEffect, useState } from 'react';
import { getDashboardStats, getAdminMessages, markMessageAsRead } from '@/lib/api';
import { Activity, Eye, MousePointerClick, Download, BarChart2, Globe, TrendingUp, Mail, Inbox, Calendar, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'inbox'>('telemetry');
  const [stats, setStats] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
    
      await markMessageAsRead(id);
      
  
      setMessages(prev => 
        prev.map(msg => msg.id === id ? { ...msg, is_read: true } : msg)
      );
    } catch (error) {
      console.error("Error al marcar como leído:", error);
    }
  };

  if (loading) {
    return <div className="p-12 font-mono text-xs text-gray-500 uppercase tracking-widest animate-pulse">Sincronizando sistemas...</div>;
  }

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#050506]">
      
      {/* HEADER PRINCIPAL Y TABS */}
      <header className="p-8 border-b border-white/5 bg-[#080809]">
        <h1 className="text-white text-2xl font-mono tracking-tighter uppercase italic flex items-center gap-3 mb-6">
          <Activity size={24} className="text-emerald-500" /> Command_Center
        </h1>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${activeTab === 'telemetry' ? 'bg-white text-black font-bold' : 'bg-[#121214] border border-gray-800 text-gray-400 hover:text-white'}`}
          >
            <BarChart2 size={14} /> Telemetría
          </button>
          <button 
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${activeTab === 'inbox' ? 'bg-indigo-500 text-white font-bold' : 'bg-[#121214] border border-gray-800 text-gray-400 hover:text-white'}`}
          >
            <Inbox size={14} /> Bandeja_Entrada 
            {unreadCount > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full ml-1">{unreadCount}</span>}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        
        {/* ==================================
            PESTAÑA 1: TELEMETRÍA
            ================================== */}
        {activeTab === 'telemetry' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* TARJETAS DE VISIÓN GENERAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Visitas al Home" value={stats?.overview?.total_views || 0} icon={<Eye size={20} />} color="text-indigo-400" bg="bg-indigo-500/10" borderColor="border-indigo-500/20" />
              <StatCard title="Descargas de CV" value={stats?.overview?.cv_downloads || 0} icon={<Download size={20} />} color="text-emerald-400" bg="bg-emerald-500/10" borderColor="border-emerald-500/20" />
              <StatCard title="Interacciones Totales" value={(stats?.social_clicks?.reduce((acc: any, curr: any) => acc + curr.total, 0) || 0) + (stats?.project_views?.reduce((acc: any, curr: any) => acc + curr.total, 0) || 0)} icon={<MousePointerClick size={20} />} color="text-cyan-400" bg="bg-cyan-500/10" borderColor="border-cyan-500/20" />
            </div>

            {/* DETALLE DE MÉTRICAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#0c0c0d] border border-white/5 rounded-3xl p-6 shadow-2xl shadow-black">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-mono text-white flex items-center gap-2"><BarChart2 size={16} className="text-gray-500" /> Vistas por Proyecto</h2>
                </div>
                <div className="space-y-4">
                  {stats?.project_views?.length > 0 ? stats.project_views.map((item: any, idx: number) => <ProgressBar key={idx} label={item.target} count={item.total} max={stats.project_views[0].total} colorClass="bg-indigo-500" />) : <div className="text-[10px] text-gray-600 font-mono italic">Sin datos.</div>}
                </div>
              </div>
              <div className="bg-[#0c0c0d] border border-white/5 rounded-3xl p-6 shadow-2xl shadow-black">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-mono text-white flex items-center gap-2"><Globe size={16} className="text-gray-500" /> Clicks en Redes & Contacto</h2>
                </div>
                <div className="space-y-4">
                  {stats?.social_clicks?.length > 0 ? stats.social_clicks.map((item: any, idx: number) => <ProgressBar key={idx} label={item.target} count={item.total} max={stats.social_clicks[0].total} colorClass="bg-emerald-500" />) : <div className="text-[10px] text-gray-600 font-mono italic">Sin datos.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================
            PESTAÑA 2: BANDEJA DE ENTRADA
            ================================== */}
        {activeTab === 'inbox' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-gray-800 rounded-3xl">
                <Mail size={32} className="text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">Bandeja Vacía</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-[#0c0c0d] border border-gray-800 hover:border-indigo-500/50 transition-colors rounded-2xl p-6 flex flex-col gap-4">
                  
                  {/* Cabecera del Mensaje */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/50 pb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        {msg.subject} 
                        {!msg.is_read && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>}
                      </h3>
                      <div className="text-xs font-mono text-gray-500 mt-1 flex items-center gap-3">
                        <span className="text-indigo-400">{msg.name}</span> 
                        <span>({msg.email})</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-gray-600 flex items-center gap-2 bg-[#121214] px-3 py-1.5 rounded-lg border border-gray-800">
                      <Calendar size={12} />
                      {new Date(msg.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Cuerpo del Mensaje */}
                  <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.message}
                  </div>

                  {/* 👉 NUEVO: Acciones (Marcar Visto + Responder) */}
                  <div className="mt-2 flex items-center justify-end gap-3">
                    
                    {!msg.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(msg.id)}
                        className="text-xs font-mono uppercase tracking-widest text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 size={14} /> Marcar Visto
                      </button>
                    )}

                    <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="text-xs font-mono uppercase tracking-widest bg-white text-black px-5 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                      Responder Email
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

// --- SUBCOMPONENTES DE TELEMETRÍA ---
function StatCard({ title, value, icon, color, bg, borderColor }: any) {
  return (
    <div className={`p-6 rounded-3xl border ${borderColor} bg-[#0c0c0d] relative overflow-hidden group`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${bg}`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-2xl ${bg} ${color}`}>{icon}</div>
        <TrendingUp size={16} className="text-gray-600" />
      </div>
      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1 relative z-10">{title}</p>
      <h3 className="text-4xl font-mono text-white relative z-10">{value}</h3>
    </div>
  );
}

function ProgressBar({ label, count, max, colorClass }: any) {
  const percentage = Math.max(5, (count / max) * 100); 
  return (
    <div>
      <div className="flex justify-between text-[11px] font-mono mb-2">
        <span className="text-gray-400 capitalize">{label}</span>
        <span className="text-white font-bold">{count}</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
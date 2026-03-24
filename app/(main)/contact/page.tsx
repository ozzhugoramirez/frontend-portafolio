"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mail, MapPin, Send, ShieldCheck, Terminal, Github, Linkedin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { sendContactMessage } from '@/lib/api';

// --- ANIMACIÓN AL SCROLLEAR ---
function FadeInSection({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = domRef.current;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          if (currentRef) observer.unobserve(currentRef);
        }
      });
    }, { threshold: 0.1 });

    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, [delay]);

  return (
    <div ref={domRef} className={`transition-all duration-[1200ms] ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      {children}
    </div>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  // 👉 NUEVO: Agregamos el estado 'error'
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending'); 
    
    try {
      await sendContactMessage(formData);
      
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // A los 4.5 segundos vuelve al formulario limpio
      setTimeout(() => setStatus('idle'), 4500);
      
    } catch (error) {
      console.error("Error transmitiendo el mensaje:", error);
      setStatus('error');
      
      // Ocultamos el error a los 5 segundos para que pueda reintentar
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Si estaba en error y el usuario empieza a escribir, borramos el error
    if (status === 'error') setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-400 font-sans selection:bg-indigo-500/30 selection:text-white pb-32 overflow-x-hidden pt-32">
      
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
        
        {/* --- HEADER DE LA PÁGINA --- */}
        <FadeInSection>
          <div className="mb-16 md:mb-24">
            <div className="flex items-center gap-3 mb-4">
              <Terminal size={20} className="text-indigo-500" />
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">Secure_Channel</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-mono text-white tracking-tighter mb-6">
              /contact
            </h1>
            <p className="max-w-xl text-sm md:text-base leading-relaxed text-gray-500">
              ¿Tenés un proyecto en mente, una propuesta laboral o simplemente querés hablar de código y ciberseguridad? Iniciemos la comunicación.
            </p>
          </div>
        </FadeInSection>

        {/* --- GRID PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-24">
          
          {/* COLUMNA IZQUIERDA: INFORMACIÓN DIRECTA */}
          <div className="lg:col-span-2 space-y-12">
            <FadeInSection delay={100}>
              <div className="space-y-8">
                
                <div className="group">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-2">Base de Operaciones</h4>
                  <div className="flex items-start gap-4 text-gray-300">
                    <div className="p-3 bg-[#121214] border border-gray-800 rounded-xl group-hover:border-gray-600 transition-colors">
                      <MapPin size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Buenos Aires, Argentina</p>
                      <p className="text-xs text-gray-500 mt-1">Disponibilidad remota global (GMT-3)</p>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-2">Transmisión Directa</h4>
                  <a href="mailto:tuemail@ejemplo.com" className="flex items-start gap-4 text-gray-300 hover:text-white transition-colors">
                    <div className="p-3 bg-[#121214] border border-gray-800 rounded-xl group-hover:border-indigo-500/50 transition-colors">
                      <Mail size={20} className="text-gray-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-white break-all">mycorreohugo@gmail.com</p>
                      <p className="text-xs text-gray-500 mt-1">Tiempo de respuesta: ~24hs</p>
                    </div>
                  </a>
                </div>

              </div>

              <div className="mt-12 pt-12 border-t border-gray-800/50">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-600 mb-4">Redes de Conexión</h4>
                <div className="flex gap-4">
                  <SocialCircle icon={<Github size={18} />} link="https://github.com/ozzhugoramirez" />
                  <SocialCircle icon={<Linkedin size={18} />} link="https://www.linkedin.com/in/hug-ramirez/" />
                </div>
              </div>

              <div className="mt-12 bg-[#121214] border border-emerald-900/30 rounded-2xl p-4 flex items-center gap-4">
                 <ShieldCheck size={24} className="text-emerald-500" />
                 <div>
                   <p className="text-xs text-white font-mono">Comunicación Encriptada</p>
                   <p className="text-[10px] text-gray-500 font-mono mt-1">SSL/TLS Active Protocol</p>
                 </div>
              </div>
            </FadeInSection>
          </div>

          {/* COLUMNA DERECHA: FORMULARIO */}
          <div className="lg:col-span-3">
            <FadeInSection delay={200}>
              <div className="bg-[#121214] border border-gray-800 rounded-[2rem] p-6 md:p-10 relative overflow-hidden min-h-[500px] flex flex-col justify-center">
                
                {/* Efecto de luz de fondo */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* 👉 NUEVO: PANTALLA DE ÉXITO (Reemplaza el formulario al enviar) */}
                {status === 'success' ? (
                  <div className="relative z-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 fade-in duration-500">
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-medium text-white mb-2">¡Payload Entregado!</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Tu mensaje fue encriptado y transmitido con éxito a mi servidor. Te voy a responder a la brevedad.
                    </p>
                    <div className="mt-8 text-[10px] font-mono text-gray-600 uppercase tracking-widest animate-pulse">
                      Restableciendo canal...
                    </div>
                  </div>
                ) : (
                  
                  /* FORMULARIO NORMAL */
                  <form onSubmit={handleSubmit} className="relative z-10 animate-in fade-in duration-500">
                    <h3 className="text-xl font-medium text-white mb-8">Enviar un mensaje</h3>

                    {/* 👉 NUEVO: BANNER DE ERROR ESTILIZADO */}
                    {status === 'error' && (
                      <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 fade-in">
                        <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-500">Falla de Transmisión</p>
                          <p className="text-xs text-red-400/80 mt-1">El servidor no responde. Por favor, intentá de nuevo o usá el correo directo.</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* Fila: Nombre y Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Nombre / Entidad</label>
                          <input 
                            required
                            type="text" 
                            id="name" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={status === 'sending'}
                            className="w-full bg-[#09090b] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-700 disabled:opacity-50"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Email de retorno</label>
                          <input 
                            required
                            type="email" 
                            id="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={status === 'sending'}
                            className="w-full bg-[#09090b] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-700 disabled:opacity-50"
                            placeholder="john@empresa.com"
                          />
                        </div>
                      </div>

                      {/* Asunto */}
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Asunto</label>
                        <input 
                          required
                          type="text" 
                          id="subject" 
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          disabled={status === 'sending'}
                          className="w-full bg-[#09090b] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-700 disabled:opacity-50"
                          placeholder="Propuesta de proyecto / Oferta laboral"
                        />
                      </div>

                      {/* Mensaje */}
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Mensaje (Payload)</label>
                        <textarea 
                          required
                          id="message" 
                          name="message"
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          disabled={status === 'sending'}
                          className="w-full bg-[#09090b] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-700 resize-none disabled:opacity-50"
                          placeholder="Escribí tu mensaje acá..."
                        ></textarea>
                      </div>

                      {/* Botón Submit */}
                      <button 
                        type="submit" 
                        disabled={status === 'sending'}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                          status === 'error'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20'
                            : 'bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {status === 'idle' && <><Send size={16} /> Transmitir Mensaje</>}
                        {status === 'sending' && <span className="animate-pulse">Encriptando y enviando...</span>}
                        {status === 'error' && <><AlertTriangle size={16} /> Reintentar Transmisión</>}
                      </button>

                    </div>
                  </form>
                )}
              </div>
            </FadeInSection>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTE DE REDES ---
function SocialCircle({ icon, link }: { icon: React.ReactNode, link: string }) {
  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-12 h-12 flex items-center justify-center bg-[#121214] border border-gray-800 rounded-full text-gray-400 hover:text-white hover:border-white transition-all hover:-translate-y-1"
    >
      {icon}
    </a>
  );
}
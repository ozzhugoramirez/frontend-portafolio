"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Mail, MapPin, Send, ShieldCheck, Terminal,
  Github, Linkedin, CheckCircle, AlertTriangle
} from 'lucide-react';
import { sendContactMessage } from '@/lib/api';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { div } from 'framer-motion/client';

// Animación de entrada al scrollear
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
    <div ref={domRef} className={`transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      {children}
    </div>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    if (!executeRecaptcha) {
      console.error("El sistema de seguridad reCAPTCHA no está listo");
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
      return;
    }

    try {
      const token = await executeRecaptcha('contact_form');

      const payload_completo = {
        ...formData,
        recaptchaToken: token
      };

      await sendContactMessage(payload_completo);

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => setStatus('idle'), 4500);

    } catch (error) {
      console.error("Error transmitiendo el mensaje:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === 'error') setStatus('idle');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f4f4f0] text-black selection:bg-pink-300 selection:text-black overflow-x-hidden font-sans pb-32 pt-24 md:pt-32 px-4 md:px-6">

      {/* Fondo Retro */}
      <div className="fixed inset-0 opacity-[0.15] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <main className="relative z-10 max-w-[1200px] mx-auto">

        {/* --- HEADER DE LA PÁGINA --- */}
        <FadeInSection>
          <div className="mb-12 md:mb-16 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="h-10 border-b-4 border-black bg-cyan-300 flex items-center justify-between px-3 md:px-4">
              <span className="font-mono text-xs md:text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Terminal size={16} /> secure_channel.exe
              </span>
              <div className="flex gap-1.5">
                <span className="w-3 h-3 border-2 border-black bg-white"></span>
                <span className="w-3 h-3 border-2 border-black bg-white"></span>
              </div>
            </div>
            <div className="p-6 md:p-10">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-4 leading-none">
                Get in <br className="hidden sm:block" />
                <span className="font-serif italic font-normal text-pink-500">Touch</span>
              </h1>
              <p className="text-base md:text-lg font-medium border-l-4 border-black pl-4 max-w-2xl text-gray-800 leading-relaxed">
                ¿Tenés un proyecto en mente, una propuesta laboral o simplemente querés hablar de código y sistemas?
                <span className="bg-yellow-300 px-1 border border-black ml-1 font-bold">Iniciemos la comunicación.</span>
              </p>
            </div>
          </div>
        </FadeInSection>

        {/* --- GRID PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* COLUMNA IZQUIERDA: INFORMACIÓN DIRECTA */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <FadeInSection delay={100}>

              {/* Info Cajas Brutalistas */}
              <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 md:p-6 mb-6 md:mb-8 group hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
                  <MapPin size={16} className="text-black" /> Base de Operaciones
                </h4>
                <div>
                  <p className="font-black text-lg md:text-xl uppercase">Buenos Aires, AR</p>
                  <p className="font-mono text-xs font-bold text-gray-600 mt-1">Disponibilidad Global (GMT-3)</p>
                </div>
              </div>

              <div className="border-4 border-black bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 md:p-6 mb-6 md:mb-8 group hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-black mb-4 flex items-center gap-2 border-b-4 border-black pb-2">
                  <Mail size={16} /> Transmisión Directa
                </h4>
                <a href="mailto:mycorreohugo@gmail.com" className="block outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
                  <p className="font-black text-sm sm:text-lg md:text-xl uppercase break-all">mycorreohugo@gmail.com</p>
                  <p className="font-mono text-xs font-bold text-gray-800 mt-1">Tiempo de respuesta: ~24hs</p>
                </a>
              </div>

              {/* Redes */}
              <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 md:p-6 mb-6 md:mb-8">
                <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 border-b-4 border-black pb-2">
                  Redes de Conexión
                </h4>
                <div className="flex gap-4">
                  <SocialBtn icon={<Github size={24} />} link="https://github.com/ozzhugoramirez" label="GitHub" />
                  <SocialBtn icon={<Linkedin size={24} />} link="https://www.linkedin.com/in/seba-villalba/" label="LinkedIn" />
                </div>
              </div>

              {/* Seguridad */}
              <div className="border-4 border-black bg-black text-green-400 p-4 md:p-5 flex items-center gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <ShieldCheck size={32} className="shrink-0" />
                <div>
                  <p className="text-xs md:text-sm font-black uppercase tracking-wider">Comunicación Encriptada</p>
                  <p className="font-mono text-[10px] text-green-600 uppercase mt-1">SSL/TLS Active Protocol</p>
                </div>
              </div>

            </FadeInSection>
          </div>

          {/* COLUMNA DERECHA: FORMULARIO */}
          <div className="lg:col-span-3">
            <FadeInSection delay={200}>
              <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col min-h-[500px]">

                <div className="bg-gray-200 border-b-4 border-black p-3 flex items-center justify-between z-10">
                  <span className="font-mono text-xs font-bold uppercase flex items-center gap-2">
                    <Terminal size={14} /> send_payload.sh
                  </span>
                </div>

                <div className="p-6 md:p-8 lg:p-10 flex-1 flex flex-col justify-center bg-[#f4f4f0] relative z-10">

                  {status === 'success' ? (
                    /* PANTALLA DE ÉXITO BRUTALISTA */
                    <div className="flex flex-col items-center justify-center text-center py-10 animate-in zoom-in-95 duration-300">
                      <div className="w-24 h-24 bg-green-300 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-8 rotate-3">
                        <CheckCircle size={48} className="text-black" strokeWidth={3} />
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black uppercase mb-4">Transmisión OK</h3>
                      <p className="text-sm md:text-base font-medium text-gray-800 max-w-sm mb-8 border-l-4 border-black pl-3 mx-auto">
                        Tu mensaje fue encriptado y transmitido con éxito. Te voy a responder a la brevedad.
                      </p>
                      <div className="bg-black text-white font-mono text-xs font-bold uppercase px-4 py-2 border-2 border-black animate-pulse">
                        Restableciendo canal...
                      </div>
                    </div>
                  ) : (

                    /* FORMULARIO */
                    <form onSubmit={handleSubmit} className="animate-in fade-in duration-300 flex flex-col gap-5">

                      {status === 'error' && (
                        <div className="p-4 bg-red-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-start gap-3 animate-in slide-in-from-top-2">
                          <AlertTriangle size={24} strokeWidth={3} className="shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm md:text-base font-black uppercase">Falla de Transmisión</p>
                            <p className="text-xs font-bold text-gray-900 mt-1">El servidor rechazó el payload. Intentá de nuevo.</p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                          <label htmlFor="name" className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-600">Nombre / Entidad</label>
                          <input
                            required
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={status === 'sending'}
                            className="w-full bg-white border-4 border-black px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-pink-500 focus:shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] transition-all placeholder:text-gray-400 placeholder:font-normal disabled:opacity-50"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label htmlFor="email" className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-600">Email de retorno</label>
                          <input
                            required
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={status === 'sending'}
                            className="w-full bg-white border-4 border-black px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-cyan-400 focus:shadow-[4px_4px_0px_0px_rgba(34,211,238,1)] transition-all placeholder:text-gray-400 placeholder:font-normal disabled:opacity-50"
                            placeholder="john@empresa.com"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="subject" className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-600">Asunto</label>
                        <input
                          required
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          disabled={status === 'sending'}
                          className="w-full bg-white border-4 border-black px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-yellow-400 focus:shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] transition-all placeholder:text-gray-400 placeholder:font-normal disabled:opacity-50"
                          placeholder="Propuesta de proyecto"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="message" className="font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-600">Mensaje (Payload)</label>
                        <textarea
                          required
                          id="message"
                          name="message"
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          disabled={status === 'sending'}
                          className="w-full bg-white border-4 border-black px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-black focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-400 placeholder:font-normal resize-none disabled:opacity-50"
                          placeholder="Escribí tu mensaje acá..."
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className={`w-full flex items-center justify-center gap-2 py-4 border-4 border-black font-black uppercase tracking-widest text-sm md:text-base transition-all duration-200 mt-2 ${status === 'error'
                          ? 'bg-red-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none'
                          : 'bg-black text-white hover:bg-cyan-300 hover:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                          }`}
                      >
                        {status === 'idle' && (
                          <span className="flex items-center gap-2">
                            <Send size={20} strokeWidth={3} /> Transmitir
                          </span>
                        )}
                        {status === 'sending' && (
                          <span className="flex items-center gap-2 animate-pulse">
                            <Terminal size={20} /> Ejecutando...
                          </span>
                        )}
                        {status === 'error' && (
                          <span className="flex items-center gap-2">
                            <AlertTriangle size={20} strokeWidth={3} /> Reintentar
                          </span>
                        )}
                      </button>

                    </form>
                  )}
                </div>
              </div>
            </FadeInSection>
          </div>

        </div>
      </main>
    </div>

  );
}

// --- SUBCOMPONENTE DE REDES BRUTALISTA ---
function SocialBtn({ icon, link, label }: { icon: React.ReactNode, link: string, label: string }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-14 h-14 flex items-center justify-center bg-white border-4 border-black text-black hover:bg-yellow-300 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-1 active:shadow-none"
    >
      {icon}
    </a>
  );
}
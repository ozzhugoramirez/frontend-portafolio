"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, KeyRound, ArrowRight, AlertCircle, Fingerprint } from 'lucide-react';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // --- ESCUDO FRONTEND: Limpieza de inputs en tiempo real ---
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permite letras, números y guiones bajos (bloquea comillas, etiquetas HTML, etc)
    const valorLimpio = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(valorLimpio.slice(0, 30)); // Límite de 30 caracteres
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Evitamos espacios en blanco y limitamos la longitud por seguridad
    const valorLimpio = e.target.value.replace(/\s/g, '');
    setPassword(valorLimpio.slice(0, 64)); 
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser({ username, password });
      router.push('/portal');
    } catch (err) {
      console.error("Login failed:", err);
      setError('Las credenciales ingresadas son incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] flex flex-col items-center justify-center font-sans selection:bg-blue-500/30 p-4 transition-colors duration-300">
      
      {/* Fondo sutil (Estilo macOS wallpaper blur) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none flex justify-center items-center">
        <div className="w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] opacity-50 mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-[400px] relative z-10">
        
        {/* Cabecera limpia */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white dark:bg-[#1d1d1f] shadow-sm border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Fingerprint strokeWidth={1.5} size={28} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ingresá tus credenciales para continuar
          </p>
        </div>

        {/* Tarjeta principal (Glassmorphism) */}
        <form 
          onSubmit={handleLogin} 
          className="bg-white/70 dark:bg-[#1d1d1f]/70 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
        >
          
          <div className="space-y-5 mb-8">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Usuario</label>
              <div className="relative group">
                <User size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-[15px] text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  placeholder="Tu nombre de usuario"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">Contraseña</label>
              <div className="relative group">
                <KeyRound size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-12 pr-4 text-[15px] text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {/* Mensaje de error sutil */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} strokeWidth={1.5} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400/90 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Botón de acción */}
          <button 
            type="submit" 
            disabled={loading || !username || !password}
            className="w-full flex items-center justify-center gap-2 bg-[#0071e3] hover:bg-[#0077ED] disabled:bg-gray-200 dark:disabled:bg-white/5 disabled:text-gray-400 dark:disabled:text-gray-600 text-white py-3.5 rounded-xl text-[15px] font-medium transition-all active:scale-[0.98] group"
          >
            {loading ? (
              <span className="animate-pulse">Verificando...</span>
            ) : (
              <>
                Continuar 
                <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

        </form>

        {/* Footer limpio */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Acceso restringido al personal autorizado.
          </p>
        </div>

      </div>
    </div>
  );
}
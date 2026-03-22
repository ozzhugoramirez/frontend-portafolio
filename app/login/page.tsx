"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, KeyRound, ArrowRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Intentamos obtener el token de Django
      await loginUser({ username, password });
      
      // Si pasa, redireccionamos a tu panel de control
      router.push('/admin');
    } catch (err) {
      // Si falla (credenciales incorrectas)
      console.error("Login failed:", err);
      setError('Credenciales inválidas o acceso denegado al sistema central.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] flex flex-col items-center justify-center font-sans selection:bg-indigo-500/30 selection:text-white p-4 relative overflow-hidden">
      
      {/* Decoración de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Cabecera del Login */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#0c0c0d] border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-black">
            <Lock size={28} className="text-indigo-500" />
          </div>
          <h1 className="text-2xl font-mono text-white tracking-tighter uppercase mb-2">Restricted Area</h1>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Ingrese credenciales de administrador</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="bg-[#0c0c0d] border border-white/5 rounded-3xl p-8 shadow-2xl shadow-black backdrop-blur-sm">
          
          <div className="space-y-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest px-2">Usuario</label>
              <div className="relative group">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#050506] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                  placeholder="admin_id"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest px-2">Contraseña</label>
              <div className="relative group">
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050506] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in fade-in">
              <ShieldAlert size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-mono text-red-400/90 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Botón Submit */}
          <button 
            type="submit" 
            disabled={loading || !username || !password}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-gray-600 text-white py-3.5 rounded-xl text-xs font-mono font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:shadow-none group"
          >
            {loading ? (
              <span className="animate-pulse">Autenticando...</span>
            ) : (
              <>
                Iniciar Sesión 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

        </form>

        {/* Footer */}
        <div className="mt-8 text-center flex items-center justify-center gap-2 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
          <ShieldCheck size={12} className="text-emerald-500/50" />
          Conexión Encriptada
        </div>

      </div>
    </div>
  );
}
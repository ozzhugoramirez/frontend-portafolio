"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, KeyRound, ArrowRight, ScanFace, Lock } from 'lucide-react';
import { signIn } from 'next-auth/react';
// IMPORTAMOS LA LIBRERÍA DE PASSKEYS
import { startAuthentication } from '@simplewebauthn/browser';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const router = useRouter();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorLimpio = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(valorLimpio.slice(0, 30));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorLimpio = e.target.value.replace(/\s/g, '');
    setPassword(valorLimpio.slice(0, 64));
  };

  // Login tradicional
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });

      if (result?.error) {
        setError('El usuario o la contraseña son incorrectos.');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Ocurrió un error. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // --- NUEVA LÓGICA DE PASSKEY ---
  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setError('');

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

      // 1. Pedimos opciones SIN mandar el usuario (Usamos GET)
      const optionsRes = await fetch(`${backendUrl}/api/auth/passkey/login/options/`);
      if (!optionsRes.ok) throw new Error('Error al iniciar comunicación segura.');
      const optionsJSON = await optionsRes.json();

      // 2. Levantamos el QR / Face ID (La compu todavía no sabe quién sos)
      let assertion;
      try {
        assertion = await startAuthentication(optionsJSON);
      } catch (e: any) {
        throw new Error('Operación cancelada.');
      }

      // 3. Mandamos la firma y el ticket ID a NextAuth. Ya NO mandamos username.
      const result = await signIn('credentials', {
        redirect: false,
        challenge_id: optionsJSON.challenge_id, // Enviamos el ticket
        assertion: JSON.stringify(assertion),
        isPasskey: 'true'
      });

      if (result?.error) {
        setError('Dispositivo no reconocido o firma inválida.');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error con el Passkey.');
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans p-4 sm:p-8 transition-colors duration-300">

      <div className="w-full max-w-[340px] flex flex-col">

        <div className="flex justify-center mb-8">
          <Lock strokeWidth={1.2} size={46} className="text-[#1d1d1f]" />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight mb-2">
            Iniciar sesión
          </h1>
          <p className="text-[15px] text-[#86868b]">
            Usa tu Passkey o cuenta local.
          </p>
        </div>

        <button
          onClick={handlePasskeyLogin}
          disabled={passkeyLoading || loading}
          className="w-full flex items-center justify-center gap-2.5 bg-[#1d1d1f] hover:bg-[#000000] text-white py-4 rounded-full text-[15px] font-medium transition-all active:scale-[0.98] disabled:opacity-50 mb-8"
        >
          {passkeyLoading ? (
            <span className="animate-pulse">Esperando dispositivo...</span>
          ) : (
            <>
              <ScanFace size={20} strokeWidth={1.5} />
              Continuar con Passkey
            </>
          )}
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-[1px] flex-1 bg-[#e5e5ea]"></div>
          <span className="text-[12px] font-medium text-[#86868b] uppercase tracking-wider">o con contraseña</span>
          <div className="h-[1px] flex-1 bg-[#e5e5ea]"></div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="relative group">
              <User size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] group-focus-within:text-[#0071e3] transition-colors" />
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className="w-full bg-[#f5f5f7] border border-transparent focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all placeholder:text-[#86868b]"
                placeholder="Usuario"
                required
              />
            </div>

            <div className="relative group">
              <KeyRound size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] group-focus-within:text-[#0071e3] transition-colors" />
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full bg-[#f5f5f7] border border-transparent focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-[15px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all placeholder:text-[#86868b]"
                placeholder="Contraseña"
              />
            </div>
          </div>

          {error && (
            <div className="mt-1 flex items-center justify-center gap-2 animate-in fade-in">
              <p className="text-[13px] font-medium text-[#ff3b30]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-[#f5f5f7] text-[#0071e3] disabled:text-[#86868b] py-4 rounded-full text-[15px] font-medium transition-all active:scale-[0.98] group mt-2"
          >
            {loading ? (
              <span className="animate-pulse">Iniciando...</span>
            ) : (
              <>
                Entrar
                <ArrowRight size={18} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
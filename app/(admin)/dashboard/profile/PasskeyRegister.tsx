"use client";

import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, AlertCircle, Loader2, Smartphone, Key } from 'lucide-react';
import { startRegistration } from '@simplewebauthn/browser';
import { api } from '@/lib/api';

export default function PasskeyRegister() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [passkeys, setPasskeys] = useState<any[]>([]); // Estado para guardar la lista

    // Función para traer los dispositivos registrados
    const fetchPasskeys = async () => {
        try {
            const res = await api.get('/auth/passkey/list/');
            setPasskeys(res.data);
        } catch (error) {
            console.error("Error cargando dispositivos", error);
        }
    };

    // Cargar la lista al montar el componente
    useEffect(() => {
        fetchPasskeys();
    }, []);

    const handleRegister = async () => {
        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const optionsRes = await api.get('/auth/passkey/register/options/');
            const optionsJSON = optionsRes.data;

            const attestation = await startRegistration(optionsJSON);

            await api.post('/auth/passkey/register/verify/', {
                challenge_id: optionsJSON.challenge_id,
                attestation: attestation,
                name: `Dispositivo de Seba (${new Date().toLocaleDateString()})`
            });

            setStatus('success');
            setMessage('¡Passkey vinculada con éxito!');

            // Actualizamos la lista automáticamente después de registrar
            fetchPasskeys();

        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMessage(err.response?.data?.detail || 'Error al registrar el dispositivo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-gray-200 dark:border-white/10 shadow-sm max-w-md w-full flex flex-col h-full">
            <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Fingerprint className="text-blue-500" size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
                        Acceso con Passkey
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Vinculá tu iPhone o PC para entrar sin usar contraseñas.
                    </p>
                </div>
            </div>

            {status === 'success' ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl mb-4">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{message}</p>
                </div>
            ) : status === 'error' ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl mb-4">
                    <AlertCircle size={20} className="text-red-500" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">{message}</p>
                </div>
            ) : null}

            <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#1d1d1f] hover:bg-[#000000] dark:bg-white dark:hover:bg-[#f5f5f7] text-white dark:text-black py-4 rounded-2xl text-[15px] font-medium transition-all active:scale-[0.98] disabled:opacity-50 mb-6"
            >
                {loading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Configurando...</span>
                    </>
                ) : (
                    <>
                        <Smartphone size={18} strokeWidth={2} />
                        <span>Vincular este dispositivo</span>
                    </>
                )}
            </button>

            {/* LISTA DE DISPOSITIVOS REGISTRADOS */}
            <div className="mt-auto">
                <h4 className="text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-3 px-2">
                    Dispositivos Autorizados ({passkeys.length})
                </h4>

                {passkeys.length === 0 ? (
                    <div className="text-center p-4 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                        <p className="text-xs text-gray-400">No hay dispositivos registrados.</p>
                    </div>
                ) : (
                    <div className="bg-[#f5f5f7] dark:bg-[#0c0c0d] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
                        {passkeys.map((pk, index) => (
                            <div
                                key={pk.id}
                                className={`flex items-center justify-between p-4 ${index !== passkeys.length - 1 ? 'border-b border-gray-200 dark:border-white/5' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1c1c1e] shadow-sm flex items-center justify-center">
                                        <Key size={14} className="text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-medium text-gray-900 dark:text-white leading-none">
                                            {pk.name}
                                        </span>
                                        <span className="text-[11px] text-gray-500 mt-1">
                                            Agregado el {pk.created_at} • Usos: {pk.sign_count}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-6 text-center">
                Tus datos biométricos nunca salen de tu dispositivo.
            </p>
        </div>
    );
}
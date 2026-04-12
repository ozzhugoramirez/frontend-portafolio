"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminBaseLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Verificación central de seguridad para TODAS las rutas privadas
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="h-screen w-full bg-[#f5f5f7] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-gray-500 animate-pulse tracking-tight">Verificando credenciales...</p>
      </div>
    );
  }

  // Fondo genérico limpio, blanco/gris sutil estilo Apple
  return (
    <div className="min-h-screen w-full bg-[#f5f5f7] text-gray-900 font-sans selection:bg-blue-500/30">
      {children}
    </div>
  );
}
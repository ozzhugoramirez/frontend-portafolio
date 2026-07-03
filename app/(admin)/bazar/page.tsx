'use client';

import React, { useState } from 'react';
import { useZxing } from 'react-zxing';

export default function ScannerMobil() {
  const [resultado, setResultado] = useState<string>('');

  // Configuración del escáner
  const { ref } = useZxing({

    onDecodeResult(resultado) {
      // Cuando lee un código exitosamente, guardamos el texto
      setResultado(resultado.rawValue);
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col items-center p-6 space-y-4">

        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Escáner de Código
        </h1>

        <p className="text-sm text-gray-500 text-center">
          Apunta la cámara de tu móvil hacia un código QR o de barras.
        </p>

        {/* Contenedor del video con aspecto cuadrado para móvil */}
        <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden border-4 border-gray-200 shadow-inner">
          {/* El tag video está conectado al hook de zxing mediante 'ref' */}
          <video ref={ref} className="w-full h-full object-cover" />

          {/* Overlay visual opcional (líneas guía para el usuario) */}
          <div className="absolute inset-0 border-2 border-dashed border-blue-500 opacity-50 pointer-events-none m-6 rounded-lg"></div>
        </div>

        {/* Caja de Resultado */}
        <div className="w-full p-4 mt-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[6rem] flex flex-col justify-center items-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Resultado de lectura
          </span>

          {resultado ? (
            <span className="text-green-600 font-mono font-bold text-lg break-all text-center">
              {resultado}
            </span>
          ) : (
            <span className="text-gray-400 italic text-sm">
              Esperando código...
            </span>
          )}
        </div>

        {/* Botón para reiniciar el escáner si ya leyó algo */}
        {resultado && (
          <button
            onClick={() => setResultado('')}
            className="w-full py-3 px-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
          >
            Escanear de nuevo
          </button>
        )}

      </div>
    </div>
  );
}
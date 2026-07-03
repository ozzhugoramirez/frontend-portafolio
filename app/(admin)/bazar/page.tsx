'use client';

import React, { useState } from 'react';
import { useZxing } from 'react-zxing';
import { getProductoByBarcode, createProducto, updateProducto } from '@/lib/api'; // Ajustá la ruta si tu lib está en otro lado

// Definimos la estructura de datos del Producto
interface Producto {
  codigo_barras: string;
  numero_item?: string;
  nombre: string;
  proveedor?: string;
  marca?: string;
  stock: number;
  categorias?: string;
  precio: string | number;
  descripcion?: string;
}

export default function BazarScannerPage() {
  // Estados de la interfaz
  const [modo, setModo] = useState<'scanner' | 'detalle' | 'formulario'>('scanner');
  const [cargando, setCargando] = useState(false);
  const [busquedaManual, setBusquedaManual] = useState('');

  // Estado de los datos del producto
  const [producto, setProducto] = useState<Partial<Producto>>({});
  const [esNuevo, setEsNuevo] = useState(false); // Para saber si hacemos POST o PUT

  // Configuración del escáner
  const { ref } = useZxing({
    paused: modo !== 'scanner', // Pausamos la lectura si no estamos en la vista principal
    onDecodeResult(result) {
      const codigoLeido = result.rawValue;
      procesarCodigo(codigoLeido);
    },
  });

  // Función principal: busca en la base de datos
  const procesarCodigo = async (codigo: string) => {
    setCargando(true);
    try {
      // Intentamos buscarlo en Django
      const data = await getProductoByBarcode(codigo);
      setProducto(data);
      setEsNuevo(false);
      setModo('detalle'); // Existe -> Mostrar Detalle
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // No existe -> Preparar formulario vacío
        setProducto({ codigo_barras: codigo, stock: 0, precio: '' });
        setEsNuevo(true);
        setModo('formulario');
      } else {
        alert("Error de conexión con el servidor.");
      }
    } finally {
      setCargando(false);
    }
  };

  // Función para guardar el producto
  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      if (esNuevo) {
        await createProducto(producto);
        alert('Producto creado con éxito');
      } else {
        await updateProducto(producto.codigo_barras as string, producto);
        alert('Producto actualizado con éxito');
      }
      setModo('detalle'); // Volvemos a mostrar el detalle al guardar
      setEsNuevo(false);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al guardar los datos.');
    } finally {
      setCargando(false);
    }
  };

  // --- VISTA 1: DETALLE DEL PRODUCTO ---
  if (modo === 'detalle') {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col space-y-6 overflow-y-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button onClick={() => setModo('scanner')} className="text-emerald-400 font-bold">
            ← Volver al Escáner
          </button>
          <button onClick={() => setModo('formulario')} className="bg-slate-800 px-4 py-2 rounded-lg text-sm font-semibold">
            Editar ✏️
          </button>
        </div>

        {/* Info Principal */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
          <p className="text-slate-400 text-xs font-mono mb-1">Código: {producto.codigo_barras}</p>
          <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{producto.nombre}</h1>
          <p className="text-4xl font-black text-emerald-400 my-4">${producto.precio}</p>

          <div className="flex items-center space-x-2 mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${producto.stock && producto.stock > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              Stock: {producto.stock} uds
            </span>
            {producto.marca && (
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {producto.marca}
              </span>
            )}
          </div>
        </div>

        {/* Más detalles */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 space-y-4">
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2">Información Adicional</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Proveedor</p>
              <p className="font-semibold">{producto.proveedor || '-'}</p>
            </div>
            <div>
              <p className="text-slate-500">N° Item</p>
              <p className="font-semibold">{producto.numero_item || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500">Categorías</p>
              <p className="font-semibold">{producto.categorias || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500">Descripción</p>
              <p className="font-semibold">{producto.descripcion || 'Sin descripción'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA 2: FORMULARIO (CREAR/EDITAR) ---
  if (modo === 'formulario') {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setModo(esNuevo ? 'scanner' : 'detalle')} className="text-slate-400 font-bold">
            ← Cancelar
          </button>
          <h2 className="text-xl font-bold">{esNuevo ? 'Nuevo Producto' : 'Editar Producto'}</h2>
        </div>

        <form onSubmit={guardarProducto} className="space-y-5 pb-10">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Código de Barras *</label>
            <input type="text" value={producto.codigo_barras || ''} readOnly className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-slate-500 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Nombre del Producto *</label>
            <input required type="text" value={producto.nombre || ''} onChange={e => setProducto({ ...producto, nombre: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Precio *</label>
              <input required type="number" step="0.01" value={producto.precio || ''} onChange={e => setProducto({ ...producto, precio: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Stock</label>
              <input type="number" value={producto.stock ?? 0} onChange={e => setProducto({ ...producto, stock: parseInt(e.target.value) })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Marca</label>
              <input type="text" value={producto.marca || ''} onChange={e => setProducto({ ...producto, marca: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">N° Item Interno</label>
              <input type="text" value={producto.numero_item || ''} onChange={e => setProducto({ ...producto, numero_item: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Proveedor</label>
            <input type="text" value={producto.proveedor || ''} onChange={e => setProducto({ ...producto, proveedor: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Categorías</label>
            <input type="text" placeholder="Ej: Limpieza, Ofertas" value={producto.categorias || ''} onChange={e => setProducto({ ...producto, categorias: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Descripción</label>
            <textarea rows={3} value={producto.descripcion || ''} onChange={e => setProducto({ ...producto, descripcion: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
          </div>

          <button disabled={cargando} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4 disabled:opacity-50">
            {cargando ? 'Guardando...' : (esNuevo ? 'Crear Producto' : 'Guardar Cambios')}
          </button>
        </form>
      </div>
    );
  }

  // --- VISTA 3: ESCÁNER Y MENÚ PRINCIPAL (Por defecto) ---
  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">

      {/* Overlay de Carga */}
      {cargando && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
        </div>
      )}

      {/* SECCIÓN SUPERIOR: Escáner */}
      <div className="relative w-full h-[45vh] bg-black overflow-hidden">
        <video ref={ref} className="w-full h-full object-cover" playsInline muted />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
          <div className="w-full max-w-xs aspect-[4/3] border-2 border-emerald-500 border-dashed rounded-2xl relative flex items-center justify-center opacity-60">
            <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></div>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: Panel de control */}
      <div className="flex-1 flex flex-col p-5 bg-slate-900 rounded-t-3xl -mt-5 relative z-10 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] justify-between space-y-5">

        {/* Buscador Manual */}
        <div className="w-full space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            Buscar Producto (Manual)
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ingresá el código..."
              value={busquedaManual}
              onChange={(e) => setBusquedaManual(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && busquedaManual && procesarCodigo(busquedaManual)}
              className="flex-1 py-4 pl-4 pr-4 bg-slate-800 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-base"
            />
            <button
              onClick={() => busquedaManual && procesarCodigo(busquedaManual)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-2xl font-bold"
            >
              Ir
            </button>
          </div>
        </div>

        {/* Bloque de Acciones en Cuadrícula 2x2 */}
        <div className="w-full space-y-3 flex-1 flex flex-col justify-end">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 block">Gestión de Negocio</span>
          <div className="grid grid-cols-2 gap-3.5">
            {/* Botones de ejemplo */}
            <button className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-750 active:scale-[0.97] border border-slate-700/50 rounded-2xl transition-all h-28 space-y-2 group">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400"><span className="text-2xl">🛒</span></div>
              <span className="text-sm font-semibold text-slate-200">Nueva Venta</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-750 active:scale-[0.97] border border-slate-700/50 rounded-2xl transition-all h-28 space-y-2 group">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400"><span className="text-2xl">📦</span></div>
              <span className="text-sm font-semibold text-slate-200">Control Stock</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-750 active:scale-[0.97] border border-slate-700/50 rounded-2xl transition-all h-28 space-y-2 group">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400"><span className="text-2xl">💵</span></div>
              <span className="text-sm font-semibold text-slate-200">Caja Diaria</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-slate-800 hover:bg-slate-750 active:scale-[0.97] border border-slate-700/50 rounded-2xl transition-all h-28 space-y-2 group">
              <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400"><span className="text-2xl">🚚</span></div>
              <span className="text-sm font-semibold text-slate-200">Proveedores</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
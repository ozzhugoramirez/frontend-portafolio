"use client";

import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

// HERRAMIENTAS ESENCIALES (Compacto y útil)
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'], 
    [{ 'color': [] }, { 'background': [] }], 
    [{ 'list': 'bullet'}, { 'list': 'ordered' }], 
    ['link', 'image', 'clean'] 
  ],
};

export default function Editor({ value, onChange }: EditorProps) {
  return (
    <div className="relative w-full h-full flex flex-col items-center">
      <ReactQuill 
        theme="snow" 
        value={value || ''} 
        onChange={onChange} 
        modules={modules}
        className="w-full h-full"
        placeholder="Escribí acá tus apuntes..."
      />
      
      {/* MAGIA CSS: Barra flotante estilo Apple */}
      <style global jsx>{`
        .ql-container.ql-snow {
          border: none !important;
          font-size: 16px;
          font-family: inherit;
          height: 100%;
        }
        
        /* LA CÁPSULA FLOTANTE */
        .ql-toolbar.ql-snow {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(12px); /* Desenfoque de fondo */
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          border-radius: 9999px !important; /* Bordes totalmente curvos */
          padding: 8px 16px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
          z-index: 50;
          display: flex;
          align-items: center;
          width: max-content;
        }

        /* Separadores limpios entre los botones */
        .ql-formats {
          margin-right: 12px !important;
          padding-right: 12px;
          border-right: 1px solid rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
        }
        .ql-formats:last-child {
          border-right: none;
          margin-right: 0 !important;
          padding-right: 0;
        }

        /* Ajuste del espacio de escritura para que no lo tape la barra */
        .ql-editor {
          padding: 100px 60px 100px 60px !important; 
          max-width: 800px; /* Ancho óptimo de lectura */
          margin: 0 auto;   /* Centra el texto en la pantalla */
        }
        
        /* Ajustar menú desplegable de títulos para que no se rompa */
        .ql-snow .ql-picker.ql-expanded .ql-picker-options {
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
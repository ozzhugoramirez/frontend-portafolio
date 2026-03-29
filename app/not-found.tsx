// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 py-24 dark:bg-slate-950 sm:py-32 lg:px-8">
      <div className="text-center">
       
        <p className="text-6xl font-black text-blue-600 dark:text-blue-500">404</p>
        
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
          Ruta no encontrada
        </h1>
        
        <p className="mt-6 text-base leading-7 text-slate-600 dark:text-slate-400">
          Parece que intentaste acceder a un endpoint que no existe o fue movido.
        </p>

        
        <div className="mt-10 flex items-center justify-center">
          <div className="rounded-lg bg-slate-900 p-4 text-left font-mono text-sm text-slate-300 shadow-xl sm:text-base">
            <p className="text-green-400">$ status --check-route</p>
            <p className="mt-1">Error: path_not_found</p>
            <p className="mt-1">Suggestion: return to main view</p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all"
          >
            Volver al Inicio
          </Link>
        
        </div>
      </div>
    </main>
  )
}
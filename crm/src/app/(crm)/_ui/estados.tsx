"use client";

/** Estados de carga y de error compartidos por los módulos (cada uno los reexporta en su carpeta). */

export function Cargando({ nombre }: { nombre: string }) {
  const bloque = "animate-pulse rounded-panel bg-brand-100/70";
  return (
    <div className="space-y-6" role="status" aria-label={`Cargando ${nombre}`}>
      <div className="space-y-2">
        <div className={`${bloque} h-9 w-56 max-w-full`} />
        <div className={`${bloque} h-5 w-72 max-w-full`} />
      </div>
      <div className={`${bloque} h-10 w-full max-w-md`} />
      <div className={`${bloque} h-80`} />
    </div>
  );
}

export function ErrorDeModulo({ nombre, reset }: { nombre: string; reset: () => void }) {
  return (
    <div role="alert" className="rounded-panel border border-line bg-surface px-5 py-8 sm:px-7">
      <h1 className="text-xl font-semibold">No se pudo cargar {nombre}</h1>
      <p className="mt-2 max-w-prose text-text">Los datos no llegaron. Puede ser la conexión o el servidor; tu información no se ha perdido.</p>
      <button type="button" onClick={reset} className="mt-5 h-11 rounded-control bg-brand-900 px-5 font-semibold text-white transition-colors hover:bg-brand-950">
        Reintentar
      </button>
    </div>
  );
}

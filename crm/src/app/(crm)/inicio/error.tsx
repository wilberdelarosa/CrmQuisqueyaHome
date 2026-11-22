"use client";

/** Estado de error de Inicio: dice qué pasó y deja reintentar sin salir de la página. */
export default function ErrorDeInicio({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="rounded-panel border border-line bg-surface px-5 py-8 sm:px-7">
      <h1 className="text-xl font-semibold">No se pudo cargar Inicio</h1>
      <p className="mt-2 max-w-prose text-text">
        Los datos no llegaron. Puede ser la conexión o el servidor; tu información no se ha perdido.
      </p>
      <button type="button" onClick={reset}
        className="mt-5 h-11 rounded-control bg-brand-900 px-5 font-semibold text-white transition-colors hover:bg-brand-950">
        Reintentar
      </button>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

/** Encabezado común de cada pantalla: título, una línea de contexto y la acción principal. */
export function Encabezado({ titulo, detalle, volver, children }: { titulo: string; detalle?: ReactNode; volver?: { ruta: string; texto: string }; children?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        {volver ? <Link href={volver.ruta} className="mb-1 inline-block text-sm font-medium text-brand-900 underline underline-offset-2">Volver a {volver.texto}</Link> : null}
        <h1 className="text-[1.75rem] font-semibold leading-tight sm:text-[2rem]">{titulo}</h1>
        {detalle ? <p className="mt-1 text-ink-muted">{detalle}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </header>
  );
}

/** Estado vacío: dice qué falta y, si aplica, qué hacer. */
export function Vacio({ children }: { children: ReactNode }) {
  return <p className="rounded-panel border border-dashed border-input-line px-5 py-8 text-text">{children}</p>;
}

const TONOS = {
  neutro: "bg-brand-100 text-brand-900",
  exito: "bg-success-bg text-success",
  aviso: "bg-warning-bg text-warning",
  peligro: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
} as const;
export type Tono = keyof typeof TONOS;

/** Etiqueta de estado: siempre con texto, el color solo acompaña. */
export function Etiqueta({ tono = "neutro", children }: { tono?: Tono; children: ReactNode }) {
  return <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-medium ${TONOS[tono]}`}>{children}</span>;
}

/** Filtros como enlaces: el estado vive en la URL, así recargar o compartir conserva la vista. */
export function Filtros({ etiqueta, opciones }: { etiqueta: string; opciones: { ruta: string; texto: string; cantidad?: number; activa: boolean }[] }) {
  return (
    <nav aria-label={etiqueta} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-2">
        {opciones.map((opcion) => (
          <li key={opcion.ruta}>
            <Link href={opcion.ruta} aria-current={opcion.activa ? "page" : undefined}
              className={`inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors ${
                opcion.activa ? "border-brand-900 bg-brand-900 text-white" : "border-input-line bg-surface text-text hover:bg-surface-hover"
              }`}>
              {opcion.texto}
              {opcion.cantidad !== undefined ? <span className={`cifra ${opcion.activa ? "text-white/80" : "text-ink-muted"}`}>{opcion.cantidad}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Par dato–valor de una ficha. */
export function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-ink-muted">{etiqueta}</dt>
      <dd className="mt-0.5 break-words text-ink">{children}</dd>
    </div>
  );
}

export const PANEL = "rounded-panel border border-line bg-surface";
export const BOTON = "inline-flex h-11 items-center justify-center rounded-control px-4 font-semibold transition-colors disabled:cursor-progress disabled:opacity-80";
export const BOTON_PRINCIPAL = `${BOTON} bg-brand-900 text-white hover:bg-brand-950`;
export const BOTON_SECUNDARIO = `${BOTON} border border-input-line bg-surface text-ink hover:bg-surface-hover`;
export const CAMPO = "mt-1.5 block h-11 w-full rounded-control border border-input-line bg-surface px-3 text-ink";

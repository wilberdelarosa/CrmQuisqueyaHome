"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { estaActiva } from "./ruta-activa";

/** Enlace del menú lateral (escritorio). El icono llega ya pintado desde el servidor. */
export function EnlaceLateral({ ruta, nombre, icono }: { ruta: string; nombre: string; icono: ReactNode }) {
  const activa = estaActiva(usePathname(), ruta);
  return (
    <Link href={ruta} aria-current={activa ? "page" : undefined}
      className={`group relative flex h-11 items-center gap-3 rounded-control px-3 font-medium transition-colors ${
        activa ? "bg-white/10 text-rail-ink" : "text-rail-muted hover:bg-white/5 hover:text-rail-ink"
      }`}>
      <span aria-hidden="true" className={`absolute inset-y-2 left-0 w-[3px] rounded-full ${activa ? "bg-accent-600" : "bg-transparent"}`} />
      <span className={activa ? "text-accent-600" : ""}>{icono}</span>
      <span className="truncate">{nombre}</span>
    </Link>
  );
}

/** Pestaña de la barra inferior (móvil). */
export function PestanaInferior({ ruta, nombre, icono }: { ruta: string; nombre: string; icono: ReactNode }) {
  const activa = estaActiva(usePathname(), ruta);
  return (
    <Link href={ruta} aria-current={activa ? "page" : undefined}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${activa ? "text-brand-900" : "text-ink-muted"}`}>
      <span className={`flex h-7 w-14 items-center justify-center rounded-full transition-colors ${activa ? "bg-accent-100 text-accent-800" : ""}`}>{icono}</span>
      <span className="max-w-full truncate px-1">{nombre}</span>
    </Link>
  );
}

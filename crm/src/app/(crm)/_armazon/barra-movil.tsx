"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import { CambiarRol } from "./cambiar-rol";
import { CerrarSesion } from "./cerrar-sesion";
import { PestanaInferior } from "./enlace-de-menu";

export type EntradaMovil = { id: string; ruta: string; nombre: string; icono: ReactNode; enRevision: boolean };

type Props = {
  empresa: { nombre: string; isotipo: string };
  perfil: { nombre: string; iniciales: string; rol: string };
  evaluacion: { roles: { slug: string; nombre: string }[]; actual: string } | null;
  disponibles: EntradaMovil[];
  pendientes: { id: string; nombre: string }[];
  iconoMas: ReactNode;
};

/** Cuántos módulos caben en la barra inferior junto a «Más». */
const PESTANAS_VISIBLES = 4;

/** Navegación en móvil, como una app: cabecera clara, barra inferior y hoja «Más» deslizable. */
export function BarraMovil({ empresa, perfil, evaluacion, disponibles, pendientes, iconoMas }: Props) {
  const [abierta, setAbierta] = useState(false);
  const enBarra = disponibles.slice(0, PESTANAS_VISIBLES);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden">
        <Image src={empresa.isotipo} alt="" width={36} height={31} className="h-7 w-auto" />
        <span className="min-w-0 flex-1 truncate font-display text-[1.05rem] font-semibold text-ink">{empresa.nombre}</span>
        <button type="button" onClick={() => setAbierta(true)} aria-label={`Cuenta de ${perfil.nombre}`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-900 font-display text-sm font-bold text-white">
          {perfil.iniciales}
        </button>
      </header>

      <nav aria-label="Módulos" className="fixed inset-x-0 bottom-0 z-30 flex h-dock items-stretch border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        {enBarra.map((entrada) => (
          <PestanaInferior key={entrada.id} ruta={entrada.ruta} nombre={entrada.nombre} icono={entrada.icono} />
        ))}
        <button type="button" onClick={() => setAbierta(true)} aria-haspopup="dialog" aria-expanded={abierta}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium text-ink-muted">
          <span className="flex h-7 w-14 items-center justify-center rounded-full">{iconoMas}</span>
          <span>Más</span>
        </button>
      </nav>

      <Drawer.Root open={abierta} onOpenChange={setAbierta}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-brand-950/40" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl bg-surface outline-none lg:hidden">
            <span aria-hidden="true" className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-line" />
            <div className="overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
              <Drawer.Title className="font-display text-lg font-semibold text-ink">{perfil.nombre}</Drawer.Title>
              <Drawer.Description className="text-ink-muted">{perfil.rol}</Drawer.Description>

              <ul className="mt-5 divide-y divide-line border-y border-line">
                {disponibles.map((entrada) => (
                  <li key={entrada.id}>
                    <Link href={entrada.ruta} onClick={() => setAbierta(false)} className="flex min-h-12 items-center gap-3 py-3 font-medium text-ink">
                      <span className="text-brand-700">{entrada.icono}</span>
                      <span className="flex-1">{entrada.nombre}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {pendientes.length > 0 ? (
                <p className="mt-4 text-sm text-ink-muted">
                  En construcción: {pendientes.map((entrada) => entrada.nombre).join(", ")}.
                </p>
              ) : null}

              {evaluacion
                ? <CambiarRol roles={evaluacion.roles} actual={evaluacion.actual} tono="claro" />
                : <CerrarSesion className="mt-6 h-11 w-full rounded-control border border-input-line px-3 font-medium text-ink transition-colors hover:bg-surface-hover disabled:cursor-progress" />}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

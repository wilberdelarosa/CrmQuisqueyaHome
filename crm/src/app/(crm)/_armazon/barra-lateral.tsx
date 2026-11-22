import Image from "next/image";
import type { PerfilDeSesion } from "@/infrastructure/contenedor/sesion";
import type { Empresa } from "@/infrastructure/empresa";
import { CambiarRol } from "./cambiar-rol";
import { CerrarSesion } from "./cerrar-sesion";
import { EnlaceLateral } from "./enlace-de-menu";
import { Icono } from "./icono";
import type { Menu } from "./navegacion";

/** Navegación de escritorio: barra de marca fija a la izquierda. */
type Evaluacion = { roles: { slug: string; nombre: string }[]; actual: string } | null;

export function BarraLateral({ empresa, perfil, menu, evaluacion }: { empresa: Empresa; perfil: PerfilDeSesion; menu: Menu; evaluacion: Evaluacion }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-rail flex-col bg-brand-950 text-rail-ink lg:flex">
      <div className="flex items-center gap-3 px-4 pb-5 pt-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-panel bg-white">
          <Image src={empresa.marca.isotipo} alt="" width={36} height={31} className="h-7 w-auto" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-[1.05rem] font-semibold leading-tight">{empresa.nombre}</span>
          <span className="block truncate text-sm text-rail-muted">{empresa.producto}</span>
        </span>
      </div>

      <nav aria-label="Módulos" className="flex-1 overflow-y-auto px-3 pb-4">
        <ul className="space-y-1">
          {menu.disponibles.map((entrada) => (
            <li key={entrada.id}>
              <EnlaceLateral ruta={entrada.ruta} nombre={entrada.nombre}
                icono={<Icono nombre={entrada.icono} className="h-5 w-5" />} />
            </li>
          ))}
        </ul>

        {menu.disponibles.some((entrada) => entrada.estado === "en_revision") ? (
          <p className="mt-4 px-3 text-sm text-rail-muted">Estás viendo módulos en revisión, aún sin certificar.</p>
        ) : null}

        {menu.pendientes.length > 0 ? (
          <section aria-labelledby="titulo-pendientes" className="mt-6 border-t border-white/10 pt-4">
            <h2 id="titulo-pendientes" className="px-3 font-sans text-sm font-medium text-rail-muted">En construcción</h2>
            <ul className="mt-2 space-y-0.5">
              {menu.pendientes.map((entrada) => (
                <li key={entrada.id} className="flex h-9 items-center gap-3 px-3 text-rail-muted/70">
                  <Icono nombre={entrada.icono} className="h-4 w-4" />
                  <span className="truncate text-sm">{entrada.nombre}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-600 font-display text-sm font-bold text-brand-950">
            {perfil.iniciales}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{perfil.nombre}</span>
            <span className="block truncate text-sm text-rail-muted">{perfil.rol}</span>
          </span>
        </div>
        {/* En evaluación no hay sesión que cerrar: el acceso entra solo; se cambia de rol. */}
        {evaluacion
          ? <CambiarRol roles={evaluacion.roles} actual={evaluacion.actual} tono="oscuro" />
          : <CerrarSesion className="mt-3 h-10 w-full rounded-control border border-white/15 px-3 text-sm font-medium text-rail-ink transition-colors hover:bg-white/10 disabled:cursor-progress" />}
      </div>
    </aside>
  );
}

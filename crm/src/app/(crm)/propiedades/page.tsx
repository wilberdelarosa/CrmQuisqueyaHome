import type { Metadata } from "next";
import Link from "next/link";
import { requireActor } from "@/infrastructure/auth/actor";
import { listarProyectos } from "@/infrastructure/contenedor/vistas";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { fechaCorta, rangoDePrecio, TIPO_PROYECTO } from "../_ui/formato";
import { Encabezado, PANEL, Vacio } from "../_ui/pagina";

export const metadata: Metadata = { title: "Propiedades" };

export default async function Propiedades() {
  const actor = await requireActor();
  const alcance = requireScopeInPage(actor, "projects", "view");
  const proyectos = await listarProyectos(actor, alcance);
  const regional = empresa();
  const disponibles = proyectos.reduce((suma, proyecto) => suma + proyecto.disponibles, 0);

  return (
    <div className="space-y-6">
      <Encabezado titulo="Propiedades"
        detalle={`${proyectos.length} ${proyectos.length === 1 ? "proyecto" : "proyectos"}, ${disponibles} ${disponibles === 1 ? "unidad disponible" : "unidades disponibles"}`} />

      {proyectos.length === 0 ? (
        <Vacio>No hay proyectos a tu alcance. El catálogo se sincroniza desde el portal; si falta alguno, avisa a la administración.</Vacio>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {proyectos.map((proyecto) => (
            <li key={proyecto.id}>
              <Link href={`/propiedades/${proyecto.id}`} className={`${PANEL} flex h-full flex-col px-5 py-4 transition-colors hover:border-brand-700`}>
                <span className="block font-display text-lg font-semibold leading-snug text-ink">{proyecto.name}</span>
                <span className="mt-0.5 block text-sm text-ink-muted">
                  {[proyecto.zone, TIPO_PROYECTO[proyecto.projectType]].filter(Boolean).join(", ") || "Sin zona registrada"}
                </span>
                <span className="cifra mt-3 block text-ink">{rangoDePrecio(proyecto.publicRangeMinCents, proyecto.publicRangeMaxCents, proyecto.currency, regional.idioma)}</span>
                {proyecto.total > 0 ? (
                  <>
                    <span className="mt-4 flex h-2 overflow-hidden rounded-full bg-brand-100" role="img"
                      aria-label={`${proyecto.disponibles} disponibles, ${proyecto.reservadas} reservadas y ${proyecto.vendidas} vendidas de ${proyecto.total}`}>
                      <span className="bg-success" style={{ width: `${(proyecto.disponibles / proyecto.total) * 100}%` }} />
                      <span className="bg-accent-600" style={{ width: `${(proyecto.reservadas / proyecto.total) * 100}%` }} />
                      <span className="bg-brand-700" style={{ width: `${(proyecto.vendidas / proyecto.total) * 100}%` }} />
                    </span>
                    <span className="mt-2 block text-sm text-text">
                      <span className="cifra font-semibold text-ink">{proyecto.disponibles}</span> disponibles de {proyecto.total}
                    </span>
                  </>
                ) : <span className="mt-4 block text-sm text-ink-muted">Sin unidades cargadas</span>}
                {proyecto.estimatedDeliveryDate ? <span className="mt-auto block pt-3 text-sm text-ink-muted">Entrega estimada {fechaCorta(proyecto.estimatedDeliveryDate, regional)}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

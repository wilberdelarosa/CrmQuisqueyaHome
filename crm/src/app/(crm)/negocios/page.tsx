import type { Metadata } from "next";
import Link from "next/link";
import { consultarCatalogosNegocios, consultarTableroNegocios } from "@/application/pipeline/consultas";
import { requireActor } from "@/infrastructure/auth/actor";
import { pipelineParaLectura } from "@/infrastructure/contenedor/pipeline";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { dinero, fechaHora } from "../_ui/formato";
import { Encabezado, Vacio } from "../_ui/pagina";

export const metadata: Metadata = { title: "Negocios" };

export default async function Negocios() {
  const actor = await requireActor();
  requireScopeInPage(actor, "deals", "view");
  const repo = pipelineParaLectura();
  const [tablero, catalogos] = await Promise.all([consultarTableroNegocios(repo, actor), consultarCatalogosNegocios(repo, actor)]);
  const regional = empresa();
  const etapas = catalogos.etapas.filter((etapa) => etapa.isActive !== false).sort((a, b) => a.position - b.position);
  const abiertos = tablero.filas.filter((negocio) => negocio.stageKind === "open").length;

  return (
    <div className="space-y-6">
      <Encabezado titulo="Negocios"
        detalle={`${abiertos} ${abiertos === 1 ? "negocio abierto" : "negocios abiertos"}. Los negocios nacen al convertir un lead.`} />

      {tablero.filas.length === 0 ? (
        <Vacio>Aún no hay negocios. Abre un lead y conviértelo cuando la persona esté lista para avanzar.</Vacio>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <ol className="flex gap-4">
            {etapas.map((etapa) => {
              const negocios = tablero.filas.filter((negocio) => negocio.stageId === etapa.id);
              const total = negocios.reduce((suma, negocio) => suma + (negocio.amountCents ?? 0), 0);
              return (
                <li key={etapa.id} className="flex w-72 shrink-0 flex-col rounded-panel bg-brand-100/60">
                  <div className="flex items-baseline justify-between gap-3 px-4 pb-2 pt-3.5">
                    <h2 className="truncate text-base font-semibold">{etapa.name}</h2>
                    <span className="cifra shrink-0 text-sm text-ink-muted">{negocios.length}</span>
                  </div>
                  {total > 0 ? <p className="cifra px-4 pb-2 text-sm text-ink-muted">{dinero(total, regional.monedaPrincipal, regional.idioma)}</p> : null}
                  <ul className="flex flex-1 flex-col gap-2 px-2 pb-2">
                    {negocios.length === 0 ? <li className="px-2 py-3 text-sm text-ink-muted">Sin negocios en esta etapa.</li> : null}
                    {negocios.map((negocio) => (
                      <li key={negocio.id}>
                        <Link href={`/negocios/${negocio.id}`} className="block rounded-control border border-line bg-surface px-3.5 py-3 transition-colors hover:border-brand-700">
                          <span className="block truncate font-medium text-ink">{negocio.contactName}</span>
                          <span className="block truncate text-sm text-ink-muted">
                            {negocio.proyectoPrincipal ? `${negocio.proyectoPrincipal.projectName}${negocio.proyectoPrincipal.unitCode ? `, ${negocio.proyectoPrincipal.unitCode}` : ""}` : "Sin propiedad definida"}
                          </span>
                          {negocio.amountCents != null ? <span className="cifra mt-1.5 block font-semibold text-ink">{dinero(negocio.amountCents, negocio.currency, regional.idioma)}</span> : null}
                          <span className="mt-1.5 block truncate text-sm text-text">
                            {negocio.nextActivityTitle
                              ? `${negocio.nextActivityTitle}${negocio.nextActivityStartsAt ? `, ${fechaHora(negocio.nextActivityStartsAt, regional)}` : ""}`
                              : negocio.stageKind === "open" ? "Sin próxima acción" : negocio.brokerName ?? ""}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>
      )}
      {tablero.siguiente ? <p className="text-sm text-ink-muted">Hay más negocios de los que caben en el tablero; se muestran los más recientes.</p> : null}
    </div>
  );
}

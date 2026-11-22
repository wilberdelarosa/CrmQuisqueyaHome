import type { Metadata } from "next";
import Link from "next/link";
import { LEAD_STATUSES } from "@/domain/catalogs";
import { can } from "@/domain/rbac";
import { requireActor } from "@/infrastructure/auth/actor";
import { listarLeads, LIMITE_LEADS, type EstadoLead } from "@/infrastructure/contenedor/vistas";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { ESTADO_LEAD, fechaHora, OPERACION } from "../_ui/formato";
import { Encabezado, Etiqueta, Filtros, PANEL, Vacio } from "../_ui/pagina";
import { NuevoLead } from "./nuevo-lead";

export const metadata: Metadata = { title: "Leads" };

type Parametros = Promise<Record<string, string | string[] | undefined>>;
const uno = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor);

export default async function Leads({ searchParams }: { searchParams: Parametros }) {
  const actor = await requireActor();
  const alcance = requireScopeInPage(actor, "leads", "view");
  const params = await searchParams;
  const estado = LEAD_STATUSES.find((valor) => valor === uno(params.estado)) as EstadoLead | undefined;
  const sinResponsable = uno(params.cola) === "1";
  const buscar = uno(params.buscar)?.slice(0, 80);
  const brokerPedido = Number(uno(params.broker));
  const brokerId = Number.isSafeInteger(brokerPedido) && brokerPedido > 0 ? brokerPedido : undefined;
  const regional = empresa();
  const { filas, porEstado, total } = await listarLeads(actor, alcance, { estado, sinResponsable, buscar, brokerId });

  const ruta = (cambios: Record<string, string | undefined>) => {
    const consulta = new URLSearchParams();
    const valores = { estado, cola: sinResponsable ? "1" : undefined, buscar, broker: brokerId ? String(brokerId) : undefined, ...cambios };
    for (const [clave, valor] of Object.entries(valores)) if (valor) consulta.set(clave, valor);
    const texto = consulta.toString();
    return texto ? `/leads?${texto}` : "/leads";
  };

  return (
    <div className="space-y-6">
      <Encabezado titulo="Leads" detalle={`${total} ${total === 1 ? "persona interesada" : "personas interesadas"} a tu alcance`}>
        {can(actor, "leads", "create") ? <NuevoLead /> : null}
      </Encabezado>

      <Filtros etiqueta="Filtrar por estado" opciones={[
        { ruta: ruta({ estado: undefined, cola: undefined }), texto: "Todos", cantidad: total, activa: !estado && !sinResponsable },
        ...LEAD_STATUSES.map((valor) => ({
          ruta: ruta({ estado: valor, cola: undefined }), texto: ESTADO_LEAD[valor]!.texto, cantidad: porEstado[valor] ?? 0, activa: estado === valor,
        })),
        { ruta: ruta({ estado: undefined, cola: "1" }), texto: "Sin responsable", activa: sinResponsable },
      ]} />

      <form action="/leads" className="flex max-w-md gap-2" role="search">
        {estado ? <input type="hidden" name="estado" value={estado} /> : null}
        {sinResponsable ? <input type="hidden" name="cola" value="1" /> : null}
        <label className="sr-only" htmlFor="buscar-lead">Buscar por nombre o proyecto</label>
        <input id="buscar-lead" name="buscar" type="search" defaultValue={buscar} placeholder="Buscar por nombre o proyecto"
          className="h-11 min-w-0 flex-1 rounded-control border border-input-line bg-surface px-3 text-ink" />
        <button type="submit" className="h-11 rounded-control border border-input-line bg-surface px-4 font-semibold text-ink hover:bg-surface-hover">Buscar</button>
      </form>

      {filas.length === 0 ? (
        <Vacio>
          {estado || sinResponsable || buscar
            ? "Ningún lead coincide con este filtro."
            : "Aún no hay leads. Los que lleguen por el portal aparecerán aquí; también puedes registrar uno a mano."}
        </Vacio>
      ) : (
        <ul className={`${PANEL} divide-y divide-line`}>
          {filas.map((lead) => (
            <li key={lead.id}>
              <Link href={`/leads/${lead.id}`} className="grid gap-x-6 gap-y-1 px-5 py-4 transition-colors hover:bg-surface-hover sm:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.4fr)_auto] sm:items-center">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{lead.contactName ?? "Nombre no disponible"}</span>
                  <span className="block truncate text-sm text-ink-muted">{lead.contactPhone ?? "Sin teléfono"}</span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-ink">{lead.projectName ?? lead.projectInterestText ?? "Sin proyecto indicado"}</span>
                  <span className="block truncate text-sm text-ink-muted">
                    {[lead.operationType ? OPERACION[lead.operationType] : null, lead.sourceName].filter(Boolean).join(", ") || "Origen sin registrar"}
                  </span>
                </span>
                <span className="min-w-0 text-sm">
                  <span className="block truncate text-text">{lead.brokerName ?? "Sin responsable"}</span>
                  <span className="block truncate text-ink-muted">{fechaHora(lead.receivedAt, regional)}</span>
                </span>
                <Etiqueta tono={ESTADO_LEAD[lead.status]!.tono}>{ESTADO_LEAD[lead.status]!.texto}</Etiqueta>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {filas.length === LIMITE_LEADS ? <p className="text-sm text-ink-muted">Se muestran los {LIMITE_LEADS} más recientes. Usa el filtro o la búsqueda para acotar.</p> : null}
    </div>
  );
}

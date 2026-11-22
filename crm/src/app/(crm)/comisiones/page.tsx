import type { Metadata } from "next";
import Link from "next/link";
import type { CommissionStatus } from "@/domain/catalogs";
import { COMMISSION_STATUS_LABELS } from "@/domain/comision-estado";
import { formatoPeriodo, nombreMes, parsearPeriodo } from "@/domain/metas";
import { scopeFor } from "@/domain/rbac";
import { requireActor } from "@/infrastructure/auth/actor";
import { consultarFilas, leerFiltros } from "@/infrastructure/contenedor/comisiones";
import { brokersAsignables } from "@/infrastructure/contenedor/vistas";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { dinero, fechaCorta } from "../_ui/formato";
import { BOTON_SECUNDARIO, CAMPO, Encabezado, Etiqueta, Filtros, PANEL, Vacio, type Tono } from "../_ui/pagina";
import { AccionesDeComision } from "./acciones";

export const metadata: Metadata = { title: "Comisiones" };

const TONO_ESTADO: Record<CommissionStatus, Tono> = { pending: "aviso", approved: "info", paid: "exito", void: "neutro" };
const ORDEN: CommissionStatus[] = ["pending", "approved", "paid", "void"];

type Params = Record<string, string | string[] | undefined>;

/** Arma la URL conservando los filtros actuales y cambiando solo los indicados. */
function urlCon(actual: Params, cambios: Record<string, string | null>): string {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(actual)) {
    const texto = Array.isArray(valor) ? valor[0] : valor;
    if (texto) params.set(clave, texto);
  }
  for (const [clave, valor] of Object.entries(cambios)) {
    if (valor === null) params.delete(clave);
    else params.set(clave, valor);
  }
  const query = params.toString();
  return query ? `/comisiones?${query}` : "/comisiones";
}

export default async function Comisiones({ searchParams }: { searchParams: Promise<Params> }) {
  const actor = await requireActor();
  const alcance = requireScopeInPage(actor, "commissions", "view");
  const params = await searchParams;
  const filtros = leerFiltros(params);
  const regional = empresa();
  const ahora = new Date();
  const esteMes = parsearPeriodo(undefined, ahora);
  const anterior = esteMes.month === 1 ? { year: esteMes.year - 1, month: 12 } : { year: esteMes.year, month: esteMes.month - 1 };

  // Una sola lectura: los totales ignoran el filtro de estado y la tabla lo aplica.
  const [todas, brokers] = await Promise.all([
    consultarFilas(actor, alcance, { ...filtros, estado: "todos" }),
    alcance === "own" ? Promise.resolve([]) : brokersAsignables(actor, alcance),
  ]);
  const filas = filtros.estado === "todos" ? todas : todas.filter((fila) => fila.status === filtros.estado);

  const propio = alcance === "own";
  const montoDe = (fila: (typeof todas)[number]) => (propio ? fila.brokerAmountCents : fila.totalCommissionCents);
  // Los totales se separan por moneda: nunca se suman dólares con pesos.
  const totales = new Map<string, Record<CommissionStatus, number>>();
  for (const fila of todas) {
    const porEstado = totales.get(fila.currency) ?? { pending: 0, approved: 0, paid: 0, void: 0 };
    porEstado[fila.status] += montoDe(fila);
    totales.set(fila.currency, porEstado);
  }
  const conteo = (estado: CommissionStatus) => todas.filter((fila) => fila.status === estado).length;

  const alcanceEdicion = actor.readOnly ? "none" : scopeFor(actor, "commissions", "edit");
  const puedeExportar = scopeFor(actor, "commissions", "export") !== "none";
  const periodoTexto = filtros.periodo ? `${nombreMes(filtros.periodo.month)} ${filtros.periodo.year}` : "Todos los meses";
  const periodoActual = filtros.periodo ? formatoPeriodo(filtros.periodo) : "todos";
  const exportar = new URLSearchParams({ periodo: periodoActual, estado: filtros.estado, ...(filtros.brokerId ? { broker: String(filtros.brokerId) } : {}) });

  return (
    <div className="space-y-6">
      <Encabezado titulo="Comisiones" detalle={`${periodoTexto}. ${propio ? "Lo que te corresponde de cada cierre." : "Comisión total de cada cierre y su reparto."}`}>
        {puedeExportar && todas.length > 0 ? <a href={`/api/comisiones/export?${exportar}`} className={BOTON_SECUNDARIO}>Descargar CSV</a> : null}
      </Encabezado>

      <Filtros etiqueta="Periodo" opciones={[
        { ruta: urlCon(params, { periodo: null }), texto: "Este mes", activa: periodoActual === formatoPeriodo(esteMes) },
        { ruta: urlCon(params, { periodo: formatoPeriodo(anterior) }), texto: "Mes anterior", activa: periodoActual === formatoPeriodo(anterior) },
        { ruta: urlCon(params, { periodo: "todos" }), texto: "Todos los meses", activa: periodoActual === "todos" },
      ]} />

      <section aria-label="Totales del periodo" className="grid gap-3 sm:grid-cols-3">
        {(["pending", "approved", "paid"] as const).map((estado) => (
          <div key={estado} className={`${PANEL} px-5 py-4`}>
            <p className="text-sm text-ink-muted">{estado === "pending" ? "Por aprobar" : estado === "approved" ? "Aprobado, por pagar" : "Pagado"}</p>
            {totales.size === 0 ? <p className="cifra mt-1 text-2xl font-semibold text-ink">{dinero(0, regional.monedaPrincipal, regional.idioma)}</p> : (
              [...totales.entries()].map(([moneda, porEstado]) => (
                <p key={moneda} className="cifra mt-1 text-2xl font-semibold text-ink">{dinero(porEstado[estado], moneda, regional.idioma)}</p>
              ))
            )}
            <p className="mt-1 text-sm text-ink-muted">{conteo(estado)} {conteo(estado) === 1 ? "comisión" : "comisiones"}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <Filtros etiqueta="Estado de la comisión" opciones={[
          { ruta: urlCon(params, { estado: null }), texto: "Todas", cantidad: todas.length, activa: filtros.estado === "todos" },
          ...ORDEN.map((estado) => ({ ruta: urlCon(params, { estado }), texto: COMMISSION_STATUS_LABELS[estado], cantidad: conteo(estado), activa: filtros.estado === estado })),
        ]} />
        {brokers.length > 0 ? (
          <form action="/comisiones" className="flex items-end gap-2">
            {filtros.periodo ? <input type="hidden" name="periodo" value={periodoActual} /> : <input type="hidden" name="periodo" value="todos" />}
            {filtros.estado !== "todos" ? <input type="hidden" name="estado" value={filtros.estado} /> : null}
            <label className="block text-sm font-medium text-ink">Broker
              <select name="broker" defaultValue={filtros.brokerId ?? ""} className={`${CAMPO} min-w-48`}>
                <option value="">Todos</option>
                {brokers.map((broker) => <option key={broker.id} value={broker.id}>{broker.nombre}</option>)}
              </select>
            </label>
            <button type="submit" className={BOTON_SECUNDARIO}>Filtrar</button>
          </form>
        ) : null}
      </div>

      {filas.length === 0 ? (
        <Vacio>
          {todas.length === 0
            ? <>No hay comisiones en {periodoTexto.toLowerCase()}. Se generan solas cuando un negocio pasa a <strong>Cierre</strong> con monto y porcentaje de comisión. {periodoActual !== "todos" ? <Link href={urlCon(params, { periodo: "todos" })} className="font-medium text-brand-900 underline underline-offset-2">Ver todos los meses</Link> : null}</>
            : "No hay comisiones con ese estado en este periodo."}
        </Vacio>
      ) : (
        <ul className={`${PANEL} divide-y divide-line`}>
          {filas.map((fila) => {
            const puedeEditar = alcanceEdicion !== "none" && (alcanceEdicion !== "own" || fila.brokerId === actor.userId);
            return (
              <li key={fila.id} className="grid gap-x-6 gap-y-3 px-5 py-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/negocios/${fila.dealId}`} className="font-medium text-ink underline-offset-2 hover:underline">{fila.contactName}</Link>
                    <Etiqueta tono={TONO_ESTADO[fila.status]}>{COMMISSION_STATUS_LABELS[fila.status]}</Etiqueta>
                  </div>
                  <p className="text-sm text-ink-muted">
                    {[fila.projectName, propio ? null : fila.brokerName ?? "Sin broker", `cerrado ${fechaCorta(fila.closedDate, regional)}`].filter(Boolean).join(", ")}
                  </p>
                </div>
                <dl className="grid grid-cols-3 gap-3 text-sm">
                  <div><dt className="text-ink-muted">Venta</dt><dd className="cifra text-ink">{dinero(fila.saleAmountCents, fila.currency, regional.idioma)}</dd></div>
                  <div><dt className="text-ink-muted">Comisión {(fila.commissionBasisPoints / 100).toLocaleString(regional.idioma)} %</dt><dd className="cifra font-semibold text-ink">{dinero(fila.totalCommissionCents, fila.currency, regional.idioma)}</dd></div>
                  <div>
                    <dt className="text-ink-muted">{propio ? "Tu parte" : `Broker ${(fila.brokerShareBasisPoints / 100).toLocaleString(regional.idioma)} %`}</dt>
                    <dd className="cifra text-ink">{dinero(fila.brokerAmountCents, fila.currency, regional.idioma)}</dd>
                  </div>
                </dl>
                {puedeEditar ? <AccionesDeComision id={fila.id} estado={fila.status} repartoBroker={fila.brokerShareBasisPoints} /> : <span />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

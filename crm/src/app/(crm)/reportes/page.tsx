import type { Metadata } from "next";
import type { ReactNode } from "react";
import { consultarReportesBi } from "@/application/reportes/consultas";
import { resolverFiltros } from "@/application/reportes/filtros";
import { requireActor } from "@/infrastructure/auth/actor";
import { reportesRepositorio } from "@/infrastructure/contenedor/reportes";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { dinero } from "../_ui/formato";
import { Encabezado, Filtros, PANEL, Vacio } from "../_ui/pagina";

export const metadata: Metadata = { title: "Reportes" };

/** El motor de reportes agrega solo montos en dólares; se dice en pantalla para no mezclar monedas. */
const MONEDA_REPORTES = "USD";

const ESTADO_INVENTARIO: Record<string, string> = { available: "Disponibles", reserved: "Reservadas", sold: "Vendidas", blocked: "Bloqueadas", unavailable: "No disponibles" };

/** Días en enteros; menos de un día se dice así, no como fracción. */
function dias(valor: number | null): string {
  if (valor === null) return "Sin dato";
  return valor < 1 ? "menos de 1 día" : `${Math.round(valor)} ${Math.round(valor) === 1 ? "día" : "días"}`;
}

function Bloque({ titulo, detalle, children, ancho = false }: { titulo: string; detalle?: string; children: ReactNode; ancho?: boolean }) {
  const id = `reporte-${titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className={`${PANEL} min-w-0 px-5 py-5 ${ancho ? "lg:col-span-2" : ""}`}>
      <h2 id={id} className="text-lg font-semibold">{titulo}</h2>
      {detalle ? <p className="text-sm text-ink-muted">{detalle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Barra horizontal con su etiqueta y su cifra escritas: el largo solo acompaña. */
function Barra({ etiqueta, valor, porcentaje, detalle }: { etiqueta: string; valor: string; porcentaje: number; detalle?: string }) {
  return (
    <li className="grid gap-1">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="min-w-0 truncate font-medium text-ink">{etiqueta}</span>
        <span className="cifra shrink-0 text-text">{valor}{detalle ? <span className="text-ink-muted"> · {detalle}</span> : null}</span>
      </div>
      <div className="h-2.5 rounded-full bg-brand-100" aria-hidden="true">
        <div className="h-full rounded-full bg-brand-900" style={{ width: `${Math.max(porcentaje > 0 ? 2 : 0, Math.min(100, porcentaje))}%` }} />
      </div>
    </li>
  );
}

function Cifra({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota?: string }) {
  return (
    <div className={`${PANEL} px-5 py-4`}>
      <p className="text-sm text-ink-muted">{etiqueta}</p>
      <p className="cifra mt-1 text-2xl font-semibold text-ink">{valor}</p>
      {nota ? <p className="mt-1 text-sm text-ink-muted">{nota}</p> : null}
    </div>
  );
}

export default async function Reportes({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireActor();
  const alcance = requireScopeInPage(actor, "reports", "view");
  const { periodo, filtros } = resolverFiltros(await searchParams);
  const datos = await consultarReportesBi(reportesRepositorio(), actor, alcance, filtros);
  const { idioma } = empresa();
  const usd = (centavos: number) => dinero(centavos, MONEDA_REPORTES, idioma);
  const numero = (valor: number) => valor.toLocaleString(idioma);
  const ganados = datos.trend.reduce((suma, punto) => suma + punto.won, 0);
  const vendido = datos.trend.reduce((suma, punto) => suma + punto.revenueCents, 0);
  const picoTendencia = Math.max(1, ...datos.trend.map((punto) => punto.leads));
  const maxPerdida = Math.max(1, ...datos.lossReasons.map((motivo) => motivo.count));
  const maxBroker = Math.max(1, ...datos.brokers.map((broker) => broker.volumeCents));
  const totalInventario = datos.inventory.reduce((suma, fila) => suma + fila.count, 0);
  const sinDatos = datos.totalLeads === 0 && datos.totalDeals === 0;
  const textoPeriodo = periodo === "90d" ? "Últimos 90 días" : periodo === "ano" ? "Este año" : "Todo el historial";

  return (
    <div className="space-y-6">
      <Encabezado titulo="Reportes"
        detalle={`${textoPeriodo}. ${alcance === "all" ? "Toda la compañía" : alcance === "team" ? "Tu equipo" : "Tu cartera"}. Montos en dólares.`} />

      <Filtros etiqueta="Periodo del reporte" opciones={[
        { ruta: "/reportes", texto: "Todo", activa: periodo === "todo" },
        { ruta: "/reportes?periodo=ano", texto: "Este año", activa: periodo === "ano" },
        { ruta: "/reportes?periodo=90d", texto: "Últimos 90 días", activa: periodo === "90d" },
      ]} />

      {sinDatos ? (
        <Vacio>No hay leads ni negocios en este periodo. Los reportes se llenan solos a medida que entran leads del portal y avanzan los negocios.</Vacio>
      ) : (
        <>
          <section aria-label="Resumen" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Cifra etiqueta="Leads recibidos" valor={numero(datos.totalLeads)} />
            <Cifra etiqueta="Negocios abiertos en el periodo" valor={numero(datos.totalDeals)} />
            <Cifra etiqueta="Cierres ganados" valor={numero(ganados)} nota={`${usd(vendido)} vendidos`} />
            <Cifra etiqueta="Negocios abiertos, ponderado" valor={usd(datos.projection.totalWeightedCents)}
              nota={datos.projection.missingAmountCount + datos.projection.missingProbabilityCount > 0
                ? `${datos.projection.missingAmountCount} sin monto y ${datos.projection.missingProbabilityCount} sin probabilidad`
                : "Monto por probabilidad de cada negocio abierto"} />
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <Bloque titulo="Embudo de ventas" detalle="Cuántos negocios llegaron a cada etapa y qué parte pasó desde la anterior">
              {datos.funnel.length === 0 ? <Vacio>Aún no hay negocios en el embudo.</Vacio> : (
                <ol className="space-y-3">
                  {datos.funnel.map((etapa) => (
                    <Barra key={etapa.stageId} etiqueta={etapa.label} valor={numero(etapa.reachedCount)} porcentaje={etapa.widthPercent}
                      detalle={etapa.passRatePercent !== null ? `${etapa.passRatePercent} % pasó` : undefined} />
                  ))}
                </ol>
              )}
            </Bloque>

            <Bloque titulo="De dónde llegan los leads" detalle="Leads por fuente y cuántos terminaron en venta">
              {datos.sources.length === 0 ? <Vacio>Sin leads en el periodo.</Vacio> : (
                <ul className="space-y-3">
                  {datos.sources.map((fuente) => (
                    <Barra key={fuente.sourceId ?? "sin-fuente"} etiqueta={fuente.source} valor={`${numero(fuente.count)} (${fuente.percentage} %)`}
                      porcentaje={fuente.percentage} detalle={fuente.won > 0 ? `${fuente.won} ${fuente.won === 1 ? "venta" : "ventas"}` : undefined} />
                  ))}
                </ul>
              )}
            </Bloque>

            <Bloque titulo="Leads por mes" detalle="Entradas de los últimos 18 meses, con los cierres ganados" ancho>
              {datos.trend.length === 0 ? <Vacio>Sin movimiento en los últimos meses.</Vacio> : (
                <>
                  <div className="flex h-40 items-end gap-1 sm:gap-1.5" aria-hidden="true">
                    {datos.trend.map((punto) => (
                      <div key={punto.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end" title={`${punto.month}: ${punto.leads} leads, ${punto.won} ganados`}>
                        <div className="w-full rounded-t bg-brand-900" style={{ height: `${(punto.leads / picoTendencia) * 100}%`, minHeight: punto.leads > 0 ? 3 : 0 }} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1 flex gap-1 text-xs text-ink-muted sm:gap-1.5" aria-hidden="true">
                    {datos.trend.map((punto, indice) => (
                      <span key={punto.month} className={`min-w-0 flex-1 text-center ${indice % 3 === 0 ? "" : "invisible sm:visible"}`}>{punto.month.slice(5)}</span>
                    ))}
                  </div>
                  <table className="sr-only">
                    <caption>Leads, negocios y ganados por mes</caption>
                    <thead><tr><th scope="col">Mes</th><th scope="col">Leads</th><th scope="col">Negocios</th><th scope="col">Ganados</th></tr></thead>
                    <tbody>{datos.trend.map((punto) => <tr key={punto.month}><th scope="row">{punto.month}</th><td>{punto.leads}</td><td>{punto.deals}</td><td>{punto.won}</td></tr>)}</tbody>
                  </table>
                </>
              )}
            </Bloque>

            <Bloque titulo="Rendimiento por broker" detalle="Leads asignados, negocios, ventas y conversión" ancho>
              {datos.brokers.length === 0 ? <Vacio>Ningún broker tiene leads o negocios en el periodo.</Vacio> : (
                <div className="-mx-5 overflow-x-auto">
                  <table className="w-full min-w-[36rem] text-left text-sm">
                    <thead className="border-b border-line text-ink-muted">
                      <tr>
                        <th scope="col" className="px-5 py-2 font-medium">Broker</th>
                        <th scope="col" className="px-3 py-2 font-medium">Leads</th>
                        <th scope="col" className="px-3 py-2 font-medium">Negocios</th>
                        <th scope="col" className="px-3 py-2 font-medium">Ganados</th>
                        <th scope="col" className="px-3 py-2 font-medium">Conversión</th>
                        <th scope="col" className="px-5 py-2 font-medium">Vendido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {datos.brokers.map((broker) => (
                        <tr key={broker.brokerId ?? "sin-broker"}>
                          <th scope="row" className="px-5 py-2.5 font-medium text-ink">{broker.name}</th>
                          <td className="cifra px-3 py-2.5">{numero(broker.leads)}</td>
                          <td className="cifra px-3 py-2.5">{numero(broker.deals)}</td>
                          <td className="cifra px-3 py-2.5">{numero(broker.won)}</td>
                          <td className="cifra px-3 py-2.5">{broker.conversionPercent !== null ? `${broker.conversionPercent} %` : "Sin leads"}</td>
                          <td className="px-5 py-2.5">
                            <span className="cifra block">{usd(broker.volumeCents)}</span>
                            <span className="mt-1 block h-1.5 rounded-full bg-brand-100" aria-hidden="true">
                              <span className="block h-full rounded-full bg-accent-600" style={{ width: `${(broker.volumeCents / maxBroker) * 100}%` }} />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Bloque>

            <Bloque titulo="Por qué se pierden" detalle="Motivos registrados al marcar un negocio como perdido">
              {datos.lossReasons.length === 0 ? <Vacio>No hay negocios perdidos en el periodo.</Vacio> : (
                <ul className="space-y-3">
                  {datos.lossReasons.map((motivo) => (
                    <Barra key={motivo.reasonId ?? "sin-motivo"} etiqueta={motivo.label} valor={numero(motivo.count)} porcentaje={(motivo.count / maxPerdida) * 100} />
                  ))}
                </ul>
              )}
            </Bloque>

            <Bloque titulo="Zonas de interés" detalle="Dónde buscan los leads">
              {datos.zones.length === 0 ? <Vacio>Los leads del periodo no indicaron zona.</Vacio> : (
                <ul className="space-y-3">
                  {datos.zones.slice(0, 8).map((zona) => (
                    <Barra key={zona.zoneId ?? "sin-zona"} etiqueta={zona.label} valor={`${numero(zona.count)} (${zona.percentage} %)`} porcentaje={zona.percentage} />
                  ))}
                </ul>
              )}
            </Bloque>

            <Bloque titulo="Inventario" detalle={`${numero(totalInventario)} unidades y cuánto llevan en ese estado`}>
              {datos.inventory.length === 0 ? <Vacio>No hay unidades cargadas.</Vacio> : (
                <ul className="space-y-3">
                  {datos.inventory.map((fila) => (
                    <Barra key={fila.state} etiqueta={ESTADO_INVENTARIO[fila.state] ?? "Otro estado"} valor={numero(fila.count)}
                      porcentaje={totalInventario ? (fila.count / totalInventario) * 100 : 0}
                      detalle={fila.medianAgeDays !== null ? `mediana ${dias(fila.medianAgeDays)}` : undefined} />
                  ))}
                </ul>
              )}
            </Bloque>

            <Bloque titulo="Velocidad de cierre" detalle="Días desde que se abre un negocio hasta que se gana">
              {datos.velocity.sampleSize === 0 ? <Vacio>Todavía no hay cierres ganados para medirla.</Vacio> : (
                <dl className="grid gap-4 sm:grid-cols-3">
                  <div><dt className="text-sm text-ink-muted">Mediana</dt><dd className="cifra text-2xl font-semibold">{dias(datos.velocity.medianDays)}</dd></div>
                  <div><dt className="text-sm text-ink-muted">3 de cada 4 cierran en</dt><dd className="cifra text-2xl font-semibold">{dias(datos.velocity.p75Days)}</dd></div>
                  <div><dt className="text-sm text-ink-muted">Cierres medidos</dt><dd className="cifra text-2xl font-semibold">{datos.velocity.sampleSize}</dd></div>
                </dl>
              )}
            </Bloque>

            <Bloque titulo="Comisiones por mes" detalle="Generadas, parte del broker y parte de la agencia (sin anuladas)" ancho>
              {datos.commissions.length === 0 ? <Vacio>No hay comisiones en el periodo.</Vacio> : (
                <div className="-mx-5 overflow-x-auto">
                  <table className="w-full min-w-[32rem] text-left text-sm">
                    <thead className="border-b border-line text-ink-muted">
                      <tr>
                        <th scope="col" className="px-5 py-2 font-medium">Mes</th>
                        <th scope="col" className="px-3 py-2 font-medium">Cantidad</th>
                        <th scope="col" className="px-3 py-2 font-medium">Total</th>
                        <th scope="col" className="px-3 py-2 font-medium">Brokers</th>
                        <th scope="col" className="px-3 py-2 font-medium">Agencia</th>
                        <th scope="col" className="px-5 py-2 font-medium">Pagado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {datos.commissions.map((fila) => (
                        <tr key={fila.month ?? "sin-mes"}>
                          <th scope="row" className="px-5 py-2.5 font-medium text-ink">{fila.month ?? "Sin fecha"}</th>
                          <td className="cifra px-3 py-2.5">{fila.count}</td>
                          <td className="cifra px-3 py-2.5">{usd(fila.totalCents)}</td>
                          <td className="cifra px-3 py-2.5">{usd(fila.brokerCents)}</td>
                          <td className="cifra px-3 py-2.5">{usd(fila.agencyCents)}</td>
                          <td className="cifra px-5 py-2.5">{usd(fila.paidCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Bloque>
          </div>
        </>
      )}
    </div>
  );
}

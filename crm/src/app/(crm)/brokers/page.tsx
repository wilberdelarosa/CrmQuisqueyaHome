import type { Metadata } from "next";
import Link from "next/link";
import { camposNegocios } from "@/application/pipeline/consultas";
import { nombreMes, parsearPeriodo } from "@/domain/metas";
import { reaches, scopeFor } from "@/domain/rbac";
import { requireActor } from "@/infrastructure/auth/actor";
import { proyectosAsignables, resumenBrokers } from "@/infrastructure/contenedor/vistas";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { dinero } from "../_ui/formato";
import { Encabezado, Etiqueta, PANEL, Vacio } from "../_ui/pagina";
import { AsignarProyectos } from "./acciones";

export const metadata: Metadata = { title: "Brokers" };

/** «senior_plus» → «Senior plus»: el nivel es un código del catálogo, se muestra legible. */
function nivelLegible(nivel: string): string {
  const texto = nivel.replace(/[_-]+/g, " ").trim();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function Medidor({ valor, meta, etiqueta }: { valor: number; meta: number; etiqueta: string }) {
  const porcentaje = meta > 0 ? Math.round((valor / meta) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink-muted">{etiqueta}</span>
        <span className="cifra shrink-0 whitespace-nowrap font-semibold text-ink">{porcentaje} %</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-brand-100" role="progressbar" aria-label={etiqueta} aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${porcentaje >= 100 ? "bg-success" : "bg-brand-900"}`} style={{ width: `${Math.min(100, porcentaje)}%` }} />
      </div>
    </div>
  );
}

export default async function Brokers() {
  const actor = await requireActor();
  const alcance = requireScopeInPage(actor, "brokers", "view");
  const regional = empresa();
  const periodo = parsearPeriodo(undefined, new Date());
  const puedeAsignar = !actor.readOnly && scopeFor(actor, "projects", "edit") === "all";
  const alcanceProyectos = scopeFor(actor, "projects", "view");
  // Montos con la misma regla que el monto de un negocio; metas con su propio permiso y alcance.
  const verMontos = camposNegocios(actor).monto;
  const alcanceMetas = scopeFor(actor, "goals", "view");
  const [brokers, proyectos] = await Promise.all([
    resumenBrokers(actor, alcance, regional.monedaPrincipal, regional.zonaHoraria, periodo.year, periodo.month),
    puedeAsignar ? proyectosAsignables() : Promise.resolve([]),
  ]);
  const mes = nombreMes(periodo.month).toLowerCase();
  const sinProyectos = proyectos.filter((proyecto) => proyecto.brokerId === null).length;
  const totales = brokers.reduce((suma, broker) => ({
    leads: suma.leads + broker.leadsAbiertos, negocios: suma.negocios + broker.negociosAbiertos, ganados: suma.ganados + broker.ganadosMes, vendido: suma.vendido + broker.vendidoMesCents,
  }), { leads: 0, negocios: 0, ganados: 0, vendido: 0 });

  return (
    <div className="space-y-6">
      <Encabezado titulo={alcance === "own" ? "Tu ficha de broker" : "Brokers"}
        detalle={alcance === "own" ? `Tu carga de trabajo y tu avance de ${mes}` : `${brokers.length} ${brokers.length === 1 ? "broker activo" : "brokers activos"}. Carga de trabajo y avance de ${mes}.`} />

      {alcance !== "own" && brokers.length > 0 ? (
        <section aria-label="Totales de la red" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Leads abiertos", totales.leads.toLocaleString(regional.idioma)],
            ["Negocios abiertos", totales.negocios.toLocaleString(regional.idioma)],
            [`Cierres en ${mes}`, totales.ganados.toLocaleString(regional.idioma)],
            ...(verMontos ? [[`Vendido en ${mes}`, dinero(totales.vendido, regional.monedaPrincipal, regional.idioma)]] : []),
          ].map(([etiqueta, valor]) => (
            <div key={etiqueta} className={`${PANEL} px-5 py-4`}>
              <p className="text-sm text-ink-muted">{etiqueta}</p>
              <p className="cifra mt-1 text-2xl font-semibold text-ink">{valor}</p>
            </div>
          ))}
        </section>
      ) : null}

      {puedeAsignar && sinProyectos > 0 ? (
        <p className={`${PANEL} border-warning/40 bg-warning-bg px-5 py-3 text-text`}>
          {sinProyectos} {sinProyectos === 1 ? "proyecto no tiene" : "proyectos no tienen"} broker responsable. Asígnalos para que su equipo y su gerente los vean.
        </p>
      ) : null}

      {brokers.length === 0 ? (
        <Vacio>{alcance === "own" ? "Tu usuario no tiene perfil de broker." : "No hay brokers activos. Crea usuarios con el tipo Broker desde Configuración."}</Vacio>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {brokers.map((broker) => (
            <li key={broker.id} className={`${PANEL} flex flex-col gap-4 px-5 py-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-ink">{broker.nombre}</h2>
                  <p className="truncate text-sm text-ink-muted">{[broker.equipos ?? "Sin equipo", broker.agencia, broker.especialidad].filter(Boolean).join(" · ")}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {broker.nivel ? <Etiqueta>{nivelLegible(broker.nivel)}</Etiqueta> : null}
                  {broker.alquileres ? <Etiqueta tono="info">Alquileres</Etiqueta> : null}
                  {broker.leadsSinContactar > 0 ? <Etiqueta tono="aviso">{broker.leadsSinContactar} sin contactar</Etiqueta> : null}
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div><dt className="text-ink-muted">Leads abiertos</dt><dd className="cifra text-lg font-semibold text-ink">{broker.leadsAbiertos}</dd></div>
                <div><dt className="text-ink-muted">Negocios abiertos</dt><dd className="cifra text-lg font-semibold text-ink">{broker.negociosAbiertos}</dd></div>
                {verMontos ? <div><dt className="text-ink-muted">En negocios abiertos</dt><dd className="cifra text-lg font-semibold text-ink">{dinero(broker.pipelineCents, regional.monedaPrincipal, regional.idioma)}</dd></div> : null}
                <div><dt className="text-ink-muted">Cierres en {mes}</dt><dd className="cifra text-lg font-semibold text-ink">{broker.ganadosMes}</dd></div>
              </dl>

              {!reaches(actor, alcanceMetas, broker.id) ? null : broker.metaCierres !== null || broker.metaMontoCents !== null ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {broker.metaCierres ? <Medidor etiqueta={`Meta: ${broker.ganadosMes} de ${broker.metaCierres} cierres`} valor={broker.ganadosMes} meta={broker.metaCierres} /> : null}
                  {broker.metaMontoCents && verMontos ? <Medidor etiqueta={`Meta: ${dinero(broker.vendidoMesCents, regional.monedaPrincipal, regional.idioma)} de ${dinero(broker.metaMontoCents, regional.monedaPrincipal, regional.idioma)}`} valor={broker.vendidoMesCents} meta={broker.metaMontoCents} /> : null}
                </div>
              ) : (
                <p className="text-sm text-ink-muted">Sin meta fijada para {mes}. <Link href="/metas" className="font-medium text-brand-900 underline underline-offset-2">Ir a Metas</Link></p>
              )}

              {reaches(actor, alcanceProyectos, broker.id) ? (
                <div className="border-t border-line pt-3">
                  <p className="text-sm text-ink-muted">Proyectos a cargo</p>
                  <p className="text-text">{broker.proyectos.length ? broker.proyectos.map((proyecto) => proyecto.nombre).join(", ") : "Ninguno"}</p>
                  {puedeAsignar ? <AsignarProyectos brokerId={broker.id} nombre={broker.nombre} proyectos={proyectos} asignados={broker.proyectos.map((proyecto) => proyecto.id)} /> : null}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 text-sm">
                <Link href={`/leads?broker=${broker.id}`} className="font-medium text-brand-900 underline underline-offset-2">Ver sus leads</Link>
                <Link href={`/negocios?broker=${broker.id}`} className="font-medium text-brand-900 underline underline-offset-2">Ver sus negocios</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

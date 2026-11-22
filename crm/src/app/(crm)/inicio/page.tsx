import type { Metadata } from "next";
import { consultarDashboard } from "@/application/dashboard/consultas";
import { ETIQUETAS_ESTADO } from "@/application/leads/presentacion";
import { parsearPeriodo } from "@/domain/metas";
import { fechaSantoDomingo } from "@/domain/zona-horaria";
import { requireActor } from "@/infrastructure/auth/actor";
import { dashboardRepositorio } from "@/infrastructure/contenedor/dashboard";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { RitmoDeMeta } from "./ritmo-de-meta";

export const metadata: Metadata = { title: "Inicio" };

function saludoSegunHora(hora: number): string {
  if (hora < 12) return "Buenos días";
  return hora < 19 ? "Buenas tardes" : "Buenas noches";
}

export default async function Inicio() {
  const actor = await requireActor();
  const alcance = requireScopeInPage(actor, "dashboard", "view");
  const ahora = new Date();
  const { idioma, zonaHoraria } = empresa();
  const metricas = await consultarDashboard(dashboardRepositorio(), actor, alcance, {}, ahora);

  const hora = Number(new Intl.DateTimeFormat("en-GB", { timeZone: zonaHoraria, hour: "2-digit", hour12: false }).format(ahora));
  const cuando = new Intl.DateTimeFormat(idioma, { timeZone: zonaHoraria, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  // La barra de cada etapa es proporcional a los negocios que están hoy en ella.
  const mayorEtapa = Math.max(1, ...metricas.funnel.map((etapa) => etapa.count));
  const cifras = [
    { etiqueta: "Citas hoy", valor: String(metricas.citasHoyCount) },
    { etiqueta: "Tareas pendientes", valor: String(metricas.tareasPendientesCount) },
    { etiqueta: "Negocios activos", valor: String(metricas.negociosActivosCount) },
    { etiqueta: "En negociación", valor: metricas.volumenPipelineDisplay },
    { etiqueta: "Leads sin responsable", valor: String(metricas.leadsSinAsignarCount) },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <header>
        <h1 className="text-[1.75rem] font-semibold leading-tight sm:text-[2rem]">
          {saludoSegunHora(hora)}{metricas.saludoNombre ? `, ${metricas.saludoNombre}` : ""}
        </h1>
        <p className="mt-1 text-ink-muted">{metricas.fechaTexto}</p>
      </header>

      <RitmoDeMeta meta={metricas.meta} alcance={metricas.metaAlcance} periodo={parsearPeriodo(undefined, ahora)} hoy={fechaSantoDomingo(ahora)} />

      <section aria-label="Tu día en cifras">
        <dl className="grid grid-cols-2 overflow-hidden rounded-panel border border-line bg-surface sm:grid-cols-3 lg:grid-cols-5">
          {cifras.map((cifra) => (
            <div key={cifra.etiqueta} className="-mb-px -mr-px flex flex-col-reverse border-b border-r border-line px-5 py-4 last:col-span-2 sm:last:col-span-1">
              <dt className="mt-1 text-sm text-ink-muted">{cifra.etiqueta}</dt>
              <dd className="cifra truncate text-2xl font-semibold text-ink">{cifra.valor}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="titulo-agenda" className="min-w-0">
          <h2 id="titulo-agenda" className="text-lg font-semibold">Próximas citas y tareas</h2>
          {metricas.activities.length === 0 ? (
            <p className="mt-3 rounded-panel border border-dashed border-input-line px-5 py-6 text-text">
              No tienes citas ni tareas con fecha próxima.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-panel border border-line bg-surface">
              {metricas.activities.map((actividad) => (
                <li key={actividad.id} className="flex flex-col gap-0.5 px-5 py-3.5 sm:flex-row sm:items-baseline sm:gap-5">
                  <time dateTime={actividad.startsAt} className="cifra shrink-0 whitespace-nowrap text-sm font-medium text-brand-900 sm:w-44">
                    {cuando.format(new Date(actividad.startsAt))}
                  </time>
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">{actividad.title}</span>
                    {actividad.location ? <span className="block text-sm text-ink-muted">{actividad.location}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="titulo-leads" className="min-w-0">
          <h2 id="titulo-leads" className="text-lg font-semibold">Leads recientes</h2>
          {metricas.leadsRecientes.length === 0 ? (
            <p className="mt-3 rounded-panel border border-dashed border-input-line px-5 py-6 text-text">
              Aún no han llegado leads. Los que entren por el portal aparecerán aquí.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-panel border border-line bg-surface">
              {metricas.leadsRecientes.map((lead) => (
                <li key={lead.id} className="px-5 py-3.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="min-w-0 truncate font-medium text-ink">{lead.name}</span>
                    <span className="shrink-0 rounded-full bg-brand-100 px-2.5 py-0.5 text-sm text-brand-900">{ETIQUETAS_ESTADO[lead.stage as keyof typeof ETIQUETAS_ESTADO] ?? lead.stage}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-ink-muted">
                    {lead.project}{lead.source ? `, por ${lead.source}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:gap-8">
        <section aria-labelledby="titulo-embudo" className="min-w-0">
          <h2 id="titulo-embudo" className="text-lg font-semibold">Negocios por etapa</h2>
          {metricas.funnel.length === 0 ? (
            <p className="mt-3 rounded-panel border border-dashed border-input-line px-5 py-6 text-text">Todavía no hay negocios en este periodo.</p>
          ) : (
            <ol className="mt-3 space-y-2.5 rounded-panel border border-line bg-surface px-5 py-5">
              {metricas.funnel.map((etapa) => (
                <li key={etapa.stageId} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 sm:grid-cols-[9rem_1fr_2.5rem]">
                  <span className="truncate text-sm text-text">{etapa.label}</span>
                  <span className="h-2.5 rounded-full bg-brand-100">
                    <span className={`block h-full rounded-full ${etapa.kind === "won" ? "bg-accent-600" : etapa.kind === "lost" ? "bg-ink-muted/50" : "bg-brand-700"}`}
                      style={{ width: `${etapa.count > 0 ? Math.max(4, Math.round((etapa.count / mayorEtapa) * 100)) : 0}%` }} />
                  </span>
                  <span className="cifra text-right font-semibold text-ink">{etapa.count}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="titulo-proyectos" className="min-w-0">
          <h2 id="titulo-proyectos" className="text-lg font-semibold">Proyectos con más leads</h2>
          {metricas.projects.length === 0 ? (
            <p className="mt-3 rounded-panel border border-dashed border-input-line px-5 py-6 text-text">Ningún lead está vinculado todavía a un proyecto.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-panel border border-line bg-surface">
              {metricas.projects.map((proyecto) => (
                <li key={proyecto.id} className="flex items-baseline justify-between gap-4 px-5 py-3">
                  <span className="min-w-0 truncate text-ink">{proyecto.name}</span>
                  <span className="cifra shrink-0 font-semibold text-ink">{proyecto.leads}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

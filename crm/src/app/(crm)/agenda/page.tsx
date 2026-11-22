import type { Metadata } from "next";
import Link from "next/link";
import { fechaSantoDomingo, medianocheSantoDomingo, sumarDias } from "@/domain/zona-horaria";
import { requireActor } from "@/infrastructure/auth/actor";
import { listarActividades } from "@/infrastructure/contenedor/vistas";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { ESTADO_ACTIVIDAD, TIPO_ACTIVIDAD } from "../_ui/formato";
import { Encabezado, Etiqueta, Filtros, PANEL, Vacio } from "../_ui/pagina";

export const metadata: Metadata = { title: "Agenda" };

const DIAS = { semana: 7, quincena: 14, mes: 30 } as const;

export default async function Agenda({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireActor();
  const alcance = requireScopeInPage(actor, "activities", "view");
  const pedido = (await searchParams).rango;
  const rango = (Object.keys(DIAS) as (keyof typeof DIAS)[]).find((valor) => valor === (Array.isArray(pedido) ? pedido[0] : pedido)) ?? "semana";
  const hoy = fechaSantoDomingo(new Date());
  const desde = medianocheSantoDomingo(hoy);
  const hasta = medianocheSantoDomingo(sumarDias(hoy, DIAS[rango]));
  const actividades = await listarActividades(actor, alcance, { tipo: "agenda", desde, hasta });
  const { idioma, zonaHoraria } = empresa();
  const dia = new Intl.DateTimeFormat(idioma, { timeZone: zonaHoraria, weekday: "long", day: "numeric", month: "long" });
  const hora = new Intl.DateTimeFormat(idioma, { timeZone: zonaHoraria, hour: "numeric", minute: "2-digit" });

  const porDia = new Map<string, typeof actividades>();
  for (const actividad of actividades) {
    const clave = fechaSantoDomingo(new Date(actividad.startsAt!));
    porDia.set(clave, [...(porDia.get(clave) ?? []), actividad]);
  }

  return (
    <div className="space-y-6">
      <Encabezado titulo="Agenda" detalle={`${actividades.length} ${actividades.length === 1 ? "actividad programada" : "actividades programadas"}`} />

      <Filtros etiqueta="Rango de fechas" opciones={[
        { ruta: "/agenda", texto: "7 días", activa: rango === "semana" },
        { ruta: "/agenda?rango=quincena", texto: "14 días", activa: rango === "quincena" },
        { ruta: "/agenda?rango=mes", texto: "30 días", activa: rango === "mes" },
      ]} />

      {actividades.length === 0 ? (
        <Vacio>No hay citas ni tareas con fecha en este rango. Se agendan desde la ficha de un lead o de un negocio, o en Tareas.</Vacio>
      ) : (
        <ol className="space-y-6">
          {[...porDia.entries()].map(([clave, lista]) => (
            <li key={clave}>
              <h2 className="text-base font-semibold first-letter:uppercase">
                {clave === hoy ? "Hoy, " : ""}{dia.format(new Date(lista[0]!.startsAt!))}
              </h2>
              <ul className={`${PANEL} mt-2 divide-y divide-line`}>
                {lista.map((actividad) => (
                  <li key={actividad.id} className="flex flex-wrap items-baseline gap-x-5 gap-y-1 px-5 py-3.5">
                    <time dateTime={new Date(actividad.startsAt!).toISOString()} className="cifra w-24 shrink-0 font-semibold text-brand-900">
                      {hora.format(new Date(actividad.startsAt!))}
                    </time>
                    <span className="min-w-0 flex-1 basis-56">
                      <span className="block font-medium text-ink">{actividad.title}</span>
                      <span className="block text-sm text-ink-muted">
                        {[TIPO_ACTIVIDAD[actividad.activityType], actividad.contactName, actividad.location, actividad.assigneeId !== actor.userId ? actividad.assigneeName : null].filter(Boolean).join(", ")}
                      </span>
                      {actividad.dealId ? <Link href={`/negocios/${actividad.dealId}`} className="text-sm font-medium text-brand-900 underline underline-offset-2">Ver el negocio</Link> : null}
                    </span>
                    <Etiqueta tono={ESTADO_ACTIVIDAD[actividad.status]?.tono}>{ESTADO_ACTIVIDAD[actividad.status]?.texto ?? actividad.status}</Etiqueta>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

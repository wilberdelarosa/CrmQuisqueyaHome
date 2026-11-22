import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { can, scopeFor } from "@/domain/rbac";
import { requireActor } from "@/infrastructure/auth/actor";
import { brokersAsignables, fichaLead } from "@/infrastructure/contenedor/vistas";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { dinero, ESTADO_ACTIVIDAD, ESTADO_LEAD, fechaHora, OPERACION, TIPO_ACTIVIDAD } from "../../_ui/formato";
import { Dato, Encabezado, Etiqueta, PANEL, Vacio } from "../../_ui/pagina";
import { AccionesDeLead } from "./acciones";

export const metadata: Metadata = { title: "Lead" };

export default async function FichaDeLead({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireActor();
  const alcance = requireScopeInPage(actor, "leads", "view");
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id <= 0 || id > 2147483647) notFound();
  const lead = await fichaLead(actor, alcance, id);
  if (!lead) notFound();

  const regional = empresa();
  const abierto = lead.status !== "converted" && lead.status !== "discarded";
  const alcanceEdicion = scopeFor(actor, "leads", "edit");
  const esSuyo = lead.brokerId === actor.userId;
  const puedeAsignar = !actor.readOnly && (alcanceEdicion === "all" || (alcanceEdicion === "team" && actor.roleSlug === "manager"));
  const brokers = puedeAsignar ? await brokersAsignables(actor, alcanceEdicion === "all" ? "all" : "team") : [];
  const estado = ESTADO_LEAD[lead.status]!;
  const presupuesto = lead.budgetMinCents != null || lead.budgetMaxCents != null
    ? [lead.budgetMinCents, lead.budgetMaxCents].filter((valor) => valor != null).map((valor) => dinero(valor, lead.currency, regional.idioma)).join(" a ")
    : "Sin indicar";

  return (
    <div className="space-y-6">
      <Encabezado titulo={lead.contactName ?? "Nombre no disponible"} volver={{ ruta: "/leads", texto: "Leads" }}
        detalle={`Llegó ${fechaHora(lead.receivedAt, regional)}${lead.sourceName ? ` por ${lead.sourceName}` : ""}`}>
        <Etiqueta tono={estado.tono}>{estado.texto}</Etiqueta>
      </Encabezado>

      <AccionesDeLead leadId={lead.id} contactId={lead.contactId} abierto={abierto} sinResponsable={lead.brokerId === null}
        brokers={brokers} brokerActual={lead.brokerId}
        puede={{
          tomar: actor.roleSlug === "broker" && alcanceEdicion !== "none" && !actor.readOnly,
          asignar: puedeAsignar,
          editar: alcanceEdicion !== "none" && (alcanceEdicion !== "own" || esSuyo),
          convertir: alcanceEdicion !== "none" && can(actor, "deals", "create") && (alcanceEdicion !== "own" || esSuyo),
          actividad: can(actor, "activities", "create") && (esSuyo || alcanceEdicion !== "own"),
        }} />

      {lead.convertedDealId ? (
        <p className={`${PANEL} px-5 py-4`}>
          Este lead ya es un negocio. <Link href={`/negocios/${lead.convertedDealId}`} className="font-medium text-brand-900 underline underline-offset-2">Abrir el negocio</Link>
        </p>
      ) : null}
      {lead.status === "discarded" && lead.discardReason ? <p className={`${PANEL} px-5 py-4`}>Descartado: {lead.discardReason}</p> : null}

      <dl className={`${PANEL} grid gap-x-8 gap-y-5 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3`}>
        <Dato etiqueta="Teléfono">{lead.contactPhone ?? "Sin teléfono"}</Dato>
        <Dato etiqueta="Correo">{lead.contactEmail ?? "Sin correo"}</Dato>
        <Dato etiqueta="Responsable">{lead.brokerName ?? "Sin responsable"}</Dato>
        <Dato etiqueta="Proyecto de interés">
          {lead.projectName ?? lead.projectInterestText ?? "Sin indicar"}
          {!lead.projectName && lead.projectInterestText ? <span className="block text-sm text-ink-muted">Sin vincular a un proyecto del catálogo</span> : null}
        </Dato>
        <Dato etiqueta="Operación">{lead.operationType ? OPERACION[lead.operationType] : "Sin indicar"}</Dato>
        <Dato etiqueta="Presupuesto">{presupuesto}</Dato>
        {lead.originalMessage ? <div className="sm:col-span-2 lg:col-span-3"><Dato etiqueta="Lo que escribió">{lead.originalMessage}</Dato></div> : null}
      </dl>

      <section aria-labelledby="titulo-historial">
        <h2 id="titulo-historial" className="text-lg font-semibold">Seguimiento</h2>
        {lead.actividades.length === 0 ? (
          <div className="mt-3"><Vacio>Todavía no hay llamadas, tareas ni citas registradas con esta persona.</Vacio></div>
        ) : (
          <ul className={`${PANEL} mt-3 divide-y divide-line`}>
            {lead.actividades.map((actividad) => (
              <li key={actividad.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3.5">
                <span className="min-w-0">
                  <span className="block font-medium text-ink">{actividad.title}</span>
                  <span className="block text-sm text-ink-muted">
                    {TIPO_ACTIVIDAD[actividad.activityType] ?? "Actividad"}, {fechaHora(actividad.startsAt ?? actividad.completedAt ?? actividad.createdAt, regional)}
                  </span>
                </span>
                <Etiqueta tono={ESTADO_ACTIVIDAD[actividad.status]?.tono}>{ESTADO_ACTIVIDAD[actividad.status]?.texto ?? actividad.status}</Etiqueta>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

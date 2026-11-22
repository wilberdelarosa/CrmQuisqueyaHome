/**
 * Lecturas de Leads para las pantallas (lista, cola y ficha). Siempre con el alcance del actor.
 *
 * La cola (#47): un broker con edición de leads ve, además de los suyos, los leads abiertos sin
 * responsable para poder tomarlos. Es la única ampliación de lectura y la vigila `s3-flujos.test.ts`.
 */

import { and, desc, eq, ilike, isNull, or, sql, type SQL } from "drizzle-orm";
import { LEAD_STATUSES } from "../../../domain/catalogs";
import { scopeFor, type Actor, type PermissionScope } from "../../../domain/rbac";
import { getDb } from "../client";
import { activities, contacts, leadSources, leads, projects, users } from "../schema";
import { visibleRows } from "../../rbac-filter";

export type EstadoLead = (typeof LEAD_STATUSES)[number];
export type FiltrosLeads = { estado?: EstadoLead; buscar?: string; sinResponsable?: boolean };
export type FilaLead = {
  id: number; status: EstadoLead; receivedAt: Date; projectInterestText: string | null; projectName: string | null;
  sourceName: string | null; brokerId: number | null; brokerName: string | null; contactName: string | null;
  contactPhone: string | null; contactEmail: string | null; operationType: "sale" | "rent" | null;
};
export const LIMITE_LEADS = 100;

/** Lo que el actor puede leer: su alcance y, si es broker con edición, la cola sin responsable. */
function leadsVisibles(actor: Actor, scope: PermissionScope): SQL | undefined {
  const verCola = actor.roleSlug === "broker" && scopeFor(actor,"leads","edit") !== "none";
  const disponibilidad = verCola
    ? and(visibleRows(actor,"all",leads.brokerId,leads.deletedAt), isNull(leads.brokerId), or(eq(leads.status,"new"),eq(leads.status,"assigned")))
    : undefined;
  return disponibilidad ? or(visibleRows(actor, scope, leads.brokerId, leads.deletedAt), disponibilidad) : visibleRows(actor, scope, leads.brokerId, leads.deletedAt);
}

/** El contacto es legible si está vivo y es alcanzable, o si el lead es propio o está en la cola. */
function contactoVisible(actor: Actor): SQL {
  const alcance = scopeFor(actor, "contacts", "view");
  return and(
    isNull(contacts.deletedAt),
    or(
      alcance === "none" ? sql`false` : visibleRows(actor, alcance, contacts.brokerId) ?? sql`true`,
      eq(leads.brokerId, actor.userId),
      isNull(leads.brokerId),
    ),
  )!;
}

/** El nombre, el teléfono y el correo solo viajan si el contacto es legible. */
function datosDeContacto(actor: Actor) {
  const visible = contactoVisible(actor);
  return {
    contactName: sql<string | null>`case when ${visible} then ${contacts.fullName} end`,
    contactPhone: sql<string | null>`case when ${visible} then ${contacts.phoneDisplay} end`,
    contactEmail: sql<string | null>`case when ${visible} then ${contacts.email} end`,
  };
}

const columnas = (actor: Actor) => ({
  id: leads.id, status: leads.status, receivedAt: leads.receivedAt, projectInterestText: leads.projectInterestText,
  projectName: projects.name, sourceName: leadSources.name, brokerId: leads.brokerId, brokerName: users.fullName,
  operationType: leads.operationType, ...datosDeContacto(actor),
});

export async function listarLeads(actor: Actor, scope: PermissionScope, filtros: FiltrosLeads = {}): Promise<{ filas: FilaLead[]; porEstado: Record<string, number>; total: number }> {
  const db = getDb();
  const visibles = leadsVisibles(actor, scope);
  const buscar = filtros.buscar?.trim();
  const condicion = and(
    visibles,
    filtros.estado ? eq(leads.status, filtros.estado) : undefined,
    filtros.sinResponsable ? isNull(leads.brokerId) : undefined,
    // Solo se busca por nombre en contactos legibles: buscar no puede revelar un nombre oculto.
    buscar ? or(and(contactoVisible(actor), ilike(contacts.fullName, `%${buscar}%`)), ilike(leads.projectInterestText, `%${buscar}%`)) : undefined,
  );
  const [filas, conteos] = await Promise.all([
    db.select(columnas(actor)).from(leads)
      .innerJoin(contacts, eq(contacts.id, leads.contactId))
      .leftJoin(projects, eq(projects.id, leads.projectId))
      .leftJoin(leadSources, eq(leadSources.id, leads.sourceId))
      .leftJoin(users, eq(users.id, leads.brokerId))
      .where(condicion).orderBy(desc(leads.receivedAt), desc(leads.id)).limit(LIMITE_LEADS),
    db.select({ status: leads.status, cantidad: sql<number>`count(*)::int` }).from(leads).where(visibles).groupBy(leads.status),
  ]);
  const porEstado = Object.fromEntries(conteos.map((fila) => [fila.status, fila.cantidad]));
  return { filas: filas as FilaLead[], porEstado, total: conteos.reduce((suma, fila) => suma + fila.cantidad, 0) };
}

export type FichaLead = FilaLead & {
  contactId: number; originalMessage: string | null; budgetMinCents: number | null;
  budgetMaxCents: number | null; currency: string; discardReason: string | null; convertedDealId: number | null;
  actividades: { id: number; activityType: string; title: string; status: string; startsAt: Date | null; completedAt: Date | null; createdAt: Date }[];
};

export async function fichaLead(actor: Actor, scope: PermissionScope, id: number): Promise<FichaLead | undefined> {
  const db = getDb();
  const [fila] = await db.select({
    ...columnas(actor), contactId: leads.contactId, originalMessage: leads.originalMessage, budgetMinCents: leads.budgetMinCents,
    budgetMaxCents: leads.budgetMaxCents, currency: leads.currency, discardReason: leads.discardReason, convertedDealId: leads.convertedDealId,
  }).from(leads)
    .innerJoin(contacts, eq(contacts.id, leads.contactId))
    .leftJoin(projects, eq(projects.id, leads.projectId))
    .leftJoin(leadSources, eq(leadSources.id, leads.sourceId))
    .leftJoin(users, eq(users.id, leads.brokerId))
    .where(and(eq(leads.id, id), leadsVisibles(actor, scope))).limit(1);
  if (!fila) return undefined;
  const alcanceActividades = scopeFor(actor, "activities", "view");
  const actividades = alcanceActividades === "none" ? [] : await db.select({
    id: activities.id, activityType: activities.activityType, title: activities.title, status: activities.status,
    startsAt: activities.startsAt, completedAt: activities.completedAt, createdAt: activities.createdAt,
  }).from(activities)
    .where(and(
      visibleRows(actor, alcanceActividades, activities.assigneeId, activities.deletedAt),
      or(eq(activities.contactId, fila.contactId), fila.convertedDealId ? eq(activities.dealId, fila.convertedDealId) : undefined),
    )).orderBy(desc(activities.createdAt)).limit(30);
  return { ...(fila as Omit<FichaLead, "actividades">), actividades };
}

/**
 * Brokers activos con perfil a los que el actor puede dirigir una acción, según el alcance concedido
 * para esa acción: todo, su equipo o solo él mismo. Nunca devuelve brokers fuera de ese alcance.
 */
export async function brokersAsignables(actor: Actor, alcance: PermissionScope): Promise<{ id: number; nombre: string }[]> {
  if (alcance === "none" || actor.readOnly) return [];
  const filas = await getDb().execute<{ id: number; nombre: string }>(sql`
    select u.id, u.full_name as nombre from users u join broker_profiles b on b.user_id = u.id
    where u.is_active and u.deleted_at is null order by u.full_name`);
  const permitidos = alcance === "all" ? null
    : new Set(alcance === "team" ? [actor.userId, ...(actor.teamUserIds ?? [])] : [actor.userId]);
  return [...filas].filter((fila) => !permitidos || permitidos.has(fila.id));
}

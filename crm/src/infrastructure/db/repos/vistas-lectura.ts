/**
 * Lecturas para las pantallas de Propiedades, Tareas/Agenda y Metas. Siempre con el alcance del
 * actor (`visibleRows`); los precios reales pasan por `stripRestrictedPrices`.
 */

import { and, asc, desc, eq, gte, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { scopeFor, stripRestrictedPrices, type Actor, type PermissionScope } from "../../../domain/rbac";
import { getDb } from "../client";
import { activities, contacts, deals, goals, projects, units, users } from "../schema";
import { visibleRows } from "../../rbac-filter";

/* ------------------------------ Propiedades ------------------------------ */

export type FilaProyecto = {
  id: number; name: string; zone: string | null; developer: string | null; projectType: string; currency: string;
  publicRangeMinCents: number | null; publicRangeMaxCents: number | null; estimatedDeliveryDate: string | null;
  progressPercent: number | null; disponibles: number; reservadas: number; vendidas: number; total: number;
};

export async function listarProyectos(actor: Actor, scope: PermissionScope): Promise<FilaProyecto[]> {
  // Los conteos solo incluyen unidades al alcance del actor; sin acceso a unidades, cero.
  const alcanceUnidades = scopeFor(actor, "units", "view");
  const unidadesVisibles = alcanceUnidades === "none" ? sql`false` : visibleRows(actor, alcanceUnidades, units.brokerId, units.deletedAt) ?? sql`true`;
  const conteo = (estado: string) => sql<number>`count(${units.id}) filter (where ${units.status} = ${estado} and ${units.deletedAt} is null)::int`;
  return getDb().select({
    id: projects.id, name: projects.name, zone: projects.zone, developer: projects.developer, projectType: projects.projectType,
    currency: projects.currency, publicRangeMinCents: projects.publicRangeMinCents, publicRangeMaxCents: projects.publicRangeMaxCents,
    estimatedDeliveryDate: projects.estimatedDeliveryDate, progressPercent: projects.progressPercent,
    disponibles: conteo("available"), reservadas: conteo("reserved"), vendidas: conteo("sold"),
    total: sql<number>`count(${units.id}) filter (where ${units.deletedAt} is null)::int`,
  }).from(projects).leftJoin(units, and(eq(units.projectId, projects.id), unidadesVisibles))
    .where(visibleRows(actor, scope, projects.brokerId, projects.deletedAt))
    .groupBy(projects.id).orderBy(asc(projects.name));
}

export type FilaUnidad = {
  id: number; code: string; unitType: string | null; bedrooms: number | null; bathrooms: number | null; tower: string | null;
  floorLevel: number | null; status: string; currency: string; publicRangeMinCents: number | null; publicRangeMaxCents: number | null;
  realPriceCents: number | null;
};

export async function fichaProyecto(actor: Actor, scope: PermissionScope, id: number): Promise<{ proyecto: FilaProyecto & { description: string | null }; unidades: FilaUnidad[] } | undefined> {
  const [proyecto] = (await listarProyectos(actor, scope)).filter((fila) => fila.id === id);
  if (!proyecto) return undefined;
  const db = getDb();
  const alcanceUnidades = scopeFor(actor, "units", "view");
  const [[detalle], unidades] = await Promise.all([
    db.select({ description: projects.description }).from(projects).where(eq(projects.id, id)).limit(1),
    alcanceUnidades === "none" ? Promise.resolve([]) : db.select({
      id: units.id, code: units.code, unitType: units.unitType, bedrooms: units.bedrooms, bathrooms: units.bathrooms, tower: units.tower,
      floorLevel: units.floorLevel, status: units.status, currency: units.currency, publicRangeMinCents: units.publicRangeMinCents,
      publicRangeMaxCents: units.publicRangeMaxCents, realPriceCents: units.realPriceCents,
    }).from(units).where(and(eq(units.projectId, id), visibleRows(actor, alcanceUnidades, units.brokerId, units.deletedAt)))
      .orderBy(asc(units.code)).limit(600),
  ]);
  return { proyecto: { ...proyecto, description: detalle?.description ?? null }, unidades: unidades.map((unidad) => stripRestrictedPrices(actor, unidad)) as FilaUnidad[] };
}

/* ---------------------------- Tareas y Agenda ---------------------------- */

export type FilaActividad = {
  id: number; activityType: string; title: string; status: string; priority: string | null; startsAt: Date | null; endsAt: Date | null;
  location: string | null; assigneeId: number | null; assigneeName: string | null; contactId: number | null; contactName: string | null;
  dealId: number | null; completedAt: Date | null;
};

export type FiltroActividades = { tipo: "tareas" | "agenda"; estado?: "pending" | "completed"; desde?: Date; hasta?: Date };

/** Tareas: las de tipo tarea. Agenda: lo que tiene fecha (citas, llamadas y tareas programadas). */
export async function listarActividades(actor: Actor, scope: PermissionScope, filtro: FiltroActividades): Promise<FilaActividad[]> {
  const alcanceContactos = scopeFor(actor, "contacts", "view");
  const contactoVisible = and(isNull(contacts.deletedAt), alcanceContactos === "none" ? sql`false` : visibleRows(actor, alcanceContactos, contacts.brokerId) ?? sql`true`);
  return getDb().select({
    id: activities.id, activityType: activities.activityType, title: activities.title, status: activities.status, priority: activities.priority,
    startsAt: activities.startsAt, endsAt: activities.endsAt, location: activities.location, assigneeId: activities.assigneeId,
    assigneeName: users.fullName, contactId: sql<number | null>`case when ${contactoVisible} then ${contacts.id} end`,
    contactName: sql<string | null>`case when ${contactoVisible} then ${contacts.fullName} end`,
    dealId: activities.dealId, completedAt: activities.completedAt,
  }).from(activities)
    .leftJoin(users, eq(users.id, activities.assigneeId))
    .leftJoin(deals, eq(deals.id, activities.dealId))
    .leftJoin(contacts, sql`${contacts.id} = coalesce(${activities.contactId}, ${deals.contactId})`)
    .where(and(
      visibleRows(actor, scope, activities.assigneeId, activities.deletedAt),
      filtro.tipo === "tareas" ? eq(activities.activityType, "task") : isNotNull(activities.startsAt),
      filtro.estado ? eq(activities.status, filtro.estado) : undefined,
      filtro.desde ? gte(activities.startsAt, filtro.desde) : undefined,
      filtro.hasta ? lt(activities.startsAt, filtro.hasta) : undefined,
    ))
    .orderBy(filtro.tipo === "agenda" ? asc(activities.startsAt) : sql`${activities.status} = 'pending' desc, ${activities.startsAt} asc nulls last, ${activities.id} desc`)
    .limit(200) as Promise<FilaActividad[]>;
}

/* --------------------------------- Metas --------------------------------- */

export type MetaFila = { brokerId: number | null; nombre: string | null; targetDeals: number; achievedDeals: number; targetAmountCents: number | null; achievedAmountCents: number; currency: string };

/** Metas del mes visibles para el actor: la de compañía solo con alcance total y sin vista restringida. */
export async function metasDelPeriodo(actor: Actor, scope: PermissionScope, year: number, month: number): Promise<{ compania: MetaFila | null; brokers: MetaFila[] }> {
  const filas = await getDb().select({
    brokerId: goals.brokerId, nombre: users.fullName, targetDeals: goals.targetDeals, achievedDeals: goals.achievedDeals,
    targetAmountCents: goals.targetAmountCents, achievedAmountCents: goals.achievedAmountCents, currency: goals.currency,
  }).from(goals).leftJoin(users, eq(users.id, goals.brokerId))
    .where(and(
      eq(goals.year, year), eq(goals.month, month),
      scope === "all" && !actor.visibilityOwnerIds
        ? or(isNull(goals.brokerId), visibleRows(actor, scope, goals.brokerId) ?? sql`true`)
        : and(isNotNull(goals.brokerId), visibleRows(actor, scope, goals.brokerId)),
    )).orderBy(desc(goals.achievedDeals), asc(users.fullName));
  return { compania: (filas.find((fila) => fila.brokerId === null) as MetaFila | undefined) ?? null, brokers: filas.filter((fila) => fila.brokerId !== null) as MetaFila[] };
}

/* --------------------------- Liga de metas (gráficos) --------------------------- */

export type DatosDeLiga = {
  metas: { periodo: string; meta_colectiva: number }[];
  equipo: { broker: string; meta_personal: number | null }[];
  ventas: { fecha: string; broker: string; monto: number }[];
};

/**
 * Datos del tablero de metas, en unidades de la moneda (no centavos) y solo de esa moneda.
 * Con alcance total la meta colectiva es la de la compañía; con equipo o propio, la suma de las
 * metas de los brokers visibles. Los cierres son negocios ganados, con fecha civil de la zona.
 */
export async function datosDeLiga(actor: Actor, scope: PermissionScope, moneda: string, zona: string, year: number, month: number): Promise<DatosDeLiga> {
  const db = getDb();
  const total = scope === "all" && !actor.visibilityOwnerIds;
  const visibles = and(isNotNull(goals.brokerId), visibleRows(actor, scope, goals.brokerId));
  const alcanceNegocios = scopeFor(actor, "deals", "view");
  const [filasMetas, filasEquipo, filasVentas] = await Promise.all([
    db.select({ year: goals.year, month: goals.month, monto: sql<number>`coalesce(sum(${goals.targetAmountCents}), 0)::float8 / 100` })
      .from(goals).where(and(eq(goals.currency, moneda), eq(goals.year, year), total ? isNull(goals.brokerId) : visibles))
      .groupBy(goals.year, goals.month),
    db.select({ broker: users.fullName, monto: goals.targetAmountCents })
      .from(goals).innerJoin(users, eq(users.id, goals.brokerId))
      .where(and(eq(goals.year, year), eq(goals.month, month), eq(goals.currency, moneda), visibles)).orderBy(asc(users.fullName)),
    alcanceNegocios === "none" ? Promise.resolve([]) : db.execute<{ fecha: string; broker: string; monto: number }>(sql`
      select to_char(deals.closed_at at time zone ${zona}, 'YYYY-MM-DD') as fecha, u.full_name as broker, deals.amount_cents::float8 / 100 as monto
      from deals join pipeline_stages s on s.id = deals.stage_id join users u on u.id = deals.broker_id
      where s.kind = 'won' and deals.closed_at is not null and deals.amount_cents is not null and deals.currency = ${moneda}
        and extract(year from deals.closed_at at time zone ${zona}) = ${year}
        and ${visibleRows(actor, alcanceNegocios, deals.brokerId, deals.deletedAt) ?? sql`true`}
      order by deals.closed_at`).then((filas) => [...filas]),
  ]);
  return {
    metas: filasMetas.map((fila) => ({ periodo: `${fila.year}-${String(fila.month).padStart(2, "0")}`, meta_colectiva: Number(fila.monto) })),
    equipo: filasEquipo.map((fila) => ({ broker: fila.broker, meta_personal: fila.monto == null ? null : Number(fila.monto) / 100 })),
    ventas: filasVentas.map((fila) => ({ fecha: fila.fecha, broker: fila.broker, monto: Number(fila.monto) })),
  };
}

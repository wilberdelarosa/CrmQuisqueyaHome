/**
 * Lecturas para las pantallas de Propiedades, Tareas/Agenda y Metas. Siempre con el alcance del
 * actor (`visibleRows`); los precios reales pasan por `stripRestrictedPrices`.
 */

import { and, asc, desc, eq, gte, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { reaches, scopeFor, stripRestrictedPrices, type Actor, type PermissionScope } from "../../../domain/rbac";
import { getDb } from "../client";
import { activities, contacts, dealProperties, deals, goals, holdUnits, holds, projects, reservationUnits, reservations, units, users } from "../schema";
import { visibleHolds, visibleReservas, visibleRows } from "../../rbac-filter";

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

/* -------------------------------- Brokers -------------------------------- */

export type FilaBroker = {
  id: number; nombre: string; correo: string; nivel: string | null; especialidad: string | null; alquileres: boolean;
  agencia: string | null; equipos: string | null; leadsAbiertos: number; leadsSinContactar: number; negociosAbiertos: number;
  pipelineCents: number; ganadosMes: number; vendidoMesCents: number; metaCierres: number | null; metaMontoCents: number | null;
  proyectos: { id: number; nombre: string }[];
};

/**
 * Tablero de la red: cada broker visible con su carga y su mes. El alcance decide quiénes aparecen
 * (own: uno mismo; team: su equipo; all: todos). Los montos solo suman la moneda principal.
 */
export async function resumenBrokers(actor: Actor, scope: PermissionScope, moneda: string, zona: string, year: number, month: number): Promise<FilaBroker[]> {
  if (scope === "none") return [];
  const permitidos = scope === "all" ? null : scope === "team" ? [actor.userId, ...(actor.teamUserIds ?? [])] : [actor.userId];
  const filtro = permitidos ? sql`and u.id in (${sql.join(permitidos.map((id) => sql`${id}`), sql`, `)})` : sql``;
  const filas = await getDb().execute<Omit<FilaBroker, "proyectos"> & { proyectos: { id: number; nombre: string }[] | null }>(sql`
    select u.id, u.full_name as nombre, u.email as correo, b.level as nivel, b.specialty as especialidad, b.handles_rentals as alquileres,
      a.name as agencia,
      (select string_agg(t.name, ', ' order by t.name) from teams t
        where t.is_active and (t.leader_id = u.id or exists (select 1 from team_members m where m.team_id = t.id and m.user_id = u.id))) as equipos,
      (select count(*)::int from leads l where l.broker_id = u.id and l.deleted_at is null and l.status in ('new','assigned','contacted')) as "leadsAbiertos",
      (select count(*)::int from leads l where l.broker_id = u.id and l.deleted_at is null and l.status in ('new','assigned')) as "leadsSinContactar",
      (select count(*)::int from deals d join pipeline_stages s on s.id = d.stage_id where d.broker_id = u.id and d.deleted_at is null and s.kind = 'open') as "negociosAbiertos",
      (select coalesce(sum(d.amount_cents), 0)::float8 from deals d join pipeline_stages s on s.id = d.stage_id
        where d.broker_id = u.id and d.deleted_at is null and s.kind = 'open' and d.currency = ${moneda}) as "pipelineCents",
      (select count(*)::int from deals d join pipeline_stages s on s.id = d.stage_id
        where d.broker_id = u.id and d.deleted_at is null and s.kind = 'won'
          and to_char(d.closed_at at time zone ${zona}, 'YYYY-MM') = ${`${year}-${String(month).padStart(2, "0")}`}) as "ganadosMes",
      (select coalesce(sum(d.amount_cents), 0)::float8 from deals d join pipeline_stages s on s.id = d.stage_id
        where d.broker_id = u.id and d.deleted_at is null and s.kind = 'won' and d.currency = ${moneda}
          and to_char(d.closed_at at time zone ${zona}, 'YYYY-MM') = ${`${year}-${String(month).padStart(2, "0")}`}) as "vendidoMesCents",
      g.target_deals as "metaCierres", g.target_amount_cents::float8 as "metaMontoCents",
      (select json_agg(json_build_object('id', p.id, 'nombre', p.name) order by p.name) from projects p
        where p.broker_id = u.id and p.deleted_at is null and p.is_active) as proyectos
    from users u
    join broker_profiles b on b.user_id = u.id
    left join agencies a on a.id = b.agency_id
    left join goals g on g.broker_id = u.id and g.year = ${year} and g.month = ${month}
    where u.is_active and u.deleted_at is null ${filtro}
    order by u.full_name`);
  // `reaches` aplica además la visibilidad restringida de «ver como»: nunca más de lo que el actor alcanza.
  return [...filas].filter((fila) => reaches(actor, scope, fila.id)).map((fila) => ({ ...fila, proyectos: fila.proyectos ?? [] }));
}

/** Proyectos activos que se pueden asignar a un broker (solo para quien tiene alcance completo sobre proyectos). */
export async function proyectosAsignables(): Promise<{ id: number; nombre: string; brokerId: number | null }[]> {
  return getDb().select({ id: projects.id, nombre: projects.name, brokerId: projects.brokerId }).from(projects)
    .where(and(eq(projects.isActive, true), isNull(projects.deletedAt))).orderBy(asc(projects.name));
}

/* ------------------------- Apartados y reservas -------------------------- */

export type FilaApartado = {
  id: number; dealId: number; status: string; expiresAt: Date; rowVersion: number; extensionCount: number; reason: string;
  contacto: string | null; titular: string | null; brokerId: number | null; unidades: string | null; totalCents: number; moneda: string | null;
};
export type FilaReserva = {
  id: number; publicId: string; dealId: number; status: string; currency: string; totalCents: number; depositRequiredCents: number;
  expiresAt: Date | null; confirmedAt: Date | null; contacto: string | null; unidades: string | null;
};

/** Apartados (holds) y reservas que el actor alcanza por su negocio, los activos primero. */
export async function apartadosYReservas(actor: Actor, alcanceApartados: PermissionScope, alcanceReservas: PermissionScope): Promise<{ apartados: FilaApartado[]; reservas: FilaReserva[] }> {
  const db = getDb();
  const [apartados, reservas] = await Promise.all([
    alcanceApartados === "none" ? Promise.resolve([]) : db.select({
      id: holds.id, dealId: holds.dealId, status: holds.status, expiresAt: holds.expiresAt, rowVersion: holds.rowVersion,
      extensionCount: holds.extensionCount, reason: holds.reason, contacto: contacts.fullName, titular: users.fullName, brokerId: deals.brokerId,
      unidades: sql<string | null>`(select string_agg(hu.unit_code_normalized, ', ' order by hu.id) from ${holdUnits} hu where hu.hold_id = ${holds.id})`,
      totalCents: sql<number>`(select coalesce(sum(hu.price_cents), 0)::float8 from ${holdUnits} hu where hu.hold_id = ${holds.id})`,
      moneda: sql<string | null>`(select min(hu.currency) from ${holdUnits} hu where hu.hold_id = ${holds.id})`,
    }).from(holds).innerJoin(deals, eq(deals.id, holds.dealId)).leftJoin(contacts, eq(contacts.id, deals.contactId))
      .leftJoin(users, eq(users.id, holds.holderId))
      .where(and(visibleHolds(actor, alcanceApartados), isNull(deals.deletedAt)))
      .orderBy(sql`case when ${holds.status} = 'activo' and ${holds.expiresAt} > now() then 0 else 1 end`, desc(holds.createdAt)).limit(200),
    alcanceReservas === "none" ? Promise.resolve([]) : db.select({
      id: reservations.id, publicId: reservations.publicId, dealId: reservations.dealId, status: reservations.status, currency: reservations.currency,
      totalCents: sql<number>`${reservations.totalCents}::float8`, depositRequiredCents: sql<number>`${reservations.depositRequiredCents}::float8`,
      expiresAt: reservations.expiresAt, confirmedAt: reservations.confirmedAt, contacto: contacts.fullName,
      unidades: sql<string | null>`(select string_agg(ru.unit_code_normalized, ', ' order by ru.id) from ${reservationUnits} ru where ru.reservation_id = ${reservations.id} and ru.released_at is null)`,
    }).from(reservations).innerJoin(deals, eq(deals.id, reservations.dealId)).leftJoin(contacts, eq(contacts.id, deals.contactId))
      .where(and(visibleReservas(actor, alcanceReservas), isNull(deals.deletedAt))).orderBy(desc(reservations.createdAt)).limit(200),
  ]);
  return { apartados, reservas };
}

/** Unidades disponibles y con precio de las propiedades de interés de un negocio: lo que se puede apartar. */
export async function unidadesApartables(dealId: number): Promise<{ id: number; conPrecio: boolean; apartadaHasta: Date | null }[]> {
  // Solo el id y si ya está apartada: el precio real nunca viaja al navegador (lo pone el servidor al apartar).
  return getDb().select({
    id: units.id,
    conPrecio: sql<boolean>`${units.realPriceCents} is not null`,
    apartadaHasta: sql<Date | null>`(select max(h.expires_at) from ${holdUnits} hu join ${holds} h on h.id = hu.hold_id
      where hu.unit_id = ${units.id} and h.status = 'activo' and h.expires_at > now())`,
  })
    .from(dealProperties).innerJoin(units, eq(units.id, dealProperties.unitId)).innerJoin(projects, eq(projects.id, units.projectId))
    .where(and(eq(dealProperties.dealId, dealId), isNull(dealProperties.deletedAt), eq(units.status, "available"), isNull(units.deletedAt)))
    .orderBy(asc(units.code));
}

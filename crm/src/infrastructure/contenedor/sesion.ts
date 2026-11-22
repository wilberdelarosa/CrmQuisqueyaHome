/**
 * Datos de presentación de quien tiene la sesión abierta (nombre, iniciales y rol), para el armazón.
 * La decisión de permisos nunca sale de aquí: esa es `Actor` (`auth/actor.ts`).
 */

import { and, eq, isNull } from "drizzle-orm";
import type { Actor } from "../../domain/rbac";
import { getDb } from "../db/client";
import { roles, users } from "../db/schema";

export type PerfilDeSesion = { nombre: string; iniciales: string; rol: string };

export async function perfilDeSesion(actor: Actor): Promise<PerfilDeSesion | null> {
  const [fila] = await getDb()
    .select({ nombre: users.fullName, iniciales: users.initials, rol: roles.name })
    .from(users)
    .innerJoin(roles, eq(roles.id, users.roleId))
    .where(eq(users.id, actor.userId))
    .limit(1);
  if (!fila) return null;
  const iniciales = fila.iniciales?.trim()
    || fila.nombre.split(/\s+/).slice(0, 2).map((parte) => parte.charAt(0)).join("").toUpperCase();
  return { nombre: fila.nombre, iniciales, rol: fila.rol };
}

/** Roles con al menos un usuario activo: los que ofrece el acceso de evaluación en desarrollo. */
export async function rolesDeEvaluacion(): Promise<{ slug: string; nombre: string }[]> {
  return getDb()
    .selectDistinct({ slug: roles.slug, nombre: roles.name, id: roles.id })
    .from(roles)
    .innerJoin(users, and(eq(users.roleId, roles.id), eq(users.isActive, true), isNull(users.deletedAt)))
    .orderBy(roles.id)
    .then((filas) => filas.map(({ slug, nombre }) => ({ slug, nombre })));
}

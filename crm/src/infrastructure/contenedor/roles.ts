/** Contenedor de Roles (`docs/R_ANALISIS_Y_PLAN.md` §7 R3.5; decisión #41). */

import { editarPermisos } from "../../application/roles/casos-de-uso";
import { repositorioRoles } from "../db/repos/roles";
import { auditoriaDrizzle, unidadDeTrabajoDrizzle } from "../db/repos/compartido";

export function rolesParaEscritura() {
  return { unidad: unidadDeTrabajoDrizzle((tx) => ({ roles: repositorioRoles(tx), auditoria: auditoriaDrizzle(tx) })) };
}

export { editarPermisos };

/** Lectura de la administración de permisos (usuarios, roles, matriz, excepciones y equipos). */
export { permissionAdminData } from "../db/repos/permisos";

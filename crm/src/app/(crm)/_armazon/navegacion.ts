/**
 * Menú del armazón, derivado del registro de módulos y de los permisos del actor.
 * Regla de certificación: al menú de todos solo llega un módulo certificado. Con la bandera de
 * revisión se añaden los construidos sin certificar y se listan, sin enlace, los que faltan.
 * Una entrada que agrupa varios módulos enlaza al primero disponible, con el nombre de ese módulo.
 */

import { can, type Actor } from "../../../domain/rbac.ts";
import { generarEntradasN1Base, getModuloPorRuta, type EstadoModulo, type ModuloRegistro } from "../../../modules/registry.ts";

export type EntradaDeMenu = {
  id: string;
  ruta: string;
  nombre: string;
  icono: string;
  descripcion: string;
  estado: EstadoModulo;
};

export type Menu = { disponibles: EntradaDeMenu[]; pendientes: EntradaDeMenu[] };

/** Módulos fuera de los grupos principales que también van al menú. */
const RUTAS_ADICIONALES = ["/configuracion"] as const;

export function menuPara(actor: Actor, conRevision: boolean): Menu {
  const menu: Menu = { disponibles: [], pendientes: [] };
  const disponible = (modulo: ModuloRegistro | undefined): modulo is ModuloRegistro =>
    Boolean(modulo) && can(actor, modulo!.recurso, "view") && (modulo!.estado === "certificado" || (modulo!.estado === "en_revision" && conRevision));

  for (const entrada of generarEntradasN1Base()) {
    const modulos = [entrada.ruta, ...(entrada.rutasHijas ?? [])].map(getModuloPorRuta);
    const listos = [...new Set(modulos.filter(disponible))];
    for (const modulo of listos) {
      menu.disponibles.push({
        id: `${entrada.id}:${modulo.id}`, ruta: modulo.rutaBase, nombre: modulo.nombre,
        icono: modulo.icono ?? entrada.icono, descripcion: entrada.descripcion, estado: modulo.estado,
      });
    }
    if (listos.length === 0 && conRevision && can(actor, entrada.recurso, "view")) {
      menu.pendientes.push({ id: entrada.id, ruta: entrada.ruta, nombre: entrada.nombre, icono: entrada.icono, descripcion: entrada.descripcion, estado: "en_construccion" });
    }
  }
  for (const ruta of RUTAS_ADICIONALES) {
    const modulo = getModuloPorRuta(ruta);
    if (disponible(modulo)) {
      menu.disponibles.push({ id: `extra:${modulo.id}`, ruta: modulo.rutaBase, nombre: modulo.nombre, icono: modulo.icono ?? "Settings", descripcion: modulo.nombre, estado: modulo.estado });
    }
  }
  return menu;
}

export { estaActiva } from "./ruta-activa.ts";

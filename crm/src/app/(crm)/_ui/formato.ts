/** Formato de dinero, fechas y etiquetas del negocio. Idioma y zona salen de la empresa. */

import type { Tono } from "./pagina";

export type Regional = { idioma: string; zonaHoraria: string };

export function dinero(centavos: number | null | undefined, moneda: string, idioma: string): string {
  if (centavos == null) return "Sin monto";
  return new Intl.NumberFormat(idioma, { style: "currency", currency: moneda, maximumFractionDigits: 0 }).format(centavos / 100);
}

export function rangoDePrecio(min: number | null, max: number | null, moneda: string, idioma: string): string {
  if (min == null && max == null) return "Precio por confirmar";
  if (min != null && max != null && min !== max) return `${dinero(min, moneda, idioma)} a ${dinero(max, moneda, idioma)}`;
  return dinero(min ?? max, moneda, idioma);
}

export function fechaHora(fecha: Date | string | null, { idioma, zonaHoraria }: Regional): string {
  if (!fecha) return "Sin fecha";
  return new Intl.DateTimeFormat(idioma, { timeZone: zonaHoraria, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(fecha));
}

export function fechaCorta(fecha: Date | string | null, { idioma, zonaHoraria }: Regional): string {
  if (!fecha) return "Sin fecha";
  const valor = typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? new Date(`${fecha}T12:00:00Z`) : new Date(fecha);
  return new Intl.DateTimeFormat(idioma, { timeZone: zonaHoraria, day: "numeric", month: "short", year: "numeric" }).format(valor);
}

export const ESTADO_LEAD: Record<string, { texto: string; tono: Tono }> = {
  new: { texto: "Nuevo", tono: "info" },
  assigned: { texto: "Asignado", tono: "neutro" },
  contacted: { texto: "Contactado", tono: "neutro" },
  converted: { texto: "Convertido", tono: "exito" },
  discarded: { texto: "Descartado", tono: "peligro" },
};

export const TIPO_ACTIVIDAD: Record<string, string> = {
  task: "Tarea", call: "Llamada", meeting: "Cita", note: "Nota", whatsapp: "WhatsApp", email: "Correo",
};

export const ESTADO_ACTIVIDAD: Record<string, { texto: string; tono: Tono }> = {
  pending: { texto: "Pendiente", tono: "aviso" },
  completed: { texto: "Hecha", tono: "exito" },
  cancelled: { texto: "Cancelada", tono: "neutro" },
};

export const ESTADO_UNIDAD: Record<string, { texto: string; tono: Tono }> = {
  available: { texto: "Disponible", tono: "exito" },
  reserved: { texto: "Reservada", tono: "aviso" },
  sold: { texto: "Vendida", tono: "neutro" },
  unavailable: { texto: "No disponible", tono: "peligro" },
};

export const TIPO_PROYECTO: Record<string, string> = {
  blueprint: "En planos", presale: "Preventa", under_construction: "En construcción", delivered: "Entregado", rental: "Alquiler",
};

export const OPERACION: Record<string, string> = { sale: "Venta", rent: "Alquiler" };
export const PRIORIDAD: Record<string, string> = { low: "Baja", normal: "Normal", high: "Alta" };

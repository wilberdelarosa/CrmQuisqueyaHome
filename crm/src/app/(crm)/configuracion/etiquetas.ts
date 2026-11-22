/** Nombres del negocio para recursos, acciones y alcances de la matriz de permisos. */

export const RECURSO: Record<string, string> = {
  dashboard: "Inicio", leads: "Leads", contacts: "Contactos", deals: "Negocios", activities: "Tareas y agenda",
  projects: "Proyectos", units: "Unidades", unit_real_price: "Precio real de unidades", construction_phases: "Avances de obra",
  brokers: "Brokers", academy: "Academy", goals: "Metas", commissions: "Comisiones", communications: "Comunicaciones",
  reports: "Reportes", global_metrics: "Métricas globales", settings: "Configuración", users: "Usuarios", roles: "Roles y permisos",
  audit_log: "Historial de cambios", integrations: "Integraciones", holds: "Apartados", reservations: "Reservas",
  payment_plans: "Planes de pago", payments: "Pagos", reconciliations: "Conciliaciones", refunds: "Devoluciones",
  commission_rules: "Reglas de comisión", commission_entries: "Asientos de comisión", payouts: "Liquidaciones",
};

export const ACCION: Record<string, string> = {
  view: "Ver", create: "Crear", edit: "Editar", delete: "Borrar", import: "Importar", export: "Exportar",
};

export const ALCANCE: Record<string, string> = { none: "Sin acceso", own: "Lo propio", team: "Su equipo", all: "Todo" };

/** Recurso sin etiqueta propia: se muestra legible en vez de con guiones bajos. */
export const nombreDeRecurso = (recurso: string) => RECURSO[recurso] ?? recurso.replaceAll("_", " ").replace(/^./, (letra) => letra.toUpperCase());

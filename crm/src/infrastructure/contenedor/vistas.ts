/**
 * Lecturas que consumen las pantallas. La capa web las toma de aquí, nunca de `db/` directamente
 * (guarda de arquitectura).
 */

export { brokersAsignables, fichaLead, listarLeads, LIMITE_LEADS, type EstadoLead, type FichaLead, type FilaLead, type FiltrosLeads } from "../db/repos/leads-lectura";
export {
  datosDeLiga, fichaProyecto, listarActividades, listarProyectos, metasDelPeriodo,
  type DatosDeLiga, type FilaActividad, type FilaProyecto, type FilaUnidad, type FiltroActividades, type MetaFila,
} from "../db/repos/vistas-lectura";

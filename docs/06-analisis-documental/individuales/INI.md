# INI — Inicio: lectura individual completa

Fuente `VT-CRM-ESP-INI_Inicio_v0.1_2026-11-06.md`, SHA256 `637FD25E816923A1BBCD2C2CA3026A65885658CA360A3017EF19DA758D9C5FFC`; leídas líneas 1–283. Borrador, evidencia estática atribuida a 81ccf08 y capturas históricas; no ejecución actual. ADR Twenty aceptado en fuente no supone adopción actual.

## Funciones y alcance completo

Entrada operativa de lectura: KPI por rol/recurso, leads recientes/sin asignar, cartera/pipeline/cierres, embudo canónico REP, citas hoy/semana, tareas pendientes, metas/Academy/proyectos, cola/enlaces y crear lead mediante módulo destino. Filtros URL compartidos REP y cortes RD día/lunes/mes. Futuro conservado: Mi día (vencidas+citas+SLA), aprobaciones reales, selector visible periodo/broker, comparativa periodo anterior, metas equipo/proyecto, layout por rol, widgets dominio y posible surface Twenty. Fuente:40–85,110–155,211–238.

## Roles, entidades y reglas

Sin tabla propia: agrega LEA/NEG/stages/activities/projects/units/goals/academy/users. Recurso página dashboard:view más permiso de cada recurso; admin all, manager team (0017), broker own, asistente all operativo sin precios internos (seed no verificado), ver-como broker efectivo solo lectura. Meta y academy actuales del actor.userId, no equipo. Inicio no escribe; todo destino reautoriza, leads:create controla CTA. Ocultar sin permiso, nunca mostrar cifra detrás de disabled. Fuente:188–226.

## Eventos/API y comunicaciones

consultarDashboard→repos locales QH y consultarReportesBi para embudo; dashboardQuery/leerFiltros comparten periodo y zona con REP. AGE meetings pending hoy/semana; TAR pending task; MET metas mes actor; LEA leads/status/received/first_contacted; NEG pipeline/cierres; INV disponibilidad no-broker; ACA academy_items/progress; APR solo enlace demo; COMU WA.me actual desde lead, no entrega/mensajería certificada; CFG mostrarDemo/roles/zona; Twenty dashboard shell/lectura objetivo no integrado. Fuente:110–170,213–226.

## Métricas, estados, UX y privacidad

No máquina de negocio propia. Cargando→listo completo/parcial/error, panel vacío, 403, offline preserva UI. Fallo parcial de consulta debe dejar resto (pendiente certificar). Conversión actual cierres del mes/leads del mes son poblaciones distintas, no cohorte; pipeline USD display no FX validado. Citas pending meeting y tareas pending no widget vencidas/SLA completo. Aprobaciones count null, no cero falso. Minimizar nombres/datos en WA.me query; deep-link no prueba consentimiento/opt-out. No rankings globales own/team, no PII en telemetría/PDF. Fuente:93–124,157–172,188–209.

## Contradicciones y preguntas

Fórmula dashboardScopes: página team y recurso team→own, no intersección team esperada; documentar decisión o corregir, sin elevar all. Módulo dice «dentro cola jornada» pero Mi día completo/SLA no operativos. Enlace aprobaciones demo/KPI allowed true no da bandeja real; widgets de metas solo actor y Academy local no prometen agregado equipo/Moodle. Definir KPI canónico/cohortes/moneda/periodo, filtros visibles, degradación y freshness, fuente/alcance por tarjeta; Twenty solo visual o también series, contrato por decidir. Fuente:46,83,108–121,145–170,230–259.

## Aceptación pendiente

Por tarjeta scopes own/team/all/overrides/ver-como, mismo embudo/filtro que REP, cortes RD medianoche/lunes/mes, sin aprobación demo/cero falso, un panel fallido no derriba todos, CTA recurso destino reautoriza, móvil 390/teclado y KPI con fecha/definición. Capturas/test filenames no son resultados ejecutados. Revisión root/Luna pendiente.


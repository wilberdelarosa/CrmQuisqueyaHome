# REP — Reportes: lectura integral

Fuente: `00-fuentes-drive/2026-11-06/originales/modulos/VT-CRM-ESP-REP_Reportes_v0.1_2026-11-06.md`, 199 líneas. SHA256 `1DD6642909080C62A2AFF54475866C658CE904A5FEC5BEC74C942577FE949B7C`. Leído completo, borrador v0.1. F:Lx remite a fuente/línea. Código/BI/candidatos son afirmaciones atribuidas, no prueba runtime ni decisión nueva.

## Alcance y funciones completas

Nueve pestañas /reportes?tab=, filtros desde/hasta/projectId/brokerId, ventana de 18 meses RD, asOf, CSV de canales, impresión con membrete y enlaces KPI de Inicio. Embudo, canales, tendencia, zonas, brokers, velocidad mediana/p75/muestra, inventario/antigüedad, comisiones y pronóstico ponderado. Programar/constructor/conciliar son demos; CPL, conversiones lead→visita→reserva por proyecto y concesiones manager/broker pendientes. Es extensión operativa: PRD solo citaba BI en Fase4, no alcance inicial firmado (F:L37–56,75–100,155–175).

Casos: abrir; filtros compartibles en URL; rechazar fechas/orden/IDs inválidos; exportar; imprimir; navegar desde KPI; accesos team/own propuestos; programar destinatarios autorizados. Negativos403, export/programación preview y demo que simula ejecución. Carga/vacío/error/reintento/offline/403/éxito asOf/parcial con faltantes; vacío no probado en todas las pestañas (F:L60–100).

## Modelo, reglas y métricas

Sin tablas propias actuales. ReportSnapshot deriva de leads/deals/stages/loss_reasons/units/inventory_states/commissions/campaign_spend/zones/profiles. report_schedules/recipients/deliveries son propuestas (F:L177–178). Los informes no modifican operaciones.

SQL por visibleRows; ROI solo all sin filtro broker/proyecto. Centavos enteros seguros y USD/DOP separados. Embudo reachedCount/previousReached/passRate; fecha del hecho visible; velocidad con sampleSize; pronóstico declara importes/probabilidades faltantes. Inventario hereda available≠stock efectivo; comisión paid no acredita liquidación integral; ranking no equivale a metas (F:L47–56,79–88,114–124,139–157).

## Roles, APIs, integración y privacidad

reports:view para página y reports:export para CSV cliente de Canales. Admin/assistant view/export all; manager none aunque dashboard team, broker none aunque dashboard own; propuestas de concesión no desplegadas. Auditoría export pendiente. Prohibir export en preview requiere verificar Blob local, no solo API. Sin filas identificables de clientes; ranking es dato laboral. Programados necesitan autorización actual, destinatarios y registro de entrega (F:L164–175).

SSR consultarReportesBi recibe actor/scope/filtros; reportQuery y filtros/URL; automatizaciones.ts solo sirve al modal. No inventar REST nuevo. Twenty dashboards genéricos no integrado. Superset es candidato no seleccionado, no dependencia; licencia Apache-2.0 y descarte de Metabase/Grafana son declaraciones de fuente, no reevaluación externa. BI añade permisos/operación y riesgo de duplicar métricas: vistas agregadas autorizadas, no tablas de personas ni token fijo que ignore alcance (F:L126–153).

Dependencias: NEG etapas/velocidad/probabilidad; LEA fuentes/gasto; INV stock; COM finanzas; MET mes/atribución; INI KPI y embudo común; ACC scopes/preview; CFG catálogos y COMU correo futuro.

## Preguntas y propuestas

Pendientes: demos, reports team/own, preview/export, CPL/conversiones, auditoría CSV, nueve vacíos/E2E, scheduler y Superset. Hereda INI aprobaciones demo/Mi día y huecos de privacidad/dinero (F:L180–194). Frente al inventario inicial hay metodología y nueve vistas concretas. Propuesta: catálogo único de métricas/cohortes/fecha/divisa/frescura, lecturas con alcance y export/entrega auditados con permisos actuales. BI externo no es otra autoridad.


# MET — Metas: lectura integral

Fuente: `00-fuentes-drive/2026-11-06/originales/modulos/VT-CRM-ESP-MET_Metas_v0.1_2026-11-06.md`, 312 líneas. SHA256 `7DC49F4F0119ACBD8C6BAE6FA7146DD694D2DD9E91F392014F7E7C954FAE379A`. Leído completo; borrador v0.1. F:Lx remite a fuente/línea. Código, pruebas y voz owner son atribuidos por el documento, sin nueva entrevista ni ejecución.

## Alcance completo

Objetivos mensuales de cierres e importe para compañía, broker, proyecto y equipo; atribución versionada, logro por moneda, ritmo, ranking y comparación histórica. Consultar AAAA-MM, fijar objetivos, reiniciar solo targets, administrar alcances/equipos y publicar regla. Alertas, gráfico de ritmo, forecast por etapas, informes programados e historial UI pendientes. Semana/trimestre u otros periodos son extensiones opcionales: no existe schema week ni endpoint semanal (F:L58–83,177–201,254–264).

Casos: consultar mes; fijar compañía/broker; reset; guardar/eliminar meta de proyecto/equipo; guardar equipo; publicar regla; computar cierre; ranking/línea base; negativos por dato inválido, permiso, carrera/reenvío y red (F:L87–102). Misma ruta /metas?periodo contiene tablas/cards, equipos, atribución y modales. Carga/error/vacío/sin permiso/éxito; offline conserva borrador sin prometer sincronización. Copy solo administración contradice manager edit team (F:L104–117).

## Roles, datos e invariantes

Admin all; manager consulta/fija broker de equipo con reaches; assistant consulta all; broker consulta own. Reset, compañía, alcances, equipos y regla exigen edit all; no ampliar reset de gerente por asumirlo. Pertenencia de equipo y supervisión son distintas. Lectura global antes de filtrar, hero/tendencias y proyectos compartidos requieren pruebas; no afirmar fuga ni aislamiento completo (F:L218–233).

goals tiene destinatario nullable (compañía), año/mes, targets/achieved/divisa/auditoría y unicidad por destinatario/mes, sin moneda en clave. scoped_goals tiene project/team/id/mes/targets/divisa, también una fila por alcance/mes. teams/members, attribution_rules versionada/aprobada/una activa, deals con atribución congelada, intereses/historial, perfil base, audit/recibos. Un broker pertenece a un equipo; manager puede supervisar varios (F:L235–250).

sin_meta/en_curso/cumplida son derivados. Cero explícito sin meta; vacío no cero. Fijar/reset no altera logro ni negocios; reset target0/importe null. Regla nueva no reatribuye cierres pasados. Legado sin versión usa equipo actual y puede cambiar historia (F:L119–135,205–216).

## Conflictos de negocio y moneda

Computable deseado: contrato firmado Y reserva confirmada. Lectura actual won/closed_at y guardas NEG de monto/unidad no acreditan firma/reserva. Definir evidencia, fecha, alquiler, legado, sin broker y reversas (F:L133/210/275).

El acumulador `incrementarMetaAlcanzada` suma amountCents sin currency y goals no divide por moneda. UI desglosa desde negocios, pero achieved_amount_cents legado puede mezclar USD/DOP. scoped_goals tampoco permite dos objetivos monetarios simultáneos para mismo alcance/mes. Reconciliar consumidores/datos antes de decidir (F:L250).

## API, comunicaciones y métricas

PUT /api/metas fija broker/compañía; año2000–2100, mes1–12, entero≥0, perfil válido; importe omitido conserva, divisa nueva USD del servicio. DELETE con JSON reinicia con all. PUT/DELETE /api/metas/alcances; PUT /api/metas/equipos (hasta100 miembros); POST /api/metas/atribucion. conIdempotencia META/META_ALCANCE/META_EQUIPO/META_ATRIBUCION contradice auditoría histórica: replay/actor/despliegue por probar. DELETE JSON en proxies y edición simultánea pendientes; no GET/bulk/import/export propio acreditado (F:L139–151).

NEG cierre→goals/atribución+comisión transaccional; INV principal; BRO equipo/nivel/meta base; COM paralelo, pago no es venta; INI/REP consumo; ACC scopes/audit. Twenty solo KPI agregado de lectura propuesto, nunca cuotas/objetivos autoritativos; faltan dimensiones, moneda, frescura, permisos y reconciliación. LEA/CON indirectos sin copiar PII; sin canal externo directo (F:L153–175).

Cumplimiento logrado/objetivo, null si objetivo≤0; monto en moneda meta; pace proyectado por días civiles RD; faltantes max0; ritmo requerido por siete días es auxiliar mensual, no objetivo semanal. Ranking por cierres y nombre, comparación mismo mes año anterior/meses registrados. No inferir adopción de 264 semillas ni confundir venta, comisión y cobro (F:L179–201).

## Privacidad, pendientes y propuesta

Rendimiento de brokers es dato personal: alcance mínimo, auditar cambios y no llevar datos de comprador a ranking/Twenty. Retención/export y agregados requieren política.

Pendientes: evento computable, moneda, evidencia FIN desalineada, manager/scopes/copy, legado/compensaciones, periodos opcionales, alertas/historial, concurrencia/idempotencia y KPI Twenty (F:L254–292). Añade dominio de metas, no simple gráfico del primer inventario. Propuesta D03: evento de logro distinto de etapa genérica/pago, contribuciones únicas por hecho y moneda, reversas compensatorias, reglas congeladas y reconciliación de legado. Sin aceptación nueva.


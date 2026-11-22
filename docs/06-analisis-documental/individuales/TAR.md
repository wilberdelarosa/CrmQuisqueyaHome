# TAR — Tareas: lectura individual completa

Fuente: `VT-CRM-ESP-TAR_Tareas_v0.1_2026-11-06.md`; SHA256 `8D924079703E0CB9F7DF425E9CD5717970C229342D2A04A3D99A7CF287A635C3`. Leídas líneas 1–271, incluyendo checklist y cierre. Estado borrador; código y pruebas citados son atribuciones estáticas a 81ccf08, no ejecutados por este análisis. La aceptación de ADR en el documento no aprueba arquitectura actual.

## Funciones y alcance completo

Lista/To-Do, tablero, vista por broker; CRUD, completar con resultado/evidencia, reabrir, cancelar, baja lógica; packs por etapa (1–20 tareas, transacción y clave de UI), checklist y playbooks REA. Futuro conservado: recurrencias reales, catálogo editable/versionado de packs, SLA de primer contacto/escalamiento, alertas INI, sync Twenty, carga team y paginación. Checklist no es KYC ni evidencia de ejecución. Fuente:40–79,81–92,111–150.

## Roles, entidades y reglas

`activities` con activity_type task; title/description (hoy resultado y checklist mezclados), assignee/autoría, prioridad low/normal/high, pending/completed/cancelled, starts_at/ends_at/all_day, completed_at/deleted_at, contact/deal/project y lead_id no transportado; HttpIdempotency y AuditLog. Completar debe exigir evidencia efectiva, reabrir limpia completed_at, borrar es lógico. Urgencia sin fecha/programada/hoy/vencida es derivada, no estado; actualmente fecha usa starts_at, no due_at. Admin all; manager team; broker own; assistant all atribuido no certificado; ver-como sin mutación/export. Fuente:99–109,178–216.

## Eventos, API y comunicaciones

POST `/api/actividades`, PATCH/DELETE `/api/actividades/[id]`, POST `/api/actividades/lote`; conIdempotencia operación ACTIVIDADES_LOTE es opcional sin header. Nuevo pending con deal reemplaza nextActivityId sin ordenar por vencimiento ni recomputar al cerrar/borrar. NEG necesita próxima acción vigente; LEA necesita lead_id + motor SLA; AGE comparte tabla, separa task de meeting/call; BRO requiere traspaso integral distinto de reasignar tareas; CFG guarda response_sla/escalation_sla aún sin motor; INI/notificaciones consumen vencidas; DOC/KYC aporta evidencia futura. Twenty tasks sería genérico detrás de puerto QH, autoridad de packs/evidencia/RBAC en dominio; SoT física, IDs, conflictos y dirección de sync pendientes. Fuente:111–163.

## Estados, UX y privacidad

Lista limitada a 250; tablero no crea estados BD adicionales. Packs preparado→enviando→confirmado/fallido con misma clave al reintentar; payload distinto con misma clave debe ser conflicto. Guardar fallo conserva evidencia. Solo all tiene agregado carga por broker; selector de usuarios activos sin scope team debe minimizarse. Descripciones sin PII/documentos/secretos; retención/purga y export específico pendientes. Fuente:81–109,154–163,178–197.

## Contradicciones y decisiones abiertas

PATCH parcial puede limpiar descripción de completed sin reenviar status y eludir validación del estado efectivo; escenario no ejecutado. Plantilla/checklist no acredita resultado real. Transacción de lote y wrapper corrigen descripción de auditoría antigua, pero no prueban idempotencia ante caída entre commit/recibo ni obligatoriedad de header. Manager team bloqueado por all para otro responsable. Revalidar deals:view frente a activities cuando overrides difieren. Definir due_at, packs versionados/disparo único, evidencia estructurada, next_activity vigente y recurrencias finalizadas al cerrar. Fuente:109,119–124,182–197,220–248.

## Verificación pendiente

Permisos own/team/all/overrides/ver-como; completar sin evidencia o con plantilla, borrar evidencia con PATCH parcial; lote rollback/reintento/concurrencia/caída; tareas SLA ligadas a lead, siguiente actividad recalculada; Twenty no permite bypass. Tests y capturas citados existen según fuente, sin ejecución actual. Fuente:250–cierre. Revisión root/Luna pendiente.


# APR — Aprobaciones: lectura individual completa

Fuente `VT-CRM-ESP-APR_Aprobaciones_v0.1_2026-11-06.md`, SHA256 `6998FE8B2C1CA8EFCA6ADDCA6EAD87C04A736B300E7F3045E6FAD4544DC20412`; leídas líneas 1–245. Borrador Add-on; schema/código atribuidos a 81ccf08, no verificados aquí; ninguna aceptación comercial o técnica actual se deriva del «ADR ACEPTADO» histórico.

## Funciones y alcance total

Bandeja de decisiones con expediente/política/responsable/historial para descuento, prórroga hold, liquidación comisión y fusión de contactos. Futuro: solicitar desde módulos, asignar aprobador por política, aprobar/rechazar con motivo y MFA cuando importe, expirar y volver a solicitar, invalidar al cambiar expediente y ejecutar efecto aguas abajo. Actual atribuido: página/shell con dashboard:view, cuatro ejemplos/filtros/selector demo; tabla financial_approval_requests sin API/caso de decisión y recurso financial_approvals sin concesiones. Fuente:41–84,109–117.

## Roles, entidades y reglas

Ver no decide. Admin propuesto all y gerente team no propias; asistente y broker pueden ver según dashboard pero no decidir. Solicitante siempre distinto del aprobador; política tipo/monto versionada; motivo/MFA, vencida no decidible, hash fija expediente y una aprobada por lote. Entidad actual atribuida está orientada a finanzas: public_id, batch_id XOR entry_id, adjustment, object_version/hash, status, requested_by/decided_by/at, mfa_verified_at, evidence_id/expires_at y RLS. Descuentos sin entidad, fusiones sin flujo, holds hoy edit sin APR. Fuente:162–198.

## Eventos, API y comunicaciones

No inventar endpoints reales. Objetivo NEG/RES/COM/CON originan solicitud, DOC evidencia, ACC RBAC/MFA, APR fija decisión y política, módulos dueños aplican efecto, INI enlaza y REP futuro mide pendientes/SLA/aprobadas/rechazadas/bloqueos. Twenty no es SoT ni autoridad de decisión. Auth MFA pendiente de proveedor; audit requerido. Fuente:95–140,142–160,212.

## Estados, UX, fallos y privacidad

Solicitud pendiente→aprobada/rechazada y expirada propuesta; descuento solicitado→aplicado/rechazado. UI actual solo simula estados; éxito futuro requiere folio servidor, offline no encola. Efecto fallido tras decisión necesita estado parcial y recuperación; la fuente dice «Transacción; parcial si falla efecto» sin definir atomicidad local/remota. Ver por dashboard no debe filtrar expedientes sensibles; separar permiso ver listado/detalle/evidencias/decidir, equipos y ver-como. Fuente:75–117,162–198.

## Contradicciones y decisiones

Flujos abarcan descuentos/holds/fusiones pero tabla batch XOR entry parece limitada a comisión: decidir ApprovalCase general + tipos/evidencias o motores separados, sin declarar que tabla actual cubra todos. Umbral MFA en P0 enforcement vs proveedor MFA P2 es dependencia que bloquea cualquier decisión sensible hasta resolver proveedor/step-up. Concurrencia y vencimiento: dos decisiones simultáneas, contenido cambiado y ejecución efecto deben chequear versión/hash al commit. Solicitud de fusión necesita acceso a ambos contactos y consecuencias de reversión. Fuente:47–58,90–117,194–210,232–237.

## Aceptación pendiente

No autoaprobación ni concesión implícita por dashboard; MFA real ligado a operación/hash, expiración, clave/versión y auditoría; una sola decisión terminal; efecto aplicado una vez/reconciliable y política guardada. Ocultar demo/selector o rotular mientras no exista; INI no promete capacidad inexistente. Revisión root/Luna pendiente.


# AGE — Agenda: lectura individual completa

Fuente: `VT-CRM-ESP-AGE_Agenda_v0.1_2026-11-06.md`, SHA256 `E88B9068ED37F37241729362DB7C17868F088FCB31D44FB18FFD4B02DB2C7EAA`. Leídas líneas 1–272 del original en `00-fuentes-drive/2026-11-06/originales/modulos/`. Estado de fuente: borrador; sus observaciones de código son evidencia estática atribuida a HEAD 81ccf08, no verificación nueva. «ADR ACEPTADO» es una declaración histórica de la fuente, no aceptación actual de Twenty.

## Funciones y alcance completo

Calendario semana/día/lista/responsable y mes de 42 días; creación, edición, reprogramación por modal/arrastre/teclado, cancelación, completar y resultado de visita; exportación ICS; cuentas Google opcionales múltiples y calendario propio seleccionado/predeterminado. Futuro: recordatorios 24 h/1 h, confirmación de cliente, sala/recurso, viajes y visitas operativos, sync bidireccional Google y adaptador Twenty. No se descartan por no entrar en un primer corte. Referencias: fuente:40–74,78–89,110–125.

## Roles, entidades y reglas

Admin all, manager team, broker own, assistant all según documento (seed/BD no confirmado), ver-como solo lectura. Scope por `assignee_id`, no autor; validar responsables activos y alcance; referencias autorizadas. `activities` comparte task/call/meeting/note/whatsapp/email con TAR; fechas, all_day, responsable/autoría, vínculos contacto/lead/deal/proyecto, lugar/enlace, estado/prioridad, completed_at/deleted_at; GoogleAccount/Calendar, ActivitySync y AuditLog. Estados persistidos pending/completed/cancelled; baja lógica aparte. Asistió→completed, no-show→cancelled y reprogramó→pending son mapeos UI atribuidos; resultado sigue en texto libre. Fuente:96–106,179–217.

## Eventos, API y comunicaciones

POST/PATCH/DELETE `/api/actividades`; GET `/api/actividades/ics?semana=`; `/api/integraciones/google/*`. Alta guarda CRM antes de intentar Google; error externo no revierte cita. Próximas citas/resultado alimentan INI/REP; TAR comparte activities; ACC autoriza; BRO aporta equipo/traspaso; CON/LEA/NEG/INV son vínculos; CFG define zona y políticas; COMU enviaría recordatorios/confirmaciones con opt-out y entrega reales. Twenty calendar/tasks es objetivo atribuido sin integración acreditada; SoT física, mapeo IDs y conflictos abiertos, sin dual-write. Fuente:110–152.

## Fallos, UX y privacidad

Carga/vacío/error/permiso, mensual offline/solo lectura y propuesta conservada; distinguir «cita guardada» de «evento creado». Conflictos solo de filas visibles del mismo responsable, advertencia no reserva global ni evita carrera. Cuenta Google es del actor y no automáticamente del responsable asignado. Minimizar descripción/lugar/ICS; OAuth técnico no prueba consentimiento del cliente. Ver-como bloquea escritura, ICS y conectar/callback de calendario, sin generalizar al login OAuth. Export necesita permiso/auditoría específicos por definir. Fuente:89–106,149–164,181–199.

## Contradicciones y decisiones abiertas

ICS descrito semanal pero código atribuido exporta lunes–viernes frente a vista lunes–domingo; incluye cancelled, sin all-day/STATUS/SEQUENCE. `activity_sync` existe en schema pero no vínculo durable usado: crear evento no acredita reintento seguro ni PATCH/cancelación/sync entrante. Manager team no puede asignar a otro porque validación exige all. `lead_id` existe pero entrada genérica no lo transporta. No-show cancelled difiere de auditoría histórica pending y no distingue cancelación. Fijar resultado estructurado, política de choques/salas, zona central, autoridad Twenty↔QH↔Google y sentido del sync. Fuente:76,102–125,139–152,221–249.

## Verificación pendiente

Casos: permisos/overrides/ver-como y referencias cruzadas; alta y reintento Google sin duplicación; editar/cancelar evento externo; ICS fin de semana/canceladas/día completo; choque oculto y concurrencia; resultado persistido y KPI sin inferencia por texto. Capturas citadas son históricas; fuente no ejecuta E2E. Fuente:251–272. Revisor de este análisis: root para integración y Luna independiente, pendientes.


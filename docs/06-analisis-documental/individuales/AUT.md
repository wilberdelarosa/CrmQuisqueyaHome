# AUT — Automatizaciones: lectura individual completa

Fuente `VT-CRM-ESP-AUT_Automatizaciones_v0.1_2026-11-06.md`, SHA256 `3ED71DFA9E64E3C73143DB1ACF0C31CD8918B836D3FB4B244DD8FBD5802EEB22`; leídas líneas 1–275. Borrador Add-on; afirmaciones de código a 81ccf08 son atribuidas, no probadas aquí. La etiqueta Add-on preserva etapa documental, no elimina el alcance futuro ni aprueba ADR histórico.

## Funciones y alcance total

Constructor desde plantilla/cero, validación de borrador, monitor de outbox y copiloto de ejemplo. Actual atribuido: borradores solo en memoria y conteos reales del outbox; no motor/rules/runs activos. Futuro: reglas persistidas/versionadas, activación/pausa/reanudación con motivo, ejecución idempotente, monitor runs/error, reintentos dead-letter admin, pausa global, permisos por acción y copiloto IA supervisado. Disparadores lead-meta/lead-nuevo/negocio-sin-accion/cambio-etapa; hasta cuatro acciones asignar/borrador-whatsapp/crear-tarea/avisar-supervisor. Automatizaciones multi-tercero complejas están fuera del compendio de esa fuente, decisión de alcance por validar hoy. Fuente:43–81,120–157,213–224.

## Roles, entidades y reglas

Actual `settings:view all` para página/monitor y edit all para borrador; admin objetivo único activador/reintentador. Broker/gerente sin acceso atribuido; gerente monitor team/borradores y asistente consulta son propuestas; readOnly sin constructor. FlujoBorrador (nombre≤100, condición≤500, acciones 1–4), Outbox/Dead, MessageTemplate y WebhookInbox actuales atribuidos; AutomationRule y AutomationRun propuestos, con disparador/condición/acciones/versión/estado/activado_por y run regla/evento/resultado/error. Dominio QH objetivo manda sobre reglas, no Twenty ni outbox. Fuente:51–63,94–102,181–224.

## Eventos, API y comunicaciones

LEA/NEG generan disparadores; TAR ejecuta crear tarea; BRO asigna; COMU prepara/envía mediante canal; CON aporta consentimiento/opt-out; ACC/CFG autorizan. Flujo objetivo disparador→condición→run→acción y WA siempre borrador→revisión humana→cola COMU. Único estado operativo atribuido es monitor lee outbox/outbox_dead y recarga; no endpoint de activación/retry real acreditado. WebhookInbox origen leads Meta parcial; IA no elegida. Fuente:104–157.

## Estados, fallos, UX y privacidad

Memoria en_edición→validado/con_errores; regla futura borrador→activa→pausada; runs ok/error (ampliar ejecución/unknown/reconciliación si efectos externos); outbox pendiente/enviado/fallido/dead. UI declara cargando/vacío/error/sin permiso/solo consulta/parcial/sin conexión; éxito significa borrador local, nunca activo. No convertir fallo de lectura en cero. Consentimiento vigente, opt-out/frecuencia y plantilla aprobada antes de mensaje; pausa global y dead visible. Fuente:83–102,124–130,183–199.

## Preguntas y riesgos

No motor no se resuelve por activar un diálogo; hace falta persistencia, scheduler/eventos, versión y unicidad (regla_id,event_id), con política de cambio de versión/replay aún no definida. Roles de acción no deben heredar poder ilimitado de settings. Elegir disparador inicial, gobierno de reglas/condiciones seguras, ventanas y prevención de bucles; revisar si retry requiere MFA. La obligatoriedad de humano para cada WA entra en tensión con recordatorios automáticos AGE: precisar si se aprueba plantilla/regla o cada envío, sin asumir excepción. Fuente:63,191–199,226–267.

## Aceptación pendiente

Reglas sobreviven recarga; doble evento crea una sola tarea/borrador; evento antiguo y regla versionada no repiten efecto; opt-out antes del despacho bloquea; humano decide mensaje; scopes y pausa global; reintento autorizado no duplica. Checkboxes de UI no certifican motor. Revisión root/Luna pendiente.


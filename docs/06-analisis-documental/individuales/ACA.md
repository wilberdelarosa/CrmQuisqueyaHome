# ACA — Academy: lectura individual completa

Fuente `VT-CRM-ESP-ACA_Academy_v0.1_2026-11-06.md`, SHA256 `AEAAF41DBD29AD7F0BD92A4E2B8FEB17135D88B65CADD7D51B518FBDD05EDC15`; leídas líneas 1–303. Borrador Núcleo histórico. Hechos de código son atribuidos a 81ccf08; fuente dice Moodle 4.5, default local 9330, prod/SSO pendientes. No se consultó LMS ni credencial. «Cerrado en código»/checks no equivalen a E2E ni aceptación actual.

## Funciones y alcance completo

Biblioteca, cursos/categorías Moodle asignados, matrícula por rol/persona y asegurar usuario, progreso parcial/checklist, rutas por categoría, vista equipo, solicitud revisión, aprobar/rechazar/revocar y constancia/hash/código servidor; crear curso/nota mínima (1–100, default 80) y consulta por persona, deep-link course/view. Vigencia calculada 12 meses y ventana 60 días. Futuro: contenidos reales, prod verificada, SSO seguro, vigencia por curso, recordatorios COMU y posible gating onboarding/metas/comisiones (decisión negocio, no requisito cerrado). Fuente:40–84,130–143,247–284.

## Roles, entidades y reglas

academy view/edit own/team/all. Admin all edita/crea/matricula/decide; UI administración además roleSlug admin. Broker own consulta/avance parcial y solicita, sin autocertificar 100%; gerente view team/equipo y seed por validar; asistente view no verificado; ver-como sin escrituras. Q-C1-03 decisor distinto de cursante, servidor+check BD atribuidos; completar 100%/checklist exige edit. Moodle SoT cursos/contenido/matrículas/progreso/notas; QH SoT solicitudes/constancias/vínculos/checklist local y cálculo vigencia/rutas. ExternalRef(system=moodle,entity/local/external ID), AcademyItem/Checklist/Progress, ReviewRequest(broker/course/evidence hash/progress/status/decisor), Certificate(review/hash/code/status/issued_at), AuditLog, perfil moodleUserId. Fuente:145–169,197–245.

## Eventos, APIs y conexiones

APIs `/api/academy`, cursos/matriculas/solicitudes/revisiones/`[id]/progreso`/checklist; MoodleAdaptador REST WS core/enrol_manual/gradereport/completion y comprobarSalud. Dominio valida Q-C1-03, emite/revoca con hash; BRO perfil y alta persona, ACC RBAC, CFG configuración/env, INI widget, MET/COM posible gating no definido; COMU solo vía MessagingPort futuro sin wiring/outbox actual ACA→COMU; Twenty opcional enlace/UI no SoT. Matrícula asegurar usuario→enrol→external_refs tiene frontera remota y recuperación pendiente de contrato. Fuente:36,64–84,130–170.

## Estados, UX y privacidad

Matrícula sincronizada/fallida; revisión pendiente/aprobado/rechazado/revocado; certificado BD vigente/revocada; vigencia derivada vigente/por_vencer/vencida/revocada, revocada no revive; progreso LMS %/nota/completado separado de checklist local. LMS caído conserva solicitudes/constancias sin inventar progreso; vacío/carga/error/permiso/offline matrícula y éxito respuesta válida. Deep-link no SSO; token nunca cliente, usuarios/progreso educativo con scope y no compartir por ranking libre. Fuente:86–111,203–229.

## Contradicciones y decisiones

Maestro/módulo antiguo dicen vigencia/rutas/equipo faltan; fuente los observa presentes en código pero E2E pendiente. Auditoría 0 contenidos y autocertificación mitigada, no certificada. INI usa academy_progress local y marca Moodle fuera de su ESP: widget no representa automáticamente progreso LMS autorizado; acordar agregado y fechas. Definir si 100% local con edit basta o siempre evidencia LMS para certificar, hash de evidencia y versionado/expiración; gating no debe colarse a comisiones sin negocio; reconciliar matrícula si enrol tuvo éxito y falló external_refs; SSO solo si verificado. Fuente:46,53–62,106–111,152–158,247–295.

## Aceptación pendiente

Cursos/contenidos y conexión prod reales; own/team/all/ver-como; matrícula repetida sin duplicar usuario/enrol; 100% broker denegado, revisión propia denegada y evidencia válida; revocación/caducidad/cálculo fronteras; LMS caído y callback/relectura recuperables. Revisión root/Luna pendiente.


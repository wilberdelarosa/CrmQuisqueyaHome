# CFG — Configuración: lectura integral

Fuente: `00-fuentes-drive/2026-11-06/originales/modulos/VT-CRM-ESP-CFG_Configuracion_v0.1_2026-11-06.md`, 315 líneas. SHA256 `1B47F392614E4005346A6315C2845698D00CCF15B1092F6911B7969375550166`. Leído completo, borrador v0.1. F:Lx remite fuente/línea. Sin leer credenciales, ejecutar pruebas ni modificar entorno; claims de código/QA atribuidos.

## Alcance y catálogo completo

Panel ?tab= usuarios por defecto, permisos por rol/persona/equipo, etapas, catálogos, papelera, auditoría e integraciones/proveedores. Usuarios: alta/edición/invitar/reenviar contra doble envío/baja; matriz protegida, overrides motivados y scopes; etapas pipeline, motivos de pérdida y fuentes; restaurar hasta30 por tipo; audit view/export; cuentas/outbox real o no disponible. Centro de ajustes, SEO y capacidad/costes son demos a persistir, rotular u ocultar. Badge personalizado/restablecer rol, caducidad, retención visible de papelera y etiquetas Twenty futuros. CFG no publica inventario ni sustituye Studio/PortalPublisher (F:L41–85,88–106,259–279).

Casos: abrir; invitar/reenviar; baja con transferencia ACC pendiente; matriz; override; equipos/supervisores; etapas/catálogos; restaurar; auditoría/export; estado integración; modo consulta; assistant limitado propuesto. Negativos: gerente/broker403, no-admin amplía matriz, admin protegido, demos y red. Loading/error/forbidden presentes; vacío de usuarios no revisado, éxito de correo reenviado, outbox parcial, banner readOnly y pausa offline en Avanzada no prueban uniformidad (F:L66–106).

## Roles, datos y estados

Página settings:view all; usuarios full scope; matriz/overrides solo admin, admin protegido, duplicados rechazados, motivo obligatorio. Un broker/un equipo; supervisor admin o gerente. Manager/broker sin settings; assistant catálogos/consulta propuesto sin seed verificado; preview no amplía acceso (F:L205–238).

Datos: users/roles/permissions, overrides únicos por user/resource/action, manager_scopes, teams/members, perfiles, stages, motivos/fuentes con posición, integration_accounts con proveedor/estado/fecha/credenciales cifradas, audit before/after y outbox/dead. Settings QH autoridad; Twenty nunca matriz autoritativa. 0014/0017 en repo no prueban aplicación; backup previo es requisito operativo atribuido, no ejecutado (F:L240–259).

Estados: usuario activo/inactivo/soft-deleted; rol protegido/activo; scope none/own/team/all; override vigente sin expiración; restauración deleted_at; integración status/frescura; outbox pending/sent/dead/no disponible; demo no persistida. Restaurar soft-delete no acredita compensar stock, vínculos o consentimiento ni supresión legal (F:L108–137).

## APIs y comunicaciones

Familias API de usuarios/permisos/roles/equipos/papelera; PATCH de matriz y acciones F:L139–153, paths precisados por ACC. No inventar APIs para demos. Guardas de acción deben probarse también directo por API. Auditoría antes/después; UI outbox solo lectura, fallo muestra no disponible en lugar de ceros o conexión inventada.

Supabase Auth invitaciones/reset por ACC; Postgres/RLS; outbox lectura; Meta/Google/YCloud/Cloud API/Resend config o presencia env, no evidencia de envío/OAuth/webhooks productivos. COMU cuentas/flags y permisos gerente; REP concesiones team/own pendientes; AGE/INI/REP zona RD; INV publisher; Twenty espejo genérico opcional sin sync de matriz. Métricas propias: eventos y cola, negocio en REP (F:L155–203).

## Privacidad, contradicciones y propuestas

Usuarios, credenciales cifradas y auditoría con before/after necesitan permisos, redacción y retención. No volcar secretos; CON decide evidencias/finalidad con asesoría. MFA/reset ACC, entrega COMU y publicación INV no quedan resueltos por mostrar configuración.

CFG dice mitigadas en código escalada, duplicados y ausencia manager; E2E pendiente. Esto matiza auditorías/COM/BRO históricas, sin afirmar reparación desplegada. Falta matriz definitiva de Wilber, reports/comms, assistant seed, 0017 real, demos, badges/restablecer/expiración, retención y credenciales Meta (F:L261–307).

Frente al inventario inicial, CFG administra controles y estado operativo, no solo un CRUD ni CMS. Propuesta D03: configuración versionada y auditada por familia; separar identidad/autorización/cuentas; secretos fuera del DTO, estado con fecha y prueba real; restauración valida invariantes por módulo. La matriz y contrato de membresía Twenty siguen pendientes.


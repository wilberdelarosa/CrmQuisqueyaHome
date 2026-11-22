# ACC — Acceso/RBAC: lectura integral

Fuente: `00-fuentes-drive/2026-11-06/originales/modulos/VT-CRM-ESP-ACC_Acceso_v0.1_2026-11-06.md`, 234 líneas. SHA256 `C719055940A70C1B1896EA200EC18582C1A02E1C5BB5E50A5320653BDA0047B0`. Leído completo. Borrador v0.1; sus verificaciones se atribuyen a `81ccf08`, no fueron reejecutadas. `F:Lx` remite a ese archivo/línea. Análisis D01 e implicaciones conceptuales D03; ninguna decisión se acepta hoy por aparecer en la fuente.

## Alcance y funcionalidades completas

F:L43–69 incluye identidad/Supabase Auth, login, recuperación, invitación/alta/baja, matriz rol×recurso×acción×scope, overrides individuales, equipos/scopes gerente, ver-como, traspaso cartera, precio restringido y auditoría. Login con límites declarado real; recuperación sin límite, MFA ausente, E2E matriz/ver-como ausente. Fuera de esa versión: SSO/SAML, permisos de campos genéricos salvo precio real, ACL KYC y RBAC externo; no inferir exclusión del producto completo.

Casos F:L73–88: iniciar/recuperar sesión, invitar, editar matriz, override motivado, asignar equipo, iniciar/salir preview, baja con traspaso, login de evaluación solo dev. Negativos: gerente concede permisos, override admin protegido, escritura preview y preview fuera equipo. Vistas F:L90–100: login, recuperar, configuración usuarios/permisos, forbidden, banner preview; traspaso no es flujo entregado.

## Roles, entidades e invariantes

Admin, manager, broker, assistant; readOnly es estado preview. Datos F:L175–189: users, roles, permissions, user_permission_overrides, teams/team_members, manager_scopes, broker_profiles, audit_log, http_idempotency; propuestas view_as_sessions/eventos y portfolio_transfers.

F:L104–121,154–173: sin permiso=none; servidor decide; override reemplaza celda incluyendo none; admin protegido; team=actor+manager_scopes sin transitividad; no anidar preview; preview solo GET/HEAD/OPTIONS, sin export/OAuth/ICS; quitar unit_real_price sin permiso; no baja con cartera abierta sin transferencia ni alterar autoría histórica. scopeCondition centraliza filtrado. Usuario invitado→activo→inactivo→soft-delete; override vigente→revocado; expiración pendiente.

## API y conexiones

F:L75–88: POST /api/auth/login, /api/auth/recuperar, /api/usuarios; PATCH /api/roles/[id]/permisos, /api/permisos/usuarios/[id], /api/permisos/equipos/[id]; POST/DELETE /api/ver-como. Son contratos atribuidos, no endpoints implementados aquí. Supabase autentica, dominio autoriza. Arquitectura declarada cerrada híbrida y RBAC dominio autoritativo; users→Twenty membresías como espejo, job pendiente (F:L34,41,123–131). BRO perfil/salida; MET equipos; COM aprobación dual por definir; LEA/NEG/CON/INV owner broker y actividades assignee. Auditoría parcial; eventos start/stop preview propuestos.

## Errores, privacidad y métricas

Sesión vencida/anónima, credencial inválida, bloqueo IP/correo, 403 y 404 evaluación fuera dev. Recuperación con origen de petición: riesgo host-header/phishing, falta límite/dominio fijo. MFA admin requerido propuesto, gerente por decidir. Export explícito+audit; preview registra operador/destino/duración sin copiar expediente. Ley 172-13 es requisito citado, no dictamen nuevo. KPIs F:L133–161: cero escrituras preview/cross-team/admin sin MFA/carteras huérfanas y 100% E2E crítica; objetivos, no resultados medidos.

## Pendientes y cambio respecto al inventario previo

F:L193–224: reset seguro, MFA, preview audit, transferencia, expiración overrides, 0017 efectiva, assistant, E2E, sync y mapeo roles. Preguntas: MFA gerente; preview solo brokers; reparto transferencia; caducidad; precio assistant. Amplía roles genéricos iniciales con equipos/preview/traspaso. La híbrida «cerrada» debe cotejarse con ADR y aceptación humana; no reemplaza automáticamente opciones abiertas del primer turno. Tabla assistant tiene incógnitas: no inventar permisos.

Propuesta: autorización común UI/API/jobs, matriz negativa por registro/campo, transferencias atómicas o reconciliables y revocación de sesiones. Responsables de decisiones: Wilber/D12/D03; licencias Twenty aparte. Sin implementación ni pruebas nuevas.


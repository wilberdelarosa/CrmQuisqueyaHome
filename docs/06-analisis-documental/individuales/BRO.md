# BRO — Brokers: lectura integral

Fuente: `00-fuentes-drive/2026-11-06/originales/modulos/VT-CRM-ESP-BRO_Brokers_v0.1_2026-11-06.md`, 323 líneas. SHA256 `97F1CA3853C5B9F39BB074F5B7C2272B84DA69506D0E430BB1D9F25F43975729`. Leído completo. Borrador v0.1; `F:Lx` = fuente/línea; código y QA atribuidos, no reejecutados. Híbrida registrada, no aceptación nueva.

## Alcance y funcionalidades actuales/futuras

Directorio/red de asesores con cumplimiento mensual, cierres/cartera, perfil, proyectos, ver-como y toma de leads vía LEA. Tablero/ficha/agregados, diff de proyectos auditado, mi-espacio y perfil/nivel/especialidad/meta base se declaran reales; equipos vía MET. Onboarding/documentos, protección con vigencia/renovación/conflicto, cooperación con acuerdo y economía COM, salida ordenada/traspaso/revocación, grants M:N proyecto/derechos, shell /socios M50, Academy/recursos son futuros o demos. No confundir invitación con acreditación ni vista ejemplo con derechos (F:L52–97,132–150,256–278).

Vistas /brokers tarjetas/tabla/leaderboard/búsqueda/nivel/invitar/asignar; /[id] ficha; /mi-espacio redirige actor; /onboarding, /alcance, /proteccion, /cooperacion, /salida previews. Banner preview real. Falta loading local, error compartido/vacíos, dl mal formado, React418 onboarding y lentitud móvil4.7s históricos requieren nueva medición (F:L99–115,150).

## Roles, entidades e invariantes

brokers:view scopes none/own/team/all; asignación projects:edit all exclusivamente, gerente team no basta; admin/assistant asignan si permiso. Preview admin/manager, gerente solo equipo, siempre readOnly sin mutar/export; broker no Tomar en nombre ajeno; solo rol broker reclama lead. Invitar requiere users:create (F:L207–240).

users/auth_user_id/roles; broker_profiles 1:1 user con specialty/agency/handles_rentals/level/annual_sales_cents/monthly_target_deals; agencies; teams/team_members user único (un equipo/broker); manager_scopes varios equipos supervisados; overrides; cartera projects/units/contacts/leads/deals; goals (F:L242–260). Nivel junior/senior/senior_plus/top_producer/top_leader recalculado al cierre; umbralSeniorUSD500k respaldado prototipo según fuente, superiores provisionales, no ratificados. Meta base no sustituye meta aprobada. Baja lógica conserva historia y exige traspaso aún no implementado. No row_version propio observado.

## APIs y conexiones

PUT /api/brokers/[id]/proyectos projectIds[] valida broker/proyectos activos y all; aplica diff assign/unassign, audit solo cambios; no conIdempotencia explícita acreditada. POST/DELETE /api/ver-como; POST /api/leads/[id]/tomar; invitación reutiliza CFG/usuarios, no endpoint inventado (F:L138–149).

Twenty members/users mapping propuesto, QH users/perfil/nivel/equipos/RBAC autoritativos; domain-wins solo hipótesis de conflicto (F:L154–183). MET aporta goals/ranking/equipos; NEG open deals/cierre→ventas anuales/nivel; COM montos/nivel y co-broker futuro; LEA tomar/sugerir/asignar; CON own por contacto; INV projects.broker_id/precios saneados; ACC Auth/preview/baja; ACA formación; DOC expediente privado onboarding aún pendiente.

Asignación actual projects.broker_id no constituye grants N:M ni acceso a todo catálogo; INV confirma lectura por owner. Frente a primera propuesta, red interna tiene disciplina y ciclo completo; no es marketplace SaaS. El modelo de equipo único debe respetarse hasta decisión de cambio.

## Métricas, privacidad, preguntas y propuestas

Cumplimiento mensual desde goals, cartera open, ventas anuales/nivel y leaderboard UI visible; ranking formal MET no duplicar ni publicar; reportes brokers requieren reports hoy ausente broker. KPIs cobertura metas, SLA toma, onboarding completo y traspasos sin umbrales aceptados (F:L185–205). Rendimiento/nombre/email internos son datos personales; ranking/exports/Twenty mínimos, auditar preview/overrides, no copiar comprador. Consentimiento CON no inferido.

Pendientes F:L266–305: documentos privados verificados, claims/ventanas, acuerdos, transferencia atómica, ranking alineado, loading/semántica/performance, niveles, miembrosTwenty/frescura/conflicto, idempotencia/E2E y Academy. Historical team≈own/manager ausente contrasta0017; verificar entorno sin afirmar fuga actual. Preguntas dueño: niveles oficiales, gerente asigna o solo all, altas/bajasTwenty, documentos/ventana protección y receptor único o reparto transferencia. Propuesta D03: lifecycle de asesor y derechos separado de identidad genérica; transferencia inventariada/auditable con revocación y autoría intacta; contrato acceso coherente con owner actual y futuro grants, sin asumir bypass resuelto.


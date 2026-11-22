# CON — Contactos: lectura integral

Fuente: `00-fuentes-drive/2026-11-06/originales/modulos/VT-CRM-ESP-CON_Contactos_v0.2_2026-11-06.md`, 354 líneas. SHA256 `A4EDE127E4D8809A1BF735C80117F6E53959A1523311D992DB5CFB03D8113C3E`. Leído completo; borrador v0.2. `F:Lx` = fuente/línea. Código/QA atribuidos a fuente, sin comprobación actual ni aceptación legal.

## Alcance y funcionalidades, también futuras

Identidad comprador/inversionista/propietario/referido. CRUD, normalización/dedupe, responsable, ficha, export individual y soft-delete se declaran reales. Consentimientos/bajas por finalidad/canal, derechos, empresas/representantes, timeline, fusión, demandas/matching/alertas y sync Twenty parciales/futuros (F:L61–84). Pipeline→NEG, reparto→LEA, campañas→COMU, KYC→DOC; tener identidad no autoriza publicidad.

Casos F:L86–108: alta manual/externa, buscar/abrir/corregir/reasignar/exportar/borrar, consentir/revocar/opt-out, derechos, timeline/handoff, fusión/empresa/demanda. Negativos: export ajeno, reasignar own/team, dedupe con PII ajena y envío tras baja. Vistas F:L110–129: directorio tabs Personas/Empresas/Demandas, inspector ?contacto=, ficha [id], privacidad/relaciones mixtas; empresas/demandas demo; negocio usa ?deal=. Móvil dock/scroll/foco y orden global requieren prueba.

## Roles, entidades, invariantes

Contacts view/create/edit/import/export/delete con none/own/team/all. Admin all; assistant sin delete; manager team sin import/export sembrado; broker own; titular no usuario implícito. Export exige intersección view/export; reasignar contacto edit all, distinto LEA. Own real por contacts.broker_id, no por relaciones; alta externa puede dejarlo nulo (F:L256–271).

Datos F:L273–294: contacts identidad/medios/país/ciudad; source/broker/notas/last_interaction_at; consent_at/source; autores/fechas/deleted_at; leads/deals/activities 1:N; audit/papelera. Futuro: consentimiento/preferencias/solicitudes con canal/finalidad/evidencia; empresa/representación; demanda por zona/divisa/presupuesto/habitaciones/área/operación/prioridad/estado; IDs Twenty/versiones/tombstones. Sin row_version. Tel/email no únicos: carreras y crear_igual permiten duplicados.

Dedupe exacto E.164/email→409 con candidatos visibles; forzar exige confirmación. Nombre requerido, medio no obligatorio. PATCH ausente conserva/null limpia; validaciones POST/PATCH distintas, edición sin dedupe acreditado; país/ciudad no contrato manual. Fusión conserva relaciones/historial y no inventa aceptación (F:L150–168,237–250).

## Estados, APIs y privacidad

Contacto no tiene pipeline. Alta manual no escribe consentimiento; externa nueva escribe consent_at=ahora y portal_externo sin evidencia de voluntad; existente reutilizado no actualiza. Corrige auditoría histórica «nunca se escribe» y simplificación LEA. Token/UTM/timestamp no prueban aceptación. Baja durable antes de dispatch/reintento/enlaces, sin revivir por import/sync/fusión, pendiente. Derechos requieren identidad/rol/plazos/retención asesorados; JSON y soft-delete no equivalen a export/supresión integral. Mutaciones auditan antes/después con PII potencial; export solo campos/formato; redacción/retención pendientes (F:L59,131–148,233–254).

F:L152–164: POST /api/contactos; PATCH/DELETE /api/contactos/[id]; GET /api/contactos/[id]/exportar. Bulk/fusión/preferencias/empresa sin API integral acreditada. 403 sin permiso, 404 ajeno/borrado, 409 duplicado; formulario conserva datos. Cambios navegación/offline en otros worktrees no acreditan base/productivo.

## Conexiones y métricas

LEA/gateway/portal identidad; NEG relación; AGE/TAR actividad/cache; COMU YCloud/Cloud API/Resend; Meta Ads/CAPI atribución indirecta; INV matching futuro; DOC expediente privado; CFG audit/papelera; Supabase auth/datos. Twenty persona/cuenta/UI proyección, QH autoridad privacidad/identidad; sync IDs/campos/dedupe/versiones/tombstones/reconciliación P0 documental. Calendar indirecto, Cal.com sin evidencia. NegocioCambioEtapa→crm.reflejarNegocio NO es CAPI automático (F:L170–204).

F:L206–231: total filtrado/última interacción/export; futuros evidencia consentimiento/bajas bloqueadas/duplicados/demanda. KPI identidad, evidencia, bajas, continuidad, derechos y matching sin umbrales aprobados. Matching puro presupuesto40/zona30/habitaciones20/área10, excluye no disponible/operación/divisa distinta sin FX; no persistencia ni alertas (F:L292).

## Preguntas, contradicciones y propuestas

F:L298–331: reparar legado sin inventar consentimiento; finalidades/canales/base/evidencia; derechos/export completo; responsable único/compartido y cascada al reasignar lead; reactivación; fusión/empresa/timeline/matching; sync/RLS; QA autenticado/POST-PATCH. Historial y tests de terceros no reejecutados.

Amplía ficha simple del primer inventario a privacidad/derechos/demanda. Conflicto ownership contacto vs lead puede ocultar contacto al nuevo broker. Propuesta: autoridad explícita identidad/preferencias, transferencia/fusión con permiso por relación y concurrencia, evidencia legal separada de origen y enforcement de opt-out en cada envío. Asesoría/D12 deciden bases/plazos; ningún artículo/plazo se inventa.


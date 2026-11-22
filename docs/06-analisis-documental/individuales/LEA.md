# LEA — Leads y asignación: lectura integral

Fuente: `00-fuentes-drive/2026-11-06/originales/modulos/VT-CRM-ESP-LEA_Leads_v0.2_2026-11-06.md`, 504 líneas. SHA256 `FEAFD4C875DD87043746FAE5CFBFCA9A15EA1D201633F0CDDBD23CAAB900BF58`. Leído completo, borrador v0.2; pie conserva v0.1 (F:L504). `F:Lx` = fuente/línea; código/QA sobre 81ccf08 y otros worktrees no reejecutados.

## Alcance y catálogo funcional completo

F:L52–97: recibir/calificar/asignar/convertir antes del negocio. Alta/dedupe, captura externa idempotente con atribución/mensaje, Meta/WA, sugerencia sin autoasignar, asignar/reasignar y Tomar solo broker, presupuesto/zona/horizonte/operación/proyecto, descarte motivado, conversión Nuevo, lista/ficha, primer contacto y audit. Pipeline→NEG, privacidad→CON, bandeja/campañas→COMU, secuencias→AUT, contenido→Portal/Studio. Protección prospecto/ponds futuros.

Casos F:L105–131,205–252: alta manual/portal/Meta/WA; sugerir/asignar/reasignar/reclamar; primer contacto; calificar/descartar/convertir; voz→propuesta; listas/cola/supervisión; export, CSV, fusión, reglas/round-robin, CAPI OUT. Negativos create sin permiso, Tomar no-broker, brokerId inválido, token inválido, duplicado sin confirmación, reasignar cerrado. CRM-LEA-ASG: sugerencia #21, Tomar #47, historial traspasos, cursor persistente/horarios/carga/idioma, SLA/reasignación, protección prospecto. No eliminar futuros del mapa.

Vistas F:L137–158: /leads, ?lead=, ?cola=1, alta/asignación/calificación/voz. Asignación/duplicados/importaciones/SLA son demos. Filtros q/status/source/página20; contador/orden+id reportados lote B sin despliegue probado. Móvil/PWA lista diaria pendiente.

## Roles, entidades, estados y reglas

Admin/assistant all con import/export nominal; manager team; broker own/Tomar; visitante/titular no operador; integración token/firma sin sesión. Seed/migración/E2E por comprobar (F:L103,384–397).

new→assigned→contacted→converted/discarded; primer contacto también desde new; calificar mantiene; descarte motivado; cerrados no reasignables/calificables/reconvertibles. Soft-delete aparte. Sugerencia NO asigna. Tomar requiere broker y sin dueño, idempotente si ya suyo assigned. Conversión crea deal Nuevo y converted_deal_id sin FK por decisión histórica. Presupuesto min≤max centavos, horizonte≥0 (F:L162–201,366–382).

Datos F:L401–435: leads→contacts, sources, projects/zones, broker/suggested users, marketing_campaigns/spend, payment_methods, activities, deals, audit. Identidad/external_id; campaign/UTM/video/mensaje; venta/alquiler/divisa/presupuestos/dormitorios/horizonte/Confotur; received_at/first_contacted_at/discard_reason/converted_deal_id/autores/fechas/deleted_at. External_id único parcial no borrados y recibo payload; no identidad global única. ad_id/gclid/fbclid dedicado, import jobs, fusión e historial consultable no vistos.

## API, eventos y conexiones

F:L209–222: POST /api/leads, /api/leads/externo con x-webhook-token; PATCH /api/leads/[id]; POST tomar/calificacion/descartar/convertir; audio /api/ai/audio-transcribe; Meta /api/integraciones/webhooks/meta. Sin API persistente CSV/round-robin/fusión. Repetir externalId mismo payload reutiliza, distinto conflicto; Meta meta_lead_<id>. sugerirBroker puro; planAssignments memoria/tests.

F:L256–327: Portal→gateway VPS crm-leads-gateway/espocrm-adapter→QH; Meta/WA→captura; CON identidad; NEG conversión; AGE/TAR contacto/followup; BRO/CFG candidatos; INV proyecto/zona; REP embudo; AUT SLA futuro; COMU plantillas/bandeja. CAPI adapter no envío automático por etapa/won: faltan configuración/elegibilidad/consentimiento. Google Offline Conversions pendiente; Calendar vía AGE, Cal.com sin evidencia; Instagram hipótesis. Twenty people/opportunity/UI no desplegado como base según fuente; QH autoridad inbound/atribución/reglas y sync P0 pendiente.

## Errores, métricas y privacidad

Deuda F:L224–237: NaN PATCH (preprocess requiere E2E), Tomar visible admin aunque403 correcto, voz fuerza crear_igual/min=max/sin aviso fallo tarea, webhook sin rate/max-body, audio~14MB sin cuotas, demos y HTML proyecto sin saneamiento BD. Son defectos atribuidos, no requisitos deseables. Carga/vacío/error/403/reintento y concurrencia de reclamación requieren pruebas.

F:L331–360: embudo/canales/dashboard/etiqueta minutos parciales; p50/p75 Speed-to-Lead, intentos, CPL y SLA futuros. Campo first_contacted_at existe, writers todos caminos no acreditados. KPIs toma/descarte/conversión/origen/duplicados sin metas aceptadas. PII mensaje/tel/email; UTM/hash no consentimiento, KYC→DOC. CON precisa escritura implícita externa que matiza LEA F:L406 «pendiente escritura».

## Pendientes y cambio al inventario

F:L441–481: sync, proveedores, E2E asignación/Tomar, voz/dedupe, límites API/IA, CSV/fusión/motor, writers/métricas, bandeja, click IDs, ponds vs #21, manager/reports y privacidad. STOP/push son contexto histórico de fuente, no órdenes ejecutadas. Amplía propuesta anterior con multicanal/voz/atribución/asignación; fase no aceptada. Proponer ingestión con recibo durable/ID negocio, conversión atómica, ownership y trazas. Resolver no-autoasignar vs round-robin/ponds y autoridad Twenty antes de automatizar.


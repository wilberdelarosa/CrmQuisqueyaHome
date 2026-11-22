# NEG — Negocios/Pipeline: lectura integral

Fuente: `00-fuentes-drive/2026-11-06/originales/modulos/VT-CRM-ESP-NEG_Negocios_v0.2_2026-11-06.md`, 379 líneas. SHA256 `3383F2ACBFE6CCA62CD2EDB68B7DA675F5452429150C794EA6DB731FB8AE47FD`. Lectura completa; borrador v0.2; `F:Lx` remite al archivo/línea. Código/QA atribuidos a 81ccf08 y lotes, no reejecutados. Híbrida es baseline documental registrada; no aceptación nueva ni bypass RBAC resuelto.

## Alcance completo y actores

Desde conversión de lead hasta cierre ganado/perdido con próxima acción, evidencia, previsión, metas/comisiones. Alta solo desde lead; tablero/lista/análisis/inspector/filtros, edición permitida, intereses/principal, historial, pérdida estructurada y cierre transaccional. Propuestas PDF/versiones/enlaces privados, descuentos/aprobaciones, bulk, vistas compartidas, archivo/borrado/reapertura y requisitos documentales configurables por etapa quedan pendientes, no se descartan del producto (F:L60–84,159–181,321–344). RES/DOC/COM/COMU/AUT conservan sus responsabilidades.

Casos F:L92–109: convertir, consultar, mover, preparar negociación, asociar interés, perder/ganar, supervisar/ver-como, analizar/exportar, sync/CAPI, PDF/descuentos. Negativos contacto sin actividad, ajeno/sin permiso, versión obsoleta, cerrado y cierre incompleto/concurrente. Admin/manager/assistant/broker/sistema; titular no operador. deals:view/create/edit/export scopes efectivos. Manager team sin export sembrado; assistant all pero sin análisis/montos de rendimiento; monto editable admin/broker, comisión admin+commissions:view, precio real permiso específico (F:L179,282–296).

## Estados, guardas e invariantes

F:L132–157: Nuevo10%, Contactado25%, Presentación40%, Preselección60%, Negociación80% abiertos; Cierre100% won; Perdido0% lost. «Seis abiertas» histórico contradice cinco enumeradas. Conversión primera abierta por posición, no ID fijo. No secuencia obligatoria: al entrar destino, Contactado exige actividad de contacto DEL NEGOCIO; Presentación actividad pending vigente con responsable/fecha; Preselección interés; Negociación importe/probabilidad/comisión/fecha; Perdido motivo activo+comentario; Ganado unidad principal/importe/comisión/proyecto visible/stock compatible. Cerrados no editables/reabribles; misma etapa retorna sin nuevo efecto después validar expected*. Próxima acción universal no está demostrada.

Cierre declarado atómico: CompromisosPort protege venta/alquiler; importe/fecha; historial; metas broker/compañía; atribución congelada; anual/nivel si perfil; comisión pending única; cancelar actividades futuras; audit+NegocioCambioEtapa. America/Santo_Domingo. Bloqueo/unicidad contra doble venta/cierre; requieren E2E (F:L155). Ya excede cierre manual de la propuesta inicial.

## Datos, API y UX

F:L298–321: deals identidad/contact/lead/source/broker/stage; operación/divisa/importe centavos/probabilidad/bps/fecha/notas; next_activity, stage_changed_at, closed_at y pérdida; atribución regla/proyecto/equipo. pipeline_stages kind/slug/posición/activo; loss_reasons; deal_properties con proyecto/unidad/principal/baja/motivo, principal única; stage_history; activities; unit_sales única durable; commissions/goals/profiles; audit/outbox; referencias Twenty/ads futuras. next_activity y converted_deal_id sin FK por decisiones históricas. Sin row_version propio deals observado.

API F:L161–175: POST convertir LEA; PATCH /api/pipeline/[id] y /etapa con expectedStageId/expectedStageChangedAt; POST /propiedades, PATCH/DELETE /propiedades/[propId]. Monto entero≥0, prob0–100, bps0–10000, fechaISO; PATCH no moneda/brokerId. Retirar interés no principal y conserva mínimo en preselección/negociación; no borra deal. Export Blob cliente selección visible, no páginas completas. Conversión repetida409, no éxito idempotente; expected* + lock protege transición, Idempotency-Key etapa no verificado.

Vistas F:L113–130: /negocios, vista=lista/analisis, ?deal= y /[id]; ?negocio= no alias demostrado. Comerciales/bulk previews. Filtros resultado/broker/proyecto/stage en lista, monto/divisa/fechas/campo/orden/cursor; no q libre. Preferencias localStorage no compartidas. Vacío/carga/error+rollback,403/404, alternativa teclado al drag y móvil; NEG-005 requiere browser autenticado.

## Conexiones, eventos, métricas y privacidad

LEA→NEG conversión/origen; CON identidad; AGE/TAR next action/contacto/cancelación; INV/RES principal/compromiso; NEG→COM/MET/BRO cierre; CFG etapas/motivos/RBAC; NEG→REP/INI lectura; COMU contacto/propuesta; DOC/APR futuro (F:L183–220). Twenty oportunidad/stage como proyección; entrada UI debe pasar caso QH/guardas/transacción, contrato P0 sin implementar. Evento NegocioCambioEtapa `{id,stageId}` consumidor crm.reflejarNegocio NO CAPI. CAPI adapter Lead/Schedule/Contact/Purchase y prueba no cadena comercial: stage map/elegibilidad/event_id/timestamp/dedupe/reintentos/retrocesos/divisa/atribución/Events Manager pendientes (F:L222–228). Google OC pendiente, Cal.com sin evidencia, IG/catálogo solo indirectos.

F:L230–259: conteos/valor por etapa/divisa, abiertos/ganados/perdidos; ponderado amount_cents×prob/10000 y antigüedad sobre filas cargadas, no forecast completo/histórico etapa; faltantes contados, monedas separadas. Reportes pérdida/previsión/programados/ads futuros; KPI cohortes/cierre/próxima acción/velocidad/trazabilidad sin metas aceptadas. PII mínima/export controlado; hash no base legal; documentos privados/retención/KYC asesorados.

## Pendientes y propuestas

Resolver referencias ?deal, cinco/seis open, moneda PATCH y próxima acción universal; matriz manager/assistant/campos; sync e imposibilidad bypass; CAPI; propuestas/descuentos; reapertura compensando stock/metas/comisión; forecast completo (F:L325–344). Propuesta: contratos de comando distintos de proyecciones genéricas, transacción QH autoritativa, evento inmutable con secuencia/identidad y outbox por destino; no permitir que sincronizar Twenty ejecute un cierre sin caso de uso. Es propuesta, no capacidad validada.


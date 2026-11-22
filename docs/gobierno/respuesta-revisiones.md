# Respuesta del productor a revisión independiente

2026-11-06 · Codex D01/D03. No es cierre independiente de hallazgos ni aceptación de decisiones.

QC-01: añadido UNIQUE de negocio `(source,inquiry_id)` y conservación de externalId/recibo legado, además de inbox por event_id. Escenario añadido: nuevo envelope del mismo inquiry no crea otro lead.

QC-02: añadido orden autenticación/autorización→recibo/hash→resultado previo; solo comando nuevo evalúa If-Match atómico con mutación/recibo. Añadida separación claim/lease→HTTP→ACK y delivery por destino.

QC-03: separadas revisión de trabajo/aprobada/pública; secuencia confirma borrador o solicitud y no publicación implícita. Falta de soporte actual declarada; alternativa de primera fase: solicitudes editoriales. Política por campo y urgencia pendiente del negocio.

QC-04: ownership separa ficha editorial/proyecto de unidad/reserva/disponibilidad exacta. API de unidades del portal no acreditada; opción inventario CRM→proyección portal condicionada a Q-004/Q-005.

OBS-01: mandato e investigación actualizados con confirmación una empresa/REA. OBS-02/03: registrados límites del primer corte, oferta/cierre manuales propuestos, reservas sin automatización y comisiones diferidas. OBS-04: DoD y prioridad candidatas añadidas a hoja de ruta; aceptación/objetivos reales pendientes. OBS-05: migración y casos de copropietarios/compartidos registrados como pendientes, no requisitos cerrados.

Solicitada comprobación independiente sobre nuevas versiones para precisiones técnicas. Decisiones del negocio y revisión humana no se consideran resueltas por editar documentos.

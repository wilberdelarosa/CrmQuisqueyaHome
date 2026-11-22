# INV — Inventario/Propiedades: lectura integral

Fuente: `00-fuentes-drive/2026-11-06/originales/modulos/VT-CRM-ESP-INV_Inventario_v0.1_2026-11-06.md`, 404 líneas. SHA256 `7C5BB6FF979780B123DA27B551EA7F217601E6E0B0BC40A8A2573C92518F0B0F`. Leído completo, incluida recuperación separada L183–226 por truncamiento de salida. `F:Lx` fuente/línea. Borrador; evidencia de código/QA atribuida, sin pruebas actuales. Híbrida baseline documental, no elección reabierta.

## Alcance funcional completo

QH autoridad de proyectos/unidades/precios/compromisos/disponibilidad, Twenty inventario opcional como proyección/UI; Studio narrativa/SEO con workflow; Portal proyección pública/captación. No doble SoT ni last-write-wins stock (F:L49,64,189–224). Catálogo/fichas/CRUD, matriz/inspector/búsqueda/filtros/CSV público/precios restringidos/concurrencia/holds/fases/fotos. Futuros: dossier estructura/torres/precios versionados/kit/mediateca/calidad, mapa geográfico/polígonos, PDF inmueble/import/bulk, publicación por canal/retirada/acuse, demanda/alertas y control de calidad/sync. RES/Portal siguen add-ons; satélite OBR no se omite (F:L66–117).

Casos: buscar/abrir, crear/editar proyectos/unidades, consultar stock/holds, exportar, asociar/cerrar NEG, fases/fotos, publicar canal, matching y cotizador. Negativos403/404, CRUD status409, expectedVersion obsoleta409, isPublished=true403, sold no recodificar/borrar409 (F:L98–117).

## Datos, estados e invariantes

F:L139–162,315–337: projects blueprint/presale/under_construction/delivered/rental; units available/reserved/sold/unavailable, operación sale/rent, precio one_time/monthly; held no es enum, es inventory_commitments separado. Alta available+row_version1, CRUD nunca cambia status. Venta→sold+unit_sales, alquiler→reserved. Compromiso ajeno bloquea cierre; propio/expirado requiere resolución. Contador status available no descuenta hold por sí mismo: no disponibilidad efectiva ni inventario en vivo garantizado. No borrar/recodificar sold; resto compromisos/restauración por probar.

PATCH/DELETE unidad expectedVersion opcional API hoy (UI lo envía); CAS si presente e incremento; proyecto/fase sin versión. unit code raw único activo por proyecto y normalizado para compromisos/ventas. Fases pending/in_progress/completed/delayed, promedio derivado; plantilla8 solo sin existentes, posición única. isPublished proyecto true bloqueado, fase flag no repite guardas UI; flag no entrega portal. false/isActive no prueba retirada remota.

Modelo: projects identidad/slug/zona/tipo/developer/descripción/video/precio interno/rango público/Confotur/avance/owner/flags; units atributos torres/pisos/áreas/dormitorios/baños fracción, moneda/precio/estado/código/notas/versión; inventory_commitments kind/status/refs/expira/versión con unicidad activa por unidad e identidad; holds/reservation_units; unit_sales durable; deal_properties; construction_phases; files privados con metadato visibility que no hace bucket público; audit/outbox/external_refs; mapping/publicaciones/demandas propuestos (F:L317–335).

## Roles, API, UX y errores

projects/units/unit_real_price/construction_phases y holds/reservations permisos independientes. Admin no bypass publicación. Manager team projects/units sin precio/fases sembrado; assistant all según concesión sin fases create/delete; broker own/fases view. Own real projects.broker_id y unidad hereda proyecto; N:M asignación BRO no sustituye esos filtros. CSV FloorMatrix no recibe permiso export separado y Blob podría operar en preview: no dar por resuelto bloqueo export API (F:L296–313).

F:L164–187: /api/proyectos POST/PATCH/DELETE; /[id]/unidades POST, /[unitId] PATCH/DELETE; fases/subrutas y fotos; BRO /api/brokers/[id]/proyectos. Campos esquema no siempre API: sin tower/floor/currency/owner/internalNotes unidad; PATCH proyecto no slug/moneda. SnapshotCSV whitelist/BOM/fechaUTC/versión y filtros propios matriz; no sincronía asumida con filtros tabla. Holds DTO cliente mínimo no garantiza minimización endpoint. CRUD no Idempotency-Key demostrado; claves holds/lead distintas de publicación.

Vistas catálogo tarjetas/lista/mapa esquemático, ficha slug, unidades/matriz/inspector, dossier mixto, /avances, /portal/publicacion y catalogo demo, cotizador. Vistas guardadas en memoria; reporte dato incorrecto demo. Loading/error locales citados no presentes: herencia por probar. Vacío/permiso/error/parcialStorage/offline/recuperación, móvil dock/foco y controles44px no auditoríaAA (F:L119–137). Slug ficha eq, LIKE generador: no trasladar vulnerabilidad sin contraste.

Cotizador: denominación no FX, tasa60.5 sin evidencia temporal, fallback20/30/50 inválidos, salida impresión/WA y sello obsoleto/texto fiscal excesivo documentados; no tasas/certificación nuevas (F:L187).

## Eventos, dependencias, métricas y privacidad

Dominio→Twenty opcional; PortalPublisher OUT catálogo/updates/retiro saneados, IN acuse/captación; portal→LEA externalId/UTM/proyecto no import bidireccional automático; NEG interés/cierre↔INV/RES compromisos; cierre→COM/MET/BRO; OBR/Storage fases; CON matching futuro; REP/INI agregados; COMU ficha/alertas; Meta captura/conversión/catalog social contratos distintos; Calendar indirecto y Cal.com sin evidencia (F:L205–248).

Estados de publicación preparado/aprobado/pendiente/entregado/error/retiro son propuestos. Whitelist sin precios/notas/titulares/URLs privadas; cambio comercial remoto es comando QH, no overwrite de stock. CON consentimiento implícito/own y NEG outbox≠CAPI se heredan.

F:L250–275: conteos por status, absorción(total-disponibles)/total incluye reserved/unavailable no venta pura, promedio fases no certificación, CSV, BI parcial; calidad/sync/demanda futuros. KPIs oferta confiable, cierre único, demora acuse, confidencialidad/completitud/matching, sin umbrales aceptados. Divisas separadas, sin FX supuesto; Ley172-13 y KYC asesorados, no PII holds pública.

## Cambio al inventario previo y decisiones pendientes

Contradice hipótesis inicial portal fuente catálogo: baseline documental sitúa inventario comercial en QH, Studio editorial separado. Amplía unidad/proyecto+compromiso+avance+cotizador. F:L341–361 pregunta disponibilidad efectiva/SLA; quién publica/retira/canales/evidenciasConfotur; ownership BRO N:M vs proyecto; versión obligatoria/restauración; FX/coherencia; proyecciónTwenty/UI; PDF/alertas y consentimiento. Propuesta D03: read model efectivo derivado de compromisos, autoridad por campo/editorial, command API stock y publisher con aprobación/versión/acuse por destino. Ningún bypass/RBAC/sync está demostrado.


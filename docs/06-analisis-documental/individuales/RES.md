# RES — Reservas y holds: lectura integral

Fuente: `00-fuentes-drive/2026-11-06/originales/modulos/VT-CRM-ESP-RES_Reservas_v0.1_2026-11-06.md`, 279 líneas. SHA256 `82C497D217FED3EE51B01B9724591FF93E07A07EA21FC870DF2E6F7AB7D7013D`. Leído completo; borrador v0.1, add-on. F:Lx remite a fuente/línea. Sin nueva prueba ni aprobación.

## Alcance y funciones completas

Hold protege temporalmente la unidad; reserva reúne partes, unidades, precio/divisa, depósito y condiciones versionadas, y confirma con evidencia. Se contemplan solicitar/extender/cancelar hold, convertir en reserva, confirmar, cambiar unidad, cancelar en dos pasos, filtros/listados y expiración automática. Plan de pagos, cuotas, cartera, conciliación, excepciones, facturación y documentos de reserva son previews o esquema sin UI real. Banca, pasarela y e-CF no están conectados según la fuente; quedan sujetos a decisión y asesoría (F:L42–80,215–243).

Vistas /reservas, /reservas/holds y /reservas/[publicId] Operations reales/parciales; hijas financieras son PreviewDesk/VistaPrevia con muestras. INV ofrece lectura mínima del hold. Carga, vacío, error/reintento, 401/403, éxito, vigencia vencida sin refresco y reintento al volver online; estados de demos pendientes (F:L82–92).

## Roles, entidades y reglas

Permisos holds/reservations más deals:view en layout. Admin CRUD all; assistant consulta/crea/edita all sin borrar; broker holds consulta/crea/edita own y reservas consulta/crea own; manager solo reservas view team, sin holds sembrado. Crear hold team y permisos separados de confirmar/cambiar unidad son propuestas. 0014 existe, pero auditoría decía no aplicada y admin403: comprobar entorno (F:L202–228).

Datos: holds con public_id/deal/estado/vigencia/policy_version/extensiones/motivo/row_version; hold_units con unidad/proyecto/precio/divisa/versión; reservations con total/depósito/condiciones/hash/evidencia; parties titular/representante; reservation_units con liberación/motivo; inventory_commitments; payment_*/fx_rates futuros; recibos y comandos (F:L217–226).

Solo negocio abierto; prórroga/cancelación de hold activo con motivo y versión; depósito≤total; condiciones firmadas inmutables/versionadas/hash; representante con evidencia. Confirmar requiere evidencia; cambiar unidad libera la anterior y crea compromiso nuevo sin dos activos. Centavos USD/DOP, sin FX implícito. Confirmación no equivale a venta ni integración bancaria. Idempotency-Key se acepta, pero UUID generado si falta no deduplica intentos del cliente (F:L59,118–145,184–200).

## Estados, API y dependencias

Hold activo→convertido/cancelado/expirado. Reserva borrador→pendiente_pago→en_verificacion→confirmada o expirada/cancelacion_solicitada→cancelada. Compromiso activo/liberado; no depender del refresco UI para expirar (F:L94–116).

Familias API /api/holds y /api/reservas; extender/cancelar/confirmar/cambio-unidad/cancelaciones. El ESP no fija todos los verbos y paths, no inventarlos. INV manda catálogo/precio/unidad; RES holds/reservas/compromisos; NEG negocio origen; CON identidad; DOC condiciones/evidencia; APR prórrogas/descuentos pendientes; COM comisión; ACC autorización. Twenty UI posible, nunca SoT (F:L131–155).

## Métricas, privacidad y pendientes

Totales pactados por moneda y holds próximos a vencer; conversión hold→reserva sin dashboard dedicado; morosidad/cartera demo. Objetivos de permisos, compromiso único, evidencia, demos honestas y clave cliente, sin porcentajes comerciales inventados (F:L157–180).

Partes, representación y comprobantes necesitan almacenamiento privado, permisos y retención asesorada. No hay dictamen legal en esta nota.

Faltan 0014 efectiva, E2E completo/scopes, clave cliente estable, separación de demos, expiración, cuotas reales, permisos dedicados, limpieza de vistas muertas y APR. Negocio debe decidir pagos/e-CF/pasarela y fase (F:L231–271). No se omite RES del producto por ser add-on: participa del stock y cierre. Propuesta: ledger de compromisos, reloj/expiración recuperable, claves estables y evidencia privada; no implementación.


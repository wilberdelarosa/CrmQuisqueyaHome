# POS — Posventa: lectura individual completa

Fuente `VT-CRM-ESP-POS_Posventa_v0.1_2026-11-06.md`, SHA256 `06BF51E7BDED1EF21756F87B0504CD78075CCE0E1D83979E0CDBBDBE8D14301A`; leídas líneas 1–278. Borrador Add-on; prioridad histórica baja no elimina requisitos ni riesgos al activarlo. Shell/demo de 81ccf08 es afirmación atribuida, no implementación validada. Plazos de garantía/vicios requieren asesoría; esta nota no determina obligaciones legales.

## Funciones y alcance completo

Cuatro áreas: entregas, pendientes, casos/servicio y garantías. Futuro íntegro: programar inspección de unidad, observaciones/ubicación/plazos/fotos, acta firmada versionada, cierre de entrega sin pendientes críticos, casos con categoría/prioridad/SLA/responsable, gestión y reapertura, evaluación garantía y términos versionados/vigencia/excepciones, cierre verificado por cliente, cotización/cobro fuera de cobertura con APR+consentimiento, seguimiento externo comprador y contexto avances. Actual: cuatro tabs y textos de reglas, ninguna acción persiste ni tablas POS. Fuente:43–79,81–101,120–160,228–259.

## Roles, datos y reglas

Guard actual projects:view provisional; futuro aftersales view/create/edit/close. Admin all aprueba cobertura/cierres; gerente team; broker own ve/abre/agenda, no aprueba/cierra; asistente all/team ops agenda/observa sin aprobar garantías/cobros. Entidades propuestas Inspection(unidad/fecha/responsable/requisitos/estado), DeliveryIssue(inspección/descripción/plazo/evidencia/estado), HandoverAct(inspección/versión/firma), AfterSalesCase(unidad/negocio/categoría/prioridad/estado/responsable/SLA/confirmación), Warranty(negocio/versión/términos/inicio/vencimiento/excepciones). units/deals/unit_sales son referencias, no tablas POS. Fuente:184–226.

## Estados, eventos/API y conexiones

Inspección programada→en_curso→acta_pendiente→cerrada; pendiente abierto→subsanación→cerrado_verificado; caso abierto→gestión→esperado_cliente→cerrado/reabierto; garantía vigente/excepción/vencida; acta borrador→firmada. NEG venta origina POS sin confundir cierre comercial/entrega física/transferencia jurídica; INV unidad; DOC actas/evidencias/términos privados; AGE slot; COMU avisos; CON cliente/consentimiento; APR excepciones/cobros; ACC acceso; POR seguimiento futuro; Avances contexto no SoT. No API POS real acreditada. Fuente:93–160,188–201.

## UX, fallos y privacidad

Actual always-demo, vacío/carga/error propios ausentes; permiso 403, éxito no aplica y parcial solo copy. Futuro necesita estados por operación y evidencia privada. Marcar unidad entregada nunca cierra pendientes; acta/caso requiere evidencia+confirmación cliente y cierre de entrega sin pendientes críticos. Fotos pueden revelar comprador/interior/ubicación: storage privado, autorización por caso y audit; no bucket público. Falla DOC/firma/cliente deja pendiente recuperable, no cierre simulado. Fuente:51–62,81–101,124–131,192–226.

## Preguntas y dependencia crítica

Definir caso vs pendiente vs entrega, criticidad, SLA/pausas/categorías y responsable; quién confirma, cómo representar desacuerdo/no respuesta y reabrir; garantías contractuales/versionadas y plazos con legal; excepción/cobro no es pago ni contabilidad. DOC y APR no están operativos según fuentes: no activar promesas hasta contratos y evidencia; aftersales no debe heredar todo projects:view. Acta puede reutilizar sobre DOC, por decidir. Fuente:228–270.

## Aceptación pendiente

Inspección→pendientes→acta→cierre; pendiente crítico bloquea; foto privada, rol ajeno denegado; confirmación y motivo conservados; reabrir sin borrar historia; doble callback/firma/cobro no duplica efecto; alcance/garantía/SLA aceptados. Revisión root/Luna pendiente.


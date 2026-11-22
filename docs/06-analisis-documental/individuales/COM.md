# COM — Comisiones: lectura integral

Fuente: `00-fuentes-drive/2026-11-06/originales/modulos/VT-CRM-ESP-COM_Comisiones_v0.1_2026-11-06.md`, 241 líneas. SHA256 `56F2BEBC5CE24614372B5F192F545C9717E8839D13AFC458A7FAD16A4BD493D0`. Leído completo; borrador v0.1, núcleo CRM-FIN-COM. F:Lx remite al archivo y línea. Las afirmaciones sobre código/QA se atribuyen a la fuente; no se ejecutaron pruebas ni se aceptó producto.

## Alcance y funciones completas

Libro de comisiones por negocio ganado: importes, reparto interno broker/agencia, estados, indicadores, filtros y CSV. El cierre genera una comisión pendiente única. Repartos observados y propuestas agrupadas desde comisiones aprobadas son lecturas de datos reales según la fuente; reglas simuladas y lotes de ejemplo no son contratos ni órdenes bancarias. Se conservan como funciones futuras las reglas y acuerdos versionados, splits, devengo por hitos de cobro, evidencias, clawback, lotes persistidos y aprobación dual. La versión excluye órdenes bancarias, retenciones fiscales y reparto con agencias externas; Metas es consumidor y Reservas/Aprobaciones son add-ons (F:L54–85).

Casos: consultar libro; generar al cerrar; ajustar reparto mientras pendiente; aprobar; marcar pagada; anular; exportar; definir regla; preparar/aprobar lote; compensar una cancelación. Vistas: /comisiones, ficha, /reglas y /liquidaciones mixtas, detalle de lote y /ejemplo. Carga/error existen; vacío no verificado. Mensajes de éxito y conflicto deben incluir trazabilidad; hay deuda histórica de gráficas sin tamaño (F:L87–97).

## Roles, datos, estados e invariantes

Admin consulta/edita/exporta todo; assistant consulta todo; broker consulta propio por `commissions.broker_id`; manager consulta equipo nominalmente. COM dice que manager no existe, en contraste con ACC/CFG/MET y su migración 0017: es evidencia histórica desfasada, no conclusión sobre el entorno actual (F:L176–206).

`pending → approved → paid`; pending/approved pueden ir a void; paid/void son terminales. Repetir el mismo estado también devuelve 409. Reparto editable solo pending; broker+agencia=10000 puntos básicos, default observado 5000/5000, sin ratificación de negocio por proyecto. Montos en centavos; 450 bps=4,5%; no sumar USD y DOP ni convertir sin política. Una comisión por deal. Aprobación no equivale a pago; comprobante es requisito pendiente, hoy paid puede registrarse sin evidencia. Nueva regla no reescribe historia ni una tasa observada constituye contrato (F:L99–124,148–174).

Modelo activo `commissions`: deal único, broker, divisa, venta, tasa, total, reparto/importes, estado, fecha comercial, aprobador y pago. M40 solo esquema: reglas/versiones/acuerdos/splits/entries/events/adjustments, batches/lines, cuentas de beneficiarios, solicitudes de aprobación y FX. Estados M40: esperada/devengada/aprobada/exigible/pagada/retirada, con hito, evidencia y comando origen; mapeo y convivencia con modelo activo pendientes (F:L113,187–193).

## API y comunicaciones

PATCH /api/comisiones/[id] acepta estado y/o `brokerShareBasisPoints`, valida alcance y fila bloqueada, transacción, auditoría e idempotencia COMISION. GET /api/comisiones/export usa los filtros. Creación desde cierre NEG con cálculo y unicidad. Auditoría antigua dice clave ignorada, código citado la aplica: verificar despliegue y replay; sin bulk acreditado (F:L115–124).

NEG entrega cierre/importe/atribución y crea pending atómicamente; INV aporta unidad/proyecto vía negocio; COM alimenta MET/BRO/REP; RES/pagos no conectados a hitos/clawback; DOC debe custodiar comprobantes; APR sigue demo. ACC/auditoría/idempotencia son transversales. Twenty solo podría recibir KPI de lectura, nunca escribir la comisión. No hay emisión externa COM ni CAPI comercial demostrados (F:L126–150).

## Métricas, privacidad, preguntas y propuestas

Indicadores por estado/divisa; CSV; repartos por proyecto/tasa; propuestas por beneficiario. Faltan filtros de periodo/broker en Inicio, comprobantes PDF e informes programados. Objetivos: cero discrepancias pantalla/CSV, pagos sin evidencia y duplicados; tiempos aprobación/pago sin umbral aceptado. Las 17 comisiones históricas incluyen semilla y no prueban adopción (F:L152–162).

Rendimiento, cuentas beneficiarias y comprador indirecto son datos personales: minimizar, limitar export y revisar logs/retención. Retenciones, moneda de pago y FX requieren asesoría del cliente.

Pendientes: motor de reglas, lotes duales, comprobante, devengo/clawback, migración M40, idempotencia desplegada, FIN-001, manager y proyección KPI. Preguntas: firma o cobro como hito, reparto, proponente/aprobador, retenciones, convivencia de modelos (F:L197–231). Frente al inventario inicial, COM es núcleo documental y no queda simplemente diferido. Propuesta D03: una autoridad financiera, historia inmutable y ajustes compensatorios, segregación de responsabilidades y evidencia; sigue siendo propuesta.


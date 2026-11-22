# Revisión independiente de Luna — paquete Drive CRM QH

**Fecha:** 11 de noviembre de 2026  
**Resultado:** apto para evaluación de producto y arquitectura en etapa documental; **no listo para autorizar construcción, migración ni producción**.

## Alcance y evidencia revisada

Revisé en Drive `LEER-PRIMERO-evaluacion.md`, el documento maestro Markdown y el mapa interactivo. Contrasté estos archivos con el ZIP que acompaña el paquete y su estructura: 30 notas individuales, siete HTML de diagramas, el catálogo de casos de uso, el mapa de comunicaciones y los archivos de gobierno/estado. Comprobé que los enlaces principales del maestro y los siete diagramas están representados en el ZIP.

No volví a leer las 57 fuentes originales página por página durante esta revisión independiente. La evaluación de su contenido individual se apoya en el consolidado y los artefactos de cobertura; para validar cualquier interpretación disputada, el evaluador debe consultar los originales en la carpeta fuente enlazada desde `LEER-PRIMERO-evaluacion.md`. Tampoco se ejecutó ni evaluó el producto actual.

## Juicio general

La propuesta mantiene una separación razonable entre el dominio operativo de Quisqueya Home, Twenty Community y el portal; identifica quién debería gobernar cada familia de datos y describe los sentidos de entrada y salida. También distingue claramente los requisitos documentales de las integraciones que se han probado. El plan conserva las dependencias inmobiliarias importantes: consulta y asignación, oportunidad, unidad/stock, hold/reserva, cierre, metas y comisiones.

El punto fuerte es la trazabilidad y la cautela ante «bidireccional»: la entrega propone comandos, proyecciones, acuses y un solo escritor autorizado por campo, no dos bases maestras editables a la vez. Inbox/outbox, deduplicación, versiones, resultado desconocido, reintentos y conciliación son una buena base de conversación técnica.

Queda por convertir esa arquitectura conceptual en contratos aceptados. Varias tablas expresan objetivos o controles por acordar, no interfaces implementables. El documento reconoce esta limitación; por eso su rótulo «final» debe conservarse como entrega documental.

## Hallazgos priorizados

### P1 — Cerrar contrato de autoridad y sincronización antes de construir adaptadores

**Evidencia:** secciones 6, 8, 9 y 18. El portal conserva hoy un catálogo editorial propio, mientras que el objetivo asigna a QH inventario/stock y deja autoridad editorial por campo por definir. C-02/C-03 y C-04/C-05 están marcados como contratos pendientes; no hay mapa aceptado campo a campo, IDs/correlación, esquemas de evento/comando, reglas de conflicto, SLA de frescura ni proceso aprobado de reconciliación/migración.

**Riesgo:** publicar stock/precio desactualizado, sobrescribir trabajo editorial o crear leads/propiedades duplicados al reintentar o migrar.

**Cierre sugerido:** aprobar primero matriz entidad/campo→sistema escritor, contrato de comandos/eventos y catálogo de estados; mantener un piloto de lectura/proyección y dry-run de conciliación antes de permitir escritura en ambos sentidos.

### P1 — Precisar la frontera de autorización de Twenty y los datos sensibles

**Evidencia:** secciones 5, 6, 8 y 12. ACC es la autoridad propuesta, pero el propio texto indica que falta comprobar API directa/UI nativa/exportaciones/búsqueda/jobs de Twenty. KYC/documentos necesitan ACL por objeto y propósito; la conexión directa de un usuario a Twenty podría dejar una ruta que evite la capa de QH.

**Riesgo:** privilegios más amplios que el scope de QH o exposición de KYC/expedientes aunque el CRM oculte acciones en pantalla.

**Cierre sugerido:** decidir el patrón de acceso y demostrarlo con pruebas negativas por rol y recurso en todos los caminos (API, UI, export, búsqueda y tareas de fondo), incluido ver-como. No cargar datos reales hasta demostrar aislamiento y revocación.

### P1 — Acordar consentimiento y reglas de envío por canal antes de automatizar mensajes

**Evidencia:** C-06 a C-11, sección 10, R-09/R-12/R-17. WhatsApp, correo y Meta aparecen con adaptadores/candidatos, pero no hay credenciales/cuenta ni entrega real acreditada. AUT propone borrador y aprobación humana para WhatsApp, mientras AGE contempla recordatorios automáticos; el documento deja correcto que falta decidir política por acción/canal.

**Riesgo:** enviar comunicaciones después de una baja, duplicar un envío tras timeout o reportar como enviado/publicado un intento simulado.

**Cierre sugerido:** aprobar finalidad, consentimiento/opt-out, remitente/cuenta, aprobación requerida y estados observables por canal. Probar baja durante cola, timeout de resultado desconocido, webhook repetido y reconciliación con el proveedor antes de activar envíos.

### P1 — Definir las invariantes financieras y de inventario con responsables del negocio

**Evidencia:** secciones 10 y 15. Se distingue aprobado de pagado y ganada de meta lograda; permanecen pendientes el evento válido de meta, modelo M40, moneda, ajustes posteriores al pago y estados de reserva/reapertura. El ejemplo de cierre exige coordinar unidad/compromiso y comisión, pero varios resultados siguen siendo «por acordar/verificar».

**Riesgo:** vender una unidad dos veces, contar cierres no firmados, mezclar USD/DOP o crear una comisión pagable que no puede corregirse con auditoría.

**Cierre sugerido:** que negocio/finanzas documenten tabla de transiciones y compensaciones para hold, reserva, expiración, cierre, reapertura, comisión, aprobación, liquidación y moneda. Validar concurrencia con dos operaciones simultáneas antes de migrar inventario.

### P2 — El HTML del mapa en Drive no es autónomo

**Evidencia:** el mapa usa rutas relativas `01-arquitectura/diagrama.html`, etc.; el ZIP sí contiene esas carpetas, pero el archivo `Mapa-interactivo-CRM-QH.html` se subió por separado en la raíz de Drive. Un preview o descarga aislada no contiene esas rutas y no abre los siete diagramas.

**Riesgo:** el agente puede pensar que los diagramas no existen o evaluar solo el índice sin las vistas.

**Cierre sugerido:** descargar y descomprimir el ZIP conservando su estructura para usar el mapa local. Añadir esa advertencia junto al HTML en Drive o cargar las siete vistas/subcarpetas a Drive conservando las rutas.

### P2 — Referencia a informe Luna no entregado en el paquete

**Evidencia:** el documento maestro, sección 19, enlaza `../06-analisis-documental/revision-luna.md`, pero ese archivo no está en el ZIP revisado. Este informe independiente se llama `revision-luna-drive.md`.

**Riesgo:** enlace roto y atribución ambigua de qué revisión independiente se incorpora a esta entrega.

**Cierre sugerido:** reemplazar el enlace del maestro por el nombre correcto cuando se incorpore este archivo, o retirar la referencia si la revisión queda externa. Actualizar la copia del paquete en Drive para que ZIP, HTML y Markdown apunten a la misma versión.

### P2 — La especificación de API debe ser un entregable separado del diagrama

**Evidencia:** sección 8 declara que no inventa endpoints, y sección 18 enumera contratos pendientes. Se describen flujos y controles, pero no se fijan rutas/esquemas OpenAPI, autenticación de servicio/webhook, versionado, catálogo de errores, paginación, límites, scopes técnicos ni requisitos de conciliación por proveedor.

**Riesgo:** dos equipos pueden construir interpretaciones incompatibles del mismo enlace bidireccional y diferir la seguridad/fallos hasta producción.

**Cierre sugerido:** elaborar contratos ejecutables versionados para portal, captación y Twenty primero; revisar seguridad y fallos con ejemplos de payload/evento antes de programar adaptadores.

## Aspectos que sí están coherentes

- Los 22 módulos se ordenan como 15 núcleo y 7 complementos; Comisiones y Academy quedan dentro del núcleo documental. El conteo distingue subcapacidades de módulos.
- QH aparece como autoridad de reglas inmobiliarias, inventario efectivo, permisos y metas/comisiones; Twenty se trata como destino/proyección de capacidades que deben acordarse.
- Portal y CRM se conectan por mensajes identificables, con recibos, deduplicación y reconciliación; «bidireccional» no se usa como autorización para conflicto de escritura libre.
- Se separan datos editoriales y operativos, medios públicos y archivos privados, mensaje preparado y mensaje enviado, aprobación y pago, y progreso de Moodle y resumen de Academy.
- La hoja de ruta ordena contratos y plataforma de confianza antes del circuito comercial y la integración pública; no promete fechas ni declara gates satisfechos.
- Los diagramas son vistas complementarias; la revisión de navegador que registra el paquete no se presenta como prueba de producto, privacidad ni API real.

## Decisiones pendientes que necesitan dueño

1. Autoridad por campo y tratamiento de cambios editoriales existentes durante la migración.
2. Frontera de UI/API de Twenty, roles de manager/assistant, scopes de equipo y revocación.
3. Dominio/URL efectivos del portal y credenciales/cuentas de integración.
4. Estados y efectos de hold, reserva, cierre, reapertura, meta, comisión y pago; moneda y M40.
5. Consentimiento, retención, derechos y aprobación de mensajes; validar con responsables legales/operativos, pues este paquete no es opinión legal.
6. Contratos de Calendar/ICS, Moodle, almacenamiento privado y BI opcional, o decisión de excluirlos del primer corte.
7. Criterios de aceptación, SLA de sincronización, volúmenes, RPO/RTO, responsables de DLQ y plan de migración/corte.

## Recomendación de siguiente paso

Conservar el paquete como base de evaluación. Antes de iniciar una implementación del CRM completo, facilitar al equipo propietario una revisión de alcance/roles, elegir el primer flujo vertical, aprobar los contratos portal↔QH y realizar un prototipo UI navegable con estados reales/simulados diferenciados. Después, someter el contrato de autoridad y seguridad a revisión técnica independiente y únicamente entonces abrir la construcción del primer corte.

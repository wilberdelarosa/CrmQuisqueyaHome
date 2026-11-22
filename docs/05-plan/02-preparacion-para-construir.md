# Preparación para construir el CRM

## Entradas del proyecto

| Decisión o necesidad | Leer primero |
| --- | --- |
| Nombres, orden y correspondencias de los 22 módulos | [Catálogo vigente](../01-descubrimiento/02-estructura-de-modulos.md) |
| Especificaciones por módulo, casos y tablero | [Specs exportadas](../00-fuentes-drive/central/02-Modulos/Specs%20de%20los%2022%20m%C3%B3dulos.txt), [casos de uso](../07-documento-maestro/catalogo-casos-de-uso.csv), [tablero histórico](../00-fuentes-drive/central/01-Tablero/tablero-estatico.html) |
| Arquitectura objetivo y reglas | [Documento maestro](../07-documento-maestro/CRM-QH-DOCUMENTO-FINAL-2026-11-06.html), [mapa técnico](../08-diagramas-interactivos/index.html), [matriz de comunicaciones](../07-documento-maestro/comunicaciones.csv) |
| Diseño, estados y referencias | [Sistema de diseño](../04-diseno/DESIGN.md), [brief de pantallas](../04-diseno/01-brief-y-referencias.md) |
| Infraestructura y conexión | [VPS](../10-espacio-local/VPS.md), [inventario histórico](../00-fuentes-drive/central/04-Infraestructura/inventario-docker.md) |

La carpeta Central aporta el catálogo y el estado histórico del CRM previo. El ADR de noviembre registra Twenty Community más dominio propio de Quisqueya Home como arquitectura objetivo documental. Al implementar, usar sus límites de autoridad y contrastar cada referencia histórica de API o base con el código y el entorno elegido.

## Límites por capa

- **Diseño y experiencia.** Plataforma da el shell y el registro de navegación. Luna UI aporta componentes, tokens, estados y accesibilidad. Cada módulo define sus pantallas y permisos.
- **Aplicación QH.** Casos de uso y autorización por rol y alcance. QH gobierna inventario, compromisos, reglas de cierres, metas y comisiones. Formularios y vistas delegan validación y cambios de estado al servidor.
- **Persistencia QH.** PostgreSQL, referencias externas, auditoría e inbox/outbox para entregas. Medios públicos separados de expedientes privados.
- **Adaptadores.** Twenty, Portal, comunicaciones, Calendar, Moodle y almacenamiento detrás de contratos. El portal tiene catálogo editorial existente. Definir su autoridad por campo y los identificadores antes de conectar escrituras.

## Primer corte propuesto

Consulta del portal → Lead → responsable → seguimiento → visita. Usar una entrada sintética con identificador de origen y catálogo en lectura. La ficha de Leads debe mostrar de dónde llegó, quién la atiende y cuál es la próxima acción. Una reentrega del mismo evento debe devolver el recibo existente. Un cambio de payload con la misma clave se trata como conflicto. El alcance de roles y los acuses de entrega se verifican en servidor.

| Orden de trabajo | Resultado que permite pasar al siguiente paso |
| --- | --- |
| 1. Alcance, actores y datos | Roles y alcance del piloto acordados, IDs y campos con un único sistema escritor |
| 2. Contrato de entrada | Payload y errores, autenticación, idempotencia, acuse, reintento y conciliación definidos |
| 3. Diseño del recorrido | Shell, lista y ficha de Lead, próxima acción y cita con estados verificables |
| 4. Implementación del corte | Entrada y registro local, autorización por recurso, vínculo a catálogo y auditoría |
| 5. Comprobación del corte | Casos por rol, duplicado, timeout, caída de integración, conflicto y recuperación |

Antes de avanzar a publicación, acordar transición editorial e invalidación de caché. Antes de efectos financieros, cerrar las reglas de reserva, disponibilidad, moneda, metas y comisiones. La [revisión Luna](../06-analisis-documental/revision-luna.md) explica estas decisiones. La [hoja de ruta de noviembre](01-hoja-de-ruta.md) conserva las dependencias para el resto del CRM.

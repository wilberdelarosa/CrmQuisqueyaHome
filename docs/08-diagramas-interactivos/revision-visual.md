# Revisión acotada del paquete web

Fecha: 2026-11-06. Actor real: codex-archify, inspección del productor. No constituye revisión independiente ni aceptación humana de arquitectura.

Los siete HTML actuales pasan finalize showcase, check con procedencia y browser-check. Las capturas Archify de arquitectura e integraciones pasan contención, legibilidad, estados de tema y controles del visor, con recibos separados en `01-arquitectura/visual/` y `04-integraciones/visual/`.

Se abrieron e inspeccionaron realmente arquitectura light/dark a 1440×900, integraciones light a 1440×900 y dark a 2048×1320. No se observaron cajas cortadas, flechas atravesando nodos ni etiquetas superpuestas en esas capturas. Integraciones ocupa más altura y se recorre verticalmente; contexto pequeño en vista general, ampliable con el visor. No se declara inspección visual completa de los siete diagramas. Reservas conserva sugerencia advisory por desvío de la ruta de expiración/cancelación, sin fallo de gates.

El índice se probó con Chrome mediante Playwright: seleccionar las siete vistas carga SVG, catálogo muestra 22 módulos, buscar Metas devuelve uno, filtro add-on devuelve siete, fuentes por nodo tienen enlaces, móvil390 no desborda y cero errores JS. Se corrigieron los dos títulos iguales de navegación para distinguir Núcleo/Add-on. Evidencia `output/playwright/revision-indice.json`.

El enlace Documento maestro se abrió desde el índice y carga el HTML final. Documento verificado a1440×1000 y390×844: sin desborde horizontal, 30 detalles desplegables y primer detalle abre; cero errores JS. Capturas `output/playwright/documento-desktop.png` y `documento-mobile.png`, inspeccionadas con texto legible y jerarquía conservada. No es revisión de todo el documento ni validación semántica. Evidencia `output/playwright/revision-documento.json`.

Las pruebas anteriores evalúan artefactos web locales y navegación. No prueban conexiones API, ejecución de reglas CRM, aislamiento RBAC, Twenty desplegado o integraciones externas. Luna/D14 y humano conservan sus revisiones independientes.

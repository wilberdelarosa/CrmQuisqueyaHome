# Diagramas interactivos Quisqueya Home

Abrir `index.html` en un navegador. Índice local: siete diagramas, buscador de los 22 módulos y fuentes enlazadas por nodo/tarjeta. Cada HTML funciona de forma independiente con SVG y visor incluidos. No requiere instalar nada ni conexión para explorar los mapas; los enlaces Drive sí requieren acceso de red y permisos.

## Uso

- Elegir mapa en navegación lateral o usar el catálogo de módulos.
- Abrir diagrama completo para disponer del ancho del navegador.
- Usar buscador del visor, foco de nodo, rutas dirigidas, zoom, tema y exportación.
- Fuentes locales y Drive están en “Fuentes por nodo o tarjeta” y en el catálogo de módulos. Los campos sources de Archify se reservan a evidencia de repositorio verificado; aquí se enlazan documentos desde el índice sin simular una verificación Git.

## Alcance de la evidencia

Arquitectura **objetivo documental** para una empresa. ADR registra híbrida Twenty Community + dominio QH; no certifica Twenty instalado o sincronizado. Revisor humano de arquitectura pendiente. Quince módulos núcleo + siete add-on = 22; ASG y OBR son subcapacidades, por eso el inventario de origen contiene 24 filas.

Los siete artefactos pasan `finalize --quality showcase --json`: validate, deliver, strict check y browser-check con Chrome. Cada subcarpeta conserva candidato JSON, HTML, sidecar de procedencia y recibos. `verificacion-paquete.json` apunta al recibo vigente y hash del HTML, no a una corrida histórica fallida. Los intentos fallidos se conservan para trazabilidad.

El primer intento con Node24.13 falló por pipe de Chrome. Se resolvió usando Node24.18 ya instalado, sin alterar Archify. La secuencia se reparó retirando un viewBox forzado para permitir altura intrínseca legible. No se redujo el perfil showcase ni se eliminó significado.

No se probó runtime CRM, integraciones remotas, autenticación real ni datos de producción. Los mapas 02/03 son **agrupación funcional**, sus líneas no significan llamadas de código. Publicación/reservas muestran contratos propuestos y resumidos; precios, plazos, aprobación y políticas siguen los pendientes del documento maestro.

Revisión perceptual global no realizada. Reservas tiene sugerencia advisory por un desvío en la ruta de expiración/cancelación alrededor de revisión de prórroga: gates automáticos pasan, no equivale a aprobación visual. Se realizaron capturas e inspección acotada de arquitectura e integraciones, además de índice/documento final desktop/móvil; detalles y límites en revision-visual.md.

## Fuentes

Inventario de Drive preservado en `../00-fuentes-drive/2026-11-06/inventario-drive.json`; originales en su carpeta `originales/`. Control de 57 archivos, pares MD/PDF y ZIP en `../06-analisis-documental/control-fuentes.md`. El documento maestro vive en `../07-documento-maestro/CRM-QH-DOCUMENTO-FINAL-2026-11-06.html`.

## Herramienta

Archify instalado 3.0.1. Una consulta del 2026-11-06 encontró 3.2.0: https://github.com/tt-a1i/archify/releases/tag/v3.2.0 . La skill instalada no se cambió; el usuario puede pedir posponer o ignorar el recordatorio. No se instaló actualización.

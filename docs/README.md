# Documentación del proyecto

En orden de lectura:

| Carpeta | Qué contiene |
|---|---|
| [01-descubrimiento](01-descubrimiento) | Alcance propuesto, roles, requisitos y la estructura de los 22 módulos |
| [02-investigacion](02-investigacion) | CRM abiertos comparados (EspoCRM, Twenty, Frappe), herramientas de diseño, inventario del portal y del CRM anterior |
| [03-arquitectura](03-arquitectura) | Arquitectura conceptual, integración y escenarios de fallo, plataforma empaquetada (núcleo propio y motores abiertos) |
| [04-diseno](04-diseno) | Sistema de diseño, referencias del CRM anterior y capturas del CRM nuevo |
| [05-plan](05-plan) | Hoja de ruta y preparación para construir |
| [06-analisis-documental](06-analisis-documental) | Análisis uno por uno de los documentos de la carpeta Central de Drive |
| [07-documento-maestro](07-documento-maestro) | Documento final con módulos, fuentes de verdad, contratos, riesgos y fases |
| [08-diagramas-interactivos](08-diagramas-interactivos) | Siete diagramas navegables; abrir `index.html` |
| [10-espacio-local](10-espacio-local) | Espacio de trabajo local y conexión segura a la VPS |
| [gobierno](gobierno) | Mandatos, decisiones del dueño, preguntas abiertas, revisiones independientes y evidencia de cada corte |

## Decisiones clave

- **DEC-001 y DEC-004:** núcleo propio y producto nuevo, reutilizando solo el motor de reglas ya probado; EspoCRM, Twenty y Odoo quedan como conexiones opcionales ([gobierno/decisions.md](gobierno/decisions.md)).
- **Mandatos:** [M-003](gobierno/mandato-construccion.md) y [M-004](gobierno/mandato-crm-nuevo.md).
- **Evidencia:** [corte 0 y 1 en el CRM anterior](gobierno/evidence-corte-0-1-2026-11-12.md) y [corte N0 del CRM nuevo](gobierno/evidence-corte-n0-2026-11-12.md).

Las fuentes originales de Drive (PDF y documentos) no están en este repositorio: siguen en la carpeta Central de Drive y en la copia local del proyecto.

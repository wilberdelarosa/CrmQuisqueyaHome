# INVENTARIO — Inventario por corte y estado histórico

Productor Codex D01/D03 · 2026-11-06. Lectura completa de 145 líneas.

Fuente: `VT-CRM-INV-Modulos_v0.2_2026-11-06.md`. SHA256 `5ada8657f905d4f66f96c9c35ed33b9c86e2c08652f6e473e46aeb21ef42d92e`. Procedencia: inventario-drive.json; original inalterado.

## Contenido y alcance

24 filas: 17 núcleo (incluye asignación y avances como submódulos) y siete add-on. Expande a 22 ESP: 15 núcleo y siete add-on. Indicadores históricos: 7 completos, 10 parciales y 7 bloqueados/demo según auditoría citada.

## Interpretación y reconciliación

El encabezado actualiza elección OSS; tablas heredadas que dicen sin ADR están supersedidas. Los iconos no son resultado de QA actual ni del nuevo CRM. Referencias Cuba/Lote A/B no incluidas se registran como ausentes.

## Arquitectura, datos y comunicaciones

Conflicto de código: inventario CRM-COM es Comunicaciones y CRM-FIN-COM Comisiones; usar COMU para comunicaciones y COM para comisiones en nuevo catálogo con aliases explícitos. Portal citado .com frente a portal local .tech: hostname de producción pendiente de verificar.

## Localizadores

- `VT-CRM-INV-Modulos_v0.2_2026-11-06.md:15` — Inventario de módulos — CRM Quisqueya Home (v0.2)
- `VT-CRM-INV-Modulos_v0.2_2026-11-06.md:46` — Tabla de inventario
- `VT-CRM-INV-Modulos_v0.2_2026-11-06.md:77` — Conteos (v0.2)
- `VT-CRM-INV-Modulos_v0.2_2026-11-06.md:79` — Por corte de producto (Grok Bot)
- `VT-CRM-INV-Modulos_v0.2_2026-11-06.md:88` — Por estado real (auditoría)
- `VT-CRM-INV-Modulos_v0.2_2026-11-06.md:96` — Críticos / Alta abiertos
- `VT-CRM-INV-Modulos_v0.2_2026-11-06.md:103` — Implicación reconstrucción vs parche
- `VT-CRM-INV-Modulos_v0.2_2026-11-06.md:111` — Lote A (lectura Cuba) — cerrado
- `VT-CRM-INV-Modulos_v0.2_2026-11-06.md:122` — Lote B (fixes UI, sin push)
- `VT-CRM-INV-Modulos_v0.2_2026-11-06.md:131` — Fuentes

## Estado de evidencia

Declaraciones del documento y propuestas de integración; no pruebas de runtime ni aceptación nueva del negocio. Las fuentes referenciadas pero no incluidas quedan por obtener. Revisión independiente solicitada a Luna.


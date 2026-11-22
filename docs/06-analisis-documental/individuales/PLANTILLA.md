# PLANTILLA — Contrato de especificación

Productor Codex D01/D03 · 2026-11-06. Lectura completa de 251 líneas.

Fuente: `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md`. SHA256 `c875aa094279f16cb42f172cea2c6090555c0a8da65723f79b289139af4571b6`. Procedencia: inventario-drive.json; original inalterado.

## Contenido y alcance

Diez secciones: alcance, casos de uso, pantallas, estados, acciones, conexiones, métricas, metas, reglas/permisos y datos. Exige negativos, fuentes y revisión distinta del autor.

## Interpretación y reconciliación

Aplicable como checklist de cobertura, no como requisito funcional nuevo. Cada hueco debe rastrearse a módulo, dueño y aceptación. Toda pantalla debe representar carga, vacío, error, sin conexión, éxito y sin permiso, además de conflicto cuando aplique.

## Arquitectura, datos y comunicaciones

Exige dirección y estado de integración, RBAC own/team/all, idempotencia y distinción UI sin API/API sin UI. Mención Cal.com en plantilla es ejemplo, no integración elegida para QH.

## Localizadores

- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:13` — Plantilla: especificación por módulo — CRM Quisqueya Home
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:24` — Bloque de control documental (obligatorio al inicio de cada espec)
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:44` — VT-CRM-ESP-<COD> — <Nombre del módulo>
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:61` — 1. Propósito y alcance
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:73` — 2. Casos de uso (actores)
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:87` — 3. Pantallas / vistas (layout, componentes, rutas)
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:101` — 4. Estados y transiciones (pipelines, status, flags)
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:115` — 5. Funciones / acciones (CRUD, filtros, bulk, handoffs)
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:131` — 6. Conexiones (WA/IG, Cal.com, Supabase, catálogo Meta, otros módulos)
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:146` — 7. Reportes y métricas
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:156` — 8. Metas de negocio / KPIs del módulo
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:168` — 9. Reglas de negocio y permisos
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:170` — 9.1 Reglas de negocio
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:176` — 9.2 Permisos RBAC
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:193` — 10. Datos (entidades, campos clave, relaciones)
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:207` — Cierre de cada espec (obligatorio)
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:209` — Huecos
- `VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md:213` — Preguntas abiertas (para owner / Grok Bot / código)

## Estado de evidencia

Declaraciones del documento y propuestas de integración; no pruebas de runtime ni aceptación nueva del negocio. Las fuentes referenciadas pero no incluidas quedan por obtener. Revisión independiente solicitada a Luna.


# Preguntas abiertas

No bloquean la entrega de investigación actual; sí el cierre de las puertas indicadas. Responsables: Wilber/dirección comercial salvo indicación.

- Q-001 · a: Wilber · bloquea: G0 · dep: D01/D02 · prioridad: alta — ¿Qué problema del CRM anterior debe desaparecer primero y cómo se mide hoy?
- Q-002 · a: dirección · bloquea: G1 · dep: D01/D03 · prioridad: alta — ¿Cuántos usuarios/asesores concurrentes, contactos, propiedades/unidades, consultas diarias y medios hay y cuánto crecerán?
- Q-003 · a: dirección · bloquea: G1 · dep: D01/D12 · prioridad: alta — ¿Quién ve cartera ajena, reasigna, exporta, negocia descuentos y publica? ¿Qué excepciones tiene cada rol?
- Q-004 · a: equipo comercial · bloquea: G1 · dep: D01/D11 · prioridad: alta — ¿Se gestionan proyectos, unidades y propiedades individuales, venta y alquiler? ¿Cómo se reservan, vencen y liberan?
- Q-005 · a: Wilber/editorial · bloquea: G2 · dep: D03/D19 · prioridad: alta — ¿Quién manda sobre precio, disponibilidad, textos, medios y publicación en cada etapa? ¿Qué debe poder editar el CRM?
- Q-006 · a: Wilber · bloquea: G1 · dep: D02/D03 · prioridad: alta — ¿Presupuesto, capacidad de desarrollo/mantenimiento, hosting y objetivo de fecha? ¿Qué tradeoffs de operación se aceptan?
- Q-007 · a: responsable de datos · bloquea: G1 · dep: D11/D12 · prioridad: alta — ¿Qué datos/documentos son necesarios, con qué finalidad, evidencia, plazos de retención y reglas de supresión/acceso?
- Q-008 · a: equipo comercial · bloquea: G1 · dep: D01/D02 · prioridad: media — ¿Qué funciones e históricos conservar del CRM anterior? ¿Importaciones, notas, adjuntos, visitas, ofertas, comisiones?
- Q-009 · a: operaciones · bloquea: G2 · dep: D03/D16/D17 · prioridad: alta — ¿SLO, demora tolerable del catálogo, RPO/RTO y responsable de atender fallos de sincronización?
- Q-010 · a: dirección · bloquea: G1 · dep: D01/D19 · prioridad: media — ¿Correo/WhatsApp/calendario entran en primera versión, qué cuentas oficiales y qué acciones requieren intervención humana?

- Q-013 · a: Wilber · bloquea: C1/G2 · dep: D03/D12 · prioridad: alta — ¿Se cambia la base del ADR (Twenty Community, AGPL) por núcleo propio + motores abiertos permisivos, dejando Twenty/EspoCRM/Odoo como conexiones opcionales? Motivo: el 2026-11-12 Wilber pidió licencia que permita vender privado. Propuesta en `03-arquitectura/03-plataforma-empaquetada.md`.
- Q-014 · a: Wilber · bloquea: G2 · dep: D03/D11 · prioridad: media — Forma de multiempresa. Por defecto: una instalación aislada por empresa, todo configurable. Alternativa: base compartida con identificador de empresa.
- Q-015 · a: Wilber · bloquea: construcción · dep: D00 · prioridad: alta — Aceptación C1 para construir los cortes 0 (línea base única) y 1 (recorrido real portal → lead → tarea → negocio → cierre → meta) descritos en `.viltrum/mandato-construccion.md`.

- Q-016 · a: Wilber · bloquea: todo el plan de construcción · dep: D00/D03 · prioridad: alta — El 2026-11-12, tras ver el primer recorrido, Wilber dijo: «pensé que íbamos a hacer un nuevo CRM mejor y más completo sin errores». D00 había leído «núcleo propio» como evolucionar el CRM existente. Opciones: (A) seguir reparando el actual; (B) producto nuevo —repositorio, pantallas, diseño y multiempresa desde cero— reutilizando el motor de reglas ya probado, módulo por módulo; (C) todo desde cero sin reutilizar nada. Recomendación de D00: B. Medido hoy en el CRM actual: motor 28.530 líneas con 198 archivos de prueba; pantallas 44.221 líneas, 71 páginas, 25 con datos de ejemplo. Las tres funciones del corte 2 (comisión por defecto, reparto, recordatorios) quedan en pausa hasta la respuesta.

## Reabiertas

- Q-011 · reabierta el 2026-11-12 — La respuesta «solo Quisqueya Home» (2026-11-06) queda sustituida por la petición de voz de Wilber del 2026-11-12: Quisqueya Home **y otras empresas configurables**. Afecta el ADR-03 de `03-arquitectura/01-arquitectura-conceptual.md`. La forma se decide en Q-014.

## Resueltas

- Q-013 · a: Wilber — Base del producto. R: **núcleo propio + motores permisivos**, «si autorizo», 2026-11-12 (DEC-001).
- Q-015 · a: Wilber — C1 para cortes 0 y 1. R: **autorizado**, «si autorizo», 2026-11-12 (DEC-002); solo desarrollo y staging.

- Q-011 · a: Wilber · bloquea: G0 · dep: D01/D03 — Una sola empresa o SaaS. R: **solo Quisqueya Home**, respuesta explícita en esta conversación, 2026-11-06.
- Q-012 · a: Wilber · bloquea: investigación REA · dep: D21 — Herramienta identificada. R: https://github.com/morluto/rea, respuesta explícita, 2026-11-06.

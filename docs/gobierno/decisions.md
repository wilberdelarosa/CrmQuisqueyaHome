# Decisiones

## 2026-11-12

- **DEC-001 · Base del producto (responde Q-013).** Núcleo propio (CRM existente, rama `orq/wilber-final-dev`) + motores abiertos de licencia permisiva + diseño propio. Twenty, EspoCRM y Odoo quedan como conexiones opcionales a través de la pasarela. Sustituye, para la base, al ADR `VT-CRM-ADR-Arquitectura-hibrida-Twenty_v1_2026-11-06`. Decide: Wilber. Evidencia: en la conversación del 2026-11-12, ante la pregunta «¿Autorizas construir los cortes 0 y 1 con núcleo propio en lugar de Twenty?», respondió «quiero el crm funcional y corriendo con todo funcional y conectado» y luego «si autorizo». Propuesta: `03-arquitectura/03-plataforma-empaquetada.md`.
- **DEC-002 · Autorización de construcción (responde Q-015).** Cortes 0 y 1 del mandato M-003. Misma evidencia. Condiciones: solo desarrollo y staging; producción requiere otra aprobación expresa; sin compromiso de fecha ni de costo.
- **DEC-004 · Producto nuevo (responde Q-016).** Se construye un CRM nuevo —repositorio, pantallas y diseño nuevos, varias empresas desde el inicio— reutilizando el motor de reglas ya probado. Decide: Wilber. Evidencia: «Sí, CRM nuevo», seguido de «con un súper diseñazo y que funcione de la mejor forma y que tenga todo lo que te hablé», 2026-11-12. Mandato: `mandato-crm-nuevo.md` (M-004). Las correcciones del commit `4ad09e6` viajan con el motor.
- **DEC-003 · Multiempresa (Q-014).** Sin respuesta explícita: se trabaja con el valor por defecto (instalación aislada por empresa, todo configurable). Reversible.

---
id: M-004
fecha: 2026-11-12
proyecto: crm-final-quisqueya-home-noviembre
estado: en_ejecucion
riesgo: R3
productor: D00 (Claude)
revisor: Wilber (dirección); Codex (código, independiente)
sustituye: el enfoque «evolucionar el CRM existente» de M-003 (su alcance funcional sigue vigente)
---

# M-004 · CRM inmobiliario nuevo: producto, pantallas y diseño nuevos sobre el motor ya probado

## Petición original

> «pero pensé que íbamos a hacer un nuevo CRM mejor y más completo sin errores» · «Sí, CRM nuevo» · «con un súper diseñazo y que funcione de la mejor forma y que tenga todo lo que te hablé» (Wilber, 2026-11-12)

## Intención

Un producto CRM inmobiliario nuevo, con diseño de primer nivel en web y en modo app, completo y confiable, vendible a varias empresas, conectado de verdad al portal. Lo único que se reutiliza es el motor de reglas que ya está probado.

## Lista de aceptación: «todo lo que te hablé»

| # | Lo que pidió Wilber | Cómo se cumple en el CRM nuevo |
|---|---|---|
| 1 | Conectado al portal de la VPS, con los proyectos cargados | Pasarela de leads y concentrador de inventario (ya en staging); catálogo real de 37 proyectos y 1.232 unidades |
| 2 | Todos los módulos de la carpeta | Los 22 módulos del índice; cada uno aparece en el menú solo cuando está certificado |
| 3 | Pipeline y flujo bien conectado | Lead → asignación → tarea → negocio → etapas → cierre → meta y comisión, en un solo recorrido |
| 4 | Esquema de base de datos bien hecho | El del motor (84 tablas, restricciones, auditoría), sin nada fijo de una empresa |
| 5 | Metas: general mensual y por broker | Compañía, equipo, broker y proyecto por mes; apertura automática del mes; vista de gerente |
| 6 | Diseño modo app en el móvil | Barra inferior, hojas deslizables, instalable desde el navegador |
| 7 | Web muy profesional, «súper diseñazo» | Sistema de diseño nuevo con marca por empresa |
| 8 | Nada simulado | Ninguna pantalla con datos de ejemplo llega al menú |
| 9 | Sistemas open source con licencia vendible y capa de diseño propia | Motores permisivos detrás de conectores (ver `03-arquitectura/03-plataforma-empaquetada.md`) |
| 10 | Quisqueya Home y otras empresas configurables | Una instalación aislada por empresa creada desde un archivo de configuración |
| 11 | Tareas y recordatorios | Tareas propias + motor de recordatorios y notificaciones |
| 12 | Google Calendar después | Conector de calendario; el motor ya maneja cuentas por usuario |
| 13 | Robusto y expansible | Motor con puertos y adaptadores; cada pieza de terceros reemplazable |

## Decisiones de este mandato

- **Repositorio nuevo** `E:\viltrum-crm-inmobiliario`, con historial propio. Procedencia del motor: `QuisqueyaHome_CRM`, rama `orq/wilber-final-dev`, commit `4ad09e6`.
- **Se importa:** dominio, aplicación, infraestructura, rutas de API, migraciones y sus pruebas (28.530 líneas, 198 archivos de prueba). Medido: solo un archivo del motor depende de las pantallas.
- **No se importa:** las 71 páginas y los componentes anteriores (44.221 líneas, 25 páginas con datos de ejemplo), ni auditorías y documentos sueltos de la raíz.
- **Certificación de módulo** (condición para aparecer en el menú): datos reales, seis estados por pantalla, anchos 320–1440, permisos por rol probados, recorrido real de punta a punta, revisión independiente.
- **Empresa configurable:** nombre, marca, colores, moneda, zona horaria y catálogos salen de configuración; nada de Quisqueya Home fijo en el código.
- El CRM anterior sigue en staging como referencia hasta que el nuevo lo reemplace. Producción no se toca.

## Sobre «sin errores»

No se promete cero errores. Se promete el filtro: nada se muestra sin pruebas en verde, revisión independiente y recorrido real.

## Plan por cortes

| Corte | Resultado |
|---|---|
| N0 | Repositorio nuevo con el motor importado y pruebas en verde; sistema de diseño; acceso y armazón web y app; levanta en local |
| N1 | Inicio, Leads, Negocios, Propiedades, Tareas/Agenda y Metas certificados, con el recorrido real del portal |
| N2 | Comisión por defecto, reparto automático de leads, recordatorios y notificaciones, vista de gerente, Google Calendar |
| N3 | Segunda empresa creada solo con configuración; despliegue en staging |
| N4+ | Resto de módulos por prioridad del negocio |

Sin compromiso de fecha ni de costo.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Rehacer 71 pantallas es el grueso del trabajo | Por recorrido, no todas a la vez; patrones compartidos (lista, ficha, tablero) |
| El motor trae deuda que no se ve en las pruebas | Cada módulo se certifica con recorrido real antes de mostrarse |
| VPS sin margen para compilar | Compilación con memoria acotada o fuera de la VPS |
| Dos CRM a la vez durante la transición | El anterior queda solo como referencia en staging |

## Cierre

Pendiente.

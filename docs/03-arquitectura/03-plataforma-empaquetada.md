# Plataforma empaquetada v0.1 — qué es propio y qué es un motor abierto

**2026-11-12 · Productor: D00/D03 (Claude) · Revisor: Wilber (arquitectura es decisión humana); D12 debe verificar licencias en el repositorio exacto antes de integrar cualquier pieza.** Propuesta pre-C1. No se construyó ni se desplegó nada. Mandato: `.viltrum/mandato-construccion.md` (M-003).

## La idea en una frase

El producto que se vende es **nuestro**: las reglas inmobiliarias, los datos y el diseño. Los sistemas abiertos se usan como **motores intercambiables** para lo que no nos diferencia, cada uno detrás de un conector propio. Así se puede vender cerrado y cambiar un motor sin rehacer el CRM.

## Las cuatro capas

| Capa | Qué contiene | De quién es |
|---|---|---|
| 1. Experiencia | Web profesional de escritorio y modo app instalable en el móvil, sobre Luna UI / Private Desk. Marca, colores y menú por empresa | Propia |
| 2. Núcleo inmobiliario | Contactos, leads, negocios y pipeline, proyectos y unidades, agenda y tareas, brokers y equipos, metas, comisiones, reportes, configuración, acceso. PostgreSQL | Propia (parte del CRM existente: 84 tablas, permisos, auditoría, 202 pruebas) |
| 3. Conectores | Contratos propios: pasarela de leads y concentrador de inventario con el portal (ya en staging), calendario, mensajería, academia | Propia |
| 4. Motores abiertos | Acceso, trabajos programados, calendario externo, automatización, mensajería, analítica, academia | De terceros, reemplazables |

## Por qué el núcleo no puede ser otro CRM

| Punto | Twenty (ADR vigente) | Núcleo propio |
|---|---|---|
| Venta privada | AGPL: lo que se modifique debe publicarse a quien lo use | Sin restricción |
| Fuente de verdad | Dos (Twenty y dominio QH) con sincronización y conflictos | Una |
| Metas y comisiones | No las trae | Ya existen |
| Diseño propio | Vestir su interfaz exige modificarla (AGPL) o no usarla | Total |
| Memoria en la VPS (medido hoy) | ~1,2 GB | ~0,15 GB |

Twenty, EspoCRM y Odoo no se pierden: ya están conectados a la pasarela de leads y al concentrador de inventario. Pasan a ser **conexiones opcionales** para una empresa cliente que ya use uno de ellos. No forman parte de lo que se vende.

## Mapa de capacidades

«Verificado hoy» = comprobado en esta sesión con fuente. «Por verificar» = recordado o de fuente secundaria; D12 lo confirma en el repositorio antes de usarlo.

| Capacidad | Decisión | Pieza | Licencia | Estado de la licencia |
|---|---|---|---|---|
| Contactos, leads, pipeline, propiedades | Propio | CRM existente | Propia | — |
| Metas (general mensual, por equipo, por broker) | Propio | Módulo Metas existente, a completar | Propia | — |
| Tareas y agenda | Propio | Tabla de actividades existente | Propia | — |
| Recordatorios y trabajos programados | Motor | pg-boss sobre el mismo PostgreSQL (sin contenedor nuevo) | MIT | Por verificar |
| Acceso y sesiones | Motor | Supabase Auth (GoTrue), ya en uso | MIT / Apache-2.0 | Por verificar |
| Calendario externo | Servicio | API de Google Calendar; el código actual ya tiene cuentas por usuario | Servicio de Google | — |
| Citas reservables por el cliente | Motor, diferido | Cal.diy | MIT | Verificado hoy (cambio de AGPL a MIT en abril de 2026; sin Teams ni Workflows) |
| Automatizaciones | Motor, diferido | Activepieces, como servicio aparte | Núcleo MIT; SSO e incrustado son de pago | Verificado hoy |
| Bandeja de WhatsApp y mensajes | Motor, diferido | Chatwoot | MIT | Por verificar |
| Academia | Motor, ya en uso | Moodle, sin modificar, por API | GPL (servicio separado) | Por verificar; requiere decisión de Wilber por ser GPL |
| Analítica avanzada | Motor, diferido | Reportes propios primero; Apache Superset si hace falta | Apache-2.0 | Por verificar |
| Componentes de interfaz | Cantera | shadcn/ui, galería PXIL, Atomic CRM (kanban, fichas) | MIT | Atomic CRM verificado hoy; resto por verificar |
| CRM de terceros | Conexión opcional | Twenty, EspoCRM | AGPL-3.0 | Verificado el 2026-11-06 (`02-investigacion/02-crm-open-source.md`) |
| CRM/ERP de terceros | Conexión opcional | Odoo 19 Community | LGPL-3.0 | Verificado hoy |

### Sobre las metas

No se encontró un sistema abierto de cuotas de venta. Lo que existe (Operately, Apache-2.0) es para objetivos generales de empresa, no para cierres por broker ligados a un pipeline. Las metas dependen de cuándo y cómo se cierra un negocio, así que deben vivir en el núcleo. El módulo ya tiene meta de compañía, de equipo, de broker y de proyecto por mes. Le falta: abrir el mes solo, medir también actividad (leads atendidos, visitas), vista del gerente sobre su equipo, alerta de ritmo e historial.

### Sobre las tareas

Los gestores de tareas abiertos conocidos (Vikunja, Plane) son AGPL (por verificar) y además duplicarían datos: una tarea del CRM vale porque está ligada a un lead o a un negocio. Se mantienen propias y se les añade el motor de recordatorios.

## Varias empresas

Por defecto: **una instalación aislada por empresa** (su base de datos, su marca, sus catálogos), creada desde un archivo de configuración. Con lo medido hoy, cada empresa cuesta cerca de 0,3 GB de RAM. Es lo más rápido y lo más seguro para datos personales: no hay forma de que se crucen. Una base compartida con identificador de empresa se justifica cuando haya muchas empresas; el diseño deja esa puerta abierta al no fijar nada de Quisqueya Home en el código.

## Estado real de partida (2026-11-12)

- Copia vigente: `E:\.viltrum-worktrees\quisqueya-crm-b7cee93`, rama `orq/wilber-final-dev`, commit `3f9aeb4`. De esa línea sale la imagen de staging (`a36ef48`).
- Copia antigua con 518 cambios sin commit: `C:\Users\wilbe\Documents\QuisqueyaHome_CRM`, rama `develop`. Hay que decidir qué se rescata antes de archivarla.
- Portal de staging, pasarela de leads y concentrador de inventario activos hace seis días.
- VPS con 2,8 GB libres de 7,9 GB y disco al 78 %: no caben más motores pesados sin apagar algo.

## Orden de construcción propuesto

| Corte | Qué queda funcionando de verdad |
|---|---|
| 0 | Una sola línea base, pruebas en verde, desplegada en desarrollo |
| 1 | Lead del portal → asignación → tarea con recordatorio → negocio → cierre → meta de broker y de compañía, con proyectos reales y diseño nuevo en web y modo app |
| 2 | Gerente y equipos, metas completas, notificaciones, Google Calendar |
| 3 | Segunda empresa de prueba creada solo con configuración |
| 4+ | Add-ons según prioridad del negocio |

Sin compromiso de fecha ni de costo hasta cerrar el corte 0, que es el que revela la deuda real del código.

## Lo que decide Wilber

1. **Q-013** Cambiar la base del ADR: núcleo propio + motores permisivos, con Twenty/EspoCRM/Odoo como conexiones opcionales.
2. **Q-015** Autorizar la construcción de los cortes 0 y 1 (C1).
3. **Q-014** Forma de multiempresa (por defecto, instalación aislada por empresa).

## Fuentes consultadas hoy

- [Atomic CRM en Supabase](https://supabase.com/partners/integrations/atomic-crm) · [comparativa de Marmelab 2026](https://marmelab.com/blog/2026/01/09/open-source-crm-benchmark-2026.html)
- [Cal.com pasa a código cerrado](https://cal.com/pt-BR/blog/cal-com-goes-closed-source-why) · [Cal.diy](https://cal.com/pt-BR/blog/cal-diy-open-source-to-closed-source)
- [Licencias de Odoo](https://www.odoo.com/documentation/master/legal/licenses.html)
- [Licencia de Activepieces](https://www.activepieces.com/docs/about/license) · [qué es gratis en 2026](https://www.activepieces.com/blog/activepieces-open-source-license-what-is-free-2026)
- [Operately](https://09f05d0a.operately-website.pages.dev/what-is-operately)

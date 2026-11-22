---
id: M-003
fecha: 2026-11-12
proyecto: crm-final-quisqueya-home-noviembre
estado: en_ejecucion
riesgo: R3
productor: D00 (Claude, sesión en E:\PERFILES AI)
revisor: Wilber (arquitectura y C1 son decisiones humanas)
---

# M-003 · CRM inmobiliario vendible: núcleo propio, motores abiertos y diseño propio, conectado al portal

## Petición original

> Hay un portal que está en el VPS. Yo quiero conectarle un CRM, necesitamos hacer un CRM, mirar todos los módulos según la carpeta que te estoy pasando, que es como pensamos en el CRM. La idea es orquestarlo en base a empaquetar varios sistemas open source, las funcionalidades; tener una capa de diseño que podamos personalizar y que se conecte con los otros sistemas open source, con una licencia que podamos vender así, privado. Una base del CRM para empresas inmobiliarias con los proyectos cargados, con el pipeline, el flujo bien conectado, su esquema de base de datos bien hecho, la parte de las metas, un diseño app-like que se vea como un diseño móvil, también la parte web muy profesional, un súper diseñazo, y todo que no sea simulado, conectado con todo lo real. Las metas: la general, creo que mensual, y la específica por brokers; no sé si hay sistema open source para eso. Un CRM robusto para inmobiliaria lo más rápido posible, con sistemas open source de por medio, con buena arquitectura, expansible, para Quisqueya Home y otras empresas que podamos configurar. También integración posterior con Google Calendar, recordatorios y un sistema de tareas.

(Transcripción de voz del 2026-11-12, junto con el comando `10-espacio-local\conectar-vps.ps1 -Accion Tunel`.)

## Intención

Tener un producto CRM inmobiliario propio y vendible a varias empresas, que funcione de verdad de punta a punta con el portal, armado sobre piezas abiertas ya hechas donde convenga, con una capa de diseño propia de primer nivel en web y en modo app.

## Ejemplos tratados como clase

- «Metas general mensual y por broker» → objetivos por periodo y alcance (compañía, equipo, broker, proyecto), con avance real, ritmo y ranking.
- «Google Calendar» → calendarios externos detrás de un conector (hoy Google; mañana Outlook).
- «Sistema de tareas open source» → tareas, recordatorios y notificaciones confiables, ligadas a leads y negocios.
- «Quisqueya Home y otras empresas» → empresa configurable: marca, catálogos, etapas, roles, metas y conexiones sin tocar código.
- «Que no sea simulado» → ninguna pantalla con datos de ejemplo en el producto: o funciona con datos reales o no se muestra.

## Alcance implícito

| Lo que conlleva | Decisión |
|---|---|
| Licencias compatibles con venta privada, verificadas en el repositorio de cada pieza | entra |
| Una sola versión de código como línea base (hoy hay varias copias) | entra, es el primer paso |
| Empresa configurable: marca, catálogos, etapas del pipeline, roles y permisos sin valores fijos en código | entra |
| Aislamiento de datos entre empresas | entra (forma: ver Q-014) |
| Permisos por rol y alcance verificados en servidor; gerente que coordina a su equipo | entra |
| Seis estados por pantalla (carga, vacío, error, sin conexión, éxito, sin permiso) | entra |
| Validación en cliente, servidor y base de datos | entra |
| Auditoría de cambios y borrado lógico | entra (ya existe, se conserva) |
| Datos personales (Ley 172-13): consentimiento, retención, exportación | entra en diseño; política se pregunta (Q-007) |
| Pruebas por recorrido y por rol antes de cada entrega | entra |
| Accesibilidad AA y puntos de corte 320–1440 | entra |
| Respaldo, restauración y reversión del despliegue | entra |
| Capacidad de la VPS (8 GB, 2 CPU, disco al 78 %) | entra como restricción |
| Reservas, cobros, documentos/KYC, posventa, comunidad, automatizaciones, aprobaciones | se difiere (add-on, corte posterior) |
| WhatsApp/bandeja unificada y campañas | se difiere |
| App nativa en tiendas | se difiere; primero app instalable desde el navegador |
| Producción | no entra sin aprobación expresa de Wilber |

## Prompt mejorado

Construir «CRM inmobiliario Viltrum» como producto de varias capas. (1) Un núcleo propio con las reglas inmobiliarias —contactos, leads, negocios y pipeline, proyectos y unidades, agenda y tareas, brokers y equipos, metas, comisiones, reportes, configuración y acceso— sobre PostgreSQL, partiendo del CRM propio ya existente y dejando una sola línea base de código. (2) Una capa de diseño propia (Luna UI / Private Desk) con dos presentaciones del mismo producto: web profesional de escritorio y modo app instalable en el móvil. (3) Motores abiertos de licencia permisiva detrás de adaptadores para lo que no es diferencial: acceso, trabajos programados y recordatorios, calendario externo, y más adelante automatizaciones, mensajería, analítica y academia. (4) Conectores con contratos propios hacia el portal (leads e inventario, ya montados en staging) y hacia otros CRM de terceros como conexión opcional. Todo valor de negocio (marca, catálogos, etapas, roles, metas) sale de configuración por empresa. Cada corte entrega un recorrido real de punta a punta con datos reales del portal, sin pantallas de ejemplo, con pruebas por rol y evidencia. Nada llega a producción sin aprobación expresa.

## Hechos verificados (2026-11-12)

- CRM propio de desarrollo y de staging responden `{"ok":true,"service":"crm"}` en la VPS · evidencia: `10-espacio-local\conectar-vps.ps1 -Accion Estado` en ambos entornos.
- En la VPS corren a la vez Twenty, EspoCRM, Odoo 19, dos pilas del CRM propio, portal de producción y de staging, pasarela de leads y concentrador de inventario · evidencia: `ssh hostinger docker ps`.
- VPS: 7,9 GB de RAM (2,8 GB disponibles), 2 CPU, disco al 78 %. Twenty usa ~1,2 GB y Odoo ~0,8 GB; el CRM propio de desarrollo, ~0,15 GB · evidencia: `free -m`, `df -h`, `docker stats`.
- Copia más reciente del CRM propio: `E:\.viltrum-worktrees\quisqueya-crm-b7cee93`, rama `orq/wilber-final-dev`, commit `3f9aeb4` (2026-11-05), 84 tablas, 202 archivos de prueba, 2 cambios sin commit; contiene `a36ef48`, el commit de la imagen de staging · evidencia: `git log`, `git cat-file`, `docker ps`.
- Copia antigua: `C:\Users\wilbe\Documents\QuisqueyaHome_CRM`, rama `develop` (2026-10-26), 75 tablas, **518 cambios sin commit**, no contiene `a36ef48` · evidencia: `git status --short`.
- El CRM propio no es multiempresa: una sola mención de `tenant` en `schema.ts` de `develop` · evidencia: búsqueda en el archivo.
- Metas ya existen en el núcleo propio (compañía, broker, proyecto y equipo, por mes) con brechas conocidas: solo cuentan cierres, no se abren solas cada mes, vista de gerente incompleta · evidencia: `E:\PERFILES AI\.viltrum\evidence\crm-propio-auditoria-roles-metas-2026-11-05.md` (H-03, H-05, H-08).
- Recordatorios y notificaciones no están activos · evidencia: misma auditoría, H-02.
- Varias pantallas son vista previa con datos de ejemplo · evidencia: misma auditoría, H-17.
- El ADR del 2026-11-06 fija Twenty Community como base y reconoce «AGPL en core» y «dual-write» · evidencia: `00-fuentes-drive\2026-11-06\originales\00 Indice y cierre\VT-CRM-ADR-Arquitectura-hibrida-Twenty_v1_2026-11-06.md:32,41`.
- La política Viltrum bloquea adoptar o adaptar AGPL/GPL · evidencia: `E:\PERFILES AI\core\system-map.md:49-50`.
- Licencias: ver tabla en `03-arquitectura\03-plataforma-empaquetada.md` (cada fila dice si se verificó hoy o no).

## Supuestos

- La rama `orq/wilber-final-dev` es la que Wilber considera buena — se asume porque es la más reciente y de ella sale staging. Si es falso: cambia la línea base del corte 0.
- «Vender privado» significa entregar el producto a otras empresas sin obligación de publicar nuestro código — si en realidad solo se ofrecerá como servicio alojado por Viltrum, hay más opciones de licencia.
- Las otras empresas serán pocas al inicio (menos de diez) — si son muchas desde el día uno, la forma de multiempresa cambia (Q-014).

## Preguntas bloqueantes

- [ ] Q-013 ¿Se cambia la base del ADR (Twenty) por núcleo propio + motores permisivos, dejando Twenty/EspoCRM/Odoo como conexiones opcionales? · a: Wilber · bloquea: todo el plan
- [ ] Q-015 Aceptación C1 para construir los cortes 0 y 1 · a: Wilber · bloquea: construcción

No bloqueantes (se avanza con el valor por defecto): Q-014 forma de multiempresa (por defecto: una instalación aislada por empresa, todo configurable).

## Clasificación

```
INTENCIÓN: cambio de alcance + construcción de producto sobre base existente
TIPO:      CRM inmobiliario multiempresa con integración API (portal) y motores abiertos
RIESGO:    R3 — datos personales, dinero (metas/comisiones), varias empresas
FASE:      F0 → F1 (C1 pendiente; G0–G2 no aceptados)
DEPARTAMENTOS: D00 → D21 (licencias) → D03 (arquitectura) → D11 (datos) → D04/D05 (diseño) → D10/D09 → D19 → D12 → D14 → D16
```

## Alcance

**Incluye (cortes 0–3):** línea base única; recorrido portal → lead → asignación → tarea con recordatorio → negocio → cierre → meta; proyectos reales del portal; metas de compañía, equipo y broker; diseño nuevo web y modo app en esas pantallas; empresa configurable; Google Calendar; segunda empresa de prueba instalada desde configuración.

**No incluye:** producción, migración de datos reales de clientes, add-ons (reservas, documentos, posventa, comunidad, automatizaciones, aprobaciones), app en tiendas, WhatsApp. Sin promesa de fecha ni de costo.

## Enfoque

**Elegido (propuesto):** núcleo propio + cinturón de motores abiertos permisivos + capa de diseño propia + conectores. Detalle y comparación en `03-arquitectura\03-plataforma-empaquetada.md`.

**Descartado:**

| Alternativa | Por qué no |
|---|---|
| Twenty como base (ADR vigente) | AGPL: no permite vender cerrado lo que se modifique; dos fuentes de verdad; sin metas nativas; ~1,2 GB de RAM |
| EspoCRM como base | AGPL y PHP; rediseño profundo exige otra interfaz completa |
| Odoo CE como base | LGPL permite módulos privados, pero es un ERP en Python, pesado y difícil de vestir con diseño propio |
| Empezar de cero | Se pierden 84 tablas, permisos, auditoría, metas y 202 pruebas ya escritas |

**¿Ya existe?** Sí: el núcleo (CRM propio), la conexión con el portal (pasarela y concentrador en staging) y el sistema de diseño (DESIGN.md). Faltan: línea base única, multiempresa, recordatorios, metas completas y diseño aplicado.

## Plan

| # | Paso | Departamento | Salida |
|---|---|---|---|
| 0 | Fijar línea base: una rama, pruebas en verde, desplegada en desarrollo de la VPS | D13, D14, D16 | commit base + reporte de pruebas |
| 1 | Recorrido real portal → lead → tarea → negocio → cierre → meta, con diseño nuevo | D11, D10, D09, D05, D19 | corte 1 en desarrollo con evidencia por rol |
| 2 | Gerente y equipos, metas completas, recordatorios, Google Calendar | D10, D09, D19 | corte 2 |
| 3 | Segunda empresa de prueba instalada solo con configuración | D03, D11, D16 | prueba de «vendible» |
| 4 | Add-ons por prioridad de negocio | según módulo | cortes siguientes |

## Criterios de aceptación

- [ ] Una sola rama base; las demás copias quedan archivadas y documentadas.
- [ ] Un lead enviado desde el portal de staging aparece en el CRM con su proyecto, se asigna, genera tarea con recordatorio que llega, se convierte en negocio, se cierra y mueve la meta del broker y la de la compañía.
- [ ] Cero pantallas con datos de ejemplo en el menú.
- [ ] Marca, etapas, catálogos y metas de una segunda empresa se configuran sin cambiar código, y sus datos no se cruzan con los de Quisqueya Home.
- [ ] Cada pantalla del corte pasa los seis estados en 320, 390, 1280 y 1440 px.
- [ ] Toda pieza de terceros tiene licencia verificada en su repositorio y registrada.

## Verificación

Pruebas automáticas por recorrido y por rol; capturas en los cuatro anchos; lead `TEST-*` real por la pasarela de staging; revisión independiente D12 (licencias y permisos) y D14 (calidad) antes de cada commit.

## Riesgos y reversión

| Riesgo | Mitigación | Cómo se revierte |
|---|---|---|
| Varias copias del código divergentes | Corte 0 antes de cualquier función nueva | Las copias antiguas se conservan sin borrar |
| VPS sin margen de memoria | No sumar motores pesados; apagar los CRM de referencia solo con permiso de Wilber | Volver a encenderlos |
| Deuda del código existente frena el diseño nuevo | Rediseñar por recorrido, no todo a la vez | Cada corte es un commit reversible |
| Licencia mal entendida | D12 verifica en el repositorio exacto antes de integrar | La pieza vive detrás de un adaptador y se cambia |

## Cierre

Pendiente.

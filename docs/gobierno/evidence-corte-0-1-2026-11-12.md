# Evidencia · cortes 0 y 1 · 2026-11-12

**Productor:** Claude (D00 orquesta; D10 en la corrección). **Revisor independiente del código:** Codex `gpt-6.1-sol` (D12/D14), tres pasadas, veredicto final APROBADO en revisión estática. **Autorización:** Wilber, «si autorizo» (DEC-001, DEC-002). Solo staging y desarrollo; producción no se tocó.

Convención: **[V]** verificado con comando o respuesta real · **[NV]** no verificado, con el motivo.

## Corte 0 · línea base única

- Línea base: `E:\.viltrum-worktrees\quisqueya-crm-b7cee93`, rama `orq/wilber-final-dev`. Antes de tocar nada: `npm test` → 1.293 pasan, 0 fallan, 2 omitidas [V].
- Staging corría `a36ef48`, tres commits de interfaz por detrás de la rama [V: `git log a36ef48..HEAD`].
- Copia antigua `C:\Users\wilbe\Documents\QuisqueyaHome_CRM` (`develop`, 518 cambios sin commit): **sin tocar**; falta decidir qué se rescata [NV].
- `npm run lint` global reporta 54.637 problemas porque recorre también las carpetas de compilación `.next-build` y `.next-dev`; en los archivos tocados sale limpio [V]. Queda como pendiente de configuración.

## Estado real encontrado en staging

| Qué | Valor | Evidencia |
|---|---|---|
| Salud de CRM desarrollo y staging | `{"ok":true}` | `conectar-vps.ps1 -Accion Estado` |
| Pasarela de leads | tres destinos en verde | `GET /health` de `crm-leads-gateway` |
| Datos del CRM de staging | 37 proyectos, 1.232 unidades, 20 leads, 10 contactos | consultas SQL de conteo |
| Personas | 2 administradores; **0 brokers, 0 gerentes, 0 equipos** | SQL sobre `users` y `teams` |
| Uso | 0 negocios, 0 actividades, 0 metas | SQL |
| Correo de invitaciones | sin configurar: alta de usuario devuelve «Correo sin configurar» | respuesta de `POST /api/usuarios` |
| Acceso de demostración | desactivado (404) en ambos entornos | `POST /api/auth/demo` |

## Fallos que cortaban el recorrido

| # | Fallo | Evidencia | Estado |
|---|---|---|---|
| F-1 | Los 21 leads llegados por la pasarela quedaban **sin proyecto** (`project_id` nulo) aunque traían el nombre | SQL: 0 de 21 con proyecto | Corregido en `4ad09e6` |
| F-2 | Los leads externos quedaban **sin origen** (`source_id` nulo) | SQL | Corregido: variable `LEADS_EXTERNO_SOURCE_SLUG` por instalación |
| F-3 | El broker responsable recibía **404 al registrar una llamada o una tarea** sobre el contacto de su propio lead; el contacto nacía sin responsable y nadie se lo pasaba | `POST /api/actividades` → 404 con el broker dueño del lead | Corregido: el contacto sigue a su lead |
| F-4 | Asignar un lead nuevo no lo pasaba a «asignado» | auditoría del 2026-11-05, H-06; código | Corregido |
| F-5 | La respuesta del alta de usuario incluye el campo `passwordHash` (hoy nulo) | respuesta de `POST /api/usuarios` | Pendiente (H-14 de la auditoría) |

Ya estaba corregido en esta rama, a diferencia de la auditoría del 2026-11-05: el gerente **sí** reasigna leads dentro de su equipo [V: `PATCH /api/leads/21` como gerente → 200].

## Corrección integrada

Commit `4ad09e6` en `orq/wilber-final-dev`, sin push. Verificación: `npm test` 1.312 pasan, 0 fallan, 2 omitidas; `tsc --noEmit` limpio; `eslint` limpio en los archivos tocados [V]. Hallazgos del revisor atendidos: carrera entre dos asignaciones del mismo contacto (se bloquea el contacto antes de mover el lead), conversión de un lead ya asignado, e interbloqueo posible con la creación de notas (bloqueo `NO KEY UPDATE`).

**No verificado:** prueba de concurrencia real en PostgreSQL. La regla se probó con dobles en memoria y guardas sobre el SQL declarado.

## Datos de prueba creados en staging

- Usuarios: `gerente.prueba@`, `broker1.prueba@`, `broker2.prueba@`, `broker3.prueba@` (dominio quisqueyahome.do), creados por la API real del CRM; `admin.prueba@` ya existía. Claves solo en la VPS: `/opt/quisqueya-crm-staging-auth/usuarios-prueba.env` (600).
- Equipo «Equipo Punta Cana (prueba)» con los tres brokers y el gerente como supervisor.
- Metas de noviembre 2026: compañía 9 cierres / USD 1.800.000; cada broker 3 cierres / USD 600.000.
- Lead `TEST-e2e-001927` (id 21), convertido en el negocio 1. También quedó en EspoCRM y Odoo por la pasarela.
- Variable `LEADS_EXTERNO_SOURCE_SLUG=portal_web` añadida al `.env` de staging (respaldo `.env.bak-*-fuente`).

Limpieza: todo lleva la marca «prueba» o `TEST-`; se retira cuando Wilber lo indique.

## Despliegue en staging

- `scripts/deploy-staging-vps.sh` → `staging 4ad09e6: /login 200`; la compilación completa (`next build`) pasó en la VPS [V].
- Imagen anterior `quisqueya-crm-staging:a36ef48` conservada para volver atrás [V].
- **Costo del despliegue:** durante la compilación la VPS agotó la memoria de intercambio (3 MB libres) y los sitios públicos no respondieron en una medición de 15 s; después volvieron a 0,6–0,9 s en nueve mediciones seguidas [V]. Disco: del 78 % al 83 % [V]. Compilar dentro de la VPS no es sostenible.

## Recorrido real después de la corrección (staging, datos reales del portal)

| Paso | Resultado | Evidencia |
|---|---|---|
| Lead por la pasarela (`TEST-e2e-005351`, «Vista Farallón») | 201; llega al CRM propio (id 22), a EspoCRM y a Odoo | respuesta de la pasarela |
| Proyecto y origen | vinculado a «Vista Farallón», origen `portal_web` | SQL sobre `leads` |
| Relleno de leads anteriores | 21 revisados: 16 con proyecto, 21 con origen; 5 sin proyecto porque su texto no corresponde a ninguno | salida del relleno |
| Admin asigna al broker 1 | estado `assigned`; contacto 28 pasa al broker 4; ambas cosas auditadas | `PATCH /api/leads/22`, `audit_log` |
| Broker 1 registra llamada y tarea sobre el contacto | 200 (antes 404) | `POST /api/actividades` |
| Otro broker intenta lo mismo | 404: el aislamiento se mantiene | `POST /api/actividades` como broker 2 |
| Conversión | negocio 2 en la primera etapa | `POST /api/leads/22/convertir` |
| Contactado sin actividad del negocio | 409 con mensaje claro | `PATCH /api/pipeline/2/etapa` |
| Contactado → Presentación → Negociación | 200 en cada paso al cumplir su requisito | idem |
| Cierre con la unidad real SG-A102 (Sun Garden), USD 376.000 | 200; unidad `sold`; 1 comisión creada | SQL sobre `deals`, `units`, `commissions` |
| Metas de noviembre | compañía 1/9 y USD 376.000 de 1.800.000; broker 1: 1/3 (33 %); brokers 2 y 3: 0/3 | SQL sobre `goals` y pantalla `/metas` leída como admin, broker y gerente |
| Concentrador de inventario | portal, CRM propio, EspoCRM y Odoo en verde; último ciclo correcto | `GET /health` de `inventario-hub` |

**No verificado:** que la unidad SG-A102 figure como vendida en el portal de staging, EspoCRM y Odoo (solo se comprobó la salud del concentrador); las pantallas en navegador con sesión iniciada (solo se abrió la de acceso; las demás se leyeron por HTTP con la sesión de prueba); anchos 320–1440; recordatorio de la tarea creada (no existe el motor todavía).

## Configuración cambiada en staging (reversible)

- Rol broker: `projects:view` y `units:view` pasaron de `own` a `all`. Motivo: cada proyecto admite un solo broker (`projects.broker_id`), y con `own` un broker nuevo no ve el catálogo ni puede asociar una propiedad a su negocio. Matriz anterior en `.viltrum/permisos-broker-staging-antes-2026-11-12.json`. **Decisión de negocio pendiente de Wilber.**
- Durante la prueba se asignó y se retiró la cartera de proyectos de los brokers de prueba; quedó como estaba (0 proyectos con broker) [V].

## Brechas que siguen abiertas

| # | Brecha | Efecto | Qué falta decidir o construir |
|---|---|---|---|
| P-1 | Solo el administrador puede escribir el porcentaje de comisión del negocio | El broker queda detenido antes de «Negociación» hasta que un administrador lo escribe | Regla de comisión por defecto (por empresa o por proyecto) |
| P-2 | Los leads llegan sin responsable; el CRM solo sugiere (decisión #21) | Alguien debe repartirlos a mano | Decidir reparto automático por carga |
| P-3 | Recordatorios y notificaciones no existen | La tarea con fecha no avisa a nadie | Motor de trabajos programados (corte 2) |
| P-4 | Correo sin configurar en staging | Las invitaciones a usuarios nuevos no salen | Cuenta de correo de la empresa |
| P-5 | La tarjeta principal del gerente muestra «Meta personal · sin meta» | No ve el agregado de su equipo arriba (sí la tabla por broker) | Vista de equipo (H-08) |
| P-6 | Una llamada registrada sobre el contacto antes de convertir no cuenta para «Contactado» | Hay que registrarla otra vez en el negocio | Heredar la actividad del lead |
| P-7 | `passwordHash` en la respuesta del alta de usuario | Campo innecesario expuesto (hoy nulo) | Quitarlo del DTO (H-14) |
| P-8 | Brokers, gerentes y metas reales | Staging opera con personas de prueba | Lista real de Quisqueya Home |
| P-9 | Diseño nuevo web y modo app | No se trabajó en esta sesión | Corte de diseño (D04/D05) |
| P-10 | Capacidad de la VPS | Cada despliegue la lleva al límite | Compilar fuera o liberar memoria (Twenty ~1,2 GB) con permiso de Wilber |
| P-11 | Commit `4ad09e6` sin push; copia antigua con 518 cambios sin revisar | Trabajo solo en la máquina local y en staging | Autorización de push; rescate o archivo de la copia antigua |

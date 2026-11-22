# Inventario estático del portal y CRM anterior

Fecha: 2026-11-06. Productor: agente real `codex-portal-inventory`, perfil D03-A. Alcance del nuevo proyecto confirmado por Wilber: **solo Quisqueya Home**, no SaaS para otras inmobiliarias. Estado: evidencia de código; arquitectura final pendiente de revisión humana. No se ejecutaron aplicaciones, bases, migraciones, builds ni llamadas de producción. No se leyeron credenciales, cookies ni datos de clientes.

## Resultado útil para la nueva arquitectura

Ya existe **Portal → CRM para solicitudes de clientes** y el receptor CRM tiene idempotencia en código. No se encontró en las superficies examinadas una sincronización completa de propiedades **CRM → Portal**. El portal y el CRM mantienen catálogos distintos y el nuevo sistema debe definir la autoridad por campo y un mapa explícito de identificadores antes de conectar escrituras. El flag `isPublished` del CRM no acredita publicación efectiva en el portal.

`C:\Users\wilbe\Documents\QHPortalWeb` es una **junction** a `C:\Users\wilbe\Documents\QuisqueyaHome PortalWeb`; no son dos portales independientes.

| Fuente | Versión local de referencia | Evidencia |
|---|---|---|
| Portal | HEAD `5891d49439f1c457a98a34ac36046dbcb4a171ea` | `git rev-parse HEAD`; GitNexus status: índice al día con HEAD, indexado 2026-11-05 |
| CRM anterior | HEAD `1161ba70445aec99cce1be91c5128b8c3691167e` | `git rev-parse HEAD`; GitNexus status: índice al día con HEAD, indexado 2026-10-31 |

Estos hashes identifican HEAD local. No se comparó con remoto ni se certificó que el árbol de trabajo coincidiera íntegramente con HEAD. Las citas siguientes describen los archivos locales leídos.

## Contratos que existen en el portal

Rutas relativas a `C:\Users\wilbe\Documents\QuisqueyaHome PortalWeb`.

| Operación | Situación verificada en código | Fuente |
|---|---|---|
| `GET /api/catalog` | Catálogo público, filtrado por lista blanca; lectura SQL del catálogo propio, caché y ETag | `server/server.mjs:139`; `server/catalog.mjs:33`, `:57`, `:117`, `:126`; `server/catalog-cache.mjs:28` |
| `GET /api/studio/catalog` | Catálogo editorial con sesión de Studio | `server/server.mjs:159`, `:160`, `:187` |
| `POST /api/studio/projects` | Crea proyecto en borrador en la BD del portal, validación y auditoría transaccional | `server/server.mjs:230` |
| `PATCH /api/studio/projects/:id` | Escribe campos permitidos, bloquea fila, valida permisos de publicación y requisitos editoriales | `server/server.mjs:105`, `:207`, `:210` |
| `DELETE /api/studio/projects/:id` | Borrado físico con auditoría; no asumir la misma política en el CRM nuevo | `server/server.mjs:219` |
| `GET/POST /api/client/inquiries` | Solicitudes vinculadas a cliente autenticado; guarda solicitud y estado de sincronización | `server/client-api.mjs:77`, `:150`, `:165`, `:177` |
| Salida hacia `/api/leads/externo` | POST JSON con `x-webhook-token`, URL configurable, timeout de 5 s | `server/client-api.mjs:225`, `:262` |

El catálogo usa `public.projects` con identificadores **UUID** (`supabase/migrations/20260905_quisqueya_catalog.sql:54`). La función `getCatalog` consulta esa tabla mediante `pool.query`, no consume el API del CRM (`server/catalog.mjs:126`). Por defecto filtra publicados; modo editorial/previsualización tiene reglas separadas. Los medios públicos exigen derechos aprobados e indicador público (`server/catalog.mjs:134`).

La sesión editorial es propia del portal: cookie `qh_studio` HttpOnly, SameSite=Strict y Path=/api/studio; se consulta una sesión persistida y su rol (`server/auth.mjs:17`, `:22`, `:28`). No se debe reutilizar como credencial de un conector máquina a máquina. Clientes tienen otra cookie, `qh_client` (`server/client-auth.mjs:188`).

### Flujo actual Portal → CRM

1. El portal persiste la solicitud con `crm_sync_status` y registra actividad (`server/client-api.mjs:177`, `:187`).
2. Lanza `despacharInquiryACRM(...).catch(...)` sin esperar la entrega para la respuesta (`:191`).
3. Envía `externalId: portal_inquiry_<inquiryId>`, nombre, correo/teléfono disponibles, **nombre del proyecto en `projectInterestText`**, `operationType: sale` y notas de cita como texto (`:243`). No envía el UUID del proyecto como `projectId` del CRM.
4. Si CRM responde correctamente, guarda `leadId`, marca synced y conserva payload (`:273`). HTTP fallido marca failed (`:285`); fallo de conexión solo avisa y conserva pending (`:292`). Sin token no intenta enviar (`:227`).

**Límite importante:** en los archivos `server/` y `scripts/` examinados no se encontró otro consumidor de `crm_sync_status` que implemente reintento durable. El comentario «pendiente para reintento posterior» no constituye un worker. Un proceso que cae después de guardar y antes de enviar puede dejar una solicitud pendiente indefinidamente. Se requiere inventario operacional posterior antes de afirmar que no existe algún proceso externo.

## Contratos y piezas del CRM anterior

Rutas relativas a `C:\Users\wilbe\Documents\QuisqueyaHome_CRM`.

| Pieza | Situación verificada | Fuente |
|---|---|---|
| `POST /api/leads/externo` | Token compartido, schema Zod y entrada sin sesión explícitamente delimitada | `src/app/api/leads/externo/route.ts:35`, `:75` |
| Respuesta externa | `{ok, lead, creado, leadId}`; el alias leadId satisface el acuse leído por el portal | `src/app/api/leads/externo/route.ts:108` |
| Captura idempotente | Normaliza payload, reserva clave, reutiliza contacto y audita dentro de unidad transaccional; duplicado retorna recibo previo, payload conflictivo genera conflicto | `src/application/leads/casos-de-uso.ts:301`; `src/infrastructure/db/repos/leads.ts:122`, `:128`, `:352` |
| Proyectos | Tabla propia `projects`, identificadores seriales; contiene precios internos, rangos públicos e `isPublished` | `src/infrastructure/db/schema.ts:430`, `:453`, `:460` |
| `POST /api/proyectos` | Autenticación y scopes; ejecución de crearProyecto con repositorio propio | `src/app/api/proyectos/route.ts:45` |
| `PATCH/DELETE /api/proyectos/:id` | Scope y filtrado de campos/precios; edición o baja mediante casos de uso | `src/app/api/proyectos/[id]/route.ts:32`, `:81` |
| Unidades y fases | Rutas específicas para unidades, fases y fotos de avance | `src/app/api/proyectos/[id]/unidades/route.ts`; `src/app/api/proyectos/[id]/fases/route.ts` |
| Persistencia de proyectos | Contenedor conecta Drizzle/getDb; sin cliente HTTP del portal en ese camino | `src/infrastructure/contenedor/proyectos.ts:10`; `src/infrastructure/db/repos/proyectos.ts` |
| Outbox | Tabla persistente, transacción con SKIP LOCKED, historial de intentos, dead letter y referencias externas | `src/infrastructure/db/schema.ts:1379`; `src/infrastructure/integraciones/outbox/repositorio.ts:10`, `:22` |
| Consumidores actuales | LeadCreado, NegocioCambioEtapa y ActividadRegistrada hacia CrmPort; tipos sin consumidor permanecen pendientes | `src/infrastructure/integraciones/outbox/consumidores.ts:40`, `:50` |
| Adaptador actual de CrmPort | `crmLocal` es no-op, sin red, con mapa en memoria; no representa sincronización con portal | `src/infrastructure/integraciones/crm/local.ts:7` |
| Limitación de fan-out | Un tipo de evento admite un solo consumidor porque no hay estado por destino | `src/infrastructure/integraciones/outbox/registro.ts:29` |

El receptor externo usa `externalId` como clave idempotente y la tabla incluye índice único parcial (`schema.ts:649`, `:661`). La persistencia del recibo de captura también verifica hash del payload y conserva respuesta auditada; no equivale a un endpoint genérico de edición o sincronización de propiedades. El CRM deriva `consentAt` al crear el contacto externo (`casos-de-uso.ts:331`); esto **no prueba** que el portal haya recogido una evidencia de consentimiento adecuada ni define finalidad/retención para el nuevo CRM.

## Qué conservar como referencia y qué comprobar

1. **Separar catálogo editorial de inventario comercial.** Hoy ya son modelos distintos: portal contiene variantes, fuentes, medios, verificaciones y publicación editorial; CRM contiene unidades, precios internos, responsables y actividad comercial. No copiar una tabla completa de un sistema al otro.
2. **Asignar autoridad por campo.** Propuesta para validar: CRM manda sobre disponibilidad/unidades y operación comercial; Studio manda sobre textos, SEO y material aprobado. La publicación compone una proyección pública que excluye precios restringidos, clientes, notas internas y documentos privados. No se cambia la autoridad actual automáticamente.
3. **Introducir referencias estables.** UUID portal ↔ ID legado CRM ↔ ID público del nuevo CRM. No enlazar por nombre o slug mutable. Evitar pasar UUID a un `projectId` numérico por coerción.
4. **Hacer durable el envío del portal.** Guardar solicitud y evento en una transacción, worker con reintento, backoff, cola de errores y conciliación. Mantener `externalId` estable y validar reenvíos con el mismo payload.
5. **Diseñar publicación CRM → Portal.** No hay evidencia en los caminos examinados de un endpoint máquina a máquina ni consumidor de catálogo listo. Crear contrato versionado, scopes de conector, acuse, control de versión, borrado/retirada y estado visible de sincronización. No usar cookie Studio ni conexión compartida a la BD como atajo.
6. **No ampliar el outbox actual sin revisar semántica.** El adaptador de repositorio mantiene transacción durante el consumidor y declara que es solo local. Una llamada HTTP lenta requerirá separar claim/lease, ejecución externa y acuse; para varios destinos hace falta delivery por destino.
7. **Preservar la vitrina pública.** Caché y snapshot existentes son referencias útiles, pero el código aún responde 503 si fallan BD y respaldo (`server/catalog-cache.mjs:108`); no prometer disponibilidad absoluta.

## Evidencia consultada y límites

Se leyeron instrucciones de ambos proyectos, project/status y doctrina instalada, constitución CRM, relevo, manifests y los archivos citados. Se utilizó GitNexus CLI `status`, `query` para catálogo y outbox/portal, y `context despacharInquiryACRM`; después se contrastó con lectura directa y búsquedas `rg` acotadas a código. MCP GitNexus no estaba disponible en el host; el CLI sí. No se modificó ningún símbolo ni se hizo commit; no correspondía impacto de edición.

La evidencia de tests existentes es únicamente **presencia de archivos**: `scripts/client-crm-config-test.mjs`, `src/app/api/leads/externo/route.test.ts` y pruebas outbox. No se ejecutaron ni se ratificaron los conteos históricos descritos por otros agentes. No se comprobó configuración efectiva, worker activo, esquema aplicado, disponibilidad de rutas ni conectividad real Portal↔CRM. Ningún gate o C1 se aprueba con este inventario.

Handoff al D03 coordinador: usar estas restricciones en la arquitectura conceptual y programar una prueba aislada de contrato con datos sintéticos; revisión humana necesaria para escoger autoridad de datos y migración.

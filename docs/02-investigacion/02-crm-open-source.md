# CRM abiertos: qué estudiar y qué conviene probar

**D21 · 6 de noviembre de 2026 · Autor: codex-research-crm · Revisor solicitado: D03.** Investigación documental, sin instalación, auditoría de seguridad ni prueba de ajuste. Las recomendaciones y puntuaciones son provisionales. Arquitectura y licencias requieren sus revisiones correspondientes.

La mejor comparación inicial es **EspoCRM con Real Estate para cobertura inmobiliaria, Twenty para modelo extensible y experiencia de trabajo, y Frappe CRM para seguimiento comercial**. No conviene escoger un fork antes de verificar los flujos de Quisqueya Home y el contrato real del portal. El resultado de esta búsqueda no demuestra que construir todo propio sea más barato.

## Capacidad y restricciones

Se busca gestionar contactos, interesados, propietarios, propiedades, oportunidades de venta/alquiler, visitas, tareas y publicación controlada hacia el portal; importar consultas del portal con trazabilidad, deduplicación y permisos. El ajuste a estos procesos es el criterio, no la semejanza de una captura.

Confirmado por Wilber: **una sola empresa, Quisqueya Home**, y herramienta [REA de morluto](https://github.com/morluto/rea), analizada en `04-rea-y-reutilizacion.md`. Hipótesis: aplicación web responsive y roles internos. Usuarios concurrentes, volumen, infraestructura, presupuesto y plazo siguen desconocidos. El inventario de API actual está en `03-inventario-portal-y-crm.md`, con límites de comprobación estática. Se excluyen de esta entrega despliegue, pagos, contabilidad, copia de datos personales, acceso a cuentas y reutilización de código.

## Búsqueda en cuatro frentes

| Frente | Resultado observado | Consecuencia |
|---|---|---|
| Propio | Hay un portal existente según la petición y contexto local; este expediente no auditó su repositorio | Conservar catálogo e IDs útiles cuando se comprueben; inventariar API y reglas antes de duplicar |
| Nativo | Un motor relacional puede resolver integridad/transacciones; no aporta por sí solo agenda, pipeline, publicación ni una UI de CRM | Reutilizar capacidades nativas donde encajen, sin confundir base de datos con producto |
| Abierto | Tres proyectos con código, licencia y releases oficiales localizados | Comparación funcional y estrategia de referencia abajo |
| SaaS/API | Twenty Cloud, Espo Cloud y Frappe Cloud existen en sus sitios oficiales | Son alternativas de operación, no seleccionadas; falta cotizar con usuarios/recursos reales |

## Evidencia de mantenimiento y licencia

Estas son las releases marcadas como últimas observadas al consultar; no son una elección de versión para producción. Los archivos de licencia se consultaron en las ramas indicadas: antes de reutilizar habría que repetir la verificación sobre el **commit exacto** y dependencias.

| Candidato | Release oficial observada | Licencia comprobada | Lectura para esta decisión |
|---|---|---|---|
| Twenty | `twenty/v2.56.1`, 5 nov. 2026, commit abreviado `60b63bd` | Principalmente AGPLv3; archivos Enterprise bajo términos comerciales; ciertos paquetes MIT, con excepción para aplicaciones descrita por el proyecto | No tratar el monorepo como MIT ni inferir que todos los controles son gratuitos |
| EspoCRM | `10.0.11`, 23 oct. 2026, `32d559b` | `LICENSE.txt` de `master`: AGPLv3 | Núcleo copyleft; extensiones comerciales se revisan por separado |
| Espo Real Estate | `1.8.6`, 10 jun. 2026, `6c5514c` | `LICENSE.txt` de `master`: AGPLv3 | Es un proyecto separado; compatibilidad exacta con Espo 10 pendiente de prueba |
| Frappe CRM | `v16.0.2`, 5 nov. 2026, `19786bf` | `LICENSE` de `develop`: AGPLv3 | No confundir la licencia de CRM con la del framework o UI |

Fuentes: [release Twenty](https://github.com/twentyhq/twenty/releases/tag/twenty/v2.56.1), [licencia Twenty](https://github.com/twentyhq/twenty/blob/main/LICENSE), [release Espo](https://github.com/espocrm/espocrm/releases/tag/10.0.11), [licencia Espo](https://github.com/espocrm/espocrm/blob/master/LICENSE.txt), [release Real Estate](https://github.com/espocrm/ext-real-estate/releases/tag/1.8.6), [licencia Real Estate](https://github.com/espocrm/ext-real-estate/blob/master/LICENSE.txt), [release Frappe CRM](https://github.com/frappe/crm/releases/tag/v16.0.2), [licencia Frappe CRM](https://github.com/frappe/crm/blob/develop/LICENSE).

**Política local y licencia son cuestiones diferentes.** `E:/PERFILES AI/core/system-map.md:49–50` bloquea por defecto `adopt/adapt` de AGPL/GPL y otras licencias no permitidas. Por tanto, estos núcleos quedan como **referencias de análisis**, no aprobados para extracción/integración. Eso no significa que AGPL prohíba el uso comercial: es copyleft con obligaciones que dependen del uso y modificación. Cualquier cambio de la política local y reutilización concreta debe resolverlo el responsable humano con D12; este documento no emite dictamen jurídico. La excepción App de Twenty y sus paquetes MIT se pueden estudiar por separado, verificando cada paquete y versión; no desbloquean automáticamente todo el producto.

## Cobertura comparada

| Capacidad | EspoCRM + Real Estate | Twenty | Frappe CRM |
|---|---|---|---|
| Propiedades/demanda inmobiliaria | Extensión oficial dedicada | Objetos y relaciones propios a modelar | DocTypes y extensión de dominio a diseñar |
| Pipeline/contactos/tareas | Núcleo comercial y actividades | Objetos comerciales, vistas y workflows | Leads, deals, contactos, tareas y comunicación |
| Matching necesidad–propiedad | Documentado en Real Estate | Regla propia | Regla propia |
| API con portal externo | REST y webhooks | REST/GraphQL generados por esquema y webhooks | REST del framework, métodos y webhooks |
| Roles/exportación | Niveles own/team/all y permiso export | Roles y datos por objeto/campo/registro documentados; edición exacta por verificar | Roles por DocType, niveles y restricciones de usuario; permiso export |
| Diseño propio | Layouts/custom views o frontend externo con coste | Apps TypeScript con componentes React en su UI | Campos/layouts y extensiones; frontend Vue en repo |
| Sincronización robusta completa | Adaptador/reconciliación propios | Adaptador/reconciliación propios | Adaptador/reconciliación propios |

La fila de permisos describe documentación, **no prueba aislamiento ni confirma una edición de pago/gratuita**. El modelo inmobiliario completo, reservas concurrentes, comisiones, publicación por canal y permisos de documentos no se dan por cubiertos sin pruebas.

**EspoCRM es la referencia de dominio más cercana.** Real Estate documenta propiedades, solicitudes de compra/alquiler, matching, vínculos a contactos y oportunidades. Esto permite estudiar un flujo real antes de inventar cada entidad. Su cambio automático al cerrar una oportunidad debe contrastarse con las reglas de disponibilidad de Quisqueya Home. [Real Estate oficial](https://www.espocrm.com/extensions/real-estate/).

Espo permite crear entidades, campos y relaciones; sus roles distinguen registros propios y del equipo, y exporta CSV/XLSX con controles de acceso. Una renovación visual profunda mediante frontend externo exige medir API, metadatos y mantenimiento: no basta cambiar CSS. [Entity Manager](https://docs.espocrm.com/administration/entity-manager/), [roles](https://docs.espocrm.com/administration/roles-management/), [exportación](https://docs.espocrm.com/user-guide/export/).

**Twenty es la referencia más alineada con una UI extensible en TypeScript.** Documenta objetos/relaciones personalizados, vistas, automatización y exportación. Sus Apps añaden lógica y componentes React dentro de extensiones soportadas. Eso es preferible como hipótesis a reescribir el núcleo: deben probarse los límites visuales y la edición requerida. [Funciones](https://docs.twenty.com/getting-started/key-features), [Apps](https://docs.twenty.com/getting-started/core-concepts/apps).

Su API se genera por workspace y permite trabajar con objetos propios; los roles pueden limitar una clave. Las cifras documentadas de 100 solicitudes/minuto y lotes de hasta 60 registros deben comprobarse para el entorno elegido, porque afectan importación y reconciliación. [API Twenty](https://docs.twenty.com/developers/extend/api).

**Frappe CRM es una referencia comercial y de personalización por metadatos.** Documenta leads, deals, email, vistas, asignación y campos/estados propios; el framework aporta REST y permisos. La experiencia de Data Tab permite organizar campos por pestañas, secciones y columnas. Una ficha inmobiliaria completa y la coherencia con el frontend CRM requieren probarse: un DocType configurable no demuestra que todos sus comportamientos aparezcan automáticamente en esa UI. [Introducción CRM](https://docs.frappe.io/crm/introduction), [Data Tab](https://docs.frappe.io/crm/data), [REST Frappe](https://docs.frappe.io/framework/user/en/api/rest), [permisos](https://docs.frappe.io/framework/user/en/basics/users-and-permissions), [exportación con permisos](https://docs.frappe.io/framework/help/why-cant-i-export-data-or-see-the-excel-option).

## Puntuación provisional D21

Puntos aportados por criterio, hasta su peso. Evalúan **ajuste documental para una futura prueba**, no aceptación. Seguridad y coste no están auditados; reciben estimaciones conservadoras. Licencia puntúa compatibilidad con la política local actual y queda en cero para adoptar estos núcleos. Un total nunca anula ese bloqueo.

| Criterio | Peso | Espo + Real Estate | Twenty | Frappe CRM |
|---|---:|---:|---:|---:|
| Cobertura funcional | 20 | 18 | 13 | 13 |
| Licencia para adoptar según política local | 15 | 0 | 0 | 0 |
| Mantenimiento observado | 15 | 13 | 13 | 13 |
| Seguridad, confianza documental provisional | 15 | 7 | 7 | 7 |
| Integración | 10 | 8 | 9 | 8 |
| Exportación/salida | 10 | 8 | 8 | 8 |
| Coste a tres años, hipótesis | 10 | 6 | 5 | 5 |
| Experiencia, sin prueba con usuarios | 5 | 3 | 4 | 4 |
| **Total provisional** | **100** | **63** | **59** | **58** |

Razones: Espo gana cobertura sectorial; Twenty gana afinidad con personalización TypeScript; Frappe aporta framework y procesos comerciales, con adaptación inmobiliaria pendiente. Mantenimiento se sustenta en releases recientes, no en auditoría de calidad. Los totales 50–64 sugieren estudiar alternativa híbrida según método D21, pero la licencia impide adoptar/adaptar automáticamente: hoy la salida autorizada es **E4, construir estudiando referencias**, junto con bibliotecas permisivas evaluadas aparte. No se ha autorizado ni empezado esa construcción.

No se incorpora Odoo a la evaluación puntuada: tres opciones cubren esta ronda y la petición no incluye ERP/contabilidad. Puede reabrirse si aparece esa necesidad; no es un descarte técnico definitivo.

## Prueba comparativa propuesta, aún no ejecutada

Caja de tiempo de planificación: dos días-persona por candidato finalista, con una revisión al terminar. No es una estimación de implementación del CRM ni una promesa de calendario. Responsable de decisión: D03/Wilber; D12 revisa licencias y límites de datos antes de cualquier adopción.

1. Usar demos públicas o entorno aislado autorizado, con versiones fijadas y datos sintéticos; no cuentas ni datos de clientes. Seleccionar Espo y Twenty primero; Frappe queda como tercer comparador si los anteriores no encajan o el equipo prefiere ese ecosistema.
2. Representar 20 propiedades, dos propietarios, cinco interesados y diez oportunidades; probar venta/alquiler y relación muchos-a-muchos entre interesados e inmuebles.
3. Recorrer captación → calificación → visita → oferta → cierre; crear una ficha de inmueble y diferenciar información interna de publicación. Documentar qué es configurable, extensión soportada y modificación del núcleo.
4. Probar tres roles mediante UI y API directa: asesor propio, gerente, publicador. Cero lecturas/escrituras no autorizadas; impedir exportaciones de quien no tenga permiso.
5. Simular portal con 50 eventos, incluidos duplicados y desordenados, caída de 30 minutos y conflicto de edición. Cero pérdida silenciosa y cero duplicados de negocio; los conflictos deben ser visibles. Esto evalúa el adaptador propuesto, no promete que el CRM ya lo incluya.
6. Exportar e importar entidades, relaciones y medios en un entorno vacío; cotejar conteos/IDs/checksums, no solo filas CSV. Capturar coste medido de CPU/RAM/almacenamiento y dificultades de actualización.

Salida: evidencia por criterio, estimación de adaptación y comparación contra una solución propia pequeña. Si requiere modificar repetidamente el núcleo para los flujos críticos, reconsiderar adopción aunque la demo resulte atractiva.

Los webhooks de Espo se despachan por trabajo programado (cinco minutos por defecto), con firma y reintentos documentados. El objetivo de sincronización debe contrastarse con esa configuración; no asumir tiempo real. En todos los candidatos siguen siendo necesarios recepción durable, deduplicación, reconciliación y observabilidad propias. [Webhooks Espo](https://docs.espocrm.com/administration/webhooks/).

## Coste total y salida

No hay cotización fiable sin usuarios, medios, tráfico, SLA ni capacidad del equipo. No se inventa una cifra mensual. El núcleo abierto no implica operación gratuita; las funciones comerciales y conectores pueden cambiar el total.

| Concepto | Año 1 | Años 2–3 |
|---|---|---|
| Licencia | Edición abierta bajo sus condiciones; extras/soporte por cotizar | Renovaciones y cambios de edición por cotizar |
| Infraestructura | Aplicación, procesos de trabajo, base, archivos, backups y monitoreo | Capacidad y crecimiento medidos |
| Trabajo | Descubrimiento, configuración, integración, UI, migración y pruebas | Parches, upgrades, regresión, soporte y restore |
| Salida | Diseñar formato neutral y ensayar exportación | Repetir prueba de recuperación y portabilidad |

Modelo de cálculo: **TCO36 = arranque + 36 × infraestructura mensual + licencias de tres años + horas de mantenimiento × tarifa + reserva de migración**. Todos los valores monetarios siguen pendientes; el puntaje de coste debe revisarse con esos datos.

Plan de salida común: IDs propios y tabla de correspondencias, exportación neutral JSON/CSV con relaciones y catálogos, medios con manifiesto, historial/auditoría/consentimientos y conciliación. CSV de contactos por sí solo no restaura el CRM. Mantener el portal detrás de un contrato de integración propio evita que consuma directamente el esquema interno del candidato. Los costes de migración son desconocidos hasta la prueba; metadatos, automatizaciones y componentes de UI suelen requerir traducción y son acoplamientos a inventariar.

## Handoff para D03 y D12

Propuesta a D03: usar Espo Real Estate como checklist funcional y Twenty como referencia de interacción/extensibilidad; validar una prueba comparativa antes de decidir núcleo propio o externo. Definir un contrato propio de catálogo/consultas/eventos que sirva con cualquiera de las opciones. No mezclar tres núcleos CRM.

D12 debe revisar política de licencia y procedencia por paquete/commit, superficie de API, permisos efectivos, actualizaciones, exportación, credenciales y retención. No se comprobó ausencia de vulnerabilidades, compatibilidad de la extensión Espo con la versión última, capacidad bajo carga ni accesibilidad manual. Permanecen sin aceptar riesgos de actualizaciones, dependencia de extensiones y pérdida de metadatos al migrar. Este expediente solicita revisión; no se autoaprueba.

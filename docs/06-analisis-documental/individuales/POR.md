# POR — Portal: lectura individual completa

Fuente `VT-CRM-ESP-POR_Portal_v0.1_2026-11-06.md`, SHA256 `0214EC9C683EE4B5CE3BA769771E57F41C475807B435182DD01B19A13A14A1F5`; leídas líneas 1–258. Borrador Add-on. «Real» en esta nota significa atribuido por la fuente a 81ccf08, no validación independiente. El módulo POR del CRM no debe confundirse con el repositorio del portal público que sí existe por separado.

## Funciones y alcance total

Cinco vistas: editor portada/bloques/marca/contenido, publicación por canal, catálogo/captación, comprador y promotor. Hoy shell/React state y modal sin red/persistencia; área comprador usa ExpedientesPrevia y promotor no crea cuenta. Futuro: CMS versionado/aprobado, material/vigencia por canal, publicar/retirar/acuse vía PortalPublisher, filtros públicos zona/precio, SEO/OG/canonical/sitemap/schema listing ES/EN, captura lead/UTM/consentimiento y protección broker; identidad externa comprador/promotor con acceso propio a expediente/inventario/avance/cuenta es hipótesis por decidir, se conserva como capacidad candidata. Fuente:41–90,115–149,194–239.

## Roles, entidades y reglas

Actual settings:view solo admin seed. Propuestos portal_contenido/publicacion/captacion; gerente team publicación, broker/asistente lectura fichas, externos own nunca roles internos. Leads/contacts consent y projects/units/construction_phases son dependencias existentes atribuidas. PortalPage(bloques/título/versión/autor/aprobador/estado), Publication(proyecto/canal/sync/material/vigencia), PortalSeo(metadata/idioma) y PortalAccess(usuario/rol/alcance/vencimiento) no existen aún en schema. Inventario sería SoT catálogo; dominio QH objetivo de editorial/publicación, Twenty no SoT. Fuente:127–149,171–208.

## Eventos, API y comunicaciones

Captación atribuida POST `/api/leads/externo` con token/Zod/idempotencia externalId/rate limit; LEA recibe y CON requiere evidencia de privacidad/consentimiento. No APIs propias portal ni adapter publish acreditado; PortalPublisher/INV objetivo publica y retira por canal tras aprobación/whitelist/acuse, CFG SEO demo no publica. DOC aporta documentos privados; RES advierte precio desde no garantiza stock hasta reserva; BRO protege cliente; CFG estado integración. Fuente:35–39,49–76,102–149,210–223.

## Estados, UX y privacidad

PortalPage borrador→revisión→publicado→archivado; publicación pendiente→sync ok/error; SEO borrador/publicado; acceso activo/vencido. UI selector simula estados; éxito aclara no publicó y parcial por canal no existe. Fuente exige consentimiento fecha/origen en captura pero webhook no lo exige atribuidamente; no rellenar consent_at como prueba. Enlaces documentales firmados y scope externo propio; nunca contratos/PII en catálogo público. Publicación no equivale a guardar SEO, isPublished o abrir enlace. Fuente:90–100,145–168,175–186.

## Contradicciones y decisiones abiertas

Sitio declarado `quisqueyahome.com`; inventario local previo de esta conversación usa portal distinto con dominio operativo `.tech`. Verificar dominio canónico/repositorio/operador y API, sin conectar por deducción. Fuente asigna catálogo a INV/CRM y publicación al dominio QH; arquitectura conceptual anterior proponía conservar inicialmente autoridad editorial en portal: comparar y decidir autoridad por campo/proyecto/unidad, no mezcla automática. Separar CMS, publicación catálogo y área privada externa. Exigir consentimiento en contrato legado es potencial breaking change; acordar versión/transición, finalidad/base legal y fallo seguro con negocio. Fuente:32–39,60,131–149,177–186,245–250.

## Aceptación pendiente

Publicar/retirar con permiso/version/hash y acuse real por canal; timeout no falso éxito; borrador no cambia versión pública; no filtrar precio interno/docs/PII; lead origen único/mapa IDs/consentimiento; acceso externo no cruza expediente. Ninguna identidad externa, CMS persistente o sync queda certificada. Revisión root/Luna pendiente.


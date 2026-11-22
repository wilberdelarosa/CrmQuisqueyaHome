# COMU — Comunicaciones: lectura individual completa

Fuente: `VT-CRM-ESP-COMU_Comunicaciones_v0.1_2026-11-06.md`, SHA256 `F5A809808EFAAA34591EF7EC905176E1449D46F92774C8B480008ED2F7B0D351`; leídas líneas 1–276. Borrador con evidencia estática atribuida a 81ccf08. Sus checks marcados no equivalen a aceptación ni envío real verificado. Código de inventario declarado CRM-COM colisiona semánticamente con COM/Comisiones: usar COMU para este módulo y resolver catálogo maestro.

## Funciones y alcance completo

Centro con CRUD-lite/desactivación de plantillas variables/canal, estado de canales, preparar/despachar auditado y actividad 30 días call/email/whatsapp. Webhook WhatsApp firmado captura/actualiza lead por teléfono, no bandeja. Futuro: bandeja WA/IG e historial en lead, mensajes/conversaciones, delivery/read/bounce/error, campañas segmentadas persistentes, consentimientos/opt-outs por canal, frecuencia/longitud, archivo seguro de plantillas, automatizaciones e informes por correo. Bandeja/campañas actuales son demos. Fuente:40–89,118–164,213–257.

## Roles, entidades y reglas

Admin/asistente all gestionan y despachan; broker view all/create own ve/crea pero no despacha; gerente sin fila seed/0017 y sin acceso según fuente, decisión abierta. Actividad requiere además activities:view; ver-como solo lectura. `message_templates` (name/category/channel/body/variables/is_active/autoría), IntegrationAccount con credenciales cifradas, WebhookInbox, Outbox/Dead, AuditLog y activities. Conversaciones, MessageDelivery, ConsentChannel y CampaignDispatch son entidades futuras faltantes, distintas de marketing_campaigns de gasto. Fuente:184–225.

## API, eventos y comunicaciones

GET/POST `/api/comunicaciones/plantillas`, PUT `[id]` sin DELETE; GET canales; POST despachar exige create=all; webhook `/integraciones/webhooks/whatsapp` con firma YCloud/Meta e inbox system+account+event. Domina QH: plantillas/validación/auditoría y futuro historial/consentimientos; Twenty no es SoT de mensajería. Dos adaptadores: módulo multicanal (Telegram/WA o sim; email/SMS sim) y proveedores-externos (WA YCloud o Cloud API; Resend o sim). Canales enum incluye webhook. CON autoriza destinatarios/bajas; AGE dispara recordatorios/confirmación; REP programa correo; CFG canales/flags; LEA consume inbound; AUT usa reglas; INI muestra actividad. Fuente:118–164.

## Estados, fallos y UX

Plantilla activa/inactiva; despacho ok/error/simulación rechazada; canal activo/configurado; inbox recibido/procesado; outbox pendiente/enviado/dead, no bandeja COMU. Variables `{variable}` (no dobles llaves), fiscal Confotur/IPI/exención bloqueado hasta revisión, WA/SMS E.164. Rechazar IDs sim_/wa_sim_/tg_sim_; si auditoría falla tras envío, `auditado:false` no significa que no se envió. Estado parcial por canal y error inline; carga/error propios y vacío no acreditados. Fuente:48–58,89–134,188–198.

## Privacidad y preguntas

Auditar destinatario enmascarado sin cuerpo; no presumir consentimiento comercial por consent_at. Fuente exige consentimiento/baja antes de campañas/recordatorios; legalidad y plazos requieren validación responsable, no dictamen de esta nota. Plantilla Meta aprobada fuera de ventana 24 h es requisito documental, enforcement actual pendiente. Elegir proveedor runtime canónico y un puerto único; definir derechos manager y scope team de mensajes; política de longitud/frecuencia; DNS/SPF/DKIM/DMARC y correo listo; idempotencia/reconciliación tras timeout/envío sin audit; consentimiento por finalidad/canal y acceso a cuerpos. Fuente:134,162–182,227–268.

## Verificación pendiente

Demos rotuladas, simulación no cuenta entrega, firmas/cuentas/eventos duplicados y ordenados, permiso directo por API, opt-out durante cola, delivery real e historial privado, auditoría después de resultado ambiguo. No se envió mensaje ni se llamó proveedor. Revisión root/Luna pendiente.


# RED — Comunidad: lectura individual completa

Fuente `VT-CRM-ESP-RED_Comunidad_v0.1_2026-11-06.md`, SHA256 `9DED6EC5B3D9A0FF6CB45B524F7A6CC8F1C6447557ADBAFBD0C453E3EB32DE2E`; leídas líneas 1–268. Borrador Add-on de alcance por decidir; se conserva todo el módulo futuro como candidato y no se promueve ni descarta por esta nota. Observaciones de código 81ccf08 atribuidas, sin ejecución.

## Funciones y alcance completo

Grupos y materiales autorizados/posts/comentarios con visibilidad; demandas inmobiliarias anonimizadas, interés/co-broke sin liberar contacto; eventos/inscripción/cupo y avisos; reportar contenido, moderar con motivo/evidencia y apelación independiente; reputación futura solo con cierres verificables, no ejemplos. Actual cuatro rutas comunidad/demandas/eventos/moderacion con RedPrevia y borradores locales sin tablas community. No red social abierta, mensajería directa PII, LMS ni gestión económica co-broke aquí. Fuente:43–90,118–153,221–249.

## Roles, entidades y reglas

Guard brokers:view provisional; futuro community:view/create/edit/moderate. Admin all+moderación/apelación; asistente view/material empresa; broker create/edit own sin moderar; gerente moderate team y otro revisor resuelve apelación. CommunityGroup/Member, Post/Comment, BuyerDemand(zona/tipo/requisitos/presupuesto por rangos/estado), DemandInterest(demanda/broker/fecha/consentimiento), CommunityEvent/Registration(fecha/lugar/enlace/cupo), ContentReport y ModerationDecision(motivo/evidencia/decisor/apelación/revisor), todos futuros. Fuente:177–219.

## Estados, eventos/API y conexiones

Grupo activo/archivado, post publicado/oculto/retirado, demanda abierta/en_acuerdo/cerrada, interés registrado, evento publicado/cerrado, reporte abierto/decidido, decisión aplicada/apelada/confirmada/revocada. No API persistente acreditada. BRO aporta miembro/acreditación/directorio y contrato de cooperación que libera acceso; CON privacidad; COMU/outbox notifica inscripción/decisión/recordatorio; ACC/CFG permisos/config; auditoría decisiones. Twenty no SoT; MET/BRO ranking futura solo tras señal verificable. Fuente:92–153,183–194,221–234.

## UX, fallos y privacidad

Vista previa con datos/carga/vacío/error/offline/no-permiso y mensaje no guardó; parcial no implementado, selector demo debe retirarse en producción. Demandas solo requisitos y rangos sin nombre/teléfono/expediente ni presupuesto identificable; combinaciones de zona/rango/rasgos también pueden reidentificar, comprobar anonimización real. Expresar interés no da contacto ni prioridad de reserva. Visibilidad por grupo y ciclo de baja BRO revocan acceso futuro; evidencia de moderación restringida, no republica PII. Fuente:67–90,183–219.

## Decisiones y contradicciones

Asignar grupo/visibilidad y política de anonimización; acuerdo co-broke vive BRO o RED y qué consentimiento/alcance libera; moderación team o admin y apelación por persona distinta sin auto-revisión; admisión de externos brokers no crea multiempresa SaaS por sí sola. Cupo/inscripción concurrente e idempotencia notificaciones requieren contrato futuro. No calcular reputación desde demos ni tratar brokers:view como permiso para toda comunidad. Fuente:61,125–129,185–194,255–260.

## Aceptación pendiente

Publicación con PII rechazada, acceso grupo y baja verificados; interés no filtra contacto, acuerdo necesario y auditado; cupo sin sobreinscribir; moderación conserva evidencia y apelación otro actor; doble evento no repite inscripción/aviso; caso de abuso y recuperación definidos. Revisión root/Luna pendiente.


# CRM Quisqueya Home — descubrimiento v0.1

Fecha: 6 de noviembre de 2026. Productor documental: Codex, D01. Revisor D02 pendiente. Ningún requisito propuesto equivale a aceptación del negocio.

## Lo confirmado y lo pendiente

Wilber pidió rehacer el CRM, con diseño sólido, arquitectura mantenible y comunicación con el portal para consultar y actualizar propiedades. Confirmó que será **solo para Quisqueya Home** y facilitó https://github.com/morluto/rea para investigación. El CRM anterior y el portal existen localmente; su código sirve como evidencia de comportamiento, no como definición de lo que debe conservarse.

Hipótesis por validar: venta y alquiler; asesores con carteras; dirección comercial; catálogo compartido con el portal; contactos que pueden ser compradores, propietarios o ambos. No hay volumen, presupuesto, fecha de lanzamiento, lista de funciones actuales deseadas ni política de retención confirmados.

Problema de negocio propuesto: dar seguimiento completo desde la consulta de una persona hasta la visita y el cierre, usando información de propiedades coherente con el portal y haciendo visibles los fallos de integración. Métricas a acordar: tiempo de primera respuesta, leads sin responsable/próxima acción, conversión por etapa y discrepancias de catálogo.

## Actores propuestos

| Actor | Necesidad | Límite por validar |
|---|---|---|
| Administrador | gestionar usuarios y configuración | no implica acceso indiscriminado a documentos privados |
| Dirección/coordinación | asignar leads, supervisar carteras y reportes | alcance de lectura y reasignación |
| Asesor | gestionar su cartera, visitas y oportunidades | acceso a equipo y cartera ajena |
| Editor/publicador | mantener fichas y aprobar publicación | separar contenido público de negociación privada |
| Integración técnica | transferir catálogo/consultas | permisos por operación, sin sesión humana compartida |
| Visitante del portal | consultar una propiedad y pedir contacto | sin acceso al CRM ni a datos internos |

Una persona puede tener varios roles; el permiso se comprueba en servidor para cada registro y campo. El rol administrativo y la posibilidad de exportar datos deben otorgarse por separado. No se diseña un producto SaaS, facturación por inmobiliaria ni aprovisionamiento de tenants.

## Requisitos candidatos y aceptación

| ID | Capacidad / actor | Criterio de aceptación propuesto | Excepción que debe resolverse |
|---|---|---|---|
| RF-01 | identidad y permisos / equipo | dado un asesor, al consultar una cartera no autorizada por API, el servidor deniega y no revela sus campos | usuario desactivado, sesión vencida, reasignación |
| RF-02 | contactos / asesor | una persona puede tener varios teléfonos y roles; unir duplicados conserva origen y actividades con revisión | teléfono compartido o correo coincidente no fusiona automáticamente |
| RF-03 | entrada portal / integración | repetir la misma consulta identificada crea un solo lead, preserva propiedad y origen, y deja trazabilidad | CRM caído o propiedad archivada |
| RF-04 | leads y asignación / coordinación | todo lead nuevo queda asignado o en bandeja visible sin asignar, con responsable de atención | asesor ausente, regla sin coincidencia, reasignación concurrente |
| RF-05 | oportunidades / asesor | una persona puede tener varias oportunidades, cada una con etapa, próxima acción e historial | pérdida, reapertura, cambio de inmueble |
| RF-06 | propiedades / editor | buscar, filtrar y abrir la ficha muestra ID estable, disponibilidad y fecha/estado de sincronización | catálogo obsoleto, ficha retirada, unidad diferente a proyecto |
| RF-07 | edición/publicación / editor | guardar una versión no publica implícitamente; un publicador confirma la operación y queda versión/auditoría | otra persona editó, faltan campos o medio inválido |
| RF-08 | agenda/visitas / asesor | crear, reagendar o cancelar una visita conserva historial y muestra zona horaria | doble reserva y recordatorio fallido |
| RF-09 | tareas/actividad / asesor | una tarea tiene responsable, fecha y estado; completarla no borra el historial | vencida, cancelada, responsable desactivado |
| RF-10 | panel/reportes / dirección | filtros, zona horaria, definición de métrica y última actualización acompañan el resultado | datos parciales y permisos por cartera |
| RF-11 | auditoría/exportación / autorizados | exportar exige permiso y deja registro; restaurar un borrado lógico conserva relaciones | archivo grande, dato restringido y solicitud de supresión |
| RF-12 | integraciones / operaciones | una transferencia fallida puede consultarse y reprocesarse sin duplicar el efecto | caída larga, credencial vencida, dato rechazado |

RF-01, 03, 06, 07, 11 y 12 derivan de mantener información segura/coherente; los demás expanden el arquetipo CRM y se validarán con el equipo. Las prioridades siguientes son una recomendación de conversación, no un backlog cerrado.

## Primera versión recomendada y evolución

Primera versión operativa propuesta: usuarios/permisos, contactos, consultas/leads, asignación, oportunidades, tareas/visitas, catálogo leído desde el portal, edición autorizada mediante su API, auditoría y bandeja de sincronización. Reportes iniciales: leads por fuente/asesor/etapa y tareas vencidas. La razón: cerrar el recorrido consulta→seguimiento→visita sin perder el vínculo a la propiedad.

Después de validar ese recorrido: matching demanda/inmueble, comparativas, propuestas comerciales, notificaciones y canales oficiales de correo/WhatsApp, importación avanzada y reportes de conversión. Documentos privados solo tras fijar permisos, retención y almacenamiento. Comisiones se difieren como candidato: estimación comercial y devengo requieren definición; liquidación contable queda fuera.

En la primera versión se propone registrar manualmente oferta/cierre y motivos de pérdida como seguimiento, sin automatizar compromisos de inventario, cobros ni documentos vinculantes. **Reservas, bloqueos de unidad, vencimiento, liberación y efectos del cierre sobre disponibilidad están pendientes de Q-004/Q-005**; mover una oportunidad de etapa no reserva ni vende una unidad. Se incorporarán solo con reglas y concurrencia aceptadas. Esto limita explícitamente el primer corte y mantiene la meta de cierre completo para las fases posteriores.

Migración inicial propuesta: contactos, leads, oportunidades e historial que el negocio decida conservar, con mapeo de IDs y conciliación; no todo el CRM anterior por defecto. Copropietarios, contactos compartidos, adjuntos y datos incompletos se revisan en Q-008. La estrategia de migración y formación está en arquitectura/hoja de ruta; sus criterios finales siguen pendientes.

Fuera de primera versión: contabilidad, cobros, facturación fiscal, firma electrónica con validez jurídica, app nativa, automatizaciones que envíen mensajes sin control, IA con capacidad autónoma de publicar/eliminar, marketplace y multiempresa. Cada exclusión evita ampliar alcance antes de confirmar el proceso.

## Estados y experiencia exigidos en todas las pantallas

| Estado | Comportamiento verificable |
|---|---|
| Cargando | preservar estructura y contexto; no mostrar ceros como resultado |
| Vacío | distinguir sin registros de filtro sin coincidencias; acción según permiso |
| Error | mensaje accionable, identificador de soporte y reintento seguro |
| Sin conexión | mostrar dato cacheado con fecha; no confirmar publicaciones ni reservas |
| Éxito | confirmar la operación real y distinguir guardado, en cola y publicado |
| Sin permiso | evitar filtración, explicar acceso y permitir volver |

Aplicar a dashboard, bandeja de leads, ficha de contacto/oportunidad, propiedades, editor, agenda, reportes, usuarios e integraciones. Conservar filtros en URL, navegación por teclado, vista de lista equivalente al kanban y confirmación para acciones masivas. No depender solo del color para etapa o error. Objetivo candidato: WCAG 2.2 AA ([W3C](https://www.w3.org/TR/WCAG22/)); evaluación real pendiente.

## NFR: hipótesis de prueba, no cifras acordadas

| Indicador | Propuesta para validar | Cómo se verificará |
|---|---|---|
| capacidad | ensayo con 25 usuarios concurrentes, 10.000 fichas/unidades y 100.000 contactos | datos sintéticos y carga representativa; ajustar al volumen real |
| lectura API | p95 ≤500 ms bajo carga acordada, excluyendo terceros | medición de consultas/listados en staging |
| sincronización | p95 ≤60 s con ambos sistemas sanos; alertar atasco >5 min | timestamps de evento y aplicación; dashboard de cola |
| disponibilidad | objetivo mensual candidato 99,5% | medición externa y registro de incidentes; revisar presupuesto |
| recuperación | candidato RPO ≤1 h, RTO ≤4 h | ensayo de restauración cronometrado antes de operar |
| UX | 360 px a escritorio, teclado y zoom 200% | pruebas de recorridos, no solo capturas |
| privacidad | plazos de datos y copias pendientes del negocio | matriz de retención aprobada y ejercicio de exportar/suprimir |

Estas cifras sirven para discutir y dimensionar una prueba; no son capacidad existente, garantía ni compromiso de costo. G1/G2 siguen pendientes hasta responder las preguntas y aceptar objetivos.

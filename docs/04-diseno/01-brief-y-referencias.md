# Brief de experiencia y referencias visuales

Propuesta D21 para D04/D05/D06, 6 de noviembre de 2026. No representa pantallas aceptadas ni una interfaz construida. Todas las recomendaciones de composición siguientes son inferencias de diseño para validar con usuarios.

Confirmado por Wilber durante la conversación: una sola empresa, Quisqueya Home. No se propone ahora un panel SaaS para varias inmobiliarias.

## Referencias que conviene mirar

Estos enlaces abren producto, documentación con imágenes o demos oficiales. Se consultó el contenido publicado; no se recorrieron sesiones autenticadas ni se descargaron/copiaron imágenes o interfaces.

| Referencia oficial | Qué estudiar | Qué evitar al adaptarlo |
|---|---|---|
| [Twenty: producto](https://twenty.com/product) | Navegación lateral, vistas de registros, filtros y continuidad entre listas y detalle. La página muestra tablas y navegación del CRM. | Trasladar el modelo de compañías/ventas B2B directamente a propiedades, unidades y propietarios sin modelar el negocio inmobiliario. |
| [Frappe CRM: capturas del repositorio](https://github.com/frappe/crm), [producto](https://frappe.io/crm) | Ficha de lead/oportunidad con actividad y acciones cercanas; vistas guardadas y lectura del pipeline. | Llenar una ficha con todos los campos a la vez o confundir lead, persona y oportunidad. |
| [EspoCRM: extensión inmobiliaria](https://www.espocrm.com/extensions/real-estate/), [demo](https://www.espocrm.com/demo/) | Relación entre propiedades y solicitudes del comprador; correspondencia de preferencias e inventario. | Asumir que la demo genérica contiene todas las funciones de la extensión o que su catálogo público resuelve la integración de Quisqueya Home. |
| [shadcn/ui: dashboard oficial](https://ui.shadcn.com/examples/dashboard) | Ritmo de tarjetas, jerarquía de filtros y composición de controles. | Heredar métricas de ecommerce o usar gráficas decorativas sin definición de negocio. |

Para el futuro tablero de referencias: elegir tres capturas por dirección —lista densa, ficha y móvil—, anotar origen/fecha/viewport y comparar a la misma escala. Las capturas se recopilarán por la vía permitida de cada sitio después de elegir referencias; este paquete contiene enlaces, no una licencia sobre sus imágenes.

## Dirección propuesta: operación inmobiliaria clara

El CRM debe ayudar a decidir a quién dar seguimiento, qué propiedad encaja y qué está publicado. Hipótesis visual: escritorio con navegación persistente, búsqueda global, filtros guardados, tablas configurables y detalle lateral para consultas rápidas. En móvil, priorizar tareas del asesor: contactar, registrar visita/nota, consultar inventario y retomar pendientes. Verificar con usuarios si una vista de mapa o galería tiene valor suficiente; no hacerla obligatoria para toda tarea.

Los colores de marca de Quisqueya Home aún no se han auditado. Proponer una base neutra, un acento de marca y estados semánticos independientes; no fijar códigos de color por intuición. Una misma propiedad debe mostrar por separado estado comercial (p. ej. disponible/reservada/vendida) y estado de publicación (borrador/pendiente/publicada/retirada). No reducir ambos a un único badge ambiguo.

## Recetas iniciales para validar

Tres recorridos deben guiar el piloto: (1) consulta del portal → lead → asignación → seguimiento → visita; (2) cambio de propiedad → revisión/aprobación → publicación → confirmación visible del portal; (3) caída de integración → alerta → diagnóstico → reproceso idempotente → conciliación. Los indicadores de estado acompañan cada transición; el éxito de una pantalla no prueba que el otro sistema haya confirmado.

| Receta | Tarea principal | Componentes candidatos | Aceptación propuesta |
|---|---|---|---|
| SCR-01 Inicio operativo | Saber qué atender hoy | cola de tareas, leads sin asignar, recordatorios, alertas de integración | cada indicador abre registros filtrados y explica periodo/fuente |
| SCR-02 Leads | Calificar y asignar una consulta | tabla, filtros guardados, asignación, origen, próxima acción | conservar filtros al volver; impedir duplicado silencioso y mostrar responsable |
| SCR-03 Contacto | Comprender relación con cliente/propietario | datos mínimos, historial, preferencias, relaciones | rol autorizado ve lo necesario; actividades ordenadas y con autor |
| SCR-04 Oportunidad | Avanzar negociación de compra/alquiler | pipeline + alternativa de lista, ficha, propiedades propuestas, próximas tareas | cambio de etapa valida reglas; pérdida/cancelación conserva motivo e historial |
| SCR-05 Propiedades | Encontrar inventario apropiado | tabla/galería, filtros, moneda, ubicación, disponibilidad | filtros combinables y guardables; acceso a documentos según permiso |
| SCR-06 Editar/publicar | Preparar una ficha pública | formulario por secciones, medios, preview, validación, estado de sincronización | distinguir guardado local, enviado y confirmado por portal; conflicto recuperable |
| SCR-07 Agenda/visitas | Planificar y registrar resultado | calendario + lista, recordatorio, detalle de cita | mostrar zona horaria, cancelación y asignación; no prometer disponibilidad sin validación |
| SCR-08 Integraciones/admin | Resolver fallos operativos | cola fallida, último éxito, reintento controlado, roles/auditoría | operadores identifican el registro afectado y un reintento no duplica acciones |

## Contrato común del diseño

Cada receta debe conectar requisito → módulo → flujo → pantalla → estado → evento → API/dato/permiso → prueba. Los IDs anteriores son semillas, no un mapa aprobado.

Tokens propuestos: colores semánticos de superficie/texto/borde/foco/acción/estado; tipografía por rol (no por pantalla); escala de espacios y tamaños; densidad cómoda/compacta; radios/elevación; duración y movimiento reducido. Versionarlos con su correspondencia al código. Biblioteca: controles base, composición de filtros/formularios/tablas y patrones del dominio; la ficha de propiedad no debe conocer el proveedor de API.

Matriz obligatoria para cada pantalla: inicial, carga, vacío, parcial, error, sin conexión, éxito y sin permiso; sumar conflicto y cancelación donde corresponda. Ejemplos: vacío explica cómo empezar; error permite recuperar sin borrar el formulario; parcial distingue datos pendientes; sin conexión indica qué está desactualizado; éxito confirma el sistema que guardó; sin permiso evita revelar contenido privado. El estado de sincronización debe incluir pendiente, procesando, confirmado, fallido y requiere intervención.

Accesibilidad propuesta: etiquetas visibles, recorrido de teclado/foco, alternativa al arrastre del pipeline, mensajes asociados a campos, estados con texto además de color, zoom y movimiento reducido. Comprobar contraste y objetivos táctiles durante diseño y código. Una biblioteca accesible no acredita que su composición final lo sea.

Antes de seleccionar herramientas/pantallas: confirmar tareas frecuentes, roles, número de asesores, tipos de propiedad/unidades, proceso de captación, venta/alquiler y revisión de publicación. El ciclo de adquisición PXIL y las pruebas visuales se ejecutarán sobre el brief que resulte aceptado; no se fingió ese ciclo en esta investigación.

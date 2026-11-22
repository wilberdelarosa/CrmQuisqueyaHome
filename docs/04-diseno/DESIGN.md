# Sistema de diseño · Quisqueya Home Private Desk

## 1. Dirección visual

Consola operativa clara y compacta, con navegación azul marino y acento dorado. El trabajo diario empieza en listas, calendarios o tableros y conserva el contexto al abrir una ficha. La documentación histórica del CRM aporta los valores de referencia. La variante marfil y los radios alternativos del plan Viltrum quedan para comparación visual.

Fuentes locales: [Plan Viltrum](../00-fuentes-drive/central/07-Dise%C3%B1o/VILTRUM-DESIGN-PLAN.txt), [Private Desk](referencias-crm-anterior/DESIGN-Private-Desk.md), [ficha Luna UI](../00-fuentes-drive/central/02-Modulos/VT-CRM-E01_Modulo-Luna-UI_v1.0_2026-10-29.txt).

## 2. Paleta y funciones

| Uso | Referencia |
| --- | --- |
| Lienzo / panel / borde | Gris azulado `#F3F5F8`, blanco `#FFFFFF`, gris de separación `#DFE3EB` |
| Texto / texto secundario | Tinta navy `#172036`, gris azulado `#646D85` |
| Navegación / títulos destacados | Marino profundo `#10172D`, navy `#1D2B53` |
| Acción primaria / foco / texto sobre dorado claro | Oro `#C7990E`, ocre `#9B7300`, bronce oscuro `#765600` |
| Éxito / aviso / error / información | `#16734A`, `#8A5300`, `#A13F43`, `#315F8C` con fondos suaves |
| Alternativa por comparar | Lienzo marfil `#FAF9F6` |

En el botón dorado usar texto navy. Las etiquetas de estado incluyen texto. Los pares semánticos y el foco requieren comprobación en las pantallas y superficies finales.

## 3. Tipografía y geometría

Hanken Grotesk para títulos y cifras, Atkinson Hyperlegible Next para texto e interfaz, según la referencia Private Desk. El visor local usa fuentes de sistema para abrir sin internet. Usar escala de 8 px, controles de 44 px como mínimo según la ficha Luna UI, radio de referencia de 7 px en controles y 10 px en paneles. Definir variante marfil y radios con una comparación de Inicio y Leads.

## 4. Componentes y estados

| Componente | Contrato visual |
| --- | --- |
| Navegación / cabecera | Orden estable por rol, acciones accesibles, contexto, foco visible y versión móvil |
| Tabla / filtros / inspector | Orden, filtros, paginación, selección parcial y ficha que conserva contexto |
| Campos / diálogos | Etiquetas visibles, error asociado al campo, recuperación de foco, confirmación cuando corresponda |
| Pipeline / calendario | Alternativa de teclado al arrastre, horario de Santo Domingo, estados y responsables legibles |
| Avisos / estados | Carga, vacío, error, éxito y sin permiso. Añadir parcial, sin conexión, conflicto o pendiente de sincronización según flujo |
| Inventario / publicación | Mostrar por separado estado comercial de la unidad y estado editorial o de sincronización |
| Accesibilidad | Texto además de color, navegación por teclado, foco visible, movimiento reducido y revisión a 320, 390, 1280 y 1440 px |

## 5. Secuencia para diseño

Comenzar con shell, Inicio y Leads. Continuar con Negocios, Contactos, Tareas, Agenda y Configuración. Usar una misma ficha de entrega por pantalla que vincule módulo, flujo, rol, permiso, estado visual, dato, acción y criterio de aceptación. Extraer tokens reutilizables antes de crear variantes locales. El CSS histórico de Tailwind se conserva como referencia de su repositorio y contiene imports propios de esa compilación.

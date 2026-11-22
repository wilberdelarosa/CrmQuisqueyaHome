# Hoja de ruta y decisiones

Propuesta D02/D03, 2026-11-06. Sin fecha ni presupuesto comprometidos. Prioridad propuesta para validar con dirección y asesores; revisión de negocio pendiente.

| Oleada | Resultado verificable | Entrada necesaria | Salida para avanzar |
|---|---|---|---|
| 0 · esta entrega | investigación, inventario y arquitectura conceptual | petición y fuentes locales/públicas | documentos revisables; no cierre de descubrimiento |
| 1 · proceso y alcance | mapa actual y futuro de captación a cierre; roles, excepciones y volúmenes | entrevista breve y casos reales anonimizados | requisitos/NFR y alcance aceptados, responsables por dato |
| 2 · decisión de base | comparar CRM existente y opción propia en mismos recorridos | licencia/edición, capacidades y límites confirmados | evidencia de encaje, coste y salida; decisión de arquitectura |
| 3 · experiencia y contrato | dos direcciones visuales de tres recorridos; tokens y componentes; contrato de integración | brief/roles aceptados y elección de base | prototipo evaluado, estados completos y contrato validado |
| 4 · primera entrega vertical | consulta→lead→responsable→tarea→visita, catálogo en lectura | construcción autorizada y ambientes aislados | QA por rol/API, reintentos y migración piloto |
| 5 · edición/publicación | cambios versionados y publicación confirmada en portal | API máquina-a-máquina y reglas de autoridad | concurrencia, permisos, medios, fallos y conciliación comprobados |
| 6 · migración y operación | corte controlado y equipo capacitado | conteos conciliados, backup/restore y rollback ensayados | aceptación humana y seguimiento de métricas |
| 7 · expansión | matching, propuestas, canales y analítica | métricas del piloto y priorización nueva | revalidación de valor y coste por módulo |

Las oleadas 2 y 3 pueden alternar pruebas visuales sin construir producto; un prototipo que use datos sintéticos no es una integración productiva. Implementación requiere C1/mandato y aceptación aplicables al proyecto; no se han registrado como cumplidos.

## Prueba que más reduce incertidumbre

Un ejercicio comparativo pequeño con datos sintéticos: 20 fichas y unidades explícitamente diferenciadas, cinco contactos, diez oportunidades, tres roles y 50 eventos. Medir: pasos para resolver una consulta, cambios de núcleo requeridos, calidad de exportación, fallos recuperados y coste de adaptación. Los tamaños son de una prueba sugerida, no volúmenes esperados.

Registrar qué se configura, qué se integra y qué se debe construir. Ensayar duplicados, reordenación, caída, timeout tras commit y conflicto de versión. No escoger por cantidad de pantallas de la demo. La evaluación puede empezar por demos mientras se resuelve la elegibilidad de las licencias para adoptar código.

## Prioridades propuestas por valor

| Corte | Requisitos | Razón |
|---|---|---|
| base de viabilidad | RF-01, 03, 06, 11, 12 | identidad, consultas fiables y vínculo a catálogo; sin esto el dato no es confiable |
| seguimiento comercial | RF-02, 04, 05, 08, 09 | cerrar el recorrido del asesor |
| publicación controlada | RF-07 | requiere contrato portal y aprobación editorial definidos |
| visibilidad inicial | RF-10 | reportes sencillos con métricas acordadas; ampliar después |

No son categorías Must definitivas: faltan entrevistas, capacidad y análisis de oportunidad. Mantener margen de capacidad al planificar cada corte; no deducir calendario de esta lista.

## Coste/esfuerzo: qué falta para estimarlo

Rango técnico pendiente: personas disponibles, horas/semana, qué código conserva valor, edición/licencias, canales, migración de datos, cantidad de medios, carga, SLO y nivel de personalización visual. No hay base suficiente para prometer semanas o dinero. Usar TCO a 36 meses: arranque + infraestructura + licencias/consumo + mantenimiento/actualizaciones + copia/restore + migración/salida. Medir el esfuerzo del ejercicio comparativo para alimentar el rango, no confundirlo con estimación completa.

## Definición propuesta de éxito de negocio

Un asesor puede recibir una consulta vinculada al inmueble correcto, localizar historial, acordar la próxima acción y registrar una visita; dirección ve pendientes y responsables. Un editor puede saber si un cambio está pendiente, rechazado o confirmado en portal. Tras una caída, las operaciones pendientes se recuperan sin pérdida silenciosa ni duplicados. Antes de aceptar: usuarios representantes ejecutan los recorridos y se contrastan métricas acordadas contra la línea base. La línea base y objetivos siguen pendientes de Wilber/equipo.

## Próxima sesión

Resolver primero: puestos/roles y número de usuarios, recorrido de captación y cierre, proyecto versus unidad, quién autoriza publicación y reservas, qué conservar del CRM anterior y presupuesto/capacidad. Después fijar autoridad por campo y seleccionar tres pantallas para dos propuestas visuales. REA ya está identificado y el alcance de una empresa confirmado.

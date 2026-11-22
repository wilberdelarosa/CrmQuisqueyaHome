# Revisión independiente de consistencia documental

Fecha: 2026-11-06. Actor real: `codex-review-consistencia`, sesión delegada distinta de `codex-root`. Perfil D14 en alcance consultivo documental. Cargados SOUL, AGENTS y SOP de D14 desde la raíz canónica `E:/PERFILES AI`. No se revisan aquí los dos documentos de diseño que produjo esta misma sesión; no se autoaprueban. D00 recibe este informe. D03 conserva revisión humana de arquitectura: este informe no aprueba arquitectura, gates, alcance ni C1.

## Alcance y método

Lectura comparada de alcance propuesto y dos documentos de arquitectura/integración contra el inventario estático del portal/CRM anterior. Se analizaron trazas conceptuales de doble entrega, respuesta perdida, publicación y equivalencia de IDs. No se inspeccionó de nuevo código fuente, no se ejecutó sistema/API/DB y no se afirma certificación funcional, seguridad, carga ni E2E. Las prioridades siguientes describen huecos del contrato escrito, no bugs reproducidos de un producto nuevo.

| Documento revisado | SHA256 de la versión leída |
|---|---|
| `01-descubrimiento/01-alcance-propuesto.md` | `F83DB0322314F930584A65CB62D7E6B35876B598884A42968ACD06B619D65014` |
| `03-arquitectura/01-arquitectura-conceptual.md` | `6C495E4269F806417EBE29F33B4C265F6382F0AB4D859E286DCD456BB309953F` |
| `03-arquitectura/02-integracion-y-escenarios.md` | `51C0BE154C88D8AD9DE2DF631866CBC1817A0FC768B9FE2955FD3831B49B9042` |
| `02-investigacion/03-inventario-portal-y-crm.md` (evidencia de contraste) | `6421B6A1AF2C54B68A033C0BB84450F77B50264B8ABD2A1B0681F1D8777771AD` |

## Hallazgos abiertos para el productor

**QC-01 · P2 documental · Identidad de consulta y de entrega deben ser invariantes distintas.** `02-integracion-y-escenarios.md:74` fija inbox única por `(source,event_id)` y `:68` pide ID origen, pero no fija unicidad de la consulta en Captación. El inventario acredita `externalId = portal_inquiry_<inquiryId>` en el flujo actual. Escenario de escritorio: el mismo inquiry se reimporta o reemite con envelope/event_id nuevo; la inbox lo acepta como evento nuevo y podría crear otro lead. Acción: exigir unicidad persistente por `(source,inquiry_id)`, conservar/migrar el externalId legado y definir recibo/mapeo; event_id deduplica transporte y inquiry_id deduplica la captura de negocio. Criterio a añadir: dos eventos distintos para el mismo inquiry producen un solo lead y el mismo recibo, sin fusionar consultas diferentes de una persona. Dueño: D03/D10; aceptación de negocio con D01.

**QC-02 · P2 documental · Explicitar el orden entre recibo idempotente y precondición de versión.** En `02-integracion-y-escenarios.md:44–45` la secuencia enumera control de versión y cambio; `:74` pide resultado reutilizable, pero no aclara su prioridad. Escenario: PATCH con versión 12 se confirma como 13 y se pierde respuesta; repetir el mismo comando con If-Match 12 podría devolver 412 si se comprueba la versión antes de buscar el recibo. Acción: autenticar/autorizar conforme a la política vigente; buscar recibo por clave/payload y devolver resultado previo de una operación ya aplicada, sin volver a aplicar ni interpretar la versión antigua como una nueva edición; para comando nuevo sí evaluar If-Match de forma atómica con mutación/recibo. Criterio: respuesta perdida + reintento devuelve el resultado confirmado; una clave nueva con versión 12 recibe 412. Dueño: D03/D10/D19.

**QC-03 · P2 documental · Separar borrador y versión pública de una ficha ya publicada.** `01-alcance-propuesto.md:36` exige que guardar no publique implícitamente. `02-integracion-y-escenarios.md:8,45–50` termina en catálogo actualizado tras cambiar precio/disponibilidad y `:58` deja la solicitud editorial condicionada a que se requiera aprobación. El inventario acredita PATCH sobre proyectos y validación de publicación, pero no demuestra un snapshot de borrador separado. Escenario: ficha publicada v12; editor guarda título/precio pendiente de aprobación; si se actualiza la misma proyección pública, el nuevo contenido queda visible antes de aprobar. Acción: decidir por campos qué cambios son inmediatos y cuáles requieren nueva revisión; definir versión de trabajo, versión aprobada/publicada y confirmación pública, o limitar el primer alcance si el portal carece de borradores independientes. Criterio: guardar borrador sobre una ficha publicada no altera la versión pública hasta la transición autorizada; retirada/disponibilidad urgente tiene política explícita. Dueño: D01/D03 con editor del negocio.

**QC-04 · P2 documental · Ownership de unidades es una decisión propuesta que exige ampliar inventario/contrato.** `01-arquitectura-conceptual.md:77` asigna inicialmente ficha/proyecto/unidad y disponibilidad al portal. El inventario contrasta proyectos UUID en portal con proyectos seriales y unidades/fases en CRM; no acredita un API de unidades del portal. No hay contradicción automática —la tabla está rotulada como propuesta—, pero puede subestimarse el trabajo. Acción: dividir proyecto editorial, unidad comercial, precio público/negociado y disponibilidad; declarar cuál existe hoy y qué expansión/migración se necesita para que el dueño propuesto pueda almacenar y validar cada uno. Criterio del piloto: consulta a una unidad concreta conserva vínculo inequívoco con UUID portal/ID unidad/ID legado y no degrada a nombre del proyecto. Dueño: D03/D11 y D01 para regla inmobiliaria.

Los cuatro hallazgos se enviaron al productor antes de cerrar el informe. No se aceptan como riesgos por esta sesión. No se identifica un P0/P1 de producto a partir de esta revisión sin ejecución; sí deben resolverse estos contratos antes de implementar los recorridos afectados.

## Consistencias verificadas en el texto

- Interfaces `/integration/v1/*` están identificadas como propuestas; no se presentan como rutas actuales. El inventario separa presencia de código y operación real.
- UUID portal e ID serial del CRM no se igualan ni se enlazan por nombre/slug; se propone mapeo y se distingue proyecto de unidad.
- La falta de reintento durable en las superficies examinadas del portal no se oculta; outbox/inbox son trabajo futuro. Tampoco se interpreta el adaptador no-op del CRM como sincronización de catálogo.
- Se evita compartir credenciales humanas o SQL como contrato estable; publicación y seguimiento comercial tienen fronteras separadas y los datos privados quedan fuera de la proyección pública.
- Los escenarios cubren entrega repetida, orden, cursor vencido, tombstones, caídas, 429, permisos revocados y recuperación. Se declaran planes de prueba, no pruebas pasadas.
- Scope de una sola empresa, NFR propuestos y decisiones pendientes de humano están señalados. Rollback contempla deltas de datos, no solo binarios.

## Resultado y seguimiento

Resultado: paquete útil para discusión, con cuatro precisiones documentales abiertas. Recomendación a D00: incorporar respuesta del productor y mantener pendientes de aceptación las decisiones de ownership, publicación y alcance. La arquitectura requiere su revisor humano canónico. Un cambio a los documentos invalida los hashes anteriores; una revisión posterior debe identificar las nuevas versiones. El informe no se considera revisor de sí mismo ni de las piezas de diseño de esta sesión.

## Addendum: comprobación de correcciones — 2026-11-06

Mismo revisor independiente del productor. Sesión de actividad `HOST-c4f730f84a474701bc33f6afda6fb5e8`. Se leyó `.viltrum/respuesta-revisiones.md` y se contrastaron directamente las secciones afectadas: alcance/primer corte, tabla de autoridad y separación de revisiones, recorrido de edición, reglas de Captación/idempotencia y nuevos escenarios. No se reejecutó la revisión integral ni se realizaron pruebas runtime.

| Documento en esta comprobación | SHA256 |
|---|---|
| `01-descubrimiento/01-alcance-propuesto.md` | `EA5666E0814C88F8E47B29C7FCD1358FCA22AB48915D0BF92C823E515678DC76` |
| `03-arquitectura/01-arquitectura-conceptual.md` | `18EACE17E95CC9968F027E473CFB1DAC3249C587B54A322D07C042817FD42BD0` |
| `03-arquitectura/02-integracion-y-escenarios.md` | `186C62521D157A44126E862137C97001CBF68874665A0C7B3B7C0B47352A98C4` |

- **QC-01: precisado documentalmente.** Integración ahora exige unicidad `(source,inquiry_id)` además de `(source,event_id)`, conserva externalId/recibo legado y distingue consultas diferentes de una misma persona. La matriz añade reemisión con envelope nuevo. Falta implementarlo y probarlo en su etapa; no se certifica la garantía por escribirla.
- **QC-02: precisado documentalmente.** Se declara autenticación/autorización, búsqueda de recibo y comprobación de hash antes de tratar If-Match como comando nuevo. Se distingue el reintento de una operación aplicada de una clave nueva con versión antigua. Claim/lease, HTTP fuera de transacción y delivery por destino están explicitados. La atomicidad y concurrencia reales deberán comprobarse con implementación.
- **QC-03: decisión del negocio correctamente abierta.** El recorrido y diagrama confirman borrador/solicitud, no publicación implícita. La versión pública se mantiene hasta publicar; la ausencia de soporte acreditado actual se declara y se propone limitar a solicitudes editoriales. Quedan pendientes política por campo, cambios urgentes y alcance de ampliación; no se acepta esa política en nombre del negocio.
- **QC-04: decisión de ownership correctamente abierta.** La tabla separa proyecto editorial de unidad/reserva/disponibilidad exacta. Se aclara que el portal no tiene API de unidades acreditada y se presenta CRM como dueño comercial alternativo, condicionado a Q-004/Q-005. El primer corte ya declara que cambiar etapa no reserva/vende una unidad ni automatiza esos compromisos.

No se observan errores materiales nuevos en estas secciones corregidas. Este addendum sustituye el estado «cuatro precisiones documentales abiertas» del resultado anterior únicamente en el alcance señalado: QC-01/02 quedaron definidos en el texto; QC-03/04 permanecen decisiones abiertas con límites claros. No cierra gates, C1, hallazgos en otro registro ni revisión humana de arquitectura; tampoco acredita pruebas ni viabilidad del futuro contrato.

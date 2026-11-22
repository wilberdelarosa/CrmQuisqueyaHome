# Control de fuentes Drive, ZIP y PDF

Fecha: 2026-11-06. Productor real: `codex-source-control`, D22. Revisor independiente: pendiente de Luna/D00. Estado: entrega de control de fuentes, sin autoaprobación.

57/57 archivos coinciden en tamaño con el inventario Drive; se calcularon SHA-256 locales de todos. Se extrajeron las 294 páginas de los 26 PDF y se emparejaron con sus 26 Markdown. Los hashes Markdown coinciden con las entradas source del manifiesto interno de generación. El ZIP duplica los mismos 26 PDF y añade previews y metadatos. Hay una variante menor de LEEME (25 frente a 26 PDF).

## Método y límites

- Leídos skill PDF y contrato D22 antes del procesamiento. Fuentes originales conservadas; no se ejecutó contenido del ZIP, comandos, HTML ni aplicaciones.
- Inventario remoto aporta ID, URL y tamaño, **no SHA remoto**. Tamaño coincidente y SHA local no prueban autenticidad remota; son control de completitud y huella para reanudar.
- Manifiesto ZIP declara hash del **Markdown de entrada**, no hash del PDF. Las 26 coincidencias prueban mismos bytes de entrada declarados; el manifiesto no está firmado y no prueba aceptación, QA funcional ni render semánticamente perfecto.
- Cada PDF se abrió con PyMuPDF, se recorrieron todas sus páginas y se guardó texto por página, longitud, número de palabras, imágenes y hash en el JSON. Cero páginas con menos de diez caracteres extraídos.
- Conteos de tokens MD/PDF son diagnósticos de formato: URLs, frontmatter y Mermaid cambian de representación; tablas se parten, aparecen encabezados/pies/marca de agua. No son porcentajes de calidad, cobertura semántica ni pérdida.
- Se inspeccionaron las 26 previews juntas y dos páginas interiores de ejemplo (Inventario p10, Plan P0 p4). No se hizo auditoría visual de 294 páginas ni lectura semántica exhaustiva de los 30 Markdown, que corresponde a otros agentes.

## Resultado y discrepancias

1. **57 originales**: 30 Markdown, 26 PDF y 1 ZIP; ningún archivo original extra y ninguna copia byte-idéntica entre originales independientes.
2. **26 PDF / 294 páginas**: 26 pares MD; 26 hashes source coinciden, 26 conteos de páginas y 26 tamaños PDF coinciden con `manifest.json`. Los 26 PDF del ZIP son byte-idénticos a los descargados individualmente.
3. **ZIP / 55 entradas / 6,074,761 bytes descomprimidos**: validación completa previa; sin rutas absolutas, drives, traversal, symlinks ni destinos duplicados; total acotado y CRC `testzip` correcto.
4. **LEEME diferente**: Drive individual dice **26 PDF**, ZIP dice **25 PDF**. Diferencia de una línea, no una especificación adicional ni un módulo perdido. Conteo real: 26. Conservar los originales y usar el conteo observado.
5. **PDF frente a MD**: procedencia consistente y sin otra variante sustantiva descubierta; PDF incorpora portada/índice/marcas, oculta o convierte sintaxis/metadatos y puede contener diagramas como imágenes. Para contratos y enlaces exactos se usa Markdown; para presentación se consulta PDF. No se afirma equivalencia semántica/visual absoluta.
6. Las **previews son portadas documentales** oscuras con marca BORRADOR, no mockups ni referencias de interfaz del CRM. No deben usarse para inferir componentes funcionales.

## Cobertura de los 26 PDF completos

| PDF (misma base de nombre que MD) | Páginas | Extracción | SHA MD = source del manifest | Tamaño/páginas manifest |
|---|---:|---|---|---|
| 00-Indice.pdf | 7 | Todas | Sí | Sí |
| VT-CRM-ADR-Arquitectura-hibrida-Twenty_v1_2026-11-06.pdf | 4 | Todas | Sí | Sí |
| VT-CRM-PLAN-P0_Checklist_v0.1_2026-11-06.pdf | 8 | Todas | Sí | Sí |
| VT-CRM-REV-Cierre-nucleo_v0.1_2026-11-06.pdf | 6 | Todas | Sí | Sí |
| VT-CRM-ESP-ACA_Academy_v0.1_2026-11-06.pdf | 13 | Todas | Sí | Sí |
| VT-CRM-ESP-ACC_Acceso_v0.1_2026-11-06.pdf | 10 | Todas | Sí | Sí |
| VT-CRM-ESP-AGE_Agenda_v0.1_2026-11-06.pdf | 11 | Todas | Sí | Sí |
| VT-CRM-ESP-APR_Aprobaciones_v0.1_2026-11-06.pdf | 10 | Todas | Sí | Sí |
| VT-CRM-ESP-AUT_Automatizaciones_v0.1_2026-11-06.pdf | 11 | Todas | Sí | Sí |
| VT-CRM-ESP-BRO_Brokers_v0.1_2026-11-06.pdf | 13 | Todas | Sí | Sí |
| VT-CRM-ESP-CFG_Configuracion_v0.1_2026-11-06.pdf | 13 | Todas | Sí | Sí |
| VT-CRM-ESP-COM_Comisiones_v0.1_2026-11-06.pdf | 10 | Todas | Sí | Sí |
| VT-CRM-ESP-COMU_Comunicaciones_v0.1_2026-11-06.pdf | 11 | Todas | Sí | Sí |
| VT-CRM-ESP-CON_Contactos_v0.2_2026-11-06.pdf | 16 | Todas | Sí | Sí |
| VT-CRM-ESP-DOC_Documentos_v0.1_2026-11-06.pdf | 10 | Todas | Sí | Sí |
| VT-CRM-ESP-INI_Inicio_v0.1_2026-11-06.pdf | 11 | Todas | Sí | Sí |
| VT-CRM-ESP-INV_Inventario_v0.1_2026-11-06.pdf | 18 | Todas | Sí | Sí |
| VT-CRM-ESP-LEA_Leads_v0.2_2026-11-06.pdf | 19 | Todas | Sí | Sí |
| VT-CRM-ESP-MET_Metas_v0.1_2026-11-06.pdf | 13 | Todas | Sí | Sí |
| VT-CRM-ESP-NEG_Negocios_v0.2_2026-11-06.pdf | 17 | Todas | Sí | Sí |
| VT-CRM-ESP-POR_Portal_v0.1_2026-11-06.pdf | 10 | Todas | Sí | Sí |
| VT-CRM-ESP-POS_Posventa_v0.1_2026-11-06.pdf | 11 | Todas | Sí | Sí |
| VT-CRM-ESP-RED_Comunidad_v0.1_2026-11-06.pdf | 11 | Todas | Sí | Sí |
| VT-CRM-ESP-REP_Reportes_v0.1_2026-11-06.pdf | 9 | Todas | Sí | Sí |
| VT-CRM-ESP-RES_Reservas_v0.1_2026-11-06.pdf | 11 | Todas | Sí | Sí |
| VT-CRM-ESP-TAR_Tareas_v0.1_2026-11-06.pdf | 11 | Todas | Sí | Sí |


Los textos completos están en `00-fuentes-drive/2026-11-06/texto-pdf/<base>.txt`. Cabeceras `=== PAGE n/total ===` conservan la referencia de página. `control-fuentes.json` contiene SHA PDF, SHA MD, SHA texto y detalle por página.

## Markdown sin PDF equivalente

No son pérdidas del lote PDF: el ZIP fue preparado con los 26 documentos que declara su manifiesto. Estos cuatro Markdown individuales añaden contexto o control:

- `00 Indice y cierre/VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md`
- `00 Indice y cierre/VT-CRM-PLN-Recoleccion-especificaciones_v0.2_2026-11-06.md`
- `00 Indice y cierre/VT-CRM-INV-Modulos_v0.2_2026-11-06.md`
- `00 Indice y cierre/LEEME.md`


## Inventario exhaustivo de los 57 originales

Rutas relativas a `00-fuentes-drive/2026-11-06/originales/`. Cada fila tiene huella SHA-256 completa, ID y URL Drive en el JSON; aquí se muestra tamaño para lectura.

| Archivo | Bytes | Tamaño Drive | SHA local |
|---|---:|---|---|
| VT-CRM-PDFs-y-previews_2026-11-06.zip | 5358572 | Coincide | 9f42610142d3… |
| modulos/VT-CRM-ESP-TAR_Tareas_v0.1_2026-11-06.md | 19626 | Coincide | 8d924079703e… |
| modulos/VT-CRM-ESP-RES_Reservas_v0.1_2026-11-06.md | 15678 | Coincide | 82c497d217fe… |
| modulos/VT-CRM-ESP-REP_Reportes_v0.1_2026-11-06.md | 11835 | Coincide | 1dd664290908… |
| modulos/VT-CRM-ESP-RED_Comunidad_v0.1_2026-11-06.md | 14703 | Coincide | 9ded6ec5b3d9… |
| modulos/VT-CRM-ESP-POS_Posventa_v0.1_2026-11-06.md | 14976 | Coincide | 06bf51e7bded… |
| modulos/VT-CRM-ESP-POR_Portal_v0.1_2026-11-06.md | 12659 | Coincide | 0214ec9c683e… |
| modulos/VT-CRM-ESP-NEG_Negocios_v0.2_2026-11-06.md | 35336 | Coincide | 3383f2acbfe6… |
| modulos/VT-CRM-ESP-MET_Metas_v0.1_2026-11-06.md | 29066 | Coincide | 7dc49f4f0119… |
| modulos/VT-CRM-ESP-LEA_Leads_v0.2_2026-11-06.md | 32751 | Coincide | feafd4c875dd… |
| modulos/VT-CRM-ESP-INV_Inventario_v0.1_2026-11-06.md | 42309 | Coincide | 7c5bb6ff9797… |
| modulos/VT-CRM-ESP-INI_Inicio_v0.1_2026-11-06.md | 18568 | Coincide | 637fd25e8169… |
| modulos/VT-CRM-ESP-DOC_Documentos_v0.1_2026-11-06.md | 12635 | Coincide | 437dc3c1b8c0… |
| modulos/VT-CRM-ESP-CON_Contactos_v0.2_2026-11-06.md | 31226 | Coincide | a4ede127e4d8… |
| modulos/VT-CRM-ESP-COM_Comisiones_v0.1_2026-11-06.md | 15973 | Coincide | 56f2bebc5ce2… |
| modulos/VT-CRM-ESP-COMU_Comunicaciones_v0.1_2026-11-06.md | 18396 | Coincide | f5a809808efa… |
| modulos/VT-CRM-ESP-CFG_Configuracion_v0.1_2026-11-06.md | 20171 | Coincide | 1b47f392614e… |
| modulos/VT-CRM-ESP-BRO_Brokers_v0.1_2026-11-06.md | 21307 | Coincide | 97f1ca3853c5… |
| modulos/VT-CRM-ESP-AUT_Automatizaciones_v0.1_2026-11-06.md | 14898 | Coincide | 3ed71dfa9e64… |
| modulos/VT-CRM-ESP-APR_Aprobaciones_v0.1_2026-11-06.md | 11798 | Coincide | 6998fe8b2c1c… |
| modulos/VT-CRM-ESP-AGE_Agenda_v0.1_2026-11-06.md | 22565 | Coincide | e88b9068ed37… |
| modulos/VT-CRM-ESP-ACC_Acceso_v0.1_2026-11-06.md | 14114 | Coincide | c719055940a7… |
| modulos/VT-CRM-ESP-ACA_Academy_v0.1_2026-11-06.md | 20100 | Coincide | aeaaf41dbd29… |
| modulos/VT-CRM-ESP-TAR_Tareas_v0.1_2026-11-06.pdf | 136274 | Coincide | d33f13261b4a… |
| modulos/VT-CRM-ESP-RES_Reservas_v0.1_2026-11-06.pdf | 179473 | Coincide | 8d4d12f0c359… |
| modulos/VT-CRM-ESP-REP_Reportes_v0.1_2026-11-06.pdf | 163963 | Coincide | 33657557ca50… |
| modulos/VT-CRM-ESP-RED_Comunidad_v0.1_2026-11-06.pdf | 181424 | Coincide | 635a59244dba… |
| modulos/VT-CRM-ESP-POS_Posventa_v0.1_2026-11-06.pdf | 186000 | Coincide | 115bc1e610af… |
| modulos/VT-CRM-ESP-POR_Portal_v0.1_2026-11-06.pdf | 174279 | Coincide | 005ddd4022d2… |
| modulos/VT-CRM-ESP-NEG_Negocios_v0.2_2026-11-06.pdf | 184638 | Coincide | 19a8df2b9c93… |
| modulos/VT-CRM-ESP-MET_Metas_v0.1_2026-11-06.pdf | 162394 | Coincide | 3d10d22490fc… |
| modulos/VT-CRM-ESP-LEA_Leads_v0.2_2026-11-06.pdf | 249128 | Coincide | efc41accd568… |
| modulos/VT-CRM-ESP-INV_Inventario_v0.1_2026-11-06.pdf | 251414 | Coincide | 0a4849f4339c… |
| modulos/VT-CRM-ESP-INI_Inicio_v0.1_2026-11-06.pdf | 142786 | Coincide | 6c319d5a0f38… |
| modulos/VT-CRM-ESP-DOC_Documentos_v0.1_2026-11-06.pdf | 172552 | Coincide | ce69bc9db6cf… |
| modulos/VT-CRM-ESP-CON_Contactos_v0.2_2026-11-06.pdf | 175987 | Coincide | 99f5c49a1494… |
| modulos/VT-CRM-ESP-COM_Comisiones_v0.1_2026-11-06.pdf | 139973 | Coincide | fe11c6fba0ff… |
| modulos/VT-CRM-ESP-COMU_Comunicaciones_v0.1_2026-11-06.pdf | 193761 | Coincide | c868f3517fa7… |
| modulos/VT-CRM-ESP-CFG_Configuracion_v0.1_2026-11-06.pdf | 202867 | Coincide | 69d663b5b0b8… |
| modulos/VT-CRM-ESP-BRO_Brokers_v0.1_2026-11-06.pdf | 160434 | Coincide | f15385111830… |
| modulos/VT-CRM-ESP-AUT_Automatizaciones_v0.1_2026-11-06.pdf | 189368 | Coincide | a9e22c5a3be1… |
| modulos/VT-CRM-ESP-APR_Aprobaciones_v0.1_2026-11-06.pdf | 173852 | Coincide | 3035dcbaffac… |
| modulos/VT-CRM-ESP-AGE_Agenda_v0.1_2026-11-06.pdf | 139266 | Coincide | dd880a3e9cf6… |
| modulos/VT-CRM-ESP-ACC_Acceso_v0.1_2026-11-06.pdf | 134024 | Coincide | b9ae7d1e97fb… |
| modulos/VT-CRM-ESP-ACA_Academy_v0.1_2026-11-06.pdf | 208426 | Coincide | 0639437df652… |
| 00 Indice y cierre/VT-CRM-TPL-Especificacion-modulo_v0.1_2026-11-06.md | 7454 | Coincide | c875aa094279… |
| 00 Indice y cierre/VT-CRM-PLN-Recoleccion-especificaciones_v0.2_2026-11-06.md | 9476 | Coincide | a80ecde51acc… |
| 00 Indice y cierre/VT-CRM-INV-Modulos_v0.2_2026-11-06.md | 10134 | Coincide | 5ada8657f905… |
| 00 Indice y cierre/VT-CRM-REV-Cierre-nucleo_v0.1_2026-11-06.md | 7503 | Coincide | 7fa5f9f6465f… |
| 00 Indice y cierre/VT-CRM-PLAN-P0_Checklist_v0.1_2026-11-06.md | 7806 | Coincide | 560590c9c37a… |
| 00 Indice y cierre/VT-CRM-ADR-Arquitectura-hibrida-Twenty_v1_2026-11-06.md | 3782 | Coincide | 129cb7681802… |
| 00 Indice y cierre/00-Indice.md | 14261 | Coincide | 4bc81824a60d… |
| 00 Indice y cierre/VT-CRM-REV-Cierre-nucleo_v0.1_2026-11-06.pdf | 115709 | Coincide | 1c8f9750a789… |
| 00 Indice y cierre/VT-CRM-PLAN-P0_Checklist_v0.1_2026-11-06.pdf | 120013 | Coincide | 42d71c256031… |
| 00 Indice y cierre/VT-CRM-ADR-Arquitectura-hibrida-Twenty_v1_2026-11-06.pdf | 104978 | Coincide | 2ec27124e638… |
| 00 Indice y cierre/LEEME.md | 2170 | Coincide | 67d973ef8660… |
| 00 Indice y cierre/00-Indice.pdf | 124253 | Coincide | 3220b1503563… |


## Inventario ZIP y material adicional

55 entradas originales del ZIP (archivos derivados para inspección no se cuentan como miembros). SHA completos y duplicados por byte están en el JSON.

| Miembro | Bytes | Comparación con originales |
|---|---:|---|
| 00-Indice.pdf | 124253 | PDF idéntico |
| VT-CRM-ADR-Arquitectura-hibrida-Twenty_v1_2026-11-06.pdf | 104978 | PDF idéntico |
| VT-CRM-ESP-ACA_Academy_v0.1_2026-11-06.pdf | 208426 | PDF idéntico |
| VT-CRM-ESP-ACC_Acceso_v0.1_2026-11-06.pdf | 134024 | PDF idéntico |
| VT-CRM-ESP-AGE_Agenda_v0.1_2026-11-06.pdf | 139266 | PDF idéntico |
| VT-CRM-ESP-APR_Aprobaciones_v0.1_2026-11-06.pdf | 173852 | PDF idéntico |
| VT-CRM-ESP-AUT_Automatizaciones_v0.1_2026-11-06.pdf | 189368 | PDF idéntico |
| VT-CRM-ESP-BRO_Brokers_v0.1_2026-11-06.pdf | 160434 | PDF idéntico |
| VT-CRM-ESP-CFG_Configuracion_v0.1_2026-11-06.pdf | 202867 | PDF idéntico |
| VT-CRM-ESP-COMU_Comunicaciones_v0.1_2026-11-06.pdf | 193761 | PDF idéntico |
| VT-CRM-ESP-COM_Comisiones_v0.1_2026-11-06.pdf | 139973 | PDF idéntico |
| VT-CRM-ESP-CON_Contactos_v0.2_2026-11-06.pdf | 175987 | PDF idéntico |
| VT-CRM-ESP-DOC_Documentos_v0.1_2026-11-06.pdf | 172552 | PDF idéntico |
| VT-CRM-ESP-INI_Inicio_v0.1_2026-11-06.pdf | 142786 | PDF idéntico |
| VT-CRM-ESP-INV_Inventario_v0.1_2026-11-06.pdf | 251414 | PDF idéntico |
| VT-CRM-ESP-LEA_Leads_v0.2_2026-11-06.pdf | 249128 | PDF idéntico |
| VT-CRM-ESP-MET_Metas_v0.1_2026-11-06.pdf | 162394 | PDF idéntico |
| VT-CRM-ESP-NEG_Negocios_v0.2_2026-11-06.pdf | 184638 | PDF idéntico |
| VT-CRM-ESP-POR_Portal_v0.1_2026-11-06.pdf | 174279 | PDF idéntico |
| VT-CRM-ESP-POS_Posventa_v0.1_2026-11-06.pdf | 186000 | PDF idéntico |
| VT-CRM-ESP-RED_Comunidad_v0.1_2026-11-06.pdf | 181424 | PDF idéntico |
| VT-CRM-ESP-REP_Reportes_v0.1_2026-11-06.pdf | 163963 | PDF idéntico |
| VT-CRM-ESP-RES_Reservas_v0.1_2026-11-06.pdf | 179473 | PDF idéntico |
| VT-CRM-ESP-TAR_Tareas_v0.1_2026-11-06.pdf | 136274 | PDF idéntico |
| VT-CRM-PLAN-P0_Checklist_v0.1_2026-11-06.pdf | 120013 | PDF idéntico |
| VT-CRM-REV-Cierre-nucleo_v0.1_2026-11-06.pdf | 115709 | PDF idéntico |
| 00-Indice-p1.png | 66082 | Adicional: portada |
| VT-CRM-ADR-Arquitectura-hibrida-Twenty_v1_2026-11-06-p1.png | 66224 | Adicional: portada |
| VT-CRM-ESP-ACA_Academy_v0.1_2026-11-06-p1.png | 65748 | Adicional: portada |
| VT-CRM-ESP-ACC_Acceso_v0.1_2026-11-06-p1.png | 64906 | Adicional: portada |
| VT-CRM-ESP-AGE_Agenda_v0.1_2026-11-06-p1.png | 63185 | Adicional: portada |
| VT-CRM-ESP-APR_Aprobaciones_v0.1_2026-11-06-p1.png | 64957 | Adicional: portada |
| VT-CRM-ESP-AUT_Automatizaciones_v0.1_2026-11-06-p1.png | 65451 | Adicional: portada |
| VT-CRM-ESP-BRO_Brokers_v0.1_2026-11-06-p1.png | 62843 | Adicional: portada |
| VT-CRM-ESP-CFG_Configuracion_v0.1_2026-11-06-p1.png | 64184 | Adicional: portada |
| VT-CRM-ESP-COMU_Comunicaciones_v0.1_2026-11-06-p1.png | 65104 | Adicional: portada |
| VT-CRM-ESP-COM_Comisiones_v0.1_2026-11-06-p1.png | 63932 | Adicional: portada |
| VT-CRM-ESP-CON_Contactos_v0.2_2026-11-06-p1.png | 63639 | Adicional: portada |
| VT-CRM-ESP-DOC_Documentos_v0.1_2026-11-06-p1.png | 65448 | Adicional: portada |
| VT-CRM-ESP-INI_Inicio_v0.1_2026-11-06-p1.png | 64597 | Adicional: portada |
| VT-CRM-ESP-INV_Inventario_v0.1_2026-11-06-p1.png | 66024 | Adicional: portada |
| VT-CRM-ESP-LEA_Leads_v0.2_2026-11-06-p1.png | 62363 | Adicional: portada |
| VT-CRM-ESP-MET_Metas_v0.1_2026-11-06-p1.png | 62668 | Adicional: portada |
| VT-CRM-ESP-NEG_Negocios_v0.2_2026-11-06-p1.png | 65825 | Adicional: portada |
| VT-CRM-ESP-POR_Portal_v0.1_2026-11-06-p1.png | 62074 | Adicional: portada |
| VT-CRM-ESP-POS_Posventa_v0.1_2026-11-06-p1.png | 63467 | Adicional: portada |
| VT-CRM-ESP-RED_Comunidad_v0.1_2026-11-06-p1.png | 63345 | Adicional: portada |
| VT-CRM-ESP-REP_Reportes_v0.1_2026-11-06-p1.png | 63336 | Adicional: portada |
| VT-CRM-ESP-RES_Reservas_v0.1_2026-11-06-p1.png | 65196 | Adicional: portada |
| VT-CRM-ESP-TAR_Tareas_v0.1_2026-11-06-p1.png | 62171 | Adicional: portada |
| VT-CRM-PLAN-P0_Checklist_v0.1_2026-11-06-p1.png | 63910 | Adicional: portada |
| VT-CRM-REV-Cierre-nucleo_v0.1_2026-11-06-p1.png | 63717 | Adicional: portada |
| LEEME.md | 2170 | Variante LEEME: 25 vs 26 |
| manifest.json | 13248 | Adicional: metadatos de generación |
| comandos.txt | 21711 | Adicional: metadatos de generación |


`manifest.json` vincula fuente Markdown, hash source, PDF, páginas, tamaño y preview. `comandos.txt` contiene instrucciones históricas de generación en `/workspace/...`; se leyó como texto y **no se ejecutó**. No hay HTML ni otro módulo funcional agregado por el ZIP.

## Evidencia y continuación

- Script reproducible: `06-analisis-documental/control-fuentes.py` (no instala dependencias, no toca originales; rechaza entradas ZIP inseguras).
- Detalle de control: `06-analisis-documental/control-fuentes.json`.
- ZIP extraído: `00-fuentes-drive/2026-11-06/extraido-zip/`; contiene además una lámina de previews creada para inspección.
- Fuentes de texto: `00-fuentes-drive/2026-11-06/texto-pdf/`; contiene 26 TXT y cuatro renders de muestra.
- Handoff D00: incorporar 26 PDF como formatos derivados de sus pares MD; no contarlos como 26 especificaciones nuevas. Mantener cuatro MD sin PDF y discrepancia LEEME explícitos. Ninguna declaración «aceptado/cerrado» contenida en una fuente equivale por sí misma a aceptación de este proyecto.

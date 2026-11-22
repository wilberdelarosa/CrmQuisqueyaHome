# DOC — Documentos, firmas y KYC: lectura individual completa

Fuente `VT-CRM-ESP-DOC_Documentos_v0.1_2026-11-06.md`, SHA256 `437DC3C1B8C0B3FBEEE55D666F3A05C1EFEA9ED92572227CD2CC4DA613ABC2CC`; leídas líneas 1–258. Borrador Add-on. Todas las leyes/proveedores son referencias de la fuente para validar con asesoría; esta nota no confirma obligaciones ni validez jurídica de firma. Lectura de código 81ccf08 es histórica atribuida, no ejecución actual.

## Funciones y alcance completo

Expediente por negocio con contratos/versiones, sobres/firmantes y revisión KYC; listado/filtros Contrato|KYC, preparar revisión con asunto/motivo/confirmación y metadatos PDF/JPEG/PNG≤10MB. Actual solo shell/ExpedientesPrevia, sin upload ni tablas DOC. Futuro íntegro: storage privado, subida/scan/cuarentena/vínculo, versiones inmutables SHA256, descarga con URL firmada corta y audit, firma verificable e identidad/sello temporal/orden, revisión KYC/listas/PEP, retención, actas Posventa y portal documental. Fuente:41–87,112–147,199–223.

## Roles, entidades y reglas

Guard actual deals:view para tres páginas es provisional y no autoriza KYC real. Recursos documents/signatures/kyc propuestos aún fuera de recursos RBAC. Admin all+retención, gerente team sin firmar ajenos y sin KYC, broker own limitado sin KYC, asistente carga/consulta autorizada sin firma/KYC. Entidades futuras Document(negocio/tipo/nombre/estado/responsable), DocumentVersion(número/ruta privada/hash/autor), SignatureEnvelope(versión/estado/orden), Signer(identidad/firmado/sello/evidencia), KycCase(contacto/estado/responsable/retención). ENTITY_TYPES.file no equivale a tablas/servicio. Fuente:169–210.

## Estados, eventos/API y conexiones

Documento borrador→revisión→vigente→archivado; versión inmutable; sobre borrador→enviado→parcial→completo/anulado; firmante pendiente→verificado→firmado/rechazado; KYC pendiente→revisión→aprobado/rechazado. No endpoints ni proveedores productivos acreditados. Dominio QH metadatos/retención y storage bytes; NEG/CON vínculos; TAR enlaza evidencia sin sustituir almacenamiento; RES/APR evidence IDs; POR expediente de cliente; POS actas futuro; ACC permisos específicos. Twenty no es SoT. Fuente:89–147,199–223.

## UX, fallos y privacidad

Estados simulados cargando/vacío/error/offline/permiso; modal aclara no guardó, sin éxito real ni parcial scan implementados. Diseñar progreso seguro de upload/scan, fallo conservando referencia, cuarentena y reintento; estado de firma desconocido requiere conciliación antes de reenviar. Nunca bucket público; revalidar acceso al descargar y firma corta no sustituye permiso/retención. Cédula/pasaporte/bancarios/evidencias son sensibles, listados enmascarados y acceso/descarga auditados; cifrado, retención/purga/legal hold y acceso externo a definir. Fuente:35,60–75,87,118–122,175–210.

## Contradicciones y preguntas

TAR promete enlace seguro 155-17 sin servicio DOC; POR reutiliza misma vista previa sin identidad externa real; no heredar deals:view como autorización a archivo/KYC. Definir sujeto obligado/retención con asesoría (155-17/172-13), proveedor firma/identidad, evidencia legal (126-02 referencia), storage ya contratado y política menú demo. Separar clasificación y permisos de documentos comerciales/KYC para evitar fuga por vínculo a negocio. Declarar finalización de scan/firma por callbacks versionados/idempotentes y no sobrescribir versión vigente. Fuente:32–37,52–60,124–147,212–250.

## Aceptación pendiente

Acceso cruzado por documento rechazado incluso con deals:view; upload→scan→vínculo→firma→KYC reproducible y privado; versiones no reemplazables, hash verificable, URLs caducadas/invalidadas, callback duplicado/no ordenado, export auditado y supresión/retención definidas. Sin proveedor elegido ni pruebas ejecutadas. Revisión root/Luna pendiente.


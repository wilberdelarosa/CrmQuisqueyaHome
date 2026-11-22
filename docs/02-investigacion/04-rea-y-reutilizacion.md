# REA y estrategia de reutilización

D21/D03 · 2026-11-06 · investigación documental. Wilber identificó la herramienta: [morluto/rea](https://github.com/morluto/rea). HEAD remoto observado mediante `git ls-remote`: `bacc1e38464ce7eb87ce1fb6fb552c6b1854ac15`. No se instaló ni se ejecutó REA.

El proyecto ofrece CLI/MCP para analizar aplicaciones, JavaScript/Electron, sitios y binarios; devuelve evidencia y limitaciones para que un agente investigue. La licencia raíz es MIT; herramientas/proveedores y componentes de terceros tienen condiciones propias. El manifest observado declara `rea-agents` 6.8.0 y requisitos de Node específicos. Verificar versión y entorno antes de ejecutar. Fuentes: [README](https://github.com/morluto/rea/blob/main/README.md), [licencia](https://github.com/morluto/rea/blob/main/LICENSE), [manifest](https://github.com/morluto/rea/blob/main/package.json).

## Encaje para este proyecto (evaluación propia)

REA puede ayudar cuando interesa el comportamiento de una aplicación o su bundle y no hay un camino directo desde su código fuente. En nuestros dos proyectos sí hay fuentes e índices GitNexus: empezar por contratos, tests y flujos del repositorio aporta una explicación más directa. Usar REA como apoyo selectivo para una interacción o aplicación difícil de seguir, no como núcleo del CRM ni como sustituto del modelado de negocio.

Comparación por necesidad: GitNexus para relaciones entre símbolos/procesos del código accesible; navegador/pruebas para comportamiento observado; REA para inspección adicional de aplicación/bundle y runtime donde aporte evidencia distinta. Una salida generada se contrasta con fuentes, captura o prueba antes de convertirse en requisito.

## Prueba propuesta

Elegir una sola pregunta, por ejemplo «¿qué ocurre al convertir un interesado en oportunidad?» en una referencia autorizada. Guardar versión de la aplicación y entrada; obtener flujo con evidencia; contrastar con observación UI y documentación; registrar estados, errores, permisos y datos. Aceptación: cada conclusión crítica tiene evidencia reproducible y ayuda a diseñar un caso de uso sin depender de su implementación interna. Si la lectura del repositorio resuelve la misma pregunta con menos trabajo, no añadir otra herramienta.

La futura adquisición/ejecución sería aislada, fijando versión y revisando su configuración; este expediente no modifica MCP global. Material de análisis sin credenciales ni datos personales. La licencia MIT de REA no concede derechos sobre una aplicación analizada ni cambia la licencia del código que se estudia.

## Reutilización recomendada

1. Inventariar comportamiento y reglas del CRM anterior; clasificar conservar/cambiar/eliminar con el negocio.
2. Estudiar Espo Real Estate para dominio y Twenty para interacción; escribir especificaciones propias con fuentes.
3. Seleccionar bibliotecas y componentes permisivos por archivo/versión, con procedencia y dependencias.
4. Reusar una pieza solo si su contrato, licencia y mantenimiento son claros. No ensamblar varios núcleos CRM.
5. Mantener pruebas propias de aceptación y un adaptador hacia el portal, cualquiera sea la base elegida.

Decisión provisional: E4 (construir estudiando referencias) para reglas propias; E1/E3 para bibliotecas compatibles verificadas. Adopción de un CRM completo sigue como alternativa sujeta al piloto y política de licencias. Revisión humana de arquitectura y D12 de licencias pendiente.

# Evidencia · corte N0 del CRM nuevo · 2026-11-12

**Mandato:** M-004 (`mandato-crm-nuevo.md`). **Decisión:** DEC-004, Wilber: «Sí, CRM nuevo», «con un súper diseñazo y que funcione de la mejor forma y que tenga todo lo que te hablé», «quiero que el tema sea claro y que esté conectado al portal según la capa que configuramos en la VPS».
**Productor:** Claude. **Revisor independiente:** Codex `gpt-6.1-sol` (D12/D14), cuatro pasadas, veredicto final APROBADO.
**Repositorio:** `E:\viltrum-crm-inmobiliario`, rama `main`, commit `4a6f153`, sin push.

Convención: **[V]** verificado con comando o captura · **[NV]** no verificado, con el motivo.

## Qué se hizo

| Pieza | Resultado | Evidencia |
|---|---|---|
| Motor importado | Dominio, aplicación, infraestructura, API, migraciones, fichas y pruebas de `QuisqueyaHome_CRM@4ad09e6`; sin las 71 páginas viejas | `git archive` de rutas elegidas; 701 archivos en el primer commit [V] |
| Acoplamiento motor–pantallas | Un solo archivo dependía de una pantalla (lectura de comisiones); pasó al motor | `tsc`: 1 error al importar, 0 después [V] |
| Base local | `viltrum_crm_dev` en PostgreSQL 15 local, con el volcado de staging: 37 proyectos, 1.232 unidades, 22 leads, 2 negocios, 4 metas | conteos tras restaurar [V] |
| Empresa configurable | `config/empresas/quisqueya-home.json` validado al arrancar; marca, idioma, zona, monedas y tema | `src/infrastructure/empresa.ts` [V] |
| Tema claro | Tokens en `src/app/tokens.css`; lienzo claro, barra azul marino, acento dorado | capturas [V] |
| Acceso | Formulario con campos obligatorios marcados, error en su campo y aviso sin conexión | captura `acceso-escritorio-1440.png` [V]; envío con contraseña real [NV: Supabase Auth local apagado] |
| Armazón | Barra lateral en escritorio; cabecera, barra inferior y hoja «Más» en móvil; menú desde el registro y los permisos | capturas; el gerente no ve Comunicaciones [V] |
| Inicio | Datos reales; medidor «ritmo de la meta» | lectura por rol [V] |
| Puerta de certificación | Registro con tres estados; al menú de todos solo llega lo certificado | `navegacion.test.ts`, `registry.test.ts` [V] |

## Inicio por rol (base local, datos de staging)

| Rol | Meta mostrada | Resultado |
|---|---|---|
| Administrador | De la compañía | 1 de 9 cierres; «Faltan 8 cierres y quedan 18 días: necesitas 3,1 por semana» [V] |
| Gerente | De su equipo (suma de sus brokers) | 1 de 9; ve la tarea y el negocio de su equipo; nombre visible solo de contactos de su equipo [V] |
| Broker | La propia | 1 de 3; «Vas en ritmo» [V] |

Dos fallos del motor salieron al construir Inicio y quedaron corregidos con prueba: al gerente se le reducía el alcance a «solo lo propio» (veía todo en cero), y al administrador no se le mostraba la meta de la compañía.

## Verificación

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` | 0 errores [V] |
| `eslint .` (todo el repositorio) | limpio [V] |
| `npm test` | 1.056 pasan, 0 fallan, 5 en espera [V] |
| `next build` | correcto, 54 páginas generadas [V] |
| Anchos 320, 390, 768, 1280, 1440 | sin desborde horizontal, sin errores de consola, objetivos táctiles de 40 px o más [V: Playwright] |
| Secretos en el commit | ninguno encontrado; `.env` ignorado [V: búsqueda de patrones] |

Capturas: `04-diseno/crm-nuevo-n0/` (acceso y Inicio en escritorio; Inicio en 390 y 320; hoja «Más»).

## Hallazgos del revisor y respuesta

| Pasada | Hallazgo | Respuesta |
|---|---|---|
| 1 · P1 | Al «ver como broker», un administrador recibía la meta de la compañía | Con visibilidad restringida la meta nunca es la de compañía; guarda de fuente |
| 1 · P2 | El selector de rol aparecía también en una sesión real | Solo en sesión de evaluación (misma regla que el middleware) |
| 1 · P2 | «Cerrar sesión» en evaluación volvía a entrar como administrador | En evaluación no se pinta; se cambia de rol |
| 1 · P2 | Las guardas omitidas podían quedar dormidas para siempre | Lista única y candado automático en el registro |
| 1 · P3 | El aviso sin conexión prometía guardar después | Texto corregido |
| 2 · P2 | Las pruebas repetían rutas en vez de usar la lista | Las cinco guardas leen de la lista por id |
| 3 · P2 | Dos guardas asignadas al módulo equivocado (error del productor) | Corregido; prueba nueva que compara carpeta y módulo |
| 4 | — | APROBADO |

## No verificado

- Acceso con correo y contraseña reales, recuperación de contraseña e invitaciones.
- Lector de pantalla y navegación completa por teclado.
- Estado de error de Inicio provocado de verdad (existe la pantalla; no se forzó el fallo).
- Conexión del CRM nuevo con el portal: la base local es una copia; el CRM nuevo todavía no está desplegado ni recibe leads de la pasarela.
- Concurrencia real en PostgreSQL de la regla de traslado de contactos (heredada de `4ad09e6`).

## Estado de la lista de aceptación de Wilber

| # | Pedido | Estado tras N0 |
|---|---|---|
| 1 | Conectado al portal, proyectos cargados | Catálogo real cargado en local; la conexión viva sigue en el CRM anterior de staging |
| 2 | Todos los módulos de la carpeta | 1 de 22 con pantalla (Inicio, en revisión); el motor de los 22 está importado |
| 3 | Pipeline y flujo conectado | Motor listo y probado en staging; pantallas pendientes |
| 4 | Esquema de base de datos | Importado: 84 tablas, 20 migraciones |
| 5 | Metas general y por broker | Medidor en Inicio para compañía, equipo y broker; módulo Metas pendiente |
| 6 | Modo app en móvil | Armazón hecho |
| 7 | Web muy profesional | Sistema de diseño y armazón hechos |
| 8 | Nada simulado | Cumplido en lo construido; regla de certificación activa |
| 9 | Open source de base, licencia vendible | Base abierta (PostgreSQL, Supabase Auth, Next.js, React, Drizzle, Tailwind, Radix); motores adicionales pendientes |
| 10 | Otras empresas configurables | Configuración por archivo hecha; idioma, moneda y zona aún fijos en partes del motor |
| 11 | Tareas y recordatorios | Pendiente (corte N2) |
| 12 | Google Calendar | Pendiente (corte N2) |
| 13 | Robusto y expansible | Arquitectura del motor conservada; guardas de arquitectura activas |

## Siguiente corte (N1)

Leads, Negocios, Propiedades, Tareas/Agenda y Metas, cada uno hasta certificarlo, empezando por Leads porque es donde entra el portal.

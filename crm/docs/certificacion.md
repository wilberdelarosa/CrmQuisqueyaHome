# Certificación de un módulo

Un módulo pasa por tres estados en `src/modules/registry.ts`:

| Estado | Quién lo ve |
|---|---|
| `en_construccion` | Nadie. Con la bandera de revisión se lista sin enlace |
| `en_revision` | Solo quien revisa, con `CRM_MOSTRAR_EN_REVISION=1` |
| `certificado` | Todos los usuarios con permiso |

## Condiciones para certificar

Todas, con evidencia enlazada:

1. **Datos reales.** Ninguna pantalla con datos de ejemplo. Lo que no existe en el motor no se dibuja.
2. **Seis estados por pantalla:** carga, vacío, error, sin conexión, éxito y sin permiso.
3. **Formularios que explican:** obligatorio marcado, error en su campo, el botón solo se bloquea mientras envía y lo dice.
4. **Anchos 320, 390, 768, 1280 y 1440** sin desbordes; objetivos táctiles de 40 px o más.
5. **Permisos por rol probados** contra el servidor: administrador, gerente, broker y asistente.
6. **Recorrido real** de punta a punta con datos del portal, no solo pruebas unitarias.
7. **Vocabulario del negocio:** ningún término técnico ni en inglés llega al usuario (`vocabulario.test.ts`).
8. **Guardas en espera vaciadas:** las del módulo en `docs/guardas-en-espera.md` vuelven a exigirse.
9. **Tipos, lint, pruebas y compilación en verde.**
10. **Revisión independiente** por alguien distinto de quien lo construyó.

## Quién certifica

El cambio de `en_revision` a `certificado` lo integra el orquestador tras la revisión independiente. Quien construyó el módulo no lo certifica.

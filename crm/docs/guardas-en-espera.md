# Guardas en espera

El motor llegó con pruebas que vigilaban archivos de las pantallas anteriores. Esas pantallas no se importaron, así que cada guarda se omite con su motivo (`src/application/testing/pantalla-pendiente.ts`) y vuelve a exigirse sola cuando la pantalla exista en la ruta indicada.

La lista vive en `src/application/testing/guardas-en-espera.ts`. El candado es automático: `registry.test.ts` falla si un módulo pasa a `certificado` y alguna de sus guardas sigue esperando un archivo que no existe. Si la pantalla nueva vive en otra ruta, se apunta la guarda a esa ruta en la lista y en la prueba.

| Módulo | Prueba | Qué protege | Archivo que espera |
|---|---|---|---|
| Búsqueda | `application/busqueda/m41-r2-render.test.ts` · G1-06 | La paleta muestra las etiquetas en español de cada resultado, nunca el estado técnico | `app/(crm)/_ui/command-palette.tsx` |
| Leads | `application/leads/s3-flujos.test.ts` · S3 regresión UI | Tomar un lead usa su operación propia y no la reasignación administrativa | `app/(crm)/leads/inspector.tsx` |
| Leads | `application/leads/s3-flujos.test.ts` · S3 cola | La cola sin responsable solo se amplía para brokers con edición, leads abiertos y fuera de papelera | `app/(crm)/leads/page.tsx` |
| Configuración (M13) | `infrastructure/conexiones-oauth/rutas.test.ts` · botón de Google | El botón de Google cumple la guía de marca | `app/(crm)/configuracion/conexiones/botones.tsx` y `logos.tsx` |
| Academy (M10) | `lib/academy-fechas.test.ts` · render | El reloj del servidor y los formatos de fecha son deterministas | `app/(crm)/academy/page.tsx` y `vista.tsx` |

## Reglas que cambiaron al importar

- **Registro de módulos.** Antes: toda ruta base debía tener su `page.tsx`. Ahora: la exige solo un módulo `certificado`, y ninguna carpeta de pantallas puede vivir fuera del registro.
- **Contraste AA de los tokens.** Sigue activa y ya vigila los tokens nuevos de `src/app/tokens.css`.

## Pendientes del motor detectados en N0

- Idioma `es-DO`, moneda `USD` y zona `America/Santo_Domingo` siguen fijos en varios puntos del motor (`domain/zona-horaria.ts`, `application/dashboard/consultas.ts`). Deben leerse de la configuración de la empresa.
- Doce páginas anteriores consultaban la base directamente; al reconstruirlas, esas lecturas van al motor.
- El acceso de evaluación entra como administrador cuando no se ha elegido rol (`middleware.ts`). El cambio de rol se hace desde el armazón.
- Falta la pantalla de recuperación de contraseña (la ruta de API existe).

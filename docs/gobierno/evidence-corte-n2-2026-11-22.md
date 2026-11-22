# Evidencia del corte N2 — 2026-11-22

**Producto:** `E:\viltrum-crm-inmobiliario`, commit `cba47b2`.
**Productor:** Claude (sesión principal). **Revisor independiente:** Codex CLI en solo lectura, cuatro pasadas, veredicto final APROBADO.

## Alcance

| Módulo | Qué quedó |
|---|---|
| Comisiones (M9) | Totales por estado y moneda; filtros por mes, estado y broker; aprobar, marcar pagada, anular, cambiar reparto; CSV |
| Reportes (M12) | Embudo, fuentes, leads por mes, rendimiento por broker, motivos de pérdida, zonas, inventario, velocidad de cierre, comisiones por mes (montos en USD) |
| Brokers (M7) | Carga y avance del mes por broker, metas, asignación de proyectos |
| Reservas (M17) | Apartados de 48 h desde la ficha del negocio, extender, liberar, historial; lista de reservas firmadas |
| Propiedades | Carga del precio real por unidad (solo con `unit_real_price:edit` y unidades en alcance `all`) |
| Leads y Negocios | Filtro por broker |

## Corrección del motor de apartados (M40)

Encontrado al construir la pantalla y ampliado por la revisión:

1. Crear, extender y cancelar un apartado no comprobaban que el negocio estuviera al alcance del actor. Ahora sí, dentro de la transacción y tras bloquear el negocio.
2. Se podía apartar a nombre de cualquier titular. Ahora el titular debe estar al alcance.
3. El precio lo mandaba el navegador sin verificar, y quien no ve precios reales no podía apartar. Ahora el servidor pone el precio vigente; si llega uno, debe coincidir. La respuesta oculta el precio a quien no ve precios reales.
4. Se podía apartar una unidad que no era propiedad del negocio. Ahora se rechaza (409).
5. Un apartado no puede mezclar monedas.

## Hallazgos de Codex y cierre

| Pasada | Hallazgos | Estado |
|---|---|---|
| 1 | Unidad no asociada al negocio (bloqueante); monedas mezcladas; importes de reservas sin permiso; proyectos sin alcance en Brokers; conteos de leads sin filtro | Corregidos |
| 2 | Montos y metas en Brokers sin sus permisos | Corregido |
| 3 | `visibilityOwnerIds` («ver como») no aplicado en las listas de brokers | Corregido con `reaches` |
| 4 | Ninguno | APROBADO |

## Verificación

- `tsc` y `eslint` limpios; 1065 pruebas pasan, 3 en espera; `next build` correcto.
- Recorrido con clics `scripts/e2e/modulos-n2.cjs`, 9 de 9 pasos: precio real cargado, proyecto asignado, comisión aprobada, unidad añadida y apartada por el broker, apartado en negocio ajeno rechazado (404), unidad ajena al negocio rechazada (409), extensión, liberación e historial, gerente ve el proyecto.
- 6 pantallas × 3 roles × 2 anchos (1440 y 390) sin errores de consola ni desborde. Capturas en `04-diseno/crm-nuevo-n2/`.

## Brechas abiertas

- **Ninguna unidad tiene precio real** (0 de 1.230): sin él no se puede apartar. Lo carga la administración en Propiedades.
- Reservas firmadas dependen de Documentos (condiciones firmadas).
- Reportes solo suma montos en USD.
- El gerente no tiene `reports:view` por defecto; se activa en la matriz de permisos si se quiere.
- Datos de prueba que dejó el recorrido en la base local: precios reales en SG-A201 a SG-A204, Sun Garden asignado a Broker Prueba 2, una comisión aprobada y apartados liberados.

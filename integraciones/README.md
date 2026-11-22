# Integraciones con el portal

Código que corre en la VPS de staging junto al portal. Copiado de `/opt/espocrm-adapter` y `/opt/inventario-hub` el 2026-11-22, sin archivos `.env`, datos ni respaldos.

## Pasarela de leads (`pasarela-leads/`)

Recibe el `POST /api/leads/externo` del portal (cabecera `x-webhook-token`) y reenvía el mismo lead a varios destinos que cumplen el mismo contrato. Un solo servidor, `server.mjs`, con adaptadores intercambiables (`CRM_ADAPTER=espocrm`, `odoo` o `fanout`).

- El destino principal (el CRM) devuelve el `leadId` al portal; si falla, responde 502 y el portal reintenta.
- Si falla un destino secundario, el lead queda en una cola de pendientes y se reintenta con `POST /api/fanout/reintentar`.
- Idempotente por `externalId`; normaliza el teléfono a E.164 (`lib/telefono.mjs`) y vincula el proyecto por nombre o slug (`lib/proyectos.mjs`).
- `GET /health` informa del estado de cada destino.
- Pruebas: `prueba-fanout.sh`, `prueba-e2e.sh`, `prueba-e2e-odoo.sh`.

Configuración en `.env.fanout` (no incluido): `CRM_ADAPTER`, `FANOUT_PRIMARY`, `FANOUT_TARGETS`, `LEADS_WEBHOOK_TOKEN` y un token por destino. `crear-env-fanout.sh` lo genera en la VPS.

## Concentrador de inventario (`concentrador-inventario/`)

Sincroniza proyectos, tipologías y unidades entre el portal, el CRM, EspoCRM y Odoo, en ciclos de 30 segundos, con fusión de tres vías por campo para no pisar cambios hechos en otro sistema.

- `recursos.mjs` declara cada recurso; `adapters/` tiene un adaptador por sistema.
- `core.mjs` contiene la fusión y `core.test.mjs` sus pruebas.
- `hub-cli.sh` para ejecutar un ciclo, ver el estado o forzar una sincronización.
- Al añadir un recurso nuevo, arrancar con `HUB_AUTO=0` para revisar el primer ciclo antes de dejarlo automático.

Los archivos `unidades-reales*.json` son la disponibilidad tomada de Drive el 2026-09-02, pendiente de validación comercial.

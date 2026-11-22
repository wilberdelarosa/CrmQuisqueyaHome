# CRM inmobiliario

Producto CRM para empresas inmobiliarias: leads, negocios, inventario, agenda, metas y comisiones, conectado al portal de cada empresa. Una instalación aislada por empresa; la marca y los catálogos salen de configuración.

Next.js 15 · React 19 · TypeScript · PostgreSQL · Drizzle · Supabase Auth · Tailwind 4.

## Estado

Corte N0 (cimientos). Mandato: `E:\CRM Final Quisqueya Home noviembre\.viltrum\mandato-crm-nuevo.md` (M-004).

| Pieza | Estado |
|---|---|
| Motor de reglas (dominio, aplicación, infraestructura, API, migraciones) | Importado de `QuisqueyaHome_CRM@4ad09e6`, con sus pruebas |
| Empresa configurable | `config/empresas/<id>.json`, elegida con `CRM_EMPRESA` |
| Sistema de diseño (tema claro) | `src/app/tokens.css`, `docs/DESIGN.md` |
| Acceso y armazón web y app | Construidos |
| Inicio | Construido, en revisión |
| Los otros 21 módulos | En construcción: el motor existe, la pantalla no |

Un módulo aparece en el menú de todos solo cuando está certificado: `docs/certificacion.md`.

## Levantar en local

Requiere Node 22 o superior y PostgreSQL 15.

```bash
npm ci
```

```bash
npm run dev -- -p 9401
```

Variables en `.env` (ver `.env.example`). En desarrollo, `CRM_EVAL_LOGIN=1` entra sin contraseña desde `localhost` y permite cambiar de rol en el armazón; `CRM_MOSTRAR_EN_REVISION=1` muestra los módulos construidos sin certificar y la lista de los que faltan.

## Verificar antes de dar algo por hecho

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm test
```

```bash
npm run build
```

## Mapa

- `src/domain` reglas puras · `src/application` casos de uso y puertos · `src/infrastructure` adaptadores (base de datos, autenticación, integraciones) · `src/app/api` rutas.
- `src/app/(crm)` pantallas; `_armazon` es la navegación compartida.
- `src/modules/registry.ts` registro de los 22 módulos y su estado de certificación.
- `spec/` fichas funcionales de cada módulo.
- `drizzle/` migraciones.

## Reglas de trabajo

Quien escribe no revisa. Nada se integra sin tipos, lint y pruebas en verde y sin revisión independiente. Producción requiere aprobación expresa del dueño.

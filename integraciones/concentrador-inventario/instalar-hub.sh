#!/bin/sh
# Se ejecuta EN LA VPS (código ya copiado a /opt/inventario-hub). Instala dependencias, genera .env.hub (600) con
# secretos leídos de los entornos existentes (nada se imprime) y levanta el contenedor `inventario-hub`.
set -eu
cd /opt/inventario-hub
leer() { grep -m1 "^$2=" "$1" | cut -d= -f2-; }
docker run --rm -v /opt/inventario-hub:/app -w /app node:22-alpine npm install --omit=dev --no-audit --no-fund 2>&1 | tail -2

PORTAL_URL=$(grep -m1 'DATABASE_URL:' /opt/quisqueya-staging/docker-compose.yml | sed -E 's/^[^:]*: *//; s/["'"'"']//g; s/\r$//')
CRM_URL=$(leer /opt/quisqueya-crm-staging/.env DATABASE_URL)
[ -n "$PORTAL_URL" ] && [ -n "$CRM_URL" ] || { echo "falta alguna URL de base" >&2; exit 1; }
if [ -f .env.hub ] && grep -q '^HUB_TOKEN=' .env.hub; then T=$(leer .env.hub HUB_TOKEN); else T=$(head -c 48 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 40); fi
AUTO=${HUB_AUTO:-0}
umask 077
cat > .env.hub <<EOF
HUB_TOKEN=$T
HUB_SYSTEMS=portal,crm_propio,espocrm,odoo
HUB_INTERVAL_S=30
HUB_AUTO=$AUTO
PORTAL_DATABASE_URL=$PORTAL_URL
CRM_DATABASE_URL=$CRM_URL
ESPO_URL=$(leer /opt/espocrm-adapter/.env ESPO_URL)
ESPO_API_KEY=$(leer /opt/espocrm-adapter/.env ESPO_API_KEY)
ODOO_URL=$(leer /opt/espocrm-adapter/.env.odoo ODOO_URL)
ODOO_DB=$(leer /opt/espocrm-adapter/.env.odoo ODOO_DB)
ODOO_API_LOGIN=$(leer /opt/espocrm-adapter/.env.odoo ODOO_API_LOGIN)
ODOO_API_PASSWORD=$(leer /opt/espocrm-adapter/.env.odoo ODOO_API_PASSWORD)
EOF
chmod 600 .env.hub
mkdir -p data
cat > docker-compose.yml <<'EOF'
name: inventario-hub
services:
  hub:
    image: node:22-alpine
    container_name: inventario-hub
    restart: unless-stopped
    working_dir: /app
    command: ["node", "hub.mjs"]
    env_file: .env.hub
    volumes: ["/opt/inventario-hub:/app:ro", "/opt/inventario-hub/data:/data"]
    networks: [espocrm, edge-crm, quisqueya_staging]
    mem_limit: 192m
networks:
  espocrm: { external: true, name: espocrm_espocrm }
  edge-crm: { external: true, name: edge-crm }
  quisqueya_staging: { external: true, name: quisqueya_staging }
EOF
docker compose up -d --force-recreate 2>&1 | tail -3
sleep 4
docker logs --tail 4 inventario-hub 2>&1 | cut -c1-200

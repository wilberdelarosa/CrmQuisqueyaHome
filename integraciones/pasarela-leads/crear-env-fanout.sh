#!/bin/sh
# Se ejecuta EN LA VPS. Genera /opt/espocrm-adapter/.env.fanout (600) con el token propio de la pasarela y los
# tokens de cada destino leídos de sus .env. Ningún valor sale de la VPS ni se imprime.
set -eu
cd /opt/espocrm-adapter
leer() { grep -m1 "^$2=" "$1" | cut -d= -f2-; }
T_ESPO=$(leer .env LEADS_WEBHOOK_TOKEN)
T_ODOO=$(leer .env.odoo LEADS_WEBHOOK_TOKEN)
T_PROPIO=$(leer /opt/quisqueya-crm-staging/.env LEADS_WEBHOOK_TOKEN)
[ -n "$T_ESPO" ] && [ -n "$T_ODOO" ] && [ -n "$T_PROPIO" ] || { echo "falta algún token de destino" >&2; exit 1; }
if [ -f .env.fanout ] && grep -q '^LEADS_WEBHOOK_TOKEN=' .env.fanout; then T_GW=$(leer .env.fanout LEADS_WEBHOOK_TOKEN); else T_GW=$(head -c 48 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 40); fi
umask 077
cat > .env.fanout <<EOF
CRM_ADAPTER=fanout
LEADS_WEBHOOK_TOKEN=$T_GW
FANOUT_PRIMARY=crm_propio
FANOUT_TARGETS=[{"name":"crm_propio","url":"http://quisqueya-crm-staging-app:3000","tokenVar":"TOKEN_CRM_PROPIO"},{"name":"espocrm","url":"http://espocrm-leads-adapter:8080","tokenVar":"TOKEN_ESPOCRM"},{"name":"odoo","url":"http://odoo-leads-adapter:8080","tokenVar":"TOKEN_ODOO"}]
TOKEN_CRM_PROPIO=$T_PROPIO
TOKEN_ESPOCRM=$T_ESPO
TOKEN_ODOO=$T_ODOO
EOF
chmod 600 .env.fanout
mkdir -p data-fanout
echo "env.fanout listo ($(wc -l < .env.fanout) líneas)"

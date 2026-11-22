#!/bin/sh
# Pruebas del puente Portal -> EspoCRM. Se ejecuta EN la VPS. Lee secretos de los .env, no los imprime.
set -u
TOKEN=$(grep '^LEADS_WEBHOOK_TOKEN=' /opt/espocrm-adapter/.env | cut -d= -f2-)
KEY=$(grep '^ESPO_API_KEY=' /opt/espocrm-adapter/.env | cut -d= -f2-)
SEC=$(grep '^ESPO_WEBHOOK_SECRET=' /opt/espocrm-adapter/.env | cut -d= -f2-)
RUN=$(date +%s)
EXT="portal_inquiry_test_$RUN"
A="docker exec espocrm-leads-adapter"
post() { # $1 token  $2 cuerpo
  $A wget -qO- -S --header="Content-Type: application/json" --header="x-webhook-token: $1" --post-data="$2" http://localhost:8080/api/leads/externo 2>&1 | tr '\n' ' ' | sed -E 's/  +/ /g' | grep -oE 'HTTP/1.1 [0-9]+|\{.*\}' | tr '\n' ' '
  echo
}
contar() { docker exec espocrm-leads-adapter wget -qO- --header="X-Api-Key: $KEY" "http://espocrm/api/v1/Lead?maxSize=1&where%5B0%5D%5Btype%5D=equals&where%5B0%5D%5Battribute%5D=cIdExterno&where%5B0%5D%5Bvalue%5D=$1" | grep -oE '"total":[0-9]+'; }
BODY='{"externalId":"'$EXT'","fullName":"María Fernández Prueba","email":"maria.prueba@example.test","phone":"+18095550101","projectInterestText":"Cap Cana Marina Bay Luxury Residences","operationType":"sale","originalMessage":"Nota: quiero ver el proyecto | Fecha preferida: 2026-11-10 | Horario: tarde | Canal: whatsapp_call | Intención: visita"}'

echo "1) Crear lead (esperado 201 created:true)";           post "$TOKEN" "$BODY"
echo "   leads con ese externalId:"; contar "$EXT"
echo "2) Repetir el MISMO envío (esperado 200 created:false)"; post "$TOKEN" "$BODY"
echo "   leads con ese externalId:"; contar "$EXT"
echo "3) Token incorrecto (esperado 401)";                 post "malo" "$BODY"
echo "4) Datos inválidos (esperado 422)";                  post "$TOKEN" '{"externalId":"","fullName":"","email":"no-es-correo"}'
EXT2="portal_inquiry_conc_$RUN"
B2='{"externalId":"'$EXT2'","fullName":"Concurrente Prueba","email":"conc@example.test"}'
echo "5) 8 envíos simultáneos del mismo externalId (esperado 1 solo lead)"
i=0; while [ $i -lt 8 ]; do ( post "$TOKEN" "$B2" >/dev/null ) & i=$((i+1)); done; wait
contar "$EXT2"
EXT3="portal_inquiry_fallo_$RUN"
B3='{"externalId":"'$EXT3'","fullName":"Fallo Reintento Prueba","email":"fallo@example.test"}'
echo "6) CRM caído: se desconecta el adaptador de la red de EspoCRM (esperado 502)"
docker network disconnect espocrm_espocrm espocrm-leads-adapter
post "$TOKEN" "$B3"
echo "   leads tras el fallo (esperado 0):"; docker network connect espocrm_espocrm espocrm-leads-adapter; sleep 2; contar "$EXT3"
echo "7) CRM recuperado: el portal reintenta el mismo envío (esperado 201) y de nuevo (200)"
post "$TOKEN" "$B3"; post "$TOKEN" "$B3"
echo "   leads con ese externalId (esperado 1):"; contar "$EXT3"
echo "8) Webhook CRM->portal con firma válida (200) e inválida (401)"
P='{"event":"Lead.update","id":"x","status":"In Process"}'
H=$(printf '%s' "$P" | openssl dgst -sha256 -hmac "$SEC" -hex | sed 's/^.* //')
SIG=$(printf 'wh1:%s' "$H" | base64 | tr -d '\n')
$A wget -qO- -S --header="Content-Type: application/json" --header="Signature: $SIG" --post-data="$P" http://localhost:8080/api/crm/estado 2>&1 | grep -oE 'HTTP/1.1 [0-9]+|\{.*\}' | tr '\n' ' '; echo
$A wget -qO- -S --header="Content-Type: application/json" --header="Signature: aW52YWxpZG86eA==" --post-data="$P" http://localhost:8080/api/crm/estado 2>&1 | grep -oE 'HTTP/1.1 [0-9]+' | tr '\n' ' '; echo
echo "   bandeja de salida:"; $A sh -c 'wc -l < /data/estado-outbox.jsonl'
echo "RUN=$RUN"

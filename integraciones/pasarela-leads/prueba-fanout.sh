#!/bin/sh
# Se ejecuta EN LA VPS. Prueba la pasarela multicanal con leads de prueba (prefijo TEST-). No imprime tokens.
set -u
cd /opt/espocrm-adapter
GW=$(docker inspect -f '{{(index .NetworkSettings.Networks "supabase_default").IPAddress}}' crm-leads-gateway)
TOK=$(grep -m1 '^LEADS_WEBHOOK_TOKEN=' .env.fanout | cut -d= -f2-)
RUN=${1:-$(date +%H%M%S)}
post() { # titulo token cuerpo
  printf '%s\n' "--- $1"
  curl -s -m 60 -o /tmp/fan.out -w 'HTTP %{http_code}\n' -X POST -H 'Content-Type: application/json' -H "x-webhook-token: $2" -d "$3" "http://$GW:8080/api/leads/externo"
  cat /tmp/fan.out; echo
}
A='{"externalId":"TEST-fan-'$RUN'-1","fullName":"Prueba Integración Uno","email":"prueba.uno@example.test","phone":"+18095550101","projectInterestText":"Olea at Cap Cana","operationType":"sale","originalMessage":"Nota: quiero ver unidades de 2 habitaciones | Canal: videollamada"}'
post "1 lead nuevo (proyecto por nombre)" "$TOK" "$A"
post "2 mismo lead otra vez (idempotente)" "$TOK" "$A"
post "3 proyecto por slug" "$TOK" '{"externalId":"TEST-fan-'$RUN'-2","fullName":"Prueba Integración Dos","email":"prueba.dos@example.test","phone":"+18095550102","projectInterestText":"vista-farallon","operationType":"sale","originalMessage":"Cita solicitada desde Portal Web"}'
post "4 proyecto que no existe" "$TOK" '{"externalId":"TEST-fan-'$RUN'-3","fullName":"Prueba Integración Tres","projectInterestText":"Proyecto Inexistente","originalMessage":"sin proyecto real"}'
post "5 token incorrecto" "token-malo" "$A"
post "6 cuerpo inválido" "$TOK" '{"fullName":""}'
printf '%s\n' "--- salud"; curl -s http://$GW:8080/health; echo

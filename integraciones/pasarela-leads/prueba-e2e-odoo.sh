#!/bin/sh
# Pruebas del puente Portal -> Odoo (mismo contrato que EspoCRM). Se ejecuta EN la VPS.
# Cuenta los leads con una consulta JSON-RPC desde el propio contenedor del adaptador (no imprime secretos).
set -u
cd /opt/espocrm-adapter
TOKEN=$(grep '^LEADS_WEBHOOK_TOKEN=' .env.odoo | cut -d= -f2-)
RUN=$(date +%s)
A="docker exec odoo-leads-adapter"
post() { # $1 token  $2 cuerpo
  $A wget -qO- -S --header="Content-Type: application/json" --header="x-webhook-token: $1" --post-data="$2" http://localhost:8080/api/leads/externo 2>&1 | tr '\n' ' ' | sed -E 's/  +/ /g' | grep -oE 'HTTP/1.1 [0-9]+|\{.*\}' | tr '\n' ' '
  echo
}
contar() { # $1 externalId
  $A node -e '
    const e=process.env;const u=e.ODOO_URL+"/jsonrpc";
    const rpc=(s,m,a)=>fetch(u,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",method:"call",params:{service:s,method:m,args:a},id:1})}).then(r=>r.json()).then(j=>j.result);
    (async()=>{const uid=await rpc("common","login",[e.ODOO_DB,e.ODOO_API_LOGIN,e.ODOO_API_PASSWORD]);
    const n=await rpc("object","execute_kw",[e.ODOO_DB,uid,e.ODOO_API_PASSWORD,"crm.lead","search_count",[[["x_external_id","=",process.argv[1]]]],{context:{active_test:false}}]);
    console.log("   leads en Odoo con ese externalId:",n)})()' "$1"
}
EXT="portal_inquiry_odoo_$RUN"
BODY='{"externalId":"'$EXT'","fullName":"María Fernández Prueba","email":"maria.odoo@example.test","phone":"+18095550102","projectInterestText":"Cap Cana Marina Bay Luxury Residences","operationType":"sale","originalMessage":"Nota: quiero ver el proyecto | Fecha preferida: 2026-11-10 | Canal: whatsapp_call"}'
echo "1) Crear lead (esperado 201 created:true)";             post "$TOKEN" "$BODY"; contar "$EXT"
echo "2) Repetir el MISMO envío (esperado 200 created:false)"; post "$TOKEN" "$BODY"; contar "$EXT"
echo "3) Token incorrecto (esperado 401)";                    post "malo" "$BODY"
echo "4) Datos inválidos (esperado 422)";                     post "$TOKEN" '{"externalId":"","fullName":"","email":"no-es-correo"}'
EXT2="portal_inquiry_odoo_conc_$RUN"
B2='{"externalId":"'$EXT2'","fullName":"Concurrente Odoo","email":"conc.odoo@example.test"}'
echo "5) 8 envíos simultáneos del mismo externalId (esperado 1)"
i=0; while [ $i -lt 8 ]; do ( post "$TOKEN" "$B2" >/dev/null ) & i=$((i+1)); done; wait
contar "$EXT2"
EXT3="portal_inquiry_odoo_fallo_$RUN"
B3='{"externalId":"'$EXT3'","fullName":"Fallo Reintento Odoo","email":"fallo.odoo@example.test"}'
echo "6) Odoo caído (se desconecta la red edge-crm del adaptador) (esperado 502)"
docker network disconnect edge-crm odoo-leads-adapter
post "$TOKEN" "$B3"
docker network connect edge-crm odoo-leads-adapter; sleep 2
echo "   tras el fallo y reconectar:"; contar "$EXT3"
echo "7) Odoo recuperado: el portal reintenta (esperado 201) y de nuevo (200)"
post "$TOKEN" "$B3"; post "$TOKEN" "$B3"; contar "$EXT3"
echo "RUN=$RUN"

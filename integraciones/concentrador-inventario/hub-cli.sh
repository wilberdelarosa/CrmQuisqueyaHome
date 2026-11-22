#!/bin/sh
# Se ejecuta EN LA VPS. Uso: sh hub-cli.sh <GET|POST> <ruta>   (añade el token del concentrador sin imprimirlo)
set -u
IP=$(docker inspect -f '{{(index .NetworkSettings.Networks "quisqueya_staging").IPAddress}}' inventario-hub)
T=$(grep -m1 '^HUB_TOKEN=' /opt/inventario-hub/.env.hub | cut -d= -f2-)
curl -s -m 180 -X "$1" -H "x-hub-token: $T" "http://$IP:8081$2"
echo

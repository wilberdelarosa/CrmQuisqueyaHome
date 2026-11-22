# Conexión a la VPS de Quisqueya Home

El acceso usa el alias SSH `hostinger` ya configurado en Windows. La clave y la verificación de identidad del servidor se resuelven con la configuración SSH del usuario. El túnel escucha en la interfaz local y se cierra con Ctrl+C.

Desde la carpeta raíz del proyecto en PowerShell:

```powershell
.\10-espacio-local\conectar-vps.ps1
.\10-espacio-local\conectar-vps.ps1 -Accion Tunel
```

Con el túnel abierto, usar [CRM de desarrollo](http://127.0.0.1:13201/) o [comprobar salud](http://127.0.0.1:13201/api/health). La aplicación remota solicita su propio inicio de sesión.

| Entorno verificado | Proyecto o servicio | Destino privado en la VPS | Uso |
| --- | --- | --- | --- |
| Desarrollo | `/opt/qh-dev` | `127.0.0.1:3201` | Conexión predeterminada del espacio local |
| Staging | `quisqueya-crm-staging-app` | `127.0.0.1:3101` | Abrir por separado con `-Entorno Staging -PuertoLocal 13101` |

La aplicación remota devolvió HTTP 200 en `/api/health` y redirigió la raíz al inicio de sesión en ambos entornos. Las rutas pertenecen a instancias existentes del CRM. El CRM nuevo tiene aquí su preparación documental. OAuth y envío de correo requieren su propia comprobación cuando se trabaje en esos flujos.

Si el puerto local está ocupado, elegir otro con `-PuertoLocal`. Si SSH rechaza la identidad de la VPS o la clave del usuario, revisar la configuración del alias `hostinger` con su administrador. Las referencias de operación de la infraestructura están en el [inventario Docker local](../00-fuentes-drive/central/04-Infraestructura/inventario-docker.md) y en el [estado histórico de integraciones](../00-fuentes-drive/central/06-Estado-Integraciones/Estado%20Login%20-%20Google%20-%20Correo.txt).

[CmdletBinding()]
param(
    [ValidateSet('Estado', 'Tunel')]
    [string] $Accion = 'Estado',

    [ValidateSet('Desarrollo', 'Staging')]
    [string] $Entorno = 'Desarrollo',

    [ValidateRange(1024, 65535)]
    [int] $PuertoLocal = 13201
)

$ErrorActionPreference = 'Stop'
$ssh = (Get-Command ssh -CommandType Application).Source
$servidor = 'hostinger'
$puertoRemoto = if ($Entorno -eq 'Desarrollo') { 3201 } else { 3101 }
$opciones = @('-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes',
    '-o', 'ConnectTimeout=8', '-o', 'ConnectionAttempts=1')

if ($Accion -eq 'Estado') {
    $verificacion = 'printf "SSH OK\n"; curl --fail --silent --show-error --max-time 8 --output /dev/null --write-out "HTTP %{http_code}\n" http://127.0.0.1:' +
        $puertoRemoto + '/api/health'
    Write-Host "Consultando $Entorno en la VPS por SSH."
    & $ssh @opciones $servidor $verificacion
} else {
    $destino = "127.0.0.1:${PuertoLocal}:127.0.0.1:${puertoRemoto}"
    Write-Host "Abre http://127.0.0.1:$PuertoLocal en el navegador."
    Write-Host 'Mantén esta terminal abierta. Pulsa Ctrl+C para cerrar el túnel.'
    & $ssh @opciones -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -N -T -L $destino $servidor
}
exit $LASTEXITCODE

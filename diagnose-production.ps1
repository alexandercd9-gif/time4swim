# Script para diagnosticar el problema en produccion
Write-Host "Diagnostico de Base de Datos en Produccion" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$server = "137.184.126.212"
$remotePath = "/root/time4swim"
$scriptName = "check-production-db.js"

# 1. Copiar script de verificacion al servidor
Write-Host "Subiendo script de diagnostico..." -ForegroundColor Yellow
scp "$PSScriptRoot\$scriptName" "root@${server}:${remotePath}/$scriptName"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Script subido correctamente" -ForegroundColor Green
} else {
    Write-Host "Error al subir script" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Ejecutar el script en el servidor
Write-Host "Ejecutando diagnostico en produccion..." -ForegroundColor Yellow
ssh root@$server "cd $remotePath; cp .env.production .env; node $scriptName"

Write-Host ""
Write-Host "Diagnostico completado" -ForegroundColor Green

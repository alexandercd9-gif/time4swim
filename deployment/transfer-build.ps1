# ============================================================================
# SCRIPT DE TRANSFERENCIA DE BUILD A SERVIDOR
# ============================================================================
# Este script transfiere el build local al servidor de producción
# ============================================================================

$SERVER = "root@159.65.98.102"
$REMOTE_DIR = "~/time4swim"

Write-Host "==================================================" -ForegroundColor White
Write-Host "TRANSFERIENDO BUILD A SERVIDOR" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor White
Write-Host ""

# Cambiar al directorio raíz del proyecto
Set-Location "C:\MAMP\htdocs\time4swim"

# Verificar que exista el build
if (-not (Test-Path ".\.next")) {
    Write-Host "ERROR: No existe la carpeta .next" -ForegroundColor Red
    Write-Host "Ejecuta primero: npm run build" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path ".\node_modules")) {
    Write-Host "ERROR: No existe la carpeta node_modules" -ForegroundColor Red
    exit 1
}

Write-Host "Build verificado localmente" -ForegroundColor Green
Write-Host ""

# Transferir archivos usando scp recursivo
Write-Host "Transfiriendo archivos al servidor..." -ForegroundColor Yellow
Write-Host "(Esto puede tardar varios minutos)" -ForegroundColor Gray
Write-Host ""

Write-Host "Transfiriendo .next..." -ForegroundColor Gray
scp -r .\.next ${SERVER}:${REMOTE_DIR}/

Write-Host "Transfiriendo node_modules..." -ForegroundColor Gray
scp -r .\node_modules ${SERVER}:${REMOTE_DIR}/

Write-Host "Transfiriendo prisma..." -ForegroundColor Gray
scp -r .\prisma ${SERVER}:${REMOTE_DIR}/

Write-Host "Transfiriendo archivos de configuración..." -ForegroundColor Gray
scp .\package.json ${SERVER}:${REMOTE_DIR}/
scp .\package-lock.json ${SERVER}:${REMOTE_DIR}/
scp .\next.config.ts ${SERVER}:${REMOTE_DIR}/
scp .\tsconfig.json ${SERVER}:${REMOTE_DIR}/

Write-Host ""
Write-Host "Archivos transferidos" -ForegroundColor Green
Write-Host ""

Write-Host "==================================================" -ForegroundColor White
Write-Host "TRANSFERENCIA COMPLETADA" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor White
Write-Host ""
Write-Host "Siguiente paso: Ejecutar migraciones y arrancar la aplicación" -ForegroundColor Cyan
Write-Host ""

# =============================================================================
# SCRIPT DE DESPLIEGUE DESDE WINDOWS - TIME4SWIM
# =============================================================================
# Este script se ejecuta desde tu PC Windows y actualiza el servidor
# Uso: .\deployment\deploy.ps1
# =============================================================================

$SERVER = "root@159.65.98.102"
$APP_NAME = "time4swim"

Write-Host "=================================================="  -ForegroundColor Cyan
Write-Host "🚀 DESPLEGANDO TIME4SWIM A PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "=================================================="  -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Debes ejecutar este script desde el directorio raíz del proyecto" -ForegroundColor Red
    exit 1
}

# =============================================================================
# PASO 1: VERIFICAR QUE TODO ESTÉ COMMITEADO
# =============================================================================
Write-Host "[1/4] Verificando estado de Git..." -ForegroundColor Yellow

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Tienes cambios sin commitear:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Gray
    Write-Host ""
    $response = Read-Host "¿Quieres hacer commit ahora? (s/n)"
    
    if ($response -eq "s") {
        $message = Read-Host "Mensaje del commit"
        git add .
        git commit -m $message
        Write-Host "✓ Commit realizado" -ForegroundColor Green
    } else {
        Write-Host "❌ Despliegue cancelado. Commitea tus cambios primero." -ForegroundColor Red
        exit 1
    }
}

# =============================================================================
# PASO 2: PUSH A GITHUB
# =============================================================================
Write-Host ""
Write-Host "[2/4] Enviando cambios a GitHub..." -ForegroundColor Yellow

try {
    git push origin master
    Write-Host "✓ Cambios enviados a GitHub" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al hacer push. Verifica tu conexión." -ForegroundColor Red
    exit 1
}

# =============================================================================
# PASO 3: VERIFICAR CONEXIÓN SSH
# =============================================================================
Write-Host ""
Write-Host "[3/4] Verificando conexión con servidor..." -ForegroundColor Yellow

$sshTest = ssh -o BatchMode=yes -o ConnectTimeout=5 $SERVER "echo 'OK'" 2>&1

if ($sshTest -ne "OK") {
    Write-Host "❌ No se puede conectar al servidor via SSH" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solución:" -ForegroundColor Yellow
    Write-Host "1. Asegúrate de tener configurada tu clave SSH" -ForegroundColor Gray
    Write-Host "2. O usa PuTTY y ejecuta manualmente:" -ForegroundColor Gray
    Write-Host "   cd /var/www/$APP_NAME && ./deployment/update.sh" -ForegroundColor Cyan
    exit 1
}

Write-Host "✓ Conexión establecida" -ForegroundColor Green

# =============================================================================
# PASO 4: EJECUTAR ACTUALIZACIÓN EN SERVIDOR
# =============================================================================
Write-Host ""
Write-Host "[4/4] Actualizando aplicación en servidor..." -ForegroundColor Yellow
Write-Host ""

ssh $SERVER "cd /var/www/$APP_NAME && bash deployment/update.sh"

# =============================================================================
# FINALIZACIÓN
# =============================================================================
Write-Host ""
Write-Host "=================================================="  -ForegroundColor Green
Write-Host "✅ ¡DESPLIEGUE COMPLETADO!" -ForegroundColor Green
Write-Host "=================================================="  -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Tu aplicación está actualizada en producción" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Comandos útiles:" -ForegroundColor Yellow
Write-Host "   Ver logs:    ssh $SERVER 'pm2 logs $APP_NAME'" -ForegroundColor Gray
Write-Host "   Ver estado:  ssh $SERVER 'pm2 status'" -ForegroundColor Gray
Write-Host ""

# Script de Deploy para Time4Swim
# Ejecutar: .\deploy.ps1
# NOTA: Necesitas PuTTY instalado (plink.exe y pscp.exe)

Write-Host "Iniciando deploy a Digital Ocean..." -ForegroundColor Cyan

# Configuracion del servidor
$SERVER_USER = "root"
$SERVER_IP = "137.184.126.212"
$SERVER_PATH = "/root/app"
$SERVER = "${SERVER_USER}@${SERVER_IP}"

# 1. Build local (en tu PC con RAM suficiente)
Write-Host ""
Write-Host "Step 1/4: Building proyecto..." -ForegroundColor Yellow

# Usar .env.production para el build
$env:NEXT_PUBLIC_APP_URL = "https://time4swim.com"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en build. Abortando deploy." -ForegroundColor Red
    exit 1
}

Write-Host "Build completado exitosamente" -ForegroundColor Green

# 2. Crear archivo .tar.gz con solo lo necesario
Write-Host ""
Write-Host "Step 2/4: Comprimiendo archivos..." -ForegroundColor Yellow

# Crear lista de archivos a incluir
$filesToDeploy = @(
    ".next",
    "node_modules",
    "public",
    "package.json",
    "package-lock.json",
    "prisma",
    "next.config.ts",
    ".env.production"
)

# Comprimir (requiere tar en Windows 10+)
tar -czf deploy.tar.gz $filesToDeploy

Write-Host "Archivos comprimidos" -ForegroundColor Green

# 3. Subir a Digital Ocean via PSCP (PuTTY)
Write-Host ""
Write-Host "Step 3/4: Subiendo a servidor..." -ForegroundColor Yellow
Write-Host "Se te pedira la contrasena del servidor" -ForegroundColor Yellow

pscp deploy.tar.gz ${SERVER}:${SERVER_PATH}/

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir archivos." -ForegroundColor Red
    Write-Host "Verifica que PuTTY este instalado (pscp.exe debe estar en PATH)" -ForegroundColor Red
    exit 1
}

Write-Host "Archivos subidos" -ForegroundColor Green

# 4. Descomprimir y reiniciar en servidor
Write-Host ""
Write-Host "Step 4/4: Desplegando en servidor..." -ForegroundColor Yellow
Write-Host "Se te pedira la contrasena nuevamente" -ForegroundColor Yellow

# Ejecutar comandos directamente uno por uno
Write-Host "Descomprimiendo archivos..." -ForegroundColor Cyan
plink $SERVER "cd $SERVER_PATH; tar -xzf deploy.tar.gz; rm deploy.tar.gz"

Write-Host "Configurando variables de entorno..." -ForegroundColor Cyan
plink $SERVER "cd $SERVER_PATH; cp .env.production .env"

Write-Host "Generando Prisma Client..." -ForegroundColor Cyan
plink $SERVER "cd $SERVER_PATH; export PATH=/root/.nvm/versions/node/v22.21.0/bin:$PATH; npx prisma generate"

Write-Host "Arreglando permisos de archivos..." -ForegroundColor Cyan
plink $SERVER "cd $SERVER_PATH; chmod +x node_modules/.bin/*"

Write-Host "Reiniciando aplicacion..." -ForegroundColor Cyan
plink $SERVER "export PATH=/root/.nvm/versions/node/v22.21.0/bin:$PATH; pm2 restart time4swim"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Deploy completado exitosamente!" -ForegroundColor Green
    Write-Host "Tu app esta corriendo en produccion" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Error al desplegar. Revisa los logs del servidor." -ForegroundColor Red
}

# Limpiar archivos temporales
Remove-Item deploy.tar.gz -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Para ver logs: plink $SERVER pm2 logs time4swim" -ForegroundColor Gray

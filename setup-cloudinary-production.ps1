# Script para configurar Cloudinary en producción
# Uso: .\setup-cloudinary-production.ps1

Write-Host "=== Configuración de Cloudinary en Producción ===" -ForegroundColor Cyan
Write-Host ""

# Solicitar credenciales
Write-Host "Ingresa tus credenciales de Cloudinary:" -ForegroundColor Yellow
Write-Host "(Obtenlas desde: https://console.cloudinary.com/)" -ForegroundColor Gray
Write-Host ""

$cloudName = Read-Host "Cloud Name"
$apiKey = Read-Host "API Key"
$apiSecretInput = Read-Host "API Secret" -AsSecureString
$apiSecret = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiSecretInput))

Write-Host ""
Write-Host "Configurando variables de entorno en el servidor..." -ForegroundColor Yellow

# Crear comando para actualizar .env.production
$envContent = @"
CLOUDINARY_CLOUD_NAME=$cloudName
CLOUDINARY_API_KEY=$apiKey
CLOUDINARY_API_SECRET=$apiSecret
CLOUDINARY_UPLOAD_PRESET=time4swim_media
"@

# Guardar temporalmente en archivo local
$envContent | Out-File -FilePath "cloudinary.env.tmp" -Encoding UTF8

Write-Host "Subiendo configuración al servidor..." -ForegroundColor Yellow

# Subir archivo temporal
pscp -batch cloudinary.env.tmp root@137.184.126.212:/root/time4swim/cloudinary.env.tmp

# Agregar al .env.production y limpiar
plink root@137.184.126.212 "cd /root/time4swim && cat cloudinary.env.tmp >> .env.production && rm cloudinary.env.tmp"

# Limpiar archivo local
Remove-Item "cloudinary.env.tmp" -ErrorAction SilentlyContinue

Write-Host "✓ Variables de entorno configuradas" -ForegroundColor Green

# Reiniciar aplicación
Write-Host ""
Write-Host "Reiniciando aplicación..." -ForegroundColor Yellow
plink root@137.184.126.212 "pm2 restart time4swim"

Write-Host ""
Write-Host "✓ Configuración completada exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Para verificar la configuración:" -ForegroundColor Cyan
Write-Host "  plink root@137.184.126.212 `"grep CLOUDINARY /root/time4swim/.env.production`"" -ForegroundColor Gray
Write-Host ""
Write-Host "Para ver los logs:" -ForegroundColor Cyan
Write-Host "  plink root@137.184.126.212 `"pm2 logs time4swim`"" -ForegroundColor Gray

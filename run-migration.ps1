# Script para ejecutar migraciones SQL en MAMP
# Ejecutar con: .\run-migration.ps1

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Ejecutando Migraciones SQL - Media Gallery" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Leer el archivo SQL
$sql1 = Get-Content "add-media-gallery-addon.sql" -Raw
$sql2 = Get-Content "add-media-gallery-is-free.sql" -Raw

Write-Host "Archivos SQL cargados:" -ForegroundColor Green
Write-Host "  - add-media-gallery-addon.sql" -ForegroundColor Gray
Write-Host "  - add-media-gallery-is-free.sql" -ForegroundColor Gray
Write-Host ""

Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Abre phpMyAdmin en: http://localhost/phpmyadmin" -ForegroundColor White
Write-Host "2. Selecciona la base de datos 'time4swim'" -ForegroundColor White
Write-Host "3. Ve a la pestaña 'SQL'" -ForegroundColor White
Write-Host "4. Ejecuta estas queries:" -ForegroundColor White
Write-Host ""

Write-Host "==== QUERY 1: Columnas principales ====" -ForegroundColor Magenta
Write-Host @"
ALTER TABLE Subscription 
ADD COLUMN mediaGalleryAddon BOOLEAN DEFAULT FALSE,
ADD COLUMN addonsAmount DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE Record
ADD COLUMN mediaUrls JSON,
ADD COLUMN mediaCount INT DEFAULT 0,
ADD COLUMN hasMedia BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_record_has_media ON Record(hasMedia);
CREATE INDEX idx_subscription_media_addon ON Subscription(mediaGalleryAddon);
"@ -ForegroundColor Gray

Write-Host ""
Write-Host "==== QUERY 2: Campo adicional ====" -ForegroundColor Magenta
Write-Host @"
ALTER TABLE Subscription 
ADD COLUMN mediaGalleryIsFree BOOLEAN NOT NULL DEFAULT false AFTER mediaGalleryAddon;

CREATE INDEX idx_subscription_free_addon ON Subscription(mediaGalleryIsFree);
"@ -ForegroundColor Gray

Write-Host ""
Write-Host "==== QUERY 3: Verificar ====" -ForegroundColor Magenta
Write-Host @"
DESCRIBE Subscription;
DESCRIBE Record;
"@ -ForegroundColor Gray

Write-Host ""
Write-Host "Después de ejecutar, presiona cualquier tecla para regenerar Prisma Client..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Regenerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host ""
Write-Host "¡Migraciones completadas!" -ForegroundColor Green
Write-Host "Ahora puedes reiniciar el servidor con: npm run dev" -ForegroundColor Cyan

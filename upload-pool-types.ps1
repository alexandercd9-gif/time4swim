# Script para ejecutar el seed de pool types en producción
# Ejecutar desde tu PC Windows

Write-Host "🔄 Subiendo script SQL al servidor..." -ForegroundColor Cyan
& "C:\Program Files\PuTTY\pscp.exe" -pw "*Time4Swim" scripts/seed-pool-types.sql root@137.184.126.212:/root/seed-pool-types.sql

Write-Host "`n🗄️  Ejecutando script SQL en MySQL de producción..." -ForegroundColor Cyan
& "C:\Program Files\PuTTY\plink.exe" -batch -pw "*Time4Swim" root@137.184.126.212 "mysql -u root -pt2m14sw2m time4swim < /root/seed-pool-types.sql"

Write-Host "`n✅ Pool types insertados en producción" -ForegroundColor Green
Write-Host "`n🔄 Reiniciando aplicación..." -ForegroundColor Cyan
& "C:\Program Files\PuTTY\plink.exe" -batch -pw "*Time4Swim" root@137.184.126.212 "cd /root/app && pm2 restart app"

Write-Host "`n✨ Listo! El dropdown de 'Tipo de Competencia' ahora debería mostrar las 3 opciones" -ForegroundColor Green
Write-Host "   - Piscina Corta 25m" -ForegroundColor Gray
Write-Host "   - Piscina Larga 50m" -ForegroundColor Gray
Write-Host "   - Aguas Abiertas" -ForegroundColor Gray

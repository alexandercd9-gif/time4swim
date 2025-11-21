# Script para aumentar timeouts en producción para uploads de videos
# Ejecutar en el servidor de producción

Write-Host "Configurando timeouts para uploads de videos grandes..." -ForegroundColor Cyan

# Comando para actualizar configuración de Nginx
$nginxConfig = @"
# Aumentar timeouts para uploads
client_max_body_size 150M;
client_body_timeout 300s;
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
proxy_read_timeout 300s;
"@

Write-Host "Actualizando configuración de Nginx..." -ForegroundColor Yellow

plink root@137.184.126.212 @"
# Backup de configuración actual
cp /etc/nginx/sites-available/time4swim /etc/nginx/sites-available/time4swim.backup

# Agregar timeouts al archivo de configuración
sed -i '/server {/a \    client_max_body_size 150M;\n    client_body_timeout 300s;\n    proxy_connect_timeout 300s;\n    proxy_send_timeout 300s;\n    proxy_read_timeout 300s;' /etc/nginx/sites-available/time4swim

# Verificar configuración
nginx -t

# Si está ok, recargar Nginx
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo '✅ Nginx configurado correctamente'
else
    echo '❌ Error en configuración de Nginx'
    # Restaurar backup
    cp /etc/nginx/sites-available/time4swim.backup /etc/nginx/sites-available/time4swim
fi
"@

Write-Host ""
Write-Host "✅ Configuración completada" -ForegroundColor Green
Write-Host ""
Write-Host "Los timeouts se han aumentado a:" -ForegroundColor Cyan
Write-Host "  • Tamaño máximo de archivo: 150MB" -ForegroundColor Gray
Write-Host "  • Timeout de subida: 5 minutos (300s)" -ForegroundColor Gray
Write-Host ""
Write-Host "Ahora despliega la aplicación actualizada:" -ForegroundColor Yellow
Write-Host "  .\deploy-new.ps1" -ForegroundColor Gray

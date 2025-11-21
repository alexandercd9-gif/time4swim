#!/bin/bash
# Script para configurar límites de Nginx para uploads de videos

echo "📹 Configurando límites de Nginx para videos grandes..."

# Backup de configuración actual
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Agregar límites al archivo de configuración principal
sudo bash -c 'cat > /etc/nginx/conf.d/upload_limits.conf << EOF
# Límites para uploads de videos
client_max_body_size 150M;
client_body_buffer_size 150M;
client_header_timeout 300s;
client_body_timeout 300s;
send_timeout 300s;
proxy_read_timeout 300s;
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
EOF'

echo "✅ Configuración creada en /etc/nginx/conf.d/upload_limits.conf"

# Verificar configuración
echo "🔍 Verificando configuración de Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración válida"
    echo "🔄 Reiniciando Nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reiniciado correctamente"
    echo ""
    echo "🎉 ¡Configuración completada!"
    echo "Ahora puedes subir videos de hasta 150 MB"
else
    echo "❌ Error en la configuración de Nginx"
    echo "Restaurando backup..."
    sudo cp /etc/nginx/nginx.conf.backup /etc/nginx/nginx.conf
fi

# Script para verificar la base de datos de producción
# Ejecutar en el servidor de producción

echo "🚀 Verificando base de datos de producción..."
echo ""

# Navegar al directorio de la aplicación
cd /var/www/time4swim

# Ejecutar el script de verificación
node check-production-db.js

echo ""
echo "✅ Verificación completada"

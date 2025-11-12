#!/bin/bash

# =============================================================================
# SCRIPT DE ACTUALIZACIÓN - TIME4SWIM
# =============================================================================
# Este script actualiza la aplicación con los últimos cambios
# Úsalo cada vez que hagas cambios y quieras desplegar
# =============================================================================

set -e

APP_DIR="/var/www/time4swim"
BACKUP_DIR="/root/backups/deployments"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=================================================="
echo -e "${BLUE}🔄 ACTUALIZANDO TIME4SWIM${NC}"
echo "=================================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Error: No se encuentra el directorio $APP_DIR"
    exit 1
fi

cd $APP_DIR

# =============================================================================
# PASO 1: BACKUP DE LA BASE DE DATOS
# =============================================================================
echo -e "${YELLOW}[1/7]${NC} Creando backup de base de datos..."
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Ejecutar backup
/root/backup-db.sh

echo -e "${GREEN}✓${NC} Backup creado"

# =============================================================================
# PASO 2: DETENER LA APLICACIÓN
# =============================================================================
echo ""
echo -e "${YELLOW}[2/7]${NC} Deteniendo aplicación..."
pm2 stop time4swim

# =============================================================================
# PASO 3: OBTENER ÚLTIMOS CAMBIOS
# =============================================================================
echo ""
echo -e "${YELLOW}[3/7]${NC} Obteniendo últimos cambios del repositorio..."

# Guardar cambios locales si los hay
git stash

# Obtener cambios
git pull origin master

echo -e "${GREEN}✓${NC} Código actualizado"

# =============================================================================
# PASO 4: INSTALAR/ACTUALIZAR DEPENDENCIAS
# =============================================================================
echo ""
echo -e "${YELLOW}[4/7]${NC} Actualizando dependencias..."
npm install --production=false

# =============================================================================
# PASO 5: EJECUTAR MIGRACIONES
# =============================================================================
echo ""
echo -e "${YELLOW}[5/7]${NC} Ejecutando migraciones de base de datos..."
npx prisma generate
npx prisma migrate deploy

echo -e "${GREEN}✓${NC} Migraciones aplicadas"

# =============================================================================
# PASO 6: RECONSTRUIR APLICACIÓN
# =============================================================================
echo ""
echo -e "${YELLOW}[6/7]${NC} Reconstruyendo aplicación..."
npm run build

echo -e "${GREEN}✓${NC} Build completado"

# =============================================================================
# PASO 7: REINICIAR APLICACIÓN
# =============================================================================
echo ""
echo -e "${YELLOW}[7/7]${NC} Reiniciando aplicación..."
pm2 restart time4swim

# Esperar un momento
sleep 3

# Verificar estado
pm2 status time4swim

echo ""
echo "=================================================="
echo -e "${GREEN}✅ ¡ACTUALIZACIÓN COMPLETADA!${NC}"
echo "=================================================="
echo ""
echo "📊 Estado de la aplicación:"
pm2 info time4swim --no-daemon | grep -E "status|uptime|memory|cpu"
echo ""
echo "📝 Comandos útiles:"
echo "   Ver logs en tiempo real:  pm2 logs time4swim"
echo "   Ver estado:               pm2 status"
echo "   Ver más detalles:         pm2 info time4swim"
echo ""
echo "🌐 Tu sitio está disponible en: https://tudominio.com"
echo ""

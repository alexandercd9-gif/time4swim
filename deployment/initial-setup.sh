#!/bin/bash

# =============================================================================
# SCRIPT DE INSTALACIÓN INICIAL - TIME4SWIM
# =============================================================================
# Este script instala y configura todo lo necesario en el servidor
# Solo se ejecuta UNA VEZ durante la configuración inicial
# =============================================================================

set -e  # Detener si hay algún error

echo "=================================================="
echo "🏊 INSTALANDO TIME4SWIM EN PRODUCCIÓN"
echo "=================================================="
echo ""

# Variables de configuración
DOMAIN="time4swim.com"  # 👈 CAMBIAR POR TU DOMINIO
APP_NAME="time4swim"
APP_DIR="/var/www/$APP_NAME"
GITHUB_REPO="https://github.com/alexandercd9-gif/time4swim.git"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Configuración:${NC}"
echo "   Dominio: $DOMAIN"
echo "   Directorio: $APP_DIR"
echo "   Repositorio: $GITHUB_REPO"
echo ""
read -p "¿Es correcta esta información? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Instalación cancelada. Edita el script y cambia las variables."
    exit 1
fi

# =============================================================================
# PASO 1: ACTUALIZAR SISTEMA
# =============================================================================
echo ""
echo -e "${GREEN}[1/10]${NC} Actualizando sistema..."
apt update && apt upgrade -y

# =============================================================================
# PASO 2: INSTALAR NODE.JS 20
# =============================================================================
echo ""
echo -e "${GREEN}[2/10]${NC} Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verificar instalación
node -v
npm -v

# =============================================================================
# PASO 3: INSTALAR MYSQL
# =============================================================================
echo ""
echo -e "${GREEN}[3/10]${NC} Instalando MySQL..."
apt install -y mysql-server

# Configurar MySQL
echo ""
echo -e "${YELLOW}🔐 Configurando MySQL...${NC}"
echo "Por favor, introduce una contraseña segura para MySQL:"
read -sp "Contraseña MySQL: " MYSQL_PASSWORD
echo ""

# Crear usuario y base de datos
mysql -e "CREATE DATABASE IF NOT EXISTS time4swim;"
mysql -e "CREATE USER IF NOT EXISTS 'time4swim'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';"
mysql -e "GRANT ALL PRIVILEGES ON time4swim.* TO 'time4swim'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

echo -e "${GREEN}✓${NC} MySQL configurado correctamente"

# =============================================================================
# PASO 4: INSTALAR NGINX
# =============================================================================
echo ""
echo -e "${GREEN}[4/10]${NC} Instalando Nginx..."
apt install -y nginx

# =============================================================================
# PASO 5: INSTALAR CERTBOT (SSL)
# =============================================================================
echo ""
echo -e "${GREEN}[5/10]${NC} Instalando Certbot para SSL..."
apt install -y certbot python3-certbot-nginx

# =============================================================================
# PASO 6: INSTALAR PM2
# =============================================================================
echo ""
echo -e "${GREEN}[6/10]${NC} Instalando PM2..."
npm install -g pm2

# Configurar PM2 para arrancar al inicio
pm2 startup systemd -u root --hp /root
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# =============================================================================
# PASO 7: CLONAR REPOSITORIO
# =============================================================================
echo ""
echo -e "${GREEN}[7/10]${NC} Clonando repositorio..."
mkdir -p /var/www
cd /var/www

if [ -d "$APP_DIR" ]; then
    echo "⚠️  El directorio ya existe. Haciendo backup..."
    mv "$APP_DIR" "${APP_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
fi

git clone $GITHUB_REPO $APP_NAME
cd $APP_DIR

# =============================================================================
# PASO 8: CONFIGURAR VARIABLES DE ENTORNO
# =============================================================================
echo ""
echo -e "${GREEN}[8/10]${NC} Configurando variables de entorno..."

# Generar secret para NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)

cat > .env.production << EOF
# Base de datos
DATABASE_URL="mysql://time4swim:${MYSQL_PASSWORD}@localhost:3306/time4swim"

# NextAuth
NEXTAUTH_URL="https://${DOMAIN}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# Ambiente
NODE_ENV="production"

# Pusher (si los tienes configurados)
NEXT_PUBLIC_PUSHER_APP_KEY="tu_pusher_key"
PUSHER_APP_ID="tu_pusher_app_id"
PUSHER_SECRET="tu_pusher_secret"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
EOF

echo -e "${GREEN}✓${NC} Archivo .env.production creado"

# =============================================================================
# PASO 9: INSTALAR DEPENDENCIAS Y BUILD
# =============================================================================
echo ""
echo -e "${GREEN}[9/10]${NC} Instalando dependencias..."
npm install --production=false

echo ""
echo "🔨 Generando cliente Prisma..."
npx prisma generate

echo ""
echo "🗄️  Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

echo ""
echo "🏗️  Construyendo aplicación..."
npm run build

# =============================================================================
# PASO 10: CONFIGURAR NGINX
# =============================================================================
echo ""
echo -e "${GREEN}[10/10]${NC} Configurando Nginx..."

cat > /etc/nginx/sites-available/$APP_NAME << 'EOF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optimizaciones
    client_max_body_size 10M;
}
EOF

# Reemplazar dominio
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/$APP_NAME

# Activar sitio
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Probar configuración
nginx -t

# Recargar Nginx
systemctl reload nginx

# =============================================================================
# CONFIGURAR SSL CON CERTBOT
# =============================================================================
echo ""
echo -e "${YELLOW}🔒 Configurando SSL...${NC}"
echo "Esto solicitará un certificado SSL gratuito de Let's Encrypt"
echo ""

# Email configurado para el certificado SSL
SSL_EMAIL="acasaverde@compuimpact.pe"
echo "📧 Usando email: $SSL_EMAIL"

certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL --redirect

# =============================================================================
# INICIAR APLICACIÓN CON PM2
# =============================================================================
echo ""
echo "🚀 Iniciando aplicación..."

cd $APP_DIR

# Crear ecosistema PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'time4swim',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/time4swim',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/time4swim-error.log',
    out_file: '/var/log/pm2/time4swim-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}
EOF

# Crear directorio de logs
mkdir -p /var/log/pm2

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save

# =============================================================================
# CONFIGURAR BACKUP AUTOMÁTICO
# =============================================================================
echo ""
echo "💾 Configurando backup automático de base de datos..."

mkdir -p /root/backups

cat > /root/backup-db.sh << EOF
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\$BACKUP_DIR/time4swim_\$DATE.sql"

# Crear backup
mysqldump -u time4swim -p'$MYSQL_PASSWORD' time4swim > \$BACKUP_FILE

# Comprimir
gzip \$BACKUP_FILE

# Mantener solo los últimos 7 días
find \$BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "✓ Backup completado: \$BACKUP_FILE.gz"
EOF

chmod +x /root/backup-db.sh

# Agregar a crontab (backup diario a las 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-db.sh >> /var/log/backup.log 2>&1") | crontab -

# =============================================================================
# RESUMEN FINAL
# =============================================================================
echo ""
echo "=================================================="
echo -e "${GREEN}✅ ¡INSTALACIÓN COMPLETADA!${NC}"
echo "=================================================="
echo ""
echo "📊 Información importante:"
echo "   🌐 URL: https://$DOMAIN"
echo "   📁 Directorio: $APP_DIR"
echo "   🗄️  Base de datos: time4swim"
echo "   👤 Usuario MySQL: time4swim"
echo "   🔐 Contraseña MySQL: [guardada en .env.production]"
echo ""
echo "📝 Comandos útiles:"
echo "   Ver logs:        pm2 logs time4swim"
echo "   Ver estado:      pm2 status"
echo "   Reiniciar:       pm2 restart time4swim"
echo "   Ver logs Nginx:  tail -f /var/log/nginx/error.log"
echo ""
echo "💾 Backup automático configurado:"
echo "   Ubicación: /root/backups/"
echo "   Frecuencia: Diario a las 2 AM"
echo "   Retención: 7 días"
echo ""
echo "🔄 Para actualizar la aplicación en el futuro:"
echo "   Usa el script: ./deployment/update.sh"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "1. Guarda la contraseña de MySQL en un lugar seguro"
echo "2. Configura las variables de Pusher si las usas"
echo "3. Verifica que tu dominio apunte a esta IP"
echo ""
echo "=================================================="

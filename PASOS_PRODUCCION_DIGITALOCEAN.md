# 🚀 Guía de Despliegue en DigitalOcean Ubuntu 24

Esta guía contiene todos los pasos necesarios para desplegar la aplicación Time4Swim en un servidor DigitalOcean con Ubuntu 24.

---

## 📋 Requisitos Previos

- Droplet de DigitalOcean con Ubuntu 24.04 LTS
- Dominio apuntando a la IP del servidor (opcional pero recomendado)
- Acceso SSH al servidor
- Base de datos MySQL lista para usar

---

## 1️⃣ Preparar el Servidor

### Conectar al servidor
```bash
ssh root@tu_ip_del_servidor
```

### Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### Instalar Node.js 20 (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Verificar instalación
```bash
node -v
npm -v
```

### Instalar PM2 (gestor de procesos)
```bash
sudo npm install -g pm2
```

### Instalar MySQL Server
```bash
sudo apt install -y mysql-server
```

### Configurar MySQL
```bash
sudo mysql_secure_installation
```

---

## 2️⃣ Configurar Base de Datos MySQL

### Acceder a MySQL
```bash
sudo mysql -u root -p
```

### Crear base de datos y usuario
```sql
CREATE DATABASE time4swim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'time4swim_user'@'localhost' IDENTIFIED BY 'tu_password_seguro_aqui';
GRANT ALL PRIVILEGES ON time4swim.* TO 'time4swim_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 3️⃣ Configurar Nginx

### Instalar Nginx
```bash
sudo apt install -y nginx
```

### Crear configuración del sitio
```bash
sudo nano /etc/nginx/sites-available/time4swim
```

### Pegar esta configuración:
```nginx
server {
    listen 80;
    server_name tu_dominio.com www.tu_dominio.com;

    # Aumentar tamaño máximo de archivos
    client_max_body_size 10M;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Activar el sitio y reiniciar Nginx
```bash
# Activar el sitio
sudo ln -s /etc/nginx/sites-available/time4swim /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar que Nginx esté corriendo
sudo systemctl status nginx
```

---

## 4️⃣ Subir Proyecto al Servidor

### Opción A - Usando Git (Recomendado)

```bash
# En el servidor
cd /var/www
sudo mkdir time4swim
sudo chown $USER:$USER time4swim
cd time4swim

# Clonar repositorio
git clone https://github.com/alexandercd9-gif/time4swim.git .

# O si es repositorio privado
git clone https://<token>@github.com/alexandercd9-gif/time4swim.git .
```

### Opción B - Usando SCP (desde tu PC Windows)

```powershell
# En tu PC - PowerShell
cd C:\MAMP\htdocs\time4swim

# Comprimir proyecto (excluyendo archivos innecesarios)
tar -czf time4swim.tar.gz --exclude=node_modules --exclude=.next --exclude=.git --exclude=.env.local .

# Subir al servidor
scp time4swim.tar.gz root@tu_ip:/var/www/time4swim/
```

```bash
# En el servidor
cd /var/www/time4swim
tar -xzf time4swim.tar.gz
rm time4swim.tar.gz
```

### Opción C - Subir proyecto ya compilado

```powershell
# En tu PC - Ya compilaste con: npm run build
# Incluir la carpeta .next en el tar
tar -czf time4swim-compiled.tar.gz --exclude=node_modules --exclude=.git --exclude=.env.local .

# Subir al servidor
scp time4swim-compiled.tar.gz root@tu_ip:/var/www/time4swim/
```

---

## 5️⃣ Configurar Variables de Entorno

```bash
cd /var/www/time4swim
nano .env.production
```

### Contenido del archivo .env.production:
```env
# Database
DATABASE_URL="mysql://time4swim_user:tu_password_seguro_aqui@localhost:3306/time4swim"

# Auth
JWT_SECRET="tu_jwt_secret_muy_largo_y_seguro_cambiar_en_produccion_12345678901234567890"
NEXTAUTH_SECRET="tu_nextauth_secret_diferente_del_anterior_9876543210987654321098765432"
NEXTAUTH_URL="https://tu_dominio.com"

# Google OAuth (si usas autenticación con Google)
GOOGLE_CLIENT_ID="tu_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu_client_secret"

# Node Environment
NODE_ENV="production"

# Puerto (opcional, por defecto 3000)
PORT=3000
```

**⚠️ IMPORTANTE:** 
- Usa contraseñas y secrets únicos y seguros
- NUNCA subas el archivo `.env.local` al servidor
- Guarda estos valores en un lugar seguro

---

## 6️⃣ Instalar Dependencias y Preparar Aplicación

```bash
cd /var/www/time4swim

# Instalar dependencias de producción
npm ci --only=production

# Instalar Prisma CLI como dependencia de desarrollo (temporal)
npm install -D prisma

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones de base de datos
npx prisma migrate deploy

# Si necesitas datos iniciales (seed)
# npx prisma db seed
```

### Si NO subiste el proyecto compilado:
```bash
# Compilar proyecto para producción
npm run build
```

---

## 7️⃣ Configurar PM2 (Gestor de Procesos)

### Crear archivo de configuración PM2
```bash
cd /var/www/time4swim
nano ecosystem.config.js
```

### Contenido del archivo ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'time4swim',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/time4swim',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    error_file: '/var/log/time4swim-error.log',
    out_file: '/var/log/time4swim-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
```

### Iniciar aplicación con PM2
```bash
# Iniciar aplicación
pm2 start ecosystem.config.js

# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs time4swim

# Ver logs con scroll
pm2 logs time4swim --lines 100

# Guardar configuración PM2
pm2 save

# Configurar PM2 para iniciar automáticamente al reiniciar servidor
pm2 startup
# ⚠️ IMPORTANTE: Ejecuta el comando que PM2 te sugiere (cópialo y pégalo)
```

---

## 8️⃣ Configurar SSL con Let's Encrypt (HTTPS)

### Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtener certificado SSL
```bash
sudo certbot --nginx -d tu_dominio.com -d www.tu_dominio.com
```

### Sigue las instrucciones de Certbot:
1. Ingresa tu email
2. Acepta los términos
3. Decide si compartir tu email con EFF
4. Certbot configurará automáticamente Nginx para HTTPS

### Verificar renovación automática
```bash
# Probar renovación
sudo certbot renew --dry-run

# El certificado se renovará automáticamente cada 90 días
```

---

## 9️⃣ Configurar Firewall (UFW)

```bash
# Permitir OpenSSH
sudo ufw allow OpenSSH

# Permitir Nginx (HTTP y HTTPS)
sudo ufw allow 'Nginx Full'

# Activar firewall
sudo ufw enable

# Verificar reglas
sudo ufw status
```

---

## 🔟 Crear Usuario Administrador Inicial

```bash
cd /var/www/time4swim

# Editar el script para crear admin
nano scripts/create-admin.ts

# Ejecutar script para crear admin
npx tsx scripts/create-admin.ts
```

---

## ✅ Verificación Final

### 1. Verificar que la aplicación está corriendo
```bash
pm2 status
```

### 2. Ver logs
```bash
pm2 logs time4swim
```

### 3. Verificar Nginx
```bash
sudo systemctl status nginx
```

### 4. Verificar MySQL
```bash
sudo systemctl status mysql
```

### 5. Probar la aplicación
- Visita: `https://tu_dominio.com`
- Verifica que cargue la página de login
- Prueba iniciar sesión

---

## 🛠️ Comandos Útiles de Mantenimiento

### PM2
```bash
# Ver estado de todas las apps
pm2 status

# Ver logs en tiempo real
pm2 logs time4swim

# Ver logs con más líneas
pm2 logs time4swim --lines 200

# Reiniciar aplicación
pm2 restart time4swim

# Detener aplicación
pm2 stop time4swim

# Reiniciar aplicación cuando cambie código
pm2 reload time4swim

# Ver información detallada
pm2 info time4swim

# Monitorear recursos (CPU, RAM)
pm2 monit
```

### Actualizar aplicación
```bash
cd /var/www/time4swim

# Si usas Git
git pull origin master

# Instalar nuevas dependencias
npm ci --only=production

# Regenerar Prisma Client
npx prisma generate

# Ejecutar nuevas migraciones
npx prisma migrate deploy

# Recompilar (si no subiste compilado)
npm run build

# Reiniciar aplicación
pm2 restart time4swim
```

### Base de datos
```bash
# Crear backup
mysqldump -u time4swim_user -p time4swim > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
mysql -u time4swim_user -p time4swim < backup_20241108_153000.sql

# Ver bases de datos
mysql -u time4swim_user -p -e "SHOW DATABASES;"

# Ver tablas
mysql -u time4swim_user -p time4swim -e "SHOW TABLES;"
```

### Nginx
```bash
# Reiniciar Nginx
sudo systemctl restart nginx

# Recargar configuración sin cortar conexiones
sudo systemctl reload nginx

# Ver logs de error
sudo tail -f /var/log/nginx/error.log

# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Probar configuración
sudo nginx -t
```

### Sistema
```bash
# Ver uso de disco
df -h

# Ver uso de RAM
free -h

# Ver procesos que más consumen
top

# Ver espacio usado por directorios
du -sh /var/www/time4swim/*

# Limpiar logs antiguos
sudo journalctl --vacuum-time=7d
```

---

## 🔒 Seguridad Adicional

### Cambiar puerto SSH
```bash
sudo nano /etc/ssh/sshd_config
# Cambia: Port 22 → Port 2222 (o el que prefieras)
sudo systemctl restart sshd
# No olvides agregar el nuevo puerto al firewall
sudo ufw allow 2222/tcp
```

### Deshabilitar acceso root por SSH
```bash
sudo nano /etc/ssh/sshd_config
# Cambia: PermitRootLogin yes → PermitRootLogin no
sudo systemctl restart sshd
```

### Configurar fail2ban
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📊 Monitoreo

### Configurar alertas de PM2
```bash
# Instalar PM2 Plus (opcional, servicio de pago con free tier)
pm2 link <secret> <public>
```

### Ver métricas del sistema
```bash
# Instalar htop
sudo apt install -y htop

# Ver métricas
htop
```

---

## 🐛 Troubleshooting

### La aplicación no inicia
```bash
# Ver logs detallados
pm2 logs time4swim --err
pm2 logs time4swim --lines 500

# Verificar variables de entorno
cat .env.production

# Verificar Prisma Client
npx prisma validate
npx prisma generate
```

### Error de conexión a base de datos
```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Verificar conexión
mysql -u time4swim_user -p time4swim -e "SELECT 1;"

# Ver logs de MySQL
sudo tail -f /var/log/mysql/error.log
```

### Error 502 Bad Gateway
```bash
# Verificar que PM2 esté corriendo
pm2 status

# Verificar que Nginx esté corriendo
sudo systemctl status nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### La aplicación está lenta
```bash
# Ver uso de recursos
pm2 monit

# Ver procesos que más consumen
top

# Verificar espacio en disco
df -h

# Limpiar caché de Next.js
rm -rf /var/www/time4swim/.next/cache
pm2 restart time4swim
```

---

## 📝 Backup Automático

### Crear script de backup
```bash
sudo nano /usr/local/bin/backup-time4swim.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/time4swim"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de base de datos
mysqldump -u time4swim_user -p'tu_password' time4swim > $BACKUP_DIR/db_$DATE.sql

# Backup de archivos subidos (si hay)
# tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/time4swim/public/uploads

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completado: $DATE"
```

```bash
# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/backup-time4swim.sh

# Configurar cron para backup diario a las 3 AM
sudo crontab -e
# Agregar línea:
0 3 * * * /usr/local/bin/backup-time4swim.sh >> /var/log/backup-time4swim.log 2>&1
```

---

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Documentación de Nginx](https://nginx.org/en/docs/)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)

---

## 🎉 ¡Listo!

Tu aplicación Time4Swim ahora está corriendo en producción en DigitalOcean.

**URLs importantes:**
- Aplicación: `https://tu_dominio.com`
- Panel Admin: `https://tu_dominio.com/admin/dashboard`
- API: `https://tu_dominio.com/api/*`

**Siguientes pasos recomendados:**
1. Configurar backups automáticos
2. Configurar monitoreo con PM2 Plus o similar
3. Implementar CI/CD con GitHub Actions
4. Configurar CDN para archivos estáticos (Cloudflare)
5. Implementar rate limiting en Nginx
6. Configurar logs estructurados

---

**Fecha de creación:** 8 de noviembre de 2025  
**Versión:** 1.0  
**Autor:** Time4Swim Team

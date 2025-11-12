# =============================================================================
# COMANDOS RÁPIDOS - TIME4SWIM
# =============================================================================
# Copia y pega estos comandos según necesites
# =============================================================================

## CONFIGURACIÓN INICIAL (Solo una vez)
# ============================================

# 1. Clonar y ejecutar instalación
cd /tmp
git clone https://github.com/alexandercd9-gif/time4swim.git
cd time4swim/deployment
chmod +x initial-setup.sh
./initial-setup.sh


## ACTUALIZACIONES
# ============================================

# Desde el servidor (PuTTY):
cd /var/www/time4swim && bash deployment/update.sh

# Desde Windows (PowerShell):
.\deployment\deploy.ps1


## GESTIÓN PM2
# ============================================

pm2 status                          # Ver estado
pm2 logs time4swim                  # Ver logs
pm2 logs time4swim --lines 100      # Ver últimas 100 líneas
pm2 restart time4swim               # Reiniciar app
pm2 stop time4swim                  # Detener app
pm2 start time4swim                 # Iniciar app
pm2 info time4swim                  # Info detallada
pm2 monit                           # Monitor de recursos


## BASE DE DATOS
# ============================================

# Conectar a MySQL
mysql -u time4swim -p time4swim

# Backup manual
/root/backup-db.sh

# Ver backups
ls -lh /root/backups/

# Restaurar backup (cambia FECHA por el nombre del archivo)
gunzip -c /root/backups/time4swim_FECHA.sql.gz | mysql -u time4swim -p time4swim


## NGINX
# ============================================

systemctl status nginx              # Ver estado
systemctl restart nginx             # Reiniciar
nginx -t                            # Probar configuración
tail -f /var/log/nginx/error.log    # Ver errores
tail -f /var/log/nginx/access.log   # Ver accesos


## SSL/CERTBOT
# ============================================

certbot certificates                # Ver certificados
certbot renew                       # Renovar (automático)
certbot renew --dry-run             # Probar renovación


## SISTEMA
# ============================================

df -h                               # Espacio en disco
free -h                             # Memoria RAM
htop                                # Monitor de recursos
ufw status                          # Estado del firewall
systemctl status mysql              # Estado MySQL


## LOGS IMPORTANTES
# ============================================

# Logs de la aplicación
tail -f /var/log/pm2/time4swim-error.log
tail -f /var/log/pm2/time4swim-out.log

# Logs de Nginx
tail -f /var/log/nginx/error.log

# Logs del sistema
tail -f /var/log/syslog

# Logs de backups
tail -f /var/log/backup.log


## TROUBLESHOOTING
# ============================================

# Si la app no carga:
pm2 restart time4swim
pm2 logs time4swim --err

# Si hay error 502:
pm2 restart time4swim
systemctl restart nginx

# Si hay error de DB:
systemctl status mysql
mysql -u time4swim -p time4swim

# Ver qué está usando el puerto 3000:
lsof -i :3000
netstat -tulpn | grep 3000


## MANTENIMIENTO
# ============================================

# Limpiar logs antiguos de PM2
pm2 flush

# Limpiar caché de npm
cd /var/www/time4swim
rm -rf node_modules package-lock.json
npm install

# Actualizar sistema
apt update && apt upgrade -y

# Limpiar archivos temporales
apt autoremove -y
apt autoclean


## INFORMACIÓN DEL SERVIDOR
# ============================================

# Ver versión de Node
node -v

# Ver versión de npm
npm -v

# Ver versión de PM2
pm2 -v

# Ver IP pública
curl ifconfig.me

# Ver información del sistema
uname -a
lsb_release -a

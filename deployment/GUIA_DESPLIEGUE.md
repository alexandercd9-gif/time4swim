# =============================================================================
# GUÍA DE DESPLIEGUE - TIME4SWIM EN DIGITALOCEAN
# =============================================================================
# Autor: GitHub Copilot
# Fecha: Noviembre 2025
# =============================================================================

## 📋 REQUISITOS PREVIOS

Antes de comenzar, asegúrate de tener:

- ✅ Droplet de DigitalOcean con Ubuntu 22.04
- ✅ IP del servidor: 159.65.98.102
- ✅ Dominio apuntando a la IP (registros A en tu proveedor DNS)
- ✅ PuTTY instalado en tu PC Windows
- ✅ Acceso root al servidor

---

## 🚀 PARTE 1: CONFIGURACIÓN INICIAL (Solo una vez)

### Paso 1: Configurar tu Dominio

1. Ve al panel de tu proveedor de dominio (GoDaddy, Namecheap, etc.)
2. Agrega estos registros DNS:

```
Tipo: A
Nombre: @
Valor: 159.65.98.102
TTL: 3600

Tipo: A  
Nombre: www
Valor: 159.65.98.102
TTL: 3600
```

3. Espera 5-10 minutos para que se propaguen los cambios

### Paso 2: Conectarte con PuTTY

1. Abre PuTTY
2. En "Host Name" pon: `159.65.98.102`
3. En "Port" pon: `22`
4. Click en "Open"
5. Usuario: `root`
6. Contraseña: [la que configuraste en DigitalOcean]

### Paso 3: Preparar el Script de Instalación

**IMPORTANTE:** Antes de ejecutar, edita el script:

1. En tu PC, abre el archivo: `deployment/initial-setup.sh`
2. En la línea 17, cambia:
   ```bash
   DOMAIN="tudominio.com"  # 👈 PON TU DOMINIO AQUÍ
   ```
   Por ejemplo:
   ```bash
   DOMAIN="time4swim.com"
   ```
3. En la línea 243, cambia:
   ```bash
   --email tu_email@ejemplo.com
   ```
   Por tu email real

4. Guarda el archivo

### Paso 4: Subir y Ejecutar el Script

**Opción A - Mediante Git (Recomendado):**

En PuTTY, ejecuta:

```bash
# Clonar el repositorio temporalmente
cd /tmp
git clone https://github.com/alexandercd9-gif/time4swim.git
cd time4swim/deployment

# Dar permisos de ejecución
chmod +x initial-setup.sh

# Ejecutar instalación
./initial-setup.sh
```

**Opción B - Copiar y pegar:**

1. En tu PC, abre `deployment/initial-setup.sh`
2. Copia TODO el contenido
3. En PuTTY:
   ```bash
   nano /tmp/install.sh
   ```
4. Pega el contenido (click derecho en PuTTY)
5. Presiona `Ctrl+X`, luego `Y`, luego `Enter`
6. Ejecuta:
   ```bash
   chmod +x /tmp/install.sh
   bash /tmp/install.sh
   ```

### Paso 5: Durante la Instalación

El script te pedirá:

1. **Confirmar la configuración**: Presiona `y`
2. **Contraseña de MySQL**: Inventa una contraseña segura y guárdala
   - Ejemplo: `Time4Swim2025!Secure`
   - ⚠️ GUÁRDALA EN UN LUGAR SEGURO

3. Espera 10-15 minutos mientras se instala todo

### Paso 6: Verificar la Instalación

Al terminar, verás un mensaje de éxito. Verifica:

```bash
# Ver estado de la aplicación
pm2 status

# Ver logs
pm2 logs time4swim --lines 50

# Verificar que Nginx está corriendo
systemctl status nginx
```

---

## 🔄 PARTE 2: ACTUALIZACIONES FUTURAS

### Método 1: Desde tu PC Windows (Automático)

1. Haz tus cambios en el código
2. Commitea:
   ```powershell
   git add .
   git commit -m "descripción de cambios"
   ```
3. Ejecuta el script de despliegue:
   ```powershell
   .\deployment\deploy.ps1
   ```

**Nota:** Si no tienes SSH configurado desde Windows, el script te dirá qué hacer.

### Método 2: Desde PuTTY (Manual)

1. Conecta con PuTTY
2. Ejecuta:
   ```bash
   cd /var/www/time4swim
   bash deployment/update.sh
   ```

---

## 🛠️ COMANDOS ÚTILES

### Gestión de la Aplicación

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs time4swim

# Ver logs de errores solamente
pm2 logs time4swim --err

# Reiniciar aplicación
pm2 restart time4swim

# Detener aplicación
pm2 stop time4swim

# Ver información detallada
pm2 info time4swim

# Ver uso de recursos
pm2 monit
```

### Gestión de Base de Datos

```bash
# Conectar a MySQL
mysql -u time4swim -p time4swim

# Crear backup manual
/root/backup-db.sh

# Ver backups disponibles
ls -lh /root/backups/

# Restaurar un backup
gunzip -c /root/backups/time4swim_FECHA.sql.gz | mysql -u time4swim -p time4swim
```

### Gestión de Nginx

```bash
# Probar configuración
nginx -t

# Recargar configuración
systemctl reload nginx

# Ver logs de errores
tail -f /var/log/nginx/error.log

# Ver logs de acceso
tail -f /var/log/nginx/access.log
```

### Gestión de SSL

```bash
# Renovar certificado SSL (automático cada 60 días)
certbot renew --dry-run

# Forzar renovación
certbot renew --force-renewal
```

---

## 🔍 SOLUCIÓN DE PROBLEMAS

### La aplicación no carga

1. Verifica que PM2 esté corriendo:
   ```bash
   pm2 status
   ```

2. Si está detenida, iníciala:
   ```bash
   pm2 start time4swim
   ```

3. Revisa los logs:
   ```bash
   pm2 logs time4swim --lines 100
   ```

### Error de base de datos

1. Verifica que MySQL esté corriendo:
   ```bash
   systemctl status mysql
   ```

2. Revisa la conexión en `.env.production`:
   ```bash
   cat /var/www/time4swim/.env.production
   ```

3. Prueba la conexión:
   ```bash
   mysql -u time4swim -p time4swim
   ```

### Error 502 Bad Gateway

1. La aplicación no está corriendo:
   ```bash
   pm2 restart time4swim
   ```

2. Revisa los logs:
   ```bash
   pm2 logs time4swim
   tail -f /var/log/nginx/error.log
   ```

### Problemas con SSL

1. Verifica que el dominio apunte correctamente:
   ```bash
   nslookup tudominio.com
   ```

2. Renueva el certificado:
   ```bash
   certbot renew
   ```

---

## 📊 MONITOREO

### Ver Recursos del Servidor

```bash
# CPU y Memoria
htop

# Uso de disco
df -h

# Procesos activos
ps aux | grep node
```

### Logs Importantes

```bash
# Aplicación
/var/log/pm2/time4swim-error.log
/var/log/pm2/time4swim-out.log

# Nginx
/var/log/nginx/error.log
/var/log/nginx/access.log

# Sistema
/var/log/syslog

# Backups
/var/log/backup.log
```

---

## 🔐 SEGURIDAD

### Configurar Firewall

```bash
# Permitir solo puertos necesarios
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### Actualizar Sistema

```bash
# Actualizar paquetes regularmente
apt update && apt upgrade -y
```

### Cambiar Puerto SSH (Opcional pero recomendado)

```bash
# Editar configuración
nano /etc/ssh/sshd_config

# Cambiar línea:
Port 2222  # En lugar de 22

# Reiniciar SSH
systemctl restart sshd

# No olvides abrir el puerto en firewall:
ufw allow 2222
```

---

## 📞 SOPORTE

Si encuentras problemas:

1. Revisa los logs con `pm2 logs time4swim`
2. Verifica el estado con `pm2 status`
3. Consulta los logs de Nginx: `tail -f /var/log/nginx/error.log`

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después de la instalación, verifica:

- [ ] La aplicación está corriendo: `pm2 status`
- [ ] Nginx está activo: `systemctl status nginx`
- [ ] MySQL está activo: `systemctl status mysql`
- [ ] SSL está configurado: `https://tudominio.com` funciona
- [ ] Los logs no muestran errores: `pm2 logs time4swim`
- [ ] El backup automático está configurado: `crontab -l`
- [ ] Puedes acceder al sitio desde el navegador

---

## 🎉 ¡LISTO!

Tu aplicación Time4Swim está ahora en producción y lista para usar.

Para futuras actualizaciones, simplemente:
1. Haz cambios en tu código local
2. Commitea y push a GitHub
3. Ejecuta `.\deployment\deploy.ps1` desde Windows

¡Que tengas éxito con tu proyecto! 🏊

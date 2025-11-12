# COMANDOS PARA EJECUTAR EN LA CONSOLA WEB DE DIGITALOCEAN

## 🚀 GUÍA PASO A PASO

### 1. Acceder a la Consola Web
1. Ve a: https://cloud.digitalocean.com/droplets
2. Haz clic en tu droplet "time4swim"
3. Haz clic en "Console" (o "Access" → "Launch Droplet Console")
4. Espera a que cargue la consola
5. Inicia sesión como **root** (usa tu contraseña de root)

---

### 2. Actualizar el Código desde GitHub

```bash
cd ~/time4swim
git pull origin master
```

**Deberías ver:** `Already up to date.` o la lista de archivos actualizados

---

### 3. Verificar Archivos de Configuración

```bash
# Verificar que .env.production exista
cat ~/time4swim/.env.production
```

**Deberías ver:**
```
DATABASE_URL="mysql://time4swim:*Time4Swim@localhost:3306/time4swim"
NEXTAUTH_URL="http://159.65.98.102:3000"
NEXTAUTH_SECRET="TuSecretSuperSecreto123456789"
NODE_ENV="production"
```

---

### 4. Instalar Dependencias

Intenta primero con npm install (puede fallar, está bien):

```bash
cd ~/time4swim
npm install --legacy-peer-deps
```

**Si FALLA** (esperado por Prisma), pasa al siguiente paso.

**Si FUNCIONA**, salta al paso 6 (Generar Prisma).

---

### 5. Build en el Servidor (Alternativa)

Si npm install falló, intenta construir directamente:

```bash
cd ~/time4swim
npm run build
```

**Si también falla**, necesitamos copiar node_modules manualmente (te diré cómo).

---

### 6. Generar Cliente Prisma

```bash
cd ~/time4swim
npx prisma generate
```

**Deberías ver:** 
- "✔ Generated Prisma Client"
- Varios mensajes sobre la generación

---

### 7. Ejecutar Migraciones de Base de Datos

```bash
cd ~/time4swim
npx prisma migrate deploy
```

**Deberías ver:**
- Lista de migraciones aplicadas
- "All migrations have been successfully applied"

---

### 8. Configurar PM2 (Gestor de Procesos)

Crear archivo de configuración:

```bash
cd ~/time4swim
cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [{
    name: 'time4swim',
    script: 'npm',
    args: 'start',
    cwd: '/root/time4swim',
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
    max_memory_restart: '900M'
  }]
}
EOFPM2
```

Crear directorio de logs:

```bash
mkdir -p /var/log/pm2
```

---

### 9. Iniciar la Aplicación

```bash
cd ~/time4swim
pm2 start ecosystem.config.js
```

**Deberías ver:**
```
┌─────┬──────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ mode        │ ↺       │ status  │ cpu      │
├─────┼──────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ time4swim    │ fork        │ 0       │ online  │ 0%       │
└─────┴──────────────┴─────────────┴─────────┴─────────┴──────────┘
```

Guardar configuración:

```bash
pm2 save
```

---

### 10. Ver Logs y Verificar

Ver logs en tiempo real:

```bash
pm2 logs time4swim
```

**Deberías ver:**
- "Ready on http://localhost:3000"
- "compiled successfully"

Para salir de los logs: **Ctrl + C**

Ver estado:

```bash
pm2 status
```

---

### 11. Probar la Aplicación

Desde tu navegador, abre:

```
http://159.65.98.102:3000
```

**Deberías ver:** La página de login de Time4Swim

---

## 🔧 COMANDOS DE TROUBLESHOOTING

### Si PM2 no inicia:

```bash
# Ver logs de error
pm2 logs time4swim --err

# Reiniciar
pm2 restart time4swim

# Si sigue fallando, intentar arrancar directamente
cd ~/time4swim
npm start
# (Ctrl+C para detener)
```

### Si npm start dice "command not found":

```bash
# Verificar Node.js
node -v
npm -v

# Si no están instalados, instalar:
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### Si Prisma falla:

```bash
# Limpiar caché
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# Intentar de nuevo
npx prisma generate
```

### Si la base de datos falla:

```bash
# Verificar que MySQL esté corriendo
systemctl status mysql

# Si no está corriendo
systemctl start mysql

# Verificar conexión
mysql -u time4swim -p'*Time4Swim' -e "SHOW DATABASES;"
```

### Para ver el uso de recursos:

```bash
# Ver memoria y CPU
htop
# (q para salir)

# Ver procesos de Node
ps aux | grep node
```

---

## 📝 COMANDOS ÚTILES PM2

```bash
# Ver todas las aplicaciones
pm2 list

# Ver logs
pm2 logs time4swim

# Ver solo errores
pm2 logs time4swim --err

# Ver solo output
pm2 logs time4swim --out

# Reiniciar
pm2 restart time4swim

# Detener
pm2 stop time4swim

# Eliminar
pm2 delete time4swim

# Ver información detallada
pm2 show time4swim

# Ver uso de recursos en tiempo real
pm2 monit
```

---

## ⚠️ NOTA IMPORTANTE

Si ves el error: **"npm install failed"** o **"Prisma postinstall error"**:

**NO TE PREOCUPES**, podemos:

1. Usar una imagen Docker (más fácil)
2. Copiar node_modules desde tu Windows (más complejo)
3. Usar un servidor con más RAM (2GB+)

**Dame feedback de qué está pasando** y te guío según los errores que veas.

---

## 🎯 OBJETIVO

Al final de estos pasos deberías poder abrir:

```
http://159.65.98.102:3000
```

Y ver la aplicación funcionando! 🎉

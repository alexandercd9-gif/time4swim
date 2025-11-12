# Alternativa de Deployment SIN SSH

## Problema
No se puede conectar al servidor via SSH desde tu red local (puerto 22 bloqueado o timeout).

## Solución: Usar la Consola Web de DigitalOcean

### Paso 1: Acceder a la Consola Web
1. Ve a https://cloud.digitalocean.com/
2. Selecciona tu droplet "time4swim"
3. Haz clic en "Console" (esquina superior derecha) o "Access" → "Launch Droplet Console"
4. Inicia sesión como root

### Paso 2: Preparar el Servidor

Desde la consola web del servidor, ejecuta:

```bash
cd ~/time4swim

# Verificar que .env.production exista
cat .env.production

# Debería mostrar:
# DATABASE_URL="mysql://time4swim:*Time4Swim@localhost:3306/time4swim"
# NEXTAUTH_URL="http://159.65.98.102:3000"
# NEXTAUTH_SECRET="TuSecretSuperSecreto123456789"
# NODE_ENV="production"
```

### Paso 3: Opción A - Clonar desde GitHub (Recomendado)

Si tienes tu código en GitHub actualizado con el build:

```bash
cd ~/time4swim

# Hacer backup del .env
cp .env.production .env.production.backup

# Actualizar código
git pull origin master

# Restaurar .env
mv .env.production.backup .env.production

# Instalar dependencias (si funciona)
npm install --legacy-peer-deps

# O si falla, construir en el servidor
npm run build
```

### Paso 4: Opción B - Subir Archivos Manualmente

Si no puedes usar SSH/SCP, usa GitHub:

**Desde tu computadora Windows:**

```powershell
cd C:\MAMP\htdocs\time4swim

# Crear un branch temporal con el build
git checkout -b production-build

# Agregar archivos de build (normalmente ignorados)
git add -f .next
git add -f node_modules
git add .

# Commit
git commit -m "Production build files"

# Push
git push origin production-build
```

**En el servidor (consola web):**

```bash
cd ~/time4swim

# Cambiar a branch con build
git fetch
git checkout production-build

# Verificar que .next exista
ls -la .next
```

### Paso 5: Configurar Prisma

```bash
cd ~/time4swim

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy
```

### Paso 6: Iniciar con PM2

```bash
cd ~/time4swim

# Crear archivo de configuración PM2
cat > ecosystem.config.js << 'EOF'
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
    max_memory_restart: '1G'
  }]
}
EOF

# Crear directorio de logs
mkdir -p /var/log/pm2

# Iniciar aplicación
pm2 start ecosystem.config.js

# Guardar configuración
pm2 save

# Ver logs
pm2 logs time4swim
```

### Paso 7: Verificar que funciona

Desde tu navegador, abre:
```
http://159.65.98.102:3000
```

## Troubleshooting

### Si Prisma falla al generar
```bash
# Limpiar y regenerar
rm -rf node_modules/.prisma
npx prisma generate --schema=./prisma/schema.prisma
```

### Si PM2 no inicia
```bash
# Ver logs de error
pm2 logs time4swim --err

# Intentar iniciar directamente
cd ~/time4swim
npm start
# Ctrl+C para detener

# Si funciona, volver a intentar con PM2
pm2 restart time4swim
```

### Si npm start falla
```bash
# Verificar que package.json tenga el script start
cat package.json | grep -A 5 "scripts"

# Debería tener:
# "start": "next start"
```

## Notas Importantes

1. **No commitees node_modules a producción**: Es muy pesado. Solo hazlo como último recurso.
2. **La carpeta .next SÍ debe subirse**: Es el build compilado.
3. **Alternativa a node_modules**: Puedes intentar `npm ci --production` en el servidor.

## Configurar Firewall para SSH (Opcional)

Si quieres arreglar el acceso SSH:

1. En DigitalOcean Cloud Panel:
   - Ve a "Networking" → "Firewalls"
   - Crea un nuevo firewall o edita el existente
   - Agrega regla: **Inbound** → SSH (TCP 22) → All IPv4, All IPv6
   - Aplica el firewall a tu droplet

2. En el servidor (consola web):
```bash
# Verificar que SSH esté corriendo
systemctl status ssh

# Si no está corriendo
systemctl start ssh
systemctl enable ssh

# Verificar puerto
netstat -tlnp | grep :22
```

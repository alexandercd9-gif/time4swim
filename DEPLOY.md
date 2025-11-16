# 🚀 Guía de Deploy - Time4Swim

## Método 1: Deploy Automático (Recomendado)

### Requisitos:
- SSH configurado con tu droplet
- PowerShell en Windows

### Pasos:

1. **Configurar script:**
```powershell
# Editar deploy.ps1 líneas 33-35:
$SERVER_USER = "root"  # Tu usuario SSH
$SERVER_IP = "164.90.xxx.xxx"  # Tu IP de Digital Ocean
$SERVER_PATH = "/var/www/time4swim"  # Ruta en servidor
```

2. **Configurar .env.production:**
```bash
# Editar .env.production con tus valores reales
DATABASE_URL="mysql://user:pass@localhost:3306/time4swim"
JWT_SECRET="tu_secret_de_produccion"
```

3. **Ejecutar deploy:**
```powershell
.\deploy.ps1
```

El script hará:
- ✅ Build local (en tu PC)
- ✅ Comprimir archivos necesarios
- ✅ Subir a servidor via SCP
- ✅ Descomprimir en servidor
- ✅ Reiniciar app con PM2

---

## Método 2: Deploy Manual

### Paso 1: Build local
```bash
npm run build
```

### Paso 2: Comprimir archivos
```bash
# Windows PowerShell
tar -czf deploy.tar.gz .next node_modules public package.json package-lock.json prisma next.config.ts .env.production

# Linux/Mac
tar -czf deploy.tar.gz .next node_modules public package.json package-lock.json prisma next.config.ts .env.production
```

### Paso 3: Subir a servidor
```bash
scp deploy.tar.gz root@tu.droplet.ip:/var/www/time4swim/
```

### Paso 4: Desplegar en servidor
```bash
ssh root@tu.droplet.ip

cd /var/www/time4swim
tar -xzf deploy.tar.gz
rm deploy.tar.gz
npx prisma generate
pm2 restart time4swim
```

---

## Troubleshooting

### Error: "tar: command not found"
**Windows:** Instalar Git Bash o usar WSL
**Solución alternativa:** Usar WinRAR/7zip para crear .tar.gz

### Error: "Permission denied (publickey)"
**Solución:**
```bash
# Generar SSH key si no tienes
ssh-keygen -t rsa -b 4096

# Copiar key al servidor
ssh-copy-id root@tu.droplet.ip
```

### Error: "pm2 not found"
**En servidor:**
```bash
npm install -g pm2
```

### El servidor sigue sin RAM para Prisma
**Si aún así falla, el servidor está ejecutando el build:**
```bash
# Verificar en servidor que NO hay build hook
# Asegúrate de que PM2 solo ejecuta:
pm2 start npm --name "time4swim" -- start

# NO debe tener:
pm2 start npm --name "time4swim" -- run build  # ❌ Esto consume RAM
```

---

## Estructura de Archivos en Servidor

```
/var/www/time4swim/
├── .next/                # Build pre-compilado (desde tu PC)
├── node_modules/         # Dependencias
├── public/              
├── prisma/
├── package.json
├── next.config.ts
└── .env.production       # Variables de entorno
```

---

## Ventajas de este método

✅ Build en tu PC (RAM ilimitada)
✅ Servidor solo ejecuta (< 200MB RAM)
✅ Deploy en 2-3 minutos
✅ Sin costo adicional
✅ Mantienes Prisma + TypeScript
✅ Script reutilizable

---

## Próximos pasos (opcionales)

### 1. GitHub Actions (CI/CD automático)
```yaml
# .github/workflows/deploy.yml
name: Deploy to DO
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: rsync -avz .next/ ${{ secrets.SERVER }}:/var/www/time4swim/.next/
```

### 2. Migrar a Vercel (gratis, mejor)
- Zero config
- Deploy automático con git push
- Edge network global
- SSL automático

---

¿Necesitas ayuda configurando el script? Dame tu IP de Digital Ocean (por privado) y lo configuro por ti.

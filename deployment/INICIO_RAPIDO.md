# 🎯 GUÍA VISUAL PASO A PASO - DESPLIEGUE INICIAL

## ⚠️ ANTES DE EMPEZAR

**MUY IMPORTANTE - Edita estos archivos primero:**

1. Abre `deployment/initial-setup.sh`
2. En la línea 17, cambia:
   ```bash
   DOMAIN="tudominio.com"  # 👈 PON TU DOMINIO REAL AQUÍ
   ```

3. En la línea 243, cambia:
   ```bash
   --email tu_email@ejemplo.com  # 👈 PON TU EMAIL REAL AQUÍ
   ```

4. Guarda el archivo

---

## 📋 PASO 1: CONFIGURAR DOMINIO (5 minutos)

### En tu proveedor de dominio:

```
┌─────────────────────────────────────┐
│  Panel de Control DNS               │
├─────────────────────────────────────┤
│  Tipo: A                            │
│  Nombre: @                          │
│  Valor: 159.65.98.102              │
│  TTL: 3600                          │
├─────────────────────────────────────┤
│  Tipo: A                            │
│  Nombre: www                        │
│  Valor: 159.65.98.102              │
│  TTL: 3600                          │
└─────────────────────────────────────┘
```

⏱️ Espera 5-10 minutos para propagación

---

## 📋 PASO 2: CONECTAR CON PUTTY (2 minutos)

### Configuración de PuTTY:

```
┌─────────────────────────────────────┐
│  PuTTY Configuration                │
├─────────────────────────────────────┤
│  Host Name: 159.65.98.102          │
│  Port: 22                           │
│  Connection type: SSH               │
├─────────────────────────────────────┤
│         [Open] [Cancel]             │
└─────────────────────────────────────┘
```

### En la terminal negra que se abre:

```
login as: root
root@159.65.98.102's password: [escribe tu contraseña]

Welcome to Ubuntu 22.04 LTS
root@droplet:~#
```

✅ ¡Estás dentro!

---

## 📋 PASO 3: EJECUTAR INSTALACIÓN (15 minutos)

### Copia y pega estos comandos UNO POR UNO:

```bash
# 1. Ir a directorio temporal
cd /tmp
```

Presiona ENTER, espera a ver el prompt de nuevo

```bash
# 2. Clonar repositorio
git clone https://github.com/alexandercd9-gif/time4swim.git
```

Verás algo como:
```
Cloning into 'time4swim'...
remote: Enumerating objects: 1234, done.
...
```

```bash
# 3. Ir a carpeta de deployment
cd time4swim/deployment
```

```bash
# 4. Dar permisos de ejecución
chmod +x initial-setup.sh
```

```bash
# 5. Ejecutar instalación
./initial-setup.sh
```

---

## 📋 PASO 4: DURANTE LA INSTALACIÓN

### Te preguntará:

```
==================================================
🏊 INSTALANDO TIME4SWIM EN PRODUCCIÓN
==================================================

📋 Configuración:
   Dominio: tudominio.com
   Directorio: /var/www/time4swim
   Repositorio: https://github.com/alexandercd9-gif/time4swim.git

¿Es correcta esta información? (y/n):
```

👉 Escribe `y` y presiona ENTER

---

### Instalación automática:

Verás esto:

```
[1/10] Actualizando sistema...
[2/10] Instalando Node.js 20...
[3/10] Instalando MySQL...
🔐 Configurando MySQL...
Por favor, introduce una contraseña segura para MySQL:
Contraseña MySQL: 
```

👉 **MUY IMPORTANTE:**
- Escribe una contraseña segura (ejemplo: `Time4Swim2025!Secure`)
- **NO SE VERÁ MIENTRAS ESCRIBES** (es normal)
- Presiona ENTER
- **GUARDA ESTA CONTRASEÑA EN UN LUGAR SEGURO**

---

### Continuará automáticamente:

```
[4/10] Instalando Nginx...
[5/10] Instalando Certbot para SSL...
[6/10] Instalando PM2...
[7/10] Clonando repositorio...
[8/10] Configurando variables de entorno...
[9/10] Instalando dependencias...
    🔨 Generando cliente Prisma...
    🗄️  Ejecutando migraciones de base de datos...
    🏗️  Construyendo aplicación...
[10/10] Configurando Nginx...
```

⏱️ Esto tomará 10-15 minutos. **NO CIERRES LA VENTANA**

---

## 📋 PASO 5: VERIFICAR INSTALACIÓN

### Al terminar verás:

```
==================================================
✅ ¡INSTALACIÓN COMPLETADA!
==================================================

📊 Información importante:
   🌐 URL: https://tudominio.com
   📁 Directorio: /var/www/time4swim
   🗄️  Base de datos: time4swim
   👤 Usuario MySQL: time4swim

📝 Comandos útiles:
   Ver logs:        pm2 logs time4swim
   Ver estado:      pm2 status
```

---

### Verifica que todo está corriendo:

```bash
pm2 status
```

Deberías ver:

```
┌────┬────────────────┬─────────┬─────────┬─────────┐
│ id │ name           │ status  │ restart │ uptime  │
├────┼────────────────┼─────────┼─────────┼─────────┤
│ 0  │ time4swim      │ online  │ 0       │ 2m      │
└────┴────────────────┴─────────┴─────────┴─────────┘
```

✅ Si dice "online" = ¡PERFECTO!

---

## 📋 PASO 6: PROBAR TU SITIO

1. Abre tu navegador
2. Ve a: `https://tudominio.com`
3. Deberías ver tu aplicación Time4Swim funcionando

✅ Si carga = ¡ÉXITO TOTAL!

---

## 🔄 FUTURAS ACTUALIZACIONES

### Cada vez que hagas cambios:

#### Opción A - Desde Windows (Lo más fácil):

```powershell
# En PowerShell (VS Code Terminal)
.\deployment\deploy.ps1
```

#### Opción B - Desde PuTTY:

```bash
cd /var/www/time4swim
bash deployment/update.sh
```

---

## ❌ SI ALGO SALE MAL

### Error: No puede conectarse

```bash
# Ver logs
pm2 logs time4swim

# Reiniciar
pm2 restart time4swim
```

### Error: 502 Bad Gateway

```bash
# Verificar estado
pm2 status

# Si está stopped:
pm2 start time4swim
```

### Error: Base de datos

```bash
# Verificar MySQL
systemctl status mysql

# Si está stopped:
systemctl start mysql
```

---

## 📞 NECESITAS AYUDA?

### Ver logs en tiempo real:

```bash
pm2 logs time4swim
```

### Ver qué está pasando:

```bash
pm2 info time4swim
```

### Ver logs de Nginx:

```bash
tail -f /var/log/nginx/error.log
```

---

## ✅ CHECKLIST FINAL

Después de instalar, verifica:

- [ ] `pm2 status` muestra "online"
- [ ] `https://tudominio.com` carga correctamente
- [ ] Puedes hacer login
- [ ] No hay errores en `pm2 logs time4swim`
- [ ] El candado SSL aparece en el navegador 🔒

---

## 🎉 ¡FELICIDADES!

Tu aplicación Time4Swim está ahora en producción y lista para usar.

**Archivo útiles:**
- `GUIA_DESPLIEGUE.md` - Guía completa detallada
- `COMANDOS_RAPIDOS.md` - Lista de comandos útiles
- `deploy.ps1` - Script de actualización automático

**¿Dudas?** Revisa los archivos de documentación en la carpeta `deployment/`

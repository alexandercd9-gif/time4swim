# Configurar Cloudinary para Time4Swim

## Paso 1: Obtener Credenciales de Cloudinary

1. Ve a https://cloudinary.com/ y crea una cuenta (o inicia sesión)
2. En el Dashboard, encontrarás:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## Paso 2: Crear Upload Preset

1. Ve a Settings > Upload
2. Scroll hasta "Upload presets"
3. Crea un nuevo preset:
   - **Preset name:** `time4swim_media`
   - **Signing Mode:** `Unsigned` (para permitir uploads desde el cliente)
   - **Folder:** `time4swim`
   - Guarda el preset

## Paso 3: Configurar Variables Locales

Agrega estas líneas a tu archivo `.env.local`:

```env
# Cloudinary - Almacenamiento de medios
CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
CLOUDINARY_UPLOAD_PRESET=time4swim_media
```

## Paso 4: Configurar en Producción

Ejecuta este comando PowerShell para actualizar el archivo `.env.production` en el servidor:

```powershell
# Reemplaza estos valores con tus credenciales reales
$CLOUD_NAME = "tu_cloud_name"
$API_KEY = "tu_api_key"
$API_SECRET = "tu_api_secret"

plink root@137.184.126.212 "cd /root/time4swim && echo 'CLOUDINARY_CLOUD_NAME=$CLOUD_NAME' >> .env.production && echo 'CLOUDINARY_API_KEY=$API_KEY' >> .env.production && echo 'CLOUDINARY_API_SECRET=$API_SECRET' >> .env.production && echo 'CLOUDINARY_UPLOAD_PRESET=time4swim_media' >> .env.production"
```

## Paso 5: Reiniciar la Aplicación

```powershell
plink root@137.184.126.212 "pm2 restart time4swim"
```

## Verificar Configuración

Para verificar que las variables están configuradas en producción:

```powershell
plink root@137.184.126.212 "cd /root/time4swim && grep CLOUDINARY .env.production"
```

## Notas Importantes

- **NO** compartas tus credenciales en repositorios públicos
- El API Secret debe mantenerse secreto
- El Upload Preset debe ser "unsigned" para permitir uploads desde el navegador
- Asegúrate de que el folder "time4swim" exista en Cloudinary o se creará automáticamente

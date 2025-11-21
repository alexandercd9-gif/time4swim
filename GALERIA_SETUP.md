# 📸 Sistema de Galería de Medios - Time4Swim

## ✅ Implementación Completada

Se ha creado el sistema completo de galería de medios con las siguientes funcionalidades:

### 🎯 Características Implementadas

1. **Modelo de Base de Datos (Prisma)**
   - `Media`: Almacena fotos y videos
   - `MediaSwimmer`: Relaciona nadadores con medios (con carriles)
   - `MediaMoment`: Momentos clave en videos (Salida, Vuelta, Llegada)

2. **Página de Galería** (`/parents/galeria`)
   - Tabs: Todos / Fotos / Videos
   - Filtro por nadador
   - Grid responsivo de medios
   - Vista previa con blur para contenido bloqueado
   - Contador de archivos bloqueados

3. **Sistema Freemium**
   - ✅ 2 archivos gratis (para generar interés)
   - 🔒 Resto con blur + candado
   - 📊 Contador visible de contenido bloqueado
   - 💰 Modal de upgrade con CTA

4. **Reproductor de Medios**
   - Visor fullscreen de fotos
   - Reproductor de video con controles
   - Navegación rápida a momentos clave
   - Información del evento y nadadores
   - Indicador de carril

5. **Menú Lateral**
   - Nueva opción "📷 Galería" en el menú de Parents
   - Icono Camera

---

## 🔧 Configuración Pendiente: Cloudinary

### Paso 1: Crear cuenta en Cloudinary

1. Ve a https://cloudinary.com/
2. Crea una cuenta gratuita (25GB/mes gratis)
3. Verifica tu email

### Paso 2: Obtener credenciales

En tu dashboard de Cloudinary encontrarás:
- **Cloud Name**: `tu-cloud-name`
- **API Key**: `123456789012345`
- **API Secret**: `abcdefghijklmnopqrstuvwxyz`

### Paso 3: Agregar variables de entorno

Edita tu archivo `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
CLOUDINARY_UPLOAD_PRESET=time4swim_media
```

### Paso 4: Instalar SDK de Cloudinary

```bash
npm install cloudinary
```

### Paso 5: Crear Upload Preset en Cloudinary

1. Ve a Settings → Upload
2. Crea nuevo "Upload Preset" con nombre: `time4swim_media`
3. Configuración recomendada:
   - **Mode**: Unsigned (para uploads directos desde cliente)
   - **Folder**: `time4swim`
   - **Auto-tagging**: Enabled
   - **Image transformation**:
     - Quality: Auto
     - Format: Auto
   - **Video transformation**:
     - Quality: Auto
     - Format: Auto (mp4)

### Paso 6: Aplicar migración de BD

```bash
npx prisma migrate dev --name add_media_gallery
npx prisma generate
```

---

## 🚀 Siguiente Paso: Panel de Admin para Subir Medios

Una vez configurado Cloudinary, necesitarás crear:

### Panel de Admin (`/admin/media`)

```typescript
// Funcionalidades necesarias:
1. Upload de fotos/videos a Cloudinary
2. Seleccionar nadadores que aparecen
3. Asignar carriles
4. Vincular a evento (opcional)
5. Agregar marcadores de tiempo (para videos)
6. Preview antes de publicar
```

### API de Upload (`/api/admin/media`)

```typescript
// Endpoints necesarios:
POST   /api/admin/media        - Subir nuevo medio
GET    /api/admin/media        - Listar todos los medios
PUT    /api/admin/media/:id    - Editar medio
DELETE /api/admin/media/:id    - Eliminar medio
```

---

## 📊 Uso de Almacenamiento Estimado

### Con compresión de Cloudinary:

| Tipo | Original | Optimizado | Ahorro |
|------|----------|------------|--------|
| Foto HD | 5 MB | 200 KB | 96% |
| Video 2min | 50 MB | 8 MB | 84% |

**Capacidad del plan gratuito (25GB/mes):**
- ~125,000 fotos optimizadas
- ~3,125 videos de 2min optimizados

---

## 🎨 Experiencia de Usuario

### Usuario SIN suscripción:
1. Ve el menú "📷 Galería"
2. Puede ver 2 archivos gratis (sin blur)
3. Ve contador: "Tienes 18 archivos bloqueados"
4. Resto aparece con blur + candado
5. Al hacer click → Modal de upgrade

### Usuario CON suscripción:
1. Acceso completo a toda la galería
2. Puede ver todos los medios en fullscreen
3. Videos con navegación por momentos clave
4. Descarga ilimitada (opcional)

---

## ✨ Próximas Mejoras (Opcional)

1. **Descargas**: Botón para descargar medios
2. **Compartir**: Generar enlaces para compartir
3. **Álbumes**: Agrupar medios por evento
4. **Favoritos**: Marcar medios como favoritos
5. **Comentarios**: Parents pueden comentar en medios
6. **Notificaciones**: Avisar cuando se sube nuevo contenido

---

## 📝 Notas Importantes

- La migración de BD está creada pero NO aplicada
- Cloudinary debe configurarse ANTES de subir el primer medio
- El sistema freemium funciona automáticamente según la suscripción del usuario
- Los 2 archivos gratis son para generar conversión (FOMO)

---

## 🔐 Control de Acceso

El sistema verifica:
- `mediaGalleryAddon = true` → Acceso completo
- `mediaGalleryIsFree = true` → Acceso completo
- Ninguno → Solo 2 archivos gratis

Esto se configura en la tabla `Subscription`.

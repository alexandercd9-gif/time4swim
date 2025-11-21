# 📸 Galería de Medios - Próximos Pasos

## ✅ Completado

- ✅ Cloudinary SDK instalado (`cloudinary`)
- ✅ Variables de entorno configuradas en `.env`
- ✅ Base de datos sincronizada con nuevas tablas:
  - `Media` (fotos y videos)
  - `MediaSwimmer` (etiquetas de nadadores)
  - `MediaMoment` (momentos clave en videos)
- ✅ Página de galería para padres creada (`/parents/galeria`)
- ✅ API endpoint con freemium implementado (`/api/parents/media`)
- ✅ Ícono Camera agregado al menú

## 🔧 Configuración Pendiente en Cloudinary

### 1. Crear Upload Preset (REQUERIDO ANTES DE SUBIR MEDIOS)

Ve a tu dashboard de Cloudinary:
1. Navega a: **Settings → Upload**
2. Clic en **Add upload preset**
3. Configura:
   - **Preset name:** `time4swim_media`
   - **Signing Mode:** `Unsigned` ⚠️ (importante para uploads del navegador)
   - **Folder:** `time4swim`
   - **Use filename:** `Yes`
   - **Unique filename:** `Yes`
   - **Resource Type:** `Auto` (detecta automáticamente foto/video)
   
4. En **Transformations:**
   - **Quality:** `Auto`
   - **Format:** `Auto`
   - **Max resolution:** `1920x1080` (para fotos)
   
5. Guarda el preset

### 2. (Opcional) Configurar Límites de Video

Si quieres limitar el tamaño o duración de videos:
- Settings → Upload → Upload limits
- **Max video duration:** 180 segundos (3 minutos)
- **Max file size:** 100 MB

## 📱 Cómo Probar la Galería

### Para Padres:
1. Inicia sesión como padre: `http://localhost:3000/login`
2. Ve al menú lateral y haz clic en **"Galería"**
3. Verás un estado vacío (sin medios aún)
4. Filtros disponibles:
   - Tabs: Todos / Fotos / Videos
   - Dropdown: Filtrar por nadador

### Estado Freemium:
- **Sin suscripción:** Verás máximo 2 items gratis, resto bloqueado con blur
- **Con mediaGalleryAddon = true:** Acceso completo a toda la galería

## 🎯 Próximas Funcionalidades

### Admin Panel de Subida (No Urgente)

Cuando quieras implementar subida de medios, necesitarás:

#### Página: `/admin/media`
```tsx
// Features del panel admin:
- Widget de Cloudinary para arrastrar/soltar archivos
- Selector de evento (competencia)
- Selector múltiple de nadadores que aparecen
- Input de carriles (lane) por nadador
- Formulario para agregar momentos clave:
  * Salida (timestamp en segundos)
  * Primera vuelta
  * Segunda vuelta
  * Llegada
- Título y descripción del media
```

#### API Endpoint: `/api/admin/media`
```typescript
// POST - Subir nuevo media
// GET - Listar todos los medias
// PUT - Editar media existente
// DELETE - Eliminar media
```

#### Widget de Cloudinary
```bash
# Instalar widget
npm install cloudinary-react
```

```tsx
// Ejemplo básico de integración:
import { CloudinaryUploadWidget } from "cloudinary-react";

<CloudinaryUploadWidget
  cloudName="dq0gzucfa"
  uploadPreset="time4swim_media"
  onSuccess={(result) => {
    // result contiene URL, publicId, duración, dimensiones
    console.log(result.info);
  }}
/>
```

## 📊 Estimación de Almacenamiento

**Con Plan Gratuito de Cloudinary (25GB/mes):**

### Escenario Conservador:
- **Fotos (JPEG comprimidas):**
  - Original: 4MB → Optimizada: 150KB (96% ahorro)
  - 25GB = ~170,000 fotos/mes
  
- **Videos (MP4 comprimidos):**
  - Original: 50MB/min → Optimizado: 8MB/min (84% ahorro)
  - 25GB = 3,125 minutos = 52 horas de video/mes

### Para un Club Promedio:
- 50 nadadores activos
- 4 competencias/mes
- 10 fotos + 2 videos (30 seg cada uno) por competencia
- **Total mensual:** ~2GB (muy por debajo del límite)

## 🔐 Seguridad

### Cloudinary Upload Preset "Unsigned"
- ✅ Seguro para uso del navegador
- ✅ Solo permite carpeta específica (`time4swim`)
- ✅ Transformaciones limitadas a las preconfiguradas
- ❌ No requiere API Secret en frontend
- ⚠️ Solo permitir uploads desde panel admin (no desde frontend público)

### Access Control
- Fotos/videos son **públicos** en Cloudinary (URLs accesibles)
- **Freemium en app** controla visualización con blur
- URLs no son adivinables (usan IDs únicos de Cloudinary)

## 📈 Monetización

### Addon de Galería en Subscriptions:
```sql
-- Ya implementado en schema:
mediaGalleryAddon: Boolean (addon pagado)
mediaGalleryIsFree: Boolean (acceso cortesía)
addonsAmount: Decimal (monto adicional)
```

### Precio Sugerido:
- **Addon mensual:** $5-10 USD/mes
- **Incluido en plan PRO:** Sin costo adicional
- **Trial gratuito:** 2 medias visibles (estrategia FOMO)

## 🎨 Experiencia de Usuario

### Padres sin Acceso:
1. Ven 2 fotos/videos gratis (primeros subidos)
2. Resto aparece con efecto blur
3. Contador: "🔒 5 medias adicionales bloqueados"
4. Botón prominente: **"Desbloquear Galería Completa"**
5. Modal con info de addon ($5/mes)

### Padres con Acceso:
1. Grid completo de fotos/videos
2. Filtros por nadador
3. Click para ver fullscreen
4. Videos con controles y momentos navegables
5. Info de evento, fecha, nadadores

## 🚀 Deploy a Producción

Antes de desplegar, verifica:

```bash
# 1. Variables de entorno en servidor
CLOUDINARY_CLOUD_NAME=dq0gzucfa
CLOUDINARY_API_KEY=997539199228735
CLOUDINARY_API_SECRET=HhxMkftLptgzG1l-v5MMd6Y4Rgg
CLOUDINARY_UPLOAD_PRESET=time4swim_media

# 2. Base de datos migrada
npx prisma db push

# 3. Build exitoso
npm run build

# 4. Upload preset creado en Cloudinary dashboard
```

## 💡 Tips

- **Cloudinary auto-optimiza:** No necesitas procesar imágenes manualmente
- **CDN global incluido:** Carga rápida desde cualquier país
- **Transformaciones on-the-fly:** Puedes cambiar tamaño en URL
- **Backups automáticos:** Cloudinary guarda todo en redundancia

## ❓ Preguntas Frecuentes

**P: ¿Los videos se reproducen en la web o abren externa?**
R: Se reproducen integrados en la página usando HTML5 `<video>`

**P: ¿Puedo etiquetar nadadores automáticamente?**
R: No hay IA implementada. Etiquetado manual por admin es más preciso y gratuito.

**P: ¿Se pueden descargar fotos/videos?**
R: Sí, con clic derecho en navegador. Para control estricto necesitarías watermarks (no implementado).

**P: ¿Qué pasa si excedo 25GB de Cloudinary?**
R: Cloudinary cobra overage o puedes actualizar a plan pagado ($99/mes para 145GB).

---

**Estado Actual:** ✅ Ready for testing (crear upload preset primero)
**Próximo Paso:** Probar galería vacía en `/parents/galeria`
**Después:** Implementar panel admin cuando lo necesites

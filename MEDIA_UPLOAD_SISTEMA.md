# 📸 Sistema de Upload de Fotos/Videos - IMPLEMENTADO

## ✅ Completado

### Backend APIs
1. **`/api/upload/cloudinary`** - Sube archivos a Cloudinary
   - Acepta fotos y videos
   - Retorna URL, thumbnail, dimensiones, duración
   - Usa upload_preset: `time4swim_media`

2. **`/api/competitions/media`** - Guarda medias en BD
   - Crea registros en tabla `Media`
   - Vincula nadador en tabla `MediaSwimmer`
   - Se ejecuta después de guardar competencia

### Frontend - CompetitionForm.tsx
1. **Estados agregados:**
   - `uploadedMedias[]` - Array de medias subidos
   - `uploading` - Flag de carga
   - `uploadProgress` - Progreso (para futuro)

2. **Funciones nuevas:**
   - `handleFileUpload()` - Sube archivo a Cloudinary inmediatamente
   - `handleRemoveMedia()` - Elimina preview (no borra de Cloudinary)

3. **UI Mejorada:**
   - ✅ Grid de previews (2 columnas)
   - ✅ Botón ❌ para eliminar (aparece en hover)
   - ✅ Spinner "Subiendo..." mientras carga
   - ✅ Contador "X/5 archivos"
   - ✅ Botón "Agregar más" después del primer upload
   - ✅ Mensaje "Máximo alcanzado" cuando llega a 5

## 🎯 Flujo de Usuario

### 1. Activar Add-on
Padre marca checkbox "Guardar fotos y videos"

### 2. Subir Archivos
- Click en "Examinar..."
- Selecciona foto/video
- **Se sube INMEDIATAMENTE a Cloudinary**
- Muestra preview arriba

### 3. Subir Más (Opcional)
- Botón "Examinar..." sigue visible abajo
- Puede subir hasta 5 archivos total
- Cada uno se sube al seleccionarlo

### 4. Eliminar Si Se Equivoca
- Hover sobre preview → Aparece botón ❌
- Click para eliminar
- Preview desaparece
- **Nota:** Archivo queda en Cloudinary (no se borra)

### 5. Guardar Competencia
- Click en "Actualizar Competencia"
- Guarda datos de competencia en BD
- **Luego guarda referencias de medias en BD**
- Vincula nadador, club, fecha

## 📊 Tablas de Base de Datos

### Media
```sql
id, type (PHOTO/VIDEO), cloudinaryPublicId, cloudinaryUrl, 
thumbnailUrl, title, description, duration, width, height, 
fileSize, clubId, eventId, uploadedBy, capturedAt
```

### MediaSwimmer (Many-to-Many)
```sql
mediaId, childId, lane
```

### MediaMoment (Para videos - Timestamps)
```sql
mediaId, time (segundos), label (Salida/Vuelta/Llegada)
```

## 🔐 Seguridad

- ✅ Checkbox requiere addon activo (`hasMediaGalleryAddon`)
- ✅ Upload requiere autenticación (session.user.id)
- ✅ Cloudinary usa preset `unsigned` (seguro para frontend)
- ✅ Máximo 5 archivos por competencia
- ✅ Solo acepta image/* y video/*

## 🎨 Preview UI

### Para Fotos
```
┌──────────────┐
│   [IMAGEN]   │ ← Thumbnail real de Cloudinary
│              │
└──────────────┘
     [❌] ← Botón eliminar (hover)
```

### Para Videos
```
┌──────────────┐
│      🎥      │ ← Ícono de video
│              │
└──────────────┘
     [❌] ← Botón eliminar (hover)
```

## 📱 Estados del Uploader

### Sin Add-on
```
┌─────────────────┐
│       🔒        │
│ Activa el add-on│
│    primero      │
│  [Examinar...] │ ← Deshabilitado (gris)
└─────────────────┘
```

### Con Add-on - Sin archivos
```
┌─────────────────┐
│       📤        │
│ Sube fotos o    │
│    videos       │
│  [Examinar...] │ ← Habilitado (púrpura)
└─────────────────┘
```

### Subiendo
```
┌─────────────────┐
│    [Spinner]    │
│   Subiendo...   │
│                 │
└─────────────────┘
```

### Con archivos (2/5)
```
┌────┐ ┌────┐
│Img1│ │Img2│ ← Previews con botón X
└────┘ └────┘

┌─────────────────┐
│       📤        │
│  Agregar más    │
│     (2/5)       │
│  [Examinar...] │ ← Para subir más
└─────────────────┘
```

### Máximo alcanzado (5/5)
```
┌────┐ ┌────┐
│Img1│ │Img2│
└────┘ └────┘
┌────┐ ┌────┐
│Img3│ │Img4│
└────┘ └────┘
┌────┐
│Img5│
└────┘

✓ Máximo alcanzado (5 archivos)
```

## 🚀 Para Probar

1. **Activar add-on en admin:**
   ```
   Admin → Usuarios → [Usuario] → Toggle "Galería de Medias"
   ```

2. **Como padre:**
   ```
   Login → Competencias → Nueva Competencia
   → Marcar "Guardar fotos y videos"
   → Examinar... → Seleccionar foto
   → Ver preview aparecer
   → Subir otra (opcional)
   → Guardar Competencia
   ```

3. **Verificar en galería:**
   ```
   Menú → Galería
   → Ver fotos/videos subidos
   ```

## 🐛 Troubleshooting

### "Error al subir archivo"
- Verifica Cloudinary credentials en `.env`
- Asegúrate que upload preset `time4swim_media` exista
- Revisa consola del navegador para más detalles

### "Máximo 5 fotos/videos"
- Es límite intencional
- Elimina algunos con botón ❌ para subir más

### Preview no aparece
- F12 → Console → Ver errores
- Verifica que API `/api/upload/cloudinary` responda
- Revisa Network tab para ver request

### Medias no aparecen en galería
- Verifica que `/api/competitions/media` se ejecute
- Revisa tabla `Media` en BD
- Asegúrate que `childId` sea correcto

## 📈 Próximos Pasos (Opcional)

- [ ] Barra de progreso real durante upload
- [ ] Comprimir imágenes antes de subir
- [ ] Validar tamaño de archivo (max 10MB)
- [ ] Crop/rotate de imágenes
- [ ] Eliminar archivo de Cloudinary al borrar preview
- [ ] Vista previa de videos (reproducir)
- [ ] Tags/momentos para videos (Salida, Vuelta, Llegada)

---

**Estado:** ✅ **FUNCIONAL Y LISTO PARA USAR**
**Última actualización:** 20 Nov 2025

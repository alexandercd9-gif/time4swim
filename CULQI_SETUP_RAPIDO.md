# 🚀 ACTIVACIÓN RÁPIDA DE CULQI

> **NOTA IMPORTANTE:** Todo el código ya está preparado. Solo necesitas agregar tus credenciales de Culqi.

## 📋 Checklist Rápido

### Paso 1: Obtener Credenciales (5 min)
1. Ve a https://www.culqi.com/ y regístrate
2. Completa verificación de identidad
3. Ve a **Dashboard → Desarrollo → API Keys**
4. Copia:
   - `pk_test_xxxxxxxxxxxxx` (Public Key)
   - `sk_test_xxxxxxxxxxxxx` (Secret Key)

### Paso 2: Configurar Variables de Entorno (2 min)
```bash
# 1. Copiar el template
cp .env.local.example .env.local

# 2. Editar el archivo
code .env.local

# 3. Reemplazar estos valores:
NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_test_TU_CLAVE_AQUI
CULQI_SECRET_KEY=sk_test_TU_CLAVE_AQUI
NEXT_PUBLIC_CULQI_MODE=test
```

### Paso 3: Crear Planes en Culqi Dashboard (10 min)
1. Ve a **Dashboard → Planes → Crear Plan**
2. Crea estos 4 planes:

**Plan Básico:**
- Nombre: `Plan Básico Time4Swim`
- Monto: `S/. 15.00`
- Intervalo: `Mensual` (1 mes)
- Límite de cobros: `Sin límite`

**Plan Familiar:**
- Nombre: `Plan Familiar Time4Swim`
- Monto: `S/. 25.00`
- Intervalo: `Mensual` (1 mes)
- Límite de cobros: `Sin límite`

**Plan Premium:**
- Nombre: `Plan Premium Time4Swim`
- Monto: `S/. 40.00`
- Intervalo: `Mensual` (1 mes)
- Límite de cobros: `Sin límite`

**Club PRO:**
- Nombre: `Club PRO Time4Swim`
- Monto: `S/. 99.00`
- Intervalo: `Mensual` (1 mes)
- Límite de cobros: `Sin límite`

3. Anota los IDs generados (ej: `plan_test_abc123`)

### Paso 4: Actualizar IDs de Planes en el Código (1 min)
Edita `src/app/api/subscription/create/route.ts`:

```typescript
// Línea 29: Reemplazar con tus IDs reales
const CULQI_PLAN_IDS = {
  basic: 'plan_test_ABC123',    // ← Tu ID del Plan Básico
  family: 'plan_test_XYZ456',   // ← Tu ID del Plan Familiar
  premium: 'plan_test_DEF789',  // ← Tu ID del Plan Premium
};
```

### Paso 5: Configurar Webhook (5 min)
1. Ve a **Dashboard → Webhooks → Agregar Webhook**
2. URL: `https://tudominio.com/api/webhooks/culqi` (usa tu dominio real)
3. Para desarrollo local, usa **ngrok** temporalmente:
   ```bash
   ngrok http 3000
   # Copia la URL: https://xxxx-xx-xx-xx.ngrok.io
   # Webhook URL: https://xxxx-xx-xx-xx.ngrok.io/api/webhooks/culqi
   ```
4. Selecciona estos eventos:
   - ✓ `charge.succeeded`
   - ✓ `charge.failed`
   - ✓ `subscription.activated`
   - ✓ `subscription.canceled`
   - ✓ `subscription.updated`
5. Guarda y copia el **Webhook Secret** generado
6. Agrégalo a `.env.local`:
   ```env
   CULQI_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Paso 6: Reiniciar Servidor (1 min)
```bash
# Detener servidor actual (Ctrl+C)
# Borrar cache
Remove-Item -Recurse -Force .next

# Iniciar de nuevo
npm run dev
```

### Paso 7: Testing (10 min)
1. Ve a http://localhost:3000/subscription
2. Selecciona cualquier plan
3. Usa tarjeta de prueba de Culqi:
   ```
   Número: 4111 1111 1111 1111
   Expiry: 12/25
   CVV: 123
   Nombre: PRUEBA TEST
   ```
4. Click "Iniciar Prueba Gratuita"
5. Deberías ver en consola:
   ```
   ✅ Culqi.js cargado
   ✅ Culqi configurado correctamente
   📝 Creando customer en Culqi...
   ✅ Customer creado: cus_test_xxxxx
   💳 Guardando tarjeta en Culqi...
   ✅ Tarjeta guardada: card_test_xxxxx
   🔄 Creando suscripción en Culqi...
   ✅ Suscripción creada en Culqi: sub_test_xxxxx
   ✅ Suscripción completada exitosamente
   ```
6. Verifica que se creó en la base de datos:
   ```bash
   npm run db:studio
   # Ve a tabla "Subscription" y busca tu suscripción
   ```

---

## 🐛 Troubleshooting

### Error: "Culqi is not defined"
**Solución:** Recarga la página. El script de Culqi tarda unos segundos en cargar.

### Error: "Invalid API key"
**Solución:** Verifica que copiaste bien las claves en `.env.local` y reiniciaste el servidor.

### Error: "Plan not found"
**Solución:** Los IDs de planes en `CULQI_PLAN_IDS` no coinciden con los de Culqi Dashboard.

### Webhook no recibe eventos
**Soluciones:**
- Si estás en local, verifica que ngrok esté corriendo
- Verifica que la URL del webhook termine en `/api/webhooks/culqi`
- Revisa los logs en Dashboard Culqi → Webhooks → Ver Intentos

### "Token invalid or expired"
**Solución:** Los tokens de Culqi expiran en 5 minutos. Si el usuario tardó mucho, pedir que reintente.

---

## 📊 Monitoreo

### Ver transacciones en Culqi
1. **Dashboard → Transacciones**
2. Filtra por fecha
3. Revisa estado (exitosa/rechazada)

### Ver logs de webhooks
1. **Dashboard → Webhooks → Ver Detalles**
2. Click en webhook configurado
3. Ve sección "Eventos Recientes"
4. Revisa respuestas del servidor

### Ver en base de datos
```bash
# Abrir Prisma Studio
npm run db:studio

# O consultar directo
npx prisma studio
```

Tablas importantes:
- `Subscription` - Suscripciones activas
- `Payment` - Historial de pagos
- `User` - Estado de usuarios (accountStatus)

---

## 🎉 ¡Listo!

Una vez que todos los pasos funcionen con tarjetas de prueba:

### Para pasar a PRODUCCIÓN:
1. Obtén claves de producción: `pk_live_` y `sk_live_`
2. Actualiza `.env.local`:
   ```env
   NEXT_PUBLIC_CULQI_PUBLIC_KEY=pk_live_xxxxx
   CULQI_SECRET_KEY=sk_live_xxxxx
   NEXT_PUBLIC_CULQI_MODE=production
   ```
3. Crea planes nuevos en modo Producción (los de test no sirven)
4. Actualiza CULQI_PLAN_IDS con los nuevos IDs
5. Actualiza webhook a dominio real (no ngrok)
6. Reinicia servidor
7. Prueba con tarjeta real (haz un pago de S/. 1 para verificar)

---

## 📞 Soporte

Si algo no funciona:
1. Revisa logs en consola del navegador (F12)
2. Revisa logs del servidor (terminal donde corre npm run dev)
3. Revisa logs en Dashboard Culqi
4. Contacta soporte Culqi: soporte@culqi.com | WhatsApp: +51 993 684 599

---

**Tiempo total estimado: ~35 minutos** ⏱️

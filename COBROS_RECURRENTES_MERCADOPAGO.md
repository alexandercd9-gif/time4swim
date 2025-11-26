# 🔄 Sistema de Cobros Recurrentes con MercadoPago

## ✅ Lo que acabamos de implementar:

### 1. **Preapproval Plans** (Suscripciones Automáticas)
- 📍 Archivo: `src/app/api/subscription/create-mercadopago/route.ts`
- ✅ Crea una suscripción recurrente mensual en MercadoPago
- ✅ MercadoPago cobra automáticamente cada mes
- ✅ Maneja reintentos automáticos si falla el pago

### 2. **Webhook de MercadoPago**
- 📍 Archivo: `src/app/api/webhooks/mercadopago/route.ts`
- ✅ Recibe notificaciones de pagos aprobados/rechazados
- ✅ Actualiza automáticamente el estado de la suscripción
- ✅ Renueva el período cuando se recibe un pago
- ✅ Marca como PAST_DUE si el pago falla

### 3. **Cron Job de Verificación**
- 📍 Archivo: `src/app/api/cron/check-subscriptions/route.ts`
- ✅ Verifica diariamente suscripciones vencidas
- ✅ Suspende cuentas con pagos vencidos
- ✅ Cancela suscripciones con +7 días de impago

---

## 🚀 Configuración en Producción

### **Paso 1: Configurar Webhook en MercadoPago**

1. Ve a: https://www.mercadopago.com.pe/developers/panel/app/YOUR_APP/webhooks

2. Agrega una nueva URL de webhook:
   ```
   https://tudominio.com/api/webhooks/mercadopago
   ```

3. Selecciona los eventos:
   - ✅ `payment`
   - ✅ `subscription_authorized_payment`
   - ✅ `subscription_preapproval`

4. MercadoPago enviará notificaciones automáticamente

---

### **Paso 2: Configurar Cron Job (Opciones)**

#### **Opción A: Vercel Cron** (Recomendada si usas Vercel)

1. Crea archivo `vercel.json` en la raíz:
```json
{
  "crons": [{
    "path": "/api/cron/check-subscriptions",
    "schedule": "0 2 * * *"
  }]
}
```

2. El cron se ejecutará automáticamente cada día a las 2 AM

#### **Opción B: Servicio Externo** (Compatible con cualquier hosting)

Usa https://cron-job.org (gratis):

1. Registrate en cron-job.org
2. Crea un nuevo cron job:
   - **URL**: `https://tudominio.com/api/cron/check-subscriptions`
   - **Header**: `Authorization: Bearer TU_CRON_SECRET`
   - **Frecuencia**: Diaria a las 2 AM
   - **Timezone**: Lima/Peru America

#### **Opción C: GitHub Actions** (Si tu código está en GitHub)

Crea `.github/workflows/cron.yml`:
```yaml
name: Check Subscriptions
on:
  schedule:
    - cron: '0 7 * * *' # 2 AM Lima (UTC-5)
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cron
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://tudominio.com/api/cron/check-subscriptions
```

---

### **Paso 3: Variables de Entorno**

Agrega a tu `.env` de producción:

```env
# MercadoPago PRODUCCIÓN
MERCADOPAGO_ACCESS_TOKEN=APP_USR-NUEVA-CREDENCIAL-DE-PRODUCCION
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-TU-PUBLIC-KEY-PRODUCCION

# Seguridad del Cron
CRON_SECRET=TU_SECRET_SUPER_SEGURO_ALEATORIO

# URL de tu app
NEXT_PUBLIC_APP_URL=https://www.time4swim.com
```

---

## 🧪 Probar en Modo TEST

### **1. Crear suscripción de prueba:**
```bash
# Ya tienes esto configurado con las credenciales TEST
# Solo registra un usuario y suscríbete normalmente
```

### **2. Simular webhook de pago:**

Ejecuta esto en tu terminal para simular que MercadoPago envió una notificación de pago:

```bash
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": { "id": "PAYMENT_ID_DE_PRUEBA" }
  }'
```

### **3. Probar el cron job manualmente:**

```bash
curl -X GET http://localhost:3000/api/cron/check-subscriptions \
  -H "Authorization: Bearer dev-secret-change-in-production"
```

---

## 📊 Flujo Completo

```
┌─────────────────────────────────────────────────┐
│  Usuario se suscribe con tarjeta               │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  1. Se guarda tarjeta en MercadoPago            │
│  2. Se crea Preapproval Plan (suscripción)      │
│  3. Se guarda en DB con trial de 30 días        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  CADA MES (automático):                         │
│  MercadoPago cobra la tarjeta                   │
└─────────────────┬───────────────────────────────┘
                  │
          ┌───────┴───────┐
          ▼               ▼
     ✅ APROBADO     ❌ RECHAZADO
          │               │
          ▼               ▼
┌─────────────────┐ ┌─────────────────┐
│ Webhook recibe  │ │ Webhook recibe  │
│ notificación    │ │ notificación    │
│                 │ │                 │
│ • Renueva +30d  │ │ • Status:       │
│ • Guarda pago   │ │   PAST_DUE      │
│ • User: ACTIVE  │ │ • User: EXPIRED │
└─────────────────┘ └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Cron Job diario│
                    │  verifica       │
                    │                 │
                    │  +7 días? →     │
                    │  CANCELAR       │
                    └─────────────────┘
```

---

## ⚠️ IMPORTANTE - Antes de ir a producción:

1. ✅ **REGENERA tus credenciales de producción** que compartiste conmigo
2. ✅ Prueba TODO en modo TEST primero
3. ✅ Configura el webhook en MercadoPago
4. ✅ Configura el cron job (elige una opción)
5. ✅ Agrega monitoreo/logging (opcional aber errores)

---

## 🎯 Próximos pasos opcionales:

- [ ] Enviar emails cuando falla un pago
- [ ] Dashboard admin para ver pagos fallidos
- [ ] Permitir al usuario actualizar su tarjeta
- [ ] Agregar reintentos manuales de pago
- [ ] Métricas de pagos (tasa de éxito, MRR, churn)

---

## 📞 Soporte

- **MercadoPago Docs**: https://www.mercadopago.com.pe/developers/es/docs
- **Preapproval API**: https://www.mercadopago.com.pe/developers/es/reference/subscriptions/_preapproval/post
- **Webhooks**: https://www.mercadopago.com.pe/developers/es/docs/your-integrations/notifications/webhooks

---

**¡Todo listo para cobros recurrentes automáticos! 🎉**

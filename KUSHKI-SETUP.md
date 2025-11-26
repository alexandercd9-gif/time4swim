# 🚀 INTEGRACIÓN KUSHKI - INSTRUCCIONES

## 📋 Pasos para Completar la Integración

### **1. Registrarse en Kushki**
- Ve a: https://kushkipagos.com
- Crea una cuenta
- Selecciona **Perú** como país
- Completa el proceso de registro

---

### **2. Obtener Credenciales de Prueba**

1. Accede al **Dashboard de Kushki**
2. Ve a **"Configuración" → "Credenciales"**
3. **Activa el "Modo de Prueba"** (sandbox)
4. Copia estas credenciales:
   - **Public Merchant ID** (empieza con `10000...`)
   - **Private Merchant ID** (es más largo, empieza con `pm-...`)

---

### **3. Agregar Credenciales al Proyecto**

#### **Archivo: `.env.local`**
```bash
# Kushki Configuración (Modo de Prueba)
KUSHKI_PUBLIC_KEY=tu_public_merchant_id_aqui
KUSHKI_PRIVATE_KEY=tu_private_merchant_id_aqui
```

#### **Archivo: `.env.production`**
```bash
# Kushki Configuración (Producción)
KUSHKI_PUBLIC_KEY=tu_public_merchant_id_produccion
KUSHKI_PRIVATE_KEY=tu_private_merchant_id_produccion
```

---

### **4. Modificar el Frontend**

#### **Archivo: `src/app/subscription/page.tsx`**

**Busca estas líneas (aprox. línea 30-35):**
```typescript
const [selectedProcessor, setSelectedProcessor] = useState<string>('culqi');
```

**Cámbialo a:**
```typescript
const [selectedProcessor, setSelectedProcessor] = useState<string>('kushki');
```

---

**Busca estas líneas (aprox. línea 60-70):**
```typescript
const availableProcessors = [
  { id: 'culqi', name: 'Culqi', description: 'Tarjetas locales' },
  { id: 'mercadopago', name: 'MercadoPago', description: 'Tarjetas y métodos locales' }
];
```

**Cámbialo a:**
```typescript
const availableProcessors = [
  { id: 'kushki', name: 'Kushki', description: 'Pago seguro 100% protegido' }
];
```

---

**Busca la función `handlePayment` (aprox. línea 220-250):**
```typescript
const handlePayment = async () => {
  if (selectedProcessor === 'culqi') {
    // ... código culqi
  } else if (selectedProcessor === 'mercadopago') {
    // ... código mercadopago
  }
};
```

**Reemplázalo por:**
```typescript
const handlePayment = async () => {
  if (!selectedPlan) {
    setError('Por favor selecciona un plan');
    return;
  }

  setIsProcessing(true);
  setError(null);

  try {
    // Tokenizar tarjeta con Kushki
    const publicKey = process.env.NEXT_PUBLIC_KUSHKI_PUBLIC_KEY;
    
    if (!window.Kushki) {
      throw new Error('Kushki no está cargado');
    }

    const kushki = new window.Kushki({
      publicMerchantId: publicKey,
      inTestEnvironment: true  // Cambiar a false en producción
    });

    const [expMonth, expYear] = expiry.split('/');
    
    const callback = async (response: any) => {
      if (response.token) {
        console.log('✅ Token de Kushki obtenido:', response.token);
        
        // Crear suscripción en backend
        await createSubscriptionKushki(response.token);
      } else {
        console.error('❌ Error de Kushki:', response);
        setError(response.error?.message || 'Error al procesar la tarjeta');
        setIsProcessing(false);
      }
    };

    kushki.requestToken({
      amount: selectedPlanDetails?.price,
      currency: 'PEN',
      card: {
        name: cardName,
        number: cardNumber.replace(/\s/g, ''),
        cvc: cvv,
        expiryMonth: expMonth,
        expiryYear: `20${expYear}`
      }
    }, callback);

  } catch (error: any) {
    console.error('Error en pago:', error);
    setError(error.message || 'Error al procesar el pago');
    setIsProcessing(false);
  }
};

// Nueva función
const createSubscriptionKushki = async (kushkiToken: string) => {
  try {
    const response = await fetch('/api/subscription/create-kushki', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: selectedPlan,
        token: kushkiToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear la suscripción');
    }

    console.log('✅ Suscripción creada:', data);
    window.location.href = '/parents/cuenta?success=true';

  } catch (error: any) {
    console.error('Error creando suscripción:', error);
    setError(error.message || 'Error al completar la suscripción');
    setIsProcessing(false);
  }
};
```

---

### **5. Agregar Script de Kushki**

#### **En `src/app/subscription/page.tsx`**

**Busca al final del archivo donde está el Script de Culqi:**
```tsx
<Script
  src="https://checkout.culqi.com/js/v4"
  // ...
/>
```

**Reemplázalo o agrégalo:**
```tsx
<Script
  src="https://cdn.kushkipagos.com/kushki-checkout.js"
  strategy="afterInteractive"
  onLoad={() => {
    console.log('✅ Kushki.js cargado');
    setKushkiLoaded(true);
  }}
  onError={() => {
    console.error('❌ Error cargando Kushki.js');
    setError('Error al cargar el sistema de pagos. Recarga la página.');
  }}
/>
```

---

### **6. Agregar Tipos de TypeScript**

#### **Archivo: `src/types/kushki.d.ts` (crear nuevo)**
```typescript
declare global {
  interface Window {
    Kushki: any;
  }
}

export {};
```

---

### **7. Tarjetas de Prueba de Kushki**

Usa estas tarjetas en **modo de prueba**:

| Tarjeta | Número | CVV | Fecha | Resultado |
|---------|--------|-----|-------|-----------|
| **Visa Aprobada** | `4000100011112224` | `123` | `12/25` | ✅ Aprobada |
| **Mastercard Aprobada** | `5451951574925480` | `123` | `12/25` | ✅ Aprobada |
| **Visa Rechazada** | `4000200022223331` | `123` | `12/25` | ❌ Rechazada |

---

### **8. Reiniciar Servidor**

Después de agregar las credenciales:
```bash
# Detener el servidor (Ctrl+C)
npm run dev
```

---

### **9. Probar el Flujo Completo**

1. Ve a `http://localhost:3000/subscription`
2. Selecciona un plan
3. Ingresa datos de tarjeta de prueba
4. Haz clic en "Pagar"
5. Deberías ver:
   - ✅ Token de Kushki generado
   - ✅ Suscripción creada
   - ✅ Redirigido a `/parents/cuenta`

---

## ✅ Checklist de Verificación

- [ ] Credenciales de Kushki agregadas a `.env.local`
- [ ] `selectedProcessor` cambiado a `'kushki'`
- [ ] `availableProcessors` actualizado
- [ ] Función `handlePayment` reemplazada
- [ ] Script de Kushki agregado
- [ ] Servidor reiniciado
- [ ] Prueba con tarjeta de prueba exitosa

---

## 🐛 Problemas Comunes

### **Error: "Kushki is not defined"**
- **Solución:** Asegúrate de que el script de Kushki esté cargado antes de procesar el pago

### **Error: "Invalid credentials"**
- **Solución:** Verifica que las credenciales sean de **modo de prueba** (sandbox)

### **Error: "Invalid card number"**
- **Solución:** Usa una de las tarjetas de prueba listadas arriba

---

## 📞 Soporte

- **Documentación:** https://docs.kushkipagos.com
- **Dashboard:** https://console.kushkipagos.com
- **Soporte:** soporte@kushkipagos.com

---

**Última actualización:** 2025-11-24

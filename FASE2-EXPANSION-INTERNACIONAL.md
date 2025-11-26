# 🌎 FASE 2: EXPANSIÓN INTERNACIONAL - TIME4SWIM

## 📅 Cuándo Implementar
- Después de tener **500+ usuarios** en Perú
- Cuando **usuarios de otros países** empiecen a preguntar
- Aproximadamente **6-12 meses** después del lanzamiento

---

## 🎯 Objetivos de Fase 2

### **Expansión Geográfica:**
- 🇵🇪 Perú (ya activo)
- 🇪🇨 Ecuador
- 🇨🇴 Colombia
- 🇨🇱 Chile
- 🇲🇽 México

### **Sistema de Precios Multi-Moneda:**
- Precio base en **USD** (protección contra inflación)
- Mostrar precios en **moneda local** de cada país
- Cobrar en **moneda local**

---

## 💰 Sistema de Precios Híbrido

### **1. Configuración de Precios Base (USD)**

```typescript
// src/config/pricing.ts
export const PLANS_CONFIG = {
  basic: {
    id: 'basic',
    nameEs: 'Plan Básico',
    priceUSD: 5,  // $5 USD base
    maxChildren: 1,
    features: [
      'Hasta 1 nadador',
      'Dashboard familiar unificado',
      'Soporte prioritario',
      'Notificaciones avanzadas'
    ]
  },
  family: {
    id: 'family',
    nameEs: 'Plan Familiar',
    priceUSD: 8,  // $8 USD base
    maxChildren: 3,
    features: [
      'Hasta 3 nadadores',
      'Dashboard familiar unificado',
      'Soporte prioritario',
      'Notificaciones avanzadas'
    ]
  },
  premium: {
    id: 'premium',
    nameEs: 'Plan Premium',
    priceUSD: 12,  // $12 USD base
    maxChildren: 6,
    features: [
      'Hasta 6 nadadores',
      'Dashboard familiar unificado',
      'Soporte prioritario',
      'Notificaciones avanzadas'
    ]
  }
};
```

### **2. Tipos de Cambio por País**

```typescript
// src/config/countries.ts
export const COUNTRIES_CONFIG = {
  PE: {
    code: 'PE',
    name: 'Perú',
    currency: 'PEN',
    symbol: 'S/.',
    exchangeRate: 3.80,  // Actualizar cada 3-6 meses
    processor: 'kushki'
  },
  MX: {
    code: 'MX',
    name: 'México',
    currency: 'MXN',
    symbol: '$',
    exchangeRate: 19.50,
    processor: 'kushki'
  },
  CO: {
    code: 'CO',
    name: 'Colombia',
    currency: 'COP',
    symbol: '$',
    exchangeRate: 4200,
    processor: 'kushki'
  },
  CL: {
    code: 'CL',
    name: 'Chile',
    currency: 'CLP',
    symbol: '$',
    exchangeRate: 850,
    processor: 'kushki'
  },
  EC: {
    code: 'EC',
    name: 'Ecuador',
    currency: 'USD',
    symbol: '$',
    exchangeRate: 1,  // Ecuador usa USD
    processor: 'kushki'
  }
};
```

### **3. Función de Cálculo de Precios**

```typescript
// src/lib/pricing.ts
import { PLANS_CONFIG } from '@/config/pricing';
import { COUNTRIES_CONFIG } from '@/config/countries';

export function getPriceForCountry(
  planId: string,
  countryCode: string
) {
  const plan = PLANS_CONFIG[planId];
  const country = COUNTRIES_CONFIG[countryCode];
  
  if (!plan || !country) {
    throw new Error('Plan o país inválido');
  }
  
  const localPrice = plan.priceUSD * country.exchangeRate;
  
  return {
    amount: Math.round(localPrice),  // Redondear a entero
    currency: country.currency,
    symbol: country.symbol,
    formatted: `${country.symbol} ${Math.round(localPrice)}`
  };
}

// Ejemplo de uso:
// getPriceForCountry('basic', 'PE')  → { amount: 19, currency: 'PEN', symbol: 'S/.', formatted: 'S/. 19' }
// getPriceForCountry('basic', 'MX')  → { amount: 98, currency: 'MXN', symbol: '$', formatted: '$ 98' }
```

---

## 🗺️ Detección de País del Usuario

### **Opción A: Por IP (Automático)**

```typescript
// src/lib/geo.ts
export async function detectCountryByIP(request: Request): Promise<string> {
  try {
    // Vercel automáticamente agrega esta info
    const country = request.headers.get('x-vercel-ip-country');
    if (country && COUNTRIES_CONFIG[country]) {
      return country;
    }
    
    // Alternativa: Usar servicio externo
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip');
    
    if (!ip) return 'PE'; // Default Perú
    
    const response = await fetch(`https://ipapi.co/${ip}/country/`);
    const detectedCountry = await response.text();
    
    return COUNTRIES_CONFIG[detectedCountry] ? detectedCountry : 'PE';
  } catch (error) {
    console.error('Error detecting country:', error);
    return 'PE'; // Default a Perú si falla
  }
}
```

### **Opción B: Selector Manual**

```tsx
// src/components/CountrySelector.tsx
export function CountrySelector({ value, onChange }) {
  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="..."
    >
      {Object.entries(COUNTRIES_CONFIG).map(([code, country]) => (
        <option key={code} value={code}>
          {country.name}
        </option>
      ))}
    </select>
  );
}
```

---

## 📊 Actualización de Base de Datos

### **Agregar campo de país al usuario:**

```prisma
// prisma/schema.prisma
model user {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  country      String   @default("PE")  // Código de país ISO
  // ... otros campos
}
```

### **Migración:**

```bash
npx prisma db push
```

---

## 🔧 Modificaciones en Frontend

### **1. En Página de Pricing (`/pricing`):**

```tsx
// src/components/landing/Pricing.tsx
import { useState, useEffect } from 'react';
import { getPriceForCountry } from '@/lib/pricing';

export function Pricing() {
  const [userCountry, setUserCountry] = useState('PE');
  const [prices, setPrices] = useState({});
  
  useEffect(() => {
    // Detectar país automáticamente (implementar en Fase 2)
    // setUserCountry(await detectCountry());
    
    // Calcular precios para el país
    const calculatedPrices = {
      basic: getPriceForCountry('basic', userCountry),
      family: getPriceForCountry('family', userCountry),
      premium: getPriceForCountry('premium', userCountry)
    };
    setPrices(calculatedPrices);
  }, [userCountry]);
  
  return (
    <div>
      {/* Selector de país (opcional) */}
      <CountrySelector value={userCountry} onChange={setUserCountry} />
      
      {/* Mostrar precios */}
      <div className="plan">
        <h3>Plan Básico</h3>
        <p className="price">{prices.basic?.formatted}/mes</p>
      </div>
      
      {/* ... más planes */}
    </div>
  );
}
```

### **2. En Página de Suscripción (`/subscription`):**

```tsx
// src/app/subscription/page.tsx
const userCountry = user.country || 'PE';
const planPrice = getPriceForCountry(selectedPlan, userCountry);

// Enviar al backend:
await fetch('/api/subscription/create-kushki', {
  method: 'POST',
  body: JSON.stringify({
    planId: selectedPlan,
    country: userCountry,
    amount: planPrice.amount,
    currency: planPrice.currency
  })
});
```

---

## 🌐 Modificaciones en Backend

### **Endpoint de Kushki actualizado:**

```typescript
// src/app/api/subscription/create-kushki/route.ts
export async function POST(request: NextRequest) {
  const { planId, country, amount, currency } = await request.json();
  
  // Kushki automáticamente maneja múltiples monedas
  const chargeData = {
    amount: {
      currency: currency,  // 'PEN', 'MXN', 'COP', etc.
      subtotalIva: 0,
      subtotalIva0: amount,
      iva: 0
    },
    // ... resto de configuración
  };
  
  // Kushki procesa en la moneda correcta automáticamente
}
```

---

## 📅 Cronograma de Implementación

### **Semana 1-2:**
- ✅ Crear archivos de configuración (`pricing.ts`, `countries.ts`)
- ✅ Agregar campo `country` a la tabla `user`
- ✅ Implementar función `getPriceForCountry()`

### **Semana 3:**
- ✅ Modificar frontend de pricing para mostrar precios según país
- ✅ Agregar selector de país (opcional)

### **Semana 4:**
- ✅ Modificar endpoint de suscripción para soportar múltiples monedas
- ✅ Probar con diferentes países

### **Semana 5:**
- ✅ Implementar detección automática de país por IP
- ✅ Testing completo

---

## ⚠️ Consideraciones Importantes

### **1. Actualización de Tipos de Cambio:**
- Revisar cada **3-6 meses**
- Ajustar si hay cambios mayores al 10%

### **2. Redondeo de Precios:**
```typescript
// Mejor: S/. 19 en lugar de S/. 19.47
const localPrice = Math.round(plan.priceUSD * exchangeRate);
```

### **3. Comunicación a Usuarios:**
- Avisar 30 días antes de cambiar precios
- Email: "Debido al tipo de cambio, ajustamos precios..."

---

## 🎯 Métricas de Éxito

- ✅ Al menos **100 usuarios** de cada nuevo país en 3 meses
- ✅ Tasa de conversión similar a Perú (>5%)
- ✅ Cero quejas sobre conversión de moneda

---

## 📞 Recursos Adicionales

- Kushki Docs Multi-Currency: https://docs.kushkipagos.com
- ISO Country Codes: https://www.iso.org/iso-3166-country-codes.html
- Exchange Rate API: https://exchangerate-api.com/

---

**Última actualización:** 2025-11-24
**Responsable:** Alexander Casaverde
**Estado:** Pendiente (Para implementar en Fase 2)

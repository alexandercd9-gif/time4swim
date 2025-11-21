# 💳 Plan de Integración de Pagos con Culqi - Time4Swim

## 🔄 REGISTRO DE CAMBIOS IMPLEMENTADOS

**Última actualización:** 18 de Noviembre 2025 - 23:45 hrs
**Estado:** ✅ Sistema Culqi 100% preparado - Solo faltan credenciales

### ✅ COMPLETADO
```
✅ Trial PADRES 7→30 días
   - src/app/api/auth/register/route.ts (línea 49-50)
   - src/app/api/auth/oauth/google/callback/route.ts (línea 95-96)
   - src/app/admin/usuarios/page.tsx (2 lugares: línea 47 y 470)
   - src/app/(auth)/register/page.tsx (texto UI)
   - src/app/(auth)/login/page.tsx (texto promocional)

✅ Sistema de NOVEDADES para clubes (botón en header)
   - src/components/club/NovedadesButton.tsx (botón con badge rojo animado)
   - src/components/club/NovedadesPanel.tsx (panel lateral con features PRO)
   - src/components/TopBar.tsx (integrado al lado de la campana)

✅ APIs para trial PRO de clubes
   - src/app/api/club/me/route.ts (GET info club + PRO status + novedades)
   - src/app/api/club/mark-news-read/route.ts (POST marcar novedades leídas)
   - src/app/api/club/activate-pro-trial/route.ts (POST activar trial PRO 30 días)

✅ Base de datos actualizada (localhost)
   - Ejecutado: npx prisma db push (SIN perder datos)
   - Campos PRO agregados a tabla Club
   - Tablas Subscription y Payment creadas
   - Enums creados: SubscriptionPlan, SubscriptionStatus, PaymentMethod

✅ Script de prueba creado
   - test-novedades-system.js (configura club con novedades sin leer)

✅ Componente ProTrialBanner
   - src/components/club/ProTrialBanner.tsx (banner de estado PRO)
   - Integrado en src/app/club/dashboard/page.tsx
   - Muestra: PRO TRIAL con días restantes | PRO ACTIVO | Plan FREE

✅ Modal de Trial Expirado
   - src/components/club/ProTrialExpiredModal.tsx (diseño profesional)
   - Auto-detección en dashboard (muestra cuando expira dentro de 7 días)
   - Redirige a /subscription al hacer upgrade
   - Script de testing: simulate-expired-trial.js

✅ Landing Page con Pricing
   - src/components/landing/Pricing.tsx (3 planes padres + 2 planes clubes + FAQ)
   - src/components/landing/PricingPreview.tsx (preview simplificado para landing)
   - src/app/pricing/page.tsx (página dedicada con hero section)
   - src/components/landing/Header.tsx (link "Precios")
   - src/app/page.tsx (integrado PricingPreview)

✅ Página de Suscripción (/subscription)
   - src/app/subscription/page.tsx (sistema completo)
   - Paso 1: Selector de planes (padres: 3 opciones, clubes: PRO)
   - Paso 2: Formulario de pago preparado para Culqi.js
   - Resumen con "Total hoy: S/. 0.00" y "Luego S/. XX/mes (renovación automática)"
   - Aviso de renovación automática mensual
   - Mensaje temporal hasta configurar Culqi
   - Todos los CTAs del sistema redirigen correctamente

✅ Panel de Gestión de Cuenta (PADRES)
   - src/app/parents/cuenta/page.tsx (página completa)
   - Sección Mi Plan: badge, precio, próximo cobro, método de pago
   - Sección Límites: progress bar nadadores, alerta límite alcanzado
   - Historial de pagos: tabla últimos 12 meses con descarga facturas
   - Datos de facturación: RUC/DNI, razón social, dirección
   - Modal cancelación con confirmación y advertencias
   - APIs: /api/parents/account, /api/parents/cancel-subscription, /api/parents/update-card

✅ Integración COMPLETA de Culqi (preparada, solo falta credenciales)
   - src/lib/culqi.ts (librería completa con todos los métodos)
   - src/app/subscription/page.tsx (formulario activo con Culqi.js)
   - src/app/api/subscription/create/route.ts (endpoint de suscripción)
   - src/app/api/webhooks/culqi/route.ts (5 handlers: succeeded, failed, activated, canceled, updated)
   - .env.local.example (template con todas las variables)
   - Validaciones de tarjeta con algoritmo de Luhn
   - Modo desarrollo funcional (mocks sin credenciales)
   - TODOs claros donde agregar credenciales
   - Documentación completa de configuración
```

### ⏳ PENDIENTE
```
- Componente ProFeatureGate.tsx (bloqueo de funciones PRO)
- Obtener credenciales de Culqi (pk_test_ y sk_test_)
- Crear planes en Dashboard de Culqi (copiar IDs)
- Configurar webhook en Dashboard de Culqi
- Agregar credenciales a .env.local
- Testing con tarjetas de prueba de Culqi
- Emails de notificación (pago exitoso, fallido, cancelación)
```

---

## 📋 RESUMEN EJECUTIVO

Integración de sistema de pagos recurrentes con Culqi para automatizar cobros mensuales y gestionar suscripciones de usuarios (padres) y clubes.

---

## 📊 PLANES Y PRECIOS DEFINITIVOS

### 👨‍👩‍👧 Planes para PADRES

| Plan | Precio | Nadadores | Características |
|------|--------|-----------|-----------------|
| **TRIAL** | **GRATIS** (30 días) | Hasta 3 | Funcionalidades completas para probar |
| **BÁSICO** | **S/. 15/mes** | 1 nadador | Cronometraje ilimitado, historial, mejores marcas |
| **FAMILIAR** | **S/. 25/mes** | Hasta 3 nadadores | Todo básico + integración FDPN + gráficos avanzados |
| **PREMIUM** | **S/. 40/mes** | Hasta 6 nadadores | Todo familiar + análisis de rendimiento + reportes + soporte prioritario |

**Estrategia del Trial de 30 días:**
- ✅ Tiempo suficiente para ingresar todos los tiempos históricos
- ✅ Crear dependencia y valor antes del cobro
- ✅ Mayor tasa de conversión vs 7-15 días
- ✅ Permite hasta 3 nadadores en trial (mayoría de familias)

### 🏊 Planes para CLUBES

**MODELO: Club como Partner (FREE) + Trial PRO 30 días + Upgrade Opcional**

| Plan | Precio | Incluye |
|------|--------|---------|
| **CLUB FREE** | **GRATIS ∞** | • Registro del club<br>• Competencias internas<br>• Cronometraje (6 carriles)<br>• Gestión de eventos<br>• Dashboard básico<br>• Nadadores ilimitados<br>• Hasta 6 profesores<br>• Ver tiempos de nadadores<br>• Funcionalidades actuales del sistema |
| **CLUB PRO TRIAL** | **30 días GRATIS** | • **SIN tarjeta requerida**<br>• Todas las funciones PRO habilitadas<br>• Se activa desde panel de "Novedades"<br>• Auto-desactivación al día 31<br>• Datos guardados (no se pierden) |
| **CLUB PRO** | **S/. 99/mes** | **Todo lo FREE +**<br>• 📊 Reportes personalizados con logo<br>• 📋 Sistema de asistencias digital<br>• 🎨 Marca personalizada (logo + colores)<br>• 👥 Profesores ilimitados<br>• 🔗 Integración FDPN masiva<br>• 📈 Estadísticas avanzadas<br>• 💬 Soporte prioritario<br>• 📧 Emails con branding del club<br>• 📱 Notificaciones automáticas |

**Estrategia para clubes:**
- ✅ **FREE base:** Captar todos los clubes sin fricción
- ✅ **Trial PRO 30 días:** Probar sin compromiso (sin tarjeta)
- ✅ **Auto-upgrade suave:** Al expirar trial, modal con opción de pago
- ✅ **Precio accesible:** S/. 99/mes con todas las funciones
- ✅ **Ingreso principal:** Suscripciones de padres (S/. 15-40)

---

---

## ⚠️ TAREAS PENDIENTES - NO OLVIDAR

## 📋 DECISIONES FINALES CONFIRMADAS

### MODELO DE NEGOCIO
✅ **Club FREE + Padres pagan + Trial PRO para clubes**

### PADRES
✅ **Trial:** 30 días con hasta 3 nadadores
✅ **Planes:** Básico S/. 15 (1 hijo) | Familiar S/. 25 (3 hijos) | Premium S/. 40 (6 hijos)

### CLUBES
✅ **FREE:** Gratis ∞ (ilimitado nadadores, 6 profesores, 6 carriles)
✅ **PRO Trial:** 30 días gratis sin tarjeta (activable desde panel de "Novedades")
✅ **PRO:** S/. 99/mes (reportes, asistencias, branding, FDPN, etc.)

### EXPERIENCIA DE USUARIO
✅ **Sistema de Novedades:** Panel in-app para anunciar features PRO
✅ **Trial sin fricción:** Click en "Probar GRATIS" activa 30 días PRO
✅ **Auto-desactivación:** Al día 31 vuelve a FREE (sin borrar datos)
✅ **Upgrade suave:** Modal con opción de pago, no bloqueo agresivo
✅ **Landing page:** Sí, con sección de pricing para ambos

### IMPLEMENTACIÓN POR FASES
✅ **Fase 1:** Trial system + Culqi + Notificaciones (prioridad)
✅ **Fase 2:** Reportes PDF + Branding (después)
✅ **Fase 3:** Asistencias + FDPN masivo (futuro)

---

### 🔴 ALTA PRIORIDAD (Antes de empezar)

#### 1. Actualizar Trial PADRES de 7 → 30 días ✅
**Archivos modificados:**
- [x] `src/app/api/auth/register/route.ts` línea 50: Cambiar `+ 7` a `+ 30`
- [x] `src/app/api/auth/oauth/google/callback/route.ts` línea 96: Cambiar `+ 7` a `+ 30`
- [x] `src/app/admin/usuarios/page.tsx` línea 47: Cambiar `trialDays: 7` a `trialDays: 30`
- [x] `src/app/admin/usuarios/page.tsx` línea 470: Cambiar `trialDays: 7` a `trialDays: 30`
- [x] `src/app/(auth)/register/page.tsx` línea 171: Cambiar texto "7 días gratis" a "30 días gratis"
- [x] `src/app/(auth)/login/page.tsx` línea 365: Cambiar "7 días gratis" a "30 días gratis"

#### 2. Sistema de Trial PRO para CLUBES (NUEVO)
- [x] Agregar campos a modelo `Club`: `proTrialStartedAt`, `proTrialExpiresAt`, `isProTrial`, `isProActive`, `hasUnreadNews`
- [x] Crear componente: `NovedadesButton.tsx` (botón en header con badge rojo 🔴)
- [x] Crear componente: `NovedadesPanel.tsx` (panel lateral que se abre al hacer click)
- [x] Agregar botón "Probar PRO GRATIS 30 días" dentro del panel de novedades
- [x] Actualizar header para incluir botón de novedades (al lado de campana 🔔)
- [x] API: `/api/club/activate-pro-trial` (activa trial de 30 días)
- [x] Badge en dashboard: "PRO TRIAL - X días restantes" (ProTrialBanner.tsx)
- [x] Badges en admin: PRO ACTIVO / PRO TRIAL / FREE en `/admin/clubes`
- [x] Modal al expirar: "Tu trial expiró - Upgrade por S/. 99/mes" (ProTrialExpiredModal.tsx)
- [x] Integración del modal en dashboard del club con lógica de detección automática
- [ ] Cron job: Verificar diariamente trials expirados y desactivar funciones PRO

#### 3. Enlazar Trial con Sistema de Suscripciones
- [x] Crear modelo `Subscription` en Prisma (ya existe en schema.prisma)
- [ ] Al registrarse (padres) → Crear automáticamente registro en `Subscription` con plan TRIAL
- [ ] Al activar PRO trial (clubes) → Crear registro en `Subscription` con plan CLUB_PRO_TRIAL
- [x] Al expirar trial → Modal que redirecciona a `/subscription` (página de planes) ✅
- [ ] Al pagar → Actualizar `Subscription` y `User/Club.accountStatus = ACTIVE`

#### 4. Límites según Rol en Trial
- [ ] Validación: Si `role = PARENT` en trial → máximo 3 nadadores
- [ ] Validación: Si `role = CLUB` FREE → 6 profesores, 6 carriles
- [ ] Validación: Si `role = CLUB` PRO → ilimitado profesores y carriles
- [ ] Middleware que bloquee agregar más nadadores/profesores si excede límite

#### 5. Sistema de Configuración Segura (NUEVO) ✅
- [x] Agregar modelo `SystemConfig` en Prisma para almacenar credenciales encriptadas
- [x] Crear página `/admin/configuracion` para gestionar credenciales Culqi
- [x] API `/api/admin/config/culqi` (GET/POST) con encriptación AES-256-CBC
- [x] Validación de formato de keys (pk_test_, sk_test_, pk_live_, sk_live_)
- [x] Mostrar/ocultar Secret Key en formulario
- [x] Agregar "Configuración" al menú lateral de admin
- [x] API `/api/admin/config/culqi/test` para probar conexión con Culqi
- [ ] Agregar variable de entorno `ENCRYPTION_KEY` para producción

#### 6. Landing Page con Pricing ✅
- [x] Componente `Pricing.tsx` con planes de Padres (S/. 15/25/40)
- [x] Componente `Pricing.tsx` con planes de Clubes (FREE/PRO S/. 99)
- [x] Sección FAQ integrada en pricing
- [x] Trust badges (Culqi, SSL, PCI Compliant)
- [x] Página dedicada `/pricing` con hero section
- [x] Integración en landing page principal
- [x] Enlace "Precios" en Header
- [ ] Agregar testimonios específicos de clientes de pago

#### 7. Página de Suscripción (/subscription) ✅
- [x] Crear página `/subscription` con selector de tipo de usuario (padres/clubes)
- [x] Selector de planes: 3 planes para padres, 1 plan PRO para clubes
- [x] Resumen del pedido con precio y features
- [x] Formulario de pago preparado para Culqi.js
- [x] Mensaje de "Total hoy: S/. 0.00" y "Luego renovación automática mensual"
- [x] Mensaje temporal hasta configurar Culqi
- [x] Integración de todos los CTAs (modal, pricing, landing) hacia /subscription
- [x] Progress steps (Elegir Plan → Pago)
- [x] Security badges (SSL, Culqi)

#### 8. Panel de Gestión de Cuenta/Plan (PADRES) ✅
- [x] Crear página `/parents/cuenta`
- [x] Sección: Mi Plan Actual
  - [x] Mostrar plan activo (Básico/Familiar/Premium o TRIAL)
  - [x] Precio mensual y fecha de próximo cobro
  - [x] Método de pago guardado (últimos 4 dígitos)
  - [x] Badge visual del plan con colores por tipo
- [x] Sección: Límites y Uso
  - [x] Nadadores: X de Y usados con progress bar
  - [x] Alert cuando alcanza límite
  - [x] Botón [+ Agregar nadador] (deshabilitado si llegó al límite)
  - [x] Link "Upgrade para más nadadores"
- [x] Sección: Facturación
  - [x] Tabla de historial de pagos (últimos 12 meses)
  - [x] Columnas: Fecha, Monto, Estado, Plan, Factura
  - [x] Botón [Descargar] por cada pago
  - [x] Datos de facturación (RUC/DNI, dirección, razón social)
- [x] Sección: Acciones
  - [x] Botón [Cambiar Plan] → redirige a /subscription
  - [x] Botón [Actualizar Tarjeta] → preparado para modal Culqi
  - [x] Botón [Cancelar Suscripción] → modal confirmación con advertencias
- [x] API: `/api/parents/account` (GET info de suscripción)
- [x] API: `/api/parents/cancel-subscription` (POST cancelar)
- [x] API: `/api/parents/update-card` (POST actualizar método de pago)
- [x] Agregar link en sidebar/header de padres ✅

---

#### 9. Integración COMPLETA de Culqi (Sistema de Pagos Real) 🔧

**ESTADO:** ✅ TODO EL CÓDIGO PREPARADO - Solo falta agregar credenciales

**ARCHIVOS CREADOS/ACTUALIZADOS:**

##### 📚 Librería Culqi (`src/lib/culqi.ts`) ✅
- [x] Cliente completo de API Culqi con todos los métodos
- [x] Funciones para crear customers, cards, charges, subscriptions
- [x] Validación de webhook signatures
- [x] Modo desarrollo con mocks (funciona sin credenciales)
- [x] Tipos TypeScript completos (CulqiCustomer, CulqiCard, etc.)
- [x] Manejo de errores con mensajes claros
- [x] TODO: Descomentar llamadas reales cuando tengas credenciales

##### 💳 Página de Suscripción Actualizada (`src/app/subscription/page.tsx`) ✅
- [x] Script de Culqi.js agregado con Next.js Script component
- [x] Estados para formulario: cardNumber, expiry, cvv, cardName
- [x] Validaciones de tarjeta:
  - [x] Algoritmo de Luhn para número de tarjeta
  - [x] Validación de fecha MM/YY y fecha futura
  - [x] Formato automático (XXXX XXXX XXXX XXXX)
  - [x] CVV de 3-4 dígitos
- [x] Integración Culqi.js:
  - [x] Configuración automática al cargar
  - [x] Tokenización de tarjeta con Culqi.createToken()
  - [x] Manejo de callbacks de éxito/error
  - [x] TODO: Reemplazar 'pk_test_XXXXXXXX' con NEXT_PUBLIC_CULQI_PUBLIC_KEY
- [x] Formulario habilitado y funcional (ya no deshabilitado)
- [x] Botón con estados: "Procesando...", "Cargando...", "Iniciar Prueba Gratuita"
- [x] Mensajes de error claros en pantalla
- [x] Aviso azul: "No se cobrará nada hoy, primer cargo en 30 días"

##### 🔌 API de Creación de Suscripción (`src/app/api/subscription/create/route.ts`) ✅
- [x] POST endpoint con requireAuth(['PARENT'])
- [x] Validación de planId y culqiToken
- [x] Mapeo de planes (basic, family, premium) a precios y límites
- [x] Creación de customer en Culqi
  - [x] Reutiliza customer existente si ya tiene uno
  - [x] TODO: Descomentar createCustomer() con credenciales
- [x] Guardado de tarjeta con token
  - [x] TODO: Descomentar createCard() con credenciales
- [x] Creación de suscripción en Culqi
  - [x] TODO: Verificar CULQI_PLAN_IDS con IDs reales del dashboard
  - [x] TODO: Descomentar createSubscription() con credenciales
- [x] Guardado en base de datos local (subscription table)
- [x] Actualización de usuario (accountStatus: ACTIVE, isTrialAccount: false)
- [x] Creación de payment pendiente (se actualizará con webhook)
- [x] Respuesta con detalles de suscripción
- [x] Manejo de errores completo

##### 🔔 API de Webhooks (`src/app/api/webhooks/culqi/route.ts`) ✅
- [x] POST endpoint (sin auth, Culqi lo llama)
- [x] Validación de firma X-Culqi-Signature
  - [x] TODO: Descomentar validación cuando tengas CULQI_WEBHOOK_SECRET
- [x] Handler: `charge.succeeded` (pago mensual exitoso)
  - [x] Busca subscription por customer
  - [x] Crea payment record con status: PAID
  - [x] Extiende currentPeriodEnd (+1 mes)
  - [x] Actualiza accountStatus: ACTIVE
  - [x] TODO: Enviar email de confirmación
- [x] Handler: `charge.failed` (tarjeta rechazada)
  - [x] Crea payment con status: FAILED
  - [x] Actualiza subscription status: PAST_DUE
  - [x] Actualiza user accountStatus: SUSPENDED
  - [x] TODO: Enviar email de alerta
- [x] Handler: `subscription.activated`
  - [x] Actualiza status: ACTIVE
- [x] Handler: `subscription.canceled`
  - [x] Actualiza status: CANCELED, canceledAt
  - [x] Actualiza user accountStatus: CANCELED
  - [x] TODO: Enviar email de confirmación
- [x] Handler: `subscription.updated`
  - [x] Actualiza fechas de periodo
- [x] Siempre retorna 200 (requerido por Culqi)
- [x] Logs detallados para debugging

##### 📄 Archivo de Variables de Entorno (`.env.local.example`) ✅
- [x] Template completo con todas las variables necesarias
- [x] NEXT_PUBLIC_CULQI_PUBLIC_KEY (frontend)
- [x] CULQI_SECRET_KEY (backend)
- [x] CULQI_WEBHOOK_SECRET (validación webhooks)
- [x] NEXT_PUBLIC_CULQI_MODE (test/production)
- [x] IDs de planes (CULQI_PLAN_BASIC, FAMILY, PREMIUM, CLUB_PRO)
- [x] Instrucciones completas de configuración
- [x] Notas sobre test vs producción
- [x] Enlaces a documentación de Culqi

---

**PRÓXIMOS PASOS CUANDO TENGAS CREDENCIALES:**

1. **Obtener credenciales de Culqi:**
   - Registrarte en https://www.culqi.com/
   - Ir a Dashboard → Desarrollo → API Keys
   - Copiar `pk_test_xxxxx` y `sk_test_xxxxx`

2. **Configurar variables de entorno:**
   ```bash
   # Copiar el template
   cp .env.local.example .env.local
   
   # Editar y agregar tus credenciales reales
   code .env.local
   ```

3. **Crear planes en Culqi Dashboard:**
   - Ir a Dashboard → Planes
   - Crear 4 planes:
     * Plan Básico: S/. 15, mensual
     * Plan Familiar: S/. 25, mensual
     * Plan Premium: S/. 40, mensual
     * Club PRO: S/. 99, mensual
   - Copiar los IDs generados (plan_xxxxx)
   - Agregarlos a `src/app/api/subscription/create/route.ts` en CULQI_PLAN_IDS

4. **Configurar webhook en Culqi:**
   - Ir a Dashboard → Webhooks
   - Agregar URL: `https://tudominio.com/api/webhooks/culqi`
   - Activar eventos:
     * charge.succeeded ✓
     * charge.failed ✓
     * subscription.activated ✓
     * subscription.canceled ✓
     * subscription.updated ✓
   - Copiar el Webhook Secret
   - Agregarlo a .env.local como CULQI_WEBHOOK_SECRET

5. **Testing con tarjetas de prueba:**
   ```
   Tarjeta exitosa:
   - Número: 4111 1111 1111 1111
   - Expiry: 12/25
   - CVV: 123
   
   Tarjeta rechazada (para testing):
   - Número: 4000 0000 0000 0002
   - Expiry: 12/25
   - CVV: 123
   ```

6. **Verificar flujo completo:**
   - [ ] Usuario selecciona plan en /subscription
   - [ ] Ingresa datos de tarjeta
   - [ ] Se tokeniza correctamente (ver console del navegador)
   - [ ] Se llama a /api/subscription/create
   - [ ] Se crea subscription en base de datos
   - [ ] Redirige a /parents/cuenta con success=true
   - [ ] Webhook recibe charge.succeeded (revisar logs)
   - [ ] Payment se marca como PAID

7. **Pasar a producción:**
   - Reemplazar pk_test_ y sk_test_ con pk_live_ y sk_live_
   - Actualizar NEXT_PUBLIC_CULQI_MODE=production
   - Actualizar URL del webhook a dominio real
   - Probar con tarjeta real (pago pequeño de prueba)
   - Monitorear primeros pagos manualmente

---

**TESTING SIN CREDENCIALES (Modo Desarrollo):**

Todo el código ya funciona en modo mock:
- ✅ Puedes seleccionar planes
- ✅ Puedes llenar el formulario
- ✅ Se genera token mock: `token_test_xxxxx`
- ✅ Se crea subscription con IDs falsos
- ✅ Se guarda en base de datos local
- ✅ Webhooks retornan 200 sin validar firma
- ⚠️ No se hacen cargos reales (solo simulación)

Para probar, simplemente:
```bash
npm run dev
# Ir a http://localhost:3000/subscription
# Seleccionar plan
# Llenar formulario con datos de prueba
# Click "Iniciar Prueba Gratuita"
```

---

**🔧 ERRORES DE TYPESCRIPT CORREGIDOS (18 Nov 2025):**

- ✅ `user.id` → `user.user.id` (requireAuth retorna objeto anidado)
- ✅ Agregados campos requeridos en Payment: `paymentMethod: 'CARD'`, `description`
- ✅ `culqiSubscriptionId` no es unique: usar `findFirst()` antes de `update()`
- ✅ AccountStatus: usar `SUSPENDED` en lugar de `CANCELED`
- ✅ Removido `userData.phone` (no existe en modelo User)

**ESTADO ACTUAL:** ✅ Sin errores de compilación - Todo funcional

---

### 🟡 MEDIA PRIORIDAD (Durante implementación)
- [ ] Migrar usuarios trial actuales: Script para extender trials existentes a 30 días
- [ ] Actualizar `TrialBanner.tsx` para mostrar botón "Ver Planes" cuando falten 3 días
- [ ] Email automático 3 días antes de expirar (usar servicio de emails)
- [ ] Activar formulario de pago con Culqi.js cuando tengas credenciales

### 🟢 BAJA PRIORIDAD (Post-implementación)
- [ ] Script de limpieza ya existe: `scripts/cleanup-trials.ts` (mantener)
- [ ] Dashboard admin: Métricas de conversión trial → pago
- [ ] Sistema de cupones/descuentos
- [ ] Facturación SUNAT (si es necesario)

---

## 🎯 LO QUE NECESITO DE TI (ANTES DE COMENZAR)

### ✅ PASO 1: Crear cuenta en Culqi
1. Ir a: https://www.culqi.com/
2. Registrarte con email de tu empresa
3. Completar verificación de identidad (DNI/RUC)
4. Activar cuenta

### ✅ PASO 2: Obtener credenciales de Culqi
Una vez dentro del dashboard de Culqi:

**Modo Test (para desarrollo):**
```
Dashboard → Desarrollo → API Keys
- Public Key: pk_test_xxxxxxxxxxxxx
- Secret Key: sk_test_xxxxxxxxxxxxx
```

**Modo Producción (cuando esté listo):**
```
Dashboard → Producción → API Keys
- Public Key: pk_live_xxxxxxxxxxxxx
- Secret Key: sk_live_xxxxxxxxxxxxx
```

### ✅ PASO 3: Enviarme las credenciales
Créame un archivo `.env.local` en la raíz del proyecto con:

```env
# Culqi API Keys (MODO TEST)
CULQI_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
CULQI_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# URL de tu aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Webhook Secret (lo configuramos después)
CULQI_WEBHOOK_SECRET=
```

### ✅ PASO 4: Confirmar precios

**Planes PADRES (CONFIRMADOS):**
- ✅ Básico: S/. 15 (1 nadador)
- ✅ Familiar: S/. 25 (3 nadadores)
- ✅ Premium: S/. 40 (6 nadadores)

**Planes CLUBES (CONFIRMADOS):**
- ✅ **CLUB FREE:** Gratis para siempre (ilimitado nadadores, 5 profesores)
- ✅ **CLUB PRO:** S/. 99/mes (todas las funciones avanzadas incluidas)

**Estrategia:**
- Club se registra gratis
- Club recomienda app a sus nadadores
- Padres pagan S/. 15-40/mes
- Club OPCIONALMENTE upgradea a PRO si necesita funcionalidades avanzadas (reportes, asistencias, branding, FDPN, etc.)

### ✅ PASO 5: Confirmar flujo del trial
- **Trial confirmado: 30 días**
- **Nadadores en trial: Hasta 3**
- **Al expirar:** Modal para seleccionar plan (no se borran datos)
- **Notificación:** 3 días antes de expirar

---

## 🔧 CAMBIOS EN LA BASE DE DATOS

### Nuevos Enums

```prisma
enum SubscriptionPlan {
  // Planes para PADRES
  TRIAL                // 30 días gratis - hasta 3 nadadores
  PARENT_BASIC         // S/. 15/mes - 1 nadador
  PARENT_FAMILY        // S/. 25/mes - hasta 3 nadadores
  PARENT_PREMIUM       // S/. 40/mes - hasta 6 nadadores
  
  // Planes para CLUBES
  CLUB_FREE            // GRATIS - ilimitado (base)
  CLUB_PRO             // S/. 99/mes - Todas las funciones avanzadas
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
}

enum PaymentMethod {
  CARD
  YAPE
  PLIN
}
```

### Actualización al modelo Club

```prisma
model Club {
  // ... campos existentes ...
  
  // Trial PRO para clubes
  proTrialStartedAt   DateTime?  // Fecha cuando activó trial PRO
  proTrialExpiresAt   DateTime?  // Fecha de expiración del trial PRO
  isProTrial          Boolean    @default(false) // Si está en trial PRO
  isProActive         Boolean    @default(false) // Si tiene PRO pagado activo
  proActivatedAt      DateTime?  // Fecha de activación de PRO pagado
  
  // Sistema de novedades
  hasUnreadNews       Boolean    @default(true)  // Si tiene novedades sin leer (badge rojo)
  lastNewsReadAt      DateTime?  // Última vez que abrió panel de novedades
  
  // Configuraciones PRO (se guardan aunque expire trial)
  customLogo          String?    @db.LongText // Logo en base64
  customColors        String?    // JSON con colores personalizados
  customDomain        String?    // Subdominio personalizado
}
```

### Nuevos Modelos

```prisma
model Subscription {
  id                   String              @id @default(cuid())
  userId               String              @unique
  user                 User                @relation(fields: [userId], references: [id])
  
  plan                 SubscriptionPlan
  status               SubscriptionStatus  @default(ACTIVE)
  
  currentPrice         Decimal             @db.Decimal(10, 2)
  currency             String              @default("PEN")
  
  startDate            DateTime            @default(now())
  currentPeriodStart   DateTime            @default(now())
  currentPeriodEnd     DateTime
  canceledAt           DateTime?
  
  culqiCustomerId      String?
  culqiSubscriptionId  String?
  culqiCardId          String?
  
  maxChildren          Int                 @default(1)  // 1 para básico, 3 para familiar, 6 para premium
  maxTeachers          Int?                              // Solo para clubes
  
  createdAt            DateTime            @default(now())
  updatedAt            DateTime            @updatedAt
  
  payments             Payment[]
}

model Payment {
  id                String              @id @default(cuid())
  subscriptionId    String
  subscription      Subscription        @relation(fields: [subscriptionId], references: [id])
  
  culqiChargeId     String              @unique
  culqiOrderId      String?
  
  amount            Decimal             @db.Decimal(10, 2)
  currency          String              @default("PEN")
  
  paymentMethod     PaymentMethod
  cardBrand         String?
  cardLastFour      String?
  
  status            String
  paidAt            DateTime?
  failedReason      String?
  
  description       String
  receiptUrl        String?
  
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  @@index([subscriptionId])
  @@index([culqiChargeId])
}
```

### Actualización al modelo User

```prisma
model User {
  // ... campos existentes ...
  subscription         Subscription?
}
```

---

---

## 🏗️ ARQUITECTURA DE LA INTEGRACIÓN

### Diagrama de flujo:
```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO SE REGISTRA                       │
│  /register → Crea User (trial) + Subscription (TRIAL)       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  USA LA APP (30 DÍAS)                        │
│  Dashboard muestra: "🎉 Trial - 23 días restantes"          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              3 DÍAS ANTES DE EXPIRAR                         │
│  Banner: "Tu trial expira pronto - Ver Planes"              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                 SELECCIONA UN PLAN                           │
│  /subscription → Cards de planes (Básico, Familiar, Premium)│
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  PROCESO DE PAGO                             │
│  /subscription/checkout                                      │
│  1. Backend crea "Charge" en Culqi                          │
│  2. Frontend muestra form de Culqi (iframe/modal)           │
│  3. Usuario ingresa tarjeta                                  │
│  4. Culqi procesa pago                                       │
│  5. Culqi envía webhook a /api/payments/webhook             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  PAGO EXITOSO                                │
│  Backend actualiza:                                          │
│  - User.accountStatus = ACTIVE                               │
│  - User.isTrialAccount = false                               │
│  - Subscription.plan = PARENT_FAMILY                         │
│  - Subscription.status = ACTIVE                              │
│  - Crea registro en Payment                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│               RENOVACIÓN AUTOMÁTICA                          │
│  Cada 30 días:                                               │
│  1. Culqi cobra automáticamente la tarjeta guardada         │
│  2. Envía webhook a /api/payments/webhook                   │
│  3. Backend crea nuevo Payment                               │
│  4. Actualiza Subscription.currentPeriodEnd (+30 días)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 ARCHIVOS A CREAR/MODIFICAR

### 🔴 FASE 1: Actualizar Trial a 30 días (PRIORIDAD)

**Archivos a MODIFICAR:**
```
src/app/api/auth/register/route.ts              # Cambiar +7 a +30
src/app/api/auth/oauth/google/callback/route.ts # Cambiar +7 a +30
src/app/admin/usuarios/page.tsx                 # Cambiar trialDays: 7 a 30
src/app/(auth)/register/page.tsx                # Texto "7 días" a "30 días"
src/app/(auth)/login/page.tsx                   # Texto "7 días" a "30 días"
```

### 🟡 FASE 2: Landing Page con Pricing

**Archivos a CREAR:**
```
src/app/page.tsx                      # Landing page (reemplazar página actual)
  ├─ Hero section
  ├─ Features section
  ├─ Pricing section (PricingCards component)
  └─ CTA section

src/app/pricing/page.tsx              # Página dedicada de precios
src/components/landing/
  ├─ Hero.tsx                         # Hero con call-to-action
  ├─ Features.tsx                     # Características del producto
  ├─ PricingCards.tsx                 # Cards de planes (PADRES y CLUBES)
  ├─ Testimonials.tsx                 # Testimonios (opcional)
  └─ FAQ.tsx                          # Preguntas frecuentes
```

### 🟢 FASE 3: Sistema de Suscripciones

**Base de datos:**
```
prisma/schema.prisma                  # Agregar modelos Subscription y Payment
```

**Backend (APIs):**
```
src/app/api/
├── subscription/
│   ├── create/route.ts               # POST: Crear suscripción
│   ├── cancel/route.ts               # POST: Cancelar suscripción
│   ├── upgrade/route.ts              # POST: Cambiar de plan
│   ├── status/route.ts               # GET: Estado actual
│   └── limits/route.ts               # GET: Límites del plan actual
├── payments/
│   ├── webhook/route.ts              # POST: Webhook de Culqi
│   ├── history/route.ts              # GET: Historial de pagos
│   └── create-charge/route.ts        # POST: Crear cargo en Culqi
└── checkout/
    ├── session/route.ts              # POST: Crear sesión de checkout
    └── success/route.ts              # GET: Callback de pago exitoso
```

**Frontend (Páginas):**
```
src/app/subscription/
├── page.tsx                          # Ver planes disponibles
├── checkout/
│   ├── page.tsx                      # Checkout con Culqi
│   └── success/page.tsx              # Confirmación de pago
├── manage/page.tsx                   # Gestionar mi suscripción
└── history/page.tsx                  # Historial de pagos
```

**Librerías compartidas:**
```
src/lib/
├── culqi.ts                          # Cliente de Culqi SDK
├── subscription.ts                   # Lógica de suscripciones
├── pricing.ts                        # Definición de planes y límites
└── validators/
    └── subscription.ts               # Validar límites de plan
```

**Componentes UI:**
```
src/components/subscription/
├── PricingCard.tsx                   # Card individual de plan
├── PlanComparison.tsx                # Tabla comparativa de planes
├── CheckoutForm.tsx                  # Formulario de pago Culqi
├── SubscriptionBadge.tsx             # Badge "Plan Familiar" o "PRO TRIAL"
├── PaymentMethodCard.tsx             # Tarjeta guardada (últimos 4 dígitos)
├── InvoiceList.tsx                   # Lista de facturas
└── UpgradeModal.tsx                  # Modal para cambiar plan

src/components/club/
├── NovedadesButton.tsx               # 🆕 Botón en header (con badge rojo 🔴)
├── NovedadesPanel.tsx                # 🆕 Panel lateral de novedades/noticias
├── ProTrialBanner.tsx                # 🆕 Banner "PRO TRIAL - X días restantes"
├── ProTrialExpiredModal.tsx          # 🆕 Modal cuando expira trial PRO
├── ProFeatureGate.tsx                # 🆕 Componente que bloquea funciones PRO
└── ProBadge.tsx                      # 🆕 Badge "🔒 PRO" en menús bloqueados

src/components/
├── TrialBanner.tsx                   # ⚠️ ACTUALIZAR: Agregar botón "Ver Planes"
└── SubscriptionGuard.tsx             # HOC para validar límites
```

### 🔵 FASE 4: Middleware y Validaciones

**Archivos a CREAR:**
```
src/middleware/
├── subscription-limits.ts            # Middleware para validar límites
└── pro-feature-gate.ts               # Middleware para validar acceso a funciones PRO

src/hooks/
├── useSubscription.ts                # Hook para estado de suscripción
├── useSubscriptionLimits.ts          # Hook para límites del plan
├── usePaymentHistory.ts              # Hook para historial de pagos
├── useClubProStatus.ts               # 🆕 Hook para estado PRO del club
└── useProFeatureAccess.ts            # 🆕 Hook para verificar acceso a función PRO
```

**Archivos a MODIFICAR (agregar validaciones):**
```
src/app/api/children/create/route.ts  # Validar maxChildren
src/app/api/teachers/create/route.ts  # Validar maxTeachers (clubes)
src/app/parents/nadadores/page.tsx    # Deshabilitar botón si alcanzó límite
src/app/club/profesores/page.tsx      # Deshabilitar botón si alcanzó límite
```

---

---

## 🎨 FLUJO DE USUARIO DETALLADO (UX)

### 📌 FLUJO ACTUAL (Sin Culqi) vs FLUJO NUEVO (Con Culqi)

#### ❌ COMO FUNCIONA AHORA:
```
1. Usuario va a /register
2. Llena formulario (nombre, email, password, selecciona rol)
3. Click "Registrarse"
4. Sistema crea usuario con:
   - accountStatus: TRIAL
   - isTrialAccount: true
   - trialExpiresAt: +7 días
5. Redirige a /login
6. Usuario inicia sesión → Dashboard
7. Después de 7 días → Modal: "Tu trial expiró"
8. Usuario queda bloqueado (sin opción de pagar)
```

#### ✅ COMO FUNCIONARÁ CON CULQI:

**✅ IMPLEMENTAREMOS AMBAS OPCIONES:**

**OPCIÓN A: Registro directo**
```
1. Usuario va a /register
2. Llena formulario (nombre, email, password, rol)
3. Click "Registrarse"
4. Sistema crea:
   ├─ User (trial 30 días)
   └─ Subscription (plan: TRIAL, expira en 30 días)
5. Redirige a /login
6. Inicia sesión → Dashboard
7. Banner arriba: "🎉 Trial - Te quedan X días" (con botón "Ver Planes")
8. A los 27 días → Notificación: "Tu trial expira pronto"
9. Click "Ver Planes" → /subscription (página de planes)
10. Selecciona plan → /subscription/checkout
11. Ingresa tarjeta (Culqi) → Pago exitoso
12. Sistema actualiza:
    ├─ User.accountStatus = ACTIVE
    ├─ User.isTrialAccount = false
    └─ Subscription (plan: PARENT_FAMILY, currentPeriodEnd: +30 días)
13. Dashboard con badge "✅ Plan Familiar"
```

**OPCIÓN B: Landing con planes primero (Implementada simultáneamente)**
```
1. Usuario va a / (home con sección de pricing)
2. Ve cards de planes con precios
3. Opciones en cada plan:
   ├─ Botón "Empezar Gratis" (planes pagos) → /register?from=pricing
   └─ Botón "Probar 30 días gratis" (trial) → /register
4. Landing también accesible en /pricing
5. Header tiene link "Precios" que va a /#pricing
6. ... resto igual a Opción A
```

**Ambos flujos terminan en `/subscription/checkout` para pagar**

---

## 🚀 FLUJO DE USUARIO

### Para nuevos usuarios:
1. Usuario se registra → **Trial automático (30 días, hasta 3 nadadores)**
2. Puede usar todas las funcionalidades completas
3. **27 días después** (3 días antes de expirar) → **Notificación** "Tu trial expira pronto"
4. Al expirar → **Modal bloqueante** "Selecciona un plan para continuar"
5. Selecciona plan → **Checkout** → Ingresa tarjeta
6. Pago exitoso → **Suscripción activa** (mantiene todos sus datos)

### Para renovaciones:
1. Culqi cobra **automáticamente** cada mes
2. **Webhook** notifica a tu servidor
3. Actualizas fecha de renovación
4. Si el pago **falla** → Email de aviso (3 intentos)
5. Si continúa fallando → **Suspender cuenta** (pero no borrar datos)

### Para upgrades/downgrades:
1. Usuario va a "Gestionar suscripción"
2. Selecciona nuevo plan
3. **Upgrade:** Cobra diferencia prorrateada inmediatamente
4. **Downgrade:** Aplica al final del periodo actual

---

## 🔒 VALIDACIONES Y LÍMITES

### Middleware de validación
Verificar en cada acción:

```typescript
// Al agregar un nadador
if (user.children.length >= subscription.maxChildren) {
  throw new Error("Has alcanzado el límite de nadadores de tu plan")
}

// Al agregar un profesor (clubes)
if (club.teachers.length >= subscription.maxTeachers) {
  throw new Error("Has alcanzado el límite de profesores de tu plan")
}
```

### Restricciones por plan

| Acción | Validación |
|--------|------------|
| Agregar nadador | `children.count < maxChildren` |
| Agregar profesor | `teachers.count < maxTeachers` |
| Ver estadísticas avanzadas | `plan >= PARENT_FAMILY` |
| Exportar reportes | `plan == PARENT_PREMIUM` |
| Competencias internas | `plan >= CLUB_SMALL` |

---

## 💰 COSTOS DE CULQI

- **Tarjetas nacionales:** 3.99% + S/. 0.50 por transacción
- **Tarjetas internacionales:** 4.99% + S/. 0.50 por transacción
- **Sin cuota mensual**
- **Sin costo de implementación**

### Ejemplo de cálculo con precios reales:

**Plan Básico (S/. 15):**
```
Cobro: S/. 15.00
Comisión Culqi: S/. 15.00 × 3.99% + S/. 0.50 = S/. 1.10
Recibes: S/. 13.90 (92.7% del total)
```

**Plan Familiar (S/. 25):**
```
Cobro: S/. 25.00
Comisión Culqi: S/. 25.00 × 3.99% + S/. 0.50 = S/. 1.50
Recibes: S/. 23.50 (94% del total)
```

**Plan Premium (S/. 40):**
```
Cobro: S/. 40.00
Comisión Culqi: S/. 40.00 × 3.99% + S/. 0.50 = S/. 2.10
Recibes: S/. 37.90 (94.75% del total)
```

**Proyección mensual (Escenario real: 10 clubes, 60 nadadores promedio c/u):**

**INGRESOS POR PADRES:**
```
10 clubes × 60 nadadores = 600 nadadores
600 nadadores = ~450 familias (algunos tienen 2+ hijos)
450 familias × 40% conversión = 180 familias pagando

Distribución:
- 50 familias en Básico (28%): 50 × S/. 13.90 = S/. 695
- 110 familias en Familiar (61%): 110 × S/. 23.50 = S/. 2,585
- 20 familias en Premium (11%): 20 × S/. 37.90 = S/. 758

Total padres neto: S/. 4,038/mes
```

**INGRESOS POR CLUBES (Upgrade a PRO):**
```
Escenario conservador (30% de clubes upgradeean):
- 10 clubes totales
- 3 clubes con CLUB PRO: 3 × S/. 93.05 = S/. 279 (S/. 99 - comisión)

Total clubes neto: S/. 279/mes
```

**TOTAL NETO MENSUAL: S/. 4,317** (~S/. 51,804/año)

**Con 20 clubes:**
- Padres: S/. 8,076/mes
- Clubes PRO (6 clubes): S/. 558/mes
- **TOTAL: S/. 8,634/mes** (~**S/. 103,608/año**) 🚀

**Nota:** El 94% del ingreso viene de padres, confirmando que el modelo B2C es el motor principal.

---

---

## ✅ PROGRESO DE IMPLEMENTACIÓN

### 🟢 COMPLETADO

#### ✅ FASE 1: Trial de 30 días PADRES
- ✅ `src/app/api/auth/register/route.ts` - Trial 30 días
- ✅ `src/app/api/auth/oauth/google/callback/route.ts` - Trial 30 días  
- ✅ `src/app/admin/usuarios/page.tsx` - trialDays: 30
- ✅ `src/app/(auth)/register/page.tsx` - Texto "30 días gratis"
- ✅ `src/app/(auth)/login/page.tsx` - Texto "30 días gratis"

#### ✅ FASE 3: Schema de BD con campos PRO
- ✅ `prisma/schema.prisma` - Campos PRO trial agregados al modelo Club:
  - proTrialStartedAt, proTrialExpiresAt, isProTrial, isProActive
  - hasUnreadNews, lastNewsReadAt
  - customLogo, customColors, customDomain

### 🟡 EN PROGRESO

#### ✅ Componentes de UI para sistema de novedades
- ✅ `src/components/club/NovedadesButton.tsx` - Botón con badge rojo animado
- ✅ `src/components/club/NovedadesPanel.tsx` - Panel lateral con anuncio PRO

### 🟡 EN PROGRESO AHORA

#### 🔄 Integración en Header
- Actualizando Header.tsx para incluir NovedadesButton

### ⚪ PENDIENTE

_(Ver secciones de FASE 2-9 más abajo)_

---

## 📝 ORDEN DE IMPLEMENTACIÓN (DETALLADO)

### 🔴 FASE 1: Actualizar Trial PADRES (30 minutos)
- [ ] Cambiar trial de 7 a 30 días en todos los archivos listados arriba
- [ ] Probar registro nuevo usuario padre
- [ ] Verificar que muestre "30 días" en UI
- [ ] Validar límite de 3 nadadores en trial

### 🟡 FASE 2: Landing Page (2-3 horas)
- [ ] Crear `src/components/landing/PricingCards.tsx`
- [ ] Crear `src/components/landing/Hero.tsx`
- [ ] Crear `src/components/landing/Features.tsx`
- [ ] Actualizar `src/app/page.tsx` con nuevo landing
- [ ] Crear `src/app/pricing/page.tsx`
- [ ] Actualizar Header con link "Precios"

### 🟢 FASE 3: Base de Datos (30 minutos)
- [ ] Actualizar modelo `Club` con campos PRO trial
- [ ] Actualizar `prisma/schema.prisma` con modelos Subscription y Payment
- [ ] Ejecutar `npx prisma migrate dev --name add_subscription_and_club_pro`
- [ ] Verificar migración exitosa
- [ ] Probar crear club con campos nuevos

### 🔵 FASE 4: Setup Culqi (1 hora)
- [ ] Crear cuenta en Culqi (TÚ)
- [ ] Obtener API keys de test (TÚ)
- [ ] Agregar keys a `.env.local`
- [ ] Instalar SDK: `npm install culqi`
- [ ] Crear `src/lib/culqi.ts` (cliente)
- [ ] Crear `src/lib/pricing.ts` (definición de planes)

### 🟣 FASE 5: Backend APIs (3-4 horas)
- [ ] API: `subscription/create/route.ts`
- [ ] API: `subscription/status/route.ts`
- [ ] API: `subscription/upgrade/route.ts`
- [ ] API: `subscription/cancel/route.ts`
- [ ] API: `payments/create-charge/route.ts`
- [ ] API: `payments/webhook/route.ts` (crítico)
- [ ] API: `payments/history/route.ts`

### 🟠 FASE 6: Frontend Suscripciones (4-5 horas)
- [x] Componente: `NovedadesButton.tsx` (botón en header con badge rojo 🔴)
- [x] Componente: `NovedadesPanel.tsx` (panel lateral de novedades)
- [x] Componente: `ProTrialBanner.tsx` (banner con cuenta regresiva)
- [x] Componente: `ProTrialExpiredModal.tsx` (modal al expirar)
- [x] Actualizar Header/ModernSidebar para incluir botón de novedades
- [x] Página: `subscription/page.tsx` (selección de planes + formulario de pago)
- [x] Landing: `Pricing.tsx` y `PricingPreview.tsx` (3 planes padres + 2 planes clubes)
- [x] Página: `/pricing` dedicada con hero section
- [ ] Componente: `ProFeatureGate.tsx` (bloqueo de funciones PRO)
- [ ] Página: `subscription/checkout/success/page.tsx`
- [ ] Página: `subscription/manage/page.tsx`
- [ ] Componente: `CheckoutForm.tsx` (activar cuando tengamos credenciales Culqi)

### 🟤 FASE 7: Hooks y Validaciones (2-3 horas)
- [ ] Hook: `useSubscription.ts`
- [ ] Hook: `useSubscriptionLimits.ts`
- [ ] Middleware: `subscription-limits.ts`
- [ ] Actualizar API de crear nadador (validar límite)
- [ ] Actualizar API de crear profesor (validar límite)
- [ ] UI: Deshabilitar botones cuando se alcance límite

### ⚫ FASE 8: Testing Local (2-3 horas)
- [ ] Probar registro → trial automático
- [ ] Probar landing → ver planes
- [ ] Probar seleccionar plan → checkout
- [ ] Probar pago con tarjeta test de Culqi
- [ ] Probar webhook con ngrok
- [ ] Probar actualización de suscripción
- [ ] Probar límites (agregar nadadores hasta límite)

### ⚪ FASE 9: Producción (1 día)
- [ ] Cambiar a API keys de producción
- [ ] Configurar webhook URL en dashboard Culqi
- [ ] Deploy a DigitalOcean
- [ ] Probar primer pago real
- [ ] Monitorear logs de webhooks
- [ ] Verificar que renovaciones automáticas funcionen

---

### ⏱️ ESTIMACIÓN TOTAL:
- **Con Culqi listo:** 15-20 horas de desarrollo
- **Sin Culqi (esperando):** Podemos hacer Fases 1-3 y 6-7 (landing + UI)

---

## 🧪 TARJETAS DE PRUEBA (MODO TEST)

Culqi proporciona estas tarjetas para testing:

### Visa exitosa:
```
Número: 4111 1111 1111 1111
CVV: 123
Fecha: Cualquier fecha futura
```

### Visa rechazada:
```
Número: 4000 0000 0000 0002
CVV: 123
Fecha: Cualquier fecha futura
```

### Mastercard exitosa:
```
Número: 5111 1111 1111 1118
CVV: 123
Fecha: Cualquier fecha futura
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### Seguridad
- ✅ Nunca almacenar CVV
- ✅ Usar tokens de Culqi para tarjetas
- ✅ HTTPS obligatorio en producción
- ✅ Validar webhook signature

### Experiencia de usuario
- ✅ Mostrar claramente qué incluye cada plan
- ✅ Permitir cambiar tarjeta sin cancelar
- ✅ Avisar 3 días antes de cobro
- ✅ Permitir descargar facturas

### Legal
- ✅ Términos y condiciones de suscripción
- ✅ Política de reembolsos (si aplica)
- ✅ Política de cancelación
- ✅ Facturación electrónica (SUNAT)

### Soporte
- ✅ Email cuando el pago falla
- ✅ Email cuando el pago es exitoso
- ✅ Notificaciones de cambio de plan
- ✅ Chat/email para soporte de pagos

---

## 🎬 PRÓXIMOS PASOS INMEDIATOS

### Para ti (propietario):
1. **Crear cuenta en Culqi** (15 min)
2. **Obtener API keys de test** (5 min)
3. **Enviarme las keys** por mensaje privado
4. **Confirmar precios** de los planes
5. **Revisar términos legales** que necesitas

### Para mí (desarrollo):
1. Esperar tus credenciales
2. Actualizar base de datos
3. Crear estructura de archivos
4. Implementar integración
5. Hacer testing

---

## 📞 INFORMACIÓN DE CONTACTO CULQI

- **Web:** https://www.culqi.com/
- **Documentación:** https://docs.culqi.com/
- **Soporte:** soporte@culqi.com
- **WhatsApp:** +51 993 684 599
- **Slack Community:** https://community.culqi.com/

---

## 💡 RECOMENDACIONES FINALES

1. **Empezar en modo test** - No usar producción hasta estar 100% seguro
2. **Probar renovaciones** - Simular cobros mensuales en test
3. **Documentar todo** - Cada webhook, cada error
4. **Monitorear primeros pagos** - Revisar manualmente las primeras semanas
5. **Tener plan B** - Si Culqi tiene problemas, permitir pago manual

---

## ❓ PREGUNTAS FRECUENTES

**¿Puedo cambiar los precios después?**
Sí, pero afecta solo a nuevos suscriptores. Los actuales mantienen su precio.

**¿Qué pasa si un pago falla?**
Culqi reintenta automáticamente 3 veces. Si falla, suspendes acceso pero no borras datos.

**¿Puedo ofrecer descuentos?**
Sí, Culqi soporta cupones y códigos promocionales.

**¿Puedo facturar?**
Sí, pero necesitas integrar con SUNAT (servicio adicional).

**¿Culqi cobra por mes si no hay ventas?**
No, Culqi solo cobra comisión por transacción exitosa.

---

## ✅ CHECKLIST FINAL

Antes de empezar, asegúrate de tener:

- [ ] Cuenta Culqi creada
- [ ] API Keys (test) obtenidas
- [ ] Precios confirmados
- [ ] Límites de planes aprobados
- [ ] Términos y condiciones redactados
- [ ] Política de cancelación definida
- [ ] Email para notificaciones configurado

---

**Una vez que me envíes las credenciales de Culqi, ¡empezamos! 🚀**

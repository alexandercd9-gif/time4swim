/**
 * Culqi Integration Library
 * 
 * Este archivo contiene todas las funciones para interactuar con la API de Culqi.
 * Requiere configurar las credenciales en .env.local
 * 
 * Variables de entorno necesarias:
 * - CULQI_PUBLIC_KEY: Para tokenizar tarjetas en el frontend
 * - CULQI_SECRET_KEY: Para crear cargos, clientes, suscripciones en el backend
 * - NEXT_PUBLIC_CULQI_MODE: 'test' o 'production'
 */

// Configuración
const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY || '';
const CULQI_API_URL = 'https://api.culqi.com/v2';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const CULQI_MODE = process.env.NEXT_PUBLIC_CULQI_MODE || 'test';

// Tipos
export interface CulqiCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface CulqiCard {
  id: string;
  customer_id: string;
  brand: string; // 'Visa', 'Mastercard', etc
  last_four: string;
  exp_month: number;
  exp_year: number;
}

export interface CulqiCharge {
  id: string;
  amount: number; // en centavos (ej: 2500 = S/. 25.00)
  currency: string; // 'PEN'
  email: string;
  description: string;
  source_id: string; // token o card_id
}

export interface CulqiSubscription {
  id: string;
  customer_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due';
  current_period_start: number; // timestamp
  current_period_end: number; // timestamp
  cancel_at_period_end: boolean;
}

// Helper para verificar si Culqi está configurado
export function isCulqiConfigured(): boolean {
  if (IS_DEVELOPMENT && !CULQI_SECRET_KEY) {
    console.warn('⚠️  Culqi no está configurado. Usando modo desarrollo.');
    return false;
  }
  return !!CULQI_SECRET_KEY;
}

// Helper para hacer requests a Culqi
async function culqiRequest(endpoint: string, method: string = 'GET', data?: any) {
  if (!isCulqiConfigured()) {
    throw new Error('Culqi no está configurado. Agrega CULQI_SECRET_KEY en .env.local');
  }

  const url = `${CULQI_API_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${CULQI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok) {
    console.error('Culqi API Error:', result);
    throw new Error(result.user_message || result.merchant_message || 'Error en Culqi');
  }

  return result;
}

/**
 * Crear un cliente en Culqi
 * Se debe crear un customer antes de guardar tarjetas o suscripciones
 */
export async function createCustomer(data: {
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}): Promise<CulqiCustomer> {
  // TODO: Implementar cuando tengas credenciales
  // return await culqiRequest('/customers', 'POST', data);
  
  // Modo desarrollo: retornar mock
  console.log('🔧 [DEV MODE] Creating Culqi customer:', data);
  return {
    id: `cus_test_${Date.now()}`,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    phone_number: data.phone_number,
  };
}

/**
 * Guardar una tarjeta tokenizada
 * El token se genera en el frontend con Culqi.js
 */
export async function createCard(customerId: string, token: string): Promise<CulqiCard> {
  // TODO: Implementar cuando tengas credenciales
  // return await culqiRequest('/cards', 'POST', {
  //   customer_id: customerId,
  //   token_id: token
  // });
  
  // Modo desarrollo: retornar mock
  console.log('🔧 [DEV MODE] Creating card for customer:', customerId, 'with token:', token);
  return {
    id: `card_test_${Date.now()}`,
    customer_id: customerId,
    brand: 'Visa',
    last_four: '4242',
    exp_month: 12,
    exp_year: 2025,
  };
}

/**
 * Crear un cargo único
 * Usado para pagos únicos (no recurrentes)
 */
export async function createCharge(data: {
  amount: number; // en soles, se convertirá a centavos
  email: string;
  source_id: string; // token o card_id
  description: string;
  currency?: string;
}): Promise<CulqiCharge> {
  const amountInCents = Math.round(data.amount * 100);
  
  // TODO: Implementar cuando tengas credenciales
  // return await culqiRequest('/charges', 'POST', {
  //   amount: amountInCents,
  //   currency_code: data.currency || 'PEN',
  //   email: data.email,
  //   source_id: data.source_id,
  //   description: data.description,
  // });
  
  // Modo desarrollo: retornar mock
  console.log('🔧 [DEV MODE] Creating charge:', {
    ...data,
    amount_in_cents: amountInCents
  });
  return {
    id: `chr_test_${Date.now()}`,
    amount: amountInCents,
    currency: data.currency || 'PEN',
    email: data.email,
    description: data.description,
    source_id: data.source_id,
  };
}

/**
 * Crear un plan de suscripción
 * Los planes se crean una sola vez en Culqi Dashboard
 * Esta función es solo por si necesitas crearlos programáticamente
 */
export async function createPlan(data: {
  name: string;
  amount: number; // en soles
  currency?: string;
  interval: 'days' | 'weeks' | 'months' | 'years';
  interval_count: number;
  limit?: number; // cantidad de cobros (opcional, null = infinito)
}): Promise<any> {
  const amountInCents = Math.round(data.amount * 100);
  
  // TODO: Implementar cuando tengas credenciales
  // return await culqiRequest('/plans', 'POST', {
  //   name: data.name,
  //   amount: amountInCents,
  //   currency_code: data.currency || 'PEN',
  //   interval: data.interval,
  //   interval_count: data.interval_count,
  //   limit: data.limit,
  // });
  
  console.log('🔧 [DEV MODE] Creating plan:', data);
  return {
    id: `plan_test_${Date.now()}`,
    name: data.name,
    amount: amountInCents,
    currency_code: data.currency || 'PEN',
    interval: data.interval,
    interval_count: data.interval_count,
  };
}

/**
 * Crear una suscripción
 * Cobra automáticamente cada mes
 */
export async function createSubscription(data: {
  customer_id: string;
  card_id: string;
  plan_id: string;
}): Promise<CulqiSubscription> {
  // TODO: Implementar cuando tengas credenciales
  // return await culqiRequest('/subscriptions', 'POST', data);
  
  console.log('🔧 [DEV MODE] Creating subscription:', data);
  const now = Date.now();
  const oneMonthLater = now + (30 * 24 * 60 * 60 * 1000);
  
  return {
    id: `sub_test_${Date.now()}`,
    customer_id: data.customer_id,
    plan_id: data.plan_id,
    status: 'active',
    current_period_start: Math.floor(now / 1000),
    current_period_end: Math.floor(oneMonthLater / 1000),
    cancel_at_period_end: false,
  };
}

/**
 * Cancelar una suscripción
 * Se cancela al final del periodo actual
 */
export async function cancelSubscription(subscriptionId: string): Promise<CulqiSubscription> {
  // TODO: Implementar cuando tengas credenciales
  // return await culqiRequest(`/subscriptions/${subscriptionId}`, 'PATCH', {
  //   cancel_at_period_end: true
  // });
  
  console.log('🔧 [DEV MODE] Canceling subscription:', subscriptionId);
  return {
    id: subscriptionId,
    customer_id: 'cus_test',
    plan_id: 'plan_test',
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
    cancel_at_period_end: true,
  };
}

/**
 * Obtener información de una suscripción
 */
export async function getSubscription(subscriptionId: string): Promise<CulqiSubscription> {
  // TODO: Implementar cuando tengas credenciales
  // return await culqiRequest(`/subscriptions/${subscriptionId}`, 'GET');
  
  console.log('🔧 [DEV MODE] Getting subscription:', subscriptionId);
  return {
    id: subscriptionId,
    customer_id: 'cus_test',
    plan_id: 'plan_test',
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
    cancel_at_period_end: false,
  };
}

/**
 * Validar webhook signature
 * Culqi envía un header X-Culqi-Signature que debes validar
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string = CULQI_SECRET_KEY
): boolean {
  // TODO: Implementar validación real con HMAC
  // const crypto = require('crypto');
  // const hmac = crypto.createHmac('sha256', secret);
  // hmac.update(payload);
  // const computedSignature = hmac.digest('hex');
  // return computedSignature === signature;
  
  console.log('🔧 [DEV MODE] Validating webhook signature');
  return true; // En desarrollo, siempre válido
}

// Export de constantes útiles
export const CULQI_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || '',
  mode: CULQI_MODE,
  isConfigured: isCulqiConfigured(),
  isDevelopment: IS_DEVELOPMENT,
};

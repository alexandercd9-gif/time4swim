"use client";

import { useState, useEffect } from "react";
import { Check, Crown, Users, CreditCard, Lock, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

// Declaración global de Culqi
declare global {
  interface Window {
    Culqi: any;
  }
}

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userType, setUserType] = useState<"parent" | "club">("parent");
  
  // Estados para el formulario de pago
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [culqiLoaded, setCulqiLoaded] = useState(false);

  // Configurar Culqi cuando se cargue el script
  useEffect(() => {
    if (window.Culqi && !culqiLoaded) {
      // TODO: Reemplazar con tu NEXT_PUBLIC_CULQI_PUBLIC_KEY del .env.local
      const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_XXXXXXXX';
      
      window.Culqi.publicKey = publicKey;
      window.Culqi.options = {
        lang: 'es',
        modal: false,
      };

      setCulqiLoaded(true);
      console.log('✅ Culqi configurado correctamente');
    }
  }, [culqiLoaded]);

  // Formatear número de tarjeta (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : '';
  };

  // Formatear fecha de expiración (MM/YY)
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  // Validar número de tarjeta con algoritmo de Luhn
  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  // Validar fecha de expiración
  const validateExpiry = (expiry: string): boolean => {
    const [month, year] = expiry.split('/');
    if (!month || !year) return false;

    const monthNum = parseInt(month);
    const yearNum = parseInt('20' + year);

    if (monthNum < 1 || monthNum > 12) return false;

    const now = new Date();
    const expiryDate = new Date(yearNum, monthNum - 1);

    return expiryDate > now;
  };

  // Manejar cambios en inputs
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.replace(/\//g, '').length <= 4) {
      setExpiry(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  // Procesar pago
  const handlePayment = async () => {
    setError(null);

    // Validaciones
    if (!validateCardNumber(cardNumber)) {
      setError('Número de tarjeta inválido');
      return;
    }

    if (!validateExpiry(expiry)) {
      setError('Fecha de expiración inválida o vencida');
      return;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      setError('CVV inválido');
      return;
    }

    if (!cardName.trim()) {
      setError('Ingresa el nombre del titular');
      return;
    }

    if (!culqiLoaded || !window.Culqi) {
      setError('Sistema de pagos no disponible. Recarga la página.');
      return;
    }

    setIsProcessing(true);

    try {
      // Crear token de Culqi
      const [month, year] = expiry.split('/');
      const cardNumberClean = cardNumber.replace(/\s/g, '');

      window.Culqi.createToken = function() {
        // Handler de éxito
        if (window.Culqi.token) {
          createSubscription(window.Culqi.token.id);
        } else {
          // Handler de error
          setError(window.Culqi.error.user_message || 'Error al procesar la tarjeta');
          setIsProcessing(false);
        }
      };

      // Generar token
      window.Culqi.createToken({
        card_number: cardNumberClean,
        cvv: cvv,
        expiration_month: month,
        expiration_year: '20' + year,
        email: 'user@example.com', // TODO: Usar email del usuario logueado
      });

    } catch (error: any) {
      console.error('Error al tokenizar tarjeta:', error);
      setError('Error al procesar la tarjeta. Intenta nuevamente.');
      setIsProcessing(false);
    }
  };

  // Crear suscripción en backend
  const createSubscription = async (culqiToken: string) => {
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          culqiToken: culqiToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la suscripción');
      }

      // Éxito - redirigir a cuenta
      console.log('✅ Suscripción creada exitosamente:', data);
      window.location.href = '/parents/cuenta?success=true';

    } catch (error: any) {
      console.error('Error creando suscripción:', error);
      setError(error.message || 'Error al completar la suscripción');
      setIsProcessing(false);
    }
  };

  const parentPlans = [
    {
      id: "basic",
      name: "Básico",
      price: 15,
      maxChildren: 1,
      features: [
        "1 nadador",
        "Registro de tiempos ilimitado",
        "Historial completo",
        "Gráficas de progreso",
        "Comparación con récords",
        "Acceso a eventos",
        "Soporte por email"
      ]
    },
    {
      id: "family",
      name: "Familiar",
      price: 25,
      maxChildren: 3,
      popular: true,
      features: [
        "Hasta 3 nadadores",
        "Todo lo del plan Básico",
        "Dashboard familiar unificado",
        "Soporte prioritario",
        "Notificaciones avanzadas"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: 40,
      maxChildren: 6,
      features: [
        "Hasta 6 nadadores",
        "Todo lo del plan Familiar",
        "Análisis avanzado de rendimiento",
        "Reportes personalizados",
        "Notificaciones SMS",
        "Asesoría técnica mensual",
        "Soporte 24/7"
      ]
    }
  ];

  const clubPlan = {
    id: "club_pro",
    name: "CLUB PRO",
    price: 99,
    features: [
      "Todo lo de Club FREE",
      "Profesores ilimitados",
      "Reportes avanzados en PDF",
      "Control de asistencias",
      "Marca personalizada (logo, colores)",
      "Dominio personalizado",
      "Integración FDPN masiva",
      "Analytics avanzadas",
      "Soporte prioritario 24/7"
    ]
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const getPlanDetails = () => {
    if (userType === "parent") {
      return parentPlans.find(p => p.id === selectedPlan);
    }
    return clubPlan;
  };

  const selectedPlanDetails = getPlanDetails();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header Simple */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Time4Swim" className="h-10 w-auto" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${!selectedPlan ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!selectedPlan ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <span className="font-medium">Elegir Plan</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300" />
            <div className={`flex items-center gap-2 ${selectedPlan ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedPlan ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="font-medium">Pago</span>
            </div>
          </div>
        </div>

        {!selectedPlan ? (
          <>
            {/* Type Selector */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Elige tu Plan
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Selecciona el plan que mejor se adapte a tus necesidades
              </p>

              <div className="inline-flex bg-white rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setUserType("parent")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    userType === "parent"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Users className="h-5 w-5 inline mr-2" />
                  Para Padres
                </button>
                <button
                  onClick={() => setUserType("club")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    userType === "club"
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Crown className="h-5 w-5 inline mr-2" />
                  Para Clubes
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            {userType === "parent" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {parentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-2xl shadow-lg p-8 relative cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                      plan.popular ? "ring-4 ring-purple-500 ring-offset-4 scale-105" : ""
                    }`}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Más Popular
                        </div>
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-gray-900">S/. {plan.price}</span>
                        <span className="text-gray-600">/mes</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                      Seleccionar Plan
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div
                  className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg p-8 text-white cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  onClick={() => handleSelectPlan("club_pro")}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="h-10 w-10" />
                    <h3 className="text-3xl font-bold">{clubPlan.name}</h3>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold">S/. {clubPlan.price}</span>
                      <span className="text-purple-100">/mes</span>
                    </div>
                    <p className="text-purple-100 mt-2">30 días gratis sin tarjeta</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {clubPlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-purple-200 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-colors">
                    Seleccionar Club PRO
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Payment Section */}
            <div className="max-w-4xl mx-auto">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Cambiar plan
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-semibold text-gray-900">{selectedPlanDetails?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Precio mensual:</span>
                      <span className="font-semibold text-gray-900">S/. {selectedPlanDetails?.price}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-semibold text-gray-900">Total hoy:</span>
                        <span className="font-bold text-2xl text-gray-900">S/. 0.00</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Luego S/. {selectedPlanDetails?.price}/mes (renovación automática)
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <p className="text-green-800 text-sm">
                      <strong>🎉 30 días de prueba gratis</strong>
                      <br />
                      No se cobrará nada hasta el {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE')}.
                      <br />
                      <span className="text-green-700 mt-1 block">
                        Después se renovará automáticamente cada mes. Puedes cancelar cuando quieras.
                      </span>
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {selectedPlanDetails?.features.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Payment Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="h-6 w-6 text-gray-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Información de Pago</h2>
                  </div>

                  {/* Alerta de error */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Mensaje informativo */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                      <Lock className="h-4 w-4 inline mr-2" />
                      Tu tarjeta será validada pero <strong>no se cobrará nada hoy</strong>.
                      El primer cargo será en 30 días.
                    </p>
                  </div>

                  {/* Formulario de pago */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de tarjeta *
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isProcessing}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de expiración *
                        </label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isProcessing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={handleCvvChange}
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isProcessing}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del titular *
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Como aparece en la tarjeta"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isProcessing}
                      />
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={isProcessing || !culqiLoaded}
                      className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 ${
                        isProcessing || !culqiLoaded
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Procesando...
                        </>
                      ) : !culqiLoaded ? (
                        'Cargando sistema de pagos...'
                      ) : (
                        'Iniciar Prueba Gratuita'
                      )}
                    </button>
                  </div>

                  {/* Security badges */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Pago seguro</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>SSL Encriptado</span>
                      </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-3">
                      Procesado por Culqi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Métodos de pago aceptados:</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="text-gray-400 font-semibold">VISA</div>
            <div className="text-gray-400 font-semibold">MASTERCARD</div>
            <div className="text-gray-400 font-semibold">CULQI</div>
          </div>
        </div>
      </div>

      {/* Culqi Script */}
      <Script
        src="https://checkout.culqi.com/js/v4"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ Culqi.js cargado');
          setCulqiLoaded(true);
        }}
        onError={() => {
          console.error('❌ Error cargando Culqi.js');
          setError('Error al cargar el sistema de pagos. Recarga la página.');
        }}
      />
    </main>
  );
}

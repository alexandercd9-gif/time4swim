'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';

function SubscriptionSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Procesando tu suscripción...');

    useEffect(() => {
        const processSubscription = async () => {
            try {
                const preapprovalId = searchParams.get('preapproval_id');
                const planId = searchParams.get('planId');
                const userId = searchParams.get('userId');
                const paymentId = searchParams.get('payment_id');
                const mpStatus = searchParams.get('status');

                console.log('📥 Parámetros recibidos:', {
                    preapprovalId,
                    planId,
                    userId,
                    paymentId,
                    mpStatus
                });

                // Si MercadoPago indica error o cancelación
                if (mpStatus === 'failure' || mpStatus === 'cancelled') {
                    setStatus('error');
                    setMessage('La suscripción fue cancelada o falló.');
                    return;
                }

                // Verificar que tenemos los datos necesarios
                if (!preapprovalId) {
                    setStatus('error');
                    setMessage('No se recibió información de la suscripción.');
                    return;
                }

                // Llamar a nuestro backend para procesar la suscripción
                const response = await fetch('/api/subscription/process-preapproval', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        preapprovalId,
                        planId,
                        userId,
                    }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    setStatus('success');
                    setMessage('¡Suscripción activada exitosamente!');

                    // Redirigir a la página de cuenta después de 3 segundos
                    setTimeout(() => {
                        router.push('/parents/cuenta?success=true');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Error al procesar la suscripción');
                }

            } catch (error) {
                console.error('Error procesando suscripción:', error);
                setStatus('error');
                setMessage('Error al procesar la suscripción');
            }
        };

        processSubscription();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">

                {/* Loading State */}
                {status === 'loading' && (
                    <div className="text-center">
                        <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Procesando...
                        </h2>
                        <p className="text-gray-600">
                            {message}
                        </p>
                    </div>
                )}

                {/* Success State */}
                {status === 'success' && (
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            ¡Suscripción Exitosa!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-900 font-medium mb-1">
                                🎉 30 días de prueba gratis
                            </p>
                            <p className="text-xs text-blue-700">
                                No se cobrará nada hasta después del periodo de prueba
                            </p>
                        </div>
                        <p className="text-sm text-gray-500">
                            Redirigiendo a tu cuenta...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Hubo un Problema
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {message}
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/subscription"
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Intentar de Nuevo
                            </Link>
                            <Link
                                href="/parents/cuenta"
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Ir a Mi Cuenta
                            </Link>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default function SubscriptionSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <SubscriptionSuccessContent />
        </Suspense>
    );
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Cron job para verificar suscripciones vencidas
 * Ejecutar diariamente para suspender cuentas con suscripciones vencidas
 * 
 * Configurar en Vercel Cron o usar un servicio externo como:
 * - https://console.cron-job.org
 * - https://cron-job.org
 * - GitHub Actions
 * 
 * URL: https://tudominio.com/api/cron/check-subscriptions
 * Frecuencia: Diaria (cada 24 horas)
 */
export async function GET(request: NextRequest) {
    try {
        // Verificar auth token para seguridad
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production';

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🔍 Verificando suscripciones vencidas...');

        const now = new Date();

        // 1. Buscar suscripciones activas que ya pasaron su fecha de vencimiento
        const expiredSubscriptions = await prisma.subscription.findMany({
            where: {
                status: 'ACTIVE',
                currentPeriodEnd: {
                    lt: now // Menor que la fecha actual
                }
            },
            include: {
                user: true
            }
        });

        console.log(`📊 Encontradas ${expiredSubscriptions.length} suscripciones vencidas`);

        let suspended = 0;
        let errors = 0;

        for (const subscription of expiredSubscriptions) {
            try {
                // Marcar como PAST_DUE (vencida)
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: 'PAST_DUE'
                    }
                });

                // Actualizar estado del usuario
                if (subscription.userId) {
                    await prisma.user.update({
                        where: { id: subscription.userId },
                        data: {
                            accountStatus: 'EXPIRED'
                        }
                    });
                }

                suspended++;
                console.log(`⏸️ Suscripción suspendida: ${subscription.id} (Usuario: ${subscription.user?.email})`);

                // TODO: Enviar email de notificación al usuario
                // await sendExpirationEmail(subscription.user?.email, subscription);

            } catch (error) {
                errors++;
                console.error(`❌ Error procesando suscripción ${subscription.id}:`, error);
            }
        }

        // 2. Buscar suscripciones PAST_DUE por más de 7 días y cancelarlas definitivamente
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const longOverdueSubscriptions = await prisma.subscription.findMany({
            where: {
                status: 'PAST_DUE',
                currentPeriodEnd: {
                    lt: sevenDaysAgo
                }
            },
            include: {
                user: true
            }
        });

        let canceled = 0;

        for (const subscription of longOverdueSubscriptions) {
            try {
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: 'CANCELED',
                        canceledAt: now
                    }
                });

                // Actualizar usuario a SUSPENDED
                if (subscription.userId) {
                    await prisma.user.update({
                        where: { id: subscription.userId },
                        data: {
                            accountStatus: 'SUSPENDED'
                        }
                    });
                }

                canceled++;
                console.log(`🚫 Suscripción cancelada: ${subscription.id}`);

                // TODO: Enviar email de cancelación
                // await sendCancellationEmail(subscription.user?.email);

            } catch (error) {
                errors++;
                console.error(`❌ Error cancelando suscripción ${subscription.id}:`, error);
            }
        }

        const summary = {
            timestamp: now.toISOString(),
            expired: expiredSubscriptions.length,
            suspended,
            longOverdue: longOverdueSubscriptions.length,
            canceled,
            errors,
            success: true
        };

        console.log('✅ Verificación completada:', summary);

        return NextResponse.json(summary);

    } catch (error) {
        console.error('❌ Error en cron job:', error);
        return NextResponse.json(
            { error: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}

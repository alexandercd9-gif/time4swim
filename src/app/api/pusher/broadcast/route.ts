import { NextRequest, NextResponse } from 'next/server';
import { triggerPusherEvent } from '@/lib/pusher-server';

/**
 * API route para enviar eventos Pusher
 * Usado por el admin para broadcastear eventos a los entrenadores
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { channel, event, data } = body;

    if (!channel || !event) {
      return NextResponse.json(
        { error: 'Channel y event son requeridos' },
        { status: 400 }
      );
    }

    // Enviar evento a través de Pusher
    const success = await triggerPusherEvent(channel, event, data || {});

    if (!success) {
      return NextResponse.json(
        { error: 'Error al enviar evento. Verifica la configuración de Pusher.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Evento ${event} enviado al canal ${channel}`
    });

  } catch (error) {
    console.error('❌ Error en /api/pusher/broadcast:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

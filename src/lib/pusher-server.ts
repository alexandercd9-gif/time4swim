import Pusher from 'pusher';

// Singleton de Pusher para el servidor
let pusherInstance: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  // Si no hay credenciales, retornar null
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET || !process.env.PUSHER_CLUSTER) {
    console.warn('⚠️  Pusher credentials not configured. Real-time sync disabled.');
    return null;
  }

  // Crear instancia única (singleton)
  if (!pusherInstance) {
    pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true
    });
    console.log('✅ Pusher server initialized');
  }

  return pusherInstance;
}

// Helper para enviar eventos
export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: any
): Promise<boolean> {
  const pusher = getPusherServer();
  
  if (!pusher) {
    console.warn(`⚠️  Cannot trigger event "${event}" on channel "${channel}" - Pusher not configured`);
    return false;
  }

  try {
    await pusher.trigger(channel, event, data);
    console.log(`✅ Pusher event triggered: ${channel} → ${event}`);
    return true;
  } catch (error) {
    console.error(`❌ Error triggering Pusher event:`, error);
    return false;
  }
}

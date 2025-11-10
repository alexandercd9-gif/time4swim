import PusherJS from 'pusher-js';

// Singleton de Pusher para el cliente
let pusherClientInstance: PusherJS | null = null;

export function getPusherClient(): PusherJS | null {
  // Si no hay credenciales públicas, retornar null
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
    console.warn('⚠️  Pusher client credentials not configured');
    return null;
  }

  // Crear instancia única (singleton)
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    console.log('✅ Pusher client initialized');
  }

  return pusherClientInstance;
}

// Helper para suscribirse a un canal
export function subscribeToPusherChannel(channelName: string) {
  const pusher = getPusherClient();
  
  if (!pusher) {
    console.warn(`⚠️  Cannot subscribe to channel "${channelName}" - Pusher not configured`);
    return null;
  }

  return pusher.subscribe(channelName);
}

// Helper para desuscribirse de un canal
export function unsubscribeFromPusherChannel(channelName: string) {
  const pusher = getPusherClient();
  
  if (!pusher) {
    return;
  }

  pusher.unsubscribe(channelName);
  console.log(`✅ Unsubscribed from channel: ${channelName}`);
}

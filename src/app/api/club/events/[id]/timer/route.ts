import { NextRequest, NextResponse } from 'next/server';

// Almacenamiento en memoria del estado del cronómetro por evento
const timers = new Map<string, {
  startTimestamp: number | null;
  isRunning: boolean;
  heatNumber: number;
  finalTime?: number;
}>();

// GET - Obtener el tiempo actual del cronómetro
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const timer = timers.get(eventId);
  
  if (!timer) {
    return NextResponse.json({
      time: 0,
      isRunning: false,
      serverTime: Date.now()
    });
  }

  let currentTime = 0;
  if (timer.isRunning && timer.startTimestamp) {
    currentTime = Date.now() - timer.startTimestamp;
  } else if (timer.finalTime !== undefined) {
    currentTime = timer.finalTime;
  }

  return NextResponse.json({
    time: currentTime,
    isRunning: timer.isRunning,
    heatNumber: timer.heatNumber,
    startTimestamp: timer.startTimestamp,
    serverTime: Date.now()
  });
}

// POST - Controlar el cronómetro (start, stop, reset)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const body = await request.json();
  const { action, heatNumber, finalTime } = body;

  let timer = timers.get(eventId);
  
  if (!timer) {
    timer = {
      startTimestamp: null,
      isRunning: false,
      heatNumber: heatNumber || 1
    };
    timers.set(eventId, timer);
  }

  const serverTime = Date.now();

  switch (action) {
    case 'start':
      timer.startTimestamp = serverTime;
      timer.isRunning = true;
      timer.heatNumber = heatNumber;
      delete timer.finalTime;
      
      return NextResponse.json({
        success: true,
        startTimestamp: timer.startTimestamp,
        serverTime,
        message: 'Timer started'
      });

    case 'stop':
      if (timer.isRunning && timer.startTimestamp) {
        timer.finalTime = finalTime || (serverTime - timer.startTimestamp);
        timer.isRunning = false;
      }
      
      return NextResponse.json({
        success: true,
        finalTime: timer.finalTime,
        serverTime,
        message: 'Timer stopped'
      });

    case 'reset':
      timer.startTimestamp = null;
      timer.isRunning = false;
      delete timer.finalTime;
      
      return NextResponse.json({
        success: true,
        serverTime,
        message: 'Timer reset'
      });

    default:
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
  }
}

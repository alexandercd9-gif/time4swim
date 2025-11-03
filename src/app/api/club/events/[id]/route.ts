import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/auth';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'club-events.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.stat(FILE);
  } catch (e) {
    await fs.writeFile(FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

// PUT: Actualizar un evento
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);
    const { id } = await context.params;
    const body = await request.json();
    const { title, date, location } = body || {};

    if (!title || !date) {
      return NextResponse.json({ error: 'title and date required' }, { status: 400 });
    }

    await ensureDataFile();
    const raw = await fs.readFile(FILE, 'utf8');
    const data = JSON.parse(raw || '[]');

    const eventIndex = data.findIndex((e: any) => e.id === id);
    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Solo ADMIN puede editar cualquier evento, CLUB solo puede editar sus propios eventos
    if (auth.user.role === 'CLUB') {
      const event = data[eventIndex];
      // Verificar que el evento pertenece al club del usuario
      const prisma = (await import('@/lib/prisma')).prisma;
      const userClubRelation = await prisma.userClub.findFirst({
        where: { userId: auth.user.id },
        include: { club: true }
      });
      
      if (event.club !== userClubRelation?.club?.name) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Actualizar el evento manteniendo el club y createdAt
    data[eventIndex] = {
      ...data[eventIndex],
      title,
      date,
      location: location || null,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');

    console.log('✅ Event updated:', data[eventIndex]);
    return NextResponse.json(data[eventIndex]);
  } catch (err) {
    console.error('PUT /api/club/events/[id] error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

// DELETE: Eliminar un evento
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🗑️ DELETE /api/club/events/[id] - Starting...');
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);
    console.log('✅ Auth successful, user:', auth.user.id, 'role:', auth.user.role);
    
    const { id } = await context.params;
    console.log('📝 Event ID to delete:', id);

    await ensureDataFile();
    const raw = await fs.readFile(FILE, 'utf8');
    const data = JSON.parse(raw || '[]');
    console.log('📄 Total events in file:', data.length);

    const eventIndex = data.findIndex((e: any) => e.id === id);
    console.log('🔍 Event index found:', eventIndex);
    
    if (eventIndex === -1) {
      console.log('❌ Event not found');
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Solo ADMIN puede eliminar cualquier evento
    // CLUB puede eliminar eventos (ya validado por requireAuth)
    if (auth.user.role === 'CLUB') {
      const event = data[eventIndex];
      console.log('🏊 Event club:', event.club);
      
      // Verificar que el evento pertenece al club del usuario
      const prisma = (await import('@/lib/prisma')).prisma;
      const userClubRelation = await prisma.userClub.findFirst({
        where: { userId: auth.user.id },
        include: { club: true }
      });
      
      const userClubName = userClubRelation?.club?.name;
      console.log('🏊 User club name:', userClubName);
      console.log('🏊 Event club name:', event.club);
      
      // Comparar nombres normalizados (minúsculas, sin espacios)
      const normalizeClubName = (name: string) => name?.toLowerCase().trim().replace(/\s+/g, '');
      
      if (normalizeClubName(event.club) !== normalizeClubName(userClubName || '')) {
        console.log('❌ Unauthorized - club mismatch');
        console.log('   Event club normalized:', normalizeClubName(event.club));
        console.log('   User club normalized:', normalizeClubName(userClubName || ''));
        return NextResponse.json({ error: 'Unauthorized - Este evento pertenece a otro club' }, { status: 403 });
      }
    }

    // Eliminar el evento
    data.splice(eventIndex, 1);
    await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf8');

    console.log('✅ Event deleted successfully:', id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ DELETE /api/club/events/[id] error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

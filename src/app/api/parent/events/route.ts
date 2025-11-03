import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

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

export async function GET(request: Request) {
  try {
    // Require parent authentication
    const auth = await requireAuth(request as any, ['PARENT', 'ADMIN']);
    
    await ensureDataFile();
    const raw = await fs.readFile(FILE, 'utf8');
    const allEvents = JSON.parse(raw || '[]');

    // If admin, return all events
    if (auth.user.role === 'ADMIN') {
      return NextResponse.json(allEvents);
    }

    // For parents: filter events by their children's clubs
    const userChildren = await prisma.userChild.findMany({
      where: { 
        userId: auth.user.id,
        isActive: true
      },
      include: {
        child: {
          include: {
            club: true
          }
        }
      }
    });

    console.log('👶 UserChildren encontrados:', userChildren.length);
    console.log('👶 Detalles:', JSON.stringify(userChildren.map(uc => ({
      childName: uc.child.name,
      clubId: uc.child.clubId,
      clubName: uc.child.club?.name
    })), null, 2));

    // Get unique club names from children
    const childrenClubs = new Set(
      userChildren
        .map(uc => uc.child.club?.name)
        .filter(Boolean)
    );

    console.log('🏊 Clubs únicos de los hijos:', Array.from(childrenClubs));
    console.log('📅 Total eventos en archivo:', allEvents.length);
    console.log('📅 Eventos detalles:', JSON.stringify(allEvents.map((e: any) => ({
      title: e.title,
      club: e.club,
      date: e.date
    })), null, 2));

    // If no children have clubs, return empty array
    if (childrenClubs.size === 0) {
      console.log('⚠️ No hay clubes asignados a los hijos');
      return NextResponse.json([]);
    }

    // Filter events by club names
    const filteredEvents = allEvents.filter((event: any) => 
      event.club && childrenClubs.has(event.club)
    );

    console.log('✅ Eventos filtrados para el padre:', filteredEvents.length);
    return NextResponse.json(filteredEvents);
  } catch (err) {
    console.error('GET /api/parent/events error', err);
    return NextResponse.json([], { status: 200 });
  }
}

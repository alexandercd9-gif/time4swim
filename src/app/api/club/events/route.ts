import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'club-events.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.stat(FILE);
  } catch (e) {
    // create file with empty array
    await fs.writeFile(FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

export async function GET() {
  try {
    await ensureDataFile();
    const raw = await fs.readFile(FILE, 'utf8');
    const data = JSON.parse(raw || '[]');
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/club/events error', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    // Require authenticated user with CLUB or ADMIN role
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);

    const body = await request.json();
    const { title, date, club, location } = body || {};
    if (!title || !date) {
      return NextResponse.json({ error: 'title and date required' }, { status: 400 });
    }

    // Get the club name from the database if user is CLUB role
    let clubName = club;
    if (!clubName && auth.user.role === 'CLUB') {
      const userClubRelation = await prisma.userClub.findFirst({
        where: { userId: auth.user.id },
        include: { club: true }
      });
      clubName = userClubRelation?.club?.name || null;
    }

    console.log('📝 Creating event with club:', clubName);

    await ensureDataFile();
    const raw = await fs.readFile(FILE, 'utf8');
    const data = JSON.parse(raw || '[]');

    const newEvent = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
      title,
      date,
      club: clubName || null,
      location: location || null,
      createdAt: new Date().toISOString(),
    };

    data.unshift(newEvent);
    // Keep last 100 events
    const trimmed = data.slice(0, 100);
    await fs.writeFile(FILE, JSON.stringify(trimmed, null, 2), 'utf8');

    console.log('✅ Event created:', newEvent);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (err) {
    console.error('POST /api/club/events error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}

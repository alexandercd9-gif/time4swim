const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkClubSwimmers() {
  try {
    // Ver todos los clubs
    const clubs = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            children: true
          }
        }
      }
    });

    console.log('\n=== CLUBES REGISTRADOS ===');
    clubs.forEach(club => {
      console.log(`\nClub: ${club.name}`);
      console.log(`  ID: ${club.id}`);
      console.log(`  Email: ${club.email || 'Sin email'}`);
      console.log(`  Nadadores: ${club._count.children}`);
    });

    // Ver todos los usuarios tipo CLUB
    const clubUsers = await prisma.user.findMany({
      where: { role: 'CLUB' },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    console.log('\n\n=== USUARIOS TIPO CLUB ===');
    clubUsers.forEach(user => {
      console.log(`\nUsuario: ${user.name}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
    });

    // Ver todos los nadadores con club asignado
    const swimmers = await prisma.child.findMany({
      where: {
        clubId: { not: null }
      },
      include: {
        club: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('\n\n=== NADADORES CON CLUB ASIGNADO ===');
    swimmers.forEach(swimmer => {
      console.log(`\nNadador: ${swimmer.name}`);
      console.log(`  ID: ${swimmer.id}`);
      console.log(`  Club: ${swimmer.club?.name || 'Sin club'}`);
      console.log(`  Club ID: ${swimmer.clubId}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClubSwimmers();

import { db } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // 1. Crear clubes de ejemplo
    console.log('📍 Creando clubes...');
    const club1 = await db.createClub({
      name: 'Club Acuático Metropolitano',
      address: 'Av. Principal 123, Ciudad',
      phone: '+1234567890',
      email: 'info@acuaticometro.com',
      website: 'https://acuaticometro.com',
      description: 'Club de natación con más de 20 años de experiencia formando campeones.'
    });

    const club2 = await db.createClub({
      name: 'Dolphins Swimming Club',
      address: 'Calle del Mar 456, Costa',
      phone: '+0987654321',
      email: 'contacto@dolphins.com',
      description: 'Club especializado en natación competitiva y recreativa.'
    });

    console.log('✅ Clubes creados');

    // 2. Crear usuarios padres de ejemplo
    console.log('👨‍👩‍👧‍👦 Creando usuarios padres...');
    const parent1 = await db.createUser({
      fullName: 'María García',
      email: 'maria.garcia@email.com',
      password: await bcrypt.hash('password123', 10),
      role: 'PARENT'
    });

    const parent2 = await db.createUser({
      fullName: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      password: await bcrypt.hash('password123', 10),
      role: 'PARENT'
    });

    const parent3 = await db.createUser({
      fullName: 'Ana López',
      email: 'ana.lopez@email.com',
      password: await bcrypt.hash('password123', 10),
      role: 'PARENT'
    });

    console.log('✅ Usuarios padres creados');

    // 3. Crear nadadores (hijos) de ejemplo
    console.log('🏊‍♂️ Creando nadadores...');
    const swimmer1 = await db.createChild({
      fullName: 'Sofia García Martínez',
      dateOfBirth: new Date('2012-03-15'),
      gender: 'F',
      clubId: club1.id,
      emergencyContact: 'María García - 555-0123',
      medicalNotes: 'Sin restricciones médicas'
    });

    const swimmer2 = await db.createChild({
      fullName: 'Diego Rodríguez Pérez',
      dateOfBirth: new Date('2013-07-22'),
      gender: 'M',
      clubId: club1.id,
      emergencyContact: 'Carlos Rodríguez - 555-0456',
      medicalNotes: 'Leve asma, inhalador disponible'
    });

    const swimmer3 = await db.createChild({
      fullName: 'Emma López Fernández',
      dateOfBirth: new Date('2011-11-08'),
      gender: 'F',
      clubId: club2.id,
      emergencyContact: 'Ana López - 555-0789',
      medicalNotes: 'Sin restricciones médicas'
    });

    const swimmer4 = await db.createChild({
      fullName: 'Lucas García Díaz',
      dateOfBirth: new Date('2014-02-14'),
      gender: 'M',
      clubId: club2.id,
      emergencyContact: 'María García - 555-0123',
      medicalNotes: 'Sin restricciones médicas'
    });

    const swimmer5 = await db.createChild({
      fullName: 'Isabella Rodríguez Smith',
      dateOfBirth: new Date('2010-09-30'),
      gender: 'F',
      clubId: club1.id,
      emergencyContact: 'Carlos Rodríguez - 555-0456',
      medicalNotes: 'Sin restricciones médicas'
    });

    console.log('✅ Nadadores creados');

    // 4. Crear relaciones padre-hijo
    console.log('👨‍👩‍👧‍👦 Creando relaciones familiares...');
    
    // María García es madre de Sofia y Lucas
    await db.createUserChild({
      userId: parent1.id,
      childId: swimmer1.id,
      parentType: 'MADRE',
      isEmergencyContact: true,
      canPickUp: true
    });

    await db.createUserChild({
      userId: parent1.id,
      childId: swimmer4.id,
      parentType: 'MADRE',
      isEmergencyContact: true,
      canPickUp: true
    });

    // Carlos Rodríguez es padre de Diego e Isabella
    await db.createUserChild({
      userId: parent2.id,
      childId: swimmer2.id,
      parentType: 'PADRE',
      isEmergencyContact: true,
      canPickUp: true
    });

    await db.createUserChild({
      userId: parent2.id,
      childId: swimmer5.id,
      parentType: 'PADRE',
      isEmergencyContact: true,
      canPickUp: true
    });

    // Ana López es madre de Emma
    await db.createUserChild({
      userId: parent3.id,
      childId: swimmer3.id,
      parentType: 'MADRE',
      isEmergencyContact: true,
      canPickUp: true
    });

    console.log('✅ Relaciones familiares creadas');

    // 5. Crear registros de competencias de ejemplo
    console.log('🏆 Creando registros de competencias...');
    
    const competitionResults = [
      {
        childId: swimmer1.id,
        style: 'FREESTYLE',
        poolSize: 'SHORT_25M',
        distance: 50,
        time: 32.45,
        date: new Date('2024-01-15'),
        competition: 'Campeonato Regional Juvenil 2024',
        position: 2,
        medal: 'SILVER',
        notes: 'Excelente técnica'
      },
      {
        childId: swimmer1.id,
        style: 'BACKSTROKE',
        poolSize: 'LONG_50M',
        distance: 100,
        time: 78.23,
        date: new Date('2024-02-20'),
        competition: 'Copa Metropolitan Spring',
        position: 1,
        medal: 'GOLD',
        notes: 'Nuevo récord personal'
      },
      {
        childId: swimmer2.id,
        style: 'FREESTYLE',
        poolSize: 'SHORT_25M',
        distance: 25,
        time: 18.67,
        date: new Date('2024-01-15'),
        competition: 'Campeonato Regional Juvenil 2024',
        position: 3,
        medal: 'BRONZE',
        notes: 'Primer competencia oficial'
      },
      {
        childId: swimmer3.id,
        style: 'BUTTERFLY',
        poolSize: 'SHORT_25M',
        distance: 50,
        time: 35.12,
        date: new Date('2024-03-10'),
        competition: 'Torneo Interclubes',
        position: 1,
        medal: 'GOLD',
        notes: 'Técnica perfecta'
      },
      {
        childId: swimmer4.id,
        style: 'BREASTSTROKE',
        poolSize: 'SHORT_25M',
        distance: 25,
        time: 22.89,
        date: new Date('2024-02-28'),
        competition: 'Copa Infantil',
        position: 2,
        medal: 'SILVER',
        notes: 'Mejora notable'
      },
      {
        childId: swimmer5.id,
        style: 'INDIVIDUAL_MEDLEY',
        poolSize: 'LONG_50M',
        distance: 100,
        time: 85.34,
        date: new Date('2024-03-15'),
        competition: 'Campeonato Nacional Juvenil',
        position: 1,
        medal: 'GOLD',
        notes: 'Récord del club'
      }
    ];

    for (const result of competitionResults) {
      await db.rawClient.record.create({ 
        data: {
          ...result,
          style: result.style as any,
          poolSize: result.poolSize as any,
          medal: result.medal as any
        }
      });
    }

    console.log('✅ Registros de competencias creados');

    // 6. Mostrar resumen de datos creados
    console.log('\n📊 Resumen de datos creados:');
    console.log(`🏢 Clubes: ${await db.count('club', {})}`);
    console.log(`👨‍👩‍👧‍👦 Usuarios: ${await db.count('user', {})}`);
    console.log(`🏊‍♂️ Nadadores: ${await db.count('child', {})}`);
    console.log(`👨‍👩‍👧‍👦 Relaciones familiares: ${await db.count('userChild', {})}`);
    console.log(`🏆 Registros de competencias: ${await db.count('record', {})}`);

    console.log('\n✅ Seed de la base de datos completado exitosamente!');
    console.log('📋 Credenciales de acceso de ejemplo:');
    console.log('   Email: maria.garcia@email.com');
    console.log('   Email: carlos.rodriguez@email.com');
    console.log('   Email: ana.lopez@email.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await db.rawClient.$disconnect();
  }
}

// Ejecutar el seed
seedDatabase()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
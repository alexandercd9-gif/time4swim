require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProductionDatabase() {
  try {
    console.log('🔍 Verificando estructura de base de datos...\n');

    // 1. Verificar que podemos conectar
    console.log('1️⃣ Probando conexión...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar tablas con query raw
    console.log('2️⃣ Verificando tablas existentes...');
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    console.log(`📋 Tablas encontradas: ${tables.length}`);
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('Tablas:', tableNames);
    
    const hasUserchildTable = tableNames.includes('userchild');
    console.log(`\n${hasUserchildTable ? '✅' : '❌'} Tabla userchild: ${hasUserchildTable ? 'EXISTE' : 'NO EXISTE'}\n`);

    // 3. Si existe userchild, verificar estructura
    if (hasUserchildTable) {
      console.log('3️⃣ Verificando estructura de userchild...');
      const columns = await prisma.$queryRaw`DESCRIBE userchild`;
      console.log('Columnas de userchild:');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key}`);
      });

      // 4. Contar registros
      console.log('\n4️⃣ Contando registros en userchild...');
      const count = await prisma.userchild.count();
      console.log(`📊 Registros en userchild: ${count}\n`);

      // 5. Ver algunos ejemplos
      if (count > 0) {
        console.log('5️⃣ Ejemplos de registros (primeros 3):');
        const samples = await prisma.userchild.findMany({
          take: 3,
          include: {
            user: { select: { email: true } },
            child: { select: { firstName: true, lastName: true } }
          }
        });
        samples.forEach(s => {
          console.log(`  - User: ${s.user.email} → Child: ${s.child.firstName} ${s.child.lastName} (Active: ${s.isActive})`);
        });
      }
    }

    // 6. Verificar usuarios con relación userchild
    console.log('\n6️⃣ Probando query que falla en producción...');
    const testUser = await prisma.user.findFirst({
      include: {
        subscription: true,
        userchild: { 
          where: { isActive: true },
          select: { id: true, userId: true }
        }
      }
    });
    
    if (testUser) {
      console.log(`✅ Query funciona correctamente`);
      console.log(`Usuario: ${testUser.email}`);
      console.log(`Hijos: ${testUser.userchild?.length || 0}`);
    } else {
      console.log('⚠️  No hay usuarios en la base de datos');
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionDatabase();

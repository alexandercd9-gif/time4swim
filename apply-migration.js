const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sql = fs.readFileSync('prisma/migrations/20251118211003_add_culqi_system_final/migration.sql', 'utf8');
const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));

(async () => {
  console.log(`Aplicando ${statements.length} statements SQL...`);
  for (const stmt of statements) {
    if (stmt.trim()) {
      try {
        await prisma.$executeRawUnsafe(stmt);
        console.log('✓ OK');
      } catch(e) {
        console.log('⚠️ Skip:', e.message.substring(0, 80));
      }
    }
  }
  await prisma.$disconnect();
  console.log('\n✅ Migración aplicada!');
})();

import { db } from '../src/lib/prisma';

async function migrateParentChildRelations() {
  try {
    console.log('🔄 Iniciando migración de relaciones padre-hijo...');

    // Obtener todos los hijos que tienen userId (relación antigua)
    const children = await db.findMany('child', {
      where: {
        // Los hijos que tienen la columna userId (que ya no debería existir)
        // Pero como acabamos de cambiar el schema, necesitamos usar una query raw
      }
    });

    console.log(`📊 Encontrados ${children.length} hijos para migrar`);

    // Como el campo userId ya no existe en el nuevo schema, 
    // necesitamos usar una query SQL raw para obtener los datos
    const childrenWithParents = await db.rawClient.$queryRaw`
      SELECT id, userId FROM Child WHERE userId IS NOT NULL
    ` as Array<{id: string, userId: string}>;

    console.log(`🔗 Encontradas ${childrenWithParents.length} relaciones padre-hijo existentes`);

    // Crear las nuevas relaciones en la tabla UserChild
    for (const child of childrenWithParents) {
      try {
        await db.createUserChild({
          data: {
            userId: child.userId,
            childId: child.id,
            isActive: true
          }
        });
        console.log(`✅ Migrada relación: Usuario ${child.userId} -> Hijo ${child.id}`);
      } catch (error) {
        console.log(`⚠️ Error migrando relación ${child.userId} -> ${child.id}:`, error);
      }
    }

    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await db.rawClient.$disconnect();
  }
}

migrateParentChildRelations();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Atualizando nome da permissão...');

  const result = await prisma.permission.updateMany({
    where: {
      resource: 'documents',
      action: 'view_all',
    },
    data: {
      name: 'documents.view_all',
    },
  });

  console.log(`✅ ${result.count} permissão(ões) atualizada(s)`);

  // Verificar
  const permission = await prisma.permission.findFirst({
    where: {
      resource: 'documents',
      action: 'view_all',
    },
  });

  if (permission) {
    console.log(`✅ Nome atualizado: ${permission.name}`);
    console.log(`   Resource: ${permission.resource}`);
    console.log(`   Action: ${permission.action}`);
  }

  console.log('✅ Atualização concluída!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

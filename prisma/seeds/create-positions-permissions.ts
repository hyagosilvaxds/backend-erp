import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPositionsPermissions() {
  const permissions = [
    {
      name: 'Create Positions',
      description: 'Permite criar novos cargos',
      resource: 'positions',
      action: 'create',
    },
    {
      name: 'Read Positions',
      description: 'Permite visualizar cargos',
      resource: 'positions',
      action: 'read',
    },
    {
      name: 'Update Positions',
      description: 'Permite editar cargos existentes',
      resource: 'positions',
      action: 'update',
    },
    {
      name: 'Delete Positions',
      description: 'Permite excluir cargos',
      resource: 'positions',
      action: 'delete',
    },
  ];

  for (const permission of permissions) {
    const existing = await prisma.permission.findUnique({
      where: {
        resource_action: {
          resource: permission.resource,
          action: permission.action,
        },
      },
    });

    if (!existing) {
      await prisma.permission.create({
        data: permission,
      });
      console.log(`✅ Permission ${permission.resource}.${permission.action} created`);
    } else {
      console.log(`⏭️  Permission ${permission.resource}.${permission.action} already exists`);
    }
  }

  console.log('\n✅ Positions permissions created successfully!');
}

createPositionsPermissions()
  .catch((e) => {
    console.error('❌ Error creating positions permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDepartmentsPermissions() {
  const permissions = [
    {
      name: 'Create Departments',
      description: 'Permite criar novos departamentos',
      resource: 'departments',
      action: 'create',
    },
    {
      name: 'Read Departments',
      description: 'Permite visualizar departamentos',
      resource: 'departments',
      action: 'read',
    },
    {
      name: 'Update Departments',
      description: 'Permite editar departamentos existentes',
      resource: 'departments',
      action: 'update',
    },
    {
      name: 'Delete Departments',
      description: 'Permite excluir departamentos',
      resource: 'departments',
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

  console.log('\n✅ Departments permissions created successfully!');
}

createDepartmentsPermissions()
  .catch((e) => {
    console.error('❌ Error creating departments permissions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

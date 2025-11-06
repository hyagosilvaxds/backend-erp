import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Criando permissões de clientes...');

  // Criar permissões de clientes
  const customerPermissions = [
    {
      name: 'customers.create',
      description: 'Criar clientes',
      resource: 'customers',
      action: 'create',
    },
    {
      name: 'customers.read',
      description: 'Visualizar clientes',
      resource: 'customers',
      action: 'read',
    },
    {
      name: 'customers.update',
      description: 'Atualizar clientes',
      resource: 'customers',
      action: 'update',
    },
    {
      name: 'customers.delete',
      description: 'Deletar clientes',
      resource: 'customers',
      action: 'delete',
    },
  ];

  for (const permission of customerPermissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    });
    console.log(`✅ Permissão criada: ${permission.name}`);
  }

  // Buscar roles
  const adminRole = await prisma.role.findFirst({
    where: { name: 'admin' },
  });

  const managerRole = await prisma.role.findFirst({
    where: { name: 'manager' },
  });

  if (adminRole) {
    // Admin tem todas as permissões
    const allPermissions = await prisma.permission.findMany({
      where: {
        resource: 'customers',
      },
    });

    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
    console.log(`✅ Permissões de clientes vinculadas ao role admin`);
  }

  if (managerRole) {
    // Manager tem todas as permissões de clientes
    const allPermissions = await prisma.permission.findMany({
      where: {
        resource: 'customers',
      },
    });

    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      });
    }
    console.log(`✅ Permissões de clientes vinculadas ao role manager`);
  }

  console.log('✅ Seed de permissões de clientes concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

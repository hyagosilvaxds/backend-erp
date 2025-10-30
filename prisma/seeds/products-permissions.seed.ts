import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProductsPermissions() {
  console.log('🌱 Criando permissões do módulo de produtos...');

  // Definir todas as permissões do módulo de produtos
  const permissions = [
    // CRUD básico de produtos
    {
      name: 'products.read',
      description: 'Visualizar produtos',
      resource: 'products',
      action: 'read',
    },
    {
      name: 'products.create',
      description: 'Criar produtos',
      resource: 'products',
      action: 'create',
    },
    {
      name: 'products.update',
      description: 'Atualizar produtos',
      resource: 'products',
      action: 'update',
    },
    {
      name: 'products.delete',
      description: 'Deletar produtos',
      resource: 'products',
      action: 'delete',
    },
    
    // Gerenciamento de estoque
    {
      name: 'products.manage_stock',
      description: 'Gerenciar estoque (movimentações)',
      resource: 'products',
      action: 'manage_stock',
    },
    {
      name: 'products.view_stock_history',
      description: 'Visualizar histórico de movimentações',
      resource: 'products',
      action: 'view_stock_history',
    },
  ];

  // Criar ou atualizar permissões
  for (const permission of permissions) {
    const existingPermission = await prisma.permission.findFirst({
      where: { name: permission.name },
    });

    if (existingPermission) {
      await prisma.permission.update({
        where: { id: existingPermission.id },
        data: {
          description: permission.description,
          resource: permission.resource,
          action: permission.action,
        },
      });
      console.log(`✅ Permissão atualizada: ${permission.name}`);
    } else {
      await prisma.permission.create({
        data: permission,
      });
      console.log(`✅ Permissão criada: ${permission.name}`);
    }
  }

  // Associar permissões ao role de admin
  const adminRole = await prisma.role.findFirst({
    where: { name: 'admin' },
  });

  if (adminRole) {
    console.log('\n🔗 Associando permissões ao role admin...');

    for (const permission of permissions) {
      const permissionRecord = await prisma.permission.findFirst({
        where: { name: permission.name },
      });

      if (permissionRecord) {
        const hasPermission = await prisma.rolePermission.findUnique({
          where: {
            roleId_permissionId: {
              roleId: adminRole.id,
              permissionId: permissionRecord.id,
            },
          },
        });

        if (!hasPermission) {
          await prisma.rolePermission.create({
            data: {
              roleId: adminRole.id,
              permissionId: permissionRecord.id,
            },
          });
          console.log(`✅ Permissão ${permission.name} associada ao admin`);
        } else {
          console.log(`⏭️  Permissão ${permission.name} já associada ao admin`);
        }
      }
    }
  } else {
    console.log('⚠️  Role admin não encontrado. As permissões foram criadas mas não associadas.');
  }

  console.log('\n✅ Seed de permissões de produtos concluído!');
}

seedProductsPermissions()
  .catch((e) => {
    console.error('❌ Erro ao executar seed de permissões de produtos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

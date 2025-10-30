import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Criando permissão de acesso a documentos restritos...');

  // Criar permissão especial
  const permission = await prisma.permission.upsert({
    where: {
      resource_action: {
        resource: 'documents',
        action: 'view_all',
      },
    },
    update: {},
    create: {
      name: 'documents.view_all',
      description:
        'Permite visualizar todos os documentos e pastas, mesmo aqueles restritos a outras roles',
      resource: 'documents',
      action: 'view_all',
    },
  });

  console.log(`✅ ${permission.resource}.${permission.action} - ${permission.name}`);

  // Adicionar à role admin
  const adminRole = await prisma.role.findFirst({
    where: { name: 'admin' },
  });

  if (adminRole) {
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

    console.log(`✅ Permissão adicionada à role admin`);
  }

  console.log('✅ Seed de permissão de acesso concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

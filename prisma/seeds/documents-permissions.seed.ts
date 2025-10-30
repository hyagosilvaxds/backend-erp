import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDocumentPermissions() {
  console.log('🔑 Criando permissões de documentos...');

  const permissions = [
    {
      name: 'documents.read',
      description: 'Visualizar documentos e pastas',
      resource: 'documents',
      action: 'read',
    },
    {
      name: 'documents.create',
      description: 'Fazer upload de documentos e criar pastas',
      resource: 'documents',
      action: 'create',
    },
    {
      name: 'documents.update',
      description: 'Editar metadados e mover documentos',
      resource: 'documents',
      action: 'update',
    },
    {
      name: 'documents.delete',
      description: 'Deletar documentos e pastas',
      resource: 'documents',
      action: 'delete',
    },
  ];

  for (const permission of permissions) {
    const created = await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    });
    console.log(`  ✅ ${created.name} - ${created.description}`);
  }

  // Adicionar permissões à role admin
  console.log('\n🎭 Adicionando permissões de documentos à role admin...');
  
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  });

  if (adminRole) {
    const documentPermissions = await prisma.permission.findMany({
      where: {
        resource: 'documents',
      },
    });

    for (const permission of documentPermissions) {
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
    console.log(`  ✅ ${documentPermissions.length} permissões adicionadas à role admin`);
  } else {
    console.log('  ⚠️  Role admin não encontrada');
  }

  console.log('\n✅ Permissões de documentos criadas com sucesso!');
}

// Se executar direto
if (require.main === module) {
  seedDocumentPermissions()
    .catch((e) => {
      console.error('❌ Erro ao criar permissões:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

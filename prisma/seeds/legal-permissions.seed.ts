import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Criando permissões do módulo jurídico...');

  // Permissões do módulo jurídico
  const legalPermissions = [
    {
      name: 'legal.create',
      description: 'Criar documentos e categorias jurídicas',
      resource: 'legal',
      action: 'create',
    },
    {
      name: 'legal.read',
      description: 'Visualizar documentos e categorias jurídicas',
      resource: 'legal',
      action: 'read',
    },
    {
      name: 'legal.update',
      description: 'Atualizar documentos e categorias jurídicas',
      resource: 'legal',
      action: 'update',
    },
    {
      name: 'legal.delete',
      description: 'Excluir documentos e categorias jurídicas',
      resource: 'legal',
      action: 'delete',
    },
  ];

  for (const perm of legalPermissions) {
    const existingPerm = await prisma.permission.findUnique({
      where: { name: perm.name },
    });

    if (existingPerm) {
      console.log(`  ⚠️  Permissão ${perm.name} já existe`);
    } else {
      await prisma.permission.create({
        data: perm,
      });
      console.log(`  ✅ Permissão ${perm.name} criada`);
    }
  }

  // Adicionar permissões ao role admin
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  });

  if (adminRole) {
    console.log('\n🔧 Adicionando permissões ao role admin...');
    
    for (const perm of legalPermissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: perm.name },
      });

      if (permission) {
        const existingRolePermission = await prisma.rolePermission.findUnique({
          where: {
            roleId_permissionId: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          },
        });

        if (!existingRolePermission) {
          await prisma.rolePermission.create({
            data: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          });
          console.log(`  ✅ Permissão ${perm.name} adicionada ao admin`);
        } else {
          console.log(`  ⚠️  Permissão ${perm.name} já está no admin`);
        }
      }
    }
  } else {
    console.log('\n  ⚠️  Role admin não encontrada');
  }

  console.log('\n✅ Seeds do módulo jurídico concluídas!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seeds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

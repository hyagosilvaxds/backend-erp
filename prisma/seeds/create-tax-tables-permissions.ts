import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔑 Criando permissões de tabelas fiscais...');

  const permissions = [
    {
      name: 'Criar Tabelas Fiscais',
      description: 'Permite criar novas tabelas fiscais (INSS, FGTS, IRRF)',
      resource: 'tax_tables',
      action: 'create',
    },
    {
      name: 'Visualizar Tabelas Fiscais',
      description: 'Permite visualizar tabelas fiscais',
      resource: 'tax_tables',
      action: 'read',
    },
    {
      name: 'Atualizar Tabelas Fiscais',
      description: 'Permite atualizar tabelas fiscais existentes',
      resource: 'tax_tables',
      action: 'update',
    },
    {
      name: 'Deletar Tabelas Fiscais',
      description: 'Permite deletar tabelas fiscais',
      resource: 'tax_tables',
      action: 'delete',
    },
  ];

  for (const permission of permissions) {
    const existing = await prisma.permission.findFirst({
      where: {
        resource: permission.resource,
        action: permission.action,
      },
    });

    if (existing) {
      console.log(`⏭️  Permissão ${permission.resource}.${permission.action} já existe`);
    } else {
      await prisma.permission.create({
        data: permission,
      });
      console.log(`✅ Permissão ${permission.resource}.${permission.action} criada`);
    }
  }

  console.log('✅ Permissões de tabelas fiscais criadas com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar permissões:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

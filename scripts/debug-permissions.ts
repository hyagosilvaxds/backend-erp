import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPermissions() {
  console.log('🔍 Verificando permissões do sistema...\n');

  // 1. Verificar role Admin
  const adminRole = await prisma.role.findFirst({
    where: {
      OR: [
        { name: 'admin' },
        { name: 'Admin' },
        { name: 'ADMIN' },
      ],
    },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!adminRole) {
    console.log('❌ Role Admin não encontrada!');
    return;
  }

  console.log(`✅ Role encontrada: ${adminRole.name} (ID: ${adminRole.id})`);
  console.log(`   Total de permissões vinculadas: ${adminRole.rolePermissions.length}\n`);

  // 2. Listar permissões de RH
  const hrPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { name: { startsWith: 'employees.' } },
        { name: { startsWith: 'earning_types.' } },
        { name: { startsWith: 'deduction_types.' } },
        { name: { startsWith: 'cost_centers.' } },
        { name: { startsWith: 'employee_earnings.' } },
        { name: { startsWith: 'payroll.' } },
      ],
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log('📋 Permissões de RH cadastradas:');
  hrPermissions.forEach((perm) => {
    const hasPermission = adminRole.rolePermissions.some(
      (rp) => rp.permissionId === perm.id,
    );
    const icon = hasPermission ? '✅' : '❌';
    console.log(`   ${icon} ${perm.name}`);
  });

  // 3. Verificar usuários Admin
  console.log('\n👥 Usuários com role Admin:');
  const adminUsers = await prisma.user.findMany({
    where: {
      companies: {
        some: {
          roleId: adminRole.id,
        },
      },
    },
    include: {
      companies: {
        include: {
          role: true,
          company: {
            select: {
              id: true,
              razaoSocial: true,
            },
          },
        },
      },
    },
  });

  if (adminUsers.length === 0) {
    console.log('   ❌ Nenhum usuário com role Admin encontrado!');
  } else {
    adminUsers.forEach((user) => {
      console.log(`   ✅ ${user.name} (${user.email})`);
      console.log(`      ID: ${user.id}`);
      const companiesInfo = user.companies.map((uc) => `${uc.company.razaoSocial} (${uc.role.name})`).join(', ');
      console.log(`      Empresas: ${companiesInfo}`);
    });
  }

  // 4. Verificar permissões faltantes
  const expectedPermissions = [
    'employees.create',
    'employees.read',
    'employees.update',
    'employees.delete',
    'earning_types.create',
    'earning_types.read',
    'earning_types.update',
    'earning_types.delete',
    'deduction_types.create',
    'deduction_types.read',
    'deduction_types.update',
    'deduction_types.delete',
    'cost_centers.create',
    'cost_centers.read',
    'cost_centers.update',
    'cost_centers.delete',
    'employee_earnings.create',
    'employee_earnings.read',
    'employee_earnings.update',
    'employee_earnings.delete',
    'payroll.create',
    'payroll.read',
    'payroll.calculate',
    'payroll.approve',
    'payroll.update',
    'payroll.delete',
  ];

  const adminPermissionNames = adminRole.rolePermissions.map(
    (rp) => rp.permission.name,
  );
  const missingPermissions = expectedPermissions.filter(
    (perm) => !adminPermissionNames.includes(perm),
  );

  if (missingPermissions.length > 0) {
    console.log('\n⚠️  Permissões faltantes no role Admin:');
    missingPermissions.forEach((perm) => {
      console.log(`   ❌ ${perm}`);
    });
  } else {
    console.log('\n✅ Todas as permissões esperadas estão vinculadas ao Admin!');
  }

  // 5. Verificar estrutura de permissões no banco
  console.log('\n📊 Estatísticas:');
  const totalPermissions = await prisma.permission.count();
  const totalRoles = await prisma.role.count();
  const totalUsers = await prisma.user.count();

  console.log(`   Total de permissões: ${totalPermissions}`);
  console.log(`   Total de roles: ${totalRoles}`);
  console.log(`   Total de usuários: ${totalUsers}`);
  console.log(`   Permissões do Admin: ${adminRole.rolePermissions.length}`);

  await prisma.$disconnect();
}

debugPermissions().catch((error) => {
  console.error('❌ Erro ao verificar permissões:', error);
  process.exit(1);
});

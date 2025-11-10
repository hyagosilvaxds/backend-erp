import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPermissions() {
  console.log('🔍 Verificando permissões de RH...\n');

  // 1. Verificar se as permissões existem
  const hrPermissions = await prisma.permission.findMany({
    where: {
      name: {
        startsWith: 'employees',
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log(`✅ Permissões de employees encontradas: ${hrPermissions.length}`);
  hrPermissions.forEach((perm) => {
    console.log(`   - ${perm.name}: ${perm.description}`);
  });

  // 2. Verificar role Admin
  const adminRole = await prisma.role.findFirst({
    where: {
      name: 'Admin',
    },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (adminRole) {
    console.log(`\n✅ Role Admin encontrada (ID: ${adminRole.id})`);
    
    const employeePermissions = adminRole.rolePermissions.filter(
      (rp) => rp.permission.name.startsWith('employees')
    );
    
    console.log(`   Permissões de employees vinculadas: ${employeePermissions.length}`);
    employeePermissions.forEach((rp) => {
      console.log(`   - ${rp.permission.name}`);
    });
  } else {
    console.log('\n❌ Role Admin não encontrada');
  }

  // 3. Verificar usuários com role Admin
  const adminUsers = await prisma.userCompany.findMany({
    where: {
      roleId: adminRole?.id,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      company: {
        select: {
          id: true,
          nomeFantasia: true,
        },
      },
    },
  });

  console.log(`\n✅ Usuários com role Admin: ${adminUsers.length}`);
  adminUsers.forEach((uc) => {
    console.log(`   - ${uc.user.name} (${uc.user.email})`);
    console.log(`     Empresa: ${uc.company.nomeFantasia} (${uc.companyId})`);
    console.log(`     Ativo: ${uc.active}`);
  });

  // 4. Listar todas as permissões de RH
  const allHRPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { name: { startsWith: 'employees' } },
        { name: { startsWith: 'cost_centers' } },
        { name: { startsWith: 'earning_types' } },
        { name: { startsWith: 'deduction_types' } },
        { name: { startsWith: 'employee_earnings' } },
        { name: { startsWith: 'payroll' } },
      ],
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log(`\n✅ Total de permissões de RH: ${allHRPermissions.length}`);
  allHRPermissions.forEach((perm) => {
    console.log(`   - ${perm.name}`);
  });
}

checkPermissions()
  .catch((e) => {
    console.error('❌ Erro:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

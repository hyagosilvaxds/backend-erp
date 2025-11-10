import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllPermissions() {
  console.log('📋 Listando TODAS as permissões no banco:\n');

  const allPermissions = await prisma.permission.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  console.log(`Total: ${allPermissions.length} permissões\n`);

  allPermissions.forEach((perm, index) => {
    console.log(`${index + 1}. ${perm.name}`);
    console.log(`   Resource: ${perm.resource} | Action: ${perm.action}`);
    console.log(`   ID: ${perm.id}\n`);
  });

  // Filtrar por RH
  const hrPermissions = allPermissions.filter(
    (p) =>
      p.resource === 'employees' ||
      p.resource === 'earning_types' ||
      p.resource === 'deduction_types' ||
      p.resource === 'cost_centers' ||
      p.resource === 'employee_earnings' ||
      p.resource === 'payroll',
  );

  console.log(`\n🎯 Permissões de RH encontradas: ${hrPermissions.length}`);
  hrPermissions.forEach((perm) => {
    console.log(`   ✅ ${perm.resource}.${perm.action} - ${perm.name}`);
  });

  await prisma.$disconnect();
}

listAllPermissions().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});

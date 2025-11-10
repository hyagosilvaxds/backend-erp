import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkHRPermissions() {
  console.log('🔍 Verificando se as permissões de RH existem no banco...\n');

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

  console.log('📋 Verificando existência das permissões:\n');

  for (const permName of expectedPermissions) {
    const [resource, action] = permName.split('.');
    
    const permission = await prisma.permission.findUnique({
      where: {
        resource_action: {
          resource,
          action,
        },
      },
    });

    if (permission) {
      console.log(`✅ ${permName} - ID: ${permission.id}`);
    } else {
      console.log(`❌ ${permName} - NÃO EXISTE`);
    }
  }

  // Verificar vinculação com admin
  console.log('\n🔗 Verificando vinculação com role admin:\n');
  
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  });

  if (!adminRole) {
    console.log('❌ Role admin não encontrada!');
    return;
  }

  for (const permName of expectedPermissions) {
    const [resource, action] = permName.split('.');
    
    const permission = await prisma.permission.findUnique({
      where: {
        resource_action: {
          resource,
          action,
        },
      },
    });

    if (permission) {
      const rolePermission = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
      });

      if (rolePermission) {
        console.log(`✅ ${permName} - Vinculada ao admin`);
      } else {
        console.log(`❌ ${permName} - NÃO vinculada ao admin`);
      }
    }
  }

  await prisma.$disconnect();
}

checkHRPermissions().catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});

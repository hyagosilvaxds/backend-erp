import { PrismaClient, Permission } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Criando permissões do módulo de RH...');

  // Permissões de Colaboradores (Employees)
  const employeePermissions = [
    {
      name: 'Criar Colaborador',
      description: 'Permite criar novos colaboradores',
      resource: 'employees',
      action: 'create',
    },
    {
      name: 'Visualizar Colaboradores',
      description: 'Permite visualizar colaboradores',
      resource: 'employees',
      action: 'read',
    },
    {
      name: 'Atualizar Colaborador',
      description: 'Permite atualizar dados de colaboradores',
      resource: 'employees',
      action: 'update',
    },
    {
      name: 'Deletar Colaborador',
      description: 'Permite deletar colaboradores',
      resource: 'employees',
      action: 'delete',
    },
  ];

  // Permissões de Centros de Custo
  const costCenterPermissions = [
    {
      name: 'Criar Centro de Custo',
      description: 'Permite criar novos centros de custo',
      resource: 'cost_centers',
      action: 'create',
    },
    {
      name: 'Visualizar Centros de Custo',
      description: 'Permite visualizar centros de custo',
      resource: 'cost_centers',
      action: 'read',
    },
    {
      name: 'Atualizar Centro de Custo',
      description: 'Permite atualizar centros de custo',
      resource: 'cost_centers',
      action: 'update',
    },
    {
      name: 'Deletar Centro de Custo',
      description: 'Permite deletar centros de custo',
      resource: 'cost_centers',
      action: 'delete',
    },
  ];

  // Permissões de Tipos de Proventos
  const earningTypePermissions = [
    {
      name: 'Criar Tipo de Provento',
      description: 'Permite criar tipos de proventos',
      resource: 'earning_types',
      action: 'create',
    },
    {
      name: 'Visualizar Tipos de Proventos',
      description: 'Permite visualizar tipos de proventos',
      resource: 'earning_types',
      action: 'read',
    },
    {
      name: 'Atualizar Tipo de Provento',
      description: 'Permite atualizar tipos de proventos',
      resource: 'earning_types',
      action: 'update',
    },
    {
      name: 'Deletar Tipo de Provento',
      description: 'Permite deletar tipos de proventos',
      resource: 'earning_types',
      action: 'delete',
    },
  ];

  // Permissões de Tipos de Descontos
  const deductionTypePermissions = [
    {
      name: 'Criar Tipo de Desconto',
      description: 'Permite criar tipos de descontos',
      resource: 'deduction_types',
      action: 'create',
    },
    {
      name: 'Visualizar Tipos de Descontos',
      description: 'Permite visualizar tipos de descontos',
      resource: 'deduction_types',
      action: 'read',
    },
    {
      name: 'Atualizar Tipo de Desconto',
      description: 'Permite atualizar tipos de descontos',
      resource: 'deduction_types',
      action: 'update',
    },
    {
      name: 'Deletar Tipo de Desconto',
      description: 'Permite deletar tipos de descontos',
      resource: 'deduction_types',
      action: 'delete',
    },
  ];

  // Permissões de Proventos de Colaboradores
  const employeeEarningPermissions = [
    {
      name: 'Adicionar Provento ao Colaborador',
      description: 'Permite adicionar proventos aos colaboradores',
      resource: 'employee_earnings',
      action: 'create',
    },
    {
      name: 'Visualizar Proventos de Colaboradores',
      description: 'Permite visualizar proventos dos colaboradores',
      resource: 'employee_earnings',
      action: 'read',
    },
    {
      name: 'Atualizar Provento de Colaborador',
      description: 'Permite atualizar proventos dos colaboradores',
      resource: 'employee_earnings',
      action: 'update',
    },
    {
      name: 'Remover Provento de Colaborador',
      description: 'Permite remover proventos dos colaboradores',
      resource: 'employee_earnings',
      action: 'delete',
    },
  ];

  // Permissões de Folha de Pagamento
  const payrollPermissions = [
    {
      name: 'Criar Folha de Pagamento',
      description: 'Permite criar folhas de pagamento',
      resource: 'payroll',
      action: 'create',
    },
    {
      name: 'Visualizar Folhas de Pagamento',
      description: 'Permite visualizar folhas de pagamento',
      resource: 'payroll',
      action: 'read',
    },
    {
      name: 'Calcular Folha de Pagamento',
      description: 'Permite calcular folhas de pagamento',
      resource: 'payroll',
      action: 'calculate',
    },
    {
      name: 'Aprovar Folha de Pagamento',
      description: 'Permite aprovar folhas de pagamento',
      resource: 'payroll',
      action: 'approve',
    },
    {
      name: 'Atualizar Folha de Pagamento',
      description: 'Permite atualizar folhas de pagamento',
      resource: 'payroll',
      action: 'update',
    },
    {
      name: 'Deletar Folha de Pagamento',
      description: 'Permite deletar folhas de pagamento',
      resource: 'payroll',
      action: 'delete',
    },
  ];

  const allPermissions = [
    ...employeePermissions,
    ...costCenterPermissions,
    ...earningTypePermissions,
    ...deductionTypePermissions,
    ...employeeEarningPermissions,
    ...payrollPermissions,
  ];

  // Criar permissões
  const createdPermissions: Permission[] = [];
  for (const permission of allPermissions) {
    const created = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: permission.resource,
          action: permission.action,
        },
      },
      update: {
        name: permission.name,
        description: permission.description,
      },
      create: permission,
    });
    createdPermissions.push(created);
    console.log(`✅ Permissão criada: ${permission.resource}.${permission.action}`);
  }

  // Buscar roles admin e manager
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  });

  const managerRole = await prisma.role.findUnique({
    where: { name: 'manager' },
  });

  if (!adminRole || !managerRole) {
    console.log('⚠️  Roles admin ou manager não encontradas. Execute o seed de roles primeiro.');
    return;
  }

  // Vincular todas as permissões ao admin
  for (const permission of createdPermissions) {
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
  console.log('✅ Permissões de RH vinculadas ao role admin');

  // Vincular permissões de leitura ao manager
  const managerPermissionResources = [
    { resource: 'employees', action: 'read' },
    { resource: 'cost_centers', action: 'read' },
    { resource: 'earning_types', action: 'read' },
    { resource: 'deduction_types', action: 'read' },
    { resource: 'employee_earnings', action: 'read' },
    { resource: 'payroll', action: 'read' },
  ];

  const managerPermissions = createdPermissions.filter((p) =>
    managerPermissionResources.some(
      (mp) => mp.resource === p.resource && mp.action === p.action,
    ),
  );

  for (const permission of managerPermissions) {
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
  console.log('✅ Permissões de leitura de RH vinculadas ao role manager');

  console.log('✅ Seed de permissões de RH concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

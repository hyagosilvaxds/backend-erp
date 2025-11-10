import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedPlanoContas } from './seedPlanoContas';
import { seedCentrosCusto } from './seedCentrosCusto';
import { seedTaxTables } from './seedTaxTables';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar Plano de Contas
  const planoContasId = await seedPlanoContas();

  // Criar Permissões
  console.log('📋 Criando permissões...');
  const permissions = await Promise.all([
    // Permissões de Usuários
    prisma.permission.upsert({
      where: { name: 'users.create' },
      update: {},
      create: {
        name: 'users.create',
        description: 'Criar usuários',
        resource: 'users',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.read' },
      update: {},
      create: {
        name: 'users.read',
        description: 'Visualizar usuários',
        resource: 'users',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.update' },
      update: {},
      create: {
        name: 'users.update',
        description: 'Atualizar usuários',
        resource: 'users',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'users.delete' },
      update: {},
      create: {
        name: 'users.delete',
        description: 'Deletar usuários',
        resource: 'users',
        action: 'delete',
      },
    }),

    // Permissões de Empresas
    prisma.permission.upsert({
      where: { name: 'companies.create' },
      update: {},
      create: {
        name: 'companies.create',
        description: 'Criar empresas',
        resource: 'companies',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'companies.read' },
      update: {},
      create: {
        name: 'companies.read',
        description: 'Visualizar empresas',
        resource: 'companies',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'companies.update' },
      update: {},
      create: {
        name: 'companies.update',
        description: 'Atualizar empresas',
        resource: 'companies',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'companies.delete' },
      update: {},
      create: {
        name: 'companies.delete',
        description: 'Deletar empresas',
        resource: 'companies',
        action: 'delete',
      },
    }),

    // Permissões de Produtos
    prisma.permission.upsert({
      where: { name: 'products.create' },
      update: {},
      create: {
        name: 'products.create',
        description: 'Criar produtos',
        resource: 'products',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'products.read' },
      update: {},
      create: {
        name: 'products.read',
        description: 'Visualizar produtos',
        resource: 'products',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'products.update' },
      update: {},
      create: {
        name: 'products.update',
        description: 'Atualizar produtos',
        resource: 'products',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'products.delete' },
      update: {},
      create: {
        name: 'products.delete',
        description: 'Deletar produtos',
        resource: 'products',
        action: 'delete',
      },
    }),

    // Permissões de Vendas
    prisma.permission.upsert({
      where: { name: 'sales.create' },
      update: {},
      create: {
        name: 'sales.create',
        description: 'Criar vendas',
        resource: 'sales',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'sales.read' },
      update: {},
      create: {
        name: 'sales.read',
        description: 'Visualizar vendas',
        resource: 'sales',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'sales.update' },
      update: {},
      create: {
        name: 'sales.update',
        description: 'Atualizar vendas',
        resource: 'sales',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'sales.delete' },
      update: {},
      create: {
        name: 'sales.delete',
        description: 'Deletar vendas',
        resource: 'sales',
        action: 'delete',
      },
    }),

    // Permissões de Relatórios
    prisma.permission.upsert({
      where: { name: 'reports.read' },
      update: {},
      create: {
        name: 'reports.read',
        description: 'Visualizar relatórios',
        resource: 'reports',
        action: 'read',
      },
    }),

    // Permissões de Contabilidade/Plano de Contas
    prisma.permission.upsert({
      where: { name: 'accounting.create' },
      update: {},
      create: {
        name: 'accounting.create',
        description: 'Criar plano de contas e contas contábeis',
        resource: 'accounting',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'accounting.read' },
      update: {},
      create: {
        name: 'accounting.read',
        description: 'Visualizar plano de contas e contas contábeis',
        resource: 'accounting',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'accounting.update' },
      update: {},
      create: {
        name: 'accounting.update',
        description: 'Atualizar plano de contas e contas contábeis',
        resource: 'accounting',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'accounting.delete' },
      update: {},
      create: {
        name: 'accounting.delete',
        description: 'Deletar plano de contas e contas contábeis',
        resource: 'accounting',
        action: 'delete',
      },
    }),

    // Permissões de Tabelas Fiscais (INSS, FGTS, IRRF)
    prisma.permission.upsert({
      where: { name: 'tax_tables.create' },
      update: {},
      create: {
        name: 'tax_tables.create',
        description: 'Criar tabelas fiscais (INSS, FGTS, IRRF)',
        resource: 'tax_tables',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'tax_tables.read' },
      update: {},
      create: {
        name: 'tax_tables.read',
        description: 'Visualizar tabelas fiscais',
        resource: 'tax_tables',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'tax_tables.update' },
      update: {},
      create: {
        name: 'tax_tables.update',
        description: 'Atualizar tabelas fiscais',
        resource: 'tax_tables',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'tax_tables.delete' },
      update: {},
      create: {
        name: 'tax_tables.delete',
        description: 'Deletar tabelas fiscais',
        resource: 'tax_tables',
        action: 'delete',
      },
    }),

    // Permissão de Gerenciamento de Empresas (Admin)
    prisma.permission.upsert({
      where: { name: 'MANAGE_COMPANIES' },
      update: {},
      create: {
        name: 'MANAGE_COMPANIES',
        description: 'Gerenciar empresas e visualizar auditoria',
        resource: 'companies',
        action: 'manage',
      },
    }),
  ]);

  console.log(`✅ ${permissions.length} permissões criadas`);

  // Criar Roles
  console.log('👥 Criando roles...');
  
  // Admin - Tem todas as permissões
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrador - Acesso total ao sistema',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Gerente',
    },
  });

  const salesRole = await prisma.role.upsert({
    where: { name: 'sales' },
    update: {},
    create: {
      name: 'sales',
      description: 'Vendedor',
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: {
      name: 'viewer',
      description: 'Visualizador',
    },
  });

  console.log('✅ 4 roles criadas');

  // Atribuir permissões às roles
  console.log('🔗 Atribuindo permissões às roles...');

  // Admin tem TODAS as permissões
  for (const permission of permissions) {
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

  // Manager tem permissões de leitura, criação e atualização
  const managerPermissions = permissions.filter(
    (p) => p.action !== 'delete' || p.resource === 'products',
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

  // Sales tem permissões de vendas e produtos
  const salesPermissions = permissions.filter(
    (p) =>
      p.resource === 'sales' ||
      (p.resource === 'products' && p.action === 'read'),
  );
  for (const permission of salesPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: salesRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: salesRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Viewer tem apenas permissões de leitura
  const viewerPermissions = permissions.filter((p) => p.action === 'read');
  for (const permission of viewerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Permissões atribuídas às roles');

  // Criar Empresas
  console.log('🏢 Criando empresas...');
  const company1 = await prisma.company.upsert({
    where: { cnpj: '11222333000144' },
    update: {},
    create: {
      razaoSocial: 'Empresa Alpha Comércio Ltda',
      nomeFantasia: 'Empresa Alpha',
      cnpj: '11222333000144',
      inscricaoEstadual: '123456789',
      inscricaoMunicipal: '987654',
      regimeTributario: 'Simples Nacional',
      cnaePrincipal: '4751-2/01',
      cnaeSecundarios: ['4752-1/00', '4753-9/00'],
      dataAbertura: new Date('2020-01-15'),
      situacaoCadastral: 'Ativa',
      logradouro: 'Rua das Flores',
      numero: '100',
      complemento: 'Sala 201',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      pais: 'Brasil',
      telefone: '(11) 3000-1000',
      celular: '(11) 99000-1000',
      email: 'contato@alpha.com.br',
      site: 'https://www.alpha.com.br',
      // Configurações fiscais
      tipoContribuinte: 'Contribuinte ICMS',
      regimeApuracao: 'Simples Nacional',
      codigoMunicipioIBGE: '3550308', // São Paulo
      codigoEstadoIBGE: '35', // SP
      cfopPadrao: '5102',
      serieNFe: '1',
      ultimoNumeroNFe: 0,
      serieNFCe: '1',
      ultimoNumeroNFCe: 0,
      serieNFSe: '1',
      ultimoNumeroNFSe: 0,
      ambienteFiscal: 'Homologacao',
      // Plano de contas
      planoContasId: planoContasId,
    },
  });

  const company2 = await prisma.company.upsert({
    where: { cnpj: '55666777000188' },
    update: {},
    create: {
      razaoSocial: 'Empresa Beta Serviços e Comércio Ltda',
      nomeFantasia: 'Empresa Beta',
      cnpj: '55666777000188',
      inscricaoEstadual: '987654321',
      inscricaoMunicipal: '123456',
      regimeTributario: 'Lucro Presumido',
      cnaePrincipal: '6201-5/00',
      cnaeSecundarios: ['6202-3/00'],
      dataAbertura: new Date('2019-06-20'),
      situacaoCadastral: 'Ativa',
      logradouro: 'Avenida Paulista',
      numero: '1500',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-200',
      pais: 'Brasil',
      telefone: '(11) 3000-2000',
      celular: '(11) 99000-2000',
      email: 'contato@beta.com.br',
      site: 'https://www.beta.com.br',
      // Configurações fiscais
      tipoContribuinte: 'Contribuinte ICMS',
      regimeApuracao: 'Lucro Presumido',
      codigoMunicipioIBGE: '3550308', // São Paulo
      codigoEstadoIBGE: '35', // SP
      cfopPadrao: '5102',
      serieNFe: '1',
      ultimoNumeroNFe: 0,
      serieNFCe: '1',
      ultimoNumeroNFCe: 0,
      serieNFSe: '1',
      ultimoNumeroNFSe: 0,
      ambienteFiscal: 'Homologacao',
      // Plano de contas
      planoContasId: planoContasId,
    },
  });

  const company3 = await prisma.company.upsert({
    where: { cnpj: '99888777000199' },
    update: {},
    create: {
      razaoSocial: 'Empresa Gamma Indústria e Comércio Ltda',
      nomeFantasia: 'Empresa Gamma',
      cnpj: '99888777000199',
      inscricaoEstadual: '111222333',
      inscricaoMunicipal: '555666',
      regimeTributario: 'Lucro Real',
      cnaePrincipal: '2599-3/99',
      cnaeSecundarios: ['4661-3/00', '4662-1/00'],
      dataAbertura: new Date('2018-03-10'),
      situacaoCadastral: 'Ativa',
      logradouro: 'Rua Industrial',
      numero: '2500',
      complemento: 'Galpão 3',
      bairro: 'Distrito Industrial',
      cidade: 'Campinas',
      estado: 'SP',
      cep: '13050-000',
      pais: 'Brasil',
      telefone: '(19) 3500-3000',
      celular: '(19) 99000-3000',
      email: 'contato@gamma.com.br',
      site: 'https://www.gamma.com.br',
      // Configurações fiscais
      tipoContribuinte: 'Contribuinte ICMS',
      regimeApuracao: 'Lucro Real',
      codigoMunicipioIBGE: '3509502', // Campinas
      codigoEstadoIBGE: '35', // SP
      cfopPadrao: '5102',
      serieNFe: '1',
      ultimoNumeroNFe: 0,
      serieNFCe: '1',
      ultimoNumeroNFCe: 0,
      serieNFSe: '1',
      ultimoNumeroNFSe: 0,
      ambienteFiscal: 'Homologacao',
      // Plano de contas
      planoContasId: planoContasId,
    },
  });

  console.log('✅ 3 empresas criadas');

  // Criar Tabelas Fiscais para cada empresa
  console.log('\n📊 Criando tabelas fiscais (INSS, FGTS, IRRF)...');
  await seedTaxTables(prisma, company1.id);
  await seedTaxTables(prisma, company2.id);
  await seedTaxTables(prisma, company3.id);
  console.log('✅ Tabelas fiscais criadas para todas as empresas');

  // Criar Usuários
  console.log('\n👤 Criando usuários...');
  const hashedPassword = await bcrypt.hash('senha123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin Geral',
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'gerente@example.com' },
    update: {},
    create: {
      name: 'Gerente Multi',
      email: 'gerente@example.com',
      password: hashedPassword,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'vendedor@example.com' },
    update: {},
    create: {
      name: 'Vendedor João',
      email: 'vendedor@example.com',
      password: hashedPassword,
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      name: 'Visualizador Maria',
      email: 'viewer@example.com',
      password: hashedPassword,
    },
  });

  console.log('✅ 4 usuários criados');

  // Atribuir usuários às empresas com roles
  console.log('🔗 Vinculando usuários às empresas...');

  // Admin em todas as empresas
  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: user1.id,
        companyId: company1.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      companyId: company1.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: user1.id,
        companyId: company2.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      companyId: company2.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: user1.id,
        companyId: company3.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      companyId: company3.id,
      roleId: adminRole.id,
    },
  });

  // Gerente em duas empresas
  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: user2.id,
        companyId: company1.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      companyId: company1.id,
      roleId: managerRole.id,
    },
  });

  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: user2.id,
        companyId: company2.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      companyId: company2.id,
      roleId: managerRole.id,
    },
  });

  // Vendedor em uma empresa
  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: user3.id,
        companyId: company1.id,
      },
    },
    update: {},
    create: {
      userId: user3.id,
      companyId: company1.id,
      roleId: salesRole.id,
    },
  });

  // Viewer em uma empresa
  await prisma.userCompany.upsert({
    where: {
      userId_companyId: {
        userId: user4.id,
        companyId: company3.id,
      },
    },
    update: {},
    create: {
      userId: user4.id,
      companyId: company3.id,
      roleId: viewerRole.id,
    },
  });

  console.log('✅ Usuários vinculados às empresas');

  // Criar Centros de Custo para cada empresa
  console.log('\n📊 Criando centros de custo...');
  const centros1 = await seedCentrosCusto(company1.id);
  const centros2 = await seedCentrosCusto(company2.id);
  const centros3 = await seedCentrosCusto(company3.id);
  console.log(`✅ Total: ${centros1 + centros2 + centros3} centros de custo criados`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`- ${permissions.length} permissões (incluindo tax_tables)`);
  console.log('- 4 roles (admin, manager, sales, viewer)');
  console.log('- 3 empresas');
  console.log('- 3 tabelas fiscais por empresa (INSS, FGTS, IRRF) = 9 tabelas totais');
  console.log('- 4 usuários');
  console.log(`- ${centros1 + centros2 + centros3} centros de custo (${centros1} por empresa)`);
  console.log('\n👤 Usuários de teste (senha: senha123):');
  console.log('- admin@example.com (Admin em 3 empresas) [TODAS AS PERMISSÕES]');
  console.log('- gerente@example.com (Gerente em 2 empresas)');
  console.log('- vendedor@example.com (Vendedor em 1 empresa)');
  console.log('- viewer@example.com (Visualizador em 1 empresa)');
  console.log('\n📊 Tabelas Fiscais 2025:');
  console.log('- INSS: 4 faixas progressivas (7,5% a 14% funcionário + 20% empresa)');
  console.log('- FGTS: CLT 8%, Aprendiz 2%, Estágio 0%');
  console.log('- IRRF: 5 faixas progressivas (0% a 27,5% + dedução R$ 189,59/dep)');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

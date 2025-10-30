import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCentrosCusto(companyId: string) {
  console.log(`📊 Criando centros de custo para empresa ${companyId}...`);

  // Nível 1 - Departamentos Principais
  const administrativo = await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01',
      nome: 'Administrativo',
      descricao: 'Departamento Administrativo',
      nivel: 1,
      ativo: true,
    },
  });

  const comercial = await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '02',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '02',
      nome: 'Comercial',
      descricao: 'Departamento Comercial',
      nivel: 1,
      ativo: true,
    },
  });

  const operacional = await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '03',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '03',
      nome: 'Operacional',
      descricao: 'Departamento Operacional',
      nivel: 1,
      ativo: true,
    },
  });

  // Nível 2 - Sub-departamentos do Administrativo
  const recursosHumanos = await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.01',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.01',
      nome: 'Recursos Humanos',
      descricao: 'Gestão de Pessoas e Talentos',
      centroCustoPaiId: administrativo.id,
      nivel: 2,
      responsavel: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      ativo: true,
    },
  });

  const financeiro = await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.02',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.02',
      nome: 'Financeiro',
      descricao: 'Gestão Financeira e Contábil',
      centroCustoPaiId: administrativo.id,
      nivel: 2,
      responsavel: 'Carlos Oliveira',
      email: 'carlos.oliveira@empresa.com',
      ativo: true,
    },
  });

  const ti = await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.03',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.03',
      nome: 'Tecnologia da Informação',
      descricao: 'TI e Infraestrutura',
      centroCustoPaiId: administrativo.id,
      nivel: 2,
      responsavel: 'João Silva',
      email: 'joao.silva@empresa.com',
      ativo: true,
    },
  });

  const juridico = await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.04',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.04',
      nome: 'Jurídico',
      descricao: 'Departamento Jurídico',
      centroCustoPaiId: administrativo.id,
      nivel: 2,
      responsavel: 'Ana Paula',
      email: 'ana.paula@empresa.com',
      ativo: true,
    },
  });

  // Nível 3 - Setores do RH
  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.01.001',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.01.001',
      nome: 'Recrutamento e Seleção',
      descricao: 'Processo de contratação',
      centroCustoPaiId: recursosHumanos.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.01.002',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.01.002',
      nome: 'Treinamento e Desenvolvimento',
      descricao: 'Capacitação e desenvolvimento de equipes',
      centroCustoPaiId: recursosHumanos.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.01.003',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.01.003',
      nome: 'Departamento Pessoal',
      descricao: 'Folha de pagamento e benefícios',
      centroCustoPaiId: recursosHumanos.id,
      nivel: 3,
      ativo: true,
    },
  });

  // Nível 3 - Setores do Financeiro
  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.02.001',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.02.001',
      nome: 'Contas a Pagar',
      descricao: 'Gestão de pagamentos',
      centroCustoPaiId: financeiro.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.02.002',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.02.002',
      nome: 'Contas a Receber',
      descricao: 'Gestão de recebimentos',
      centroCustoPaiId: financeiro.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.02.003',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.02.003',
      nome: 'Tesouraria',
      descricao: 'Gestão de caixa e bancos',
      centroCustoPaiId: financeiro.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.02.004',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.02.004',
      nome: 'Controladoria',
      descricao: 'Controles e análises financeiras',
      centroCustoPaiId: financeiro.id,
      nivel: 3,
      ativo: true,
    },
  });

  // Nível 3 - Setores de TI
  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.03.001',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.03.001',
      nome: 'Infraestrutura',
      descricao: 'Servidores, redes e segurança',
      centroCustoPaiId: ti.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.03.002',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.03.002',
      nome: 'Desenvolvimento',
      descricao: 'Desenvolvimento de sistemas',
      centroCustoPaiId: ti.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '01.03.003',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '01.03.003',
      nome: 'Suporte',
      descricao: 'Suporte técnico e help desk',
      centroCustoPaiId: ti.id,
      nivel: 3,
      ativo: true,
    },
  });

  // Nível 2 - Sub-departamentos do Comercial
  const vendas = await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '02.01',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '02.01',
      nome: 'Vendas',
      descricao: 'Equipe de vendas',
      centroCustoPaiId: comercial.id,
      nivel: 2,
      responsavel: 'Pedro Costa',
      email: 'pedro.costa@empresa.com',
      ativo: true,
    },
  });

  const marketing = await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '02.02',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '02.02',
      nome: 'Marketing',
      descricao: 'Marketing e comunicação',
      centroCustoPaiId: comercial.id,
      nivel: 2,
      responsavel: 'Juliana Souza',
      email: 'juliana.souza@empresa.com',
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '02.03',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '02.03',
      nome: 'Pós-venda',
      descricao: 'Atendimento e suporte ao cliente',
      centroCustoPaiId: comercial.id,
      nivel: 2,
      responsavel: 'Fernanda Lima',
      email: 'fernanda.lima@empresa.com',
      ativo: true,
    },
  });

  // Nível 3 - Setores de Vendas
  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '02.01.001',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '02.01.001',
      nome: 'Vendas Internas',
      descricao: 'Vendas internas e televendas',
      centroCustoPaiId: vendas.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '02.01.002',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '02.01.002',
      nome: 'Vendas Externas',
      descricao: 'Vendas externas e representantes',
      centroCustoPaiId: vendas.id,
      nivel: 3,
      ativo: true,
    },
  });

  // Nível 3 - Setores de Marketing
  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '02.02.001',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '02.02.001',
      nome: 'Marketing Digital',
      descricao: 'Redes sociais, SEO e campanhas online',
      centroCustoPaiId: marketing.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '02.02.002',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '02.02.002',
      nome: 'Eventos e Promoções',
      descricao: 'Organização de eventos e ações promocionais',
      centroCustoPaiId: marketing.id,
      nivel: 3,
      ativo: true,
    },
  });

  // Nível 2 - Sub-departamentos do Operacional
  const producao = await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '03.01',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '03.01',
      nome: 'Produção',
      descricao: 'Linha de produção',
      centroCustoPaiId: operacional.id,
      nivel: 2,
      responsavel: 'Roberto Alves',
      email: 'roberto.alves@empresa.com',
      ativo: true,
    },
  });

  const logistica = await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '03.02',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '03.02',
      nome: 'Logística',
      descricao: 'Armazenagem e distribuição',
      centroCustoPaiId: operacional.id,
      nivel: 2,
      responsavel: 'Marcelo Santos',
      email: 'marcelo.santos@empresa.com',
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '03.03',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '03.03',
      nome: 'Qualidade',
      descricao: 'Controle de qualidade',
      centroCustoPaiId: operacional.id,
      nivel: 2,
      responsavel: 'Beatriz Ferreira',
      email: 'beatriz.ferreira@empresa.com',
      ativo: true,
    },
  });

  // Nível 3 - Setores de Logística
  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '03.02.001',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '03.02.001',
      nome: 'Expedição',
      descricao: 'Preparação e envio de pedidos',
      centroCustoPaiId: logistica.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '03.02.002',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '03.02.002',
      nome: 'Armazenagem',
      descricao: 'Gestão de estoque e armazéns',
      centroCustoPaiId: logistica.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '03.02.003',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '03.02.003',
      nome: 'Transporte',
      descricao: 'Gestão de frota e entregas',
      centroCustoPaiId: logistica.id,
      nivel: 3,
      ativo: true,
    },
  });

  // Nível 3 - Setores de Produção
  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '03.01.001',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '03.01.001',
      nome: 'Linha 1',
      descricao: 'Linha de produção 1',
      centroCustoPaiId: producao.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '03.01.002',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '03.01.002',
      nome: 'Linha 2',
      descricao: 'Linha de produção 2',
      centroCustoPaiId: producao.id,
      nivel: 3,
      ativo: true,
    },
  });

  await prisma.centroCusto.upsert({
    where: {
      companyId_codigo: {
        companyId,
        codigo: '03.01.003',
      },
    },
    update: {},
    create: {
      companyId,
      codigo: '03.01.003',
      nome: 'Manutenção',
      descricao: 'Manutenção de equipamentos',
      centroCustoPaiId: producao.id,
      nivel: 3,
      ativo: true,
    },
  });

  const centrosCount = await prisma.centroCusto.count({
    where: { companyId },
  });

  console.log(`✅ ${centrosCount} centros de custo criados para a empresa`);

  return centrosCount;
}

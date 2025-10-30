import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPlanoContas() {
  console.log('📊 Criando plano de contas padrão do sistema...');

  // Criar Plano de Contas Padrão do Sistema (companyId = null)
  const planoContas = await prisma.planoContas.upsert({
    where: { id: 'plano-contas-padrao' },
    update: {},
    create: {
      id: 'plano-contas-padrao',
      companyId: null, // Plano padrão do sistema, não vinculado a uma empresa específica
      nome: 'Plano de Contas Padrão Gerencial',
      descricao: 'Plano de contas gerencial padrão para empresas comerciais',
      tipo: 'Gerencial',
      padrao: true,
      ativo: true,
    },
  });

  // Contas de Nível 1 - ATIVO
  const ativo = await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '1',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '1',
      nome: 'ATIVO',
      tipo: 'Ativo',
      natureza: 'Devedora',
      nivel: 1,
      aceitaLancamento: false,
    },
  });

  // Contas de Nível 2 - ATIVO CIRCULANTE
  const ativoCirculante = await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '1.1',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '1.1',
      nome: 'ATIVO CIRCULANTE',
      tipo: 'Ativo',
      natureza: 'Devedora',
      nivel: 2,
      contaPaiId: ativo.id,
      aceitaLancamento: false,
    },
  });

  // Contas de Nível 3 - Disponibilidades
  const disponibilidades = await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '1.1.01',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '1.1.01',
      nome: 'Disponibilidades',
      tipo: 'Ativo',
      natureza: 'Devedora',
      nivel: 3,
      contaPaiId: ativoCirculante.id,
      aceitaLancamento: false,
    },
  });

  // Contas de Nível 4 - Caixa e Bancos
  await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '1.1.01.001',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '1.1.01.001',
      nome: 'Caixa Geral',
      tipo: 'Ativo',
      natureza: 'Devedora',
      nivel: 4,
      contaPaiId: disponibilidades.id,
      aceitaLancamento: true,
    },
  });

  await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '1.1.01.002',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '1.1.01.002',
      nome: 'Bancos Conta Movimento',
      tipo: 'Ativo',
      natureza: 'Devedora',
      nivel: 4,
      contaPaiId: disponibilidades.id,
      aceitaLancamento: true,
    },
  });

  // Contas a Receber
  const contasReceber = await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '1.1.02',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '1.1.02',
      nome: 'Contas a Receber',
      tipo: 'Ativo',
      natureza: 'Devedora',
      nivel: 3,
      contaPaiId: ativoCirculante.id,
      aceitaLancamento: false,
    },
  });

  await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '1.1.02.001',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '1.1.02.001',
      nome: 'Clientes',
      tipo: 'Ativo',
      natureza: 'Devedora',
      nivel: 4,
      contaPaiId: contasReceber.id,
      aceitaLancamento: true,
    },
  });

  // Estoques
  const estoques = await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '1.1.03',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '1.1.03',
      nome: 'Estoques',
      tipo: 'Ativo',
      natureza: 'Devedora',
      nivel: 3,
      contaPaiId: ativoCirculante.id,
      aceitaLancamento: false,
    },
  });

  await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '1.1.03.001',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '1.1.03.001',
      nome: 'Mercadorias para Revenda',
      tipo: 'Ativo',
      natureza: 'Devedora',
      nivel: 4,
      contaPaiId: estoques.id,
      aceitaLancamento: true,
    },
  });

  // PASSIVO
  const passivo = await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '2',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '2',
      nome: 'PASSIVO',
      tipo: 'Passivo',
      natureza: 'Credora',
      nivel: 1,
      aceitaLancamento: false,
    },
  });

  // PASSIVO CIRCULANTE
  const passivoCirculante = await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '2.1',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '2.1',
      nome: 'PASSIVO CIRCULANTE',
      tipo: 'Passivo',
      natureza: 'Credora',
      nivel: 2,
      contaPaiId: passivo.id,
      aceitaLancamento: false,
    },
  });

  // Fornecedores
  const fornecedores = await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '2.1.01',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '2.1.01',
      nome: 'Fornecedores',
      tipo: 'Passivo',
      natureza: 'Credora',
      nivel: 3,
      contaPaiId: passivoCirculante.id,
      aceitaLancamento: false,
    },
  });

  await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '2.1.01.001',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '2.1.01.001',
      nome: 'Fornecedores Nacionais',
      tipo: 'Passivo',
      natureza: 'Credora',
      nivel: 4,
      contaPaiId: fornecedores.id,
      aceitaLancamento: true,
    },
  });

  // RECEITAS
  const receitas = await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '3',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '3',
      nome: 'RECEITAS',
      tipo: 'Receita',
      natureza: 'Credora',
      nivel: 1,
      aceitaLancamento: false,
    },
  });

  const receitasOperacionais = await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '3.1',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '3.1',
      nome: 'Receitas Operacionais',
      tipo: 'Receita',
      natureza: 'Credora',
      nivel: 2,
      contaPaiId: receitas.id,
      aceitaLancamento: false,
    },
  });

  await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '3.1.01.001',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '3.1.01.001',
      nome: 'Vendas de Mercadorias',
      tipo: 'Receita',
      natureza: 'Credora',
      nivel: 4,
      contaPaiId: receitasOperacionais.id,
      aceitaLancamento: true,
    },
  });

  // DESPESAS
  const despesas = await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '4',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '4',
      nome: 'DESPESAS',
      tipo: 'Despesa',
      natureza: 'Devedora',
      nivel: 1,
      aceitaLancamento: false,
    },
  });

  const despesasOperacionais = await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '4.1',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '4.1',
      nome: 'Despesas Operacionais',
      tipo: 'Despesa',
      natureza: 'Devedora',
      nivel: 2,
      contaPaiId: despesas.id,
      aceitaLancamento: false,
    },
  });

  await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '4.1.01.001',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '4.1.01.001',
      nome: 'Salários e Ordenados',
      tipo: 'Despesa',
      natureza: 'Devedora',
      nivel: 4,
      contaPaiId: despesasOperacionais.id,
      aceitaLancamento: true,
    },
  });

  await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '4.1.01.002',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '4.1.01.002',
      nome: 'Encargos Sociais',
      tipo: 'Despesa',
      natureza: 'Devedora',
      nivel: 4,
      contaPaiId: despesasOperacionais.id,
      aceitaLancamento: true,
    },
  });

  await prisma.contaContabil.upsert({
    where: { 
      planoContasId_codigo: {
        planoContasId: planoContas.id,
        codigo: '4.1.01.003',
      }
    },
    update: {},
    create: {
      planoContasId: planoContas.id,
      codigo: '4.1.01.003',
      nome: 'Aluguel',
      tipo: 'Despesa',
      natureza: 'Devedora',
      nivel: 4,
      contaPaiId: despesasOperacionais.id,
      aceitaLancamento: true,
    },
  });

  const contasCount = await prisma.contaContabil.count({
    where: { planoContasId: planoContas.id },
  });

  console.log(`✅ Plano de contas criado com ${contasCount} contas`);

  return planoContas.id;
}

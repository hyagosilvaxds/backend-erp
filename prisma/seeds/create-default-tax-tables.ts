import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Criando tabelas fiscais padrão para 2025...');

  // Buscar primeira empresa como exemplo (você pode adaptar isso)
  const company = await prisma.company.findFirst();

  if (!company) {
    console.log('⚠️  Nenhuma empresa encontrada. Crie uma empresa primeiro.');
    return;
  }

  console.log(`📝 Criando tabelas para empresa: ${company.razaoSocial}`);

  // ==================== TABELA INSS 2025 ====================
  // Tabela progressiva válida para 2025
  const inssRanges = [
    {
      minValue: 0,
      maxValue: 1412.00,
      employeeRate: 7.5,
      employerRate: 20.0,
      deduction: 0,
    },
    {
      minValue: 1412.01,
      maxValue: 2666.68,
      employeeRate: 9.0,
      employerRate: 20.0,
      deduction: 21.18,
    },
    {
      minValue: 2666.69,
      maxValue: 4000.03,
      employeeRate: 12.0,
      employerRate: 20.0,
      deduction: 101.18,
    },
    {
      minValue: 4000.04,
      maxValue: 7786.02,
      employeeRate: 14.0,
      employerRate: 20.0,
      deduction: 181.18,
    },
  ];

  const existingInss = await prisma.inssTable.findFirst({
    where: {
      companyId: company.id,
      year: 2025,
      month: 1,
    },
  });

  if (!existingInss) {
    await prisma.inssTable.create({
      data: {
        companyId: company.id,
        year: 2025,
        month: 1,
        ranges: inssRanges,
        active: true,
      },
    });
    console.log('✅ Tabela INSS 2025 criada');
  } else {
    console.log('⏭️  Tabela INSS 2025 já existe');
  }

  // ==================== TABELA FGTS 2025 ====================
  const fgtsRates = [
    {
      category: 'CLT',
      monthlyRate: 8.0,
      terminationRate: 40.0,
      description: 'Alíquota padrão para CLT',
    },
    {
      category: 'MENOR_APRENDIZ',
      monthlyRate: 2.0,
      terminationRate: 40.0,
      description: 'Alíquota reduzida para menor aprendiz',
    },
    {
      category: 'ESTAGIO',
      monthlyRate: 0.0,
      terminationRate: 0.0,
      description: 'Estagiários não têm FGTS',
    },
  ];

  const existingFgts = await prisma.fgtsTable.findFirst({
    where: {
      companyId: company.id,
      year: 2025,
      month: 1,
    },
  });

  if (!existingFgts) {
    await prisma.fgtsTable.create({
      data: {
        companyId: company.id,
        year: 2025,
        month: 1,
        rates: fgtsRates,
        active: true,
      },
    });
    console.log('✅ Tabela FGTS 2025 criada');
  } else {
    console.log('⏭️  Tabela FGTS 2025 já existe');
  }

  // ==================== TABELA IRRF 2025 ====================
  const irrfRanges = [
    {
      minValue: 0,
      maxValue: 2259.20,
      rate: 0,
      deduction: 0,
    },
    {
      minValue: 2259.21,
      maxValue: 2826.65,
      rate: 7.5,
      deduction: 169.44,
    },
    {
      minValue: 2826.66,
      maxValue: 3751.05,
      rate: 15.0,
      deduction: 381.44,
    },
    {
      minValue: 3751.06,
      maxValue: 4664.68,
      rate: 22.5,
      deduction: 662.77,
    },
    {
      minValue: 4664.69,
      maxValue: null, // Sem limite superior
      rate: 27.5,
      deduction: 896.00,
    },
  ];

  const existingIrrf = await prisma.irrfTable.findFirst({
    where: {
      companyId: company.id,
      year: 2025,
      month: 1,
    },
  });

  if (!existingIrrf) {
    await prisma.irrfTable.create({
      data: {
        companyId: company.id,
        year: 2025,
        month: 1,
        dependentDeduction: 189.59, // Dedução por dependente em 2025
        ranges: irrfRanges,
        active: true,
      },
    });
    console.log('✅ Tabela IRRF 2025 criada');
  } else {
    console.log('⏭️  Tabela IRRF 2025 já existe');
  }

  console.log('✅ Tabelas fiscais padrão criadas com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar tabelas fiscais:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

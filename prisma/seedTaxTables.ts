import { PrismaClient } from '@prisma/client';

export async function seedTaxTables(prisma: PrismaClient, companyId: string) {
  console.log('📊 Criando tabelas fiscais (INSS, FGTS, IRRF) para 2025...');

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
      companyId,
      year: 2025,
    },
  });

  if (!existingInss) {
    await prisma.inssTable.create({
      data: {
        companyId,
        year: 2025,
        ranges: inssRanges,
        active: true,
      },
    });
    console.log('  ✅ Tabela INSS 2025 criada (4 faixas progressivas)');
  } else {
    console.log('  ⏭️  Tabela INSS 2025 já existe');
  }

  // ==================== TABELA FGTS 2025 ====================
  // NOTA: A tabela FGTS agora é baseada em cargos (positions) específicos da empresa.
  // Ela deve ser criada manualmente através da API após criar os cargos.
  // Exemplo de estrutura:
  // const fgtsRates = [
  //   {
  //     positionId: 'id-do-cargo',
  //     monthlyRate: 8.0,
  //     terminationRate: 40.0,
  //   },
  // ];

  console.log('  ⏭️  Tabela FGTS deve ser criada manualmente via API com base nos cargos da empresa');

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
      companyId,
      year: 2025,
    },
  });

  if (!existingIrrf) {
    await prisma.irrfTable.create({
      data: {
        companyId,
        year: 2025,
        dependentDeduction: 189.59, // Dedução por dependente em 2025
        ranges: irrfRanges,
        active: true,
      },
    });
    console.log('  ✅ Tabela IRRF 2025 criada (5 faixas progressivas + dedução R$ 189,59/dep)');
  } else {
    console.log('  ⏭️  Tabela IRRF 2025 já existe');
  }

  return { inss: true, fgts: true, irrf: true };
}

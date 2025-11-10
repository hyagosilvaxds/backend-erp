import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInssTableDto } from './dto/create-inss-table.dto';
import { UpdateInssTableDto } from './dto/update-inss-table.dto';
import { CreateFgtsTableDto } from './dto/create-fgts-table.dto';
import { UpdateFgtsTableDto } from './dto/update-fgts-table.dto';
import { CreateIrrfTableDto } from './dto/create-irrf-table.dto';
import { UpdateIrrfTableDto } from './dto/update-irrf-table.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TaxTablesService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== TABELA INSS ====================

  async createInssTable(companyId: string, dto: CreateInssTableDto) {
    // Verificar se já existe tabela ativa para este período
    const existing = await this.prisma.inssTable.findFirst({
      where: {
        companyId,
        year: dto.year,
        month: dto.month,
        active: true,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Já existe uma tabela INSS ativa para ${dto.month}/${dto.year}`,
      );
    }

    return this.prisma.inssTable.create({
      data: {
        companyId,
        year: dto.year,
        month: dto.month,
        ranges: dto.ranges as any,
        active: dto.active ?? true,
      },
    });
  }

  async findAllInssTables(companyId: string, year?: number, active?: boolean) {
    const where: any = { companyId };
    if (year) where.year = year;
    if (active !== undefined) where.active = active;

    return this.prisma.inssTable.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findInssTable(id: string, companyId: string) {
    const table = await this.prisma.inssTable.findFirst({
      where: { id, companyId },
    });

    if (!table) {
      throw new NotFoundException('Tabela INSS não encontrada');
    }

    return table;
  }

  async updateInssTable(
    id: string,
    companyId: string,
    dto: UpdateInssTableDto,
  ) {
    await this.findInssTable(id, companyId);

    // Se está ativando esta tabela, desativar outras do mesmo período
    if (dto.active === true && dto.year && dto.month) {
      await this.prisma.inssTable.updateMany({
        where: {
          companyId,
          year: dto.year,
          month: dto.month,
          id: { not: id },
        },
        data: { active: false },
      });
    }

    return this.prisma.inssTable.update({
      where: { id },
      data: {
        year: dto.year,
        month: dto.month,
        ranges: dto.ranges as any,
        active: dto.active,
      },
    });
  }

  async deleteInssTable(id: string, companyId: string) {
    await this.findInssTable(id, companyId);
    await this.prisma.inssTable.delete({ where: { id } });
    return { message: 'Tabela INSS deletada com sucesso' };
  }

  // Buscar tabela INSS ativa para um período específico
  async getActiveInssTable(companyId: string, year: number, month: number) {
    const table = await this.prisma.inssTable.findFirst({
      where: {
        companyId,
        year,
        month,
        active: true,
      },
    });

    // Se não encontrar para o mês específico, buscar a mais recente
    if (!table) {
      return this.prisma.inssTable.findFirst({
        where: {
          companyId,
          active: true,
          OR: [
            { year: { lt: year } },
            { year, month: { lte: month } },
          ],
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
    }

    return table;
  }

  // Calcular INSS usando tabela progressiva
  calculateInss(salary: Decimal, inssTable: any): {
    employeeInss: Decimal;
    employerInss: Decimal;
    details: any[];
  } {
    const ranges = inssTable.ranges as any[];
    let employeeInss = new Decimal(0);
    let employerInss = new Decimal(0);
    const details: any[] = [];

    for (const range of ranges) {
      const min = new Decimal(range.minValue);
      const max = range.maxValue ? new Decimal(range.maxValue) : null;

      if (salary.lessThanOrEqualTo(min)) {
        break;
      }

      const baseCalc = max && salary.greaterThan(max) 
        ? max.minus(min) 
        : salary.minus(min);

      if (baseCalc.greaterThan(0)) {
        const employeeRate = new Decimal(range.employeeRate).div(100);
        const employerRate = new Decimal(range.employerRate).div(100);

        const employeeAmount = baseCalc.mul(employeeRate);
        const employerAmount = baseCalc.mul(employerRate);

        employeeInss = employeeInss.add(employeeAmount);
        employerInss = employerInss.add(employerAmount);

        details.push({
          range: `${min.toFixed(2)} - ${max ? max.toFixed(2) : 'sem limite'}`,
          baseCalc: baseCalc.toFixed(2),
          employeeRate: range.employeeRate,
          employeeAmount: employeeAmount.toFixed(2),
          employerRate: range.employerRate,
          employerAmount: employerAmount.toFixed(2),
        });
      }

      if (max && salary.lessThanOrEqualTo(max)) {
        break;
      }
    }

    return {
      employeeInss,
      employerInss,
      details,
    };
  }

  // ==================== TABELA FGTS ====================

  async createFgtsTable(companyId: string, dto: CreateFgtsTableDto) {
    const existing = await this.prisma.fgtsTable.findFirst({
      where: {
        companyId,
        year: dto.year,
        month: dto.month,
        active: true,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Já existe uma tabela FGTS ativa para ${dto.month}/${dto.year}`,
      );
    }

    return this.prisma.fgtsTable.create({
      data: {
        companyId,
        year: dto.year,
        month: dto.month,
        rates: dto.rates as any,
        active: dto.active ?? true,
      },
    });
  }

  async findAllFgtsTables(companyId: string, year?: number, active?: boolean) {
    const where: any = { companyId };
    if (year) where.year = year;
    if (active !== undefined) where.active = active;

    return this.prisma.fgtsTable.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findFgtsTable(id: string, companyId: string) {
    const table = await this.prisma.fgtsTable.findFirst({
      where: { id, companyId },
    });

    if (!table) {
      throw new NotFoundException('Tabela FGTS não encontrada');
    }

    return table;
  }

  async updateFgtsTable(
    id: string,
    companyId: string,
    dto: UpdateFgtsTableDto,
  ) {
    await this.findFgtsTable(id, companyId);

    if (dto.active === true && dto.year && dto.month) {
      await this.prisma.fgtsTable.updateMany({
        where: {
          companyId,
          year: dto.year,
          month: dto.month,
          id: { not: id },
        },
        data: { active: false },
      });
    }

    return this.prisma.fgtsTable.update({
      where: { id },
      data: {
        year: dto.year,
        month: dto.month,
        rates: dto.rates as any,
        active: dto.active,
      },
    });
  }

  async deleteFgtsTable(id: string, companyId: string) {
    await this.findFgtsTable(id, companyId);
    await this.prisma.fgtsTable.delete({ where: { id } });
    return { message: 'Tabela FGTS deletada com sucesso' };
  }

  async getActiveFgtsTable(companyId: string, year: number, month: number) {
    const table = await this.prisma.fgtsTable.findFirst({
      where: {
        companyId,
        year,
        month,
        active: true,
      },
    });

    if (!table) {
      return this.prisma.fgtsTable.findFirst({
        where: {
          companyId,
          active: true,
          OR: [
            { year: { lt: year } },
            { year, month: { lte: month } },
          ],
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
    }

    return table;
  }

  // Calcular FGTS
  calculateFgts(
    salary: Decimal,
    category: string,
    fgtsTable: any,
  ): { monthlyFgts: Decimal; terminationFgts: Decimal } {
    const rates = fgtsTable.rates as any[];
    const rateConfig = rates.find((r) => r.category === category) || rates[0];

    const monthlyRate = new Decimal(rateConfig.monthlyRate).div(100);
    const terminationRate = new Decimal(rateConfig.terminationRate).div(100);

    return {
      monthlyFgts: salary.mul(monthlyRate),
      terminationFgts: salary.mul(terminationRate),
    };
  }

  // ==================== TABELA IRRF ====================

  async createIrrfTable(companyId: string, dto: CreateIrrfTableDto) {
    const existing = await this.prisma.irrfTable.findFirst({
      where: {
        companyId,
        year: dto.year,
        month: dto.month,
        active: true,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Já existe uma tabela IRRF ativa para ${dto.month}/${dto.year}`,
      );
    }

    return this.prisma.irrfTable.create({
      data: {
        companyId,
        year: dto.year,
        month: dto.month,
        dependentDeduction: dto.dependentDeduction,
        ranges: dto.ranges as any,
        active: dto.active ?? true,
      },
    });
  }

  async findAllIrrfTables(companyId: string, year?: number, active?: boolean) {
    const where: any = { companyId };
    if (year) where.year = year;
    if (active !== undefined) where.active = active;

    return this.prisma.irrfTable.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findIrrfTable(id: string, companyId: string) {
    const table = await this.prisma.irrfTable.findFirst({
      where: { id, companyId },
    });

    if (!table) {
      throw new NotFoundException('Tabela IRRF não encontrada');
    }

    return table;
  }

  async updateIrrfTable(
    id: string,
    companyId: string,
    dto: UpdateIrrfTableDto,
  ) {
    await this.findIrrfTable(id, companyId);

    if (dto.active === true && dto.year && dto.month) {
      await this.prisma.irrfTable.updateMany({
        where: {
          companyId,
          year: dto.year,
          month: dto.month,
          id: { not: id },
        },
        data: { active: false },
      });
    }

    return this.prisma.irrfTable.update({
      where: { id },
      data: {
        year: dto.year,
        month: dto.month,
        dependentDeduction: dto.dependentDeduction,
        ranges: dto.ranges as any,
        active: dto.active,
      },
    });
  }

  async deleteIrrfTable(id: string, companyId: string) {
    await this.findIrrfTable(id, companyId);
    await this.prisma.irrfTable.delete({ where: { id } });
    return { message: 'Tabela IRRF deletada com sucesso' };
  }

  async getActiveIrrfTable(companyId: string, year: number, month: number) {
    const table = await this.prisma.irrfTable.findFirst({
      where: {
        companyId,
        year,
        month,
        active: true,
      },
    });

    if (!table) {
      return this.prisma.irrfTable.findFirst({
        where: {
          companyId,
          active: true,
          OR: [
            { year: { lt: year } },
            { year, month: { lte: month } },
          ],
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
    }

    return table;
  }

  // Calcular IRRF
  calculateIrrf(
    taxableIncome: Decimal,
    dependents: number,
    irrfTable: any,
  ): { irrf: Decimal; details: any } {
    const dependentDeduction = new Decimal(irrfTable.dependentDeduction);
    const totalDependentDeduction = dependentDeduction.mul(dependents);
    
    // Base de cálculo = renda tributável - deduções de dependentes
    const baseCalc = taxableIncome.minus(totalDependentDeduction);

    if (baseCalc.lessThanOrEqualTo(0)) {
      return {
        irrf: new Decimal(0),
        details: {
          taxableIncome: taxableIncome.toFixed(2),
          dependents,
          dependentDeduction: dependentDeduction.toFixed(2),
          totalDependentDeduction: totalDependentDeduction.toFixed(2),
          baseCalc: baseCalc.toFixed(2),
          appliedRange: null,
          irrf: '0.00',
        },
      };
    }

    const ranges = irrfTable.ranges as any[];
    let appliedRange: any = null;

    // Encontrar faixa aplicável
    for (const range of ranges) {
      const min = new Decimal(range.minValue);
      const max = range.maxValue ? new Decimal(range.maxValue) : null;

      if (baseCalc.greaterThanOrEqualTo(min) && (!max || baseCalc.lessThanOrEqualTo(max))) {
        appliedRange = range;
        break;
      }
    }

    if (!appliedRange || appliedRange.rate === 0) {
      return {
        irrf: new Decimal(0),
        details: {
          taxableIncome: taxableIncome.toFixed(2),
          dependents,
          dependentDeduction: dependentDeduction.toFixed(2),
          totalDependentDeduction: totalDependentDeduction.toFixed(2),
          baseCalc: baseCalc.toFixed(2),
          appliedRange: appliedRange,
          irrf: '0.00',
        },
      };
    }

    // Cálculo: (base * alíquota) - dedução da faixa
    const rate = new Decimal(appliedRange.rate).div(100);
    const deduction = new Decimal(appliedRange.deduction);
    const irrf = baseCalc.mul(rate).minus(deduction);

    return {
      irrf: irrf.greaterThan(0) ? irrf : new Decimal(0),
      details: {
        taxableIncome: taxableIncome.toFixed(2),
        dependents,
        dependentDeduction: dependentDeduction.toFixed(2),
        totalDependentDeduction: totalDependentDeduction.toFixed(2),
        baseCalc: baseCalc.toFixed(2),
        appliedRange: {
          ...appliedRange,
          min: appliedRange.minValue,
          max: appliedRange.maxValue || 'sem limite',
        },
        irrf: (irrf.greaterThan(0) ? irrf : new Decimal(0)).toFixed(2),
      },
    };
  }
}

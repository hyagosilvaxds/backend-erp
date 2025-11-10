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
    // Normalizar os dados: aceitar tanto referenceYear quanto year
    const year = dto.referenceYear || dto.year;

    if (!year) {
      throw new BadRequestException('Ano é obrigatório');
    }

    // Converter brackets para ranges se necessário
    let ranges = dto.ranges;
    if (!ranges && dto.brackets) {
      ranges = this.convertBracketsToRanges(dto.brackets);
    }

    if (!ranges || ranges.length === 0) {
      throw new BadRequestException('É necessário fornecer as faixas (brackets ou ranges)');
    }

    // Verificar se já existe tabela ativa para este ano
    const existing = await this.prisma.inssTable.findFirst({
      where: {
        companyId,
        year,
        active: true,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Já existe uma tabela INSS ativa para ${year}`,
      );
    }

    return this.prisma.inssTable.create({
      data: {
        companyId,
        year,
        ranges: ranges as any,
        active: dto.active ?? true,
      },
    });
  }

  // Função auxiliar para converter brackets (upTo) em ranges (minValue/maxValue)
  private convertBracketsToRanges(brackets: any[]): any[] {
    if (!brackets || brackets.length === 0) {
      return [];
    }

    // Ordenar brackets por upTo
    const sortedBrackets = [...brackets].sort((a, b) => (a.upTo || Infinity) - (b.upTo || Infinity));

    return sortedBrackets.map((bracket, index) => {
      const minValue = index === 0 ? 0 : sortedBrackets[index - 1].upTo;
      const maxValue = bracket.upTo || null; // null = sem limite superior

      return {
        minValue,
        maxValue,
        employeeRate: bracket.employeeRate,
        employerRate: bracket.employerRate,
        deduction: bracket.deduction || 0,
      };
    });
  }

  async findAllInssTables(companyId: string, year?: number, active?: boolean) {
    const where: any = { companyId };
    if (year) where.year = year;
    if (active !== undefined) where.active = active;

    return this.prisma.inssTable.findMany({
      where,
      orderBy: [{ year: 'desc' }],
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

    // Converter brackets para ranges se necessário
    let ranges = dto.ranges;
    if (!ranges && dto.brackets) {
      ranges = this.convertBracketsToRanges(dto.brackets);
    }

    // Se está ativando esta tabela, desativar outras do mesmo ano
    if (dto.active === true && dto.year) {
      await this.prisma.inssTable.updateMany({
        where: {
          companyId,
          year: dto.year,
          id: { not: id },
        },
        data: { active: false },
      });
    }

    return this.prisma.inssTable.update({
      where: { id },
      data: {
        year: dto.year,
        ranges: ranges as any,
        active: dto.active,
      },
    });
  }

  async deleteInssTable(id: string, companyId: string) {
    await this.findInssTable(id, companyId);
    await this.prisma.inssTable.delete({ where: { id } });
    return { message: 'Tabela INSS deletada com sucesso' };
  }

  // Buscar tabela INSS ativa para um ano específico
  async getActiveInssTable(companyId: string, year: number) {
    const table = await this.prisma.inssTable.findFirst({
      where: {
        companyId,
        year,
        active: true,
      },
    });

    // Se não encontrar para o ano específico, buscar a mais recente
    if (!table) {
      return this.prisma.inssTable.findFirst({
        where: {
          companyId,
          active: true,
          year: { lte: year },
        },
        orderBy: [{ year: 'desc' }],
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
        active: true,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Já existe uma tabela FGTS ativa para ${dto.year}`,
      );
    }

    // Validar e enriquecer rates com os nomes dos cargos
    const enrichedRates = await Promise.all(
      dto.rates.map(async (rate) => {
        const position = await this.prisma.position.findFirst({
          where: {
            id: rate.positionId,
            companyId,
          },
        });

        if (!position) {
          throw new BadRequestException(
            `Cargo com ID ${rate.positionId} não encontrado`,
          );
        }

        return {
          positionId: rate.positionId,
          positionName: position.name,
          positionCode: position.code,
          monthlyRate: rate.monthlyRate,
          terminationRate: rate.terminationRate,
        };
      }),
    );

    return this.prisma.fgtsTable.create({
      data: {
        companyId,
        year: dto.year,
        rates: enrichedRates as any,
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
      orderBy: [{ year: 'desc' }],
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

    if (dto.active === true && dto.year) {
      await this.prisma.fgtsTable.updateMany({
        where: {
          companyId,
          year: dto.year,
          id: { not: id },
        },
        data: { active: false },
      });
    }

    // Se está atualizando rates, validar e enriquecer com nomes dos cargos
    let enrichedRates = dto.rates;
    if (dto.rates && dto.rates.length > 0) {
      enrichedRates = await Promise.all(
        dto.rates.map(async (rate) => {
          const position = await this.prisma.position.findFirst({
            where: {
              id: rate.positionId,
              companyId,
            },
          });

          if (!position) {
            throw new BadRequestException(
              `Cargo com ID ${rate.positionId} não encontrado`,
            );
          }

          return {
            positionId: rate.positionId,
            positionName: position.name,
            positionCode: position.code,
            monthlyRate: rate.monthlyRate,
            terminationRate: rate.terminationRate,
          };
        }),
      );
    }

    return this.prisma.fgtsTable.update({
      where: { id },
      data: {
        year: dto.year,
        rates: enrichedRates as any,
        active: dto.active,
      },
    });
  }

  async deleteFgtsTable(id: string, companyId: string) {
    await this.findFgtsTable(id, companyId);
    await this.prisma.fgtsTable.delete({ where: { id } });
    return { message: 'Tabela FGTS deletada com sucesso' };
  }

  async getActiveFgtsTable(companyId: string, year: number) {
    const table = await this.prisma.fgtsTable.findFirst({
      where: {
        companyId,
        year,
        active: true,
      },
    });

    if (!table) {
      return this.prisma.fgtsTable.findFirst({
        where: {
          companyId,
          active: true,
          year: { lte: year },
        },
        orderBy: [{ year: 'desc' }],
      });
    }

    return table;
  }

  // Calcular FGTS baseado no cargo do empregado
  calculateFgts(
    salary: Decimal,
    positionId: string,
    fgtsTable: any,
  ): { monthlyFgts: Decimal; terminationFgts: Decimal; rateInfo?: any } {
    const rates = fgtsTable.rates as any[];
    const rateConfig = rates.find((r) => r.positionId === positionId);

    if (!rateConfig) {
      // Se não encontrar configuração específica para o cargo, usar taxa padrão (8% mensal, 40% rescisão)
      return {
        monthlyFgts: salary.mul(new Decimal(0.08)),
        terminationFgts: salary.mul(new Decimal(0.40)),
        rateInfo: {
          positionName: 'Padrão (não configurado)',
          monthlyRate: 8,
          terminationRate: 40,
        },
      };
    }

    const monthlyRate = new Decimal(rateConfig.monthlyRate).div(100);
    const terminationRate = new Decimal(rateConfig.terminationRate).div(100);

    return {
      monthlyFgts: salary.mul(monthlyRate),
      terminationFgts: salary.mul(terminationRate),
      rateInfo: {
        positionName: rateConfig.positionName,
        positionCode: rateConfig.positionCode,
        monthlyRate: rateConfig.monthlyRate,
        terminationRate: rateConfig.terminationRate,
      },
    };
  }

  // ==================== TABELA IRRF ====================

  async createIrrfTable(companyId: string, dto: CreateIrrfTableDto) {
    const existing = await this.prisma.irrfTable.findFirst({
      where: {
        companyId,
        year: dto.year,
        active: true,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Já existe uma tabela IRRF ativa para ${dto.year}`,
      );
    }

    return this.prisma.irrfTable.create({
      data: {
        companyId,
        year: dto.year,
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
      orderBy: [{ year: 'desc' }],
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

    if (dto.active === true && dto.year) {
      await this.prisma.irrfTable.updateMany({
        where: {
          companyId,
          year: dto.year,
          id: { not: id },
        },
        data: { active: false },
      });
    }

    return this.prisma.irrfTable.update({
      where: { id },
      data: {
        year: dto.year,
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

  async getActiveIrrfTable(companyId: string, year: number) {
    const table = await this.prisma.irrfTable.findFirst({
      where: {
        companyId,
        year,
        active: true,
      },
    });

    if (!table) {
      return this.prisma.irrfTable.findFirst({
        where: {
          companyId,
          active: true,
          year: { lte: year },
        },
        orderBy: [{ year: 'desc' }],
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

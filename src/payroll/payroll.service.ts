import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaxTablesService } from '../tax-tables/tax-tables.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { ListPayrollDto } from './dto/list-payroll.dto';
import { CreatePayrollItemDto } from './dto/payroll-item.dto';
import { StatsPayrollDto } from './dto/stats-payroll.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PayrollService {
  constructor(
    private prisma: PrismaService,
    private taxTablesService: TaxTablesService,
  ) {}

  async create(
    createPayrollDto: CreatePayrollDto,
    companyId: string,
    userId: string,
  ) {
    // Log para debug
    console.log('Creating payroll with:', {
      companyId,
      userId,
      ...createPayrollDto,
    });

    // Verificar se já existe folha para este período e tipo
    const existing = await this.prisma.payroll.findUnique({
      where: {
        companyId_referenceMonth_referenceYear_type: {
          companyId,
          referenceMonth: createPayrollDto.referenceMonth,
          referenceYear: createPayrollDto.referenceYear,
          type: createPayrollDto.type,
        },
      },
    });

    if (existing) {
      const monthNames = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ];
      const monthName = monthNames[createPayrollDto.referenceMonth - 1];
      const typeNames = {
        MONTHLY: 'MENSAL',
        DAILY: 'DIÁRIA',
        WEEKLY: 'SEMANAL',
        ADVANCE: 'ADIANTAMENTO',
      };
      const typeName = typeNames[createPayrollDto.type];

      throw new BadRequestException(
        `Já existe uma folha de pagamento ${typeName} para ${monthName}/${createPayrollDto.referenceYear}`,
      );
    }

    // Validar datas
    const startDate = new Date(createPayrollDto.startDate);
    const endDate = new Date(createPayrollDto.endDate);
    const paymentDate = new Date(createPayrollDto.paymentDate);

    if (endDate < startDate) {
      throw new BadRequestException(
        'A data de fim deve ser posterior à data de início',
      );
    }

    if (paymentDate <= endDate) {
      throw new BadRequestException(
        'A data de pagamento deve ser posterior à data de fim do período',
      );
    }

    return this.prisma.payroll.create({
      data: {
        companyId,
        referenceMonth: createPayrollDto.referenceMonth,
        referenceYear: createPayrollDto.referenceYear,
        type: createPayrollDto.type,
        startDate,
        endDate,
        paymentDate,
        createdById: userId,
        status: 'DRAFT',
        totalEarnings: 0,
        totalDeductions: 0,
        netAmount: 0,
      },
    });
  }

  async findAll(listDto: ListPayrollDto, companyId: string) {
    const { status, type, referenceMonth, referenceYear } = listDto;
    const page = listDto.page || 1;
    const limit = listDto.limit || 50;

    const where: any = { companyId };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (referenceMonth) {
      where.referenceMonth = referenceMonth;
    }

    if (referenceYear) {
      where.referenceYear = referenceYear;
    }

    const skip = (page - 1) * limit;

    const [payrolls, total] = await Promise.all([
      this.prisma.payroll.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { referenceYear: 'desc' },
          { referenceMonth: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          _count: {
            select: { items: true },
          },
        },
      }),
      this.prisma.payroll.count({ where }),
    ]);

    return {
      data: payrolls.map((p) => ({
        id: p.id,
        referenceMonth: p.referenceMonth,
        referenceYear: p.referenceYear,
        type: p.type,
        status: p.status,
        paymentDate: p.paymentDate,
        totalEarnings: p.totalEarnings.toString(),
        totalDeductions: p.totalDeductions.toString(),
        netAmount: p.netAmount.toString(),
        itemsCount: p._count.items,
        createdAt: p.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, companyId: string) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, companyId },
      include: {
        items: {
          include: {
            employee: {
              select: {
                id: true,
                name: true,
                cpf: true,
                position: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException('Folha de pagamento não encontrada');
    }

    return {
      ...payroll,
      totalEarnings: payroll.totalEarnings.toString(),
      totalDeductions: payroll.totalDeductions.toString(),
      netAmount: payroll.netAmount.toString(),
      items: payroll.items.map((item) => ({
        ...item,
        baseSalary: item.baseSalary.toString(),
        totalEarnings: item.totalEarnings.toString(),
        totalDeductions: item.totalDeductions.toString(),
        netAmount: item.netAmount.toString(),
      })),
    };
  }

  async update(
    id: string,
    updatePayrollDto: UpdatePayrollDto,
    companyId: string,
  ) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, companyId },
    });

    if (!payroll) {
      throw new NotFoundException('Folha de pagamento não encontrada');
    }

    if (payroll.status !== 'DRAFT') {
      throw new BadRequestException(
        'Não é possível alterar uma folha de pagamento que não está em rascunho',
      );
    }

    // Validar datas se fornecidas
    if (updatePayrollDto.startDate || updatePayrollDto.endDate || updatePayrollDto.paymentDate) {
      const startDate = updatePayrollDto.startDate
        ? new Date(updatePayrollDto.startDate)
        : payroll.startDate;
      const endDate = updatePayrollDto.endDate
        ? new Date(updatePayrollDto.endDate)
        : payroll.endDate;
      const paymentDate = updatePayrollDto.paymentDate
        ? new Date(updatePayrollDto.paymentDate)
        : payroll.paymentDate;

      if (endDate < startDate) {
        throw new BadRequestException(
          'A data de fim deve ser posterior à data de início',
        );
      }

      if (paymentDate <= endDate) {
        throw new BadRequestException(
          'A data de pagamento deve ser posterior à data de fim do período',
        );
      }
    }

    const updateData: any = {};

    if (updatePayrollDto.referenceMonth !== undefined) {
      updateData.referenceMonth = updatePayrollDto.referenceMonth;
    }
    if (updatePayrollDto.referenceYear !== undefined) {
      updateData.referenceYear = updatePayrollDto.referenceYear;
    }
    if (updatePayrollDto.type) {
      updateData.type = updatePayrollDto.type;
    }
    if (updatePayrollDto.startDate) {
      updateData.startDate = new Date(updatePayrollDto.startDate);
    }
    if (updatePayrollDto.endDate) {
      updateData.endDate = new Date(updatePayrollDto.endDate);
    }
    if (updatePayrollDto.paymentDate) {
      updateData.paymentDate = new Date(updatePayrollDto.paymentDate);
    }

    return this.prisma.payroll.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, companyId: string) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, companyId },
    });

    if (!payroll) {
      throw new NotFoundException('Folha de pagamento não encontrada');
    }

    if (payroll.status !== 'DRAFT') {
      throw new BadRequestException(
        'Só é possível deletar folhas de pagamento em rascunho',
      );
    }

    await this.prisma.payroll.delete({ where: { id } });

    return { message: 'Folha de pagamento deletada com sucesso' };
  }

  async calculate(id: string, companyId: string) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, companyId },
    });

    if (!payroll) {
      throw new NotFoundException('Folha de pagamento não encontrada');
    }

    if (payroll.status !== 'DRAFT') {
      throw new BadRequestException(
        'Só é possível calcular folhas de pagamento em rascunho',
      );
    }

    // Buscar todos os colaboradores ativos
    const employees = await this.prisma.employee.findMany({
      where: {
        companyId,
        active: true,
      },
      include: {
        earnings: {
          where: {
            active: true,
            OR: [
              { isRecurrent: true },
              {
                startDate: { lte: payroll.endDate },
                OR: [{ endDate: null }, { endDate: { gte: payroll.startDate } }],
              },
            ],
          },
          include: {
            earningType: true,
          },
        },
      },
    });

    // Deletar itens existentes
    await this.prisma.payrollItem.deleteMany({
      where: { payrollId: id },
    });

    let totalEarnings = new Decimal(0);
    let totalDeductions = new Decimal(0);
    let totalNet = new Decimal(0);

    // Criar itens para cada colaborador
    for (const employee of employees) {
      const baseSalary = new Decimal(employee.salary);
      const earnings: any[] = [
        {
          typeId: 'base-salary',
          code: 'SALARY',
          name: 'Salário Base',
          value: baseSalary.toNumber(),
        },
      ];

      // Adicionar proventos recorrentes
      for (const earning of employee.earnings) {
        let value = new Decimal(0);

        if (earning.value !== null) {
          value = new Decimal(earning.value);
        } else if (earning.percentage !== null) {
          const percentage = new Decimal(earning.percentage);
          value = baseSalary.mul(percentage).div(100);
        }

        earnings.push({
          typeId: earning.earningTypeId,
          code: earning.earningType.code,
          name: earning.earningType.name,
          value: value.toNumber(),
        });
      }

      const itemTotalEarnings = earnings.reduce(
        (sum, e) => sum.add(e.value),
        new Decimal(0),
      );

      // Buscar tabelas fiscais ativas para o período
      const inssTable = await this.taxTablesService.getActiveInssTable(
        companyId,
        payroll.referenceYear,
        payroll.referenceMonth,
      );
      const irrfTable = await this.taxTablesService.getActiveIrrfTable(
        companyId,
        payroll.referenceYear,
        payroll.referenceMonth,
      );
      const fgtsTable = await this.taxTablesService.getActiveFgtsTable(
        companyId,
        payroll.referenceYear,
        payroll.referenceMonth,
      );

      const deductions: any[] = [];

      // Calcular INSS usando tabela progressiva
      if (inssTable) {
        const inssCalc = this.taxTablesService.calculateInss(
          itemTotalEarnings,
          inssTable,
        );
        deductions.push({
          typeId: 'inss',
          code: 'INSS',
          name: 'INSS',
          value: inssCalc.employeeInss.toNumber(),
        });
      }

      // Calcular IRRF usando tabela progressiva
      // Base de cálculo: Total de proventos - INSS
      if (irrfTable) {
        const inssDeduction = deductions.find((d) => d.code === 'INSS');
        const taxableIncome = inssDeduction
          ? itemTotalEarnings.minus(inssDeduction.value)
          : itemTotalEarnings;

        const irrfCalc = this.taxTablesService.calculateIrrf(
          taxableIncome,
          0, // Número de dependentes - pode ser adicionado ao employee depois
          irrfTable,
        );

        if (irrfCalc.irrf.greaterThan(0)) {
          deductions.push({
            typeId: 'irrf',
            code: 'IRRF',
            name: 'IRRF',
            value: irrfCalc.irrf.toNumber(),
          });
        }
      }

      const itemTotalDeductions = deductions.reduce(
        (sum, d) => sum.add(d.value),
        new Decimal(0),
      );

      const itemNetAmount = itemTotalEarnings.sub(itemTotalDeductions);

      // Criar item da folha
      await this.prisma.payrollItem.create({
        data: {
          payrollId: id,
          employeeId: employee.id,
          baseSalary: employee.salary,
          workDays: 30,
          earnings,
          totalEarnings: itemTotalEarnings,
          deductions,
          totalDeductions: itemTotalDeductions,
          netAmount: itemNetAmount,
        },
      });

      totalEarnings = totalEarnings.add(itemTotalEarnings);
      totalDeductions = totalDeductions.add(itemTotalDeductions);
      totalNet = totalNet.add(itemNetAmount);
    }

    // Atualizar folha
    const updated = await this.prisma.payroll.update({
      where: { id },
      data: {
        status: 'CALCULATED',
        totalEarnings,
        totalDeductions,
        netAmount: totalNet,
      },
    });

    return {
      id: updated.id,
      status: updated.status,
      totalEarnings: updated.totalEarnings.toString(),
      totalDeductions: updated.totalDeductions.toString(),
      netAmount: updated.netAmount.toString(),
      itemsCount: employees.length,
      message: `Folha calculada com sucesso para ${employees.length} colaboradores`,
    };
  }

  async addOrUpdateItem(
    payrollId: string,
    createItemDto: CreatePayrollItemDto,
    companyId: string,
  ) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id: payrollId, companyId },
    });

    if (!payroll) {
      throw new NotFoundException('Folha de pagamento não encontrada');
    }

    if (payroll.status !== 'DRAFT' && payroll.status !== 'CALCULATED') {
      throw new BadRequestException(
        'Não é possível alterar itens de folha aprovada ou paga',
      );
    }

    // Verificar se colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: {
        id: createItemDto.employeeId,
        companyId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Calcular totais
    const totalEarnings = createItemDto.earnings.reduce(
      (sum, e) => sum + e.value,
      0,
    );
    const totalDeductions = createItemDto.deductions.reduce(
      (sum, d) => sum + d.value,
      0,
    );
    const netAmount = totalEarnings - totalDeductions;

    // Verificar se já existe item para este colaborador
    const existingItem = await this.prisma.payrollItem.findFirst({
      where: {
        payrollId,
        employeeId: createItemDto.employeeId,
      },
    });

    let item;

    if (existingItem) {
      // Atualizar item existente
      item = await this.prisma.payrollItem.update({
        where: { id: existingItem.id },
        data: {
          baseSalary: createItemDto.baseSalary,
          workDays: createItemDto.workDays,
          earnings: createItemDto.earnings as any,
          totalEarnings,
          deductions: createItemDto.deductions as any,
          totalDeductions,
          netAmount,
          notes: createItemDto.notes,
        },
      });
    } else {
      // Criar novo item
      item = await this.prisma.payrollItem.create({
        data: {
          payrollId,
          employeeId: createItemDto.employeeId,
          baseSalary: createItemDto.baseSalary,
          workDays: createItemDto.workDays,
          earnings: createItemDto.earnings as any,
          totalEarnings,
          deductions: createItemDto.deductions as any,
          totalDeductions,
          netAmount,
          notes: createItemDto.notes,
        },
      });
    }

    // Recalcular totais da folha
    await this.recalculatePayrollTotals(payrollId);

    return {
      id: item.id,
      payrollId: item.payrollId,
      employeeId: item.employeeId,
      baseSalary: item.baseSalary.toString(),
      workDays: item.workDays,
      totalEarnings: item.totalEarnings.toString(),
      totalDeductions: item.totalDeductions.toString(),
      netAmount: item.netAmount.toString(),
      notes: item.notes,
      updatedAt: item.updatedAt,
    };
  }

  private async recalculatePayrollTotals(payrollId: string) {
    const items = await this.prisma.payrollItem.findMany({
      where: { payrollId },
    });

    const totalEarnings = items.reduce(
      (sum, item) => sum.add(item.totalEarnings),
      new Decimal(0),
    );
    const totalDeductions = items.reduce(
      (sum, item) => sum.add(item.totalDeductions),
      new Decimal(0),
    );
    const netAmount = items.reduce(
      (sum, item) => sum.add(item.netAmount),
      new Decimal(0),
    );

    await this.prisma.payroll.update({
      where: { id: payrollId },
      data: {
        totalEarnings,
        totalDeductions,
        netAmount,
      },
    });
  }

  async approve(id: string, companyId: string, userId: string) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, companyId },
    });

    if (!payroll) {
      throw new NotFoundException('Folha de pagamento não encontrada');
    }

    if (payroll.status !== 'CALCULATED') {
      throw new BadRequestException(
        'A folha precisa ser calculada antes de ser aprovada',
      );
    }

    const updated = await this.prisma.payroll.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: userId,
        approvedAt: new Date(),
      },
      include: {
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      status: updated.status,
      approvedBy: updated.approvedBy,
      approvedAt: updated.approvedAt,
      message: 'Folha de pagamento aprovada com sucesso',
    };
  }

  async pay(id: string, companyId: string) {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id, companyId },
    });

    if (!payroll) {
      throw new NotFoundException('Folha de pagamento não encontrada');
    }

    if (payroll.status !== 'APPROVED') {
      throw new BadRequestException(
        'A folha precisa estar aprovada para ser marcada como paga',
      );
    }

    const updated = await this.prisma.payroll.update({
      where: { id },
      data: {
        status: 'PAID',
      },
    });

    return {
      id: updated.id,
      status: updated.status,
      message: 'Folha de pagamento marcada como paga',
    };
  }

  async stats(statsDto: StatsPayrollDto, companyId: string) {
    const year = statsDto.year || new Date().getFullYear();

    // Buscar todas as folhas pagas do ano
    const payrolls = await this.prisma.payroll.findMany({
      where: {
        companyId,
        referenceYear: year,
        status: 'PAID',
      },
      orderBy: {
        referenceMonth: 'asc',
      },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    const totalPaid = payrolls.reduce(
      (sum, p) => sum.add(p.netAmount),
      new Decimal(0),
    );

    const averageMonthly =
      payrolls.length > 0 ? totalPaid.div(payrolls.length) : new Decimal(0);

    const monthNames = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const byMonth = monthNames.map((monthName, index) => {
      const month = index + 1;
      const monthPayrolls = payrolls.filter((p) => p.referenceMonth === month);

      const totalEarnings = monthPayrolls.reduce(
        (sum, p) => sum.add(p.totalEarnings),
        new Decimal(0),
      );
      const totalDeductions = monthPayrolls.reduce(
        (sum, p) => sum.add(p.totalDeductions),
        new Decimal(0),
      );
      const netAmount = monthPayrolls.reduce(
        (sum, p) => sum.add(p.netAmount),
        new Decimal(0),
      );
      const employeesCount = monthPayrolls.reduce(
        (sum, p) => sum + p._count.items,
        0,
      );

      return {
        month,
        monthName,
        totalEarnings: totalEarnings.toString(),
        totalDeductions: totalDeductions.toString(),
        netAmount: netAmount.toString(),
        employeesCount,
      };
    });

    // Contar por status
    const allPayrolls = await this.prisma.payroll.findMany({
      where: {
        companyId,
        referenceYear: year,
      },
    });

    const byStatus = {
      DRAFT: allPayrolls.filter((p) => p.status === 'DRAFT').length,
      CALCULATED: allPayrolls.filter((p) => p.status === 'CALCULATED').length,
      APPROVED: allPayrolls.filter((p) => p.status === 'APPROVED').length,
      PAID: allPayrolls.filter((p) => p.status === 'PAID').length,
    };

    return {
      year,
      totalPaid: totalPaid.toString(),
      averageMonthly: averageMonthly.toString(),
      byMonth,
      byStatus,
    };
  }
}

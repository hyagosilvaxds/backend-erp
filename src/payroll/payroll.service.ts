import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaxTablesService } from '../tax-tables/tax-tables.service';
import { PdfService } from '../common/services/pdf.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { ListPayrollDto } from './dto/list-payroll.dto';
import { CreatePayrollItemDto } from './dto/payroll-item.dto';
import { StatsPayrollDto } from './dto/stats-payroll.dto';
import { Decimal } from '@prisma/client/runtime/library';
import * as ExcelJS from 'exceljs';

@Injectable()
export class PayrollService {
  constructor(
    private prisma: PrismaService,
    private taxTablesService: TaxTablesService,
    private pdfService: PdfService,
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
      );
      const irrfTable = await this.taxTablesService.getActiveIrrfTable(
        companyId,
        payroll.referenceYear,
      );
      const fgtsTable = await this.taxTablesService.getActiveFgtsTable(
        companyId,
        payroll.referenceYear,
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

  /**
   * Gera PDF do holerite de um colaborador específico
   */
  async generatePayslipPdf(
    payrollId: string,
    itemId: string,
    companyId: string,
  ): Promise<Buffer> {
    // Buscar folha de pagamento com empresa
    const payroll = await this.prisma.payroll.findFirst({
      where: { id: payrollId, companyId },
      include: {
        company: true,
      },
    });

    if (!payroll) {
      throw new NotFoundException('Folha de pagamento não encontrada');
    }

    // Buscar item da folha com colaborador e cargo
    const item = await this.prisma.payrollItem.findFirst({
      where: {
        id: itemId,
        payrollId,
      },
      include: {
        employee: {
          include: {
            position: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item da folha não encontrado');
    }

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    const monthName = monthNames[payroll.referenceMonth - 1];

    const address = payroll.company.logradouro 
      ? `${payroll.company.logradouro}, ${payroll.company.numero || 's/n'} - ${payroll.company.bairro || ''} - ${payroll.company.cidade || ''}/${payroll.company.estado || ''}`.trim()
      : 'Endereço não informado';

    const positionName = item.employee.position?.name || 'Não informado';

    // Construir template HTML
    const earningsRows = (item.earnings as any[])
      .map(earning => `
        <tr>
          <td>${earning.name}</td>
          <td class="text-right">${this.pdfService.formatCurrency(earning.value)}</td>
        </tr>
      `)
      .join('');

    const deductionsRows = (item.deductions as any[])
      .map(deduction => `
        <tr>
          <td>${deduction.name}</td>
          <td class="text-right">${this.pdfService.formatCurrency(deduction.value)}</td>
        </tr>
      `)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${this.pdfService.getBaseStyles()}
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 60px;
            padding-top: 10px;
            text-align: center;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${payroll.company.razaoSocial}</h1>
          <p class="subtitle">RECIBO DE PAGAMENTO DE SALÁRIO</p>
          ${payroll.company.cnpj ? `<p>CNPJ: ${payroll.company.cnpj}</p>` : ''}
          <p>${address}</p>
        </div>

        <div class="section">
          <h2>DADOS DO COLABORADOR</h2>
          <table class="info-table">
            <tr>
              <td><strong>Nome:</strong> ${item.employee.name}</td>
              <td><strong>CPF:</strong> ${this.pdfService.formatCpf(item.employee.cpf)}</td>
            </tr>
            <tr>
              <td><strong>Cargo:</strong> ${positionName}</td>
              <td><strong>Admissão:</strong> ${this.pdfService.formatDate(item.employee.admissionDate)}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>PERÍODO DE REFERÊNCIA</h2>
          <table class="info-table">
            <tr>
              <td><strong>Mês/Ano:</strong> ${monthName}/${payroll.referenceYear}</td>
              <td><strong>Dias Trabalhados:</strong> ${item.workDays}</td>
              <td><strong>Data de Pagamento:</strong> ${this.pdfService.formatDate(payroll.paymentDate)}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>PROVENTOS</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th class="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${earningsRows}
              <tr class="total-row">
                <td><strong>TOTAL DE PROVENTOS</strong></td>
                <td class="text-right"><strong>${this.pdfService.formatCurrency(item.totalEarnings.toString())}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>DESCONTOS</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th class="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${deductionsRows}
              <tr class="total-row">
                <td><strong>TOTAL DE DESCONTOS</strong></td>
                <td class="text-right"><strong>${this.pdfService.formatCurrency(item.totalDeductions.toString())}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="net-amount">
          <div class="net-amount-label">VALOR LÍQUIDO A RECEBER</div>
          <div class="net-amount-value">${this.pdfService.formatCurrency(item.netAmount.toString())}</div>
        </div>

        ${item.notes ? `
          <div class="section">
            <h2>OBSERVAÇÕES</h2>
            <p>${item.notes}</p>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; margin-top: 80px;">
          <div style="width: 45%; text-align: center;">
            <div class="signature-line">Assinatura do Empregador</div>
          </div>
          <div style="width: 45%; text-align: center;">
            <div class="signature-line">Assinatura do Colaborador</div>
          </div>
        </div>

        <div class="footer">
          <p>Documento gerado em ${this.pdfService.formatDate(new Date())}</p>
        </div>
      </body>
      </html>
    `;

    return this.pdfService.generatePdfFromHtml(html);
  }

  /**
   * Gera PDF consolidado da folha de pagamento
   */
  async generatePayrollPdf(
    payrollId: string,
    companyId: string,
  ): Promise<Buffer> {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id: payrollId, companyId },
      include: {
        company: true,
        items: {
          include: {
            employee: {
              include: {
                position: true,
              },
            },
          },
          orderBy: {
            employee: {
              name: 'asc',
            },
          },
        },
        createdBy: true,
        approvedBy: true,
      },
    });

    if (!payroll) {
      throw new NotFoundException('Folha de pagamento não encontrada');
    }

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    const monthName = monthNames[payroll.referenceMonth - 1];

    const statusNames = {
      DRAFT: 'Rascunho',
      CALCULATED: 'Calculada',
      APPROVED: 'Aprovada',
      PAID: 'Paga',
    };

    const typeNames = {
      MONTHLY: 'Mensal',
      DAILY: 'Diária',
      WEEKLY: 'Semanal',
      ADVANCE: 'Adiantamento',
    };

    // Construir linhas da tabela de colaboradores
    const employeeRows = payroll.items
      .map(item => `
        <tr>
          <td>${item.employee.name}</td>
          <td class="text-center">${item.employee.position?.name || '-'}</td>
          <td class="text-center">${item.workDays}</td>
          <td class="text-right">${this.pdfService.formatCurrency(item.totalEarnings.toString())}</td>
          <td class="text-right">${this.pdfService.formatCurrency(item.totalDeductions.toString())}</td>
          <td class="text-right"><strong>${this.pdfService.formatCurrency(item.netAmount.toString())}</strong></td>
        </tr>
      `)
      .join('');

    const address = payroll.company.logradouro 
      ? `${payroll.company.logradouro}, ${payroll.company.numero || 's/n'} - ${payroll.company.bairro || ''} - ${payroll.company.cidade || ''}/${payroll.company.estado || ''}`.trim()
      : '';

    // Construir template HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          ${this.pdfService.getBaseStyles()}
          @media print {
            @page { size: A4 landscape; }
          }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${payroll.company.razaoSocial}</h1>
          <p class="subtitle">FOLHA DE PAGAMENTO</p>
          ${payroll.company.cnpj ? `<p>CNPJ: ${payroll.company.cnpj}</p>` : ''}
          ${address ? `<p>${address}</p>` : ''}
        </div>

        <div class="section">
          <table class="info-table">
            <tr>
              <td><strong>Período:</strong> ${monthName}/${payroll.referenceYear}</td>
              <td><strong>Tipo:</strong> ${typeNames[payroll.type]}</td>
              <td><strong>Status:</strong> ${statusNames[payroll.status]}</td>
              <td><strong>Colaboradores:</strong> ${payroll.items.length}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>DETALHAMENTO POR COLABORADOR</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th class="text-center">Cargo</th>
                <th class="text-center">Dias</th>
                <th class="text-right">Proventos</th>
                <th class="text-right">Descontos</th>
                <th class="text-right">Líquido</th>
              </tr>
            </thead>
            <tbody>
              ${employeeRows}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>TOTALIZADORES</h2>
          <table class="info-table" style="background: #f8f9fa;">
            <tr>
              <td>
                <strong>Total de Proventos</strong><br>
                <span style="color: #22c55e; font-size: 18px; font-weight: bold;">
                  ${this.pdfService.formatCurrency(payroll.totalEarnings.toString())}
                </span>
              </td>
              <td>
                <strong>Total de Descontos</strong><br>
                <span style="color: #ef4444; font-size: 18px; font-weight: bold;">
                  ${this.pdfService.formatCurrency(payroll.totalDeductions.toString())}
                </span>
              </td>
              <td>
                <strong>Valor Líquido Total</strong><br>
                <span style="color: #3b82f6; font-size: 18px; font-weight: bold;">
                  ${this.pdfService.formatCurrency(payroll.netAmount.toString())}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>INFORMAÇÕES DE AUDITORIA</h2>
          <table class="info-table">
            <tr>
              <td>
                <strong>Criado por:</strong> ${payroll.createdBy.name}<br>
                <small>${this.pdfService.formatDate(payroll.createdAt)}</small>
              </td>
              ${payroll.approvedBy && payroll.approvedAt ? `
                <td>
                  <strong>Aprovado por:</strong> ${payroll.approvedBy.name}<br>
                  <small>${this.pdfService.formatDate(payroll.approvedAt)}</small>
                </td>
              ` : '<td></td>'}
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Documento gerado em ${this.pdfService.formatDate(new Date())}</p>
        </div>
      </body>
      </html>
    `;

    return this.pdfService.generatePdfFromHtml(html, true); // landscape = true
  }

  /**
   * Exporta folha de pagamento para Excel
   */
  async exportToExcel(
    payrollId: string,
    companyId: string,
  ): Promise<Buffer> {
    const payroll = await this.prisma.payroll.findFirst({
      where: { id: payrollId, companyId },
      include: {
        company: true,
        items: {
          include: {
            employee: {
              include: {
                position: true,
              },
            },
          },
          orderBy: {
            employee: {
              name: 'asc',
            },
          },
        },
        createdBy: true,
        approvedBy: true,
      },
    });

    if (!payroll) {
      throw new NotFoundException('Folha de pagamento não encontrada');
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ERP System';
    workbook.created = new Date();

    // Worksheet principal
    const worksheet = workbook.addWorksheet('Folha de Pagamento', {
      properties: { tabColor: { argb: '4472C4' } },
      views: [{ state: 'frozen', xSplit: 0, ySplit: 6 }],
    });

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    const monthName = monthNames[payroll.referenceMonth - 1];

    const statusNames = {
      DRAFT: 'Rascunho',
      CALCULATED: 'Calculada',
      APPROVED: 'Aprovada',
      PAID: 'Paga',
    };

    const typeNames = {
      MONTHLY: 'Mensal',
      DAILY: 'Diária',
      WEEKLY: 'Semanal',
      ADVANCE: 'Adiantamento',
    };

    // Cabeçalho da empresa
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = payroll.company.razaoSocial;
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 30;

    // Informações da folha
    worksheet.mergeCells('A2:H2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = 'FOLHA DE PAGAMENTO';
    subtitleCell.font = { size: 14, bold: true };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 25;

    // Detalhes
    worksheet.getCell('A3').value = 'Período:';
    worksheet.getCell('B3').value = `${monthName}/${payroll.referenceYear}`;
    worksheet.getCell('D3').value = 'Tipo:';
    worksheet.getCell('E3').value = typeNames[payroll.type];
    worksheet.getCell('G3').value = 'Status:';
    worksheet.getCell('H3').value = statusNames[payroll.status];

    worksheet.getCell('A4').value = 'Data Início:';
    worksheet.getCell('B4').value = this.pdfService.formatDate(payroll.startDate);
    worksheet.getCell('D4').value = 'Data Fim:';
    worksheet.getCell('E4').value = this.pdfService.formatDate(payroll.endDate);
    worksheet.getCell('G4').value = 'Pagamento:';
    worksheet.getCell('H4').value = this.pdfService.formatDate(payroll.paymentDate);

    // Estilo dos labels
    ['A3', 'D3', 'G3', 'A4', 'D4', 'G4'].forEach(cell => {
      worksheet.getCell(cell).font = { bold: true };
    });

    // Linha em branco
    worksheet.getRow(5).height = 5;

    // Cabeçalho da tabela
    const headerRow = worksheet.getRow(6);
    const headers = [
      'Colaborador',
      'Cargo',
      'CPF',
      'Dias',
      'Proventos (R$)',
      'Descontos (R$)',
      'FGTS (R$)',
      'Líquido (R$)',
    ];
    
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '5B9BD5' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    headerRow.height = 25;

    // Largura das colunas
    worksheet.columns = [
      { width: 30 }, // Colaborador
      { width: 25 }, // Cargo
      { width: 15 }, // CPF
      { width: 8 },  // Dias
      { width: 15 }, // Proventos
      { width: 15 }, // Descontos
      { width: 15 }, // FGTS
      { width: 15 }, // Líquido
    ];

    // Dados dos colaboradores
    let currentRow = 7;
    payroll.items.forEach((item) => {
      const row = worksheet.getRow(currentRow);
      
      row.getCell(1).value = item.employee.name;
      row.getCell(2).value = item.employee.position?.name || '-';
      row.getCell(3).value = this.pdfService.formatCpf(item.employee.cpf);
      row.getCell(4).value = item.workDays;
      row.getCell(5).value = parseFloat(item.totalEarnings.toString());
      row.getCell(6).value = parseFloat(item.totalDeductions.toString());
      
      // Calcula FGTS (8% sobre proventos)
      const fgts = parseFloat(item.totalEarnings.toString()) * 0.08;
      row.getCell(7).value = fgts;
      
      row.getCell(8).value = parseFloat(item.netAmount.toString());

      // Formatação de valores
      [5, 6, 7, 8].forEach(col => {
        const cell = row.getCell(col);
        cell.numFmt = '#,##0.00';
        cell.alignment = { horizontal: 'right' };
      });

      // Centro para dias
      row.getCell(4).alignment = { horizontal: 'center' };

      // Bordas
      for (let i = 1; i <= 8; i++) {
        row.getCell(i).border = {
          top: { style: 'thin', color: { argb: 'D0D0D0' } },
          left: { style: 'thin', color: { argb: 'D0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'D0D0D0' } },
          right: { style: 'thin', color: { argb: 'D0D0D0' } },
        };
      }

      currentRow++;
    });

    // Totalizadores
    currentRow += 1;
    const totalRow = worksheet.getRow(currentRow);
    totalRow.getCell(1).value = 'TOTAIS';
    totalRow.getCell(1).font = { bold: true, size: 12 };
    totalRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E7E6E6' },
    };
    
    // Soma dos proventos
    totalRow.getCell(5).value = parseFloat(payroll.totalEarnings.toString());
    totalRow.getCell(5).numFmt = '#,##0.00';
    totalRow.getCell(5).font = { bold: true, color: { argb: '008000' } };
    totalRow.getCell(5).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E2EFDA' },
    };

    // Soma dos descontos
    totalRow.getCell(6).value = parseFloat(payroll.totalDeductions.toString());
    totalRow.getCell(6).numFmt = '#,##0.00';
    totalRow.getCell(6).font = { bold: true, color: { argb: 'FF0000' } };
    totalRow.getCell(6).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FCE4D6' },
    };

    // Soma do FGTS
    const totalFgts = payroll.items.reduce((acc, item) => {
      return acc + (parseFloat(item.totalEarnings.toString()) * 0.08);
    }, 0);
    totalRow.getCell(7).value = totalFgts;
    totalRow.getCell(7).numFmt = '#,##0.00';
    totalRow.getCell(7).font = { bold: true };
    totalRow.getCell(7).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF2CC' },
    };

    // Valor líquido total
    totalRow.getCell(8).value = parseFloat(payroll.netAmount.toString());
    totalRow.getCell(8).numFmt = '#,##0.00';
    totalRow.getCell(8).font = { bold: true, color: { argb: '0000FF' } };
    totalRow.getCell(8).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'DDEBF7' },
    };

    // Alinhamento dos totais
    [5, 6, 7, 8].forEach(col => {
      totalRow.getCell(col).alignment = { horizontal: 'right', vertical: 'middle' };
    });

    totalRow.height = 30;

    // Bordas nos totais
    for (let i = 1; i <= 8; i++) {
      totalRow.getCell(i).border = {
        top: { style: 'medium' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' },
      };
    }

    // Auditoria
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'INFORMAÇÕES DE AUDITORIA';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 11 };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Criado por:';
    worksheet.getCell(`B${currentRow}`).value = payroll.createdBy.name;
    worksheet.getCell(`D${currentRow}`).value = 'Data:';
    worksheet.getCell(`E${currentRow}`).value = this.pdfService.formatDate(payroll.createdAt);

    if (payroll.approvedBy && payroll.approvedAt) {
      currentRow++;
      worksheet.getCell(`A${currentRow}`).value = 'Aprovado por:';
      worksheet.getCell(`B${currentRow}`).value = payroll.approvedBy.name;
      worksheet.getCell(`D${currentRow}`).value = 'Data:';
      worksheet.getCell(`E${currentRow}`).value = this.pdfService.formatDate(payroll.approvedAt);
    }

    // Adicionar worksheet com detalhamento individual
    const detailSheet = workbook.addWorksheet('Detalhamento por Colaborador');
    Object.assign(detailSheet.properties, { tabColor: { argb: '70AD47' } });

    // Para cada colaborador, criar uma seção detalhada
    let detailRow = 1;
    for (const item of payroll.items) {
      // Nome do colaborador
      detailSheet.mergeCells(`A${detailRow}:D${detailRow}`);
      const empCell = detailSheet.getCell(`A${detailRow}`);
      empCell.value = item.employee.name;
      empCell.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
      empCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' },
      };
      empCell.alignment = { vertical: 'middle', horizontal: 'left' };
      detailSheet.getRow(detailRow).height = 25;
      detailRow++;

      // Informações básicas
      detailSheet.getCell(`A${detailRow}`).value = 'Cargo:';
      detailSheet.getCell(`B${detailRow}`).value = item.employee.position?.name || '-';
      detailSheet.getCell(`C${detailRow}`).value = 'CPF:';
      detailSheet.getCell(`D${detailRow}`).value = this.pdfService.formatCpf(item.employee.cpf);
      detailRow++;

      detailSheet.getCell(`A${detailRow}`).value = 'Dias Trabalhados:';
      detailSheet.getCell(`B${detailRow}`).value = item.workDays;
      detailRow++;

      // Proventos
      detailRow++;
      detailSheet.getCell(`A${detailRow}`).value = 'PROVENTOS';
      detailSheet.getCell(`A${detailRow}`).font = { bold: true };
      detailRow++;

      detailSheet.getCell(`A${detailRow}`).value = 'Descrição';
      detailSheet.getCell(`B${detailRow}`).value = 'Valor (R$)';
      detailSheet.getCell(`A${detailRow}`).font = { bold: true };
      detailSheet.getCell(`B${detailRow}`).font = { bold: true };
      detailRow++;

      (item.earnings as any[]).forEach(earning => {
        detailSheet.getCell(`A${detailRow}`).value = earning.name;
        detailSheet.getCell(`B${detailRow}`).value = parseFloat(earning.value);
        detailSheet.getCell(`B${detailRow}`).numFmt = '#,##0.00';
        detailRow++;
      });

      detailSheet.getCell(`A${detailRow}`).value = 'TOTAL PROVENTOS';
      detailSheet.getCell(`A${detailRow}`).font = { bold: true };
      detailSheet.getCell(`B${detailRow}`).value = parseFloat(item.totalEarnings.toString());
      detailSheet.getCell(`B${detailRow}`).numFmt = '#,##0.00';
      detailSheet.getCell(`B${detailRow}`).font = { bold: true };
      detailSheet.getCell(`B${detailRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E2EFDA' },
      };
      detailRow++;

      // Descontos
      detailRow++;
      detailSheet.getCell(`A${detailRow}`).value = 'DESCONTOS';
      detailSheet.getCell(`A${detailRow}`).font = { bold: true };
      detailRow++;

      detailSheet.getCell(`A${detailRow}`).value = 'Descrição';
      detailSheet.getCell(`B${detailRow}`).value = 'Valor (R$)';
      detailSheet.getCell(`A${detailRow}`).font = { bold: true };
      detailSheet.getCell(`B${detailRow}`).font = { bold: true };
      detailRow++;

      (item.deductions as any[]).forEach(deduction => {
        detailSheet.getCell(`A${detailRow}`).value = deduction.name;
        detailSheet.getCell(`B${detailRow}`).value = parseFloat(deduction.value);
        detailSheet.getCell(`B${detailRow}`).numFmt = '#,##0.00';
        detailRow++;
      });

      detailSheet.getCell(`A${detailRow}`).value = 'TOTAL DESCONTOS';
      detailSheet.getCell(`A${detailRow}`).font = { bold: true };
      detailSheet.getCell(`B${detailRow}`).value = parseFloat(item.totalDeductions.toString());
      detailSheet.getCell(`B${detailRow}`).numFmt = '#,##0.00';
      detailSheet.getCell(`B${detailRow}`).font = { bold: true };
      detailSheet.getCell(`B${detailRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FCE4D6' },
      };
      detailRow++;

      // Valor líquido
      detailRow++;
      detailSheet.getCell(`A${detailRow}`).value = 'VALOR LÍQUIDO';
      detailSheet.getCell(`A${detailRow}`).font = { bold: true, size: 12 };
      detailSheet.getCell(`B${detailRow}`).value = parseFloat(item.netAmount.toString());
      detailSheet.getCell(`B${detailRow}`).numFmt = '#,##0.00';
      detailSheet.getCell(`B${detailRow}`).font = { bold: true, size: 12, color: { argb: '0000FF' } };
      detailSheet.getCell(`B${detailRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DDEBF7' },
      };
      detailRow++;

      if (item.notes) {
        detailRow++;
        detailSheet.getCell(`A${detailRow}`).value = 'Observações:';
        detailSheet.getCell(`A${detailRow}`).font = { bold: true };
        detailRow++;
        detailSheet.getCell(`A${detailRow}`).value = item.notes;
        detailRow++;
      }

      detailRow += 2; // Espaço entre colaboradores
    }

    detailSheet.columns = [
      { width: 40 },
      { width: 20 },
      { width: 15 },
      { width: 20 },
    ];

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaxTablesService } from '../tax-tables/tax-tables.service';
import { DocumentsService } from '../documents/documents.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ListEmployeesDto } from './dto/list-employees.dto';
import { DismissEmployeeDto } from './dto/dismiss-employee.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private taxTablesService: TaxTablesService,
    private documentsService: DocumentsService,
  ) {}

  // Helper para ordenar workSchedule na ordem correta dos dias da semana
  private orderWorkSchedule(workSchedule: any): any {
    if (!workSchedule) return null;
    
    const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const ordered: any = {};
    
    // Adicionar dias na ordem correta
    dayOrder.forEach(day => {
      if (workSchedule[day]) {
        ordered[day] = workSchedule[day];
      }
    });
    
    // Adicionar campos opcionais no final
    if (workSchedule.weeklyHours !== undefined) {
      ordered.weeklyHours = workSchedule.weeklyHours;
    }
    if (workSchedule.generalNotes !== undefined) {
      ordered.generalNotes = workSchedule.generalNotes;
    }
    
    return ordered;
  }

  async create(
    createEmployeeDto: CreateEmployeeDto,
    companyId: string,
    userId: string,
  ) {
    // Verificar se já existe colaborador com esse CPF na empresa
    const existingEmployee = await this.prisma.employee.findUnique({
      where: {
        companyId_cpf: {
          companyId,
          cpf: createEmployeeDto.cpf,
        },
      },
    });

    if (existingEmployee) {
      throw new BadRequestException(
        'Já existe um colaborador com este CPF nesta empresa',
      );
    }

    // Verificar se o centro de custo existe (se fornecido)
    if (createEmployeeDto.costCenterId) {
      const costCenter = await this.prisma.centroCusto.findFirst({
        where: {
          id: createEmployeeDto.costCenterId,
          companyId,
          ativo: true,
        },
      });

      if (!costCenter) {
        throw new NotFoundException(
          `Centro de custo com ID ${createEmployeeDto.costCenterId} não encontrado ou inativo`,
        );
      }
    }

    // Verificar se o cargo existe (se fornecido)
    if (createEmployeeDto.positionId) {
      const position = await this.prisma.position.findFirst({
        where: {
          id: createEmployeeDto.positionId,
          companyId,
          active: true,
        },
      });

      if (!position) {
        throw new NotFoundException(
          `Cargo com ID ${createEmployeeDto.positionId} não encontrado ou inativo`,
        );
      }
    }

    // Verificar se o departamento existe (se fornecido)
    if (createEmployeeDto.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: {
          id: createEmployeeDto.departmentId,
          companyId,
          active: true,
        },
      });

      if (!department) {
        throw new NotFoundException(
          `Departamento com ID ${createEmployeeDto.departmentId} não encontrado ou inativo`,
        );
      }
    }

    // Criar o colaborador
    const employee = await this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        companyId,
        createdById: userId,
        workSchedule: createEmployeeDto.workSchedule as any,
      },
      include: {
        costCenter: {
          select: {
            id: true,
            codigo: true,
            nome: true,
          },
        },
        position: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Ordenar workSchedule antes de retornar
    return {
      ...employee,
      workSchedule: this.orderWorkSchedule(employee.workSchedule as any),
    };
  }

  async findAll(listEmployeesDto: ListEmployeesDto, companyId: string) {
    const {
      active,
      costCenterId,
      department,
      contractType,
      search,
      page = 1,
      limit = 50,
    } = listEmployeesDto;

    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (active !== undefined) {
      where.active = active;
    }

    if (costCenterId) {
      where.costCenterId = costCenterId;
    }

    if (department) {
      where.department = department;
    }

    if (contractType) {
      where.contractType = contractType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          costCenter: {
            select: {
              id: true,
              codigo: true,
              nome: true,
            },
          },
          position: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    // Ordenar workSchedule em cada colaborador
    const employeesWithOrderedSchedule = employees.map(emp => ({
      ...emp,
      workSchedule: this.orderWorkSchedule(emp.workSchedule as any),
    }));

    return {
      data: employeesWithOrderedSchedule,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats(companyId: string) {
    const [
      total,
      active,
      byContractType,
      byDepartment,
      salaryAgg,
    ] = await Promise.all([
      // Total de colaboradores
      this.prisma.employee.count({ where: { companyId } }),

      // Colaboradores ativos
      this.prisma.employee.count({ where: { companyId, active: true } }),

      // Por tipo de contrato
      this.prisma.employee.groupBy({
        by: ['contractType'],
        where: { companyId, active: true },
        _count: true,
      }),

      // Por departamento
      this.prisma.employee.groupBy({
        by: ['departmentId'],
        where: { companyId, active: true, departmentId: { not: null } },
        _count: true,
      }),

      // Agregação de salários
      this.prisma.employee.aggregate({
        where: { companyId, active: true },
        _sum: { salary: true },
        _avg: { salary: true },
      }),
    ]);

    const byContractTypeObj: Record<string, number> = {
      CLT: 0,
      PJ: 0,
      ESTAGIO: 0,
      TEMPORARIO: 0,
      AUTONOMO: 0,
    };

    byContractType.forEach((item) => {
      byContractTypeObj[item.contractType] = item._count;
    });

    const byDepartmentObj: Record<string, number> = {};
    byDepartment.forEach((item) => {
      if (item.departmentId) {
        byDepartmentObj[item.departmentId] = item._count;
      }
    });

    return {
      total,
      active,
      inactive: total - active,
      byContractType: byContractTypeObj,
      byDepartment: byDepartmentObj,
      totalPayroll: salaryAgg._sum.salary?.toString() || '0.00',
      averageSalary: salaryAgg._avg.salary?.toString() || '0.00',
    };
  }

  async findOne(id: string, companyId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
      include: {
        costCenter: {
          select: {
            id: true,
            codigo: true,
            nome: true,
          },
        },
        position: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        earnings: {
          where: { active: true },
          include: {
            earningType: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Ordenar workSchedule antes de retornar
    return {
      ...employee,
      workSchedule: this.orderWorkSchedule(employee.workSchedule as any),
    };
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
    companyId: string,
  ) {
    // Verificar se o colaborador existe
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Se estiver alterando o CPF, verificar duplicidade
    if (updateEmployeeDto.cpf && updateEmployeeDto.cpf !== employee.cpf) {
      const existingEmployee = await this.prisma.employee.findUnique({
        where: {
          companyId_cpf: {
            companyId,
            cpf: updateEmployeeDto.cpf,
          },
        },
      });

      if (existingEmployee) {
        throw new BadRequestException(
          'Já existe um colaborador com este CPF nesta empresa',
        );
      }
    }

    // Se estiver alterando o centro de custo, verificar se existe
    if (updateEmployeeDto.costCenterId) {
      const costCenter = await this.prisma.centroCusto.findFirst({
        where: {
          id: updateEmployeeDto.costCenterId,
          companyId,
          ativo: true,
        },
      });

      if (!costCenter) {
        throw new NotFoundException(
          `Centro de custo com ID ${updateEmployeeDto.costCenterId} não encontrado ou inativo`,
        );
      }
    }

    // Atualizar o colaborador
    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: {
        ...updateEmployeeDto,
        workSchedule: updateEmployeeDto.workSchedule as any,
      },
      include: {
        costCenter: {
          select: {
            id: true,
            codigo: true,
            nome: true,
          },
        },
        position: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Ordenar workSchedule antes de retornar
    return {
      ...updatedEmployee,
      workSchedule: this.orderWorkSchedule(updatedEmployee.workSchedule as any),
    };
  }

  async remove(id: string, companyId: string) {
    // Verificar se o colaborador existe
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Deletar o colaborador
    await this.prisma.employee.delete({
      where: { id },
    });

    return { message: 'Colaborador deletado com sucesso' };
  }

  async toggleActive(id: string, companyId: string) {
    // Verificar se o colaborador existe
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Alternar o status
    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: { active: !employee.active },
    });

    return updatedEmployee;
  }

  async dismiss(
    id: string,
    dismissEmployeeDto: DismissEmployeeDto,
    companyId: string,
  ) {
    // Verificar se o colaborador existe
    const employee = await this.prisma.employee.findFirst({
      where: { id, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Verificar se a data de demissão é posterior à admissão
    if (dismissEmployeeDto.dismissalDate < employee.admissionDate) {
      throw new BadRequestException(
        'A data de demissão deve ser posterior à data de admissão',
      );
    }

    // Atualizar o colaborador
    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: {
        dismissalDate: dismissEmployeeDto.dismissalDate,
        active: false,
        notes: dismissEmployeeDto.notes || employee.notes,
      },
    });

    return updatedEmployee;
  }

  async getDashboardStats(
    dashboardStatsDto: DashboardStatsDto,
    companyId: string,
  ) {
    // Usar mês/ano atual se não fornecido
    const now = new Date();
    const month = dashboardStatsDto.month || now.getMonth() + 1;
    const year = dashboardStatsDto.year || now.getFullYear();

    // 1. Total de colaboradores (ativos e inativos)
    const [totalEmployees, activeEmployees] = await Promise.all([
      this.prisma.employee.count({
        where: { companyId },
      }),
      this.prisma.employee.count({
        where: { companyId, active: true },
      }),
    ]);

    // 2. Buscar todos os colaboradores ativos com seus dados
    const employees = await this.prisma.employee.findMany({
      where: {
        companyId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        salary: true,
        admissionDate: true,
        costCenterId: true,
        costCenter: {
          select: {
            id: true,
            codigo: true,
            nome: true,
          },
        },
      },
    });

    // 3. Calcular folha mensal (soma de salários base)
    const monthlyPayroll = employees.reduce((sum, emp) => {
      return sum.add(emp.salary);
    }, new Decimal(0));

    // 4. Buscar tabelas fiscais ativas
    const [inssTable, fgtsTable, irrfTable] = await Promise.all([
      this.taxTablesService.getActiveInssTable(companyId, year, month),
      this.taxTablesService.getActiveFgtsTable(companyId, year, month),
      this.taxTablesService.getActiveIrrfTable(companyId, year, month),
    ]);

    // 5. Calcular encargos reais usando tabelas fiscais
    let totalInssEmployer = new Decimal(0);
    let totalFgts = new Decimal(0);
    let totalIrrf = new Decimal(0);

    for (const emp of employees) {
      const salary = new Decimal(emp.salary);

      // INSS Patronal (alíquota do empregador)
      if (inssTable) {
        const inssCalc = this.taxTablesService.calculateInss(salary, inssTable);
        totalInssEmployer = totalInssEmployer.add(inssCalc.employerInss);
      }

      // FGTS (8% normalmente para CLT)
      if (fgtsTable) {
        const fgtsCalc = this.taxTablesService.calculateFgts(
          salary,
          'CLT', // Pode ser adaptado para usar emp.contractType
          fgtsTable,
        );
        totalFgts = totalFgts.add(fgtsCalc.monthlyFgts);
      }
    }

    // Provisões (13º salário + férias + 1/3 de férias)
    // 13º = 1/12 da folha mensal = 8.33%
    // Férias = 1/12 da folha mensal = 8.33%
    // 1/3 Férias = 1/3 de 8.33% = 2.78%
    // Total provisões = 19.44%
    const provisionsRate = new Decimal(0.1944);
    const totalProvisions = monthlyPayroll.mul(provisionsRate);

    // Outros encargos (RAT, Salário Educação, Sistema S)
    // RAT: 1% a 3% (vamos usar 2% como média)
    // Salário Educação: 2.5%
    // Sistema S (SESI, SENAI, SESC, SENAC): 1% a 5.8% (vamos usar 3%)
    // Total outros: ~7.5%
    const othersRate = new Decimal(0.075);
    const totalOthers = monthlyPayroll.mul(othersRate);

    // Total de encargos
    const totalCharges = totalInssEmployer
      .add(totalFgts)
      .add(totalProvisions)
      .add(totalOthers);

    // Percentual de encargos sobre folha
    const chargesPercentage = monthlyPayroll.greaterThan(0)
      ? totalCharges.div(monthlyPayroll).mul(100)
      : new Decimal(0);

    // Custo total mensal (salários + encargos)
    const totalMonthlyCost = monthlyPayroll.add(totalCharges);

    // 6. Admissões recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAdmissions = await this.prisma.employee.findMany({
      where: {
        companyId,
        admissionDate: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        id: true,
        name: true,
        position: true,
        department: true,
        admissionDate: true,
        salary: true,
        costCenter: {
          select: {
            codigo: true,
            nome: true,
          },
        },
      },
      orderBy: {
        admissionDate: 'desc',
      },
      take: 10,
    });

    // 7. Custo por centro de custo
    const costCenterMap = new Map<
      string,
      {
        costCenterId: string;
        code: string;
        name: string;
        employeesCount: number;
        totalSalary: Decimal;
        totalCharges: Decimal;
        totalCost: Decimal;
      }
    >();

    employees.forEach((emp) => {
      const ccId = emp.costCenterId || 'no-cost-center';
      const ccCode = emp.costCenter?.codigo || 'N/A';
      const ccName = emp.costCenter?.nome || 'Sem Centro de Custo';

      if (!costCenterMap.has(ccId)) {
        costCenterMap.set(ccId, {
          costCenterId: ccId,
          code: ccCode,
          name: ccName,
          employeesCount: 0,
          totalSalary: new Decimal(0),
          totalCharges: new Decimal(0),
          totalCost: new Decimal(0),
        });
      }

      const ccData = costCenterMap.get(ccId)!;
      ccData.employeesCount++;
      ccData.totalSalary = ccData.totalSalary.add(emp.salary);
      
      // Calcular encargos proporcionais para este centro de custo
      const empSalary = new Decimal(emp.salary);
      let empCharges = new Decimal(0);

      if (inssTable) {
        const inssCalc = this.taxTablesService.calculateInss(empSalary, inssTable);
        empCharges = empCharges.add(inssCalc.employerInss);
      }

      if (fgtsTable) {
        const fgtsCalc = this.taxTablesService.calculateFgts(empSalary, 'CLT', fgtsTable);
        empCharges = empCharges.add(fgtsCalc.monthlyFgts);
      }

      // Adicionar provisões e outros
      empCharges = empCharges.add(empSalary.mul(provisionsRate)).add(empSalary.mul(othersRate));

      ccData.totalCharges = ccData.totalCharges.add(empCharges);
      ccData.totalCost = ccData.totalSalary.add(ccData.totalCharges);
    });

    const costByCostCenter = Array.from(costCenterMap.values())
      .map((cc) => ({
        costCenterId: cc.costCenterId === 'no-cost-center' ? null : cc.costCenterId,
        code: cc.code,
        name: cc.name,
        employeesCount: cc.employeesCount,
        totalSalary: cc.totalSalary.toString(),
        totalCharges: cc.totalCharges.toString(),
        totalCost: cc.totalCost.toString(),
        percentageOfTotal: monthlyPayroll.greaterThan(0)
          ? cc.totalSalary.div(monthlyPayroll).mul(100).toFixed(2)
          : '0.00',
      }))
      .sort((a, b) => parseFloat(b.totalCost) - parseFloat(a.totalCost));

    // 8. Retornar dashboard completo
    return {
      referenceMonth: month,
      referenceYear: year,
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees,
      },
      costs: {
        monthlyPayroll: monthlyPayroll.toString(),
        totalCharges: totalCharges.toString(),
        chargesBreakdown: {
          inssEmployer: totalInssEmployer.toString(),
          fgts: totalFgts.toString(),
          provisions: totalProvisions.toString(),
          others: totalOthers.toString(),
        },
        chargesPercentage: chargesPercentage.toFixed(2),
        totalMonthlyCost: totalMonthlyCost.toString(),
        averageSalary:
          activeEmployees > 0
            ? monthlyPayroll.div(activeEmployees).toFixed(2)
            : '0.00',
      },
      recentAdmissions: recentAdmissions.map((emp) => ({
        id: emp.id,
        name: emp.name,
        position: emp.position,
        department: emp.department,
        admissionDate: emp.admissionDate,
        salary: emp.salary.toString(),
        costCenter: emp.costCenter
          ? {
              code: emp.costCenter.codigo,
              name: emp.costCenter.nome,
            }
          : null,
      })),
      costByCostCenter,
    };
  }

  // ==================== EARNINGS ====================

  async getEmployeeEarnings(
    employeeId: string,
    companyId: string,
    filters?: {
      month?: number;
      year?: number;
      active?: boolean;
      isRecurrent?: boolean;
    },
  ) {
    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Construir where clause
    const where: any = { employeeId };

    // Filtrar por status ativo/inativo
    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    // Filtrar por recorrente
    if (filters?.isRecurrent !== undefined) {
      where.isRecurrent = filters.isRecurrent;
    }

    // Filtrar por mês/ano (verifica se o earning está ativo naquele período)
    if (filters?.month && filters?.year) {
      const startOfMonth = new Date(filters.year, filters.month - 1, 1);
      const endOfMonth = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);

      where.AND = [
        {
          startDate: {
            lte: endOfMonth, // Começou antes ou durante o mês
          },
        },
        {
          OR: [
            { endDate: null }, // Sem data de fim (ativo indefinidamente)
            {
              endDate: {
                gte: startOfMonth, // Termina depois ou durante o mês
              },
            },
          ],
        },
      ];
    } else if (filters?.year) {
      // Apenas ano
      const startOfYear = new Date(filters.year, 0, 1);
      const endOfYear = new Date(filters.year, 11, 31, 23, 59, 59, 999);

      where.AND = [
        {
          startDate: {
            lte: endOfYear,
          },
        },
        {
          OR: [
            { endDate: null },
            {
              endDate: {
                gte: startOfYear,
              },
            },
          ],
        },
      ];
    }

    const earnings = await this.prisma.employeeEarning.findMany({
      where,
      include: {
        earningType: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            isRecurrent: true,
            isPercentage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return earnings;
  }

  async addEmployeeEarning(
    employeeId: string,
    companyId: string,
    data: {
      earningTypeId: string;
      value?: number;
      percentage?: number;
      isRecurrent?: boolean;
      active?: boolean;
      startDate?: Date | string;
      endDate?: Date | string;
    },
  ) {
    // Validar que ao menos value ou percentage foi fornecido
    if (!data.value && !data.percentage) {
      throw new BadRequestException('É necessário fornecer ao menos value ou percentage');
    }

    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Verificar se o tipo de provento existe
    const earningType = await this.prisma.earningType.findFirst({
      where: {
        id: data.earningTypeId,
        companyId,
        active: true,
      },
    });

    if (!earningType) {
      throw new NotFoundException('Tipo de provento não encontrado');
    }

    const earning = await this.prisma.employeeEarning.create({
      data: {
        employeeId,
        earningTypeId: data.earningTypeId,
        value: data.value ? new Decimal(data.value) : null,
        percentage: data.percentage ? new Decimal(data.percentage) : null,
        isRecurrent: data.isRecurrent ?? false,
        active: data.active ?? true,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
      },
      include: {
        earningType: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            isRecurrent: true,
            isPercentage: true,
          },
        },
      },
    });

    return earning;
  }

  async updateEmployeeEarning(
    employeeId: string,
    earningId: string,
    companyId: string,
    data: {
      value?: number;
      percentage?: number;
      active?: boolean;
      startDate?: Date | string;
      endDate?: Date | string;
    },
  ) {
    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Verificar se o earning existe e pertence ao colaborador
    const earning = await this.prisma.employeeEarning.findFirst({
      where: {
        id: earningId,
        employeeId,
      },
    });

    if (!earning) {
      throw new NotFoundException('Provento não encontrado');
    }

    const updatedEarning = await this.prisma.employeeEarning.update({
      where: { id: earningId },
      data: {
        ...(data.value !== undefined && { value: new Decimal(data.value) }),
        ...(data.percentage !== undefined && { percentage: data.percentage ? new Decimal(data.percentage) : null }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
      },
      include: {
        earningType: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            isRecurrent: true,
            isPercentage: true,
          },
        },
      },
    });

    return updatedEarning;
  }

  async removeEmployeeEarning(
    employeeId: string,
    earningId: string,
    companyId: string,
  ) {
    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Verificar se o earning existe e pertence ao colaborador
    const earning = await this.prisma.employeeEarning.findFirst({
      where: {
        id: earningId,
        employeeId,
      },
    });

    if (!earning) {
      throw new NotFoundException('Provento não encontrado');
    }

    await this.prisma.employeeEarning.delete({
      where: { id: earningId },
    });

    return { message: 'Provento removido com sucesso' };
  }

  // ==================== DEDUCTIONS ====================

  async getEmployeeDeductions(
    employeeId: string,
    companyId: string,
    filters?: {
      month?: number;
      year?: number;
      active?: boolean;
      isRecurrent?: boolean;
    },
  ) {
    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Construir where clause
    const where: any = { employeeId };

    // Filtrar por status ativo/inativo
    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    // Filtrar por recorrente
    if (filters?.isRecurrent !== undefined) {
      where.isRecurrent = filters.isRecurrent;
    }

    // Filtrar por mês/ano
    if (filters?.month && filters?.year) {
      const startOfMonth = new Date(filters.year, filters.month - 1, 1);
      const endOfMonth = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);

      where.AND = [
        {
          startDate: {
            lte: endOfMonth,
          },
        },
        {
          OR: [
            { endDate: null },
            {
              endDate: {
                gte: startOfMonth,
              },
            },
          ],
        },
      ];
    } else if (filters?.year) {
      const startOfYear = new Date(filters.year, 0, 1);
      const endOfYear = new Date(filters.year, 11, 31, 23, 59, 59, 999);

      where.AND = [
        {
          startDate: {
            lte: endOfYear,
          },
        },
        {
          OR: [
            { endDate: null },
            {
              endDate: {
                gte: startOfYear,
              },
            },
          ],
        },
      ];
    }

    const deductions = await this.prisma.employeeDeduction.findMany({
      where,
      include: {
        deductionType: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            isRecurrent: true,
            isPercentage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return deductions;
  }

  async addEmployeeDeduction(
    employeeId: string,
    companyId: string,
    data: {
      deductionTypeId: string;
      value?: number;
      percentage?: number;
      isRecurrent?: boolean;
      active?: boolean;
      startDate?: Date | string;
      endDate?: Date | string;
    },
  ) {
    // Validar que ao menos value ou percentage foi fornecido
    if (!data.value && !data.percentage) {
      throw new BadRequestException('É necessário fornecer ao menos value ou percentage');
    }

    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Verificar se o tipo de desconto existe
    const deductionType = await this.prisma.deductionType.findFirst({
      where: {
        id: data.deductionTypeId,
        companyId,
        active: true,
      },
    });

    if (!deductionType) {
      throw new NotFoundException('Tipo de desconto não encontrado');
    }

    const deduction = await this.prisma.employeeDeduction.create({
      data: {
        employeeId,
        deductionTypeId: data.deductionTypeId,
        value: data.value ? new Decimal(data.value) : null,
        percentage: data.percentage ? new Decimal(data.percentage) : null,
        isRecurrent: data.isRecurrent ?? false,
        active: data.active ?? true,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
      },
      include: {
        deductionType: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            isRecurrent: true,
            isPercentage: true,
          },
        },
      },
    });

    return deduction;
  }

  async updateEmployeeDeduction(
    employeeId: string,
    deductionId: string,
    companyId: string,
    data: {
      value?: number;
      percentage?: number;
      active?: boolean;
      startDate?: Date | string;
      endDate?: Date | string;
    },
  ) {
    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Verificar se o deduction existe e pertence ao colaborador
    const deduction = await this.prisma.employeeDeduction.findFirst({
      where: {
        id: deductionId,
        employeeId,
      },
    });

    if (!deduction) {
      throw new NotFoundException('Desconto não encontrado');
    }

    const updatedDeduction = await this.prisma.employeeDeduction.update({
      where: { id: deductionId },
      data: {
        ...(data.value !== undefined && { value: new Decimal(data.value) }),
        ...(data.percentage !== undefined && { percentage: data.percentage ? new Decimal(data.percentage) : null }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
      },
      include: {
        deductionType: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            isRecurrent: true,
            isPercentage: true,
          },
        },
      },
    });

    return updatedDeduction;
  }

  async removeEmployeeDeduction(
    employeeId: string,
    deductionId: string,
    companyId: string,
  ) {
    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Verificar se o deduction existe e pertence ao colaborador
    const deduction = await this.prisma.employeeDeduction.findFirst({
      where: {
        id: deductionId,
        employeeId,
      },
    });

    if (!deduction) {
      throw new NotFoundException('Desconto não encontrado');
    }

    await this.prisma.employeeDeduction.delete({
      where: { id: deductionId },
    });

    return { message: 'Desconto removido com sucesso' };
  }

  // ==================== DOCUMENTS ====================

  /**
   * Garante a estrutura de pastas para documentos de RH
   * Estrutura: RH / Documentos de Colaboradores / {Nome do Colaborador}
   * @param employeeId ID do colaborador
   * @param companyId ID da empresa
   * @param userId ID do usuário que está fazendo upload
   * @returns ID da pasta do colaborador
   */
  private async ensureEmployeeDocumentFolder(
    employeeId: string,
    companyId: string,
    userId: string,
  ): Promise<string> {
    // Buscar colaborador
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
      select: { id: true, name: true },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // 1. Buscar roles que tenham permissões de RH
    // Buscar usuários da empresa com suas roles
    const userCompanies = await this.prisma.userCompany.findMany({
      where: { companyId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Encontrar roles que tenham permissões de employees
    const hrRoleIds = new Set<string>();
    for (const uc of userCompanies) {
      if (uc.role) {
        const hasHRPermission = uc.role.rolePermissions.some(rp => 
          rp.permission.resource === 'employees' && 
          ['read', 'update', 'create'].includes(rp.permission.action)
        );
        if (hasHRPermission) {
          hrRoleIds.add(uc.role.id);
        }
      }
    }

    const hrRoleIdsArray = Array.from(hrRoleIds);

    // 2. Pasta raiz: RH
    const rhFolder = await this.documentsService.findOrCreateFolder(
      'RH',
      companyId,
      undefined,
      userId,
    );

    // Atualizar permissões da pasta RH para apenas roles de RH
    if (hrRoleIdsArray.length > 0) {
      await this.prisma.documentFolder.update({
        where: { id: rhFolder.id },
        data: {
          isPublic: false,
          allowedRoleIds: hrRoleIdsArray,
        },
      });
    }

    // 3. Subpasta: Documentos de Colaboradores
    const colaboradoresFolder = await this.documentsService.findOrCreateFolder(
      'Documentos de Colaboradores',
      companyId,
      rhFolder.id,
      userId,
    );

    // Atualizar permissões
    if (hrRoleIdsArray.length > 0) {
      await this.prisma.documentFolder.update({
        where: { id: colaboradoresFolder.id },
        data: {
          isPublic: false,
          allowedRoleIds: hrRoleIdsArray,
        },
      });
    }

    // 4. Subpasta do colaborador
    const employeeFolder = await this.documentsService.findOrCreateFolder(
      employee.name,
      companyId,
      colaboradoresFolder.id,
      userId,
    );

    // Atualizar permissões
    if (hrRoleIdsArray.length > 0) {
      await this.prisma.documentFolder.update({
        where: { id: employeeFolder.id },
        data: {
          isPublic: false,
          allowedRoleIds: hrRoleIdsArray,
        },
      });
    }

    return employeeFolder.id;
  }

  async getEmployeeDocuments(
    employeeId: string,
    companyId: string,
    filters?: {
      documentType?: string;
      verified?: boolean;
      active?: boolean;
    },
  ) {
    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Construir where clause
    const where: any = { employeeId };

    if (filters?.documentType) {
      where.documentType = filters.documentType;
    }

    if (filters?.verified !== undefined) {
      where.verified = filters.verified;
    }

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    const documents = await this.prisma.employeeDocument.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents;
  }

  async uploadEmployeeDocument(
    employeeId: string,
    companyId: string,
    userId: string,
    filePath: string,
    file: {
      originalname: string;
      size: number;
      mimetype: string;
    },
    data: {
      documentType: string;
      name?: string;
      description?: string;
      documentNumber?: string;
      issueDate?: string;
      expiryDate?: string;
      verified?: boolean;
      notes?: string;
    },
  ) {
    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
      select: { id: true, name: true },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Validar userId
    if (!userId) {
      throw new BadRequestException('Usuário não identificado');
    }

    // Garantir estrutura de pastas e obter ID da pasta do colaborador
    const folderId = await this.ensureEmployeeDocumentFolder(
      employeeId,
      companyId,
      userId,
    );

    // Determinar extensão do arquivo
    const fileExtension = file.originalname.split('.').pop() || '';

    // Nome do documento (usar fornecido ou nome do arquivo)
    const documentName = data.name || file.originalname;

    // Criar documento no hub de documentos
    const hubDocument = await this.prisma.document.create({
      data: {
        companyId,
        folderId,
        name: documentName,
        description: data.description,
        fileName: file.originalname,
        filePath: filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileExtension,
        documentType: data.documentType,
        tags: [data.documentType, 'colaborador', employee.name],
        reference: data.documentNumber,
        expiresAt: data.expiryDate ? new Date(data.expiryDate) : null,
        uploadedById: userId,
      },
    });

    // Criar registro em EmployeeDocument para manter tracking
    const employeeDocument = await this.prisma.employeeDocument.create({
      data: {
        employeeId,
        documentType: data.documentType,
        name: documentName,
        description: data.description,
        documentNumber: data.documentNumber,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        fileUrl: `/uploads/${filePath}`, // Caminho relativo
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        verified: data.verified ?? false,
        notes: data.notes,
        uploadedById: userId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      ...employeeDocument,
      hubDocumentId: hubDocument.id,
      folder: {
        id: folderId,
        path: `RH / Documentos de Colaboradores / ${employee.name}`,
      },
    };
  }

  async updateEmployeeDocument(
    employeeId: string,
    documentId: string,
    companyId: string,
    data: {
      name?: string;
      description?: string;
      documentNumber?: string;
      issueDate?: string;
      expiryDate?: string;
      verified?: boolean;
      active?: boolean;
      notes?: string;
    },
  ) {
    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Verificar se o documento existe e pertence ao colaborador
    const document = await this.prisma.employeeDocument.findFirst({
      where: {
        id: documentId,
        employeeId,
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    const updatedDocument = await this.prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.documentNumber !== undefined && { documentNumber: data.documentNumber }),
        ...(data.issueDate && { issueDate: new Date(data.issueDate) }),
        ...(data.expiryDate !== undefined && { 
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null 
        }),
        ...(data.verified !== undefined && { verified: data.verified }),
        ...(data.active !== undefined && { active: data.active }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedDocument;
  }

  async removeEmployeeDocument(
    employeeId: string,
    documentId: string,
    companyId: string,
  ) {
    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    // Verificar se o documento existe e pertence ao colaborador
    const document = await this.prisma.employeeDocument.findFirst({
      where: {
        id: documentId,
        employeeId,
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    // Deletar documento do banco
    await this.prisma.employeeDocument.delete({
      where: { id: documentId },
    });

    // Tentar deletar arquivo físico (se existir)
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), document.fileUrl);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Log do erro mas não falha a operação
      console.error('Erro ao deletar arquivo físico:', error);
    }

    return { message: 'Documento removido com sucesso' };
  }

  async getEmployeeDocument(
    employeeId: string,
    documentId: string,
    companyId: string,
  ) {
    // Verificar se o colaborador existe e pertence à empresa
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new NotFoundException('Colaborador não encontrado');
    }

    const document = await this.prisma.employeeDocument.findFirst({
      where: {
        id: documentId,
        employeeId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    return document;
  }
}

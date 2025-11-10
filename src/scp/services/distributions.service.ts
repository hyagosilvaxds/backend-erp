import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDistributionDto, DistributionStatus } from '../dto/create-distribution.dto';
import { UpdateDistributionDto } from '../dto/update-distribution.dto';
import { ListDistributionsDto } from '../dto/list-distributions.dto';
import { CreateBulkDistributionDto } from '../dto/create-bulk-distribution.dto';

@Injectable()
export class DistributionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, createDto: CreateDistributionDto) {
    // Verify project exists
    const project = await this.prisma.scpProject.findFirst({
      where: {
        id: createDto.projectId,
        companyId,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verify investor exists
    const investor = await this.prisma.investor.findFirst({
      where: {
        id: createDto.investorId,
        companyId,
      },
    });

    if (!investor) {
      throw new NotFoundException('Investidor não encontrado');
    }

    // Calculate net amount
    const irrf = createDto.irrf || 0;
    const otherDeductions = createDto.otherDeductions || 0;
    const netAmount = createDto.amount - irrf - otherDeductions;

    // Create distribution
    const distribution = await this.prisma.distribution.create({
      data: {
        companyId,
        ...createDto,
        irrf,
        otherDeductions,
        netAmount,
        status: createDto.status || 'PENDENTE',
        paidAt: createDto.status === 'PAGO' ? new Date() : null,
      },
      include: {
        project: true,
        investor: true,
      },
    });

    // Update project's distributedValue if status is PAGO
    if (distribution.status === 'PAGO') {
      await this.prisma.scpProject.update({
        where: { id: project.id },
        data: {
          distributedValue: {
            increment: distribution.netAmount,
          },
        },
      });
    }

    return distribution;
  }

  /**
   * Cria distribuições para múltiplos investidores de uma vez
   */
  async createBulk(companyId: string, createDto: CreateBulkDistributionDto) {
    // Verify project exists
    const project = await this.prisma.scpProject.findFirst({
      where: {
        id: createDto.projectId,
        companyId,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verify all investors exist
    const investorIds = createDto.distributions.map(d => d.investorId);
    const investors = await this.prisma.investor.findMany({
      where: {
        id: { in: investorIds },
        companyId,
      },
    });

    if (investors.length !== investorIds.length) {
      throw new NotFoundException('Um ou mais investidores não encontrados');
    }

    // Create all distributions in a transaction
    const createdDistributions = await this.prisma.$transaction(async (tx) => {
      const distributions: any[] = [];
      let totalDistributed = 0;

      for (const distItem of createDto.distributions) {
        // Calculate net amount
        const irrf = distItem.irrf || 0;
        const otherDeductions = distItem.otherDeductions || 0;
        const netAmount = distItem.amount - irrf - otherDeductions;

        // Create distribution
        const distribution = await tx.distribution.create({
          data: {
            companyId,
            projectId: createDto.projectId,
            investorId: distItem.investorId,
            amount: distItem.amount,
            percentage: distItem.percentage,
            baseValue: createDto.baseValue,
            referenceNumber: createDto.referenceNumber,
            distributionDate: createDto.distributionDate,
            competenceDate: createDto.competenceDate,
            paymentMethod: createDto.paymentMethod,
            paymentDate: createDto.paymentDate,
            bankAccountId: createDto.bankAccountId,
            status: createDto.status || 'PENDENTE',
            irrf,
            otherDeductions,
            netAmount,
            notes: distItem.notes,
            attachments: createDto.attachments || [],
            paidAt: createDto.status === 'PAGO' ? new Date() : null,
          },
          include: {
            project: true,
            investor: true,
          },
        });

        distributions.push(distribution);

        // Sum total distributed if paid
        if (distribution.status === 'PAGO') {
          totalDistributed += distribution.netAmount;
        }
      }

      // Update project's distributedValue if any distribution is PAGO
      if (totalDistributed > 0) {
        await tx.scpProject.update({
          where: { id: project.id },
          data: {
            distributedValue: {
              increment: totalDistributed,
            },
          },
        });
      }

      return distributions;
    });

    return {
      message: `${createdDistributions.length} distribuições criadas com sucesso`,
      count: createdDistributions.length,
      distributions: createdDistributions,
    };
  }

  async findAll(companyId: string, filters: ListDistributionsDto) {
    const { page = 1, limit = 10, projectId, investorId, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (investorId) {
      where.investorId = investorId;
    }

    if (status) {
      where.status = status;
    }

    const [distributions, total] = await Promise.all([
      this.prisma.distribution.findMany({
        where,
        skip,
        take: limit,
        orderBy: { distributionDate: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          investor: {
            select: {
              id: true,
              type: true,
              fullName: true,
              companyName: true,
              cpf: true,
              cnpj: true,
            },
          },
        },
      }),
      this.prisma.distribution.count({ where }),
    ]);

    return {
      data: distributions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const distribution = await this.prisma.distribution.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        project: true,
        investor: true,
        bankAccount: true,
        financialTransaction: true,
      },
    });

    if (!distribution) {
      throw new NotFoundException('Distribuição não encontrada');
    }

    return distribution;
  }

  async update(companyId: string, id: string, updateDto: UpdateDistributionDto) {
    const distribution = await this.prisma.distribution.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!distribution) {
      throw new NotFoundException('Distribuição não encontrada');
    }

    // Recalculate net amount if amounts changed
    let netAmount = distribution.netAmount;
    if (updateDto.amount !== undefined || updateDto.irrf !== undefined || updateDto.otherDeductions !== undefined) {
      const amount = updateDto.amount !== undefined ? updateDto.amount : distribution.amount;
      const irrf = updateDto.irrf !== undefined ? updateDto.irrf : distribution.irrf;
      const otherDeductions = updateDto.otherDeductions !== undefined ? updateDto.otherDeductions : distribution.otherDeductions;
      netAmount = amount - irrf - otherDeductions;
    }

    // Handle status changes
    const statusChanged = updateDto.status && updateDto.status !== distribution.status;
    let paidAt = distribution.paidAt;

    if (statusChanged) {
      // Update project's distributedValue based on status change
      let adjustment = 0;

      if (distribution.status === 'PAGO') {
        // Was paid, now changing to something else - subtract
        adjustment -= distribution.netAmount;
      }

      if (updateDto.status === 'PAGO') {
        // Now being paid - add
        adjustment += netAmount;
        paidAt = new Date();
      } else {
        paidAt = null;
      }

      if (adjustment !== 0) {
        await this.prisma.scpProject.update({
          where: { id: distribution.projectId },
          data: {
            distributedValue: {
              increment: adjustment,
            },
          },
        });
      }
    }

    return this.prisma.distribution.update({
      where: { id },
      data: {
        ...updateDto,
        netAmount,
        paidAt,
      },
      include: {
        project: true,
        investor: true,
      },
    });
  }

  async remove(companyId: string, id: string) {
    const distribution = await this.prisma.distribution.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!distribution) {
      throw new NotFoundException('Distribuição não encontrada');
    }

    // Update project's distributedValue if distribution was paid
    if (distribution.status === 'PAGO') {
      await this.prisma.scpProject.update({
        where: { id: distribution.projectId },
        data: {
          distributedValue: {
            decrement: distribution.netAmount,
          },
        },
      });
    }

    await this.prisma.distribution.delete({
      where: { id },
    });

    return { message: 'Distribuição excluída com sucesso' };
  }

  async getInvestorDistributions(companyId: string, investorId: string) {
    // Verify investor exists
    const investor = await this.prisma.investor.findFirst({
      where: {
        id: investorId,
        companyId,
      },
      select: {
        id: true,
        type: true,
        fullName: true,
        companyName: true,
        cpf: true,
        cnpj: true,
      },
    });

    if (!investor) {
      throw new NotFoundException('Investidor não encontrado');
    }

    const distributions = await this.prisma.distribution.findMany({
      where: {
        companyId,
        investorId,
      },
      include: {
        project: true,
      },
      orderBy: { distributionDate: 'desc' },
    });

    const summary = distributions.reduce(
      (acc, dist) => {
        if (dist.status === 'PAGO') {
          acc.totalPaid += dist.netAmount;
        } else if (dist.status === 'PENDENTE') {
          acc.totalPending += dist.netAmount;
        }
        return acc;
      },
      { totalPaid: 0, totalPending: 0 },
    );

    return {
      investor: {
        id: investor.id,
        type: investor.type,
        name: investor.type === 'PESSOA_FISICA' ? investor.fullName : investor.companyName,
        document: investor.type === 'PESSOA_FISICA' ? investor.cpf : investor.cnpj,
      },
      distributions,
      summary,
    };
  }

  async getProjectDistributions(companyId: string, projectId: string) {
    // Verify project exists
    const project = await this.prisma.scpProject.findFirst({
      where: {
        id: projectId,
        companyId,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    const distributions = await this.prisma.distribution.findMany({
      where: {
        companyId,
        projectId,
      },
      include: {
        investor: true,
      },
      orderBy: { distributionDate: 'desc' },
    });

    const summary = distributions.reduce(
      (acc, dist) => {
        if (dist.status === 'PAGO') {
          acc.totalPaid += dist.netAmount;
        } else if (dist.status === 'PENDENTE') {
          acc.totalPending += dist.netAmount;
        }
        return acc;
      },
      { totalPaid: 0, totalPending: 0 },
    );

    return {
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        investedValue: project.investedValue,
        distributedValue: project.distributedValue,
      },
      distributions,
      summary,
    };
  }

  async markAsPaid(companyId: string, id: string) {
    return this.update(companyId, id, { status: DistributionStatus.PAGO });
  }

  async markAsCanceled(companyId: string, id: string) {
    return this.update(companyId, id, { status: DistributionStatus.CANCELADO });
  }

  async bulkCreateFromPolicies(
    companyId: string,
    projectId: string,
    baseValue: number,
    competenceDate: string,
    distributionDate: string,
  ) {
    // Verify project exists
    const project = await this.prisma.scpProject.findFirst({
      where: {
        id: projectId,
        companyId,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Get active policies
    const policies = await this.prisma.distributionPolicy.findMany({
      where: {
        companyId,
        projectId,
        active: true,
      },
      include: {
        investor: true,
      },
    });

    if (policies.length === 0) {
      throw new BadRequestException('Nenhuma política de distribuição ativa encontrada');
    }

    const totalPercentage = policies.reduce((sum, p) => sum + p.percentage, 0);

    if (totalPercentage !== 100) {
      throw new BadRequestException(
        `A soma dos percentuais deve ser 100%. Atualmente: ${totalPercentage}%`,
      );
    }

    // Create distributions for each policy
    const distributions = await Promise.all(
      policies.map((policy) => {
        const amount = (baseValue * policy.percentage) / 100;
        return this.prisma.distribution.create({
          data: {
            companyId,
            projectId,
            investorId: policy.investorId,
            amount,
            percentage: policy.percentage,
            baseValue,
            distributionDate,
            competenceDate,
            status: 'PENDENTE',
            irrf: 0,
            otherDeductions: 0,
            netAmount: amount,
          },
          include: {
            project: true,
            investor: true,
          },
        });
      }),
    );

    return {
      message: `${distributions.length} distribuições criadas com sucesso`,
      distributions,
    };
  }
}

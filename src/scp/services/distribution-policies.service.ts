import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDistributionPolicyDto } from '../dto/create-distribution-policy.dto';
import { UpdateDistributionPolicyDto } from '../dto/update-distribution-policy.dto';
import { ListDistributionPoliciesDto } from '../dto/list-distribution-policies.dto';

@Injectable()
export class DistributionPoliciesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, createDto: CreateDistributionPolicyDto) {
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

    // Check if investor already has an active policy for this project
    const existingPolicy = await this.prisma.distributionPolicy.findFirst({
      where: {
        projectId: createDto.projectId,
        investorId: createDto.investorId,
        active: true,
      },
    });

    if (existingPolicy) {
      throw new BadRequestException(
        'Investidor já possui uma política de distribuição ativa para este projeto',
      );
    }

    // Validate that total percentages don't exceed 100%
    await this.validateTotalPercentage(
      companyId,
      createDto.projectId,
      createDto.percentage,
    );

    return this.prisma.distributionPolicy.create({
      data: {
        companyId,
        ...createDto,
        type: createDto.type || 'PROPORCIONAL',
        active: createDto.active !== undefined ? createDto.active : true,
      },
      include: {
        project: true,
        investor: true,
      },
    });
  }

  async findAll(companyId: string, filters: ListDistributionPoliciesDto) {
    const { page = 1, limit = 10, projectId, investorId, active } = filters;
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

    if (active !== undefined) {
      where.active = active;
    }

    const [policies, total] = await Promise.all([
      this.prisma.distributionPolicy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      this.prisma.distributionPolicy.count({ where }),
    ]);

    return {
      data: policies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const policy = await this.prisma.distributionPolicy.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        project: true,
        investor: true,
      },
    });

    if (!policy) {
      throw new NotFoundException('Política de distribuição não encontrada');
    }

    return policy;
  }

  async update(companyId: string, id: string, updateDto: UpdateDistributionPolicyDto) {
    const policy = await this.prisma.distributionPolicy.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!policy) {
      throw new NotFoundException('Política de distribuição não encontrada');
    }

    // If percentage is being changed, validate total
    if (updateDto.percentage && updateDto.percentage !== policy.percentage) {
      const adjustment = updateDto.percentage - policy.percentage;
      await this.validateTotalPercentage(
        companyId,
        policy.projectId,
        adjustment,
        id,
      );
    }

    return this.prisma.distributionPolicy.update({
      where: { id },
      data: updateDto,
      include: {
        project: true,
        investor: true,
      },
    });
  }

  async remove(companyId: string, id: string) {
    const policy = await this.prisma.distributionPolicy.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!policy) {
      throw new NotFoundException('Política de distribuição não encontrada');
    }

    await this.prisma.distributionPolicy.delete({
      where: { id },
    });

    return { message: 'Política de distribuição excluída com sucesso' };
  }

  async getProjectPolicies(companyId: string, projectId: string) {
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

    const policies = await this.prisma.distributionPolicy.findMany({
      where: {
        companyId,
        projectId,
        active: true,
      },
      include: {
        investor: true,
      },
      orderBy: { percentage: 'desc' },
    });

    const totalPercentage = policies.reduce((sum, p) => sum + p.percentage, 0);

    return {
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
      },
      policies,
      summary: {
        totalPolicies: policies.length,
        totalPercentage,
        remainingPercentage: 100 - totalPercentage,
        isComplete: totalPercentage === 100,
      },
    };
  }

  private async validateTotalPercentage(
    companyId: string,
    projectId: string,
    additionalPercentage: number,
    excludePolicyId?: string,
  ) {
    const where: any = {
      companyId,
      projectId,
      active: true,
    };

    if (excludePolicyId) {
      where.id = { not: excludePolicyId };
    }

    const existingPolicies = await this.prisma.distributionPolicy.findMany({
      where,
    });

    const currentTotal = existingPolicies.reduce((sum, p) => sum + p.percentage, 0);
    const newTotal = currentTotal + additionalPercentage;

    if (newTotal > 100) {
      throw new BadRequestException(
        `O total de percentuais de distribuição não pode exceder 100%. ` +
        `Atualmente: ${currentTotal}%, Tentando adicionar: ${additionalPercentage}%, ` +
        `Resultado: ${newTotal}%`,
      );
    }

    return true;
  }

  async calculateDistributionAmounts(companyId: string, projectId: string, baseValue: number) {
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
      throw new NotFoundException('Nenhuma política de distribuição ativa encontrada para este projeto');
    }

    const totalPercentage = policies.reduce((sum, p) => sum + p.percentage, 0);

    if (totalPercentage !== 100) {
      throw new BadRequestException(
        `A soma dos percentuais de distribuição deve ser 100%. Atualmente: ${totalPercentage}%`,
      );
    }

    return policies.map((policy) => ({
      policyId: policy.id,
      investorId: policy.investorId,
      investorName: policy.investor.type === 'PESSOA_FISICA' 
        ? policy.investor.fullName 
        : policy.investor.companyName,
      percentage: policy.percentage,
      amount: (baseValue * policy.percentage) / 100,
    }));
  }
}

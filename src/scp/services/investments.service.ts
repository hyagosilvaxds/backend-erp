import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvestmentDto } from '../dto/create-investment.dto';
import { UpdateInvestmentDto } from '../dto/update-investment.dto';
import { ListInvestmentsDto } from '../dto/list-investments.dto';

@Injectable()
export class InvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, createDto: CreateInvestmentDto) {
    // Verify project exists and belongs to company
    const project = await this.prisma.scpProject.findFirst({
      where: {
        id: createDto.projectId,
        companyId,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verify investor exists and belongs to company
    const investor = await this.prisma.investor.findFirst({
      where: {
        id: createDto.investorId,
        companyId,
      },
    });

    if (!investor) {
      throw new NotFoundException('Investidor não encontrado');
    }

    // Create investment
    const investment = await this.prisma.investment.create({
      data: {
        companyId,
        ...createDto,
        status: createDto.status || 'CONFIRMADO',
      },
      include: {
        project: true,
        investor: true,
      },
    });

    // Update project's investedValue
    if (investment.status === 'CONFIRMADO') {
      await this.prisma.scpProject.update({
        where: { id: project.id },
        data: {
          investedValue: {
            increment: investment.amount,
          },
        },
      });
    }

    return investment;
  }

  async findAll(companyId: string, filters: ListInvestmentsDto) {
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

    const [investments, total] = await Promise.all([
      this.prisma.investment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { investmentDate: 'desc' },
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
      this.prisma.investment.count({ where }),
    ]);

    return {
      data: investments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const investment = await this.prisma.investment.findFirst({
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

    if (!investment) {
      throw new NotFoundException('Aporte não encontrado');
    }

    // Buscar documentos vinculados ao aporte
    const documents = await this.prisma.document.findMany({
      where: {
        companyId,
        tags: {
          has: investment.id, // Busca documentos com o ID do aporte nas tags
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      ...investment,
      documents, // Adiciona documentos vinculados
    };
  }

  async update(companyId: string, id: string, updateDto: UpdateInvestmentDto) {
    const investment = await this.prisma.investment.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!investment) {
      throw new NotFoundException('Aporte não encontrado');
    }

    // If status is being changed from/to CONFIRMADO, update project's investedValue
    const statusChanged =
      updateDto.status && updateDto.status !== investment.status;
    const amountChanged =
      updateDto.amount && updateDto.amount !== investment.amount;

    let investedValueAdjustment = 0;

    if (statusChanged || amountChanged) {
      // Calculate adjustment needed
      if (investment.status === 'CONFIRMADO') {
        // Currently confirmed, need to subtract old amount
        investedValueAdjustment -= investment.amount;
      }

      if ((updateDto.status || investment.status) === 'CONFIRMADO') {
        // Will be confirmed, need to add new amount
        investedValueAdjustment += updateDto.amount || investment.amount;
      }

      if (investedValueAdjustment !== 0) {
        await this.prisma.scpProject.update({
          where: { id: investment.projectId },
          data: {
            investedValue: {
              increment: investedValueAdjustment,
            },
          },
        });
      }
    }

    return this.prisma.investment.update({
      where: { id },
      data: updateDto,
      include: {
        project: true,
        investor: true,
      },
    });
  }

  async remove(companyId: string, id: string) {
    const investment = await this.prisma.investment.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!investment) {
      throw new NotFoundException('Aporte não encontrado');
    }

    // Update project's investedValue if investment was confirmed
    if (investment.status === 'CONFIRMADO') {
      await this.prisma.scpProject.update({
        where: { id: investment.projectId },
        data: {
          investedValue: {
            decrement: investment.amount,
          },
        },
      });
    }

    await this.prisma.investment.delete({
      where: { id },
    });

    return { message: 'Aporte excluído com sucesso' };
  }

  async getInvestorInvestments(companyId: string, investorId: string) {
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

    const investments = await this.prisma.investment.findMany({
      where: {
        companyId,
        investorId,
      },
      include: {
        project: true,
      },
      orderBy: { investmentDate: 'desc' },
    });

    const summary = investments.reduce(
      (acc, inv) => {
        if (inv.status === 'CONFIRMADO') {
          acc.totalConfirmed += inv.amount;
        } else if (inv.status === 'PENDENTE') {
          acc.totalPending += inv.amount;
        }
        return acc;
      },
      { totalConfirmed: 0, totalPending: 0 },
    );

    return {
      investor: {
        id: investor.id,
        type: investor.type,
        name: investor.type === 'PESSOA_FISICA' ? investor.fullName : investor.companyName,
        document: investor.type === 'PESSOA_FISICA' ? investor.cpf : investor.cnpj,
      },
      investments,
      summary,
    };
  }

  async getProjectInvestments(companyId: string, projectId: string) {
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

    const investments = await this.prisma.investment.findMany({
      where: {
        companyId,
        projectId,
      },
      include: {
        investor: true,
      },
      orderBy: { investmentDate: 'desc' },
    });

    const summary = investments.reduce(
      (acc, inv) => {
        if (inv.status === 'CONFIRMADO') {
          acc.totalConfirmed += inv.amount;
        } else if (inv.status === 'PENDENTE') {
          acc.totalPending += inv.amount;
        }
        return acc;
      },
      { totalConfirmed: 0, totalPending: 0 },
    );

    return {
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        totalValue: project.totalValue,
        investedValue: project.investedValue,
      },
      investments,
      summary,
    };
  }
}

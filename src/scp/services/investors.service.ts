import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvestorDto } from '../dto/create-investor.dto';
import { UpdateInvestorDto } from '../dto/update-investor.dto';
import { ListInvestorsDto } from '../dto/list-investors.dto';

@Injectable()
export class InvestorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, createDto: CreateInvestorDto) {
    // Validate document uniqueness based on type
    if (createDto.type === 'PESSOA_FISICA' && createDto.cpf) {
      const existing = await this.prisma.investor.findFirst({
        where: {
          companyId,
          cpf: createDto.cpf,
        },
      });

      if (existing) {
        throw new BadRequestException('Investidor com este CPF já existe nesta empresa');
      }
    }

    if (createDto.type === 'PESSOA_JURIDICA' && createDto.cnpj) {
      const existing = await this.prisma.investor.findFirst({
        where: {
          companyId,
          cnpj: createDto.cnpj,
        },
      });

      if (existing) {
        throw new BadRequestException('Investidor com este CNPJ já existe nesta empresa');
      }
    }

    return this.prisma.investor.create({
      data: {
        companyId,
        ...createDto,
      },
    });
  }

  async findAll(companyId: string, filters: ListInvestorsDto) {
    const { page = 1, limit = 10, search, type, active, status } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { investorCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (active !== undefined) {
      where.active = active;
    }

    if (status) {
      where.status = status;
    }

    const [investors, total] = await Promise.all([
      this.prisma.investor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              investments: true,
              distributions: true,
            },
          },
        },
      }),
      this.prisma.investor.count({ where }),
    ]);

    return {
      data: investors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const investor = await this.prisma.investor.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        investments: {
          include: {
            project: true,
          },
        },
        distributions: {
          include: {
            project: true,
          },
        },
        distributionPolicies: {
          include: {
            project: true,
          },
        },
        _count: {
          select: {
            investments: true,
            distributions: true,
          },
        },
      },
    });

    if (!investor) {
      throw new NotFoundException('Investidor não encontrado');
    }

    // Calculate totals
    const totalInvested = investor.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalDistributed = investor.distributions.reduce((sum, dist) => sum + dist.netAmount, 0);

    return {
      ...investor,
      totals: {
        invested: totalInvested,
        distributed: totalDistributed,
      },
    };
  }

  async update(companyId: string, id: string, updateDto: UpdateInvestorDto) {
    const investor = await this.prisma.investor.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!investor) {
      throw new NotFoundException('Investidor não encontrado');
    }

    // If CPF is being changed (for PESSOA_FISICA), check uniqueness
    if (updateDto.cpf && updateDto.cpf !== investor.cpf) {
      const existing = await this.prisma.investor.findFirst({
        where: {
          companyId,
          cpf: updateDto.cpf,
        },
      });

      if (existing) {
        throw new BadRequestException('Investidor com este CPF já existe nesta empresa');
      }
    }

    // If CNPJ is being changed (for PESSOA_JURIDICA), check uniqueness
    if (updateDto.cnpj && updateDto.cnpj !== investor.cnpj) {
      const existing = await this.prisma.investor.findFirst({
        where: {
          companyId,
          cnpj: updateDto.cnpj,
        },
      });

      if (existing) {
        throw new BadRequestException('Investidor com este CNPJ já existe nesta empresa');
      }
    }

    return this.prisma.investor.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(companyId: string, id: string) {
    const investor = await this.prisma.investor.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        _count: {
          select: {
            investments: true,
            distributions: true,
          },
        },
      },
    });

    if (!investor) {
      throw new NotFoundException('Investidor não encontrado');
    }

    // Check if investor has any investments or distributions
    if (investor._count.investments > 0 || investor._count.distributions > 0) {
      throw new BadRequestException(
        'Não é possível excluir investidor com aportes ou distribuições vinculados. ' +
        'Considere desativá-lo ao invés de excluir.',
      );
    }

    await this.prisma.investor.delete({
      where: { id },
    });

    return { message: 'Investidor excluído com sucesso' };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ListProjectsDto } from '../dto/list-projects.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, createDto: CreateProjectDto) {
    // Check if code already exists for this company
    const existing = await this.prisma.scpProject.findUnique({
      where: {
        companyId_code: {
          companyId,
          code: createDto.code,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Projeto com este código já existe nesta empresa');
    }

    return this.prisma.scpProject.create({
      data: {
        companyId,
        ...createDto,
      },
    });
  }

  async findAll(companyId: string, filters: ListProjectsDto) {
    const { page = 1, limit = 10, search, status, active } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (active !== undefined) {
      where.active = active;
    }

    const [projects, total] = await Promise.all([
      this.prisma.scpProject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              investments: true,
              distributions: true,
              distributionPolicies: true,
            },
          },
        },
      }),
      this.prisma.scpProject.count({ where }),
    ]);

    return {
      data: projects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const project = await this.prisma.scpProject.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        investments: {
          include: {
            investor: true,
          },
          orderBy: { investmentDate: 'desc' },
        },
        distributions: {
          include: {
            investor: true,
          },
          orderBy: { distributionDate: 'desc' },
        },
        distributionPolicies: {
          where: { active: true },
          include: {
            investor: true,
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

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Buscar documentos vinculados ao projeto
    const documents = await this.prisma.document.findMany({
      where: {
        companyId,
        tags: {
          has: project.code, // Busca documentos com o código do projeto nas tags
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

    // Calculate totals
    const totalInvested = project.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalDistributed = project.distributions
      .filter((d) => d.status === 'PAGO')
      .reduce((sum, dist) => sum + dist.netAmount, 0);
    const pendingDistributions = project.distributions
      .filter((d) => d.status === 'PENDENTE')
      .reduce((sum, dist) => sum + dist.netAmount, 0);

    return {
      ...project,
      documents, // Adiciona documentos vinculados
      totals: {
        invested: totalInvested,
        distributed: totalDistributed,
        pending: pendingDistributions,
        availableBalance: totalInvested - totalDistributed - pendingDistributions,
      },
    };
  }

  async update(companyId: string, id: string, updateDto: UpdateProjectDto) {
    const project = await this.prisma.scpProject.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // If code is being changed, check uniqueness
    if (updateDto.code && updateDto.code !== project.code) {
      const existing = await this.prisma.scpProject.findUnique({
        where: {
          companyId_code: {
            companyId,
            code: updateDto.code,
          },
        },
      });

      if (existing) {
        throw new BadRequestException('Projeto com este código já existe nesta empresa');
      }
    }

    return this.prisma.scpProject.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(companyId: string, id: string) {
    const project = await this.prisma.scpProject.findFirst({
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

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Check if project has any investments or distributions
    if (project._count.investments > 0 || project._count.distributions > 0) {
      throw new BadRequestException(
        'Não é possível excluir projeto com aportes ou distribuições vinculados. ' +
        'Considere desativá-lo ou alterar o status para CANCELADO.',
      );
    }

    await this.prisma.scpProject.delete({
      where: { id },
    });

    return { message: 'Projeto excluído com sucesso' };
  }

  async getStats(companyId: string) {
    const projects = await this.prisma.scpProject.findMany({
      where: {
        companyId,
        active: true,
      },
      include: {
        investments: {
          where: { status: 'CONFIRMADO' },
        },
        distributions: true,
      },
    });

    const stats = projects.map((project) => {
      const totalInvested = project.investments.reduce((sum, inv) => sum + inv.amount, 0);
      const totalPaid = project.distributions
        .filter((d) => d.status === 'PAGO')
        .reduce((sum, dist) => sum + dist.netAmount, 0);
      const totalPending = project.distributions
        .filter((d) => d.status === 'PENDENTE')
        .reduce((sum, dist) => sum + dist.netAmount, 0);

      return {
        projectId: project.id,
        projectName: project.name,
        projectCode: project.code,
        status: project.status,
        totalValue: project.totalValue,
        totalInvested,
        totalDistributed: totalPaid,
        pendingDistributions: totalPending,
        availableBalance: totalInvested - totalPaid - totalPending,
        roi: totalInvested > 0 ? ((totalPaid / totalInvested) * 100).toFixed(2) : '0.00',
      };
    });

    const totalInvestedAllProjects = stats.reduce((sum, s) => sum + s.totalInvested, 0);
    const totalDistributedAllProjects = stats.reduce((sum, s) => sum + s.totalDistributed, 0);
    const totalPendingAllProjects = stats.reduce((sum, s) => sum + s.pendingDistributions, 0);

    return {
      projects: stats,
      summary: {
        totalProjects: projects.length,
        totalInvested: totalInvestedAllProjects,
        totalDistributed: totalDistributedAllProjects,
        totalPending: totalPendingAllProjects,
        totalAvailable: totalInvestedAllProjects - totalDistributedAllProjects - totalPendingAllProjects,
        averageROI:
          totalInvestedAllProjects > 0
            ? ((totalDistributedAllProjects / totalInvestedAllProjects) * 100).toFixed(2)
            : '0.00',
      },
    };
  }
}

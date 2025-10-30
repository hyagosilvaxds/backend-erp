import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCentroCustoDto } from './dto/create-centro-custo.dto';
import { UpdateCentroCustoDto } from './dto/update-centro-custo.dto';

@Injectable()
export class CentroCustoService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCentroCustoDto) {
    // Verifica se a empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: createDto.companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Verifica se o código já existe na empresa
    const existingCentroCusto = await this.prisma.centroCusto.findUnique({
      where: {
        companyId_codigo: {
          companyId: createDto.companyId,
          codigo: createDto.codigo,
        },
      },
    });

    if (existingCentroCusto) {
      throw new ConflictException(
        `Já existe um centro de custo com o código ${createDto.codigo} nesta empresa`,
      );
    }

    // Verifica se o centro de custo pai existe
    if (createDto.centroCustoPaiId) {
      const centroCustoPai = await this.prisma.centroCusto.findUnique({
        where: { id: createDto.centroCustoPaiId },
      });

      if (!centroCustoPai) {
        throw new NotFoundException('Centro de custo pai não encontrado');
      }

      if (centroCustoPai.companyId !== createDto.companyId) {
        throw new BadRequestException(
          'O centro de custo pai deve pertencer à mesma empresa',
        );
      }

      // Verifica se o nível está correto
      if (createDto.nivel !== centroCustoPai.nivel + 1) {
        throw new BadRequestException(
          `O nível do centro de custo deve ser ${centroCustoPai.nivel + 1} (nível do pai + 1)`,
        );
      }
    } else if (createDto.nivel !== 1) {
      throw new BadRequestException(
        'Centros de custo sem pai devem ter nível 1',
      );
    }

    const centroCusto = await this.prisma.centroCusto.create({
      data: {
        companyId: createDto.companyId,
        codigo: createDto.codigo,
        nome: createDto.nome,
        descricao: createDto.descricao,
        centroCustoPaiId: createDto.centroCustoPaiId,
        nivel: createDto.nivel,
        responsavel: createDto.responsavel,
        email: createDto.email,
        ativo: createDto.ativo !== undefined ? createDto.ativo : true,
      },
      include: {
        centroCustoPai: true,
        subCentros: true,
      },
    });

    return centroCusto;
  }

  async findAll(params?: {
    companyId?: string;
    page?: number;
    limit?: number;
    ativo?: boolean;
    search?: string;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.companyId) {
      where.companyId = params.companyId;
    }

    if (params?.ativo !== undefined) {
      where.ativo = params.ativo;
    }

    if (params?.search) {
      where.OR = [
        { codigo: { contains: params.search, mode: 'insensitive' } },
        { nome: { contains: params.search, mode: 'insensitive' } },
        { descricao: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [centrosCusto, total] = await Promise.all([
      this.prisma.centroCusto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { codigo: 'asc' },
        include: {
          company: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
            },
          },
          centroCustoPai: {
            select: {
              id: true,
              codigo: true,
              nome: true,
            },
          },
          _count: {
            select: { subCentros: true },
          },
        },
      }),
      this.prisma.centroCusto.count({ where }),
    ]);

    return {
      data: centrosCusto,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const centroCusto = await this.prisma.centroCusto.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
        centroCustoPai: {
          select: {
            id: true,
            codigo: true,
            nome: true,
          },
        },
        subCentros: {
          orderBy: { codigo: 'asc' },
        },
      },
    });

    if (!centroCusto) {
      throw new NotFoundException('Centro de custo não encontrado');
    }

    return centroCusto;
  }

  async update(id: string, updateDto: UpdateCentroCustoDto) {
    const centroCusto = await this.prisma.centroCusto.findUnique({
      where: { id },
    });

    if (!centroCusto) {
      throw new NotFoundException('Centro de custo não encontrado');
    }

    // Se está atualizando o código, verifica duplicidade
    if (updateDto.codigo && updateDto.codigo !== centroCusto.codigo) {
      const existing = await this.prisma.centroCusto.findUnique({
        where: {
          companyId_codigo: {
            companyId: centroCusto.companyId,
            codigo: updateDto.codigo,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Já existe um centro de custo com o código ${updateDto.codigo} nesta empresa`,
        );
      }
    }

    // Se está alterando o pai, valida
    if (updateDto.centroCustoPaiId !== undefined) {
      if (updateDto.centroCustoPaiId === id) {
        throw new BadRequestException(
          'Um centro de custo não pode ser pai de si mesmo',
        );
      }

      if (updateDto.centroCustoPaiId) {
        const centroCustoPai = await this.prisma.centroCusto.findUnique({
          where: { id: updateDto.centroCustoPaiId },
        });

        if (!centroCustoPai) {
          throw new NotFoundException('Centro de custo pai não encontrado');
        }

        if (centroCustoPai.companyId !== centroCusto.companyId) {
          throw new BadRequestException(
            'O centro de custo pai deve pertencer à mesma empresa',
          );
        }

        // Verifica se o nível está correto
        const novoNivel = updateDto.nivel || centroCusto.nivel;
        if (novoNivel !== centroCustoPai.nivel + 1) {
          throw new BadRequestException(
            `O nível do centro de custo deve ser ${centroCustoPai.nivel + 1} (nível do pai + 1)`,
          );
        }
      }
    }

    const updated = await this.prisma.centroCusto.update({
      where: { id },
      data: {
        codigo: updateDto.codigo,
        nome: updateDto.nome,
        descricao: updateDto.descricao,
        centroCustoPaiId: updateDto.centroCustoPaiId,
        nivel: updateDto.nivel,
        responsavel: updateDto.responsavel,
        email: updateDto.email,
        ativo: updateDto.ativo,
      },
      include: {
        centroCustoPai: true,
        subCentros: true,
      },
    });

    return updated;
  }

  async remove(id: string) {
    const centroCusto = await this.prisma.centroCusto.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subCentros: true },
        },
      },
    });

    if (!centroCusto) {
      throw new NotFoundException('Centro de custo não encontrado');
    }

    if (centroCusto._count.subCentros > 0) {
      throw new BadRequestException(
        'Não é possível excluir um centro de custo que possui sub-centros',
      );
    }

    await this.prisma.centroCusto.delete({
      where: { id },
    });

    return { message: 'Centro de custo removido com sucesso' };
  }

  async toggleActive(id: string) {
    const centroCusto = await this.prisma.centroCusto.findUnique({
      where: { id },
    });

    if (!centroCusto) {
      throw new NotFoundException('Centro de custo não encontrado');
    }

    const updated = await this.prisma.centroCusto.update({
      where: { id },
      data: { ativo: !centroCusto.ativo },
    });

    return updated;
  }

  async getHierarchy(companyId: string, ativo?: boolean) {
    // Verifica se a empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Define o filtro de ativo
    const ativoFilter = ativo !== undefined ? { ativo } : {};

    // Busca todos os centros de custo de nível 1 (centros raiz)
    const centrosRaiz = await this.prisma.centroCusto.findMany({
      where: {
        companyId,
        nivel: 1,
        ...ativoFilter,
      },
      orderBy: { codigo: 'asc' },
      include: {
        subCentros: {
          where: ativoFilter,
          orderBy: { codigo: 'asc' },
          include: {
            subCentros: {
              where: ativoFilter,
              orderBy: { codigo: 'asc' },
              include: {
                subCentros: {
                  where: ativoFilter,
                  orderBy: { codigo: 'asc' },
                  include: {
                    subCentros: {
                      where: ativoFilter,
                      orderBy: { codigo: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      company: {
        id: company.id,
        razaoSocial: company.razaoSocial,
        nomeFantasia: company.nomeFantasia,
      },
      centrosCusto: centrosRaiz,
    };
  }

  async findByCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const centrosCusto = await this.prisma.centroCusto.findMany({
      where: { companyId },
      orderBy: { codigo: 'asc' },
      include: {
        centroCustoPai: {
          select: {
            id: true,
            codigo: true,
            nome: true,
          },
        },
        _count: {
          select: { subCentros: true },
        },
      },
    });

    return centrosCusto;
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanoContasDto } from './dto/create-plano-contas.dto';
import { UpdatePlanoContasDto } from './dto/update-plano-contas.dto';
import { CreateContaContabilDto } from './dto/create-conta-contabil.dto';
import { UpdateContaContabilDto } from './dto/update-conta-contabil.dto';

@Injectable()
export class PlanoContasService {
  constructor(private prisma: PrismaService) {}

  // ==================== PLANO DE CONTAS ====================

  async createPlanoContas(createDto: CreatePlanoContasDto) {
    // Verifica se a empresa existe (se companyId foi fornecido)
    if (createDto.companyId) {
      const company = await this.prisma.company.findUnique({
        where: { id: createDto.companyId },
      });

      if (!company) {
        throw new NotFoundException('Empresa não encontrada');
      }
    }

    // Se for definido como padrão do sistema, remove o padrão dos outros planos do sistema
    if (createDto.padrao && !createDto.companyId) {
      await this.prisma.planoContas.updateMany({
        where: { padrao: true, companyId: null },
        data: { padrao: false },
      });
    }

    // Se for definido como padrão da empresa, remove o padrão dos outros planos da empresa
    if (createDto.padrao && createDto.companyId) {
      await this.prisma.planoContas.updateMany({
        where: { padrao: true, companyId: createDto.companyId },
        data: { padrao: false },
      });
    }

    const planoContas = await this.prisma.planoContas.create({
      data: {
        companyId: createDto.companyId,
        nome: createDto.nome,
        descricao: createDto.descricao,
        tipo: createDto.tipo || 'Gerencial',
        ativo: createDto.ativo !== undefined ? createDto.ativo : true,
        padrao: createDto.padrao || false,
      },
      include: {
        contas: {
          orderBy: { codigo: 'asc' },
        },
        company: createDto.companyId
          ? {
              select: {
                id: true,
                razaoSocial: true,
                nomeFantasia: true,
              },
            }
          : undefined,
      },
    });

    return planoContas;
  }

  async findAllPlanoContas(params?: {
    page?: number;
    limit?: number;
    tipo?: string;
    ativo?: boolean;
    companyId?: string;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.companyId) {
      // Se companyId foi fornecido, busca apenas planos dessa empresa
      where.companyId = params.companyId;
    } else {
      // Se não foi fornecido, busca apenas planos padrão do sistema (sem empresa)
      where.companyId = null;
    }

    if (params?.tipo) {
      where.tipo = params.tipo;
    }

    if (params?.ativo !== undefined) {
      where.ativo = params.ativo;
    }

    const [planos, total] = await Promise.all([
      this.prisma.planoContas.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ padrao: 'desc' }, { nome: 'asc' }],
        include: {
          company: params?.companyId
            ? {
                select: {
                  id: true,
                  razaoSocial: true,
                  nomeFantasia: true,
                },
              }
            : undefined,
          _count: {
            select: { contas: true },
          },
        },
      }),
      this.prisma.planoContas.count({ where }),
    ]);

    return {
      data: planos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOnePlanoContas(id: string) {
    const planoContas = await this.prisma.planoContas.findUnique({
      where: { id },
      include: {
        contas: {
          orderBy: { codigo: 'asc' },
          include: {
            subContas: {
              orderBy: { codigo: 'asc' },
            },
          },
        },
      },
    });

    if (!planoContas) {
      throw new NotFoundException('Plano de contas não encontrado');
    }

    return planoContas;
  }

  async updatePlanoContas(id: string, updateDto: UpdatePlanoContasDto) {
    const planoContas = await this.prisma.planoContas.findUnique({
      where: { id },
    });

    if (!planoContas) {
      throw new NotFoundException('Plano de contas não encontrado');
    }

    // Se for definido como padrão, remove o padrão dos outros da mesma empresa/sistema
    if (updateDto.padrao) {
      const whereCondition: any = { padrao: true, id: { not: id } };
      
      if (planoContas.companyId) {
        // Se tem empresa, remove padrão dos outros planos da mesma empresa
        whereCondition.companyId = planoContas.companyId;
      } else {
        // Se é do sistema, remove padrão dos outros planos do sistema
        whereCondition.companyId = null;
      }

      await this.prisma.planoContas.updateMany({
        where: whereCondition,
        data: { padrao: false },
      });
    }

    const updated = await this.prisma.planoContas.update({
      where: { id },
      data: updateDto,
      include: {
        contas: {
          orderBy: { codigo: 'asc' },
        },
        company: planoContas.companyId
          ? {
              select: {
                id: true,
                razaoSocial: true,
                nomeFantasia: true,
              },
            }
          : undefined,
      },
    });

    return updated;
  }

  async removePlanoContas(id: string) {
    const planoContas = await this.prisma.planoContas.findUnique({
      where: { id },
      include: {
        _count: {
          select: { contas: true },
        },
      },
    });

    if (!planoContas) {
      throw new NotFoundException('Plano de contas não encontrado');
    }

    if (planoContas._count.contas > 0) {
      throw new BadRequestException(
        'Não é possível excluir um plano de contas que possui contas cadastradas',
      );
    }

    await this.prisma.planoContas.delete({
      where: { id },
    });

    return { message: 'Plano de contas removido com sucesso' };
  }

  async getPlanoPadrao(companyId?: string) {
    const where: any = { padrao: true, ativo: true };

    if (companyId) {
      // Busca plano padrão da empresa
      where.companyId = companyId;
    } else {
      // Busca plano padrão do sistema (sem empresa)
      where.companyId = null;
    }

    const planoPadrao = await this.prisma.planoContas.findFirst({
      where,
      include: {
        contas: {
          orderBy: { codigo: 'asc' },
        },
        company: companyId
          ? {
              select: {
                id: true,
                razaoSocial: true,
                nomeFantasia: true,
              },
            }
          : undefined,
      },
    });

    if (!planoPadrao) {
      const scope = companyId ? 'desta empresa' : 'do sistema';
      throw new NotFoundException(
        `Nenhum plano de contas padrão ${scope} encontrado`,
      );
    }

    return planoPadrao;
  }

  // ==================== CONTA CONTÁBIL ====================

  async createContaContabil(createDto: CreateContaContabilDto) {
    // Verifica se o plano de contas existe
    const planoContas = await this.prisma.planoContas.findUnique({
      where: { id: createDto.planoContasId },
    });

    if (!planoContas) {
      throw new NotFoundException('Plano de contas não encontrado');
    }

    // Verifica se o código já existe no plano de contas
    const existingConta = await this.prisma.contaContabil.findUnique({
      where: {
        planoContasId_codigo: {
          planoContasId: createDto.planoContasId,
          codigo: createDto.codigo,
        },
      },
    });

    if (existingConta) {
      throw new ConflictException(
        `Já existe uma conta com o código ${createDto.codigo} neste plano de contas`,
      );
    }

    // Verifica se a conta pai existe
    if (createDto.contaPaiId) {
      const contaPai = await this.prisma.contaContabil.findUnique({
        where: { id: createDto.contaPaiId },
      });

      if (!contaPai) {
        throw new NotFoundException('Conta pai não encontrada');
      }

      if (contaPai.planoContasId !== createDto.planoContasId) {
        throw new BadRequestException(
          'A conta pai deve pertencer ao mesmo plano de contas',
        );
      }

      // Verifica se o nível está correto
      if (createDto.nivel !== contaPai.nivel + 1) {
        throw new BadRequestException(
          `O nível da conta deve ser ${contaPai.nivel + 1} (nível da conta pai + 1)`,
        );
      }
    }

    const conta = await this.prisma.contaContabil.create({
      data: {
        planoContasId: createDto.planoContasId,
        codigo: createDto.codigo,
        nome: createDto.nome,
        tipo: createDto.tipo,
        natureza: createDto.natureza,
        nivel: createDto.nivel,
        contaPaiId: createDto.contaPaiId,
        aceitaLancamento:
          createDto.aceitaLancamento !== undefined
            ? createDto.aceitaLancamento
            : true,
        ativo: createDto.ativo !== undefined ? createDto.ativo : true,
      },
      include: {
        contaPai: true,
        subContas: true,
      },
    });

    return conta;
  }

  async findAllContasContabeis(
    planoContasId: string,
    params?: {
      page?: number;
      limit?: number;
      tipo?: string;
      nivel?: number;
      contaPaiId?: string;
      search?: string;
    },
  ) {
    // Verifica se o plano de contas existe
    const planoContas = await this.prisma.planoContas.findUnique({
      where: { id: planoContasId },
    });

    if (!planoContas) {
      throw new NotFoundException('Plano de contas não encontrado');
    }

    const page = params?.page || 1;
    const limit = params?.limit || 100;
    const skip = (page - 1) * limit;

    const where: any = {
      planoContasId,
    };

    if (params?.tipo) {
      where.tipo = params.tipo;
    }

    if (params?.nivel !== undefined) {
      where.nivel = params.nivel;
    }

    if (params?.contaPaiId) {
      where.contaPaiId = params.contaPaiId;
    }

    if (params?.search) {
      where.OR = [
        { codigo: { contains: params.search, mode: 'insensitive' } },
        { nome: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [contas, total] = await Promise.all([
      this.prisma.contaContabil.findMany({
        where,
        skip,
        take: limit,
        orderBy: { codigo: 'asc' },
        include: {
          contaPai: {
            select: {
              id: true,
              codigo: true,
              nome: true,
            },
          },
          _count: {
            select: { subContas: true },
          },
        },
      }),
      this.prisma.contaContabil.count({ where }),
    ]);

    return {
      data: contas,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneContaContabil(id: string) {
    const conta = await this.prisma.contaContabil.findUnique({
      where: { id },
      include: {
        planoContas: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
        contaPai: {
          select: {
            id: true,
            codigo: true,
            nome: true,
          },
        },
        subContas: {
          orderBy: { codigo: 'asc' },
          select: {
            id: true,
            codigo: true,
            nome: true,
            tipo: true,
            nivel: true,
            ativo: true,
          },
        },
      },
    });

    if (!conta) {
      throw new NotFoundException('Conta contábil não encontrada');
    }

    return conta;
  }

  async updateContaContabil(id: string, updateDto: UpdateContaContabilDto) {
    const conta = await this.prisma.contaContabil.findUnique({
      where: { id },
    });

    if (!conta) {
      throw new NotFoundException('Conta contábil não encontrada');
    }

    // Se estiver atualizando o código, verifica duplicação
    if (updateDto.codigo && updateDto.codigo !== conta.codigo) {
      const existingConta = await this.prisma.contaContabil.findUnique({
        where: {
          planoContasId_codigo: {
            planoContasId: conta.planoContasId,
            codigo: updateDto.codigo,
          },
        },
      });

      if (existingConta) {
        throw new ConflictException(
          `Já existe uma conta com o código ${updateDto.codigo} neste plano de contas`,
        );
      }
    }

    // Se estiver atualizando a conta pai
    if (updateDto.contaPaiId && updateDto.contaPaiId !== conta.contaPaiId) {
      const contaPai = await this.prisma.contaContabil.findUnique({
        where: { id: updateDto.contaPaiId },
      });

      if (!contaPai) {
        throw new NotFoundException('Conta pai não encontrada');
      }

      if (contaPai.planoContasId !== conta.planoContasId) {
        throw new BadRequestException(
          'A conta pai deve pertencer ao mesmo plano de contas',
        );
      }
    }

    const updated = await this.prisma.contaContabil.update({
      where: { id },
      data: updateDto,
      include: {
        contaPai: true,
        subContas: true,
      },
    });

    return updated;
  }

  async removeContaContabil(id: string) {
    const conta = await this.prisma.contaContabil.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subContas: true },
        },
      },
    });

    if (!conta) {
      throw new NotFoundException('Conta contábil não encontrada');
    }

    if (conta._count.subContas > 0) {
      throw new BadRequestException(
        'Não é possível excluir uma conta que possui subcontas',
      );
    }

    await this.prisma.contaContabil.delete({
      where: { id },
    });

    return { message: 'Conta contábil removida com sucesso' };
  }

  // ==================== UTILITÁRIOS ====================

  async getContasHierarquicas(planoContasId: string, ativo?: boolean) {
    // Verifica se o plano de contas existe
    const planoContas = await this.prisma.planoContas.findUnique({
      where: { id: planoContasId },
    });

    if (!planoContas) {
      throw new NotFoundException('Plano de contas não encontrado');
    }

    // Define o filtro de ativo
    const ativoFilter = ativo !== undefined ? { ativo } : {};

    // Busca todas as contas de nível 1 (contas raiz)
    const contasRaiz = await this.prisma.contaContabil.findMany({
      where: {
        planoContasId,
        nivel: 1,
        ...ativoFilter,
      },
      orderBy: { codigo: 'asc' },
      include: {
        subContas: {
          where: ativoFilter,
          orderBy: { codigo: 'asc' },
          include: {
            subContas: {
              where: ativoFilter,
              orderBy: { codigo: 'asc' },
              include: {
                subContas: {
                  where: ativoFilter,
                  orderBy: { codigo: 'asc' },
                  include: {
                    subContas: {
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
      planoContas: {
        id: planoContas.id,
        nome: planoContas.nome,
        tipo: planoContas.tipo,
      },
      contas: contasRaiz,
    };
  }

  async duplicarPlanoContas(
    planoContasId: string,
    novoNome: string,
    novaDescricao?: string,
  ) {
    // Busca o plano de contas original
    const planoOriginal = await this.prisma.planoContas.findUnique({
      where: { id: planoContasId },
      include: {
        contas: {
          orderBy: { codigo: 'asc' },
        },
      },
    });

    if (!planoOriginal) {
      throw new NotFoundException('Plano de contas não encontrado');
    }

    // Cria o novo plano de contas
    const novoPlano = await this.prisma.planoContas.create({
      data: {
        nome: novoNome,
        descricao: novaDescricao || `Cópia de ${planoOriginal.nome}`,
        tipo: planoOriginal.tipo,
        ativo: true,
        padrao: false,
      },
    });

    // Mapa para guardar o relacionamento entre IDs antigos e novos
    const mapaContas = new Map<string, string>();

    // Duplica as contas em ordem de nível
    for (const conta of planoOriginal.contas) {
      const novaContaPaiId = conta.contaPaiId
        ? mapaContas.get(conta.contaPaiId)
        : null;

      const novaConta = await this.prisma.contaContabil.create({
        data: {
          planoContasId: novoPlano.id,
          codigo: conta.codigo,
          nome: conta.nome,
          tipo: conta.tipo,
          natureza: conta.natureza,
          nivel: conta.nivel,
          contaPaiId: novaContaPaiId,
          aceitaLancamento: conta.aceitaLancamento,
          ativo: conta.ativo,
        },
      });

      mapaContas.set(conta.id, novaConta.id);
    }

    return this.findOnePlanoContas(novoPlano.id);
  }
}

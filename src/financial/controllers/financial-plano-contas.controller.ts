import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('financial/plano-contas')
@UseGuards(JwtAuthGuard)
export class FinancialPlanoContasController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Listar planos de contas da empresa
   */
  @Get()
  async findAll(
    @Query('companyId') companyId: string,
    @Query('ativo') ativo?: string,
  ) {
    if (!companyId) {
      throw new BadRequestException('companyId é obrigatório');
    }

    const where: any = {
      OR: [
        { companyId }, // Planos da empresa
        { padrao: true, companyId: null }, // Planos padrão do sistema
      ],
    };

    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const planos = await this.prisma.planoContas.findMany({
      where,
      orderBy: [
        { padrao: 'desc' }, // Planos padrão primeiro
        { nome: 'asc' },
      ],
      select: {
        id: true,
        nome: true,
        descricao: true,
        tipo: true,
        ativo: true,
        padrao: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            contas: true,
          },
        },
      },
    });

    return planos;
  }

  /**
   * Obter plano de contas padrão da empresa
   */
  @Get('padrao')
  async getPlanoPadrao(@Query('companyId') companyId: string) {
    if (!companyId) {
      throw new BadRequestException('companyId é obrigatório');
    }

    // Buscar plano padrão da empresa
    let plano = await this.prisma.planoContas.findFirst({
      where: {
        companyId,
        ativo: true,
      },
      orderBy: {
        padrao: 'desc',
      },
    });

    // Se não encontrar, buscar plano padrão do sistema
    if (!plano) {
      plano = await this.prisma.planoContas.findFirst({
        where: {
          padrao: true,
          companyId: null,
          ativo: true,
        },
      });
    }

    if (!plano) {
      throw new BadRequestException(
        'Nenhum plano de contas encontrado para esta empresa',
      );
    }

    return plano;
  }

  /**
   * Listar contas contábeis de um plano
   */
  @Get(':planoId/contas')
  async getContas(
    @Query('planoId') planoId: string,
    @Query('tipo') tipo?: string,
    @Query('nivel') nivel?: string,
    @Query('aceitaLancamento') aceitaLancamento?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!planoId) {
      throw new BadRequestException('planoId é obrigatório');
    }

    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 100;
    const skip = (pageNum - 1) * limitNum;

    const where: any = { planoContasId: planoId };

    if (tipo) {
      where.tipo = tipo;
    }

    if (nivel) {
      where.nivel = parseInt(nivel);
    }

    if (aceitaLancamento !== undefined) {
      where.aceitaLancamento = aceitaLancamento === 'true';
    }

    const [contas, total] = await Promise.all([
      this.prisma.contaContabil.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          codigo: 'asc',
        },
      }),
      this.prisma.contaContabil.count({ where }),
    ]);

    return {
      data: contas,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Buscar conta contábil por ID
   */
  @Get('contas/:id')
  async getConta(@Query('id') id: string) {
    if (!id) {
      throw new BadRequestException('id é obrigatório');
    }

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
      },
    });

    if (!conta) {
      throw new BadRequestException('Conta contábil não encontrada');
    }

    return conta;
  }
}

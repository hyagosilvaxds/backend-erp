import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Controller para endpoints simplificados de Centro de Custo
 * no contexto do módulo financeiro (para seleção em formulários).
 */
@Controller('financial/centros-custo')
@UseGuards(JwtAuthGuard)
export class FinancialCentroCustoController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Listar centros de custo da empresa (simplificado para dropdowns)
   * @param companyId - ID da empresa (obrigatório)
   * @param ativo - Filtrar apenas ativos (opcional, padrão: true)
   * @returns Lista de centros de custo
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
      companyId,
    };

    // Por padrão, retorna apenas ativos
    if (ativo === undefined || ativo === 'true') {
      where.ativo = true;
    } else if (ativo === 'false') {
      where.ativo = false;
    }

    const centrosCusto = await this.prisma.centroCusto.findMany({
      where,
      orderBy: {
        codigo: 'asc',
      },
      select: {
        id: true,
        codigo: true,
        nome: true,
        descricao: true,
        nivel: true,
        ativo: true,
        centroCustoPaiId: true,
        responsavel: true,
        email: true,
      },
    });

    return centrosCusto;
  }

  /**
   * Buscar centro de custo por ID
   * @param id - ID do centro de custo
   * @returns Centro de custo encontrado
   */
  @Get(':id')
  async findOne(@Query('id') id: string) {
    if (!id) {
      throw new BadRequestException('id é obrigatório');
    }

    const centroCusto = await this.prisma.centroCusto.findUnique({
      where: { id },
      select: {
        id: true,
        codigo: true,
        nome: true,
        descricao: true,
        nivel: true,
        ativo: true,
        centroCustoPaiId: true,
        responsavel: true,
        email: true,
        companyId: true,
      },
    });

    if (!centroCusto) {
      throw new BadRequestException('Centro de custo não encontrado');
    }

    return centroCusto;
  }
}

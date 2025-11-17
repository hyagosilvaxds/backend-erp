import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyId } from '../../common/decorators/company-id.decorator';
import { NFeService } from '../services/nfe.service';
import { CreateNFeDto } from '../dto/create-nfe.dto';
import { UpdateNFeDto } from '../dto/update-nfe.dto';
import { CancelNFeDto } from '../dto/cancel-nfe.dto';
import { CreateNFeFromSaleDto } from '../dto/create-from-sale.dto';
import { NFeStatus } from '@prisma/client';

@Controller('nfe')
@UseGuards(JwtAuthGuard)
export class NFeController {
  constructor(private readonly nfeService: NFeService) {}

  /**
   * Cria uma nova NFe
   * POST /nfe
   */
  @Post()
  create(@CompanyId() companyId: string, @Body() dto: CreateNFeDto) {
    return this.nfeService.create(companyId, dto);
  }

  /**
   * Cria uma NFe a partir de uma venda
   * POST /nfe/from-sale
   */
  @Post('from-sale')
  createFromSale(@CompanyId() companyId: string, @Body() dto: CreateNFeFromSaleDto) {
    return this.nfeService.createFromSale(companyId, dto);
  }

  /**
   * Lista todas as NFes com filtros e paginação
   * GET /nfe
   */
  @Get()
  findAll(
    @CompanyId() companyId: string,
    @Query('status') status?: NFeStatus,
    @Query('saleId') saleId?: string,
    @Query('destinatarioId') destinatarioId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {
      status,
      saleId,
      destinatarioId,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    };

    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    return this.nfeService.findAll(companyId, filters);
  }

  /**
   * Busca estatísticas de NFes
   * GET /nfe/stats
   */
  @Get('stats')
  getStats(@CompanyId() companyId: string) {
    return this.nfeService.getStats(companyId);
  }

  /**
   * Busca uma NFe específica
   * GET /nfe/:id
   */
  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.nfeService.findOne(companyId, id);
  }

  /**
   * Atualiza uma NFe (apenas rascunho)
   * PUT /nfe/:id
   */
  @Put(':id')
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateNFeDto,
  ) {
    return this.nfeService.update(companyId, id, dto);
  }

  /**
   * Remove uma NFe (apenas rascunho)
   * DELETE /nfe/:id
   */
  @Delete(':id')
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.nfeService.remove(companyId, id);
  }

  /**
   * Emite uma NFe (envia para SEFAZ)
   * POST /nfe/:id/emitir
   */
  @Post(':id/emitir')
  emitir(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.nfeService.emitir(companyId, id);
  }

  /**
   * Cancela uma NFe autorizada
   * POST /nfe/:id/cancelar
   */
  @Post(':id/cancelar')
  cancel(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CancelNFeDto,
  ) {
    return this.nfeService.cancel(companyId, id, dto);
  }

  /**
   * Gera o DANFE (PDF) da NFe
   * GET /nfe/:id/danfe
   */
  @Get(':id/danfe')
  generateDanfe(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.nfeService.generateDanfe(companyId, id);
  }

  /**
   * Baixa o XML da NFe
   * GET /nfe/:id/xml
   */
  @Get(':id/xml')
  downloadXml(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.nfeService.downloadXml(companyId, id);
  }

  /**
   * Consulta o status da NFe na SEFAZ
   * GET /nfe/:id/status
   */
  @Get(':id/status')
  consultarStatus(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.nfeService.consultarStatus(companyId, id);
  }
}

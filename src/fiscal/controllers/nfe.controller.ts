import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyId } from '../../common/decorators/company-id.decorator';
import { NFeService } from '../services/nfe.service';
import { EmitirNFeDto } from '../dto/emitir-nfe.dto';
import * as fs from 'fs';

@Controller('fiscal/nfe')
@UseGuards(JwtAuthGuard)
export class NFeController {
  constructor(private nfeService: NFeService) {}

  /**
   * POST /fiscal/nfe/emitir
   * Emite uma NF-e a partir de uma venda
   */
  @Post('emitir')
  async emitirNFe(
    @CompanyId() companyId: string,
    @Body() dto: EmitirNFeDto,
  ) {
    return this.nfeService.emitirNFe(companyId, dto);
  }

  /**
   * GET /fiscal/nfe
   * Lista todas as NF-e com filtros avançados
   * 
   * Parâmetros disponíveis:
   * - status: Status da NFe (DRAFT, AUTHORIZED, REJECTED, CANCELED, etc)
   * - saleId: ID da venda vinculada
   * - numero: Número da NFe
   * - serie: Série da NFe
   * - chaveAcesso: Chave de acesso (44 dígitos)
   * - customerId: ID do cliente (destinatário)
   * - customerName: Nome do cliente (busca parcial)
   * - dataInicio: Data de emissão inicial (YYYY-MM-DD)
   * - dataFim: Data de emissão final (YYYY-MM-DD)
   */
  @Get()
  async listarNFes(
    @CompanyId() companyId: string,
    @Query('status') status?: string,
    @Query('saleId') saleId?: string,
    @Query('numero') numero?: string,
    @Query('serie') serie?: string,
    @Query('chaveAcesso') chaveAcesso?: string,
    @Query('customerId') customerId?: string,
    @Query('customerName') customerName?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.nfeService.listarNFes(companyId, {
      status,
      saleId,
      numero,
      serie,
      chaveAcesso,
      customerId,
      customerName,
      dataInicio,
      dataFim,
    });
  }

  /**
   * GET /fiscal/nfe/:id
   * Busca uma NF-e específica
   */
  @Get(':id')
  async buscarNFe(
    @CompanyId() companyId: string,
    @Param('id') id: string,
  ) {
    return this.nfeService.buscarNFe(companyId, id);
  }

  /**
   * GET /fiscal/nfe/:id/danfe
   * Baixa o DANFE em PDF
   */
  @Get(':id/danfe')
  async baixarDANFE(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const nfe = await this.nfeService.buscarNFe(companyId, id);

    if (!nfe || !nfe.danfePdfPath) {
      return res.status(404).json({ message: 'DANFE não encontrado' });
    }

    if (!fs.existsSync(nfe.danfePdfPath)) {
      return res.status(404).json({ message: 'Arquivo DANFE não encontrado' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="danfe-${nfe.numero}.pdf"`);

    const fileStream = fs.createReadStream(nfe.danfePdfPath);
    fileStream.pipe(res);
  }

  /**
   * GET /fiscal/nfe/:id/xml
   * Baixa o XML da NF-e
   */
  @Get(':id/xml')
  async baixarXML(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const nfe = await this.nfeService.buscarNFe(companyId, id);

    if (!nfe || !nfe.xmlAutorizado) {
      return res.status(404).json({ message: 'XML não encontrado' });
    }

    if (!fs.existsSync(nfe.xmlAutorizado)) {
      return res.status(404).json({ message: 'Arquivo XML não encontrado' });
    }

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="nfe-${nfe.chaveAcesso}.xml"`);

    const fileStream = fs.createReadStream(nfe.xmlAutorizado);
    fileStream.pipe(res);
  }

  /**
   * POST /fiscal/nfe/:id/cancelar
   * Cancela uma NF-e
   */
  @Post(':id/cancelar')
  async cancelarNFe(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body('justificativa') justificativa: string,
  ) {
    return this.nfeService.cancelarNFe(companyId, id, justificativa);
  }

  /**
   * POST /fiscal/nfe/:id/gerar-danfe
   * Gera DANFE de uma NF-e já emitida
   */
  @Post(':id/gerar-danfe')
  async gerarDANFE(
    @CompanyId() companyId: string,
    @Param('id') id: string,
  ) {
    return this.nfeService.gerarDANFENFeExistente(companyId, id);
  }

  /**
   * GET /fiscal/nfe/consultar/:chaveAcesso
   * Consulta uma NF-e pela chave de acesso
   */
  @Get('consultar/:chaveAcesso')
  async consultarNFe(
    @CompanyId() companyId: string,
    @Param('chaveAcesso') chaveAcesso: string,
  ) {
    return this.nfeService.consultarNFe(companyId, chaveAcesso);
  }

  /**
   * GET /fiscal/nfe/status-servico
   * Consulta o status do serviço da SEFAZ
   */
  @Get('sefaz/status')
  async consultarStatusServico(@CompanyId() companyId: string) {
    return this.nfeService.consultarStatusServico(companyId);
  }
}

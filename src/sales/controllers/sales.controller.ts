import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
  Res,
  Header,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyId } from '../../common/decorators/company-id.decorator';
import { SalesService } from '../services/sales.service';
import { SalesPdfService } from '../services/sales-pdf.service';
import { SalesExcelService } from '../services/sales-excel.service';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { UpdateSaleDto } from '../dto/update-sale.dto';
import {
  ApproveCreditAnalysisDto,
  RejectCreditAnalysisDto,
  CancelSaleDto,
  ChangeStatusDto,
} from '../dto/sale-actions.dto';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly salesPdfService: SalesPdfService,
    private readonly salesExcelService: SalesExcelService,
  ) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() dto: CreateSaleDto) {
    return this.salesService.create(companyId, dto);
  }

  @Get()
  findAll(
    @CompanyId() companyId: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {
      status,
      customerId,
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

    return this.salesService.findAll(companyId, filters);
  }

  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.salesService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSaleDto,
  ) {
    return this.salesService.update(companyId, id, dto);
  }

  @Post(':id/confirm')
  confirm(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.salesService.confirm(companyId, id);
  }

  @Post(':id/cancel')
  cancel(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CancelSaleDto,
  ) {
    return this.salesService.cancel(companyId, id, dto);
  }

  @Post(':id/credit-analysis/approve')
  approveCreditAnalysis(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: ApproveCreditAnalysisDto,
  ) {
    return this.salesService.approveCreditAnalysis(companyId, id, dto);
  }

  @Post(':id/credit-analysis/reject')
  rejectCreditAnalysis(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: RejectCreditAnalysisDto,
  ) {
    return this.salesService.rejectCreditAnalysis(companyId, id, dto);
  }

  @Patch(':id/status')
  changeStatus(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.salesService.changeStatus(companyId, id, dto);
  }

    @Get(':id/pdf')
  @Header('Content-Type', 'application/pdf')
  async downloadPdf(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.salesPdfService.generateSalePdf(
      companyId,
      id,
    );

    // Buscar informações da venda para nome do arquivo
    const sale = await this.salesService.findOne(companyId, id);
    const isQuote = sale.status === 'QUOTE';
    
    // Extrair o código da venda
    const saleCode = sale.code || sale.id.substring(0, 8);
    const fileName = isQuote
      ? `orcamento-${saleCode}.pdf`
      : `venda-${saleCode}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  }

  @Get('export/excel')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportExcel(
    @CompanyId() companyId: string,
    @Res() res: Response,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('paymentMethodId') paymentMethodId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
  ) {
    const filters: any = {
      status,
      customerId,
      paymentMethodId,
    };

    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }
    if (minAmount) {
      filters.minAmount = parseFloat(minAmount);
    }
    if (maxAmount) {
      filters.maxAmount = parseFloat(maxAmount);
    }

    const excelBuffer = await this.salesExcelService.generateSalesExcel(
      companyId,
      filters,
    );

    // Nome do arquivo baseado nos filtros
    const date = new Date().toISOString().split('T')[0];
    let fileName = `vendas-${date}`;
    
    if (filters.status) {
      fileName += `-${filters.status}`;
    }
    if (filters.startDate && filters.endDate) {
      const start = filters.startDate.toISOString().split('T')[0];
      const end = filters.endDate.toISOString().split('T')[0];
      fileName += `-${start}_${end}`;
    }
    
    fileName += '.xlsx';

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', excelBuffer.length);
    res.send(excelBuffer);
  }
}

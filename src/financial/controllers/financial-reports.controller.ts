import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FinancialReportsService } from '../services/financial-reports.service';

@Controller('financial/reports')
@UseGuards(JwtAuthGuard)
export class FinancialReportsController {
  constructor(private readonly financialReportsService: FinancialReportsService) {}

  @Get('dashboard')
  getDashboard(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.financialReportsService.getDashboardData(companyId, start, end);
  }

  @Get('cash-flow')
  getCashFlow(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financialReportsService.getCashFlowReport(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('cash-flow/export')
  async exportCashFlow(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const buffer = await this.financialReportsService.exportCashFlowToExcel(
      companyId,
      new Date(startDate),
      new Date(endDate),
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=fluxo-caixa-${startDate}-${endDate}.xlsx`);
    res.send(buffer);
  }

  @Get('accounts-payable/export')
  async exportAccountsPayable(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const filters = {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const buffer = await this.financialReportsService.exportAccountsPayableToExcel(companyId, filters);

    res!.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res!.setHeader('Content-Disposition', `attachment; filename=contas-a-pagar-${new Date().toISOString().split('T')[0]}.xlsx`);
    res!.send(buffer);
  }

  @Get('accounts-receivable/export')
  async exportAccountsReceivable(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const filters = {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const buffer = await this.financialReportsService.exportAccountsReceivableToExcel(companyId, filters);

    res!.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res!.setHeader('Content-Disposition', `attachment; filename=contas-a-receber-${new Date().toISOString().split('T')[0]}.xlsx`);
    res!.send(buffer);
  }

  @Get('transactions/by-centro-custo/export')
  async exportTransactionsByCentroCusto(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const buffer = await this.financialReportsService.exportTransactionsByCentroCusto(companyId, filters);

    res!.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res!.setHeader('Content-Disposition', `attachment; filename=transacoes-por-centro-custo-${new Date().toISOString().split('T')[0]}.xlsx`);
    res!.send(buffer);
  }

  @Get('transactions/by-conta-contabil/export')
  async exportTransactionsByContaContabil(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const buffer = await this.financialReportsService.exportTransactionsByContaContabil(companyId, filters);

    res!.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res!.setHeader('Content-Disposition', `attachment; filename=transacoes-por-conta-contabil-${new Date().toISOString().split('T')[0]}.xlsx`);
    res!.send(buffer);
  }
}

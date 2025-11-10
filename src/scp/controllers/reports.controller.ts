import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyId } from '../../common/decorators/company-id.decorator';
import { ReportsService } from '../services/reports.service';
import {
  ExportInvestmentsDto,
  ExportDistributionsDto,
  ExportROIDto,
  ExportInvestorsDto,
  ExportProjectsDto,
} from '../dto/export-reports.dto';

@Controller('scp/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Exporta relatório de aportes em Excel
   */
  @Get('investments/export')
  async exportInvestments(
    @CompanyId() companyId: string,
    @Query() filters: ExportInvestmentsDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportInvestments(companyId, filters);
    
    const filename = `aportes_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  }

  /**
   * Exporta relatório de aportes por investidor em Excel
   */
  @Get('investments/by-investor/export')
  async exportInvestmentsByInvestor(
    @CompanyId() companyId: string,
    @Query() filters: ExportInvestmentsDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportInvestmentsByInvestor(companyId, filters);
    
    const filename = `aportes_por_investidor_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  }

  /**
   * Exporta relatório de aportes por projeto em Excel
   */
  @Get('investments/by-project/export')
  async exportInvestmentsByProject(
    @CompanyId() companyId: string,
    @Query() filters: ExportInvestmentsDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportInvestmentsByProject(companyId, filters);
    
    const filename = `aportes_por_projeto_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  }

  /**
   * Exporta relatório de distribuições em Excel
   */
  @Get('distributions/export')
  async exportDistributions(
    @CompanyId() companyId: string,
    @Query() filters: ExportDistributionsDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportDistributions(companyId, filters);
    
    const filename = `distribuicoes_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  }

  /**
   * Exporta relatório de ROI (Retorno sobre Investimento) em Excel
   */
  @Get('roi/export')
  async exportROI(
    @CompanyId() companyId: string,
    @Query() filters: ExportROIDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportROI(companyId, filters);
    
    const filename = `roi_retorno_investimento_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  }

  /**
   * Exporta relatório resumido de investidores em Excel
   */
  @Get('investors/export')
  async exportInvestorsSummary(
    @CompanyId() companyId: string,
    @Query() filters: ExportInvestorsDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportInvestorsSummary(companyId, filters);
    
    const filename = `resumo_investidores_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  }

  /**
   * Exporta relatório resumido de projetos em Excel
   */
  @Get('projects/export')
  async exportProjectsSummary(
    @CompanyId() companyId: string,
    @Query() filters: ExportProjectsDto,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportProjectsSummary(companyId, filters);
    
    const filename = `resumo_projetos_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  }
}

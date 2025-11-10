import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import {
  ExportInvestmentsDto,
  ExportDistributionsDto,
  ExportROIDto,
  ExportInvestorsDto,
  ExportProjectsDto,
} from '../dto/export-reports.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Exporta relatório de aportes
   */
  async exportInvestments(companyId: string, filters: ExportInvestmentsDto): Promise<Buffer> {
    const where: any = { companyId };

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.investorId) where.investorId = filters.investorId;
    if (filters.status) where.status = filters.status;
    
    if (filters.startDate || filters.endDate) {
      where.investmentDate = {};
      if (filters.startDate) where.investmentDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.investmentDate.lte = new Date(filters.endDate);
    }

    const investments = await this.prisma.investment.findMany({
      where,
      include: {
        project: { select: { code: true, name: true } },
        investor: { select: { fullName: true, companyName: true, cpf: true, cnpj: true } },
      },
      orderBy: { investmentDate: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Aportes');

    // Header
    worksheet.columns = [
      { header: 'Data', key: 'date', width: 12 },
      { header: 'Projeto', key: 'project', width: 30 },
      { header: 'Investidor', key: 'investor', width: 30 },
      { header: 'CPF/CNPJ', key: 'document', width: 18 },
      { header: 'Valor', key: 'amount', width: 15 },
      { header: 'Método Pagamento', key: 'paymentMethod', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Referência', key: 'reference', width: 20 },
      { header: 'Documento', key: 'docNumber', width: 20 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    // Data
    investments.forEach((inv) => {
      worksheet.addRow({
        date: new Date(inv.investmentDate).toLocaleDateString('pt-BR'),
        project: `${inv.project.code} - ${inv.project.name}`,
        investor: inv.investor.fullName || inv.investor.companyName,
        document: inv.investor.cpf || inv.investor.cnpj,
        amount: inv.amount,
        paymentMethod: inv.paymentMethod || 'N/A',
        status: inv.status,
        reference: inv.referenceNumber || '',
        docNumber: inv.documentNumber || '',
      });
    });

    // Format currency columns
    worksheet.getColumn('amount').numFmt = 'R$ #,##0.00';

    // Totals
    const totalRow = worksheet.addRow({
      date: '',
      project: '',
      investor: '',
      document: 'TOTAL:',
      amount: { formula: `SUM(E2:E${investments.length + 1})` },
      paymentMethod: '',
      status: '',
      reference: '',
      docNumber: '',
    });

    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7E6E6' },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Exporta relatório de aportes por investidor
   */
  async exportInvestmentsByInvestor(companyId: string, filters: ExportInvestmentsDto): Promise<Buffer> {
    const where: any = { companyId };

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.investorId) where.investorId = filters.investorId;
    if (filters.status) where.status = filters.status;
    
    if (filters.startDate || filters.endDate) {
      where.investmentDate = {};
      if (filters.startDate) where.investmentDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.investmentDate.lte = new Date(filters.endDate);
    }

    const investments = await this.prisma.investment.findMany({
      where,
      include: {
        project: { select: { code: true, name: true } },
        investor: { select: { fullName: true, companyName: true, cpf: true, cnpj: true } },
      },
      orderBy: [{ investorId: 'asc' }, { investmentDate: 'desc' }],
    });

    // Group by investor
    const groupedByInvestor = investments.reduce((acc, inv) => {
      const investorName = inv.investor.fullName || inv.investor.companyName || 'Sem Nome';
      if (!acc[investorName]) {
        acc[investorName] = [];
      }
      acc[investorName].push(inv);
      return acc;
    }, {} as Record<string, typeof investments>);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Aportes por Investidor');

    // Header
    worksheet.columns = [
      { header: 'Investidor', key: 'investor', width: 30 },
      { header: 'CPF/CNPJ', key: 'document', width: 18 },
      { header: 'Projeto', key: 'project', width: 30 },
      { header: 'Data', key: 'date', width: 12 },
      { header: 'Valor', key: 'amount', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    // Data grouped by investor
    Object.entries(groupedByInvestor).forEach(([investorName, invs]) => {
      invs.forEach((inv, index) => {
        worksheet.addRow({
          investor: index === 0 ? investorName : '',
          document: index === 0 ? (inv.investor.cpf || inv.investor.cnpj) : '',
          project: `${inv.project.code} - ${inv.project.name}`,
          date: new Date(inv.investmentDate).toLocaleDateString('pt-BR'),
          amount: inv.amount,
          status: inv.status,
        });
      });

      // Subtotal per investor
      const subtotalRow = worksheet.addRow({
        investor: '',
        document: 'Subtotal:',
        project: '',
        date: '',
        amount: invs.reduce((sum, inv) => sum + inv.amount, 0),
        status: '',
      });

      subtotalRow.font = { bold: true, italic: true };
      subtotalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };
    });

    // Format currency
    worksheet.getColumn('amount').numFmt = 'R$ #,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Exporta relatório de aportes por projeto
   */
  async exportInvestmentsByProject(companyId: string, filters: ExportInvestmentsDto): Promise<Buffer> {
    const where: any = { companyId };

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.investorId) where.investorId = filters.investorId;
    if (filters.status) where.status = filters.status;
    
    if (filters.startDate || filters.endDate) {
      where.investmentDate = {};
      if (filters.startDate) where.investmentDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.investmentDate.lte = new Date(filters.endDate);
    }

    const investments = await this.prisma.investment.findMany({
      where,
      include: {
        project: { select: { code: true, name: true } },
        investor: { select: { fullName: true, companyName: true } },
      },
      orderBy: [{ projectId: 'asc' }, { investmentDate: 'desc' }],
    });

    // Group by project
    const groupedByProject = investments.reduce((acc, inv) => {
      const projectName = `${inv.project.code} - ${inv.project.name}`;
      if (!acc[projectName]) {
        acc[projectName] = [];
      }
      acc[projectName].push(inv);
      return acc;
    }, {} as Record<string, typeof investments>);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Aportes por Projeto');

    worksheet.columns = [
      { header: 'Projeto', key: 'project', width: 30 },
      { header: 'Investidor', key: 'investor', width: 30 },
      { header: 'Data', key: 'date', width: 12 },
      { header: 'Valor', key: 'amount', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    Object.entries(groupedByProject).forEach(([projectName, invs]) => {
      invs.forEach((inv, index) => {
        worksheet.addRow({
          project: index === 0 ? projectName : '',
          investor: inv.investor.fullName || inv.investor.companyName,
          date: new Date(inv.investmentDate).toLocaleDateString('pt-BR'),
          amount: inv.amount,
          status: inv.status,
        });
      });

      const subtotalRow = worksheet.addRow({
        project: '',
        investor: 'Subtotal:',
        date: '',
        amount: invs.reduce((sum, inv) => sum + inv.amount, 0),
        status: '',
      });

      subtotalRow.font = { bold: true, italic: true };
      subtotalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };
    });

    worksheet.getColumn('amount').numFmt = 'R$ #,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Exporta relatório de distribuições
   */
  async exportDistributions(companyId: string, filters: ExportDistributionsDto): Promise<Buffer> {
    const where: any = { companyId };

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.investorId) where.investorId = filters.investorId;
    if (filters.status) where.status = filters.status;
    
    if (filters.startDate || filters.endDate) {
      where.distributionDate = {};
      if (filters.startDate) where.distributionDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.distributionDate.lte = new Date(filters.endDate);
    }

    const distributions = await this.prisma.distribution.findMany({
      where,
      include: {
        project: { select: { code: true, name: true } },
        investor: { select: { fullName: true, companyName: true, cpf: true, cnpj: true } },
      },
      orderBy: { distributionDate: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Distribuições');

    worksheet.columns = [
      { header: 'Data Distrib.', key: 'date', width: 12 },
      { header: 'Data Compet.', key: 'competence', width: 12 },
      { header: 'Projeto', key: 'project', width: 30 },
      { header: 'Investidor', key: 'investor', width: 30 },
      { header: 'CPF/CNPJ', key: 'document', width: 18 },
      { header: 'Valor Base', key: 'baseValue', width: 15 },
      { header: 'Valor Bruto', key: 'amount', width: 15 },
      { header: 'IRRF', key: 'irrf', width: 15 },
      { header: 'Deduções', key: 'deductions', width: 15 },
      { header: 'Valor Líquido', key: 'netAmount', width: 15 },
      { header: 'Percentual %', key: 'percentage', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Método Pagto', key: 'payment', width: 15 },
      { header: 'Referência', key: 'reference', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };

    distributions.forEach((dist) => {
      worksheet.addRow({
        date: new Date(dist.distributionDate).toLocaleDateString('pt-BR'),
        competence: new Date(dist.competenceDate).toLocaleDateString('pt-BR'),
        project: `${dist.project.code} - ${dist.project.name}`,
        investor: dist.investor.fullName || dist.investor.companyName,
        document: dist.investor.cpf || dist.investor.cnpj,
        baseValue: dist.baseValue,
        amount: dist.amount,
        irrf: dist.irrf,
        deductions: dist.otherDeductions,
        netAmount: dist.netAmount,
        percentage: dist.percentage,
        status: dist.status,
        payment: dist.paymentMethod || '',
        reference: dist.referenceNumber || '',
      });
    });

    ['baseValue', 'amount', 'irrf', 'deductions', 'netAmount'].forEach((col) => {
      worksheet.getColumn(col).numFmt = 'R$ #,##0.00';
    });
    worksheet.getColumn('percentage').numFmt = '0.00"%"';

    const totalRow = worksheet.addRow({
      date: '',
      competence: '',
      project: '',
      investor: '',
      document: 'TOTAL:',
      baseValue: { formula: `SUM(F2:F${distributions.length + 1})` },
      amount: { formula: `SUM(G2:G${distributions.length + 1})` },
      irrf: { formula: `SUM(H2:H${distributions.length + 1})` },
      deductions: { formula: `SUM(I2:I${distributions.length + 1})` },
      netAmount: { formula: `SUM(J2:J${distributions.length + 1})` },
      percentage: '',
      status: '',
      payment: '',
      reference: '',
    });

    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE7E6E6' },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Exporta relatório de ROI (Retorno sobre Investimento)
   */
  async exportROI(companyId: string, filters: ExportROIDto): Promise<Buffer> {
    const investmentWhere: any = { companyId };
    const distributionWhere: any = { companyId, status: 'PAGO' };

    if (filters.projectId) {
      investmentWhere.projectId = filters.projectId;
      distributionWhere.projectId = filters.projectId;
    }

    if (filters.investorId) {
      investmentWhere.investorId = filters.investorId;
      distributionWhere.investorId = filters.investorId;
    }

    if (filters.startDate || filters.endDate) {
      investmentWhere.investmentDate = {};
      distributionWhere.distributionDate = {};
      
      if (filters.startDate) {
        investmentWhere.investmentDate.gte = new Date(filters.startDate);
        distributionWhere.distributionDate.gte = new Date(filters.startDate);
      }
      
      if (filters.endDate) {
        investmentWhere.investmentDate.lte = new Date(filters.endDate);
        distributionWhere.distributionDate.lte = new Date(filters.endDate);
      }
    }

    const [investments, distributions] = await Promise.all([
      this.prisma.investment.findMany({
        where: investmentWhere,
        include: {
          project: { select: { code: true, name: true } },
          investor: { select: { fullName: true, companyName: true } },
        },
      }),
      this.prisma.distribution.findMany({
        where: distributionWhere,
        include: {
          project: { select: { code: true, name: true } },
          investor: { select: { fullName: true, companyName: true } },
        },
      }),
    ]);

    // Calculate ROI per investor/project
    const roiData: Record<string, any> = {};

    investments.forEach((inv) => {
      const key = `${inv.investorId}-${inv.projectId}`;
      if (!roiData[key]) {
        roiData[key] = {
          investor: inv.investor.fullName || inv.investor.companyName,
          project: `${inv.project.code} - ${inv.project.name}`,
          totalInvested: 0,
          totalDistributed: 0,
          roi: 0,
          roiPercentage: 0,
        };
      }
      roiData[key].totalInvested += inv.amount;
    });

    distributions.forEach((dist) => {
      const key = `${dist.investorId}-${dist.projectId}`;
      if (roiData[key]) {
        roiData[key].totalDistributed += dist.netAmount;
      }
    });

    // Calculate ROI
    Object.values(roiData).forEach((data: any) => {
      data.roi = data.totalDistributed - data.totalInvested;
      data.roiPercentage = data.totalInvested > 0 
        ? (data.roi / data.totalInvested) * 100 
        : 0;
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('ROI - Retorno sobre Investimento');

    worksheet.columns = [
      { header: 'Investidor', key: 'investor', width: 30 },
      { header: 'Projeto', key: 'project', width: 30 },
      { header: 'Total Investido', key: 'invested', width: 18 },
      { header: 'Total Distribuído', key: 'distributed', width: 18 },
      { header: 'ROI (R$)', key: 'roi', width: 18 },
      { header: 'ROI (%)', key: 'roiPercentage', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFED7D31' },
    };

    Object.values(roiData).forEach((data: any) => {
      const row = worksheet.addRow({
        investor: data.investor,
        project: data.project,
        invested: data.totalInvested,
        distributed: data.totalDistributed,
        roi: data.roi,
        roiPercentage: data.roiPercentage / 100,
      });

      // Color ROI based on positive/negative
      if (data.roi < 0) {
        row.getCell('roi').font = { color: { argb: 'FFFF0000' } };
        row.getCell('roiPercentage').font = { color: { argb: 'FFFF0000' } };
      } else if (data.roi > 0) {
        row.getCell('roi').font = { color: { argb: 'FF00B050' } };
        row.getCell('roiPercentage').font = { color: { argb: 'FF00B050' } };
      }
    });

    ['invested', 'distributed', 'roi'].forEach((col) => {
      worksheet.getColumn(col).numFmt = 'R$ #,##0.00';
    });
    worksheet.getColumn('roiPercentage').numFmt = '0.00%';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Exporta relatório resumido de investidores
   */
  async exportInvestorsSummary(companyId: string, filters: ExportInvestorsDto): Promise<Buffer> {
    const where: any = { companyId };

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;

    const investors = await this.prisma.investor.findMany({
      where,
      include: {
        investments: {
          include: { project: { select: { code: true, name: true } } },
        },
        distributions: {
          where: { status: 'PAGO' },
        },
        _count: {
          select: {
            investments: true,
            distributions: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resumo de Investidores');

    worksheet.columns = [
      { header: 'Nome/Razão Social', key: 'name', width: 35 },
      { header: 'CPF/CNPJ', key: 'document', width: 18 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Telefone', key: 'phone', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Qtd Aportes', key: 'investmentCount', width: 12 },
      { header: 'Total Investido', key: 'totalInvested', width: 18 },
      { header: 'Qtd Distribuições', key: 'distributionCount', width: 15 },
      { header: 'Total Recebido', key: 'totalReceived', width: 18 },
      { header: 'ROI (R$)', key: 'roi', width: 18 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF5B9BD5' },
    };

    investors.forEach((investor) => {
      const totalInvested = investor.investments.reduce((sum, inv) => sum + inv.amount, 0);
      const totalReceived = investor.distributions.reduce((sum, dist) => sum + dist.netAmount, 0);
      const roi = totalReceived - totalInvested;

      const row = worksheet.addRow({
        name: investor.fullName || investor.companyName,
        document: investor.cpf || investor.cnpj,
        type: investor.type === 'PESSOA_FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica',
        email: investor.email,
        phone: investor.phone,
        status: investor.status,
        investmentCount: investor._count.investments,
        totalInvested,
        distributionCount: investor._count.distributions,
        totalReceived,
        roi,
      });

      if (roi < 0) {
        row.getCell('roi').font = { color: { argb: 'FFFF0000' } };
      } else if (roi > 0) {
        row.getCell('roi').font = { color: { argb: 'FF00B050' } };
      }
    });

    ['totalInvested', 'totalReceived', 'roi'].forEach((col) => {
      worksheet.getColumn(col).numFmt = 'R$ #,##0.00';
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Exporta relatório resumido de projetos
   */
  async exportProjectsSummary(companyId: string, filters: ExportProjectsDto): Promise<Buffer> {
    const where: any = { companyId };

    if (filters.status) where.status = filters.status;
    
    if (filters.startDate || filters.endDate) {
      where.startDate = {};
      if (filters.startDate) where.startDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.startDate.lte = new Date(filters.endDate);
    }

    const projects = await this.prisma.scpProject.findMany({
      where,
      include: {
        investments: true,
        distributions: {
          where: { status: 'PAGO' },
        },
        _count: {
          select: {
            investments: true,
            distributions: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resumo de Projetos');

    worksheet.columns = [
      { header: 'Código', key: 'code', width: 15 },
      { header: 'Nome', key: 'name', width: 35 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Data Início', key: 'startDate', width: 12 },
      { header: 'Data Fim', key: 'endDate', width: 12 },
      { header: 'Valor Total', key: 'totalValue', width: 18 },
      { header: 'Valor Investido', key: 'investedValue', width: 18 },
      { header: '% Investido', key: 'investedPercentage', width: 12 },
      { header: 'Distribuído', key: 'distributedValue', width: 18 },
      { header: 'Qtd Aportes', key: 'investmentCount', width: 12 },
      { header: 'Qtd Distribuições', key: 'distributionCount', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' },
    };

    projects.forEach((project) => {
      const investedPercentage = project.totalValue > 0 
        ? (project.investedValue / project.totalValue) * 100 
        : 0;

      worksheet.addRow({
        code: project.code,
        name: project.name,
        status: project.status,
        startDate: project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : '',
        endDate: project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : '',
        totalValue: project.totalValue,
        investedValue: project.investedValue,
        investedPercentage: investedPercentage / 100,
        distributedValue: project.distributedValue,
        investmentCount: project._count.investments,
        distributionCount: project._count.distributions,
      });
    });

    ['totalValue', 'investedValue', 'distributedValue'].forEach((col) => {
      worksheet.getColumn(col).numFmt = 'R$ #,##0.00';
    });
    worksheet.getColumn('investedPercentage').numFmt = '0.00%';

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

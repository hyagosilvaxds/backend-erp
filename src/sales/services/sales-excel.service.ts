import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { Prisma } from '@prisma/client';

interface ExcelFilters {
  status?: string;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  paymentMethodId?: string;
}

@Injectable()
export class SalesExcelService {
  constructor(private prisma: PrismaService) {}

  /**
   * Gera planilha Excel com vendas filtradas
   */
  async generateSalesExcel(
    companyId: string,
    filters: ExcelFilters,
  ): Promise<Buffer> {
    // Buscar vendas com filtros
    const where: Prisma.SaleWhereInput = {
      companyId,
    };

    if (filters.status) {
      where.status = filters.status as any;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.paymentMethodId) {
      where.paymentMethodId = filters.paymentMethodId;
    }

    if (filters.startDate || filters.endDate) {
      where.quoteDate = {};
      if (filters.startDate) {
        where.quoteDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.quoteDate.lte = filters.endDate;
      }
    }

    if (filters.minAmount || filters.maxAmount) {
      where.totalAmount = {};
      if (filters.minAmount) {
        where.totalAmount.gte = filters.minAmount;
      }
      if (filters.maxAmount) {
        where.totalAmount.lte = filters.maxAmount;
      }
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        customer: true,
        paymentMethod: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { quoteDate: 'desc' },
    });

    // Buscar informações da empresa
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = company?.nomeFantasia || company?.razaoSocial || 'Sistema ERP';
    workbook.created = new Date();

    // Criar planilha principal
    const worksheet = workbook.addWorksheet('Vendas', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    // Configurar colunas
    worksheet.columns = [
      { header: 'Código', key: 'code', width: 18 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Data', key: 'date', width: 12 },
      { header: 'Cliente', key: 'customer', width: 30 },
      { header: 'CPF/CNPJ', key: 'cpfCnpj', width: 18 },
      { header: 'Método Pagamento', key: 'paymentMethod', width: 20 },
      { header: 'Parcelas', key: 'installments', width: 10 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Desconto', key: 'discount', width: 15 },
      { header: 'Frete', key: 'shipping', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Qtd. Itens', key: 'itemCount', width: 12 },
      { header: 'Observações', key: 'notes', width: 40 },
    ];

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2C3E50' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Mapear status
    const statusMap: Record<string, string> = {
      QUOTE: 'Orçamento',
      PENDING_APPROVAL: 'Aguardando Aprovação',
      APPROVED: 'Aprovada',
      CONFIRMED: 'Confirmada',
      IN_PRODUCTION: 'Em Produção',
      READY_TO_SHIP: 'Pronto para Envio',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregue',
      COMPLETED: 'Concluída',
      CANCELED: 'Cancelada',
      REJECTED: 'Rejeitada',
    };

    // Adicionar dados
    sales.forEach((sale) => {
      const cpfCnpj = sale.customer.personType === 'FISICA' 
        ? sale.customer.cpf 
        : sale.customer.cnpj;
      
      const row = worksheet.addRow({
        code: sale.code,
        status: statusMap[sale.status] || sale.status,
        date: sale.quoteDate,
        customer: sale.customer.name,
        cpfCnpj: cpfCnpj || '-',
        paymentMethod: sale.paymentMethod?.name || '-',
        installments: sale.installments,
        subtotal: sale.subtotal,
        discount: sale.discountAmount,
        shipping: sale.shippingCost,
        total: sale.totalAmount,
        itemCount: sale.items.length,
        notes: sale.notes || '-',
      });

      // Formatar data
      const dateCell = row.getCell('date');
      dateCell.numFmt = 'dd/mm/yyyy';

      // Formatar valores monetários
      ['subtotal', 'discount', 'shipping', 'total'].forEach((key) => {
        const cell = row.getCell(key);
        cell.numFmt = 'R$ #,##0.00';
      });

      // Colorir linha baseado no status
      const statusColors: Record<string, string> = {
        QUOTE: 'FFF39C12',
        PENDING_APPROVAL: 'FFE67E22',
        APPROVED: 'FF27AE60',
        CONFIRMED: 'FF16A085',
        IN_PRODUCTION: 'FF3498DB',
        READY_TO_SHIP: 'FF9B59B6',
        SHIPPED: 'FF34495E',
        DELIVERED: 'FF1ABC9C',
        COMPLETED: 'FF2980B9',
        CANCELED: 'FFE74C3C',
        REJECTED: 'FFC0392B',
      };

      if (statusColors[sale.status]) {
        row.getCell('status').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: statusColors[sale.status] },
        };
        row.getCell('status').font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }

      // Alinhar células
      row.alignment = { vertical: 'middle' };
      row.getCell('installments').alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell('itemCount').alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Adicionar bordas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        };
      });
    });

    // Adicionar totalizadores
    if (sales.length > 0) {
      const totalRow = worksheet.addRow({
        code: '',
        status: '',
        date: '',
        customer: '',
        cpfCnpj: '',
        paymentMethod: 'TOTAL:',
        installments: '',
        subtotal: { formula: `SUM(H2:H${sales.length + 1})` },
        discount: { formula: `SUM(I2:I${sales.length + 1})` },
        shipping: { formula: `SUM(J2:J${sales.length + 1})` },
        total: { formula: `SUM(K2:K${sales.length + 1})` },
        itemCount: sales.reduce((sum, sale) => sum + sale.items.length, 0),
        notes: '',
      });

      totalRow.font = { bold: true };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8E8E8' },
      };

      // Formatar valores monetários do total
      ['subtotal', 'discount', 'shipping', 'total'].forEach((key) => {
        const cell = totalRow.getCell(key);
        cell.numFmt = 'R$ #,##0.00';
      });
    }

    // Criar planilha de itens detalhados
    const itemsSheet = workbook.addWorksheet('Itens Detalhados');
    
    itemsSheet.columns = [
      { header: 'Código Venda', key: 'saleCode', width: 18 },
      { header: 'Cliente', key: 'customer', width: 30 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Produto', key: 'product', width: 35 },
      { header: 'Quantidade', key: 'quantity', width: 12 },
      { header: 'Preço Unit.', key: 'unitPrice', width: 15 },
      { header: 'Desconto', key: 'discount', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    // Estilizar cabeçalho da planilha de itens
    itemsSheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    itemsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2C3E50' },
    };
    itemsSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    itemsSheet.getRow(1).height = 25;

    // Adicionar itens
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const row = itemsSheet.addRow({
          saleCode: sale.code,
          customer: sale.customer.name,
          sku: item.product.sku || '-',
          product: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          total: item.total,
        });

        // Formatar valores monetários
        ['unitPrice', 'discount', 'total'].forEach((key) => {
          const cell = row.getCell(key);
          cell.numFmt = 'R$ #,##0.00';
        });

        row.alignment = { vertical: 'middle' };
        row.getCell('quantity').alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    // Adicionar bordas na planilha de itens
    itemsSheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        };
      });
    });

    // Adicionar planilha de resumo
    const summarySheet = workbook.addWorksheet('Resumo');
    
    // Calcular totais
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + sale.discountAmount, 0);
    const totalShipping = sales.reduce((sum, sale) => sum + sale.shippingCost, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Vendas por status
    const salesByStatus: Record<string, number> = {};
    sales.forEach((sale) => {
      const status = statusMap[sale.status] || sale.status;
      salesByStatus[status] = (salesByStatus[status] || 0) + 1;
    });

    // Adicionar informações de resumo
    summarySheet.mergeCells('A1:B1');
    summarySheet.getCell('A1').value = 'RESUMO DE VENDAS';
    summarySheet.getCell('A1').font = { bold: true, size: 16 };
    summarySheet.getCell('A1').alignment = { horizontal: 'center' };

    let row = 3;
    
    // Informações gerais
    summarySheet.getCell(`A${row}`).value = 'Total de Vendas:';
    summarySheet.getCell(`A${row}`).font = { bold: true };
    summarySheet.getCell(`B${row}`).value = totalSales;
    row++;

    summarySheet.getCell(`A${row}`).value = 'Receita Total:';
    summarySheet.getCell(`A${row}`).font = { bold: true };
    summarySheet.getCell(`B${row}`).value = totalRevenue;
    summarySheet.getCell(`B${row}`).numFmt = 'R$ #,##0.00';
    row++;

    summarySheet.getCell(`A${row}`).value = 'Ticket Médio:';
    summarySheet.getCell(`A${row}`).font = { bold: true };
    summarySheet.getCell(`B${row}`).value = averageTicket;
    summarySheet.getCell(`B${row}`).numFmt = 'R$ #,##0.00';
    row++;

    summarySheet.getCell(`A${row}`).value = 'Total Descontos:';
    summarySheet.getCell(`A${row}`).font = { bold: true };
    summarySheet.getCell(`B${row}`).value = totalDiscount;
    summarySheet.getCell(`B${row}`).numFmt = 'R$ #,##0.00';
    row++;

    summarySheet.getCell(`A${row}`).value = 'Total Fretes:';
    summarySheet.getCell(`A${row}`).font = { bold: true };
    summarySheet.getCell(`B${row}`).value = totalShipping;
    summarySheet.getCell(`B${row}`).numFmt = 'R$ #,##0.00';
    row += 2;

    // Vendas por status
    summarySheet.getCell(`A${row}`).value = 'Vendas por Status:';
    summarySheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    row++;

    Object.entries(salesByStatus).forEach(([status, count]) => {
      summarySheet.getCell(`A${row}`).value = status;
      summarySheet.getCell(`B${row}`).value = count;
      row++;
    });

    // Configurar período dos filtros
    if (filters.startDate || filters.endDate) {
      row += 2;
      summarySheet.getCell(`A${row}`).value = 'Período:';
      summarySheet.getCell(`A${row}`).font = { bold: true };
      
      const startDate = filters.startDate ? filters.startDate.toLocaleDateString('pt-BR') : 'Início';
      const endDate = filters.endDate ? filters.endDate.toLocaleDateString('pt-BR') : 'Hoje';
      summarySheet.getCell(`B${row}`).value = `${startDate} até ${endDate}`;
    }

    summarySheet.getColumn(1).width = 25;
    summarySheet.getColumn(2).width = 20;

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

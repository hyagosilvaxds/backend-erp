import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class FinancialReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData(companyId: string, startDate?: Date, endDate?: Date) {
    const dateFilter = startDate && endDate ? {
      gte: startDate,
      lte: endDate,
    } : undefined;

    // Resumo de contas bancárias
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: { companyId, active: true },
      select: {
        id: true,
        accountName: true,
        currentBalance: true,
      },
    });

    const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

    // Contas a pagar
    const accountsPayable = await this.prisma.accountPayable.groupBy({
      by: ['status'],
      where: {
        companyId,
        ...(dateFilter && { dueDate: dateFilter }),
      },
      _sum: {
        remainingAmount: true,
      },
      _count: true,
    });

    // Contas a receber
    const accountsReceivable = await this.prisma.accountReceivable.groupBy({
      by: ['status'],
      where: {
        companyId,
        ...(dateFilter && { dueDate: dateFilter }),
      },
      _sum: {
        remainingAmount: true,
      },
      _count: true,
    });

    // Transações por tipo
    const transactions = await this.prisma.financialTransaction.groupBy({
      by: ['type'],
      where: {
        companyId,
        ...(dateFilter && { transactionDate: dateFilter }),
      },
      _sum: {
        netAmount: true,
      },
      _count: true,
    });

    return {
      bankAccounts: {
        accounts: bankAccounts,
        totalBalance,
      },
      accountsPayable,
      accountsReceivable,
      transactions,
    };
  }

  async getCashFlowReport(companyId: string, startDate: Date, endDate: Date) {
    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        companyId,
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        bankAccount: true,
      },
      orderBy: { transactionDate: 'asc' },
    });

    const groupedByDate = transactions.reduce((acc, transaction) => {
      const date = transaction.transactionDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          receitas: 0,
          despesas: 0,
          saldo: 0,
        };
      }

      if (transaction.type === 'RECEITA') {
        acc[date].receitas += transaction.netAmount;
      } else {
        acc[date].despesas += transaction.netAmount;
      }

      acc[date].saldo = acc[date].receitas - acc[date].despesas;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedByDate);
  }

  async exportCashFlowToExcel(companyId: string, startDate: Date, endDate: Date) {
    const data = await this.getCashFlowReport(companyId, startDate, endDate);

    // Buscar todas as transações do período para detalhamento
    const allTransactions = await this.prisma.financialTransaction.findMany({
      where: {
        companyId,
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        bankAccount: true,
        centroCusto: true,
        contaContabil: true,
      },
      orderBy: { transactionDate: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    
    // ABA 1: Resumo do Fluxo de Caixa
    const worksheet = workbook.addWorksheet('Fluxo de Caixa');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'Data', key: 'date', width: 15 },
      { header: 'Receitas', key: 'receitas', width: 15 },
      { header: 'Despesas', key: 'despesas', width: 15 },
      { header: 'Saldo do Dia', key: 'saldo', width: 15 },
    ];

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Adicionar dados
    data.forEach((row) => {
      worksheet.addRow({
        date: row.date,
        receitas: row.receitas,
        despesas: row.despesas,
        saldo: row.saldo,
      });
    });

    // Formatação de números
    worksheet.getColumn('receitas').numFmt = 'R$ #,##0.00';
    worksheet.getColumn('despesas').numFmt = 'R$ #,##0.00';
    worksheet.getColumn('saldo').numFmt = 'R$ #,##0.00';

    // Totais
    const lastRow = worksheet.lastRow!.number + 1;
    worksheet.getCell(`A${lastRow}`).value = 'TOTAL';
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    worksheet.getCell(`B${lastRow}`).value = { formula: `SUM(B2:B${lastRow - 1})` };
    worksheet.getCell(`C${lastRow}`).value = { formula: `SUM(C2:C${lastRow - 1})` };
    worksheet.getCell(`D${lastRow}`).value = { formula: `SUM(D2:D${lastRow - 1})` };

    // ABA 2: Detalhamento dos Lançamentos
    const detailSheet = workbook.addWorksheet('Lançamentos Detalhados');

    detailSheet.columns = [
      { header: 'Data', key: 'transactionDate', width: 15 },
      { header: 'Tipo', key: 'type', width: 12 },
      { header: 'Descrição', key: 'description', width: 40 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Conta Bancária', key: 'bankAccount', width: 25 },
      { header: 'Centro de Custo', key: 'centroCusto', width: 20 },
      { header: 'Conta Contábil', key: 'contaContabil', width: 25 },
      { header: 'Valor', key: 'amount', width: 15 },
      { header: 'Taxas', key: 'fees', width: 12 },
      { header: 'Valor Líquido', key: 'netAmount', width: 15 },
      { header: 'Forma Pagamento', key: 'transactionType', width: 18 },
      { header: 'Ref./Doc.', key: 'referenceNumber', width: 15 },
      { header: 'Conciliado', key: 'reconciled', width: 12 },
    ];

    // Estilizar cabeçalho
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    detailSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Adicionar dados
    allTransactions.forEach((transaction) => {
      detailSheet.addRow({
        transactionDate: transaction.transactionDate,
        type: transaction.type,
        description: transaction.description,
        category: transaction.category?.name || 'Sem categoria',
        bankAccount: transaction.bankAccount?.accountName || 'Sem conta',
        centroCusto: transaction.centroCusto?.nome || '-',
        contaContabil: transaction.contaContabil 
          ? `${transaction.contaContabil.codigo} - ${transaction.contaContabil.nome}`
          : '-',
        amount: transaction.amount,
        fees: transaction.fees,
        netAmount: transaction.netAmount,
        transactionType: transaction.transactionType,
        referenceNumber: transaction.referenceNumber || '-',
        reconciled: transaction.reconciled ? 'Sim' : 'Não',
      });
    });

    // Formatação
    detailSheet.getColumn('transactionDate').numFmt = 'dd/mm/yyyy';
    detailSheet.getColumn('amount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('fees').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('netAmount').numFmt = 'R$ #,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async exportAccountsPayableToExcel(companyId: string, filters?: { status?: string; startDate?: Date; endDate?: Date }) {
    const where: any = { companyId };

    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {};
      if (filters.startDate) where.dueDate.gte = filters.startDate;
      if (filters.endDate) where.dueDate.lte = filters.endDate;
    }

    const accounts = await this.prisma.accountPayable.findMany({
      where,
      include: {
        category: true,
        centroCusto: true,
        contaContabil: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    
    // ABA 1: Resumo
    const worksheet = workbook.addWorksheet('Contas a Pagar - Resumo');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'Fornecedor', key: 'supplierName', width: 30 },
      { header: 'Descrição', key: 'description', width: 40 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Valor Original', key: 'originalAmount', width: 15 },
      { header: 'Valor Pago', key: 'paidAmount', width: 15 },
      { header: 'Saldo', key: 'remainingAmount', width: 15 },
      { header: 'Data de Emissão', key: 'issueDate', width: 15 },
      { header: 'Vencimento', key: 'dueDate', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Adicionar dados
    accounts.forEach((account) => {
      worksheet.addRow({
        supplierName: account.supplierName,
        description: account.description,
        category: account.category?.name || 'Sem categoria',
        originalAmount: account.originalAmount,
        paidAmount: account.paidAmount,
        remainingAmount: account.remainingAmount,
        issueDate: account.issueDate,
        dueDate: account.dueDate,
        status: account.status,
      });
    });

    // Formatação
    worksheet.getColumn('originalAmount').numFmt = 'R$ #,##0.00';
    worksheet.getColumn('paidAmount').numFmt = 'R$ #,##0.00';
    worksheet.getColumn('remainingAmount').numFmt = 'R$ #,##0.00';
    worksheet.getColumn('issueDate').numFmt = 'dd/mm/yyyy';
    worksheet.getColumn('dueDate').numFmt = 'dd/mm/yyyy';

    // Totais
    const lastRow = worksheet.lastRow!.number + 1;
    worksheet.getCell(`A${lastRow}`).value = 'TOTAL';
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    worksheet.getCell(`D${lastRow}`).value = { formula: `SUM(D2:D${lastRow - 1})` };
    worksheet.getCell(`E${lastRow}`).value = { formula: `SUM(E2:E${lastRow - 1})` };
    worksheet.getCell(`F${lastRow}`).value = { formula: `SUM(F2:F${lastRow - 1})` };

    // ABA 2: Detalhamento Completo
    const detailSheet = workbook.addWorksheet('Detalhamento Completo');

    detailSheet.columns = [
      { header: 'Fornecedor', key: 'supplierName', width: 30 },
      { header: 'CNPJ/CPF', key: 'supplierDocument', width: 20 },
      { header: 'Descrição', key: 'description', width: 40 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Centro de Custo', key: 'centroCusto', width: 20 },
      { header: 'Conta Contábil', key: 'contaContabil', width: 25 },
      { header: 'Nº Documento', key: 'documentNumber', width: 15 },
      { header: 'Valor Original', key: 'originalAmount', width: 15 },
      { header: 'Desconto', key: 'discountAmount', width: 12 },
      { header: 'Juros', key: 'interestAmount', width: 12 },
      { header: 'Multa', key: 'fineAmount', width: 12 },
      { header: 'Valor Pago', key: 'paidAmount', width: 15 },
      { header: 'Saldo', key: 'remainingAmount', width: 15 },
      { header: 'Data Emissão', key: 'issueDate', width: 15 },
      { header: 'Vencimento', key: 'dueDate', width: 15 },
      { header: 'Data Pagamento', key: 'paymentDate', width: 15 },
      { header: 'Parcela', key: 'installment', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Observações', key: 'notes', width: 30 },
    ];

    // Estilizar cabeçalho
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    detailSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Adicionar dados detalhados
    accounts.forEach((account) => {
      detailSheet.addRow({
        supplierName: account.supplierName,
        supplierDocument: account.supplierDocument || '-',
        description: account.description,
        category: account.category?.name || 'Sem categoria',
        centroCusto: account.centroCusto?.nome || '-',
        contaContabil: account.contaContabil 
          ? `${account.contaContabil.codigo} - ${account.contaContabil.nome}`
          : '-',
        documentNumber: account.documentNumber || '-',
        originalAmount: account.originalAmount,
        discountAmount: account.discountAmount,
        interestAmount: account.interestAmount,
        fineAmount: account.fineAmount,
        paidAmount: account.paidAmount,
        remainingAmount: account.remainingAmount,
        issueDate: account.issueDate,
        dueDate: account.dueDate,
        paymentDate: account.paymentDate || '-',
        installment: account.totalInstallments && account.totalInstallments > 1 
          ? `${account.installmentNumber}/${account.totalInstallments}`
          : '-',
        status: account.status,
        notes: account.notes || '-',
      });
    });

    // Formatação
    detailSheet.getColumn('originalAmount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('discountAmount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('interestAmount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('fineAmount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('paidAmount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('remainingAmount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('issueDate').numFmt = 'dd/mm/yyyy';
    detailSheet.getColumn('dueDate').numFmt = 'dd/mm/yyyy';

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async exportAccountsReceivableToExcel(companyId: string, filters?: { status?: string; startDate?: Date; endDate?: Date }) {
    const where: any = { companyId };

    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {};
      if (filters.startDate) where.dueDate.gte = filters.startDate;
      if (filters.endDate) where.dueDate.lte = filters.endDate;
    }

    const accounts = await this.prisma.accountReceivable.findMany({
      where,
      include: {
        category: true,
        centroCusto: true,
        contaContabil: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    
    // ABA 1: Resumo
    const worksheet = workbook.addWorksheet('Contas a Receber - Resumo');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'Cliente', key: 'customerName', width: 30 },
      { header: 'Descrição', key: 'description', width: 40 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Valor Original', key: 'originalAmount', width: 15 },
      { header: 'Valor Recebido', key: 'receivedAmount', width: 15 },
      { header: 'Saldo', key: 'remainingAmount', width: 15 },
      { header: 'Data de Emissão', key: 'issueDate', width: 15 },
      { header: 'Vencimento', key: 'dueDate', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Adicionar dados
    accounts.forEach((account) => {
      worksheet.addRow({
        customerName: account.customerName,
        description: account.description,
        category: account.category?.name || 'Sem categoria',
        originalAmount: account.originalAmount,
        receivedAmount: account.receivedAmount,
        remainingAmount: account.remainingAmount,
        issueDate: account.issueDate,
        dueDate: account.dueDate,
        status: account.status,
      });
    });

    // Formatação
    worksheet.getColumn('originalAmount').numFmt = 'R$ #,##0.00';
    worksheet.getColumn('receivedAmount').numFmt = 'R$ #,##0.00';
    worksheet.getColumn('remainingAmount').numFmt = 'R$ #,##0.00';
    worksheet.getColumn('issueDate').numFmt = 'dd/mm/yyyy';
    worksheet.getColumn('dueDate').numFmt = 'dd/mm/yyyy';

    // Totais
    const lastRow = worksheet.lastRow!.number + 1;
    worksheet.getCell(`A${lastRow}`).value = 'TOTAL';
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    worksheet.getCell(`D${lastRow}`).value = { formula: `SUM(D2:D${lastRow - 1})` };
    worksheet.getCell(`E${lastRow}`).value = { formula: `SUM(E2:E${lastRow - 1})` };
    worksheet.getCell(`F${lastRow}`).value = { formula: `SUM(F2:F${lastRow - 1})` };

    // ABA 2: Detalhamento Completo
    const detailSheet = workbook.addWorksheet('Detalhamento Completo');

    detailSheet.columns = [
      { header: 'Cliente', key: 'customerName', width: 30 },
      { header: 'CNPJ/CPF', key: 'customerDocument', width: 20 },
      { header: 'Descrição', key: 'description', width: 40 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Centro de Custo', key: 'centroCusto', width: 20 },
      { header: 'Conta Contábil', key: 'contaContabil', width: 25 },
      { header: 'Nº Documento', key: 'documentNumber', width: 15 },
      { header: 'Valor Original', key: 'originalAmount', width: 15 },
      { header: 'Desconto', key: 'discountAmount', width: 12 },
      { header: 'Juros', key: 'interestAmount', width: 12 },
      { header: 'Multa', key: 'fineAmount', width: 12 },
      { header: 'Valor Recebido', key: 'receivedAmount', width: 15 },
      { header: 'Saldo', key: 'remainingAmount', width: 15 },
      { header: 'Data Emissão', key: 'issueDate', width: 15 },
      { header: 'Vencimento', key: 'dueDate', width: 15 },
      { header: 'Data Recebimento', key: 'receiptDate', width: 15 },
      { header: 'Parcela', key: 'installment', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Observações', key: 'notes', width: 30 },
    ];

    // Estilizar cabeçalho
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    detailSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Adicionar dados detalhados
    accounts.forEach((account) => {
      detailSheet.addRow({
        customerName: account.customerName,
        customerDocument: account.customerDocument || '-',
        description: account.description,
        category: account.category?.name || 'Sem categoria',
        centroCusto: account.centroCusto?.nome || '-',
        contaContabil: account.contaContabil 
          ? `${account.contaContabil.codigo} - ${account.contaContabil.nome}`
          : '-',
        documentNumber: account.documentNumber || '-',
        originalAmount: account.originalAmount,
        discountAmount: account.discountAmount,
        interestAmount: account.interestAmount,
        fineAmount: account.fineAmount,
        receivedAmount: account.receivedAmount,
        remainingAmount: account.remainingAmount,
        issueDate: account.issueDate,
        dueDate: account.dueDate,
        receiptDate: account.receiptDate || '-',
        installment: account.totalInstallments && account.totalInstallments > 1 
          ? `${account.installmentNumber}/${account.totalInstallments}`
          : '-',
        status: account.status,
        notes: account.notes || '-',
      });
    });

    // Formatação
    detailSheet.getColumn('originalAmount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('discountAmount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('interestAmount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('fineAmount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('receivedAmount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('remainingAmount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('issueDate').numFmt = 'dd/mm/yyyy';
    detailSheet.getColumn('dueDate').numFmt = 'dd/mm/yyyy';

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async exportTransactionsByCentroCusto(companyId: string, filters?: { startDate?: Date; endDate?: Date }): Promise<ExcelJS.Buffer> {
    const where: any = { companyId };

    if (filters?.startDate || filters?.endDate) {
      where.transactionDate = {};
      if (filters.startDate) where.transactionDate.gte = filters.startDate;
      if (filters.endDate) where.transactionDate.lte = filters.endDate;
    }

    const transactions = await this.prisma.financialTransaction.findMany({
      where,
      include: {
        centroCusto: true,
        category: true,
        bankAccount: true,
        contaContabil: true,
      },
      orderBy: { transactionDate: 'desc' },
    });

    // Agrupar por centro de custo
    const grouped = transactions.reduce((acc, transaction) => {
      const centroCustoName = transaction.centroCusto?.nome || 'Sem Centro de Custo';
      if (!acc[centroCustoName]) {
        acc[centroCustoName] = {
          receitas: 0,
          despesas: 0,
          saldo: 0,
          count: 0,
        };
      }

      if (transaction.type === 'RECEITA') {
        acc[centroCustoName].receitas += transaction.netAmount;
      } else {
        acc[centroCustoName].despesas += transaction.netAmount;
      }
      acc[centroCustoName].saldo = acc[centroCustoName].receitas - acc[centroCustoName].despesas;
      acc[centroCustoName].count++;

      return acc;
    }, {} as Record<string, any>);

    const workbook = new ExcelJS.Workbook();
    
    // ABA 1: Resumo por Centro de Custo
    const worksheet = workbook.addWorksheet('Resumo por Centro de Custo');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'Centro de Custo', key: 'centroCusto', width: 30 },
      { header: 'Receitas', key: 'receitas', width: 15 },
      { header: 'Despesas', key: 'despesas', width: 15 },
      { header: 'Saldo', key: 'saldo', width: 15 },
      { header: 'Qtd. Transações', key: 'count', width: 18 },
    ];

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Adicionar dados
    Object.entries(grouped).forEach(([centroCusto, data]: [string, any]) => {
      worksheet.addRow({
        centroCusto,
        receitas: data.receitas,
        despesas: data.despesas,
        saldo: data.saldo,
        count: data.count,
      });
    });

    // Formatação
    worksheet.getColumn('receitas').numFmt = 'R$ #,##0.00';
    worksheet.getColumn('despesas').numFmt = 'R$ #,##0.00';
    worksheet.getColumn('saldo').numFmt = 'R$ #,##0.00';

    // Totais
    const lastRow = worksheet.lastRow!.number + 1;
    worksheet.getCell(`A${lastRow}`).value = 'TOTAL';
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    worksheet.getCell(`B${lastRow}`).value = { formula: `SUM(B2:B${lastRow - 1})` };
    worksheet.getCell(`C${lastRow}`).value = { formula: `SUM(C2:C${lastRow - 1})` };
    worksheet.getCell(`D${lastRow}`).value = { formula: `SUM(D2:D${lastRow - 1})` };
    worksheet.getCell(`E${lastRow}`).value = { formula: `SUM(E2:E${lastRow - 1})` };

    // ABA 2: Detalhamento de Todas as Transações
    const detailSheet = workbook.addWorksheet('Todas as Transações');

    detailSheet.columns = [
      { header: 'Data', key: 'transactionDate', width: 15 },
      { header: 'Centro de Custo', key: 'centroCusto', width: 25 },
      { header: 'Tipo', key: 'type', width: 12 },
      { header: 'Descrição', key: 'description', width: 40 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Conta Bancária', key: 'bankAccount', width: 25 },
      { header: 'Conta Contábil', key: 'contaContabil', width: 25 },
      { header: 'Valor', key: 'amount', width: 15 },
      { header: 'Taxas', key: 'fees', width: 12 },
      { header: 'Valor Líquido', key: 'netAmount', width: 15 },
      { header: 'Forma Pagamento', key: 'transactionType', width: 18 },
      { header: 'Ref./Doc.', key: 'referenceNumber', width: 15 },
      { header: 'Conciliado', key: 'reconciled', width: 12 },
    ];

    // Estilizar cabeçalho
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    detailSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Adicionar dados detalhados
    transactions.forEach((transaction) => {
      detailSheet.addRow({
        transactionDate: transaction.transactionDate,
        centroCusto: transaction.centroCusto?.nome || 'Sem Centro de Custo',
        type: transaction.type,
        description: transaction.description,
        category: transaction.category?.name || 'Sem categoria',
        bankAccount: transaction.bankAccount?.accountName || 'Sem conta',
        contaContabil: transaction.contaContabil 
          ? `${transaction.contaContabil.codigo} - ${transaction.contaContabil.nome}`
          : '-',
        amount: transaction.amount,
        fees: transaction.fees,
        netAmount: transaction.netAmount,
        transactionType: transaction.transactionType,
        referenceNumber: transaction.referenceNumber || '-',
        reconciled: transaction.reconciled ? 'Sim' : 'Não',
      });
    });

    // Formatação
    detailSheet.getColumn('transactionDate').numFmt = 'dd/mm/yyyy';
    detailSheet.getColumn('amount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('fees').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('netAmount').numFmt = 'R$ #,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async exportTransactionsByContaContabil(companyId: string, filters?: { startDate?: Date; endDate?: Date }): Promise<ExcelJS.Buffer> {
    const where: any = { companyId };

    if (filters?.startDate || filters?.endDate) {
      where.transactionDate = {};
      if (filters.startDate) where.transactionDate.gte = filters.startDate;
      if (filters.endDate) where.transactionDate.lte = filters.endDate;
    }

    const transactions = await this.prisma.financialTransaction.findMany({
      where,
      include: {
        contaContabil: true,
        category: true,
        bankAccount: true,
        centroCusto: true,
      },
      orderBy: { transactionDate: 'desc' },
    });

    // Agrupar por conta contábil
    const grouped = transactions.reduce((acc, transaction) => {
      const contaName = transaction.contaContabil 
        ? `${transaction.contaContabil.codigo} - ${transaction.contaContabil.nome}`
        : 'Sem Conta Contábil';
      
      if (!acc[contaName]) {
        acc[contaName] = {
          receitas: 0,
          despesas: 0,
          saldo: 0,
          count: 0,
        };
      }

      if (transaction.type === 'RECEITA') {
        acc[contaName].receitas += transaction.netAmount;
      } else {
        acc[contaName].despesas += transaction.netAmount;
      }
      acc[contaName].saldo = acc[contaName].receitas - acc[contaName].despesas;
      acc[contaName].count++;

      return acc;
    }, {} as Record<string, any>);

    const workbook = new ExcelJS.Workbook();
    
    // ABA 1: Resumo por Conta Contábil
    const worksheet = workbook.addWorksheet('Resumo por Conta Contábil');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'Conta Contábil', key: 'contaContabil', width: 40 },
      { header: 'Receitas', key: 'receitas', width: 15 },
      { header: 'Despesas', key: 'despesas', width: 15 },
      { header: 'Saldo', key: 'saldo', width: 15 },
      { header: 'Qtd. Transações', key: 'count', width: 18 },
    ];

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Adicionar dados
    Object.entries(grouped).forEach(([contaContabil, data]: [string, any]) => {
      worksheet.addRow({
        contaContabil,
        receitas: data.receitas,
        despesas: data.despesas,
        saldo: data.saldo,
        count: data.count,
      });
    });

    // Formatação
    worksheet.getColumn('receitas').numFmt = 'R$ #,##0.00';
    worksheet.getColumn('despesas').numFmt = 'R$ #,##0.00';
    worksheet.getColumn('saldo').numFmt = 'R$ #,##0.00';

    // Totais
    const lastRow = worksheet.lastRow!.number + 1;
    worksheet.getCell(`A${lastRow}`).value = 'TOTAL';
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    worksheet.getCell(`B${lastRow}`).value = { formula: `SUM(B2:B${lastRow - 1})` };
    worksheet.getCell(`C${lastRow}`).value = { formula: `SUM(C2:C${lastRow - 1})` };
    worksheet.getCell(`D${lastRow}`).value = { formula: `SUM(D2:D${lastRow - 1})` };
    worksheet.getCell(`E${lastRow}`).value = { formula: `SUM(E2:E${lastRow - 1})` };

    // ABA 2: Detalhamento de Todas as Transações
    const detailSheet = workbook.addWorksheet('Todas as Transações');

    detailSheet.columns = [
      { header: 'Data', key: 'transactionDate', width: 15 },
      { header: 'Conta Contábil', key: 'contaContabil', width: 30 },
      { header: 'Tipo', key: 'type', width: 12 },
      { header: 'Descrição', key: 'description', width: 40 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Conta Bancária', key: 'bankAccount', width: 25 },
      { header: 'Centro de Custo', key: 'centroCusto', width: 20 },
      { header: 'Valor', key: 'amount', width: 15 },
      { header: 'Taxas', key: 'fees', width: 12 },
      { header: 'Valor Líquido', key: 'netAmount', width: 15 },
      { header: 'Forma Pagamento', key: 'transactionType', width: 18 },
      { header: 'Ref./Doc.', key: 'referenceNumber', width: 15 },
      { header: 'Conciliado', key: 'reconciled', width: 12 },
    ];

    // Estilizar cabeçalho
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    detailSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Adicionar dados detalhados
    transactions.forEach((transaction) => {
      detailSheet.addRow({
        transactionDate: transaction.transactionDate,
        contaContabil: transaction.contaContabil 
          ? `${transaction.contaContabil.codigo} - ${transaction.contaContabil.nome}`
          : 'Sem Conta Contábil',
        type: transaction.type,
        description: transaction.description,
        category: transaction.category?.name || 'Sem categoria',
        bankAccount: transaction.bankAccount?.accountName || 'Sem conta',
        centroCusto: transaction.centroCusto?.nome || '-',
        amount: transaction.amount,
        fees: transaction.fees,
        netAmount: transaction.netAmount,
        transactionType: transaction.transactionType,
        referenceNumber: transaction.referenceNumber || '-',
        reconciled: transaction.reconciled ? 'Sim' : 'Não',
      });
    });

    // Formatação
    detailSheet.getColumn('transactionDate').numFmt = 'dd/mm/yyyy';
    detailSheet.getColumn('amount').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('fees').numFmt = 'R$ #,##0.00';
    detailSheet.getColumn('netAmount').numFmt = 'R$ #,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

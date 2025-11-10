import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFinancialTransactionDto } from '../dto/create-financial-transaction.dto';
import { UpdateFinancialTransactionDto } from '../dto/update-financial-transaction.dto';
import { BankAccountsService } from './bank-accounts.service';

@Injectable()
export class FinancialTransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bankAccountsService: BankAccountsService,
  ) {}

  async create(createFinancialTransactionDto: CreateFinancialTransactionDto) {
    const { amount, fees, ...data } = createFinancialTransactionDto;
    const netAmount = amount - (fees || 0);

    const transaction = await this.prisma.financialTransaction.create({
      data: {
        ...data,
        amount,
        fees: fees || 0,
        netAmount,
      },
    });

    // Atualizar saldo da conta bancária se houver
    if (data.bankAccountId) {
      await this.bankAccountsService.updateBalance(
        data.bankAccountId,
        netAmount,
        data.type as 'RECEITA' | 'DESPESA',
      );
    }

    return transaction;
  }

  async findAll(
    companyId: string,
    filters?: {
      type?: string;
      bankAccountId?: string;
      categoryId?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const where: any = { companyId };

    if (filters?.type) where.type = filters.type;
    if (filters?.bankAccountId) where.bankAccountId = filters.bankAccountId;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.startDate || filters?.endDate) {
      where.transactionDate = {};
      if (filters.startDate) where.transactionDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.transactionDate.lte = new Date(filters.endDate);
    }

    return this.prisma.financialTransaction.findMany({
      where,
      include: {
        bankAccount: true,
        category: true,
      },
      orderBy: { transactionDate: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const transaction = await this.prisma.financialTransaction.findFirst({
      where: { id, companyId },
      include: {
        bankAccount: true,
        category: true,
        accountPayable: true,
        accountReceivable: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async update(id: string, companyId: string, updateFinancialTransactionDto: UpdateFinancialTransactionDto) {
    const existingTransaction = await this.findOne(id, companyId);

    // Reverter o saldo anterior
    if (existingTransaction.bankAccountId) {
      const reverseType = existingTransaction.type === 'RECEITA' ? 'DESPESA' : 'RECEITA';
      await this.bankAccountsService.updateBalance(
        existingTransaction.bankAccountId,
        existingTransaction.netAmount,
        reverseType as 'RECEITA' | 'DESPESA',
      );
    }

    const { amount, fees, ...data } = updateFinancialTransactionDto;
    const netAmount = amount !== undefined ? amount - (fees || 0) : undefined;

    const transaction = await this.prisma.financialTransaction.update({
      where: { id },
      data: {
        ...data,
        ...(amount !== undefined && { amount }),
        ...(fees !== undefined && { fees }),
        ...(netAmount !== undefined && { netAmount }),
      },
    });

    // Aplicar novo saldo se houver
    if (transaction.bankAccountId) {
      await this.bankAccountsService.updateBalance(
        transaction.bankAccountId,
        transaction.netAmount,
        transaction.type as 'RECEITA' | 'DESPESA',
      );
    }

    return transaction;
  }

  async remove(id: string, companyId: string) {
    const transaction = await this.findOne(id, companyId);

    // Reverter o saldo
    if (transaction.bankAccountId) {
      const reverseType = transaction.type === 'RECEITA' ? 'DESPESA' : 'RECEITA';
      await this.bankAccountsService.updateBalance(
        transaction.bankAccountId,
        transaction.netAmount,
        reverseType as 'RECEITA' | 'DESPESA',
      );
    }

    return this.prisma.financialTransaction.delete({
      where: { id },
    });
  }

  async reconcile(id: string, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.financialTransaction.update({
      where: { id },
      data: {
        reconciled: true,
        reconciledAt: new Date(),
      },
    });
  }
}

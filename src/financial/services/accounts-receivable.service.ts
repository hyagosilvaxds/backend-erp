import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountReceivableDto } from '../dto/create-account-receivable.dto';
import { UpdateAccountReceivableDto } from '../dto/update-account-receivable.dto';

@Injectable()
export class AccountsReceivableService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAccountReceivableDto: CreateAccountReceivableDto) {
    const { originalAmount, discountAmount, interestAmount, fineAmount, ...data } = createAccountReceivableDto;
    
    const remainingAmount = originalAmount - (discountAmount || 0) + (interestAmount || 0) + (fineAmount || 0);

    return this.prisma.accountReceivable.create({
      data: {
        ...data,
        originalAmount,
        discountAmount: discountAmount || 0,
        interestAmount: interestAmount || 0,
        fineAmount: fineAmount || 0,
        remainingAmount,
      },
      include: {
        category: true,
        centroCusto: true,
      },
    });
  }

  async findAll(
    companyId: string,
    filters?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      categoryId?: string;
      customerId?: string;
    },
  ) {
    const where: any = { companyId };

    if (filters?.status) where.status = filters.status;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {};
      if (filters.startDate) where.dueDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.dueDate.lte = new Date(filters.endDate);
    }

    return this.prisma.accountReceivable.findMany({
      where,
      include: {
        category: true,
        centroCusto: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const account = await this.prisma.accountReceivable.findFirst({
      where: { id, companyId },
      include: {
        category: true,
        centroCusto: true,
        installments: true,
        parent: true,
        transaction: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Conta a receber não encontrada');
    }

    return account;
  }

  async update(id: string, companyId: string, updateAccountReceivableDto: UpdateAccountReceivableDto) {
    await this.findOne(id, companyId);

    const { originalAmount, discountAmount, interestAmount, fineAmount, receivedAmount, ...data } = updateAccountReceivableDto;

    let remainingAmount: number | undefined;
    if (originalAmount !== undefined || discountAmount !== undefined || interestAmount !== undefined || fineAmount !== undefined || receivedAmount !== undefined) {
      const account = await this.prisma.accountReceivable.findUnique({ where: { id } });
      remainingAmount = (originalAmount || account!.originalAmount) 
        - (discountAmount !== undefined ? discountAmount : account!.discountAmount)
        + (interestAmount !== undefined ? interestAmount : account!.interestAmount)
        + (fineAmount !== undefined ? fineAmount : account!.fineAmount)
        - (receivedAmount !== undefined ? receivedAmount : account!.receivedAmount);
    }

    return this.prisma.accountReceivable.update({
      where: { id },
      data: {
        ...data,
        ...(originalAmount !== undefined && { originalAmount }),
        ...(discountAmount !== undefined && { discountAmount }),
        ...(interestAmount !== undefined && { interestAmount }),
        ...(fineAmount !== undefined && { fineAmount }),
        ...(receivedAmount !== undefined && { receivedAmount }),
        ...(remainingAmount !== undefined && { remainingAmount }),
      },
      include: {
        category: true,
        centroCusto: true,
      },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.accountReceivable.delete({
      where: { id },
    });
  }

  async receive(id: string, companyId: string, receiptData: { amount: number; receiptDate: string; bankAccountId?: string }) {
    const account = await this.findOne(id, companyId);

    const newReceivedAmount = account.receivedAmount + receiptData.amount;
    const newRemainingAmount = account.originalAmount - newReceivedAmount + account.interestAmount + account.fineAmount - account.discountAmount;

    let status = account.status;
    if (newRemainingAmount <= 0) {
      status = 'RECEBIDO';
    } else if (newReceivedAmount > 0) {
      status = 'PARCIAL';
    }

    return this.prisma.accountReceivable.update({
      where: { id },
      data: {
        receivedAmount: newReceivedAmount,
        remainingAmount: newRemainingAmount,
        status,
        receiptDate: new Date(receiptData.receiptDate),
        bankAccountId: receiptData.bankAccountId,
      },
    });
  }

  async getOverdue(companyId: string) {
    return this.prisma.accountReceivable.findMany({
      where: {
        companyId,
        status: { in: ['PENDENTE', 'PARCIAL'] },
        dueDate: { lt: new Date() },
      },
      include: {
        category: true,
        centroCusto: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}

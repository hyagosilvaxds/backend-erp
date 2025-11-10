import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountPayableDto } from '../dto/create-account-payable.dto';
import { UpdateAccountPayableDto } from '../dto/update-account-payable.dto';

@Injectable()
export class AccountsPayableService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAccountPayableDto: CreateAccountPayableDto) {
    const { originalAmount, discountAmount, interestAmount, fineAmount, ...data } = createAccountPayableDto;
    
    const remainingAmount = originalAmount - (discountAmount || 0) + (interestAmount || 0) + (fineAmount || 0);

    return this.prisma.accountPayable.create({
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
    },
  ) {
    const where: any = { companyId };

    if (filters?.status) where.status = filters.status;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {};
      if (filters.startDate) where.dueDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.dueDate.lte = new Date(filters.endDate);
    }

    return this.prisma.accountPayable.findMany({
      where,
      include: {
        category: true,
        centroCusto: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const account = await this.prisma.accountPayable.findFirst({
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
      throw new NotFoundException('Conta a pagar não encontrada');
    }

    return account;
  }

  async update(id: string, companyId: string, updateAccountPayableDto: UpdateAccountPayableDto) {
    await this.findOne(id, companyId);

    const { originalAmount, discountAmount, interestAmount, fineAmount, paidAmount, ...data } = updateAccountPayableDto;

    let remainingAmount: number | undefined;
    if (originalAmount !== undefined || discountAmount !== undefined || interestAmount !== undefined || fineAmount !== undefined || paidAmount !== undefined) {
      const account = await this.prisma.accountPayable.findUnique({ where: { id } });
      remainingAmount = (originalAmount || account!.originalAmount) 
        - (discountAmount !== undefined ? discountAmount : account!.discountAmount)
        + (interestAmount !== undefined ? interestAmount : account!.interestAmount)
        + (fineAmount !== undefined ? fineAmount : account!.fineAmount)
        - (paidAmount !== undefined ? paidAmount : account!.paidAmount);
    }

    return this.prisma.accountPayable.update({
      where: { id },
      data: {
        ...data,
        ...(originalAmount !== undefined && { originalAmount }),
        ...(discountAmount !== undefined && { discountAmount }),
        ...(interestAmount !== undefined && { interestAmount }),
        ...(fineAmount !== undefined && { fineAmount }),
        ...(paidAmount !== undefined && { paidAmount }),
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

    return this.prisma.accountPayable.delete({
      where: { id },
    });
  }

  async pay(id: string, companyId: string, paymentData: { amount: number; paymentDate: string; bankAccountId?: string }) {
    const account = await this.findOne(id, companyId);

    const newPaidAmount = account.paidAmount + paymentData.amount;
    const newRemainingAmount = account.originalAmount - newPaidAmount + account.interestAmount + account.fineAmount - account.discountAmount;

    let status = account.status;
    if (newRemainingAmount <= 0) {
      status = 'PAGO';
    } else if (newPaidAmount > 0) {
      status = 'PARCIAL';
    }

    return this.prisma.accountPayable.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status,
        paymentDate: new Date(paymentData.paymentDate),
        bankAccountId: paymentData.bankAccountId,
      },
    });
  }

  async getOverdue(companyId: string) {
    return this.prisma.accountPayable.findMany({
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

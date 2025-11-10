import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBankAccountDto: CreateBankAccountDto) {
    const { initialBalance, ...data } = createBankAccountDto;
    
    return this.prisma.bankAccount.create({
      data: {
        ...data,
        initialBalance: initialBalance || 0,
        currentBalance: initialBalance || 0,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.bankAccount.findMany({
      where: { companyId },
      orderBy: { accountName: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id, companyId },
      include: {
        transactions: {
          take: 10,
          orderBy: { transactionDate: 'desc' },
        },
      },
    });

    if (!bankAccount) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    return bankAccount;
  }

  async update(id: string, companyId: string, updateBankAccountDto: UpdateBankAccountDto) {
    await this.findOne(id, companyId);

    return this.prisma.bankAccount.update({
      where: { id },
      data: updateBankAccountDto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.bankAccount.delete({
      where: { id },
    });
  }

  async getBalance(id: string, companyId: string) {
    const account = await this.findOne(id, companyId);
    return {
      accountId: id,
      accountName: account.accountName,
      currentBalance: account.currentBalance,
      initialBalance: account.initialBalance,
    };
  }

  async updateBalance(accountId: string, amount: number, type: 'RECEITA' | 'DESPESA') {
    const account = await this.prisma.bankAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    const newBalance = type === 'RECEITA' 
      ? account.currentBalance + amount 
      : account.currentBalance - amount;

    return this.prisma.bankAccount.update({
      where: { id: accountId },
      data: { currentBalance: newBalance },
    });
  }
}

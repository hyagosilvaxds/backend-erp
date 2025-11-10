import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BankAccountsController } from './controllers/bank-accounts.controller';
import { FinancialCategoriesController } from './controllers/financial-categories.controller';
import { FinancialTransactionsController } from './controllers/financial-transactions.controller';
import { AccountsPayableController } from './controllers/accounts-payable.controller';
import { AccountsReceivableController } from './controllers/accounts-receivable.controller';
import { FinancialReportsController } from './controllers/financial-reports.controller';
import { OFXController } from './controllers/ofx.controller';
import { FinancialPlanoContasController } from './controllers/financial-plano-contas.controller';
import { BankAccountsService } from './services/bank-accounts.service';
import { FinancialCategoriesService } from './services/financial-categories.service';
import { FinancialTransactionsService } from './services/financial-transactions.service';
import { AccountsPayableService } from './services/accounts-payable.service';
import { AccountsReceivableService } from './services/accounts-receivable.service';
import { FinancialReportsService } from './services/financial-reports.service';
import { OFXParserService } from './services/ofx-parser.service';
import { TransactionMatchingService } from './services/transaction-matching.service';
import { OFXImportService } from './services/ofx-import.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    BankAccountsController,
    FinancialCategoriesController,
    FinancialTransactionsController,
    AccountsPayableController,
    AccountsReceivableController,
    FinancialReportsController,
    OFXController,
    FinancialPlanoContasController,
  ],
  providers: [
    BankAccountsService,
    FinancialCategoriesService,
    FinancialTransactionsService,
    AccountsPayableService,
    AccountsReceivableService,
    FinancialReportsService,
    OFXParserService,
    TransactionMatchingService,
    OFXImportService,
  ],
  exports: [
    BankAccountsService,
    FinancialCategoriesService,
    FinancialTransactionsService,
    AccountsPayableService,
    AccountsReceivableService,
    FinancialReportsService,
    OFXImportService,
  ],
})
export class FinancialModule {}

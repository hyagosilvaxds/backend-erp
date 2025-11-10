import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FinancialModule } from '../financial/financial.module';
import { PaymentMethodsService } from './services/payment-methods.service';
import { SalesService } from './services/sales.service';
import { SalesPdfService } from './services/sales-pdf.service';
import { SalesExcelService } from './services/sales-excel.service';
import { PaymentMethodsController } from './controllers/payment-methods.controller';
import { SalesController } from './controllers/sales.controller';

@Module({
  imports: [PrismaModule, FinancialModule],
  controllers: [PaymentMethodsController, SalesController],
  providers: [PaymentMethodsService, SalesService, SalesPdfService, SalesExcelService],
  exports: [PaymentMethodsService, SalesService, SalesPdfService, SalesExcelService],
})
export class SalesModule {}

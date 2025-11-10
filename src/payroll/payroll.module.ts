import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TaxTablesModule } from '../tax-tables/tax-tables.module';
import { PdfService } from '../common/services/pdf.service';

@Module({
  imports: [PrismaModule, TaxTablesModule],
  controllers: [PayrollController],
  providers: [PayrollService, PdfService],
  exports: [PayrollService],
})
export class PayrollModule {}

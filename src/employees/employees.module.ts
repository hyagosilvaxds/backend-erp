import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TaxTablesModule } from '../tax-tables/tax-tables.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [PrismaModule, TaxTablesModule, DocumentsModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}

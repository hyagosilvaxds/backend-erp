import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { AuditModule } from './audit/audit.module';
import { PlanoContasModule } from './plano-contas/plano-contas.module';
import { CentroCustoModule } from './centro-custo/centro-custo.module';
import { RolesModule } from './roles/roles.module';
import { DocumentsModule } from './documents/documents.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { EmployeesModule } from './employees/employees.module';
import { EarningTypesModule } from './earning-types/earning-types.module';
import { DeductionTypesModule } from './deduction-types/deduction-types.module';
import { PayrollModule } from './payroll/payroll.module';
import { TaxTablesModule } from './tax-tables/tax-tables.module';
import { PositionsModule } from './positions/positions.module';
import { DepartmentsModule } from './departments/departments.module';
import { LegalModule } from './legal/legal.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    AuditModule,
    PlanoContasModule,
    CentroCustoModule,
    RolesModule,
    DocumentsModule,
    ProductsModule,
    CustomersModule,
    EmployeesModule,
    EarningTypesModule,
    DeductionTypesModule,
    PayrollModule,
    TaxTablesModule,
    PositionsModule,
    DepartmentsModule,
    LegalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

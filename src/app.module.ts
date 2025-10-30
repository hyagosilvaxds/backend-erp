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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TaxTablesService } from './tax-tables.service';
import { TaxTablesController } from './tax-tables.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaxTablesController],
  providers: [TaxTablesService],
  exports: [TaxTablesService],
})
export class TaxTablesModule {}

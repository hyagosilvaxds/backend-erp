import { Module } from '@nestjs/common';
import { NFeController } from './controllers/nfe.controller';
import { NFeService } from './services/nfe.service';
import { NFeGeneratorService } from './services/nfe-generator.service';
import { NFeSefazService } from './services/nfe-sefaz.service';
import { PrismaService } from '../prisma/prisma.service';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [CompaniesModule],
  controllers: [NFeController],
  providers: [
    NFeService,
    NFeGeneratorService,
    NFeSefazService,
    PrismaService,
  ],
  exports: [NFeService],
})
export class FiscalModule {}

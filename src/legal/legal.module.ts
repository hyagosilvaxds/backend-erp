import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { LegalController } from './legal.controller';
import { LegalService } from './legal.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DocumentsModule } from '../documents/documents.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    DocumentsModule,
    AuditModule,
    MulterModule.register(),
  ],
  controllers: [LegalController],
  providers: [LegalService],
  exports: [LegalService],
})
export class LegalModule {}

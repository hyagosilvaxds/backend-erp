import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { AuditModule } from '../audit/audit.module';
import { EncryptionService } from '../common/services/encryption.service';

@Module({
  imports: [AuditModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, EncryptionService],
  exports: [CompaniesService],
})
export class CompaniesModule {}

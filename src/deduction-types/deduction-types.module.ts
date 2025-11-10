import { Module } from '@nestjs/common';
import { DeductionTypesService } from './deduction-types.service';
import { DeductionTypesController } from './deduction-types.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeductionTypesController],
  providers: [DeductionTypesService],
  exports: [DeductionTypesService],
})
export class DeductionTypesModule {}

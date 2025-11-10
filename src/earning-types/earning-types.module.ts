import { Module } from '@nestjs/common';
import { EarningTypesService } from './earning-types.service';
import { EarningTypesController } from './earning-types.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EarningTypesController],
  providers: [EarningTypesService],
  exports: [EarningTypesService],
})
export class EarningTypesModule {}

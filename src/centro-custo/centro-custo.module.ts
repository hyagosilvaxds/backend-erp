import { Module } from '@nestjs/common';
import { CentroCustoService } from './centro-custo.service';
import { CentroCustoController } from './centro-custo.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CentroCustoController],
  providers: [CentroCustoService],
  exports: [CentroCustoService],
})
export class CentroCustoModule {}

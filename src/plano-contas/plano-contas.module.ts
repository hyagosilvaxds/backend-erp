import { Module } from '@nestjs/common';
import { PlanoContasService } from './plano-contas.service';
import { PlanoContasController } from './plano-contas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlanoContasController],
  providers: [PlanoContasService],
  exports: [PlanoContasService],
})
export class PlanoContasModule {}

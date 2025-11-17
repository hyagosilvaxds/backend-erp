import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NFeService } from './services/nfe.service';
import { NFeController } from './controllers/nfe.controller';

@Module({
  imports: [PrismaModule],
  controllers: [NFeController],
  providers: [NFeService],
  exports: [NFeService],
})
export class NFeModule {}

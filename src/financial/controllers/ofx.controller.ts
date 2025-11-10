import {
  Controller,
  Post,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Patch,
  Param,
  Get,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OFXImportService } from '../services/ofx-import.service';
import type { OFXTransactionDto } from '../dto/ofx-transaction.dto';
import { ListOFXImportsDto } from '../dto/list-ofx-imports.dto';

@Controller('financial/ofx')
@UseGuards(JwtAuthGuard)
export class OFXController {
  constructor(private readonly ofxImportService: OFXImportService) {}

  /**
   * Upload e importação de arquivo OFX
   * O sistema retorna sugestões de match, mas a conciliação é MANUAL
   */
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importOFX(
    @UploadedFile() file: Express.Multer.File,
    @Query('bankAccountId') bankAccountId: string,
    @Query('companyId') companyId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo OFX não fornecido');
    }

    if (!bankAccountId || !companyId) {
      throw new BadRequestException(
        'bankAccountId e companyId são obrigatórios',
      );
    }

    const ofxContent = file.buffer.toString('utf-8');

    return this.ofxImportService.importOFXFile(
      ofxContent,
      bankAccountId,
      companyId,
      file.originalname,
      file.size,
    );
  }

  /**
   * Buscar transações similares para uma transação OFX
   */
  @Post('find-similar')
  async findSimilar(
    @Body() ofxTransaction: OFXTransactionDto,
    @Query('bankAccountId') bankAccountId: string,
    @Query('companyId') companyId: string,
  ) {
    if (!bankAccountId || !companyId) {
      throw new BadRequestException(
        'bankAccountId e companyId são obrigatórios',
      );
    }

    return this.ofxImportService.findSimilarForOFXTransaction(
      ofxTransaction,
      bankAccountId,
      companyId,
    );
  }

  /**
   * Conciliar manualmente uma transação OFX com uma transação do sistema
   */
  @Patch('reconcile/:systemTransactionId')
  async manualReconcile(
    @Param('systemTransactionId') systemTransactionId: string,
    @Body('ofxFitId') ofxFitId: string,
    @Query('companyId') companyId: string,
  ) {
    if (!ofxFitId || !companyId) {
      throw new BadRequestException('ofxFitId e companyId são obrigatórios');
    }

    return this.ofxImportService.manualReconcile(
      ofxFitId,
      systemTransactionId,
      companyId,
    );
  }

  /**
   * Listar todos os extratos OFX importados
   */
  @Get('imports')
  async listImports(@Query() filters: ListOFXImportsDto) {
    if (!filters.companyId) {
      throw new BadRequestException('companyId é obrigatório');
    }

    return this.ofxImportService.listOFXImports(filters.companyId, {
      bankAccountId: filters.bankAccountId,
      startDate: filters.startDate,
      endDate: filters.endDate,
      page: filters.page,
      limit: filters.limit,
    });
  }

  /**
   * Buscar detalhes de um extrato OFX específico
   */
  @Get('imports/:id')
  async getImportById(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    if (!companyId) {
      throw new BadRequestException('companyId é obrigatório');
    }

    return this.ofxImportService.getOFXImportById(id, companyId);
  }

  /**
   * Deletar um extrato OFX importado
   */
  @Delete('imports/:id')
  async deleteImport(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    if (!companyId) {
      throw new BadRequestException('companyId é obrigatório');
    }

    return this.ofxImportService.deleteOFXImport(id, companyId);
  }
}

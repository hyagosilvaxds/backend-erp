import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InvestmentDocumentsService } from '../services/investment-documents.service';
import { UploadInvestmentDocumentDto } from '../dto/upload-investment-document.dto';
import { CompanyId } from '../../common/decorators/company-id.decorator';
import { UserId } from '../../common/decorators/user-id.decorator';
import { createReadStream } from 'fs';

@Controller('scp/investments/documents')
@UseGuards(JwtAuthGuard)
export class InvestmentDocumentsController {
  constructor(
    private readonly investmentDocumentsService: InvestmentDocumentsService,
  ) {}

  /**
   * Upload de documento para um aporte
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @CompanyId() companyId: string,
    @UserId() userId: string,
    @Body() uploadDto: UploadInvestmentDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.investmentDocumentsService.uploadDocument(
      companyId,
      userId,
      uploadDto,
      file,
    );
  }

  /**
   * Lista documentos de um aporte
   */
  @Get(':investmentId')
  async listInvestmentDocuments(
    @CompanyId() companyId: string,
    @UserId() userId: string,
    @Param('investmentId') investmentId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.investmentDocumentsService.listInvestmentDocuments(
      companyId,
      userId,
      investmentId,
      page || 1,
      limit || 20,
    );
  }

  /**
   * Download de documento
   */
  @Get(':documentId/download')
  @Header('Content-Type', 'application/octet-stream')
  async downloadDocument(
    @CompanyId() companyId: string,
    @UserId() userId: string,
    @Param('documentId') documentId: string,
  ): Promise<StreamableFile> {
    const document =
      await this.investmentDocumentsService.downloadDocument(
        companyId,
        userId,
        documentId,
      );

    const stream = createReadStream(document.filePath);
    return new StreamableFile(stream, {
      type: document.mimeType,
      disposition: `attachment; filename="${document.fileName}"`,
    });
  }

  /**
   * Deleta documento
   */
  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDocument(
    @CompanyId() companyId: string,
    @UserId() userId: string,
    @Param('documentId') documentId: string,
  ) {
    await this.investmentDocumentsService.deleteDocument(
      companyId,
      userId,
      documentId,
    );
  }
}

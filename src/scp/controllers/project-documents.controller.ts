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
  Res,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyId } from '../../common/decorators/company-id.decorator';
import { UserId } from '../../common/decorators/user-id.decorator';
import { ProjectDocumentsService } from '../services/project-documents.service';
import { UploadProjectDocumentDto } from '../dto/upload-project-document.dto';

@Controller('scp/projects/documents')
@UseGuards(JwtAuthGuard)
export class ProjectDocumentsController {
  constructor(
    private readonly projectDocumentsService: ProjectDocumentsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @CompanyId() companyId: string,
    @UserId() userId: string,
    @Body() uploadDto: UploadProjectDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.projectDocumentsService.uploadDocument(
      companyId,
      userId,
      uploadDto,
      file,
    );
  }

  @Get('project/:projectId')
  async listProjectDocuments(
    @CompanyId() companyId: string,
    @UserId() userId: string,
    @Param('projectId') projectId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.projectDocumentsService.listProjectDocuments(
      companyId,
      userId,
      projectId,
      page,
      limit,
    );
  }

  /**
   * Download documento do projeto
   */
  @Get(':documentId/download')
  async downloadDocument(
    @CompanyId() companyId: string,
    @UserId() userId: string,
    @Param('documentId') documentId: string,
    @Res({ passthrough: false }) res: Response,
  ) {
    const fileInfo = await this.projectDocumentsService.downloadDocument(
      companyId,
      userId,
      documentId,
    );

    // Configurar headers para download
    res.set({
      'Content-Type': fileInfo.mimeType,
      'Content-Disposition': `attachment; filename="${fileInfo.originalName}"`,
    });

    // Criar stream do arquivo e enviar
    const fileStream = createReadStream(fileInfo.filePath);
    fileStream.pipe(res);
  }

  @Delete(':documentId')
  async deleteDocument(
    @CompanyId() companyId: string,
    @UserId() userId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.projectDocumentsService.deleteDocument(
      companyId,
      userId,
      documentId,
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  ParseBoolPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentCompany } from '../auth/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { multerConfig } from './config/multer.config';
import * as fs from 'fs';
import * as path from 'path';

@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ==================== PASTAS ====================

  @Get('folders')
  @RequirePermissions('documents.read')
  async findAllFolders(
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
    @Query('parentId') parentId?: string,
  ) {
    // Buscar roles do usuário na empresa
    const userCompany = await this.documentsService.getUserRoles(
      user.userId,
      company.id,
    );
    return this.documentsService.findAllFolders(
      company.id,
      parentId,
      user.userId,
      userCompany?.roleIds || [],
      userCompany?.hasViewAllPermission || false,
    );
  }

  @Post('folders')
  @RequirePermissions('documents.create')
  async createFolder(
    @Body() dto: CreateFolderDto,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    return this.documentsService.createFolder(dto, company.id, user.userId);
  }

  @Patch('folders/:id')
  @RequirePermissions('documents.update')
  async updateFolder(
    @Param('id') id: string,
    @Body() dto: UpdateFolderDto,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    return this.documentsService.updateFolder(id, dto, company.id, user.userId);
  }

  @Delete('folders/:id')
  @RequirePermissions('documents.delete')
  async deleteFolder(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
    @Query('force', ParseBoolPipe) force: boolean = false,
  ) {
    return this.documentsService.deleteFolder(id, company.id, user.userId, force);
  }

  // ==================== DOCUMENTOS ====================

  @Get()
  @RequirePermissions('documents.read')
  async findDocuments(
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
    @Query() query: QueryDocumentsDto,
  ) {
    // Buscar roles do usuário na empresa
    const userCompany = await this.documentsService.getUserRoles(
      user.userId,
      company.id,
    );
    return this.documentsService.findDocuments(
      company.id,
      query,
      user.userId,
      userCompany?.roleIds || [],
      userCompany?.hasViewAllPermission || false,
    );
  }

  @Get('expired')
  @RequirePermissions('documents.read')
  async getExpiredDocuments(
    @CurrentCompany() company: { id: string },
    @Query('daysAhead') daysAhead?: number,
  ) {
    return this.documentsService.getExpiredDocuments(
      company.id,
      daysAhead ? Number(daysAhead) : 30,
    );
  }

  @Get('stats')
  @RequirePermissions('documents.read')
  async getStatistics(@CurrentCompany() company: { id: string }) {
    return this.documentsService.getStatistics(company.id);
  }

  @Get(':id')
  @RequirePermissions('documents.read')
  async findOne(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
  ) {
    return this.documentsService.findOneDocument(id, company.id);
  }

  @Post('upload')
  @RequirePermissions('documents.create')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    return this.documentsService.uploadDocument(
      file,
      dto,
      company.id,
      user.userId,
    );
  }

  @Post(':id/version')
  @RequirePermissions('documents.create')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadNewVersion(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description: string,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    return this.documentsService.uploadNewVersion(
      id,
      file,
      description,
      company.id,
      user.userId,
    );
  }

  @Get(':id/download')
  @RequirePermissions('documents.read')
  async downloadDocument(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const document = await this.documentsService.findOneDocument(
      id,
      company.id,
    );

    if (!fs.existsSync(document.filePath)) {
      throw new Error('Arquivo não encontrado no servidor');
    }

    const file = fs.createReadStream(document.filePath);
    const stat = fs.statSync(document.filePath);

    res.set({
      'Content-Type': document.mimeType,
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(document.fileName)}"`,
    });

    return new StreamableFile(file);
  }

  @Patch(':id')
  @RequirePermissions('documents.update')
  async updateDocument(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    return this.documentsService.updateDocument(id, dto, company.id, user.userId);
  }

  @Delete(':id')
  @RequirePermissions('documents.delete')
  async deleteDocument(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
    @Query('deleteAllVersions', ParseBoolPipe) deleteAllVersions: boolean = false,
  ) {
    return this.documentsService.deleteDocument(
      id,
      company.id,
      user.userId,
      deleteAllVersions,
    );
  }
}

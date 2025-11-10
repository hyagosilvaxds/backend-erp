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
  BadRequestException,
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
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
    @Query('parentId') parentId?: string,
  ) {
    // Buscar roles do usuário na empresa
    const userCompany = await this.documentsService.getUserRoles(
      user.userId,
      companyId,
    );
    return this.documentsService.findAllFolders(
      companyId,
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
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.documentsService.createFolder(dto, companyId, user.userId);
  }

  @Patch('folders/:id')
  @RequirePermissions('documents.update')
  async updateFolder(
    @Param('id') id: string,
    @Body() dto: UpdateFolderDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.documentsService.updateFolder(id, dto, companyId, user.userId);
  }

  @Delete('folders/:id')
  @RequirePermissions('documents.delete')
  async deleteFolder(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
    @Query('force', ParseBoolPipe) force: boolean = false,
  ) {
    return this.documentsService.deleteFolder(id, companyId, user.userId, force);
  }

  // ==================== DOCUMENTOS ====================

  @Get()
  @RequirePermissions('documents.read')
  async findDocuments(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
    @Query() query: QueryDocumentsDto,
  ) {
    // Buscar roles do usuário na empresa
    const userCompany = await this.documentsService.getUserRoles(
      user.userId,
      companyId,
    );
    return this.documentsService.findDocuments(
      companyId,
      query,
      user.userId,
      userCompany?.roleIds || [],
      userCompany?.hasViewAllPermission || false,
    );
  }

  @Get('expired')
  @RequirePermissions('documents.read')
  async getExpiredDocuments(
    @CurrentCompany() companyId: string,
    @Query('daysAhead') daysAhead?: number,
  ) {
    return this.documentsService.getExpiredDocuments(
      companyId,
      daysAhead ? Number(daysAhead) : 30,
    );
  }

  @Get('stats')
  @RequirePermissions('documents.read')
  async getStatistics(@CurrentCompany() companyId: string) {
    return this.documentsService.getStatistics(companyId);
  }

  @Get(':id')
  @RequirePermissions('documents.read')
  async findOne(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.documentsService.findOneDocument(id, companyId);
  }

  @Post('upload')
  @RequirePermissions('documents.create')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    if (!companyId) {
      throw new BadRequestException('CompanyId é obrigatório');
    }
    return this.documentsService.uploadDocument(
      file,
      dto,
      companyId,
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
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.documentsService.uploadNewVersion(
      id,
      file,
      description,
      companyId,
      user.userId,
    );
  }

  @Get(':id/download')
  @RequirePermissions('documents.read')
  async downloadDocument(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const document = await this.documentsService.findOneDocument(
      id,
      companyId,
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
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.documentsService.updateDocument(id, dto, companyId, user.userId);
  }

  @Delete(':id')
  @RequirePermissions('documents.delete')
  async deleteDocument(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
    @Query('deleteAllVersions', ParseBoolPipe) deleteAllVersions: boolean = false,
  ) {
    return this.documentsService.deleteDocument(
      id,
      companyId,
      user.userId,
      deleteAllVersions,
    );
  }
}

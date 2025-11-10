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
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentCompany } from '../auth/decorators/current-user.decorator';
import { LegalService } from './legal.service';
import { CreateLegalCategoryDto } from './dto/create-legal-category.dto';
import { UpdateLegalCategoryDto } from './dto/update-legal-category.dto';
import { CreateLegalDocumentDto } from './dto/create-legal-document.dto';
import { UpdateLegalDocumentDto } from './dto/update-legal-document.dto';
import { QueryLegalDocumentsDto } from './dto/query-legal-documents.dto';
import { multerConfig } from '../documents/config/multer.config';

@Controller('legal')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  // ==================== CATEGORIAS ====================

  @Post('categories')
  @RequirePermissions('legal.create')
  async createCategory(
    @Body() dto: CreateLegalCategoryDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.legalService.createCategory(companyId, user.userId, dto);
  }

  @Get('categories')
  @RequirePermissions('legal.read')
  async findAllCategories(@CurrentCompany() companyId: string) {
    return this.legalService.findAllCategories(companyId);
  }

  @Get('categories/:id')
  @RequirePermissions('legal.read')
  async findCategoryById(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.legalService.findCategoryById(id, companyId);
  }

  @Patch('categories/:id')
  @RequirePermissions('legal.update')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateLegalCategoryDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.legalService.updateCategory(id, companyId, user.userId, dto);
  }

  @Delete('categories/:id')
  @RequirePermissions('legal.delete')
  async deleteCategory(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.legalService.deleteCategory(id, companyId, user.userId);
  }

  // ==================== DOCUMENTOS JURÍDICOS ====================

  @Post('documents')
  @RequirePermissions('legal.create')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async createDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateLegalDocumentDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    return this.legalService.createDocument(companyId, user.userId, file, dto);
  }

  @Get('documents')
  @RequirePermissions('legal.read')
  async findAllDocuments(
    @CurrentCompany() companyId: string,
    @Query() query: QueryLegalDocumentsDto,
  ) {
    return this.legalService.findAllDocuments(companyId, query);
  }

  @Get('documents/statistics')
  @RequirePermissions('legal.read')
  async getStatistics(@CurrentCompany() companyId: string) {
    return this.legalService.getStatistics(companyId);
  }

  @Get('dashboard')
  @RequirePermissions('legal.read')
  async getDashboard(@CurrentCompany() companyId: string) {
    return this.legalService.getDashboard(companyId);
  }

  @Get('documents/expiring')
  @RequirePermissions('legal.read')
  async getExpiring(
    @CurrentCompany() companyId: string,
    @Query('days') days?: string,
  ) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.legalService.getExpiring(companyId, daysNumber);
  }

  @Get('documents/expired')
  @RequirePermissions('legal.read')
  async getExpired(@CurrentCompany() companyId: string) {
    return this.legalService.getExpired(companyId);
  }

  @Get('documents/by-value')
  @RequirePermissions('legal.read')
  async getByValue(
    @CurrentCompany() companyId: string,
    @Query('minValue') minValue?: string,
    @Query('maxValue') maxValue?: string,
  ) {
    const min = minValue ? parseFloat(minValue) : undefined;
    const max = maxValue ? parseFloat(maxValue) : undefined;
    return this.legalService.getByValue(companyId, min, max);
  }

  @Get('documents/timeline')
  @RequirePermissions('legal.read')
  async getTimeline(
    @CurrentCompany() companyId: string,
    @Query('year') year?: string,
  ) {
    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.legalService.getTimeline(companyId, yearNumber);
  }

  @Get('documents/:id')
  @RequirePermissions('legal.read')
  async findDocumentById(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.legalService.findDocumentById(id, companyId);
  }

  @Get('documents/:id/download')
  @RequirePermissions('legal.read')
  async downloadDocument(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.legalService.downloadDocument(id, companyId);
  }

  @Patch('documents/:id')
  @RequirePermissions('legal.update')
  async updateDocument(
    @Param('id') id: string,
    @Body() dto: UpdateLegalDocumentDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.legalService.updateDocument(id, companyId, user.userId, dto);
  }

  @Delete('documents/:id')
  @RequirePermissions('legal.delete')
  async deleteDocument(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.legalService.deleteDocument(id, companyId, user.userId);
  }
}

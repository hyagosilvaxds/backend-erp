import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UploadCertificateDto } from './dto/upload-certificate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  logoStorage,
  certificateStorage,
  imageFileFilter,
  certificateFileFilter,
  logoMaxSize,
  certificateMaxSize,
} from './multer.config';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('companies.create')
  create(@Body() createCompanyDto: CreateCompanyDto, @CurrentUser() user: any) {
    const isSuperAdmin = user.role === 'superadmin';
    return this.companiesService.create(createCompanyDto, user.userId);
  }

  // Novos endpoints exclusivos para admin (devem vir antes das rotas com :id)
  @Get('admin/all')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('companies.read')
  findAllCompanies(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.companiesService.findAllForAdmin({
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('admin/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('companies.read')
  findCompanyById(@Param('id') id: string) {
    return this.companiesService.findCompanyById(id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    const isSuperAdmin = user.role === 'superadmin';
    return this.companiesService.findAll(user.userId, isSuperAdmin);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const isSuperAdmin = user.role === 'superadmin';
    return this.companiesService.findOne(id, user.userId, isSuperAdmin);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('companies.update')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() user: any,
  ) {
    const isSuperAdmin = user.role === 'superadmin';
    return this.companiesService.update(
      id,
      updateCompanyDto,
      user.userId,
      isSuperAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('companies.delete')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const isSuperAdmin = user.role === 'superadmin';
    return this.companiesService.remove(id, user.userId, isSuperAdmin);
  }

  @Patch(':id/toggle-active')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('companies.update')
  toggleActive(@Param('id') id: string, @CurrentUser() user: any) {
    const isSuperAdmin = user.role === 'superadmin';
    return this.companiesService.toggleActive(id, user.userId, isSuperAdmin);
  }

  // Endpoints exclusivos para admin - Edição completa
  @Patch('admin/:id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('companies.update')
  updateAsAdmin(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() user: any,
  ) {
    return this.companiesService.updateCompanyAsAdmin(id, updateCompanyDto, user.userId);
  }

  // Upload de logo
  @Post('admin/:id/logo')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('companies.update')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: logoStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: logoMaxSize },
    }),
  )
  uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new Error('Nenhum arquivo foi enviado');
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.companiesService.uploadLogo(id, file, baseUrl, user.userId);
  }

  // Remover logo
  @Delete('admin/:id/logo')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('companies.update')
  removeLogo(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companiesService.removeLogo(id, user.userId);
  }

  // Upload de certificado digital A1
  @Post('admin/:id/certificate')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('companies.update')
  @UseInterceptors(
    FileInterceptor('certificate', {
      storage: certificateStorage,
      fileFilter: certificateFileFilter,
      limits: { fileSize: certificateMaxSize },
    }),
  )
  uploadCertificate(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadCertificateDto: UploadCertificateDto,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new Error('Nenhum arquivo foi enviado');
    }
    return this.companiesService.uploadCertificate(
      id,
      file,
      uploadCertificateDto.senha,
      user.userId,
    );
  }

  // Remover certificado digital
  @Delete('admin/:id/certificate')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('companies.update')
  removeCertificate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companiesService.removeCertificate(id, user.userId);
  }

  // Histórico de auditoria da empresa
  @Get('admin/:id/audit')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('companies.read')
  getAuditHistory(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
  ) {
    // Delegar para o AuditService através do CompaniesService
    return this.companiesService.getCompanyAuditHistory(id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      action,
    });
  }
}

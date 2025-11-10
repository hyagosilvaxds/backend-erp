import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ListEmployeesDto } from './dto/list-employees.dto';
import { DismissEmployeeDto } from './dto/dismiss-employee.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { AddEarningDto } from './dto/add-earning.dto';
import { UpdateEarningDto } from './dto/update-earning.dto';
import { ListEarningsDto } from './dto/list-earnings.dto';
import { AddDeductionDto } from './dto/add-deduction.dto';
import { UpdateDeductionDto } from './dto/update-deduction.dto';
import { ListDeductionsDto } from './dto/list-deductions.dto';
import { UploadEmployeeDocumentDto } from './dto/upload-document.dto';
import { UpdateEmployeeDocumentDto } from './dto/update-document.dto';
import { ListDocumentsDto } from './dto/list-documents.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  CurrentUser,
  CurrentCompany,
} from '../auth/decorators/current-user.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @RequirePermissions('employees.create')
  create(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    return this.employeesService.create(
      createEmployeeDto,
      companyId,
      user.userId,
    );
  }

  @Get()
  @RequirePermissions('employees.read')
  findAll(
    @CurrentCompany() companyId: string,
    @Query() listEmployeesDto: ListEmployeesDto,
  ) {
    return this.employeesService.findAll(listEmployeesDto, companyId);
  }

  @Get('stats')
  @RequirePermissions('employees.read')
  getStats(@CurrentCompany() companyId: string) {
    return this.employeesService.getStats(companyId);
  }

  @Get('dashboard')
  @RequirePermissions('employees.read')
  getDashboardStats(
    @CurrentCompany() companyId: string,
    @Query() dashboardStatsDto: DashboardStatsDto,
  ) {
    return this.employeesService.getDashboardStats(dashboardStatsDto, companyId);
  }

  @Get(':id')
  @RequirePermissions('employees.read')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.employeesService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('employees.update')
  update(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto, companyId);
  }

  @Delete(':id')
  @RequirePermissions('employees.delete')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.employeesService.remove(id, companyId);
  }

  @Patch(':id/toggle-active')
  @RequirePermissions('employees.update')
  toggleActive(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.employeesService.toggleActive(id, companyId);
  }

  @Patch(':id/dismiss')
  @RequirePermissions('employees.update')
  dismiss(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() dismissEmployeeDto: DismissEmployeeDto,
  ) {
    return this.employeesService.dismiss(id, dismissEmployeeDto, companyId);
  }

  // ==================== EARNINGS ====================

  @Get(':id/earnings')
  @RequirePermissions('employees.read')
  getEmployeeEarnings(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Query() filters: ListEarningsDto,
  ) {
    return this.employeesService.getEmployeeEarnings(id, companyId, filters);
  }

  @Post(':id/earnings')
  @RequirePermissions('employees.update')
  addEmployeeEarning(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() data: AddEarningDto,
  ) {
    return this.employeesService.addEmployeeEarning(id, companyId, data);
  }

  @Patch(':id/earnings/:earningId')
  @RequirePermissions('employees.update')
  updateEmployeeEarning(
    @Param('id') id: string,
    @Param('earningId') earningId: string,
    @CurrentCompany() companyId: string,
    @Body() data: UpdateEarningDto,
  ) {
    return this.employeesService.updateEmployeeEarning(id, earningId, companyId, data);
  }

  @Delete(':id/earnings/:earningId')
  @RequirePermissions('employees.update')
  removeEmployeeEarning(
    @Param('id') id: string,
    @Param('earningId') earningId: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.employeesService.removeEmployeeEarning(id, earningId, companyId);
  }

  // ==================== DEDUCTIONS ====================

  @Get(':id/deductions')
  @RequirePermissions('employees.read')
  getEmployeeDeductions(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Query() filters: ListDeductionsDto,
  ) {
    return this.employeesService.getEmployeeDeductions(id, companyId, filters);
  }

  @Post(':id/deductions')
  @RequirePermissions('employees.update')
  addEmployeeDeduction(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() data: AddDeductionDto,
  ) {
    return this.employeesService.addEmployeeDeduction(id, companyId, data);
  }

  @Patch(':id/deductions/:deductionId')
  @RequirePermissions('employees.update')
  updateEmployeeDeduction(
    @Param('id') id: string,
    @Param('deductionId') deductionId: string,
    @CurrentCompany() companyId: string,
    @Body() data: UpdateDeductionDto,
  ) {
    return this.employeesService.updateEmployeeDeduction(id, deductionId, companyId, data);
  }

  @Delete(':id/deductions/:deductionId')
  @RequirePermissions('employees.update')
  removeEmployeeDeduction(
    @Param('id') id: string,
    @Param('deductionId') deductionId: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.employeesService.removeEmployeeDeduction(id, deductionId, companyId);
  }

  // ==================== DOCUMENTS ====================

  @Get(':id/documents')
  @RequirePermissions('employees.read')
  getEmployeeDocuments(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Query() filters: ListDocumentsDto,
  ) {
    return this.employeesService.getEmployeeDocuments(id, companyId, filters);
  }

  @Post(':id/documents')
  @RequirePermissions('employees.update')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/employees',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
      },
      fileFilter: (req, file, cb) => {
        // Permitir apenas certos tipos de arquivo
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Tipo de arquivo não permitido. Apenas imagens, PDFs e documentos Word são aceitos.'), false);
        }
      },
    }),
  )
  async uploadEmployeeDocument(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadEmployeeDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    return this.employeesService.uploadEmployeeDocument(
      id,
      companyId,
      userId,
      file.path,
      {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      },
      uploadDocumentDto,
    );
  }

  @Get(':id/documents/:documentId')
  @RequirePermissions('employees.read')
  getEmployeeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.employeesService.getEmployeeDocument(id, documentId, companyId);
  }

  @Patch(':id/documents/:documentId')
  @RequirePermissions('employees.update')
  updateEmployeeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @CurrentCompany() companyId: string,
    @Body() updateDocumentDto: UpdateEmployeeDocumentDto,
  ) {
    return this.employeesService.updateEmployeeDocument(
      id,
      documentId,
      companyId,
      updateDocumentDto,
    );
  }

  @Patch(':id/documents/:documentId/verify')
  @RequirePermissions('employees.update')
  verifyEmployeeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @CurrentCompany() companyId: string,
    @Body() body: { verified: boolean; notes?: string },
  ) {
    return this.employeesService.updateEmployeeDocument(
      id,
      documentId,
      companyId,
      {
        verified: body.verified,
        notes: body.notes,
      },
    );
  }

  @Get(':id/documents/:documentId/download')
  @RequirePermissions('employees.read')
  async downloadEmployeeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @CurrentCompany() companyId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const document = await this.employeesService.getEmployeeDocument(
      id,
      documentId,
      companyId,
    );

    // Construir caminho do arquivo
    const filePath = join(process.cwd(), document.fileUrl);

    // Configurar headers
    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(document.fileName)}"`,
    });

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  @Delete(':id/documents/:documentId')
  @RequirePermissions('employees.update')
  removeEmployeeDocument(
    @Param('id') id: string,
    @Param('documentId') documentId: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.employeesService.removeEmployeeDocument(id, documentId, companyId);
  }
}

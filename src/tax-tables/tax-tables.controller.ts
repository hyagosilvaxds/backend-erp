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
} from '@nestjs/common';
import { TaxTablesService } from './tax-tables.service';
import { CreateInssTableDto } from './dto/create-inss-table.dto';
import { UpdateInssTableDto } from './dto/update-inss-table.dto';
import { CreateFgtsTableDto } from './dto/create-fgts-table.dto';
import { UpdateFgtsTableDto } from './dto/update-fgts-table.dto';
import { CreateIrrfTableDto } from './dto/create-irrf-table.dto';
import { UpdateIrrfTableDto } from './dto/update-irrf-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentCompany } from '../auth/decorators/current-user.decorator';

@Controller('tax-tables')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TaxTablesController {
  constructor(private readonly taxTablesService: TaxTablesService) {}

  // ==================== INSS ====================

  @Post('inss')
  @RequirePermissions('tax_tables.create')
  createInssTable(
    @CurrentCompany() companyId: string,
    @Body() dto: CreateInssTableDto,
  ) {
    return this.taxTablesService.createInssTable(companyId, dto);
  }

  @Get('inss')
  @RequirePermissions('tax_tables.read')
  findAllInssTables(
    @CurrentCompany() companyId: string,
    @Query('year') year?: string,
    @Query('active') active?: string,
  ) {
    return this.taxTablesService.findAllInssTables(
      companyId,
      year ? parseInt(year) : undefined,
      active ? active === 'true' : undefined,
    );
  }

  @Get('inss/:id')
  @RequirePermissions('tax_tables.read')
  findInssTable(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.taxTablesService.findInssTable(id, companyId);
  }

  @Patch('inss/:id')
  @RequirePermissions('tax_tables.update')
  updateInssTable(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() dto: UpdateInssTableDto,
  ) {
    return this.taxTablesService.updateInssTable(id, companyId, dto);
  }

  @Delete('inss/:id')
  @RequirePermissions('tax_tables.delete')
  deleteInssTable(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.taxTablesService.deleteInssTable(id, companyId);
  }

  // ==================== FGTS ====================

  @Post('fgts')
  @RequirePermissions('tax_tables.create')
  createFgtsTable(
    @CurrentCompany() companyId: string,
    @Body() dto: CreateFgtsTableDto,
  ) {
    return this.taxTablesService.createFgtsTable(companyId, dto);
  }

  @Get('fgts')
  @RequirePermissions('tax_tables.read')
  findAllFgtsTables(
    @CurrentCompany() companyId: string,
    @Query('year') year?: string,
    @Query('active') active?: string,
  ) {
    return this.taxTablesService.findAllFgtsTables(
      companyId,
      year ? parseInt(year) : undefined,
      active ? active === 'true' : undefined,
    );
  }

  @Get('fgts/:id')
  @RequirePermissions('tax_tables.read')
  findFgtsTable(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.taxTablesService.findFgtsTable(id, companyId);
  }

  @Patch('fgts/:id')
  @RequirePermissions('tax_tables.update')
  updateFgtsTable(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() dto: UpdateFgtsTableDto,
  ) {
    return this.taxTablesService.updateFgtsTable(id, companyId, dto);
  }

  @Delete('fgts/:id')
  @RequirePermissions('tax_tables.delete')
  deleteFgtsTable(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.taxTablesService.deleteFgtsTable(id, companyId);
  }

  // ==================== IRRF ====================

  @Post('irrf')
  @RequirePermissions('tax_tables.create')
  createIrrfTable(
    @CurrentCompany() companyId: string,
    @Body() dto: CreateIrrfTableDto,
  ) {
    return this.taxTablesService.createIrrfTable(companyId, dto);
  }

  @Get('irrf')
  @RequirePermissions('tax_tables.read')
  findAllIrrfTables(
    @CurrentCompany() companyId: string,
    @Query('year') year?: string,
    @Query('active') active?: string,
  ) {
    return this.taxTablesService.findAllIrrfTables(
      companyId,
      year ? parseInt(year) : undefined,
      active ? active === 'true' : undefined,
    );
  }

  @Get('irrf/:id')
  @RequirePermissions('tax_tables.read')
  findIrrfTable(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.taxTablesService.findIrrfTable(id, companyId);
  }

  @Patch('irrf/:id')
  @RequirePermissions('tax_tables.update')
  updateIrrfTable(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() dto: UpdateIrrfTableDto,
  ) {
    return this.taxTablesService.updateIrrfTable(id, companyId, dto);
  }

  @Delete('irrf/:id')
  @RequirePermissions('tax_tables.delete')
  deleteIrrfTable(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.taxTablesService.deleteIrrfTable(id, companyId);
  }
}

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
import { CentroCustoService } from './centro-custo.service';
import { CreateCentroCustoDto } from './dto/create-centro-custo.dto';
import { UpdateCentroCustoDto } from './dto/update-centro-custo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('centro-custo')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CentroCustoController {
  constructor(private readonly centroCustoService: CentroCustoService) {}

  @Post()
  @RequirePermissions('accounting.create')
  create(@Body() createDto: CreateCentroCustoDto) {
    return this.centroCustoService.create(createDto);
  }

  @Get()
  @RequirePermissions('accounting.read')
  findAll(
    @Query('companyId') companyId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('ativo') ativo?: string,
    @Query('search') search?: string,
  ) {
    return this.centroCustoService.findAll({
      companyId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      ativo: ativo !== undefined ? ativo === 'true' : undefined,
      search,
    });
  }

  @Get('company/:companyId')
  @RequirePermissions('accounting.read')
  findByCompany(@Param('companyId') companyId: string) {
    return this.centroCustoService.findByCompany(companyId);
  }

  @Get('company/:companyId/hierarquia')
  @RequirePermissions('accounting.read')
  getHierarchy(
    @Param('companyId') companyId: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.centroCustoService.getHierarchy(
      companyId,
      ativo !== undefined ? ativo === 'true' : undefined,
    );
  }

  @Get(':id')
  @RequirePermissions('accounting.read')
  findOne(@Param('id') id: string) {
    return this.centroCustoService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('accounting.update')
  update(@Param('id') id: string, @Body() updateDto: UpdateCentroCustoDto) {
    return this.centroCustoService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @RequirePermissions('accounting.update')
  toggleActive(@Param('id') id: string) {
    return this.centroCustoService.toggleActive(id);
  }

  @Delete(':id')
  @RequirePermissions('accounting.delete')
  remove(@Param('id') id: string) {
    return this.centroCustoService.remove(id);
  }
}

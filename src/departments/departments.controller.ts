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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentCompany } from '../auth/decorators/current-user.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @RequirePermissions('departments.create')
  create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.departmentsService.create(createDepartmentDto, companyId);
  }

  @Get()
  @RequirePermissions('departments.read')
  findAll(
    @CurrentCompany() companyId: string,
    @Query('active') active?: string,
  ) {
    return this.departmentsService.findAll(
      companyId,
      active ? active === 'true' : undefined,
    );
  }

  @Get(':id')
  @RequirePermissions('departments.read')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.departmentsService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('departments.update')
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto, companyId);
  }

  @Delete(':id')
  @RequirePermissions('departments.delete')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.departmentsService.remove(id, companyId);
  }
}

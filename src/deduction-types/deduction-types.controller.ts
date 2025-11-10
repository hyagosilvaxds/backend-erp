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
import { DeductionTypesService } from './deduction-types.service';
import { CreateDeductionTypeDto } from './dto/create-deduction-type.dto';
import { UpdateDeductionTypeDto } from './dto/update-deduction-type.dto';
import { ListDeductionTypesDto } from './dto/list-deduction-types.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  CurrentCompany,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';

@Controller('deduction-types')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DeductionTypesController {
  constructor(private readonly deductionTypesService: DeductionTypesService) {}

  @Post()
  @RequirePermissions('deduction_types.create')
  create(
    @Body() createDeductionTypeDto: CreateDeductionTypeDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.deductionTypesService.create(createDeductionTypeDto, companyId);
  }

  @Get()
  @RequirePermissions('deduction_types.read')
  findAll(
    @Query() listDeductionTypesDto: ListDeductionTypesDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.deductionTypesService.findAll(listDeductionTypesDto, companyId);
  }

  @Get(':id')
  @RequirePermissions('deduction_types.read')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.deductionTypesService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('deduction_types.update')
  update(
    @Param('id') id: string,
    @Body() updateDeductionTypeDto: UpdateDeductionTypeDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.deductionTypesService.update(id, updateDeductionTypeDto, companyId);
  }

  @Delete(':id')
  @RequirePermissions('deduction_types.delete')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.deductionTypesService.remove(id, companyId);
  }

  @Patch(':id/toggle-active')
  @RequirePermissions('deduction_types.update')
  toggleActive(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.deductionTypesService.toggleActive(id, companyId);
  }
}

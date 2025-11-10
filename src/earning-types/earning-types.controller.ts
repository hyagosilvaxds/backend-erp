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
import { EarningTypesService } from './earning-types.service';
import { CreateEarningTypeDto } from './dto/create-earning-type.dto';
import { UpdateEarningTypeDto } from './dto/update-earning-type.dto';
import { ListEarningTypesDto } from './dto/list-earning-types.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import {
  CurrentCompany,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';

@Controller('earning-types')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EarningTypesController {
  constructor(private readonly earningTypesService: EarningTypesService) {}

  @Post()
  @RequirePermissions('earning_types.create')
  create(
    @Body() createEarningTypeDto: CreateEarningTypeDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.earningTypesService.create(createEarningTypeDto, companyId);
  }

  @Get()
  @RequirePermissions('earning_types.read')
  findAll(
    @Query() listEarningTypesDto: ListEarningTypesDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.earningTypesService.findAll(listEarningTypesDto, companyId);
  }

  @Get(':id')
  @RequirePermissions('earning_types.read')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.earningTypesService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('earning_types.update')
  update(
    @Param('id') id: string,
    @Body() updateEarningTypeDto: UpdateEarningTypeDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.earningTypesService.update(id, updateEarningTypeDto, companyId);
  }

  @Delete(':id')
  @RequirePermissions('earning_types.delete')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.earningTypesService.remove(id, companyId);
  }

  @Patch(':id/toggle-active')
  @RequirePermissions('earning_types.update')
  toggleActive(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.earningTypesService.toggleActive(id, companyId);
  }
}

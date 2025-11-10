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
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentCompany } from '../auth/decorators/current-user.decorator';

@Controller('positions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @RequirePermissions('positions.create')
  create(
    @Body() createPositionDto: CreatePositionDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.positionsService.create(createPositionDto, companyId);
  }

  @Get()
  @RequirePermissions('positions.read')
  findAll(
    @CurrentCompany() companyId: string,
    @Query('active') active?: string,
  ) {
    return this.positionsService.findAll(
      companyId,
      active ? active === 'true' : undefined,
    );
  }

  @Get(':id')
  @RequirePermissions('positions.read')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.positionsService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('positions.update')
  update(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.positionsService.update(id, updatePositionDto, companyId);
  }

  @Delete(':id')
  @RequirePermissions('positions.delete')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.positionsService.remove(id, companyId);
  }
}

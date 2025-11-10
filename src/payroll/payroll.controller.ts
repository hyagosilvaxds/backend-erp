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
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { ListPayrollDto } from './dto/list-payroll.dto';
import { CreatePayrollItemDto } from './dto/payroll-item.dto';
import { StatsPayrollDto } from './dto/stats-payroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentCompany } from '../auth/decorators/current-user.decorator';

@Controller('payroll')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @RequirePermissions('payroll.create')
  create(
    @Body() createPayrollDto: CreatePayrollDto,
    @CurrentCompany() companyId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.payrollService.create(createPayrollDto, companyId, userId);
  }

  @Get()
  @RequirePermissions('payroll.read')
  findAll(
    @Query() listDto: ListPayrollDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.payrollService.findAll(listDto, companyId);
  }

  @Get('stats')
  @RequirePermissions('payroll.read')
  stats(
    @Query() statsDto: StatsPayrollDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.payrollService.stats(statsDto, companyId);
  }

  @Get(':id')
  @RequirePermissions('payroll.read')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.payrollService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('payroll.update')
  update(
    @Param('id') id: string,
    @Body() updatePayrollDto: UpdatePayrollDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.payrollService.update(id, updatePayrollDto, companyId);
  }

  @Delete(':id')
  @RequirePermissions('payroll.delete')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.payrollService.remove(id, companyId);
  }

  @Post(':id/calculate')
  @RequirePermissions('payroll.calculate')
  calculate(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.payrollService.calculate(id, companyId);
  }

  @Post(':id/items')
  @RequirePermissions('payroll.update')
  addOrUpdateItem(
    @Param('id') payrollId: string,
    @Body() createItemDto: CreatePayrollItemDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.payrollService.addOrUpdateItem(
      payrollId,
      createItemDto,
      companyId,
    );
  }

  @Post(':id/approve')
  @RequirePermissions('payroll.approve')
  approve(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.payrollService.approve(id, companyId, userId);
  }

  @Post(':id/pay')
  @RequirePermissions('payroll.approve')
  pay(@Param('id') id: string, @CurrentCompany() companyId: string) {
    return this.payrollService.pay(id, companyId);
  }
}

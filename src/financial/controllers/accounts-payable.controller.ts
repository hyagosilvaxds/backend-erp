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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountsPayableService } from '../services/accounts-payable.service';
import { CreateAccountPayableDto } from '../dto/create-account-payable.dto';
import { UpdateAccountPayableDto } from '../dto/update-account-payable.dto';

@Controller('financial/accounts-payable')
@UseGuards(JwtAuthGuard)
export class AccountsPayableController {
  constructor(private readonly accountsPayableService: AccountsPayableService) {}

  @Post()
  create(@Body() createAccountPayableDto: CreateAccountPayableDto) {
    return this.accountsPayableService.create(createAccountPayableDto);
  }

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.accountsPayableService.findAll(companyId, {
      status,
      startDate,
      endDate,
      categoryId,
    });
  }

  @Get('overdue')
  getOverdue(@Query('companyId') companyId: string) {
    return this.accountsPayableService.getOverdue(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.accountsPayableService.findOne(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() updateAccountPayableDto: UpdateAccountPayableDto,
  ) {
    return this.accountsPayableService.update(id, companyId, updateAccountPayableDto);
  }

  @Patch(':id/pay')
  pay(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() paymentData: { amount: number; paymentDate: string; bankAccountId?: string },
  ) {
    return this.accountsPayableService.pay(id, companyId, paymentData);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.accountsPayableService.remove(id, companyId);
  }
}

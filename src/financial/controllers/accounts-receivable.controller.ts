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
import { AccountsReceivableService } from '../services/accounts-receivable.service';
import { CreateAccountReceivableDto } from '../dto/create-account-receivable.dto';
import { UpdateAccountReceivableDto } from '../dto/update-account-receivable.dto';

@Controller('financial/accounts-receivable')
@UseGuards(JwtAuthGuard)
export class AccountsReceivableController {
  constructor(private readonly accountsReceivableService: AccountsReceivableService) {}

  @Post()
  create(@Body() createAccountReceivableDto: CreateAccountReceivableDto) {
    return this.accountsReceivableService.create(createAccountReceivableDto);
  }

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.accountsReceivableService.findAll(companyId, {
      status,
      startDate,
      endDate,
      categoryId,
      customerId,
    });
  }

  @Get('overdue')
  getOverdue(@Query('companyId') companyId: string) {
    return this.accountsReceivableService.getOverdue(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.accountsReceivableService.findOne(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() updateAccountReceivableDto: UpdateAccountReceivableDto,
  ) {
    return this.accountsReceivableService.update(id, companyId, updateAccountReceivableDto);
  }

  @Patch(':id/receive')
  receive(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() receiptData: { amount: number; receiptDate: string; bankAccountId?: string },
  ) {
    return this.accountsReceivableService.receive(id, companyId, receiptData);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.accountsReceivableService.remove(id, companyId);
  }
}

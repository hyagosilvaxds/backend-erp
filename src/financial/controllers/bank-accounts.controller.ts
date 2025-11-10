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
import { BankAccountsService } from '../services/bank-accounts.service';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dto/update-bank-account.dto';

@Controller('financial/bank-accounts')
@UseGuards(JwtAuthGuard)
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  create(@Body() createBankAccountDto: CreateBankAccountDto) {
    return this.bankAccountsService.create(createBankAccountDto);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.bankAccountsService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.bankAccountsService.findOne(id, companyId);
  }

  @Get(':id/balance')
  getBalance(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.bankAccountsService.getBalance(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ) {
    return this.bankAccountsService.update(id, companyId, updateBankAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.bankAccountsService.remove(id, companyId);
  }
}

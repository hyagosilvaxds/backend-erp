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
import { FinancialTransactionsService } from '../services/financial-transactions.service';
import { CreateFinancialTransactionDto } from '../dto/create-financial-transaction.dto';
import { UpdateFinancialTransactionDto } from '../dto/update-financial-transaction.dto';

@Controller('financial/transactions')
@UseGuards(JwtAuthGuard)
export class FinancialTransactionsController {
  constructor(private readonly financialTransactionsService: FinancialTransactionsService) {}

  @Post()
  create(@Body() createFinancialTransactionDto: CreateFinancialTransactionDto) {
    return this.financialTransactionsService.create(createFinancialTransactionDto);
  }

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('type') type?: string,
    @Query('bankAccountId') bankAccountId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialTransactionsService.findAll(companyId, {
      type,
      bankAccountId,
      categoryId,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.financialTransactionsService.findOne(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() updateFinancialTransactionDto: UpdateFinancialTransactionDto,
  ) {
    return this.financialTransactionsService.update(id, companyId, updateFinancialTransactionDto);
  }

  @Patch(':id/reconcile')
  reconcile(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.financialTransactionsService.reconcile(id, companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.financialTransactionsService.remove(id, companyId);
  }
}

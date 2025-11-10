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
import { FinancialCategoriesService } from '../services/financial-categories.service';
import { CreateFinancialCategoryDto } from '../dto/create-financial-category.dto';
import { UpdateFinancialCategoryDto } from '../dto/update-financial-category.dto';

@Controller('financial/categories')
@UseGuards(JwtAuthGuard)
export class FinancialCategoriesController {
  constructor(private readonly financialCategoriesService: FinancialCategoriesService) {}

  @Post()
  create(@Body() createFinancialCategoryDto: CreateFinancialCategoryDto) {
    return this.financialCategoriesService.create(createFinancialCategoryDto);
  }

  @Get()
  findAll(@Query('companyId') companyId: string, @Query('type') type?: string) {
    return this.financialCategoriesService.findAll(companyId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.financialCategoriesService.findOne(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() updateFinancialCategoryDto: UpdateFinancialCategoryDto,
  ) {
    return this.financialCategoriesService.update(id, companyId, updateFinancialCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.financialCategoriesService.remove(id, companyId);
  }
}

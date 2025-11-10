import { PartialType } from '@nestjs/mapped-types';
import { CreateFinancialCategoryDto } from './create-financial-category.dto';

export class UpdateFinancialCategoryDto extends PartialType(CreateFinancialCategoryDto) {}

import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export enum CategoryType {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA',
}

export class CreateFinancialCategoryDto {
  @IsString()
  companyId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CategoryType)
  type: CategoryType;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

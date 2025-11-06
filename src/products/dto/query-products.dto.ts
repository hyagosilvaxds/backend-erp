import { IsOptional, IsString, IsBoolean, IsUUID, IsInt, Min, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductType, ProductAvailability } from './create-product.dto';

export enum SortBy {
  NAME = 'name',
  SKU = 'sku',
  SALE_PRICE = 'salePrice',
  CURRENT_STOCK = 'currentStock',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryProductsDto {
  @IsString()
  @IsOptional()
  search?: string; // Busca por nome, SKU, barcode, reference

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  brandId?: string;

  @IsEnum(ProductType)
  @IsOptional()
  productType?: ProductType;

  @IsEnum(ProductAvailability)
  @IsOptional()
  availability?: ProductAvailability;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  active?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  lowStock?: boolean; // Produtos com estoque abaixo do mínimo

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;

  @IsEnum(SortBy)
  @IsOptional()
  sortBy?: SortBy = SortBy.CREATED_AT;

  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}

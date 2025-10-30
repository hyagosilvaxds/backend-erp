import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsInt,
  IsEnum,
  IsArray,
  MinLength,
  MaxLength,
  Min,
  IsDecimal,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum ProductType {
  SIMPLE = 'SIMPLE',
  COMPOSITE = 'COMPOSITE',
  VARIABLE = 'VARIABLE',
  COMBO = 'COMBO',
}

export enum ProductAvailability {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PRE_ORDER = 'PRE_ORDER',
  DISCONTINUED = 'DISCONTINUED',
}

export enum DimensionType {
  UNITS = 'UNITS',
  CM = 'CM',
  M = 'M',
  IN = 'IN',
  FT = 'FT',
}

export class CreateProductDto {
  // Informações básicas
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  sku?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  barcode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  reference?: string;

  // Categoria e classificação
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  brandId?: string;

  // Preços e valores
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  costPrice: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  profitMargin?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  salePrice: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  salePriceInstallment?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  minSalePrice?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  wholesalePrice?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : null))
  minWholesaleQty?: number;

  // Estoque
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  manageStock?: boolean;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  initialStock?: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  minStock?: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  maxStock?: number;

  // Unidade
  @IsUUID()
  @IsOptional()
  unitId?: string;

  // Dimensões e peso
  @IsEnum(DimensionType)
  @IsOptional()
  dimensionType?: DimensionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  width?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  height?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  length?: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  weight?: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  grossWeight?: number;

  // Validade e garantia
  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : null))
  expiryAlertDays?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : null))
  warrantyPeriod?: number;

  // Tipo de produto
  @IsEnum(ProductType)
  @IsOptional()
  productType?: ProductType;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isComposite?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasVariations?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isCombo?: boolean;

  // Status e disponibilidade
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  active?: boolean;

  @IsEnum(ProductAvailability)
  @IsOptional()
  availability?: ProductAvailability;

  // Observações
  @IsString()
  @IsOptional()
  @MaxLength(10000)
  notes?: string;

  // Informações fiscais
  @IsString()
  @IsOptional()
  @MaxLength(8)
  ncm?: string;

  @IsString()
  @IsOptional()
  @MaxLength(7)
  cest?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1)
  origin?: string;

  // ICMS
  @IsString()
  @IsOptional()
  @MaxLength(3)
  icmsCst?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  icmsRate?: number;

  @IsString()
  @IsOptional()
  @MaxLength(1)
  icmsModBc?: string;

  // IPI
  @IsString()
  @IsOptional()
  @MaxLength(2)
  ipiCst?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  ipiRate?: number;

  // PIS
  @IsString()
  @IsOptional()
  @MaxLength(2)
  pisCst?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  pisRate?: number;

  // COFINS
  @IsString()
  @IsOptional()
  @MaxLength(2)
  cofinsCst?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  cofinsRate?: number;
}

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

// DTO para estoque inicial por local
export class InitialStockByLocationDto {
  @IsUUID()
  locationId: string; // ID do local

  @IsNumber()
  @Min(0)
  quantity: number; // Quantidade no local
}

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
  STANDARD = 'STANDARD', // Padrão da empresa
  DETAILED = 'DETAILED', // Dimensões detalhadas
  UNITS = 'UNITS',
  CM = 'CM',
  M = 'M',
  IN = 'IN',
  FT = 'FT',
}

export enum TipoItemSped {
  MERCADORIA_REVENDA = '00', // Mercadoria para Revenda
  MATERIA_PRIMA = '01', // Matéria-Prima
  EMBALAGEM = '02', // Embalagem
  PRODUTO_PROCESSO = '03', // Produto em Processo
  PRODUTO_ACABADO = '04', // Produto Acabado
  SUBPRODUTO = '05', // Subproduto
  PRODUTO_INTERMEDIARIO = '06', // Produto Intermediário
  MATERIAL_USO_CONSUMO = '07', // Material de Uso e Consumo
  ATIVO_IMOBILIZADO = '08', // Ativo Imobilizado
  SERVICOS = '09', // Serviços
  OUTROS_INSUMOS = '10', // Outros Insumos
  OUTRAS = '99', // Outras
}

export enum TipoProduto {
  PRODUTO = 'PRODUTO', // Produto (usa ICMS, IPI, PIS, COFINS)
  SERVICO = 'SERVICO', // Serviço (usa ISS ao invés de ICMS)
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
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  salePriceCash?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  salePriceInstallment?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  minPrice?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
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

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => InitialStockByLocationDto)
  initialStockByLocations?: InitialStockByLocationDto[]; // Array de estoques por local

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

  // Alias para productType (aceita 'type' no payload)
  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

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

  // CFOP - Código Fiscal de Operações e Prestações
  @IsString()
  @IsOptional()
  @MaxLength(4)
  cfopEstadual?: string; // CFOP para vendas dentro do estado

  @IsString()
  @IsOptional()
  @MaxLength(4)
  cfopInterestadual?: string; // CFOP para vendas fora do estado

  @IsString()
  @IsOptional()
  @MaxLength(4)
  cfopEntradaEstadual?: string; // CFOP para compras dentro do estado

  @IsString()
  @IsOptional()
  @MaxLength(4)
  cfopEntradaInterestadual?: string; // CFOP para compras fora do estado

  // Tipo do Item SPED
  @IsEnum(TipoItemSped)
  @IsOptional()
  tipoItemSped?: TipoItemSped;

  // Tipo do Produto (Produto ou Serviço)
  @IsEnum(TipoProduto)
  @IsOptional()
  tipoProduto?: TipoProduto;

  // ISS (para serviços) - usado quando tipoProduto = 'SERVICO'
  @IsString()
  @IsOptional()
  @MaxLength(20)
  codigoServico?: string; // Código do serviço municipal

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  issRate?: number; // Alíquota do ISS (%)

  @IsString()
  @IsOptional()
  @MaxLength(20)
  itemListaServico?: string; // Item da lista de serviços LC 116/2003
}

import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested, IsDateString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { transformToISODate } from '../../common/transformers/date.transformer';

export enum SaleStatusDto {
  QUOTE = 'QUOTE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  CONFIRMED = 'CONFIRMED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  READY_TO_SHIP = 'READY_TO_SHIP',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
}

export class DeliveryAddressDto {
  @IsString()
  street: string;

  @IsString()
  number: string;

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  neighborhood: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;
}

export class CreateSaleItemDto {
  @IsString()
  productId: string;

  @IsString()
  @IsOptional()
  stockLocationId?: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateSaleDto {
  @IsString()
  customerId: string;

  @IsEnum(SaleStatusDto)
  @IsOptional()
  status?: SaleStatusDto;

  @IsString()
  @IsOptional()
  paymentMethodId?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  installments?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountPercent?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  shippingCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  otherCharges?: number;

  @IsString()
  @IsOptional()
  otherChargesDesc?: string;

  @IsBoolean()
  @IsOptional()
  useCustomerAddress?: boolean;

  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  @IsOptional()
  deliveryAddress?: DeliveryAddressDto;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  internalNotes?: string;

  @Transform(transformToISODate)
  @IsOptional()
  validUntil?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}

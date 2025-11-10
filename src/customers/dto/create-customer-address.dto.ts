import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export class CreateCustomerAddressDto {
  @IsEnum(['BILLING', 'SHIPPING', 'MAIN', 'OTHER'])
  type: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsString()
  zipCode: string;

  @IsString()
  street: string;

  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsString()
  neighborhood: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

import { IsString, IsOptional, IsBoolean, IsEnum, IsEmail } from 'class-validator';

export class CreateCustomerContactDto {
  @IsEnum(['MAIN', 'FINANCIAL', 'COMMERCIAL', 'OTHER'])
  type: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

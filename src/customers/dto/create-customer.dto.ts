import { IsString, IsOptional, IsEmail, IsEnum, IsBoolean, IsDecimal, IsDateString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCustomerAddressDto } from './create-customer-address.dto';
import { CreateCustomerContactDto } from './create-customer-contact.dto';

export class CreateCustomerDto {
  @IsEnum(['FISICA', 'JURIDICA'])
  personType: string;

  // ==================== PESSOA FÍSICA ====================
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @IsString()
  rgIssuer?: string;

  @IsOptional()
  @IsString()
  rgState?: string;

  @IsOptional()
  @Type(() => Date)
  birthDate?: Date;

  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender?: string;

  @IsOptional()
  @IsEnum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER'])
  maritalStatus?: string;

  @IsOptional()
  @IsString()
  motherName?: string;

  @IsOptional()
  @IsString()
  profession?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  // ==================== PESSOA JURÍDICA ====================
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  tradeName?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  stateRegistration?: string;

  @IsOptional()
  @IsBoolean()
  stateRegistrationExempt?: boolean;

  @IsOptional()
  @IsString()
  municipalRegistration?: string;

  @IsOptional()
  @IsString()
  cnae?: string;

  @IsOptional()
  @IsEnum(['SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL', 'MEI'])
  taxRegime?: string;

  @IsOptional()
  @IsString()
  responsibleName?: string;

  @IsOptional()
  @IsString()
  responsibleCpf?: string;

  @IsOptional()
  @IsEmail()
  responsibleEmail?: string;

  @IsOptional()
  @IsString()
  responsiblePhone?: string;

  // ==================== INFORMAÇÕES GERAIS ====================
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
  website?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  creditLimit?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  // ==================== ENDEREÇOS E CONTATOS ====================
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerAddressDto)
  addresses?: CreateCustomerAddressDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerContactDto)
  contacts?: CreateCustomerContactDto[];
}

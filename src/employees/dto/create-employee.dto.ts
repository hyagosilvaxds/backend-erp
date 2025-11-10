import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { WorkSchedule } from '../types/work-schedule.types';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
  OTHER = 'OTHER',
}

export enum ContractType {
  CLT = 'CLT',
  PJ = 'PJ',
  ESTAGIO = 'ESTAGIO',
  TEMPORARIO = 'TEMPORARIO',
  AUTONOMO = 'AUTONOMO',
}

export enum AccountType {
  CORRENTE = 'CORRENTE',
  POUPANCA = 'POUPANCA',
}

export class CreateEmployeeDto {
  @IsOptional()
  @IsUUID()
  costCenterId?: string;

  // Dados Pessoais
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  cpf: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @Type(() => Date)
  birthDate?: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  // Dados de Contato
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  // Endereço
  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  // Dados Profissionais
  @IsOptional()
  @IsUUID()
  positionId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsNotEmpty()
  @Type(() => Date)
  admissionDate: Date;

  @IsOptional()
  @Type(() => Date)
  dismissalDate?: Date;

  // Dados Contratuais
  @IsNotEmpty()
  @IsEnum(ContractType)
  contractType: ContractType;

  @IsOptional()
  @IsObject()
  workSchedule?: WorkSchedule;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  salary: number;

  // Dados de Empresa (para PJ)
  @IsOptional()
  @IsString()
  companyDocument?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyTradeName?: string;

  @IsOptional()
  @IsString()
  companyStateRegistration?: string;

  @IsOptional()
  @IsString()
  companyMunicipalRegistration?: string;

  @IsOptional()
  @IsString()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  companyPhone?: string;

  @IsOptional()
  @IsString()
  companyZipCode?: string;

  @IsOptional()
  @IsString()
  companyStreet?: string;

  @IsOptional()
  @IsString()
  companyNumber?: string;

  @IsOptional()
  @IsString()
  companyComplement?: string;

  @IsOptional()
  @IsString()
  companyNeighborhood?: string;

  @IsOptional()
  @IsString()
  companyCity?: string;

  @IsOptional()
  @IsString()
  companyState?: string;

  // Dados Bancários
  @IsOptional()
  @IsString()
  bankCode?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  agency?: string;

  @IsOptional()
  @IsString()
  account?: string;

  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @IsOptional()
  @IsString()
  pixKey?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

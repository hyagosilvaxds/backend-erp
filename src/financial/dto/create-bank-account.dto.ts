import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';

export enum AccountType {
  CORRENTE = 'CORRENTE',
  POUPANCA = 'POUPANCA',
  SALARIO = 'SALARIO',
}

export class CreateBankAccountDto {
  @IsString()
  companyId: string;

  @IsString()
  bankName: string;

  @IsString()
  bankCode: string;

  @IsString()
  agencyNumber: string;

  @IsOptional()
  @IsString()
  agencyDigit?: string;

  @IsString()
  accountNumber: string;

  @IsOptional()
  @IsString()
  accountDigit?: string;

  @IsEnum(AccountType)
  accountType: AccountType;

  @IsString()
  accountName: string;

  @IsOptional()
  @IsString()
  pixKey?: string;

  @IsOptional()
  @IsNumber()
  initialBalance?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  isMainAccount?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

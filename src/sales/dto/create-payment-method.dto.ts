import { IsString, IsBoolean, IsNumber, IsOptional, IsEnum, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInstallmentTemplateDto } from './installment-template.dto';

export enum PaymentMethodTypeDto {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  BANK_SLIP = 'BANK_SLIP',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  OTHER = 'OTHER',
}

export class CreatePaymentMethodDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsEnum(PaymentMethodTypeDto)
  type: PaymentMethodTypeDto;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsBoolean()
  @IsOptional()
  allowInstallments?: boolean;

  @IsNumber()
  @Min(1)
  @Max(48)
  @IsOptional()
  maxInstallments?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  installmentFee?: number;

  @IsBoolean()
  @IsOptional()
  requiresCreditAnalysis?: boolean;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  minCreditScore?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  daysToReceive?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  transactionFee?: number;

  // Templates de parcelas personalizadas
  // Ex: Boleto 7/21 = [{installmentNumber: 1, daysToPayment: 7, percentageOfTotal: 50}, {installmentNumber: 2, daysToPayment: 21, percentageOfTotal: 50}]
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInstallmentTemplateDto)
  @IsOptional()
  installmentTemplates?: CreateInstallmentTemplateDto[];
}

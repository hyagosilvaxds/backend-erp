import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToISODate } from '../../common/transformers/date.transformer';

export enum InvestmentStatus {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
}

export enum PaymentMethod {
  DINHEIRO = 'DINHEIRO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  PIX = 'PIX',
  TED = 'TED',
  DOC = 'DOC',
  BOLETO = 'BOLETO',
}

export class CreateInvestmentDto {
  @IsString()
  projectId: string;

  @IsString()
  investorId: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  @Transform(transformToISODate)
  investmentDate: string;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  documentNumber?: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  bankAccountId?: string;

  @IsEnum(InvestmentStatus)
  @IsOptional()
  status?: InvestmentStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}

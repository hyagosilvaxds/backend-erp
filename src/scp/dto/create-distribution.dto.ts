import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, IsArray, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToISODate } from '../../common/transformers/date.transformer';
import { PaymentMethod } from './create-investment.dto';

export enum DistributionStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  CANCELADO = 'CANCELADO',
}

export class CreateDistributionDto {
  @IsString()
  projectId: string;

  @IsString()
  investorId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(0)
  percentage: number;

  @IsNumber()
  @Min(0)
  baseValue: number;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsDateString()
  @Transform(transformToISODate)
  distributionDate: string;

  @IsDateString()
  @Transform(transformToISODate)
  competenceDate: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsDateString()
  @IsOptional()
  @Transform(transformToISODate)
  paymentDate?: string;

  @IsString()
  @IsOptional()
  bankAccountId?: string;

  @IsEnum(DistributionStatus)
  @IsOptional()
  status?: DistributionStatus;

  @IsNumber()
  @Min(0)
  @IsOptional()
  irrf?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  otherDeductions?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}

import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, IsArray, Min, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { transformToISODate } from '../../common/transformers/date.transformer';
import { PaymentMethod } from './create-investment.dto';
import { DistributionStatus } from './create-distribution.dto';

/**
 * DTO para criar uma distribuição individual dentro de um lote
 */
export class BulkDistributionItemDto {
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
  @IsOptional()
  irrf?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  otherDeductions?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO para criar distribuições para múltiplos investidores
 */
export class CreateBulkDistributionDto {
  @IsString()
  projectId: string;

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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkDistributionItemDto)
  distributions: BulkDistributionItemDto[];
}

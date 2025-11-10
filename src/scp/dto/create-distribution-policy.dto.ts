import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToISODate } from '../../common/transformers/date.transformer';

export enum PolicyType {
  PROPORCIONAL = 'PROPORCIONAL',
  FIXO = 'FIXO',
  PERSONALIZADO = 'PERSONALIZADO',
}

export class CreateDistributionPolicyDto {
  @IsString()
  projectId: string;

  @IsString()
  investorId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsEnum(PolicyType)
  @IsOptional()
  type?: PolicyType;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsDateString()
  @Transform(transformToISODate)
  startDate: string;

  @IsDateString()
  @IsOptional()
  @Transform(transformToISODate)
  endDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

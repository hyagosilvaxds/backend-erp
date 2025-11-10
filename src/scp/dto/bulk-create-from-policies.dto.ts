import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToISODate } from '../../common/transformers/date.transformer';

export class BulkCreateFromPoliciesDto {
  @IsString()
  projectId: string;

  @IsNumber()
  @Min(0)
  baseValue: number;

  @IsDateString()
  @Transform(transformToISODate)
  competenceDate: string;

  @IsDateString()
  @Transform(transformToISODate)
  distributionDate: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  irrf?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  otherDeductions?: number;
}

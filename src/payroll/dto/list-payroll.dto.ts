import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListPayrollDto {
  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'CALCULATED', 'APPROVED', 'PAID'])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['MONTHLY', 'DAILY', 'WEEKLY', 'ADVANCE'])
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  referenceMonth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  referenceYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}

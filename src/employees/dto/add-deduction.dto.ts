import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString, Min } from 'class-validator';

export class AddDeductionDto {
  @IsString()
  deductionTypeId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  percentage?: number;

  @IsOptional()
  @IsBoolean()
  isRecurrent?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

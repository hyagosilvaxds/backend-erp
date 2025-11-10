import { IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class IrrfRangeDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  minValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxValue?: number; // null = sem limite superior

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number; // Alíquota

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  deduction: number; // Dedução da faixa
}

export class CreateIrrfTableDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  dependentDeduction: number; // Dedução por dependente

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IrrfRangeDto)
  ranges: IrrfRangeDto[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

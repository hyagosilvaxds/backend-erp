import { IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class InssRangeDto {
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
  employeeRate: number; // Alíquota do empregado

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  employerRate: number; // Alíquota patronal

  @IsOptional()
  @IsNumber()
  @Min(0)
  deduction?: number; // Dedução da faixa (para cálculo progressivo)
}

export class CreateInssTableDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InssRangeDto)
  ranges: InssRangeDto[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

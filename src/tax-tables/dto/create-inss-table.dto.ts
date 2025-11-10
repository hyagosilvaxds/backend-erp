import { IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// DTO para a estrutura enviada pelo frontend (brackets com upTo)
export class InssBracketDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  upTo?: number; // Valor máximo da faixa (null = sem limite superior)

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

// DTO interno usado pelo backend (ranges com minValue/maxValue)
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
  // Aceita tanto referenceYear quanto year
  @IsOptional()
  @IsNumber()
  @Min(2000)
  @Max(2100)
  @Transform(({ obj }) => obj.referenceYear || obj.year)
  year?: number;

  @IsOptional()
  @IsNumber()
  @Min(2000)
  @Max(2100)
  referenceYear?: number;

  // Aceita tanto brackets quanto ranges
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InssBracketDto)
  brackets?: InssBracketDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InssRangeDto)
  ranges?: InssRangeDto[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

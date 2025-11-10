import { IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FgtsRateDto {
  @IsNotEmpty()
  @IsString()
  category: string; // CLT, MENOR_APRENDIZ, etc

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  monthlyRate: number; // Alíquota mensal (normalmente 8%)

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  terminationRate: number; // Alíquota rescisão (normalmente 40% ou 50%)

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateFgtsTableDto {
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
  @Type(() => FgtsRateDto)
  rates: FgtsRateDto[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

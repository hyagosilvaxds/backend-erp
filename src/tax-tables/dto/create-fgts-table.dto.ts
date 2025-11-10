import { IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FgtsRateDto {
  @IsNotEmpty()
  @IsString()
  positionId: string; // ID do cargo

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
}

export class CreateFgtsTableDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FgtsRateDto)
  rates: FgtsRateDto[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

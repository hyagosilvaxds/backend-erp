import { IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ListDeductionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number; // Mês (1-12)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year?: number; // Ano

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean; // Filtrar apenas ativos ou inativos

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isRecurrent?: boolean; // Filtrar apenas recorrentes ou não recorrentes
}

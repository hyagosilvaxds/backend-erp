import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeductionTypeDto {
  @IsNotEmpty({ message: 'Código é obrigatório' })
  @IsString({ message: 'Código deve ser uma string' })
  @MinLength(1, { message: 'Código deve ter pelo menos 1 caractere' })
  @MaxLength(20, { message: 'Código deve ter no máximo 20 caracteres' })
  code: string;

  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isRecurrent deve ser um booleano' })
  @Type(() => Boolean)
  isRecurrent?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'isPercentage deve ser um booleano' })
  @Type(() => Boolean)
  isPercentage?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Valor base deve ser um número' })
  @Min(0, { message: 'Valor base deve ser maior ou igual a zero' })
  @Type(() => Number)
  baseValue?: number;
}

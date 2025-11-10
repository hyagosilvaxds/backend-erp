import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class CreateStockLocationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string; // Nome do local (ex: "Depósito Central", "Loja Shopping")

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string; // Código único (ex: "DEP-01", "LOJA-01")

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string; // Descrição do local

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string; // Endereço do local

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean; // Local padrão para novas movimentações

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

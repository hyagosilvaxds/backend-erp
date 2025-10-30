import { IsString, IsOptional, IsBoolean, IsInt, IsEmail } from 'class-validator';

export class CreateCentroCustoDto {
  @IsString()
  companyId: string;

  @IsString()
  codigo: string;

  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  centroCustoPaiId?: string;

  @IsInt()
  nivel: number;

  @IsOptional()
  @IsString()
  responsavel?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

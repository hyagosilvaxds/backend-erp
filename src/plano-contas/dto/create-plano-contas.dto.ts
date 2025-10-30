import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum TipoPlanoContas {
  GERENCIAL = 'Gerencial',
  FISCAL = 'Fiscal',
  CONTABIL = 'Contabil',
}

export class CreatePlanoContasDto {
  @IsOptional()
  @IsString()
  companyId?: string; // Null para planos padrão do sistema

  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsEnum(TipoPlanoContas)
  tipo?: TipoPlanoContas;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsBoolean()
  padrao?: boolean;
}

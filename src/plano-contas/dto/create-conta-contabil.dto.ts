import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, Min } from 'class-validator';

export enum TipoConta {
  ATIVO = 'Ativo',
  PASSIVO = 'Passivo',
  RECEITA = 'Receita',
  DESPESA = 'Despesa',
  PATRIMONIO_LIQUIDO = 'Patrimônio Líquido',
}

export enum NaturezaConta {
  DEVEDORA = 'Devedora',
  CREDORA = 'Credora',
}

export class CreateContaContabilDto {
  @IsString()
  planoContasId: string;

  @IsString()
  codigo: string;

  @IsString()
  nome: string;

  @IsEnum(TipoConta)
  tipo: TipoConta;

  @IsEnum(NaturezaConta)
  natureza: NaturezaConta;

  @IsInt()
  @Min(1)
  nivel: number;

  @IsOptional()
  @IsString()
  contaPaiId?: string;

  @IsOptional()
  @IsBoolean()
  aceitaLancamento?: boolean;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateNFeFromSaleDto {
  @IsString()
  saleId: string;

  @IsString()
  serie: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsString()
  naturezaOperacao: string;

  @IsOptional()
  @IsInt()
  tipoOperacao?: number;

  @IsOptional()
  @IsInt()
  finalidade?: number;

  @IsOptional()
  @IsInt()
  modalidadeFrete?: number;

  @IsOptional()
  @IsString()
  informacoesComplementares?: string;

  @IsOptional()
  @IsString()
  informacoesFisco?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

import { IsString, IsNumber, IsOptional, IsBoolean, IsDateString, IsArray, ValidateNested, Min, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNFeItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsString()
  codigoProduto: string;

  @IsOptional()
  @IsString()
  codigoEAN?: string;

  @IsString()
  descricao: string;

  @IsString()
  ncm: string;

  @IsOptional()
  @IsString()
  cest?: string;

  @IsString()
  cfop: string;

  @IsString()
  unidade: string;

  @IsNumber()
  @Min(0)
  quantidade: number;

  @IsNumber()
  @Min(0)
  valorUnitario: number;

  @IsNumber()
  @Min(0)
  valorTotal: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorDesconto?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorFrete?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorSeguro?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorOutrasDespesas?: number;

  // Tributos - ICMS
  @IsOptional()
  @IsString()
  icmsCst?: string;

  @IsOptional()
  @IsInt()
  icmsOrigem?: number;

  @IsOptional()
  @IsInt()
  icmsModalidade?: number;

  @IsOptional()
  @IsNumber()
  icmsAliquota?: number;

  @IsOptional()
  @IsNumber()
  icmsBase?: number;

  @IsOptional()
  @IsNumber()
  icmsValor?: number;

  // ICMS ST
  @IsOptional()
  @IsNumber()
  icmsStBase?: number;

  @IsOptional()
  @IsNumber()
  icmsStAliquota?: number;

  @IsOptional()
  @IsNumber()
  icmsStValor?: number;

  // IPI
  @IsOptional()
  @IsString()
  ipiCst?: string;

  @IsOptional()
  @IsNumber()
  ipiAliquota?: number;

  @IsOptional()
  @IsNumber()
  ipiBase?: number;

  @IsOptional()
  @IsNumber()
  ipiValor?: number;

  // PIS
  @IsOptional()
  @IsString()
  pisCst?: string;

  @IsOptional()
  @IsNumber()
  pisAliquota?: number;

  @IsOptional()
  @IsNumber()
  pisBase?: number;

  @IsOptional()
  @IsNumber()
  pisValor?: number;

  @IsOptional()
  @IsNumber()
  pisQuantidade?: number;

  @IsOptional()
  @IsNumber()
  pisAliqValor?: number;

  // COFINS
  @IsOptional()
  @IsString()
  cofinsCst?: string;

  @IsOptional()
  @IsNumber()
  cofinsAliquota?: number;

  @IsOptional()
  @IsNumber()
  cofinsBase?: number;

  @IsOptional()
  @IsNumber()
  cofinsValor?: number;

  @IsOptional()
  @IsNumber()
  cofinsQuantidade?: number;

  @IsOptional()
  @IsNumber()
  cofinsAliqValor?: number;

  @IsOptional()
  @IsString()
  informacoesAdicionais?: string;
}

export class CreateNFeDto {
  @IsOptional()
  @IsString()
  saleId?: string;

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

  // Destinatário
  @IsOptional()
  @IsString()
  destinatarioId?: string;

  @IsString()
  destinatarioNome: string;

  @IsString()
  destinatarioCnpjCpf: string;

  @IsOptional()
  @IsString()
  destinatarioIe?: string;

  @IsOptional()
  @IsString()
  destinatarioEmail?: string;

  @IsOptional()
  @IsString()
  destinatarioTelefone?: string;

  // Endereço
  @IsString()
  destLogradouro: string;

  @IsString()
  destNumero: string;

  @IsOptional()
  @IsString()
  destComplemento?: string;

  @IsString()
  destBairro: string;

  @IsString()
  destCidade: string;

  @IsString()
  destEstado: string;

  @IsString()
  destCep: string;

  @IsOptional()
  @IsString()
  destPais?: string;

  @IsOptional()
  @IsString()
  destCodigoMunicipio?: string;

  // Valores
  @IsNumber()
  @Min(0)
  valorProdutos: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorFrete?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorSeguro?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorDesconto?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorOutrasDespesas?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorIPI?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorICMS?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorICMSST?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorPIS?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorCOFINS?: number;

  @IsNumber()
  @Min(0)
  valorTotal: number;

  // Tributos aproximados
  @IsOptional()
  @IsNumber()
  valorTributosFederais?: number;

  @IsOptional()
  @IsNumber()
  valorTributosEstaduais?: number;

  @IsOptional()
  @IsNumber()
  valorTributosMunicipais?: number;

  @IsOptional()
  @IsNumber()
  valorTributosTotal?: number;

  // Frete
  @IsOptional()
  @IsInt()
  modalidadeFrete?: number;

  @IsOptional()
  @IsString()
  transportadoraNome?: string;

  @IsOptional()
  @IsString()
  transportadoraCnpjCpf?: string;

  @IsOptional()
  @IsString()
  veiculoPlaca?: string;

  @IsOptional()
  @IsString()
  veiculoUF?: string;

  // Volumes
  @IsOptional()
  @IsNumber()
  volumeQuantidade?: number;

  @IsOptional()
  @IsString()
  volumeEspecie?: string;

  @IsOptional()
  @IsString()
  volumeMarca?: string;

  @IsOptional()
  @IsString()
  volumeNumeracao?: string;

  @IsOptional()
  @IsNumber()
  volumePesoLiquido?: number;

  @IsOptional()
  @IsNumber()
  volumePesoBruto?: number;

  // Pagamento
  @IsOptional()
  @IsInt()
  indicadorPagamento?: number; // 0=À vista, 1=A prazo

  @IsOptional()
  @IsString()
  meioPagamento?: string; // Código SEFAZ de pagamento (será preenchido automaticamente da forma de pagamento)

  @IsOptional()
  @IsNumber()
  valorPagamento?: number;

  @IsOptional()
  @IsNumber()
  valorTroco?: number;

  // Informações adicionais
  @IsOptional()
  @IsString()
  informacoesComplementares?: string;

  @IsOptional()
  @IsString()
  informacoesFisco?: string;

  // Datas
  @IsOptional()
  @IsDateString()
  dataEmissao?: string;

  @IsOptional()
  @IsDateString()
  dataSaida?: string;

  // Observações
  @IsOptional()
  @IsString()
  observacoes?: string;

  // Itens da NFe
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNFeItemDto)
  items: CreateNFeItemDto[];
}

import { IsString, IsBoolean, IsNumber, IsOptional, IsEnum, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInstallmentTemplateDto } from './installment-template.dto';

// Códigos de Pagamento SEFAZ (Tabela 4.3.3.4.6.1)
export enum PaymentCodeSefazDto {
  DINHEIRO = 'DINHEIRO', // 01
  CHEQUE = 'CHEQUE', // 02
  CARTAO_CREDITO = 'CARTAO_CREDITO', // 03
  CARTAO_DEBITO = 'CARTAO_DEBITO', // 04
  CREDITO_LOJA = 'CREDITO_LOJA', // 05
  VALE_ALIMENTACAO = 'VALE_ALIMENTACAO', // 10
  VALE_REFEICAO = 'VALE_REFEICAO', // 11
  VALE_PRESENTE = 'VALE_PRESENTE', // 12
  VALE_COMBUSTIVEL = 'VALE_COMBUSTIVEL', // 13
  DUPLICATA_MERCANTIL = 'DUPLICATA_MERCANTIL', // 14
  BOLETO_BANCARIO = 'BOLETO_BANCARIO', // 15
  DEPOSITO_BANCARIO = 'DEPOSITO_BANCARIO', // 16
  PIX_DINAMICO = 'PIX_DINAMICO', // 17
  TRANSFERENCIA = 'TRANSFERENCIA', // 18
  PROGRAMA_FIDELIDADE = 'PROGRAMA_FIDELIDADE', // 19
  PIX_ESTATICO = 'PIX_ESTATICO', // 20
  CREDITO_EM_LOJA = 'CREDITO_EM_LOJA', // 21
  PAGAMENTO_ELETRONICO_NAO_INFORMADO = 'PAGAMENTO_ELETRONICO_NAO_INFORMADO', // 22
  SEM_PAGAMENTO = 'SEM_PAGAMENTO', // 90
  OUTROS = 'OUTROS', // 99
}

export class CreatePaymentMethodDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsEnum(PaymentCodeSefazDto)
  sefazCode: PaymentCodeSefazDto; // Código SEFAZ obrigatório para NFe

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsBoolean()
  @IsOptional()
  allowInstallments?: boolean;

  @IsNumber()
  @Min(1)
  @Max(48)
  @IsOptional()
  maxInstallments?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  installmentFee?: number;

  @IsBoolean()
  @IsOptional()
  requiresCreditAnalysis?: boolean;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  minCreditScore?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  daysToReceive?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  transactionFee?: number;

  // Templates de parcelas personalizadas
  // Ex: Boleto 7/21 = [{installmentNumber: 1, daysToPayment: 7, percentageOfTotal: 50}, {installmentNumber: 2, daysToPayment: 21, percentageOfTotal: 50}]
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInstallmentTemplateDto)
  @IsOptional()
  installmentTemplates?: CreateInstallmentTemplateDto[];
}

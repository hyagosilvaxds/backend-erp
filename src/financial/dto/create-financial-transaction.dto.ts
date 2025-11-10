import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsBoolean, IsArray } from 'class-validator';

export enum TransactionType {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA',
}

export enum PaymentMethod {
  DINHEIRO = 'DINHEIRO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  BOLETO = 'BOLETO',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  PIX = 'PIX',
  CHEQUE = 'CHEQUE',
  OUTROS = 'OUTROS',
}

export class CreateFinancialTransactionDto {
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  centroCustoId?: string;

  @IsOptional()
  @IsString()
  contaContabilId?: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(PaymentMethod)
  transactionType: PaymentMethod;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  fees?: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsDateString()
  transactionDate: string;

  @IsDateString()
  competenceDate: string;

  @IsOptional()
  @IsString()
  accountPayableId?: string;

  @IsOptional()
  @IsString()
  accountReceivableId?: string;

  @IsOptional()
  @IsBoolean()
  reconciled?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

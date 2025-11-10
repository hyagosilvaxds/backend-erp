import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsBoolean, IsArray, IsInt } from 'class-validator';

export enum AccountStatus {
  PENDENTE = 'PENDENTE',
  RECEBIDO = 'RECEBIDO',
  VENCIDO = 'VENCIDO',
  PARCIAL = 'PARCIAL',
  CANCELADO = 'CANCELADO',
}

export enum RecurringPattern {
  MENSAL = 'MENSAL',
  TRIMESTRAL = 'TRIMESTRAL',
  SEMESTRAL = 'SEMESTRAL',
  ANUAL = 'ANUAL',
}

export class CreateAccountReceivableDto {
  @IsString()
  companyId: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  centroCustoId?: string;

  @IsOptional()
  @IsString()
  contaContabilId?: string;

  @IsString()
  customerName: string;

  @IsOptional()
  @IsString()
  customerDocument?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsNumber()
  originalAmount: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  interestAmount?: number;

  @IsOptional()
  @IsNumber()
  fineAmount?: number;

  @IsDateString()
  issueDate: string;

  @IsDateString()
  dueDate: string;

  @IsDateString()
  competenceDate: string;

  @IsOptional()
  @IsDateString()
  receiptDate?: string;

  @IsOptional()
  @IsInt()
  installmentNumber?: number;

  @IsOptional()
  @IsInt()
  totalInstallments?: number;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsEnum(AccountStatus)
  status: AccountStatus;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsEnum(RecurringPattern)
  recurringPattern?: RecurringPattern;
}

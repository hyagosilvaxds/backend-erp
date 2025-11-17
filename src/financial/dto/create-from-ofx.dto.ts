import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TransactionType, PaymentMethod } from './create-financial-transaction.dto';

/**
 * DTO para criar um lançamento financeiro a partir de uma transação OFX
 * 
 * O usuário pode escolher criar um lançamento ao invés de conciliar
 * com uma transação existente
 */
export class CreateFromOFXDto {
  @IsString()
  ofxFitId: string;

  @IsString()
  companyId: string;

  @IsString()
  bankAccountId: string;

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

  @IsOptional()
  @IsString()
  description?: string; // Se não fornecido, usa descrição do OFX

  @IsOptional()
  @IsString()
  notes?: string;
}
